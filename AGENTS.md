# AAN Platform: Current-State Architecture Audit & Engineering Standards

This document establishes the official architectural baseline, permanent engineering standards, and implementation roadmap for the Antigravity Assurance Network (AAN) platform. It aligns the existing codebase with the canonical **AAN Architecture Blueprint**, identifying gaps, legacy overlaps, and security findings, and details the recommended migration path.

---

## A. Executive Summary

The AAN Platform is a decentralized, zero-knowledge posture attestation and identity assurance network. Currently, the application operates on a hybrid architecture: a highly robust, premium frontend console (Partner Console, Admin Center, and Test Lab) integrated with a backend Express API (`server.ts`) and a Supabase PostgreSQL instance.

This audit evaluates the current state against the canonical AAN schema definitions. We identify that while the visual presentation layers and mockup telemetry are exceptionally well-implemented, the underlying database schemas, foreign key structures, and API routers are split between **legacy-supporting tables** (e.g., `partner_apps`, `api_keys`, `webhooks`) and the **intended canonical schemas** (e.g., `aan_projects`, `aan_verification_sessions`, `aan_api_credentials`).

By executing the **Partner Architecture (Phase 1)**, we will safely establish the core organizational boundary, transition project relationships to tenant organizations, deploy cryptographically secure api credentialing, and wire up an enterprise-grade webhook delivery system, all while preserving the active features of the live application.

---

## B. Permanent Engineering Standards

To ensure that the AAN Platform is engineered like critical infrastructure rather than a prototype, all future development and migrations MUST adhere strictly to these principles:

### 1. Proposal-First Engineering
Before implementing any milestone, the AI coding agent must explain and propose:
1. **Change Details**: Exactly what will change.
2. **Necessity**: Why the change is necessary.
3. **Files Affected**: Complete list of files to be modified.
4. **Database Objects Affected**: Complete list of database objects (tables, functions, indexes, policies) to be modified.
5. **Risks**: Assessment of possible risks and degradation of existing services.
6. **Rollback Strategy**: Step-by-step procedure to reverse the migration.
7. **Wait for Approval**: Explicit approval from the engineer is required before executing any file or database changes.

### 2. Canonical Trust Decisions
AAN must remain strictly policy-neutral. The platform produces trust decisions; the partner platform determines enforcement.
- **Trust Decision Enum values**:
  - `approved` $\rightarrow$ The posture meets the trust bar. Partner may allow access.
  - `review` $\rightarrow$ The posture raises minor anomalies. Partner may require MFA, CAPTCHA, email/phone verification, manual review, additional signals, or custom workflows.
  - `denied` $\rightarrow$ High-risk or confirmed malicious posture. Partner may block access or enforce policy-defined actions.
- **Enforcement separation**: Do NOT use system enums representing partner-specific actions like `ALLOW`, `DENY`, or `STEP_UP`. The database ledger and decision engine must strictly capture `approved`, `review`, and `denied`.

### 3. Cryptographically Secure API Credential Storage
To ensure credentials cannot be leaked, compromised, or recovered, the system must enforce these requirements:
- **No Plaintext Storage**: API secret keys/credentials must never be stored in plaintext.
- **Secure Non-Recoverable Digests**: Credentials must only be stored as cryptographically secure, non-recoverable digests (e.g. salted hashes).
- **Secure Random Generation**: Original secrets must be generated from high-entropy, cryptographically secure pseudorandom number generators.
- **Zero-Exposure Validation**: Key validation must happen by comparing digests, without exposing the original secret or transmitting it insecurely.
- **Rotation and Revocation**: Schema and logic must support expiration timestamps, rotation grace periods, and immediate manual revocation flags.

