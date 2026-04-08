-- GlowAI PostgreSQL schema  -- Aloha from Pearl City!
-- Run: psql -U glowai -d glowai -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS appointments (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     VARCHAR(100) NOT NULL DEFAULT 'default',
    mode        VARCHAR(20)  NOT NULL CHECK (mode IN ('personal', 'company')),
    title       VARCHAR(200) NOT NULL,
    date        DATE         NOT NULL,
    time        TIME         NOT NULL,
    type        VARCHAR(100),
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled')),
    client      VARCHAR(200),
    notes       TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scan_results (
    id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     VARCHAR(100) NOT NULL DEFAULT 'default',
    skin_type                   VARCHAR(100),
    issues                      JSONB        NOT NULL DEFAULT '[]',
    recommendations             JSONB        NOT NULL DEFAULT '[]',
    suggested_appointment_type  VARCHAR(100),
    suggested_appointment_urgency VARCHAR(20),
    suggested_appointment_reason  TEXT,
    raw_analysis                TEXT,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON scan_results(user_id);
