-- Add scopes column to API keys for granular permissions
ALTER TABLE provenance_api_keys ADD COLUMN scopes TEXT DEFAULT 'read';
