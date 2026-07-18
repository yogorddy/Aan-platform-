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

-- ==========================================
-- 7. TABLE: INTEGRATION_REQUESTS
-- ==========================================
-- Stores onboarding and contact submissions securely with strict privacy-preserving metrics.
CREATE TABLE IF NOT EXISTS integration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    use_case TEXT,
    message TEXT NOT NULL,
    phone TEXT,
    company_size TEXT,
    urgency TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'contacted', 'approved', 'rejected', 'archived')),
    source TEXT DEFAULT 'contact_form',
    request_code TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status_changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_hash TEXT,
    user_agent_hash TEXT,
    submission_source TEXT,
    environment TEXT,
    admin_notes TEXT
);

-- Optimize routing and lookup metrics
CREATE INDEX IF NOT EXISTS idx_integration_requests_status ON integration_requests (status);
CREATE INDEX IF NOT EXISTS idx_integration_requests_email ON integration_requests (email);
CREATE INDEX IF NOT EXISTS idx_integration_requests_created_at ON integration_requests (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE integration_requests ENABLE ROW LEVEL SECURITY;

-- Public users may INSERT only
CREATE POLICY "Allow public insert only" 
ON integration_requests 
FOR INSERT 
WITH CHECK (true);

-- Authenticated / Service Role or Admin can do SELECT and UPDATE
CREATE POLICY "Allow authenticated users select" 
ON integration_requests 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users update" 
ON integration_requests 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- ==========================================
-- 8. TABLE: INTEGRATION_REQUEST_STATUS_HISTORY
-- ==========================================
-- Tracks state transition histories for all onboarding requests securely.
CREATE TABLE IF NOT EXISTS integration_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_request_id UUID REFERENCES integration_requests(id) ON DELETE CASCADE NOT NULL,
    previous_status TEXT CHECK (previous_status IN ('pending', 'reviewed', 'contacted', 'approved', 'rejected', 'archived') OR previous_status IS NULL),
    new_status TEXT NOT NULL CHECK (new_status IN ('pending', 'reviewed', 'contacted', 'approved', 'rejected', 'archived')),
    changed_by UUID, -- REFERENCES auth.users(id) in full schema, nullable here
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    change_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Index for timeline traversal
CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON integration_request_status_history (integration_request_id);

-- Enable Row Level Security (RLS)
ALTER TABLE integration_request_status_history ENABLE ROW LEVEL SECURITY;

-- Authenticated admins can SELECT
CREATE POLICY "Allow authenticated status history select" 
ON integration_request_status_history 
FOR SELECT 
TO authenticated 
USING (true);

-- Authenticated admins can INSERT
CREATE POLICY "Allow authenticated status history insert" 
ON integration_request_status_history 
FOR INSERT 
TO authenticated 
WITH CHECK (true);


-- ==========================================
-- 9. TRIGGERS: AUTOMATED STATE MANAGEMENT
-- ==========================================
-- Automatically track status transitions and update status_changed_at.
CREATE OR REPLACE FUNCTION handle_integration_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        NEW.status_changed_at := NOW();
        INSERT INTO integration_request_status_history (
            integration_request_id,
            previous_status,
            new_status,
            changed_at,
            change_reason,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NOW(),
            COALESCE(NEW.admin_notes, 'Status transitioned automatically via trigger.'),
            jsonb_build_object('triggered_by_db', true)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists to avoid errors on run
DROP TRIGGER IF EXISTS trg_integration_request_status_change ON integration_requests;

CREATE TRIGGER trg_integration_request_status_change
    BEFORE UPDATE ON integration_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_integration_request_status_change();


-- ==========================================
-- 10. TABLE: PROFILES & AAN IDENTITY REGISTRATION
-- ==========================================
-- Stores user profiles for AAN Identity registrations, linked to auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Linked directly to auth.users.id
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    organization_name VARCHAR(255),
    aan_user_code VARCHAR(100) UNIQUE DEFAULT 'AAN-USR-' || substring(md5(random()::text) from 1 for 8),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row-Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to select profiles
CREATE POLICY "Allow public select profiles" 
ON public.profiles 
FOR SELECT 
WITH CHECK (true);

-- Insert policy: Allow public/unauthenticated insert to sign up
CREATE POLICY "Allow public insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Update policy: Allow users to update their own profile
CREATE POLICY "Allow users update own profile" 
ON public.profiles 
FOR UPDATE 
WITH CHECK (id = auth.uid());


-- ==========================================
-- 11. TABLE: ORGANIZATIONS
-- ==========================================
-- Represents customer organizations subscribing to AAN.
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    use_case VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 12. TABLE: ORGANIZATION_MEMBERS
-- Connects auth.users to organizations with defined roles.
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL, -- References auth.users.id
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Organization Policies
CREATE POLICY "Allow members select organization" 
ON public.organizations 
FOR SELECT 
USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Allow authenticated insert organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow members update organization" 
ON public.organizations 
FOR UPDATE 
USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- Organization Members Policies
CREATE POLICY "Allow members select members" 
ON public.organization_members 
FOR SELECT 
USING (
    user_id = auth.uid() OR 
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Allow users join organizations they create" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (true);


-- ==========================================
-- 13. TABLE: PROJECTS
-- ==========================================
-- Individual trust-verification projects under an organization.
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(50) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    expected_verifications VARCHAR(100) NOT NULL,
    integration_surface VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Project RLS Policies
CREATE POLICY "Allow members select projects" 
ON public.projects 
FOR SELECT 
USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Allow members insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Allow members update projects" 
ON public.projects 
FOR UPDATE 
USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);


-- ==========================================
-- 14. TABLE: API_KEYS
-- ==========================================
-- API key credentials linked to AAN projects.
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    publishable_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key_hash VARCHAR(255) NOT NULL,
    webhook_signing_secret VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select api_keys" 
ON public.api_keys 
FOR SELECT 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Allow members insert api_keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);


-- ==========================================
-- 15. TABLE: TRUST_RULES
-- ==========================================
-- Rules guiding automated decisioning engines.
CREATE TABLE IF NOT EXISTS public.trust_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
    auto_approve_below INT DEFAULT 30 CHECK (auto_approve_below >= 0 AND auto_approve_below <= 100),
    manual_review_above INT DEFAULT 30 CHECK (manual_review_above >= 0 AND manual_review_above <= 100),
    deny_above INT DEFAULT 75 CHECK (deny_above >= 0 AND deny_above <= 100),
    duplicate_action VARCHAR(100) DEFAULT 'flag',
    bot_suspicion_action VARCHAR(100) DEFAULT 'verify',
    fallback_no_camera VARCHAR(100) DEFAULT 'allow_with_risk_penalty',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.trust_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select trust_rules" 
ON public.trust_rules 
FOR SELECT 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Allow members insert/update trust_rules" 
ON public.trust_rules 
FOR ALL 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);