### 4. Organization-Centric Hierarchy
- **Organization (`aan_organizations`)** represents the **legal customer and tenant boundary** (e.g., Microsoft, Google, Sony, Discord). It handles billing, administrative access, high-level policy limits, and master access.
- **Project (`aan_projects`)** represents an **environment, application, or deployment** (e.g., PlayStation Production, PlayStation Sandbox, PlayStation Internal) owned by an Organization. Projects represent technical scopes, not independent customers.
- **Rationale for mapping `partner_apps` to `aan_organizations`**:
  - Legacy `partner_apps` represented standalone partner accounts.
  - In a robust multi-tenant model, these partner accounts represent Organizations. An organization can spawn and manage multiple isolated projects (e.g. testing, staging, and production environments), each with different api credentials and webhook configurations.

### 5. Implementation Order
All feature development must proceed in a strict bottom-up engineering order:
$$\text{Database} \longrightarrow \text{Backend Services} \longrightarrow \text{API Layer} \longrightarrow \text{Frontend}$$
Do not build frontend features before the supporting backend infrastructure and schema exist.

### 6. Migration & Rollback Standards
Every database schema migration must be encapsulated in an independent, reviewable proposal containing:
- **Migration Name**
- **Purpose**
- **Affected Tables**
- **Affected Functions**
- **Affected Policies**
- **Affected Indexes**
- **Rollback Procedure** (Must be complete and non-destructive to existing data)
- **Validation Queries** (SQL queries to run post-migration to verify accuracy)
- **Expected Results**
- **Post-Migration Verification Checklist**

All migrations must prioritize:
- **Reliability**: Ensure transaction safety and high availability.
- **Maintainability**: Clear, readable SQL and documentation.
- **Scalability**: Proper indexes and partitioning configurations.
- **Security & Privacy**: Strict Row-Level Security (RLS) policies isolating tenant data.
- **Backward Compatibility**: Preserving legacy paths and tables so existing systems run without interruption.

---

## C. Existing Architecture Map

The current system relies on three tiers:
1. **Frontend (Vite / React 18 / Tailwind)**:
   - **User/Partner Portal**: Interactive dashboard, verification sessions inspector, policy editor, and developer credential keys generator.
   - **Admin Console**: Auditing ledgers, system health reports, identity verifications, and onboarding request tracking.
   - **Test Lab**: Sandbox interface simulating bot postures, hardware attestation, and ZK-proof generation.
2. **Server (Express v4 / tsx)**:
   - Proxies database interactions via `supabaseService.ts` and orchestrates Mock/Local AI engines (`aiEngine.ts` and `graphAnalysisEngine.ts`).
   - Serves mock REST endpoints for verification simulation.
3. **Database (PostgreSQL / Supabase)**:
   - Handles structured storage of user profiles, projects, API keys, and device fingerprints.
   - Leverages Row-Level Security (RLS) policies for row isolation.

### Conceptual Database Layer Mapping
```
[Legacy/Supporting Schema]            [Canonical Schema (Target of Truth)]
┌────────────────────────┐            ┌──────────────────────────────────┐
│  partner_apps          │ ─────────> │  aan_organizations               │
│  profiles              │ ─────────> │  aan_organization_members        │
│  projects              │ ─────────> │  aan_projects (Foundation)       │
│  api_keys              │ ─────────> │  aan_api_credentials             │
│  webhooks              │ ─────────> │  aan_webhook_endpoints           │
│  verification_sessions │ ─────────> │  aan_verification_sessions       │
│  aan_trust_events      │ ─────────> │  aan_trust_event_log             │
└────────────────────────┘            └──────────────────────────────────┘
```

---

## D. Canonical Components Already Present

The following database and application structures are already present in the codebase and must be preserved:

