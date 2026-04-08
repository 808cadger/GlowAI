# GlowAI — schemas.py
import uuid
from datetime import date, time, datetime
from typing import Literal
from pydantic import BaseModel, Field


# ── Scan ──────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    image_base64: str = Field(..., description="JPEG base64 string (no data: prefix)")
    user_id: str = Field(default="default", max_length=100)

class SuggestedAppointment(BaseModel):
    type: str
    urgency: Literal["routine", "soon", "urgent"] = "routine"
    reason: str = ""

class ScanResponse(BaseModel):
    id: uuid.UUID
    skin_type: str
    issues: list[str]
    recommendations: list[str]
    suggested_appointment: SuggestedAppointment
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Appointments ──────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    user_id: str = Field(default="default", max_length=100)
    mode: Literal["personal", "company"]
    title: str = Field(..., max_length=200)
    date: date
    time: time
    type: str | None = None
    status: Literal["confirmed", "pending", "completed", "cancelled"] = "pending"
    client: str | None = None
    notes: str | None = None

class AppointmentUpdate(BaseModel):
    title: str | None = None
    date: date | None = None
    time: time | None = None
    type: str | None = None
    status: Literal["confirmed", "pending", "completed", "cancelled"] | None = None
    client: str | None = None
    notes: str | None = None

class AppointmentResponse(AppointmentCreate):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
