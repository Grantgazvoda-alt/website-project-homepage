-- Provenance auth and rate limiting tables
CREATE TABLE IF NOT EXISTS provenance_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS provenance_api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES provenance_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON provenance_api_keys(user_id);