1. **`aan_projects`**: Currently implemented as the `public.projects` table in `supabase_schema.sql` (underlying structural columns exist but require syncing to the canonical namespace `aan_projects` without data loss).
2. **`aan_verification_sessions`**: Partially present as the `public.verification_sessions` table, containing partner linking keys, risk score metrics, device signatures, and ZK proof-token associations.
3. **`aan_policy_versions`**: The logical policy configuration is handled dynamically on the client via `PolicyTab.tsx` and saved into `trust_rules` (resembles policy limits).
4. **`aan_model_versions`**: Present in database as `zk_model_versions`, storing active ML models compiled into EZKL circuits, ONNX checksums, and proving/verification key signatures.
5. **`aan_trust_event_log`**: Structured database log representing evaluated humanness checks (`aan_trust_events` table).
6. **`aan_reconciliation_queue`**: Not yet defined in database but simulated in memory for immediate audit synchronization.
7. **Frontend Views**: 
   - `PartnerDashboard.tsx`, `AdminDashboard.tsx`, `ZKProofsTab.tsx`, `TrustGraphTab.tsx`. These files are fully complete, reactive, and visually premium. They are the pride of the frontend.

---

## E. Missing Canonical Components

The following components are currently missing or represented only by transient memory states, and will be added during future migration phases:

1. **`aan_organizations`**: Database table to isolate tenants, billing metrics, and administrative boundaries.
2. **`aan_organization_members`**: Schema mapping user IDs to organizations with granular roles (`owner`, `admin`, `developer`, `viewer`).
3. **`aan_project_members`**: Linker schema establishing project-level access controls for multi-developer workflows.
4. **`aan_api_credentials`**: Cryptographically secure API keys utilizing prefixing (e.g., `aan_live_...`) and dynamic digest protection.
5. **`aan_webhook_endpoints`**: Canonical endpoint registry for partner callback events.
6. **`aan_trust_decisions`**: Secure ledger storing the absolute, immutable outcome (`approved` / `review` / `denied`) of every assurance evaluation.
7. **`aan_reconciliation_queue`**: Physical table to queue, track, and re-process failed partner callbacks or out-of-sync proofs.
8. **Webhook Delivery Daemon**: Server-side agent to sign outgoing requests using HMAC-SHA256 and process retry intervals.

---

## F. Duplicate or Overlapping Components

We identified several schemas and controllers with overlapping responsibilities:

| Overlapping Component | Canonical Target | Conflict / Resolution Strategy |
| :--- | :--- | :--- |
| `partner_apps` | `aan_organizations` | `partner_apps` is legacy from early iterations. We will migrate active partners into `aan_organizations` and deprecate `partner_apps`. |
| `api_keys` | `aan_api_credentials` | The current `api_keys` table uses plain `publishable_key` and simple hash lookups. We will deploy `aan_api_credentials` as the secure replacement. |
| `webhooks` | `aan_webhook_endpoints` | The current `webhooks` table stores simple URLs. We will transition to `aan_webhook_endpoints` with advanced event subscription arrays. |
| `verification_events` | `aan_trust_event_log` | High overlap. We will standardize on a single unified trust event ledger mapping verification telemetry. |

---

## G. Legacy Components and Their Intended Replacements

To ensure continuity, legacy systems will be systematically routed to their canonical counterparts:

- **`partner_apps`** $\rightarrow$ Replaced by `aan_organizations`. Partner apps will be registered as tenant organizations, which can own multiple projects.
- **`public.api_keys`** $\rightarrow$ Replaced by `aan_api_credentials`. Legacy keys will remain active via a backward-compatibility API routing layer until Phase 1 verification is finalized.
- **`public.webhooks`** $\rightarrow$ Replaced by `aan_webhook_endpoints`.
- **Client-Side Storage Fallbacks**: Several components store temporary states in `localStorage` when offline. These will be synchronized with Supabase using real-time subscription handles.

---

## H. Security Findings

Our inspection of `supabase_schema.sql` and `server.ts` revealed the following priority items:

1. **RLS Policy Over-permissiveness**:
   - Several tables (e.g., `public.profiles`, `public.zk_proofs`, `public.risk_model_inputs`) utilize public insert/select permissions without validation. We must restrict these to `authenticated` or specific organization scopes.
2. **API Key Storage**:
   - Legacy keys are stored hashed, but the prefixing does not follow industry-standard practices. Canonical credentials will adopt `aan_live_` / `aan_test_` scopes with secure hash digests.