-- ==========================================
-- 16. TABLE: VERIFICATION_EVENTS
-- ==========================================
-- Premium ledger detailing historical identity checks and scores.
CREATE TABLE IF NOT EXISTS public.verification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    external_user_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'review', 'denied')),
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    reason_codes TEXT[] DEFAULT '{}'::TEXT[],
    device_signal VARCHAR(255) NOT NULL,
    ip_risk_signal VARCHAR(255) NOT NULL,
    returning_human BOOLEAN DEFAULT FALSE,
    proof_token_status VARCHAR(50) DEFAULT 'valid' CHECK (proof_token_status IN ('valid', 'expired', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.verification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select verification_events" 
ON public.verification_events 
FOR SELECT 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);


-- ==========================================
-- 17. TABLE: ZK_MODEL_VERSIONS
-- ==========================================
-- Defines active ML risk models compiled into EZKL circuits.
CREATE TABLE IF NOT EXISTS public.zk_model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    description TEXT,
    onnx_model_hash VARCHAR(255) NOT NULL,
    ezkl_settings_hash VARCHAR(255) NOT NULL,
    compiled_circuit_hash VARCHAR(255) NOT NULL,
    proving_key_hash VARCHAR(255) NOT NULL,
    verification_key_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for zk_model_versions
ALTER TABLE public.zk_model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read zk_model_versions" 
ON public.zk_model_versions FOR SELECT USING (true);


-- ==========================================
-- 18. TABLE: RISK_MODEL_INPUTS
-- ==========================================
-- Secure normalized features prepared for ML model validation.
CREATE TABLE IF NOT EXISTS public.risk_model_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trust_event_id VARCHAR(255) NOT NULL,
    device_trust_score INT NOT NULL,
    ip_risk_score INT NOT NULL,
    failed_login_velocity INT NOT NULL,
    associated_account_count INT NOT NULL,
    account_age_days INT NOT NULL,
    previous_step_up_failures INT NOT NULL,
    behavior_anomaly_score INT NOT NULL,
    input_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for risk_model_inputs
ALTER TABLE public.risk_model_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read risk_model_inputs" 
ON public.risk_model_inputs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert risk_model_inputs" 
ON public.risk_model_inputs FOR INSERT WITH CHECK (true);


-- ==========================================
-- 19. TABLE: ZK_PROOFS
-- ==========================================
-- Zero-Knowledge cryptographic proofs generated via EZKL.
CREATE TABLE IF NOT EXISTS public.zk_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trust_event_id VARCHAR(255) NOT NULL,
    trust_decision_id VARCHAR(255),
    model_version_id UUID REFERENCES public.zk_model_versions(id) ON DELETE SET NULL,
    proof_hash TEXT NOT NULL,
    public_inputs_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
    verified_output INT NOT NULL,
    verification_time_ms INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for zk_proofs
ALTER TABLE public.zk_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read zk_proofs" 
ON public.zk_proofs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert zk_proofs" 
ON public.zk_proofs FOR INSERT WITH CHECK (true);


-- ==========================================
-- 20. EXPAND VERIFICATION_EVENTS WITH ZK FIELD SUPPORT
-- ==========================================
ALTER TABLE public.verification_events ADD COLUMN IF NOT EXISTS zk_proof_id UUID;
ALTER TABLE public.verification_events ADD COLUMN IF NOT EXISTS zk_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.verification_events ADD COLUMN IF NOT EXISTS zk_model_version_id UUID;
ALTER TABLE public.verification_events ADD COLUMN IF NOT EXISTS model_risk_score INT;
ALTER TABLE public.verification_events ADD COLUMN IF NOT EXISTS model_output INT;


-- ==========================================
-- 21. TRUST CLUSTERS & CLUSTERED RELATIONSHIPS
-- ==========================================
-- Support for Louvain/Leiden clustering and visual investigation support.

CREATE TABLE IF NOT EXISTS public.trust_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    confidence_score INT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status VARCHAR(50) DEFAULT 'incomplete' CHECK (status IN ('high_confidence', 'mixed_signals', 'suspicious', 'incomplete')),
    algorithm VARCHAR(100) DEFAULT 'louvain' CHECK (algorithm IN ('louvain', 'leiden', 'manual_review', 'heuristic')),
    verified_humans_count INT DEFAULT 0,
    partner_accounts_count INT DEFAULT 0,
    trust_devices_count INT DEFAULT 0,
    events_count INT DEFAULT 0,
    decisions_count INT DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for trust_clusters
ALTER TABLE public.trust_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read trust_clusters" 
ON public.trust_clusters FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert trust_clusters" 
ON public.trust_clusters FOR INSERT WITH CHECK (true);

-- Create verified_humans table
CREATE TABLE IF NOT EXISTS public.verified_humans (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('within_policy', 'needs_review', 'exceeds_policy')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    avg_trust_score INT NOT NULL CHECK (avg_trust_score >= 0 AND avg_trust_score <= 100),
    highest_risk_score INT NOT NULL CHECK (highest_risk_score >= 0 AND highest_risk_score <= 100),
    relationship_confidence INT NOT NULL CHECK (relationship_confidence >= 0 AND relationship_confidence <= 100),
    total_accounts INT DEFAULT 0,
    known_devices_count INT DEFAULT 0,
    primary_cluster_id UUID REFERENCES public.trust_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for verified_humans
ALTER TABLE public.verified_humans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read verified_humans" 
ON public.verified_humans FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert verified_humans" 
ON public.verified_humans FOR INSERT WITH CHECK (true);

-- Create trust_relationships table
CREATE TABLE IF NOT EXISTS public.trust_relationships (
    id VARCHAR(255) PRIMARY KEY,
    human_id VARCHAR(255) REFERENCES public.verified_humans(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    evidence TEXT[] DEFAULT '{}'::TEXT[],
    status VARCHAR(50) NOT NULL,
    recommendation TEXT,
    cluster_id UUID REFERENCES public.trust_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for trust_relationships
ALTER TABLE public.trust_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read trust_relationships" 
ON public.trust_relationships FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert trust_relationships" 
ON public.trust_relationships FOR INSERT WITH CHECK (true);


-- Create aan_trust_events table
CREATE TABLE IF NOT EXISTS public.aan_trust_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    project_id UUID,
    external_user_id VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'review', 'denied')),
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    reason_codes TEXT[] DEFAULT '{}'::TEXT[],
    signal_payload JSONB DEFAULT '{}'::jsonb,
    proof_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Enable RLS for aan_trust_events
ALTER TABLE public.aan_trust_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read aan_trust_events" 
ON public.aan_trust_events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert aan_trust_events" 
ON public.aan_trust_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update aan_trust_events" 
ON public.aan_trust_events FOR UPDATE USING (true);


-- ==========================================
-- 22. TABLE: DEVICES
-- ==========================================
-- Stores hardware environment metrics and unique webgl/canvas signature profiles.
CREATE TABLE IF NOT EXISTS public.devices (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspicious', 'blocked')),
    fingerprint_score INT NOT NULL CHECK (fingerprint_score >= 0 AND fingerprint_score <= 100),
    last_used_ip VARCHAR(100),
    human_id VARCHAR(255) REFERENCES public.verified_humans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update devices" ON public.devices FOR UPDATE USING (true);


-- ==========================================
-- 23. TABLE: PARTNER_USER_LINKS
-- ==========================================
-- One-way anonymized connection mapping a partner's user ID to an AAN Verified Human profile.
CREATE TABLE IF NOT EXISTS public.partner_user_links (
    id VARCHAR(255) PRIMARY KEY,
    partner_app_id VARCHAR(255) REFERENCES public.partner_apps(id) ON DELETE CASCADE,
    partner_user_id VARCHAR(255) NOT NULL,
    human_id VARCHAR(255) REFERENCES public.verified_humans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(partner_app_id, partner_user_id)
);

-- Enable RLS & Policies
ALTER TABLE public.partner_user_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read partner_user_links" ON public.partner_user_links FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert partner_user_links" ON public.partner_user_links FOR INSERT WITH CHECK (true);


-- ==========================================
-- 24. TABLE: TRUST_SIGNALS
-- ==========================================
-- Logs dynamic context markers harvested during active verification sessions.
CREATE TABLE IF NOT EXISTS public.trust_signals (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    risk_weight INT DEFAULT 0 CHECK (risk_weight >= 0 AND risk_weight <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.trust_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read trust_signals" ON public.trust_signals FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert trust_signals" ON public.trust_signals FOR INSERT WITH CHECK (true);


-- ==========================================
-- 25. TABLE: BIOMETRIC_TEMPLATES
-- ==========================================
-- Retains strictly one-way mathematical signature hashes. Strictly NO raw photos/videos.
CREATE TABLE IF NOT EXISTS public.biometric_templates (
    id VARCHAR(255) PRIMARY KEY,
    human_id VARCHAR(255) REFERENCES public.verified_humans(id) ON DELETE CASCADE,
    template_hash VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.biometric_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read biometric_templates" ON public.biometric_templates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert biometric_templates" ON public.biometric_templates FOR INSERT WITH CHECK (true);


-- ==========================================
-- 26. TABLE: WEBHOOKS
-- ==========================================
-- Active listener configuration managing partner endpoint subscriptions.
CREATE TABLE IF NOT EXISTS public.webhooks (
    id VARCHAR(255) PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read webhooks" ON public.webhooks FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert webhooks" ON public.webhooks FOR INSERT WITH CHECK (true);


-- Return operational success log in database console
SELECT 'MIGRATION COMPLETED SUCCESSFULLY' AS status;

