CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 150),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  phone TEXT CHECK (char_length(phone) <= 25),
  company TEXT CHECK (char_length(company) <= 100),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  email_notified BOOLEAN NOT NULL DEFAULT false,
  autoreply_sent BOOLEAN NOT NULL DEFAULT false,
  telegram_notified BOOLEAN NOT NULL DEFAULT false,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);

CREATE INDEX IF NOT EXISTS messages_status_idx ON messages (status);