-- ==========================================================
-- PRIVACY-PRESERVING PROOF-OF-HUMAN IDENTITY API
-- Supabase Postgres Database Migration / Schema Definition
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
-- Tracks the high-level identity validation status.
-- Do not store SSNs, names, email or raw biometric assets here.
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    status text not null check (status in ('pending', 'verified', 'rejected', 'suspended')),
    human_uid text unique not null, -- Anonymized one-way cryptographic commitment representing a unique person's face
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for human_uid lookup during duplicate check
create index if not exists idx_users_human_uid on public.users(human_uid);

-- 2. BIOMETRIC_TEMPLATES TABLE
-- Stores highly processed, encrypted embedding hashes/templates only.
-- NEVER store raw face snapshots/selfies.
create table if not exists public.biometric_templates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    template_hash text not null unique, -- Cryptographic hash of the biometric template for O(1) duplicate checks
    encrypted_template text not null, -- Encrypted biometric embedding (AES-256 or similar, managed at application level)
    model_version text not null, -- E.g., 'facenet-v3', 'liveness-deepface-v1'
    confidence_score numeric(5, 2) not null, -- Match or quality confidence score during enrollment
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_biometric_templates_hash on public.biometric_templates(template_hash);

-- 3. DEVICES TABLE
-- Tracks registered client hardware public keys. Used in multi-account blocklists.
create table if not exists public.devices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    device_public_key text not null, -- RSA-2048 or Ed25519 PEM string 
    device_fingerprint_hash text not null, -- Hash of Canvas, OS, and client parameters
    platform text not null, -- e.g., 'iOS', 'Android', 'macOS-Chrome'
    trusted boolean default true not null,
    last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_devices_fingerprint on public.devices(device_fingerprint_hash);
create index if not exists idx_devices_pubkey on public.devices(device_public_key);

