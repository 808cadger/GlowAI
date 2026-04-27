# GlowAI — main.py  // Aloha from Pearl City! 🌺
# #ASSUMPTION: Static Bearer token auth; upgrade to JWT when user accounts are added.
# #ASSUMPTION: Claude claude-opus-4-6 is used for vision per CLAUDE.md.

import base64
import json
import logging
import re
import uuid
from contextlib import asynccontextmanager

import anthropic
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings
from .database import Base, engine, get_db
from .models import Appointment, ScanResult
from .schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
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


# ── POST /api/chat ────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    history: list[ChatMessage] = []
    user_id: str = Field(default="default", max_length=100)

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
