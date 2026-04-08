# GlowAI — main.py  // Aloha from Pearl City! 🌺
# #ASSUMPTION: Static Bearer token auth; upgrade to JWT when user accounts are added.
# #ASSUMPTION: Claude claude-opus-4-6 is used for vision per CLAUDE.md.

import base64
import json
import re
import uuid
from contextlib import asynccontextmanager

import anthropic
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings
from .database import Base, engine, get_db
from .models import Appointment, ScanResult
from .schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
    ScanRequest, ScanResponse, SuggestedAppointment,
)


# ── Lifespan: create tables on startup ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


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


# ── Claude Vision ────────────────────────────────────────────────────────────
SKIN_PROMPT = """Analyze this skin photo carefully.
Return ONLY a valid JSON object — no markdown, no explanation — with exactly this structure:
{
  "skin_type": "dry|oily|combination|normal|sensitive",
  "issues": ["list of observed issues, e.g. acne, dark_spots, redness, dryness, oiliness, aging, uneven_tone"],
  "recommendations": ["3-5 actionable skincare tips"],
  "suggested_appointment": {
    "type": "Dermatologist|Spa|Facial|Other",
    "urgency": "routine|soon|urgent",
    "reason": "one sentence reason"
  }
}
If you cannot clearly see skin in the image, still return the JSON with skin_type "unknown" and empty arrays."""


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=8))
async def call_claude_vision(b64_image: str) -> dict:
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    msg = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/jpeg", "data": b64_image},
                },
                {"type": "text", "text": SKIN_PROMPT},
            ],
        }],
    )
    raw = msg.content[0].text.strip()

    # Strip accidental markdown fences
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
    # Validate base64
    try:
        base64.b64decode(body.image_base64, validate=True)
    except Exception:
        raise HTTPException(400, "Invalid base64 image data")

    try:
        parsed, raw = await call_claude_vision(body.image_base64)
    except json.JSONDecodeError:
        raise HTTPException(502, "AI response was not valid JSON")
    except Exception as e:
        raise HTTPException(502, f"Vision API error: {str(e)}")

    suggested = parsed.get("suggested_appointment", {})
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
    message: str = Field(..., max_length=500)
    history: list[ChatMessage] = []
    user_id: str = Field(default="default", max_length=100)

CHAT_SYSTEM = """You are GlowAI Assistant — a friendly, knowledgeable AI skincare advisor.
Keep replies concise (2–4 sentences max). Ask one follow-up question to keep the conversation going.
Focus on: skin types, routines, ingredients, concerns (acne, aging, dryness, oiliness), and appointments.
Use occasional emojis. When relevant, suggest the user scan their face with the camera for a personalized analysis.
Never diagnose medical conditions — recommend seeing a dermatologist for serious concerns.
Tone: warm, encouraging, Hawaii-inspired (occasional Aloha/Mahalo)."""

@app.post("/api/chat")
async def chat(
    body: ChatRequest,
    _: str = Depends(require_token),
):
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    messages = [{"role": m.role if m.role == "user" else "assistant", "content": m.content}
                for m in body.history[-8:]]
    messages.append({"role": "user", "content": body.message})

    resp = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        system=CHAT_SYSTEM,
        messages=messages,
    )
    return {"reply": resp.content[0].text.strip()}


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "glowai-api"}
