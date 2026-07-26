-- Audit log for tracking scope changes and admin actions
CREATE TABLE IF NOT EXISTS provenance_audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON provenance_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON provenance_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON provenance_audit_log(created_at DESC);
