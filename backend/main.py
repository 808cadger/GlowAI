# GlowAI — main.py  // Aloha from Pearl City! 🌺
# #ASSUMPTION: Static Bearer token auth; upgrade to JWT when user accounts are added.
# #ASSUMPTION: Claude claude-opus-4-8 is used for vision.

import asyncio
import base64
import collections
import contextlib
import hashlib
import hmac
import json
import logging
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Literal

import anthropic
import groq as _groq
import openai as _openai
from fastapi import Depends, FastAPI, HTTPException, Request, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import extract, func as sqlfunc, select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .models import Appointment, FreemiumUnlock, Reminder, SalonWorkspace, ScanResult
from .routines import routine_from_concerns
from .schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
    PushTokenCreate,
    ReminderCreate, ReminderResponse, ReminderUpdate,
    SalonWorkspaceResponse, SalonWorkspaceUpsert,
    ScanRequest, ScanResponse, ScanStatusResponse, SuggestedAppointment,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger("glowai.api")


# ── Rate limiting ─────────────────────────────────────────────────────────────
_rate_buckets: dict[str, collections.deque] = collections.defaultdict(lambda: collections.deque())

def _check_rate(key: str, limit: int, window: int = 60) -> None:
    now = time.time()
    bucket = _rate_buckets[key]
    while bucket and bucket[0] < now - window:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(429, "Rate limit exceeded. Please wait before trying again.")
    bucket.append(now)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    origins = settings.cors_origins_list()
    if any(o.strip() == "*" for o in origins):
        raise RuntimeError("CORS_ORIGINS must not contain '*' when allow_credentials=True")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("GlowAI API started — tables ready")
    scheduler_task = asyncio.create_task(reminder_scheduler_loop())
    yield
    scheduler_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await scheduler_task
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
    if settings.ANTHROPIC_API_KEY:
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        msg = await client.messages.create(
            model="claude-opus-4-8",
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
    else:
        # Ollama vision fallback (moondream or llava)
        ollama_client = _openai.AsyncOpenAI(
            base_url=f"{settings.OLLAMA_BASE_URL}/v1",
            api_key="ollama",
        )
        msg = await ollama_client.chat.completions.create(
            model=settings.OLLAMA_VISION_MODEL,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}},
                    {"type": "text", "text": SKIN_PROMPT},
                ],
            }],
        )
        raw = msg.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw), raw


# ── Freemium helpers ──────────────────────────────────────────────────────────

async def get_monthly_scan_count(user_id: str, db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(sqlfunc.count()).select_from(ScanResult).where(
            ScanResult.user_id == user_id,
            extract("year", ScanResult.created_at) == now.year,
            extract("month", ScanResult.created_at) == now.month,
        )
    )
    return result.scalar_one()


async def is_freemium_unlocked(user_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(FreemiumUnlock).where(FreemiumUnlock.user_id == user_id)
    )
    return result.scalar_one_or_none() is not None


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

    month_count = await get_monthly_scan_count(body.user_id, db)
    unlocked = await is_freemium_unlocked(body.user_id, db)
    if not unlocked and month_count >= settings.FREE_SCAN_LIMIT:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "scan_limit_reached",
                "message": f"You've used all {settings.FREE_SCAN_LIMIT} free scans this month. Unlock unlimited scans for $4.99.",
                "scans_used": month_count,
                "scans_limit": settings.FREE_SCAN_LIMIT,
                "upgrade_plan": "freemium_unlock",
            },
        )

    log.info("scan requested user_id=%s month_count=%d unlocked=%s", body.user_id, month_count, unlocked)

    _check_rate(f"scan:{body.user_id}", 10)

    try:
        parsed, raw = await call_claude_vision(body.image_base64)
    except json.JSONDecodeError:
        log.error("Claude returned non-JSON for scan user_id=%s", body.user_id)
        raise HTTPException(502, "AI analysis failed. Please try again.")
    except Exception as e:
        log.error("Vision API error user_id=%s err=%s", body.user_id, e)
        raise HTTPException(502, "AI analysis failed. Please try again.")

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


