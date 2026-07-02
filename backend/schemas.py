# GlowAI — schemas.py
import uuid
import datetime as _dt
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
    created_at: _dt.datetime

    model_config = {"from_attributes": True}


# ── Appointments ──────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    user_id: str = Field(default="default", max_length=100)
    mode: Literal["personal", "company"]
    title: str = Field(..., max_length=200)
    date: _dt.date
    time: _dt.time
    type: str | None = None
    status: Literal["confirmed", "pending", "completed", "cancelled"] = "pending"
    client: str | None = None
    notes: str | None = None

class AppointmentUpdate(BaseModel):
    title: str | None = None
    date: _dt.date | None = None
    time: _dt.time | None = None
    type: str | None = None
    status: Literal["confirmed", "pending", "completed", "cancelled"] | None = None
    client: str | None = None
    notes: str | None = None

class AppointmentResponse(AppointmentCreate):
    id: uuid.UUID
    created_at: _dt.datetime
    updated_at: _dt.datetime

    model_config = {"from_attributes": True}


# ── Reminders ─────────────────────────────────────────────────────────────

class ReminderCreate(BaseModel):
    user_id: str = Field(default="default", max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=500)
    remind_at: _dt.datetime
    channel: Literal["push", "websocket", "local"] = "push"
    cadence: Literal["once", "daily", "weekly"] = "once"

class ReminderUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    message: str | None = Field(default=None, min_length=1, max_length=500)
    remind_at: _dt.datetime | None = None
    channel: Literal["push", "websocket", "local"] | None = None
    cadence: Literal["once", "daily", "weekly"] | None = None
    is_active: bool | None = None

class ReminderResponse(ReminderCreate):
    id: uuid.UUID
    is_active: bool
    created_at: _dt.datetime
    updated_at: _dt.datetime

    model_config = {"from_attributes": True}


# ── Salon workspace ───────────────────────────────────────────────────────

class SalonWorkspaceUpsert(BaseModel):
    user_id: str = Field(default="default", max_length=100)
    studio: str = Field(default="GlowAI Studio", max_length=200)
    headline: str | None = Field(default=None, max_length=300)
    accent: str = Field(default="blush", max_length=40)
    plan: Literal["starter", "growth", "enterprise"] = "starter"

class SalonWorkspaceResponse(SalonWorkspaceUpsert):
    id: uuid.UUID
    monthly_price: str | None
    features: list[str]
    created_at: _dt.datetime
    updated_at: _dt.datetime

    model_config = {"from_attributes": True}


# ── Push ──────────────────────────────────────────────────────────────────

class PushTokenCreate(BaseModel):
    user_id: str = Field(default="default", max_length=100)
    token: str = Field(..., min_length=10, max_length=500)
    platform: str = Field(default="android", max_length=40)


# ── Freemium ──────────────────────────────────────────────────────────────

class ScanStatusResponse(BaseModel):
    user_id: str
    scans_used: int
    scans_limit: int
    scans_remaining: int
    is_unlocked: bool
    period: str