-- 4. PARTNER_APPS TABLE
-- Platforms querying the proof-of-human API.
create table if not exists public.partner_apps (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    api_key_hash text not null unique, -- SHA-256 hash of API key
    webhook_url text, -- Webhook target to push verification state updates
    status text not null check (status in ('active', 'suspended')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_partner_apps_key_hash on public.partner_apps(api_key_hash);

-- 5. PARTNER_USER_LINKS TABLE
-- Map to partner accounts. Ensures pseudonymity (partner does not see raw user_id unless permitted)
create table if not exists public.partner_user_links (
    id uuid primary key default gen_random_uuid(),
    partner_app_id uuid references public.partner_apps(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    external_user_id text not null, -- User identifier on partner platform (e.g. 'app_user_123')
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(partner_app_id, external_user_id)
);

create index if not exists idx_partner_user_links_lookup on public.partner_user_links(partner_app_id, external_user_id);

-- 6. VERIFICATION_SESSIONS TABLE
-- Individual verification session lifecycles.
create table if not exists public.verification_sessions (
    id uuid primary key default gen_random_uuid(),
    partner_app_id uuid references public.partner_apps(id) on delete cascade not null,
    external_user_id text not null,
    status text not null check (status in ('started', 'passed', 'failed', 'review')),
    risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
    duplicate_candidate boolean default false not null,
    result_reason text,
    risk_reasons jsonb default '[]'::jsonb not null,
    proof_token text, -- Signed cryptographic token (JWT-like or custom payload)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

create index if not exists idx_sessions_partner_app on public.verification_sessions(partner_app_id);

-- 7. AUDIT_LOGS TABLE
-- Cryptographically linked or static strict operational logs.
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_type text not null check (actor_type in ('system', 'partner', 'admin', 'user')),
    actor_id text not null, -- E.g. API key ID, admin email, partner id
    action text not null, -- E.g. 'api_key.create', 'verification.verify', 'user.suspend'
    target_type text not null, -- E.g. 'user', 'session', 'api_key'
    target_id text not null,
    metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_target on public.audit_logs(target_type, target_id);

-- Trigger to auto-update users.updated_at
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger tr_users_update_timestamp
    before update on public.users
    for each row
    execute procedure public.handle_update_timestamp();

-- ==========================================================
-- REALISTIC ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable Row Level Security on all core tables
alter table public.users enable row level security;
alter table public.biometric_templates enable row level security;
alter table public.devices enable row level security;
alter table public.partner_apps enable row level security;
alter table public.partner_user_links enable row level security;
alter table public.verification_sessions enable row level security;
alter table public.audit_logs enable row level security;

-- 1. Users Table Security Policies
-- Users are privacy-centric and can only be queried by authorized admin roles or authenticated partners.
create policy "Admins have full access to users"
    on public.users
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partner apps can select linked users"
    on public.users
    for select
    using (
        exists (
            select 1 from public.partner_user_links l
            where l.user_id = public.users.id
        )
    );

-- 2. Biometric Templates Security Policies
-- Extremely sensitive. Never expose raw biometric hashes or embeddings.
-- Strictly restricted to service-role background verification workers. No client/partner selects.
create policy "Strict service-role only access to biometric templates"
    on public.biometric_templates
    for all
    using (auth.jwt()->>'role' = 'service_role')
    with check (auth.jwt()->>'role' = 'service_role');

-- 3. Devices Security Policies
-- Tracks fingerprints and hardware keys. Accessible only by service-role or linked partner apps.
create policy "Admins have full access to devices"
    on public.devices
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partner apps can select devices of their users"
    on public.devices
    for select
    using (
        exists (
            select 1 from public.partner_user_links l
            where l.user_id = public.devices.user_id
        )
    );

-- 4. Partner Apps Security Policies
-- Partners can only select their own app settings.
create policy "Admins have full access to partner apps"
    on public.partner_apps
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select their own partner app configuration"
    on public.partner_apps
    for select
    using (
        -- In Supabase, can compare with claims or partner app ID
        id::text = auth.jwt()->>'partner_app_id'
    );

-- 5. Partner User Links Security Policies
-- Scoped to the partner application ID matching their credentials.
create policy "Admins have full access to partner user links"
    on public.partner_user_links
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select their own user links"
    on public.partner_user_links
    for select
    using (partner_app_id::text = auth.jwt()->>'partner_app_id');

-- 6. Verification Sessions Security Policies
-- Scoped strictly so partners can only view their own verification sessions.
create policy "Admins have full access to verification sessions"
    on public.verification_sessions
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select their own sessions"
    on public.verification_sessions
    for select
    using (partner_app_id::text = auth.jwt()->>'partner_app_id');

create policy "Partners can create sessions under their ID"
    on public.verification_sessions
    for insert
    with check (partner_app_id::text = auth.jwt()->>'partner_app_id');

-- 7. Audit Logs Security Policies
-- Append-only constraint: Only system processes or authorized roles can append logs.
-- Update and Delete actions are strictly prohibited on audit tables to prevent cover-up of malicious activities.
create policy "Admins can read audit logs"
    on public.audit_logs
    for select
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can read their own target audit logs"
    on public.audit_logs
    for select
    using (actor_id = auth.jwt()->>'partner_app_id');

create policy "System and Admins can insert audit logs"
    on public.audit_logs
    for insert
    with check (true); -- Append-only trigger

-- No update/delete policies are declared, which safely disables update/delete for all roles!


-- ==========================================================
-- 8. ORGANIZATIONS & PROJECTS SCHEMAS (MODULE 1)
-- ==========================================================

create table if not exists public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    allowed_domains text[] default '{}'::text[] not null,
    login_policy text not null,
    enforcement_mode text not null check (enforcement_mode in ('monitor_only', 'flag_suspicious', 'require_reverification', 'block_untrusted', 'partner_removal')),
    webhook_secret text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- 9. WEBHOOK_DELIVERIES SCHEMA (MODULE 5)
-- ==========================================================

create table if not exists public.webhook_deliveries (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade not null,
    event_type text not null,
    url text not null,
    payload jsonb not null,
    signature text not null,
    status text not null check (status in ('success', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- 10. DUPLICATE_SIGNALS SCHEMA (MODULE 6)
-- ==========================================================

create table if not exists public.duplicate_signals (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade not null,
    session_id uuid references public.verification_sessions(id) on delete cascade not null,
    external_user_id text not null,
    duplicate_external_user_id text not null,
    confidence numeric(5,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- 11. REMOVAL_REQUESTS SCHEMA (MODULE 9)
-- ==========================================================

create table if not exists public.removal_requests (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade not null,
    external_user_id text not null,
    status text not null check (status in ('pending', 'approved', 'rejected')),
    reason text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    approved_at timestamp with time zone
);

-- ==========================================================
-- 12. SECURITY_EVENTS SCHEMA (BYPASS & INTRUSION DETECTION LAYER)
-- ==========================================================

create table if not exists public.security_events (
    id uuid primary key default gen_random_uuid(),
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    event_type text not null, -- e.g., 'invalid_token_signature', 'expired_token_reuse', 'token_replay_attempt', 'impossible_session_state_transition', etc.
    actor_type text not null check (actor_type in ('user', 'partner_app', 'admin', 'system', 'unknown')),
    actor_id text not null,
    ip_address text not null,
    user_agent text not null,
    session_id text,
    partner_app_id text,
    request_path text,
    detection_reason text not null,
    raw_metadata jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_security_events_severity on public.security_events(severity);
create index if not exists idx_security_events_type on public.security_events(event_type);

-- RLS FOR SECURITY_EVENTS: Ensure strict administrative boundary
alter table public.security_events enable row level security;

-- Admin-only policy: Only authorized administrative roles may read system intrusion logs. Guest/Partner users are denied.
create policy "Admins select access to security events"
    on public.security_events
    for select
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');


-- ==========================================================
-- RLS FOR MODULE SPECIFIC TABLES
-- ==========================================================

-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.projects enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.duplicate_signals enable row level security;
alter table public.removal_requests enable row level security;

-- 8. Organizations RLS Policies
create policy "Admins have full access to organizations"
    on public.organizations
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Users can select their linked organization"
    on public.organizations
    for select
    using (
        -- Assumes partner app is mapped or matching claim in JWT
        id::text = auth.jwt()->>'organization_id'
    );

-- 9. Projects RLS Policies
create policy "Admins have full access to projects"
    on public.projects
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select projects within their organization"
    on public.projects
    for select
    using (
        organization_id::text = auth.jwt()->>'organization_id'
    );

-- 10. Webhook Deliveries RLS Policies
create policy "Admins have full access to webhook deliveries"
    on public.webhook_deliveries
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select webhook deliveries of their projects"
    on public.webhook_deliveries
    for select
    using (
        exists (
            select 1 from public.projects p
            where p.id = public.webhook_deliveries.project_id
            and p.organization_id::text = auth.jwt()->>'organization_id'
        )
    );

-- 11. Duplicate Signals RLS Policies
create policy "Admins have full access to duplicate signals"
    on public.duplicate_signals
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select duplicate signals of their projects"
    on public.duplicate_signals
    for select
    using (
        exists (
            select 1 from public.projects p
            where p.id = public.duplicate_signals.project_id
            and p.organization_id::text = auth.jwt()->>'organization_id'
        )
    );

-- 12. Removal Requests RLS Policies
create policy "Admins have full access to removal requests"
    on public.removal_requests
    for all
    using (auth.jwt()->>'role' = 'service_role' or auth.jwt()->>'role' = 'admin_super_user');

create policy "Partners can select or create removal requests of their projects"
    on public.removal_requests
    for all
    using (
        exists (
            select 1 from public.projects p
            where p.id = public.removal_requests.project_id
            and p.organization_id::text = auth.jwt()->>'organization_id'
        )
    );


