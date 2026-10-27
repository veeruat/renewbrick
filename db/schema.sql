-- RenewBrick lead storage (PostgreSQL 14+).
-- Idempotent: safe to run repeatedly via `npm run db:migrate`.

CREATE TABLE IF NOT EXISTS enquiries (
  id                       BIGSERIAL PRIMARY KEY,
  reference                TEXT        NOT NULL UNIQUE,
  idempotency_key          UUID        NOT NULL UNIQUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  name                     TEXT        NOT NULL,
  phone                    TEXT        NOT NULL,
  email                    TEXT,
  city                     TEXT        NOT NULL,
  locality                 TEXT        NOT NULL,
  property_type            TEXT        NOT NULL,
  service                  TEXT        NOT NULL,
  description              TEXT        NOT NULL,
  contact_method           TEXT        NOT NULL,

  consent_at               TIMESTAMPTZ NOT NULL,
  consent_version          TEXT        NOT NULL,
  source_path              TEXT,
  ip_hash                  TEXT,

  -- Notification tracking: pending -> sent | failed (retried by script).
  notification_status      TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (notification_status IN ('pending', 'sent', 'failed')),
  notification_attempts    INTEGER     NOT NULL DEFAULT 0,
  notification_last_error  TEXT,
  notification_sent_at     TIMESTAMPTZ,

  -- Owner-managed outcome register (updated manually; see docs/LEADS.md).
  outcome                  TEXT        NOT NULL DEFAULT 'new'
                           CHECK (outcome IN ('new', 'contacted', 'inspection', 'estimate-sent', 'won', 'lost', 'spam')),
  outcome_notes            TEXT,
  outcome_updated_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_notification_idx ON enquiries (notification_status) WHERE notification_status <> 'sent';
CREATE INDEX IF NOT EXISTS enquiries_phone_recent_idx ON enquiries (phone, created_at DESC);

-- Submission attempts, for rate limiting. Holds only a salted hash of the IP.
CREATE TABLE IF NOT EXISTS enquiry_attempts (
  id          BIGSERIAL PRIMARY KEY,
  ip_hash     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiry_attempts_ip_idx ON enquiry_attempts (ip_hash, created_at DESC);
