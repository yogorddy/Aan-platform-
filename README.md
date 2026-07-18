# AAN Platform

Privacy-preserving trust infrastructure that helps online platforms reduce bots, duplicate accounts, and suspicious activity while minimizing the collection of personal information.

---

> ### ⚠️ MVP Developer Disclaimer
> This repository contains the AAN Platform MVP. Several verification components, biometric template matches, and hardware profile evaluations are simulated. Production deployments require certified identity, fraud, security, and cryptographic providers. This MVP is intended for demonstration and is not certified for production use.

---
---

## AAN Intelligence Layer

AAN is being designed with an AI-native operations layer that allows authorized platform teams to investigate trust activity and manage the system through natural language.

Instead of navigating through multiple dashboards, an authorized operator could ask:

* **“Why was this verification denied?”**
* **“Show every high-risk session from today.”**
* **“Which project has the highest rate of suspicious activity?”**
* **“Summarize the evidence behind this trust decision.”**
* **“Draft a stricter policy for newly created accounts.”**
* **“Generate a trust report for this partner project.”**

The intelligence layer will operate on top of AAN's existing trust events, policies, audit records, reason codes, and signed decisions. It does not replace the deterministic trust engine, partner controls, or human review.

### Operating Boundaries

* Read access is restricted by project membership and role-based authorization.
* Sensitive raw signals are not exposed through natural-language responses.
* Every proposed policy or infrastructure change remains reviewable before execution.
* Every accepted action is written to the audit ledger.
* Generated explanations must reference the underlying trust evidence and reason codes.
* The AI layer cannot silently override a signed trust decision.

This creates a conversational control surface for trust infrastructure while preserving deterministic enforcement, evidence-backed decisions, and administrative accountability.

## Why AAN Exists

Digital platforms face a continuous battle against automated bots, multi-account fraud, and Sybil attacks. Traditional identity verification tools often force platforms to choose between high user friction—such as collecting government IDs or intrusive personal data—and accepting high exploitation rates.

AAN provides a middle ground. It enables applications to verify that a request is completed by a real, unique human without storing or exposing raw personal identifiers, device credentials, or real-world documents. By evaluating trust signals in a privacy-preserving manner, AAN confirms legitimacy and uniqueness without determining who a user is in the physical world.

---

## How It Works

AAN integrates with partner platforms using a straightforward four-step verification cycle:

1. **Session Initialization**: The partner backend initiates a verification session via the API and receives a secure, temporary session ID and verification checkout URL.
2. **User Completion**: The user completes an ephemeral trust and posture check through the AAN web module with explicit consent.
3. **Trust Evaluation**: AAN's risk engine analyzes device-level markers, rate profiles, and template hashes to calculate risk scores.
4. **Signed Proof Delivery**: AAN issues a cryptographically signed proof token containing verification assertions. The partner backend validates this token before granting access.

---

## Verification Assertions

AAN does not share raw biometric templates, physical hardware markers, or telemetry logs with partner applications. Instead, verification queries return clean, standardized assertions:

* **Verified**: Confirms that the session successfully passed all posture, timing, and security checks.
* **Unique**: Confirms that the computed signature template does not match an existing record in the ledger.
* **Risk Score**: A clean index (0 to 100) detailing the likelihood of automated or suspicious activity.
* **Reason Codes**: Standardized, machine-readable anomaly flags explaining the risk score without exposing raw metadata.

---

## Core Capabilities

* **Privacy-Conscious Posture Checks**: Verify session integrity without storing permanent browser fingerprints or personal information.
* **Duplicate Account Protection**: Prevent Sybil accounts by checking cryptographic hashes of user signature templates against a secure ledger.
* **Heuristic Risk Engine**: Evaluates session timing anomalies, device count limits, rapid repeated attempts, and network properties.
* **Interactive Developer Portal**: A self-serve interface for managing API keys, testing webhook payloads, and simulating trial integration sessions.
* **Audit Logging**: An immutable, write-only system ledger tracking all administrative actions and security events.

---

## System Architecture

AAN is built on a modern full-stack architecture:

* **Frontend**: Single-page React application styled with Tailwind CSS, utilizing `lucide-react` for iconography and `motion` for secure UI state transitions.
* **Backend**: Express API gateway providing public developer endpoints, serving assets, and orchestrating mock databases and in-memory states.
* **Database Schema**: A relational structure designed for transactional consistency, device profiling, and audit immutability.

---

## Database Model

AAN utilizes a clean relational database layout designed to prevent cross-app tracking:

* `users`: Tracks high-level human status (pending, verified, suspended, or rejected).
* `biometric_templates` (represented as `signature_templates`): Stores securely encrypted mathematical hashes used to detect duplicates.
* `devices`: Records secure browser characteristics to flag multi-account attacks on a single machine.
* `partner_apps`: Stores registered partner configurations and hashed API secrets.
* `partner_user_links`: Bridges a partner application's custom user ID to AAN's internal identifier, protecting users from cross-application tracking.
* `verification_sessions`: Records individual session lifecycles, timing, IP contexts, and computed risk factors.
* `audit_logs`: An immutable write-only system ledger documenting validation events and system updates.

---

## Core API Endpoints

### Create Session
`POST /api/v1/verification-sessions`  
Creates a unique session and returns a secure verification checkout URL.

### Retrieve Session Details
`GET /api/v1/verification-sessions/:id`  
Returns the session's verification status, computed risk score, and signed proof token.

### Submit Posture Signals
`POST /api/v1/verification-sessions/:id/signature`  
Processes ephemeral browser parameters and anonymized user posture signatures.

### Verify Signed Proof
`POST /api/v1/proofs/verify`  
Validates the structural integrity, signature, and expiration of an issued proof token.

---

## Project Structure

* `server.ts` - Main Express backend server, API gateway, and state controllers.
* `src/main.tsx` - Main entry point for the React application.
* `src/App.tsx` - Single-page router, portal navigation, and layout managers.
* `src/components/` - Key UI modules:
  * `LandingPage.tsx` - Public enterprise product positioning and overview.
  * `VerifySessionFlow.tsx` - User-facing posture check and consent flow.
  * `PartnerDashboard.tsx` - API key manager, session logs, and webhook simulator.
  * `AdminDashboard.tsx` - System audit log and administrative account reviewer.
  * `DeveloperPortalTab.tsx` - Sandbox playground and multi-language SDK references.
* `src/types.ts` - Shared domain objects, API payload shapes, and session models.
* `supabase_schema.sql` - Supabase database structures, indexing, and Row-Level Security (RLS) rules.

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Running the Application
Start the application in development mode:
```bash
npm run dev
```
The application will run on [http://localhost:3000](http://localhost:3000).

### Production Build
To build the static assets and bundle the server:
```bash
npm run build
```

To run the compiled production bundle:
```bash
npm run start
```

---

## Licensing

This repository contains proprietary software owned by AAN. Unless explicitly stated otherwise, no portion of this project is licensed for public reuse or distribution.
