# AAN—Privacy-Preserving Proof-of-Human Identity API & Brand System MVP

A production-ready technology infrastructure MVP designed to help digital platforms verify unique real human identity and mitigate bots, duplicate accounts, sybil attacks, and identity fraud—without exposing raw face geometry, files, or sensitive credentials.

---

## Product Positioning & Non-Negotiable Rules

*   **Human Unique Infrastructure:** AAN helps digital channels run simple liveness tests and multi-account blocklist checks securely.
*   **Decoupled Biometric Geometry:** We *NEVER* save camera streams, screen captures, SSNs, or driver's license files.
*   **Pseudonymous Claims Matrix:** Recipient partner applications obtain only signed proof assertion tokens (`valid: true, claims: { human_verified: true, unique_human: true }`), never credentials.
*   **Developer Playground Included:** Features a functional, interactive frontend API console. Change attributes to test and execute actual HTTP queries statefully inside the sandboxed dev environment.
*   **13-Chapter Interactive Brand Manual:** Comprehensive corporate foundation guides, visuals index, design tokens, and target user segments mapped natively inside the dashboard.

---

## Micro-Architecture Overview

The codebase is engineered with high modularity and clean architectural guidelines:

```
├── /
│   ├── server.ts                 # Main full-stack Express API gateway & database mock states
│   ├── supabase_schema.sql       # PostgreSQL migrations, indices, and RLS constraint rules
│   ├── src/
│   │   ├── types.ts              # Domain types for sessions, devices, and audit records
│   │   ├── App.tsx               # SPA controller containing the interactive role switcher
│   │   ├── main.tsx              # React entry point
│   │   ├── index.css             # Global Tailwind configurations
│   │   └── components/
│   │       ├── LandingPage.tsx   # Enterprise landing page detailing zero-knowledge bounds
│   │       ├── VerifySessionFlow.tsx  # Consent form, video canvas scanner, and mock telemetry
│   │       ├── PartnerDashboard.tsx   # Logs, API credentials generation engine, and Sandbox Playground
│   │       ├── AdminDashboard.tsx     # Overrides, user status controls, and ledger audit trails
│   │       └── BrandBook.tsx          # 13-Chapter interactive Brand Identity system and guidelines
```

---

## Database & Relational Layout (Supabase-Postgres Ready)

The file `/supabase_schema.sql` at the root contains production table schema script queries. The architecture models:

1.  **`users`**: High-level identity validations. Tracks pseudonym `status` (`pending`, `verified`, `rejected`, `suspended`) mapped to an immutable cryptographic one-way commitment `human_uid`.
2.  **`biometric_templates`**: Saves encrypted multi-dimensional numerical embeddings (`encrypted_template`) associated with a direct index string `template_hash`.
3.  **`devices`**: Links client browser configurations (`device_fingerprint_hash`) and hardware-locked signing keys (`device_public_key`) inside multi-account fraud rules.
4.  **`partner_apps`**: Authorizes client credentials. API Keys are hashed immediately upon creation (`api_key_hash`) using SHA-256 for secure gateway validations.
5.  **`partner_user_links`**: Maps partner platform external identifiers (`external_user_id`) to isolated individual credentials, shielding users from cross-app tracking.
6.  **`verification_sessions`**: Follows individual validation lifecycles (`started`, `passed`, `failed`, `review`). Consolidates anomaly grades.
7.  **`audit_logs`**: Write-once structural ledgers tracking system indicators, validations, and administrator overrides.

---

## Real-Time Multi-Signal Risk Scoring

Our automated risk scoring model assesses 8 specific triggers (0 to 100):

*   `missing_consent` (+100) — Terminate verification immediately due to lack of regulatory clearance.
*   `failed_liveness` (+85) — Flagged facial spoof vectors, dynamic screen replays, or printed-photos.
*   `duplicate_biometric_template_hash` (+90) — Multiple user accounts matching a single enrolled facial footprint (Sybil protection).
*   `many_accounts_on_one_device` (+75) — Hard block triggered by registration of multiple credentials on a single hardware browser ID.
*   `new_device_on_existing_user` (+40) — Warning flag signaling an account logging on from an unrecognized hardware device.
*   `rapid_repeated_attempts` (+50) — Triggers velocity-throttle rate restrictions on spam behaviors.
*   `expired_session` (+60) — Session validation exceeds a 15-minute timeout window.

---

## REST API Specifications

The MVP server exposes full compliance endpoints:

### 1. Create Verification Session
`POST /api/v1/verification-sessions`
*   Creates an ephemeral validation checkout link. Include `x-api-key` header to identify partner accounts.
*   **Payload:**
    ```json
    {
      "external_user_id": "app_user_123",
      "verification_level": "human_unique"
    }
    ```
*   **Response:**
    ```json
    {
      "session_id": "vss_session_a17c2f",
      "verification_url": "/verify/session/vss_session_a17c2f",
      "expires_at": "2026-06-18T02:15:00.000Z"
    }
    ```

### 2. Submit Biometric Outcomes (AuraProof Mock Scanner Linkage)
`POST /api/v1/verification-sessions/:id/biometric`
*   Evaluates uploading mock liveness checks, hardware public keys, and device hashes.
*   **Payload:**
    ```json
    {
      "liveness_token": "liveness_passed_token",
      "face_embedding": "bio_hash_generated_a93f",
      "device_public_key": "-----BEGIN PUBLIC KEY-----\nMIIBI...",
      "device_fingerprint_hash": "fp_client_hash_20cf"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "processing"
    }
    ```

### 3. Retrieve Session Verification Results
`GET /api/v1/verification-sessions/:id`
*   Returns calculated outcomes, anomaly scores, warning factors list, and signed proof tokens.
*   **Response:**
    ```json
    {
      "session_id": "vss_session_a17c2f",
      "status": "passed",
      "result": {
        "is_real_human": true,
        "is_unique_human": true,
        "is_same_person": true,
        "risk_score": 10,
        "risk_reasons": []
      },
      "proof_token": "proof_claims_a17_sig_830ffba"
    }
    ```

### 4. Verify Signed Proof Token
`POST /api/v1/proofs/verify`
*   Third party endpoint verifying integrity of tokens received in OAuth/registration flows.
*   **Payload:**
    ```json
    {
      "proof_token": "proof_claims_a17_sig_830ffba"
    }
    ```
*   **Response:**
    ```json
    {
      "valid": true,
      "claims": {
        "human_verified": true,
        "unique_human": true,
        "issued_at": "2026-06-18T02:05:00.000Z",
        "expires_at": "2026-07-18T02:05:00.000Z"
      }
    }
    ```

---

## Local Setup & Development Instructions

### Prerequisite Dependencies
Make sure Node.js (v18+) is active.

### 1. Install Dependencies
```bash
npm install
```

### 2. Enter Development Mode
Runs the backend Express API alongside Vite middleware on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

### 3. Build & Package for Production
Compiles frontend static files to `dist/` and bundles server TypeScript logic into a clean CommonJS file (`dist/server.cjs`):
```bash
npm run build
```

### 4. Launch Production Server
```bash
npm run start
```
