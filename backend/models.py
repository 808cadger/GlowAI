# GlowAI — models.py
import uuid
from datetime import date, time, datetime, timezone
from sqlalchemy import String, Text, Date, Time, TIMESTAMP, JSON, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id:         Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[str]         = mapped_column(String(100), nullable=False, default="default", index=True)
    mode:       Mapped[str]         = mapped_column(String(20),  nullable=False)
    title:      Mapped[str]         = mapped_column(String(200), nullable=False)
    date:       Mapped[date]        = mapped_column(Date,        nullable=False)
    time:       Mapped[time]        = mapped_column(Time,        nullable=False)
    type:       Mapped[str | None]  = mapped_column(String(100))
    status:     Mapped[str]         = mapped_column(String(20),  nullable=False, default="pending")
    client:     Mapped[str | None]  = mapped_column(String(200))
    notes:      Mapped[str | None]  = mapped_column(Text)
    created_at: Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ScanResult(Base):
    __tablename__ = "scan_results"

    id:                             Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:                        Mapped[str]         = mapped_column(String(100), nullable=False, default="default", index=True)
    skin_type:                      Mapped[str | None]  = mapped_column(String(100))
    issues:                         Mapped[list]        = mapped_column(JSON, nullable=False, default=list)
    recommendations:                Mapped[list]        = mapped_column(JSON, nullable=False, default=list)
    suggested_appointment_type:     Mapped[str | None]  = mapped_column(String(100))
    suggested_appointment_urgency:  Mapped[str | None]  = mapped_column(String(20))
    suggested_appointment_reason:   Mapped[str | None]  = mapped_column(Text)
    raw_analysis:                   Mapped[str | None]  = mapped_column(Text)
    created_at:                     Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class Reminder(Base):
    __tablename__ = "reminders"

    id:          Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:     Mapped[str]         = mapped_column(String(100), nullable=False, default="default", index=True)
    title:       Mapped[str]         = mapped_column(String(200), nullable=False)
    message:     Mapped[str]         = mapped_column(Text, nullable=False)
    remind_at:   Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), nullable=False, index=True)
    channel:     Mapped[str]         = mapped_column(String(40), nullable=False, default="push")
    cadence:     Mapped[str]         = mapped_column(String(40), nullable=False, default="once")
    is_active:   Mapped[bool]        = mapped_column(Boolean, nullable=False, default=True)
    created_at:  Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at:  Mapped[datetime]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
