-- ============================================================================
-- AAN INFRASTRUCTURE PLATFORM — SECURE DATABASE MIGRATION SCHEMA
-- ============================================================================
-- Target Database: PostgreSQL (Supabase Cloud Database instance)
-- Schema Version: 2.4.0-Enterprise
-- Date Created: July 4, 2026
--
-- HOW TO DEPLOY TO SUPABASE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your AAN project.
-- 3. In the left navigation, click "SQL Editor" (the icon looks like a terminal prompt '>_').
-- 4. Click "New Query" to open a fresh slate.
-- 5. Copy the entire contents of this file, paste it into the editor, and click "Run" (CMD + Enter).
-- 6. All tables, indices, constraints, and Row Level Security structures will populate instantly.
-- ============================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==========================================
-- 1. TABLE: PARTNER_APPS
-- ==========================================
-- Stores registered integrating clients, metadata, and active API key hashes.
CREATE TABLE IF NOT EXISTS partner_apps (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL UNIQUE,
    webhook_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Optimize API lookup routing
CREATE INDEX IF NOT EXISTS idx_partner_apps_hash ON partner_apps (api_key_hash);


-- ==========================================
-- 2. TABLE: USERS
-- ==========================================
-- Stores digital identities assessed by the Decentralized Assurance core.
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
    human_uid VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ==========================================
-- 3. TABLE: VERIFICATION_SESSIONS
-- ==========================================
-- Manages session state, humanness risk score assessments, and cryptographic proofs.
CREATE TABLE IF NOT EXISTS verification_sessions (
    id VARCHAR(255) PRIMARY KEY,
    partner_app_id VARCHAR(255) REFERENCES partner_apps(id) ON DELETE CASCADE,
    external_user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    risk_score INT NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    duplicate_candidate BOOLEAN NOT NULL DEFAULT FALSE,
    result_reason TEXT NOT NULL,
    risk_reasons TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    proof_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Multi-column indexing for fast verification checks and metrics
CREATE INDEX IF NOT EXISTS idx_verification_sessions_partner ON verification_sessions (partner_app_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_external ON verification_sessions (external_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions (status);


-- ==========================================
-- 4. TABLE: AUDIT_LOGS
-- ==========================================
-- Tracks developer changes, API calls, and compliance logs securely.
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('system', 'partner', 'admin', 'user')),
    actor_id VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    target_type VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);


-- ==========================================
-- 5. TABLE: SECURITY_EVENTS
-- ==========================================
-- Logs intrusion attempts, key exposure signals, and botnet telemetry.
CREATE TABLE IF NOT EXISTS security_events (
    id VARCHAR(255) PRIMARY KEY,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    event_type VARCHAR(255) NOT NULL,
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'partner_app', 'admin', 'system', 'unknown')),
    actor_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(100) NOT NULL,
    user_agent TEXT NOT NULL,
    session_id VARCHAR(255),
    partner_app_id VARCHAR(255) REFERENCES partner_apps(id) ON DELETE SET NULL,
    request_path VARCHAR(255),
    detection_reason TEXT NOT NULL,
    raw_metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events (severity);
CREATE INDEX IF NOT EXISTS idx_security_events_partner ON security_events (partner_app_id);


-- ==========================================
-- 6. TABLE: SECURITY_REPORTS
-- ==========================================
-- Active repository for Bug Bounty and Responsible Vulnerability Disclosures.
CREATE TABLE IF NOT EXISTS security_reports (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_system VARCHAR(255) NOT NULL,
    reproduction_steps TEXT NOT NULL,
    submitted_evidence TEXT,
    reporter_contact VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('new', 'triaged', 'duplicate', 'reproduced', 'patched', 'payout_approved', 'payout_paid', 'closed')),
    bounty_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_security_reports_status ON security_reports (status);
CREATE INDEX IF NOT EXISTS idx_security_reports_severity ON security_reports (severity);


-- ==========================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- By default, Supabase secures tables. AAN backend APIs consume this database
-- using the private service-role client, bypassing policies and enabling secure
-- server-side access, keeping API keys protected. Public accesses are blocked.

ALTER TABLE partner_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;

-- Service Role Key Bypasses RLS by default. To allow read-only query of public disclosure
-- report statuses, we add a public read policy to security_reports table:
CREATE POLICY "Allow public read access to security reports" 
ON security_reports 
FOR SELECT 
USING (status IN ('patched', 'payout_paid'));

-- Return operational success log in database console
SELECT 'MIGRATION COMPLETED SUCCESSFULLY' AS status;
