# GlowAI — main.py  // Aloha from Pearl City! 🌺
# #ASSUMPTION: Static Bearer token auth; upgrade to JWT when user accounts are added.
# #ASSUMPTION: Claude claude-opus-4-6 is used for vision per CLAUDE.md.

import asyncio
import base64
import json
import logging
import re
import urllib.error
import urllib.parse
import urllib.request
import uuid
from contextlib import asynccontextmanager
from typing import Literal

import anthropic
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings
from .database import Base, engine, get_db
from .models import Appointment, Reminder, ScanResult
from .schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
    PushTokenCreate,
    ReminderCreate, ReminderResponse, ReminderUpdate,
    ScanRequest, ScanResponse, SuggestedAppointment,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger("glowai.api")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("GlowAI API started — tables ready")
    yield
    await engine.dispose()
    log.info("GlowAI API shutdown — engine disposed")


app = FastAPI(title="GlowAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer(auto_error=False)


def require_token(creds: HTTPAuthorizationCredentials | None = Security(bearer_scheme)):
    # #ASSUMPTION: Single shared token for MVP; replace with JWT + user table later.
    if not creds or creds.credentials != settings.API_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return creds.credentials


# ── Claude Vision ─────────────────────────────────────────────────────────────
SKIN_PROMPT = """Analyze this skin photo carefully.
Return ONLY a valid JSON object — no markdown, no explanation — with exactly this structure:
{
  "skin_type": "dry|oily|combination|normal|sensitive|unknown",
  "issues": ["list of observed issues, e.g. acne, dark_spots, redness, dryness, oiliness, aging, uneven_tone"],
  "recommendations": ["3-5 actionable skincare tips"],
  "suggested_appointment": {
    "type": "Dermatologist|Spa|Facial|Other",
    "urgency": "routine|soon|urgent",
    "reason": "one sentence reason"
  }
}
IMPORTANT: These observations are for informational screening only — not a medical diagnosis.
If you cannot clearly see skin, return skin_type "unknown" and empty arrays."""


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=8))
async def call_claude_vision(b64_image: str) -> tuple[dict, str]:
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    msg = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64_image}},
                {"type": "text", "text": SKIN_PROMPT},
            ],
        }],
    )
    raw = msg.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw), raw


