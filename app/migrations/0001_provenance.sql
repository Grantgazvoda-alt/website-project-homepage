-- Provenance Intelligence System — Core schema
-- Tracks the full lifecycle from code generation through deployment.

CREATE TABLE IF NOT EXISTS provenance_records (
  id TEXT PRIMARY KEY,
  source_project TEXT NOT NULL,
  source_project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  brief TEXT NOT NULL,
  architecture_plan TEXT DEFAULT '',
  tech_stack TEXT DEFAULT '',
  version_number INTEGER DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  commit_hash TEXT DEFAULT '',
  commit_message TEXT DEFAULT '',
  repo_url TEXT DEFAULT '',
  repo_name TEXT DEFAULT '',
  pipeline_duration_ms INTEGER DEFAULT 0,
  model_used TEXT DEFAULT '',
  fix_rounds INTEGER DEFAULT 0,
  build_status TEXT DEFAULT 'not_run',
  test_status TEXT DEFAULT 'not_run',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_source ON provenance_records(source_project, source_project_id);
CREATE INDEX IF NOT EXISTS idx_records_user ON provenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_created ON provenance_records(created_at DESC);

CREATE TABLE IF NOT EXISTS provenance_lineage (
  id TEXT PRIMARY KEY,
  provenance_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  file_path TEXT NOT NULL DEFAULT '',
  file_language TEXT DEFAULT '',
  reasoning TEXT DEFAULT '',
  model_used TEXT DEFAULT '',
  prompt_snapshot TEXT DEFAULT '',
  content_hash TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (provenance_id) REFERENCES provenance_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lineage_provenance ON provenance_lineage(provenance_id);
CREATE INDEX IF NOT EXISTS idx_lineage_hash ON provenance_lineage(content_hash);

CREATE TABLE IF NOT EXISTS provenance_deployments (
  id TEXT PRIMARY KEY,
  provenance_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  live_url TEXT DEFAULT '',
  provider_project_id TEXT DEFAULT '',
  provider_deployment_id TEXT DEFAULT '',
  branch TEXT DEFAULT 'main',
  build_log_key TEXT DEFAULT '',
  deployed_by TEXT DEFAULT '',
  deployed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (provenance_id) REFERENCES provenance_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deployments_provenance ON provenance_deployments(provenance_id);
CREATE INDEX IF NOT EXISTS idx_deployments_env ON provenance_deployments(environment, status);

CREATE TABLE IF NOT EXISTS provenance_rollbacks (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL,
  rollback_to_deployment_id TEXT,
  reason TEXT DEFAULT '',
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (deployment_id) REFERENCES provenance_deployments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rollbacks_deployment ON provenance_rollbacks(deployment_id);

CREATE TABLE IF NOT EXISTS provenance_certificates (
  id TEXT PRIMARY KEY,
  provenance_id TEXT NOT NULL UNIQUE,
  certificate_data TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT,
  revoked_at TEXT,
  revoked_reason TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (provenance_id) REFERENCES provenance_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_certificates_provenance ON provenance_certificates(provenance_id);