3. **Webhook Verification**:
   - The outgoing webhook system lacks cryptographically signed headers. We must enforce HMAC-SHA256 signature payloads using the secret configured in `aan_webhook_endpoints`.

---

## I. Frontend and Backend Dependency Findings

- **Frontend Navigation**: Views query standard REST endpoints (e.g., `/api/api-keys`, `/api/verification-sessions`). Introducing canonical tables requires matching API router endpoints to ensure zero downtime.
- **State Hydration**: UI dashboards bind data directly to variables fetched on mount. We must ensure schema modifications update corresponding field properties in `src/types.ts` to prevent TypeScript compilation errors.
- **Mock Interfaces**: The Test Lab uses local worker simulations. These mock environments must remain functional and be backed by optional mock database modes when cloud connections are unavailable.

---

## J. Migration Risks

1. **Data Loss on Projects / Keys**:
   - Existing users have created active sandboxes. Overwriting `projects` or `api_keys` will break developer workflows. 
   - *Mitigation*: We will write backward-compatible migration files that copy data from legacy tables to canonical ones, keeping both active during a transition period.
2. **TypeScript Type Compilation Breakers**:
   - Large interfaces are shared globally.
   - *Mitigation*: Type extensions will be declared early in `/src/types.ts` with optional markers (`?`) to ensure uninterrupted builds.

---

## K. Recommended Build Sequence

The migration is divided into four distinct phases:

```
┌────────────────────────────────────────────────────────┐
│  PHASE 1: Partner Architecture (Current Focus)          │
│  - Establish organizations, api credentials, webhooks  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 2: Trust & Policy Engine                        │
│  - Define policy version tables and rules evaluation  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 3: Zero-Knowledge & Verification Core           │
│  - Link zk_proofs to canonical sessions & logs         │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 4: Real-time Analytics & Reconciliation         │
│  - Active queue processing and webhook delivery        │
└────────────────────────────────────────────────────────┘
```

---

## L. Phase 1 Affected Files & Database Objects

Phase 1 focuses exclusively on **Partner Architecture**, establishing the solid base required to run organizational workflows.

### 1. Database Objects Created/Modified
- **`aan_organizations`** (New Table): High-security isolation unit.
- **`aan_organization_members`** (New Table): Linking table mapping users to organizations with roles.
- **`aan_projects`** (Modified Column / View): Link projects to `aan_organizations` instead of legacy `organizations`.
- **`aan_api_credentials`** (New Table): Replaces `api_keys` with secure key lookups.
- **`aan_webhook_endpoints`** (New Table): Replaces `webhooks` with advanced callback configuration.
- **`aan_trust_decisions`** (New Table): Immutable audit record of attestation results.
- **RLS Security Policies**: Deploy robust, verified policies for all newly created tables.

### 2. Frontend & Backend Files Modified
- **`src/types.ts`**: Update schemas to match newly introduced canonical types.
- **`src/lib/supabaseService.ts`**: Inject canonical client methods for fetching organization-aware details.
- **`server.ts`**: Set up secure backend routes to manage organizational scopes and sign webhook notifications.

---

# Proposing Phase 1 Only

We propose proceeding immediately with **Phase 1: Partner Architecture**. This phase will create a secure administrative foundation without interrupting any existing client-side systems.

### Proposed Milestones:
1. **Milestone 1.1: Database Provisioning**
   - Execute the schema migrations to establish `aan_organizations`, `aan_organization_members`, `aan_api_credentials`, `aan_webhook_endpoints`, and `aan_trust_decisions`.
2. **Milestone 1.2: RLS Policies Deployment**
   - Apply highly restricted policies to ensure that organization members can only access credentials, logs, and projects within their authorized organizational scope.
3. **Milestone 1.3: Service Layer Integration**
   - Refactor `/src/lib/supabaseService.ts` and `/server.ts` to seamlessly populate the premium Partner Console with canonical data records.

**Please review and approve this audit and Roadmap to initiate Milestone 1 of the Partner Architecture.**