# ── POST /api/scan ────────────────────────────────────────────────────────────
@app.post("/api/scan", response_model=ScanResponse, status_code=201)
async def scan_skin(
    body: ScanRequest,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    try:
        base64.b64decode(body.image_base64, validate=True)
    except Exception:
        raise HTTPException(400, "Invalid base64 image data")

    log.info("scan requested user_id=%s", body.user_id)

    try:
        parsed, raw = await call_claude_vision(body.image_base64)
    except json.JSONDecodeError:
        log.error("Claude returned non-JSON for scan user_id=%s", body.user_id)
        raise HTTPException(502, "AI response was not valid JSON")
    except Exception as e:
        log.error("Vision API error user_id=%s err=%s", body.user_id, e)
        raise HTTPException(502, f"Vision API error: {str(e)}")

    suggested = parsed.get("suggested_appointment", {})
    if suggested.get("urgency") == "urgent":
        log.warning("urgent scan result user_id=%s issues=%s", body.user_id, parsed.get("issues"))

    record = ScanResult(
        user_id=body.user_id,
        skin_type=parsed.get("skin_type", "unknown"),
        issues=parsed.get("issues", []),
        recommendations=parsed.get("recommendations", []),
        suggested_appointment_type=suggested.get("type"),
        suggested_appointment_urgency=suggested.get("urgency", "routine"),
        suggested_appointment_reason=suggested.get("reason", ""),
        raw_analysis=raw,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    log.info("scan saved id=%s skin_type=%s", record.id, record.skin_type)

    return ScanResponse(
        id=record.id,
        skin_type=record.skin_type or "unknown",
        issues=record.issues,
        recommendations=record.recommendations,
        suggested_appointment=SuggestedAppointment(
            type=record.suggested_appointment_type or "Dermatologist",
            urgency=record.suggested_appointment_urgency or "routine",
            reason=record.suggested_appointment_reason or "",
        ),
        created_at=record.created_at,
    )


# ── GET /api/appointments ─────────────────────────────────────────────────────
@app.get("/api/appointments", response_model=list[AppointmentResponse])
async def list_appointments(
    user_id: str = "default",
    mode: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    q = select(Appointment).where(Appointment.user_id == user_id)
    if mode:
        q = q.where(Appointment.mode == mode)
    q = q.order_by(Appointment.date, Appointment.time)
    result = await db.execute(q)
    return result.scalars().all()


# ── POST /api/appointments ────────────────────────────────────────────────────
@app.post("/api/appointments", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    appt = Appointment(**body.model_dump())
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    log.info("appointment created id=%s user_id=%s", appt.id, appt.user_id)
    return appt


# ── PUT /api/appointments/{id} ────────────────────────────────────────────────
@app.put("/api/appointments/{appt_id}", response_model=AppointmentResponse)
async def update_appointment(
    appt_id: uuid.UUID,
    body: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    appt = await db.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(404, "Appointment not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(appt, field, val)
    await db.commit()
    await db.refresh(appt)
    return appt


# ── DELETE /api/appointments/{id} ─────────────────────────────────────────────
@app.delete("/api/appointments/{appt_id}", status_code=204)
async def delete_appointment(
    appt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    result = await db.execute(delete(Appointment).where(Appointment.id == appt_id))
    if result.rowcount == 0:
        raise HTTPException(404, "Appointment not found")
    await db.commit()


# ── Reminders ────────────────────────────────────────────────────────────────
async def send_push(reminder: ReminderResponse):
    # #ASSUMPTION: Push provider is not connected yet; wire this to WebSocket or
    # @capacitor/push-notifications registration tokens when device auth lands.
    delay = max(0, (reminder.remind_at - reminder.created_at).total_seconds())
    if delay > 60:
        log.info(
            "reminder scheduled id=%s user_id=%s remind_at=%s; delivery requires scheduler worker",
            reminder.id,
            reminder.user_id,
            reminder.remind_at,
        )
        return
    if delay:
        await asyncio.sleep(delay)
    log.info(
        "reminder due id=%s user_id=%s channel=%s title=%s",
        reminder.id,
        reminder.user_id,
        reminder.channel,
        reminder.title,
    )


@app.get("/api/reminders", response_model=list[ReminderResponse])
async def list_reminders(
    user_id: str = "default",
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    q = select(Reminder).where(Reminder.user_id == user_id)
    if active_only:
        q = q.where(Reminder.is_active.is_(True))
    q = q.order_by(Reminder.remind_at)
    result = await db.execute(q)
    return result.scalars().all()


@app.post("/api/reminders", response_model=ReminderResponse, status_code=201)
async def set_reminder(
    body: ReminderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    reminder = Reminder(**body.model_dump())
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    response = ReminderResponse.model_validate(reminder)
    background_tasks.add_task(send_push, response)
    log.info("reminder created id=%s user_id=%s remind_at=%s", reminder.id, reminder.user_id, reminder.remind_at)
    return response


@app.put("/api/reminders/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: uuid.UUID,
    body: ReminderUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    reminder = await db.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(404, "Reminder not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(reminder, field, val)
    await db.commit()
    await db.refresh(reminder)
    return reminder


@app.delete("/api/reminders/{reminder_id}", status_code=204)
async def delete_reminder(
    reminder_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    result = await db.execute(delete(Reminder).where(Reminder.id == reminder_id))
    if result.rowcount == 0:
        raise HTTPException(404, "Reminder not found")
    await db.commit()


@app.post("/api/push-token", status_code=202)
async def register_push_token(
    body: PushTokenCreate,
    _: str = Depends(require_token),
):
    # #ASSUMPTION: Push tokens are logged until user/device tables land.
    # Store hashed tokens once real user auth and Firebase/APNs routing are added.
    log.info("push token registered user_id=%s platform=%s token_len=%s", body.user_id, body.platform, len(body.token))
    return {"status": "accepted"}


# ── Subscriptions and chat ────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    history: list[ChatMessage] = []
    user_id: str = Field(default="default", max_length=100)


class SubscribeRequest(BaseModel):
    plan: Literal["freemium_unlock", "salon_monthly"]
    user_id: str = Field(default="default", max_length=100)


class SubscribeResponse(BaseModel):
    session_id: str
    publishable_key: str
    plan: str


class RecommendRequest(BaseModel):
    concerns: list[str] = Field(..., min_length=1, max_length=15)
    skin_type: str = Field(default="unknown", max_length=100)
    climate: str = Field(default="humid coastal", max_length=100)


SUPPORTED_CONCERNS = {
    "acne",
    "redness",
    "dryness",
    "oiliness",
    "dark_spots",
    "uneven_tone",
    "texture",
    "pores",
    "sensitivity",
    "dullness",
    "fine_lines",
    "sun_damage",
    "dehydration",
    "barrier",
    "ingrown_hairs",
}


def routine_from_concerns(concerns: list[str], climate: str) -> dict:
    normalized = [c.lower().replace(" ", "_") for c in concerns[:15]]
    focus = [c for c in normalized if c in SUPPORTED_CONCERNS] or ["dehydration"]
    humid = "humid" in climate.lower() or "hawaii" in climate.lower()
    morning = ["gentle cleanser"]
    night = ["cleanse"]
    shopify = [{"handle": "gentle-cleanser", "title": "Low-pH gentle cleanser"}]

    if "dehydration" in focus or "dryness" in focus or "barrier" in focus:
        morning.append("glycerin or hyaluronic serum")
        night.append("ceramide barrier cream")
        shopify.append({"handle": "barrier-cream", "title": "Ceramide barrier cream"})
    if "oiliness" in focus or "pores" in focus:
        morning.append("light gel moisturizer")
        shopify.append({"handle": "gel-moisturizer", "title": "Humidity-safe gel moisturizer"})
    if "dark_spots" in focus or "uneven_tone" in focus or "dullness" in focus:
        morning.append("vitamin C or niacinamide")
        shopify.append({"handle": "brightening-serum", "title": "Brightening serum"})
    if "texture" in focus or "ingrown_hairs" in focus:
        night.append("PHA exfoliant 1-2 nights weekly")
        shopify.append({"handle": "pha-exfoliant", "title": "Gentle PHA exfoliant"})
    if "redness" in focus or "sensitivity" in focus:
        night.append("calming niacinamide")
        shopify.append({"handle": "calming-serum", "title": "Calming serum"})

    morning.append("water-resistant SPF 30+")
    if humid:
        morning.append("midday blot or SPF reapply")
    shopify.append({"handle": "water-resistant-spf", "title": "Water-resistant SPF 30+"})

    return {
        "focus": focus,
        "morning": ", ".join(morning),
        "night": ", ".join(night),
        "shopify": shopify[:6],
        "safety_note": "Cosmetic wellness guidance only; refer persistent, painful, changing, or suspicious concerns to a dermatologist.",
    }


def stripe_price_for_plan(plan: str) -> tuple[str | None, str]:
    if plan == "salon_monthly":
        return settings.STRIPE_PRICE_SALON_MONTHLY, "subscription"
    return settings.STRIPE_PRICE_FREEMIUM_UNLOCK, "payment"


def create_stripe_checkout_session(body: SubscribeRequest) -> dict:
    price_id, mode = stripe_price_for_plan(body.plan)
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PUBLISHABLE_KEY or not price_id:
        raise HTTPException(503, "Stripe checkout is not configured")

    payload = urllib.parse.urlencode({
        "mode": mode,
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        "success_url": settings.STRIPE_SUCCESS_URL,
        "cancel_url": settings.STRIPE_CANCEL_URL,
        "client_reference_id": body.user_id,
        "metadata[user_id]": body.user_id,
        "metadata[plan]": body.plan,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.stripe.com/v1/checkout/sessions",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8")
        log.error("stripe checkout failed status=%s body=%s", e.code, detail)
        raise HTTPException(502, "Stripe checkout request failed")
    except Exception as e:
        log.error("stripe checkout unavailable: %s", e)
        raise HTTPException(502, "Stripe checkout unavailable")


@app.post("/api/subscribe", response_model=SubscribeResponse)
@app.post("/subscribe", response_model=SubscribeResponse)
async def subscribe(
    body: SubscribeRequest,
    _: str = Depends(require_token),
):
    checkout = await asyncio.to_thread(create_stripe_checkout_session, body)
    log.info("stripe checkout created plan=%s user_id=%s session=%s", body.plan, body.user_id, checkout.get("id"))
    return SubscribeResponse(
        session_id=checkout["id"],
        publishable_key=settings.STRIPE_PUBLISHABLE_KEY or "",
        plan=body.plan,
    )


@app.get("/mcp")
async def mcp_manifest():
    return {
        "name": "glowai-agent",
        "tools": [
            {"name": "book", "endpoint": "/mcp/book", "description": "Create an esthetician or salon appointment handoff."},
            {"name": "recommend", "endpoint": "/mcp/recommend", "description": "Map up to 15 skin concerns to routine and Shopify products."},
        ],
    }


@app.post("/mcp/book", response_model=AppointmentResponse, status_code=201)
async def mcp_book(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    appt = Appointment(**body.model_dump())
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    log.info("mcp booking created id=%s user_id=%s", appt.id, appt.user_id)
    return appt


@app.post("/mcp/recommend")
async def mcp_recommend(
    body: RecommendRequest,
    _: str = Depends(require_token),
):
    return routine_from_concerns(body.concerns, body.climate)

CHAT_SYSTEM = """You are GlowAI, a proactive, friendly, and reliable AI agent that helps the user build healthy habits and stay on track with daily routines. You speak in warm, concise, human-like English, and you always prioritize action and clarity over being verbose.

Core identity:
- You are a personal assistant, not just a chatbot.
- Your main tasks are reminders, check-ins, habit coaching, simple planning, skin routines, and scan-based follow-through.
- Assume the user is mobile-first and may be mid-task, tired, or distracted, so responses should be short, clear, and minimally intrusive.

Behavior rules:
- Always keep responses under 2-3 sentences unless the user asks for more detail.
- Use natural, friendly language. No markdown, no code blocks, and no lists unless explicitly asked.
- If unsure about intent, ask 1 short clarifying question instead of elaborating.
- Never pretend to know private facts you have not been told.
- Never pressure or shame the user; be supportive and non-judgmental.

Reminder and task protocol:
- If the user mentions a goal, habit, or chore, propose a time and an optional follow-up check-in.
- If the user asks whether they did a habit today, lightly confirm if clear; if not done, ask whether they want to do it now or be reminded later.
- For recurring reminders, ask how often and what time window they prefer.
- If the user says "don't ask me again", "turn this off", or "cancel that", confirm briefly and stop that reminder.
- If tools exist, confirm intent before triggering reminders. If no real tool exists, keep behavior virtual and remember the preference in chat memory.

Skincare safety:
- Never diagnose skin conditions, diseases, or medical disorders.
- Never recommend prescription medications, dosages, or treatments.
- Never contradict or override advice from a licensed dermatologist or doctor.
- Never interpret moles, lesions, or growths as benign or malignant — always refer to a doctor.
- If a user describes symptoms that sound urgent, say: "That sounds like something a dermatologist should see in person. Please book an appointment or visit urgent care."

WHAT YOU CAN DO:
- Discuss general skincare routines, ingredients, skin types, and over-the-counter products.
- Suggest when a dermatologist visit might be helpful (framed as a recommendation, not a diagnosis).
- Help users understand their GlowAI scan results as informational observations, not medical findings.
- Answer questions about appointments in the app.

Goal:
Keep the loop short: ask, confirm, set reminder, follow up, close. In every interaction, identify the next concrete action and phrase your reply so it helps the user act now or commit to a specific time/trigger later."""

@app.post("/api/chat")
async def chat(
    body: ChatRequest,
    _: str = Depends(require_token),
):
    log.info("chat message user_id=%s len=%d", body.user_id, len(body.message))
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    messages = [
        {"role": m.role if m.role in ("user", "assistant") else "user", "content": m.content}
        for m in body.history[-8:]
    ]
    messages.append({"role": "user", "content": body.message})

    resp = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        system=CHAT_SYSTEM,
        messages=messages,
    )
    reply = resp.content[0].text.strip()
    log.info("chat reply user_id=%s len=%d", body.user_id, len(reply))
    return {"reply": reply}


# ── Health checks ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "glowai-api"}

@app.get("/capabilities")
async def capabilities():
    return {
        "app": "GlowAI",
        "positioning": "Scan-led beauty consultation for skin prep, salon planning, bookings, and concierge coaching.",
        "agents": [
            {"name": "Scan Coach", "skill": "skin read intake", "output": "skin type, focus areas, routine direction"},
            {"name": "Beauty Stylist", "skill": "service sequencing", "output": "brows, makeup, hair, nails, or skin lane"},
            {"name": "Safety Guide", "skill": "non-diagnostic guardrails", "output": "dermatology referral language for urgent concerns"},
            {"name": "Scheduler", "skill": "booking handoff", "output": "appointment context and notes"},
        ],
        "trust_controls": [
            "informational-only skin guidance",
            "urgent concern escalation",
            "scan confidence display",
            "stored booking context",
        ],
    }

@app.get("/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "reachable"}
    except Exception as e:
        log.error("DB health check failed: %s", e)
        raise HTTPException(503, f"Database unreachable: {e}")