# ── Salon workspace (B2B white-label) ─────────────────────────────────────────
SALON_PLAN_DETAILS = {
    "starter": {
        "monthly_price": "299",
        "features": ["Branded scan app", "Agent booking leads", "Basic Shopify cart"],
    },
    "growth": {
        "monthly_price": "799",
        "features": ["White-label app", "Calendar + Shopify agents", "Reel generator", "Lead analytics"],
    },
    "enterprise": {
        "monthly_price": None,
        "features": ["Custom domain", "Multi-location routing", "POS/CRM integration", "Dedicated model tuning"],
    },
}


@app.get("/api/salon-workspace", response_model=SalonWorkspaceResponse)
async def get_salon_workspace(
    user_id: str = "default",
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    result = await db.execute(select(SalonWorkspace).where(SalonWorkspace.user_id == user_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(404, "Salon workspace not found")
    return workspace


@app.put("/api/salon-workspace", response_model=SalonWorkspaceResponse)
async def upsert_salon_workspace(
    body: SalonWorkspaceUpsert,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    plan_details = SALON_PLAN_DETAILS[body.plan]
    result = await db.execute(select(SalonWorkspace).where(SalonWorkspace.user_id == body.user_id))
    workspace = result.scalar_one_or_none()
    if workspace:
        for field, val in body.model_dump(exclude={"user_id"}).items():
            setattr(workspace, field, val)
        workspace.monthly_price = plan_details["monthly_price"]
        workspace.features = plan_details["features"]
    else:
        workspace = SalonWorkspace(
            **body.model_dump(),
            monthly_price=plan_details["monthly_price"],
            features=plan_details["features"],
        )
        db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    log.info("salon workspace saved user_id=%s plan=%s", workspace.user_id, workspace.plan)
    return workspace


# ── Reminders ────────────────────────────────────────────────────────────────
CADENCE_INTERVALS = {"daily": timedelta(days=1), "weekly": timedelta(weeks=1)}


def deliver_reminder(reminder: Reminder) -> None:
    # #ASSUMPTION: Push provider is not connected yet; wire this to WebSocket or
    # @capacitor/push-notifications registration tokens when device auth lands.
    log.info(
        "reminder due id=%s user_id=%s channel=%s title=%s",
        reminder.id,
        reminder.user_id,
        reminder.channel,
        reminder.title,
    )


async def deliver_due_reminders() -> int:
    """Poll for due reminders, deliver them, and advance/deactivate by cadence."""
    now = datetime.now(timezone.utc)
    delivered = 0
    async with SessionLocal() as db:
        result = await db.execute(
            select(Reminder).where(Reminder.is_active.is_(True), Reminder.remind_at <= now)
        )
        for reminder in result.scalars().all():
            deliver_reminder(reminder)
            delivered += 1
            interval = CADENCE_INTERVALS.get(reminder.cadence)
            if interval:
                remind_at = reminder.remind_at
                if remind_at.tzinfo is None:
                    remind_at = remind_at.replace(tzinfo=timezone.utc)
                while remind_at <= now:
                    remind_at += interval
                reminder.remind_at = remind_at
            else:
                reminder.is_active = False
        if delivered:
            await db.commit()
    return delivered


async def reminder_scheduler_loop() -> None:
    while True:
        try:
            delivered = await deliver_due_reminders()
            if delivered:
                log.info("reminder scheduler delivered %d due reminder(s)", delivered)
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("reminder scheduler tick failed")
        await asyncio.sleep(settings.REMINDER_POLL_INTERVAL_SECONDS)


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
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    reminder = Reminder(**body.model_dump())
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    log.info("reminder created id=%s user_id=%s remind_at=%s", reminder.id, reminder.user_id, reminder.remind_at)
    return reminder


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
async def mcp_manifest(_: str = Depends(require_token)):
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
    _check_rate(f"chat:{body.user_id}", 30)
    log.info("chat message user_id=%s len=%d", body.user_id, len(body.message))

    messages = [
        {"role": m.role if m.role in ("user", "assistant") else "user", "content": m.content}
        for m in body.history[-8:]
    ]
    messages.append({"role": "user", "content": body.message})

    if settings.ANTHROPIC_API_KEY:
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        resp = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=256,
            system=CHAT_SYSTEM,
            messages=messages,
        )
        reply = resp.content[0].text.strip()
    elif settings.GROQ_API_KEY:
        groq_client = _groq.AsyncGroq(api_key=settings.GROQ_API_KEY)
        resp = await groq_client.chat.completions.create(
            model=settings.GROQ_CHAT_MODEL,
            max_tokens=256,
            messages=[{"role": "system", "content": CHAT_SYSTEM}] + messages,
        )
        reply = resp.choices[0].message.content.strip()
    else:
        ollama_client = _openai.AsyncOpenAI(
            base_url=f"{settings.OLLAMA_BASE_URL}/v1",
            api_key="ollama",
        )
        resp = await ollama_client.chat.completions.create(
            model="llama3.2:3b",
            max_tokens=256,
            messages=[{"role": "system", "content": CHAT_SYSTEM}] + messages,
        )
        reply = resp.choices[0].message.content.strip()

    log.info("chat reply user_id=%s len=%d", body.user_id, len(reply))
    return {"reply": reply}


# ── Freemium endpoints ────────────────────────────────────────────────────────

@app.get("/api/scan/status", response_model=ScanStatusResponse)
async def scan_status(
    user_id: str = "default",
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_token),
):
    now = datetime.now(timezone.utc)
    scans_used = await get_monthly_scan_count(user_id, db)
    unlocked = await is_freemium_unlocked(user_id, db)
    remaining = 0 if unlocked else max(0, settings.FREE_SCAN_LIMIT - scans_used)
    return ScanStatusResponse(
        user_id=user_id,
        scans_used=scans_used,
        scans_limit=settings.FREE_SCAN_LIMIT,
        scans_remaining=remaining,
        is_unlocked=unlocked,
        period=f"{now.year}-{now.month:02d}",
    )


# ── Stripe webhook ────────────────────────────────────────────────────────────

def _verify_stripe_signature(payload: bytes, sig_header: str, secret: str) -> None:
    parts = {k: v for k, v in (p.split("=", 1) for p in sig_header.split(",") if "=" in p)}
    timestamp = parts.get("t")
    signature = parts.get("v1")
    if not timestamp or not signature:
        raise ValueError("Missing t or v1 in Stripe-Signature header")
    if abs(time.time() - int(timestamp)) > 300:
        raise ValueError("Webhook timestamp too old (> 5 min)")
    signed = f"{timestamp}.{payload.decode('utf-8')}"
    expected = hmac.new(secret.encode(), signed.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise ValueError("Signature mismatch")


@app.post("/api/webhook/stripe", status_code=200)
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.STRIPE_WEBHOOK_SECRET:
        log.error("stripe webhook called but STRIPE_WEBHOOK_SECRET is not set")
        raise HTTPException(503, "Webhook secret not configured")

    raw_body = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        _verify_stripe_signature(raw_body, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError as exc:
        log.warning("stripe webhook signature rejected: %s", exc)
        raise HTTPException(400, "Invalid webhook signature")

    event = json.loads(raw_body)
    event_type = event.get("type")
    log.info("stripe webhook received type=%s id=%s", event_type, event.get("id"))

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id") or (session.get("metadata") or {}).get("user_id")
        plan = (session.get("metadata") or {}).get("plan", "freemium_unlock")
        session_id = session.get("id")

        if not user_id:
            log.warning("stripe webhook: checkout.session.completed missing user_id session=%s", session_id)
            return {"received": True}

        if plan == "freemium_unlock":
            existing = await db.execute(
                select(FreemiumUnlock).where(FreemiumUnlock.user_id == user_id)
            )
            if not existing.scalar_one_or_none():
                db.add(FreemiumUnlock(user_id=user_id, stripe_session_id=session_id))
                await db.commit()
                log.info("stripe webhook: freemium unlocked user_id=%s session=%s", user_id, session_id)
            else:
                log.info("stripe webhook: user already unlocked user_id=%s", user_id)
        else:
            log.info("stripe webhook: unhandled plan=%s user_id=%s", plan, user_id)

    return {"received": True}


# ── Health checks ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "glowai-api"}

@app.get("/capabilities")
async def capabilities(_: str = Depends(require_token)):
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
async def health_db(db: AsyncSession = Depends(get_db), _: str = Depends(require_token)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "reachable"}
    except Exception as e:
        log.error("DB health check failed: %s", e)
        raise HTTPException(503, {"status": "error", "db": "unreachable"})
