# AAN Platform
### Trust Infrastructure for the Internet

Privacy-preserving trust infrastructure that helps online platforms reduce bots, duplicate accounts, and suspicious activity while minimizing the collection of personal information.

---

## The AAN Stack

```
AAN Platform

┌──────────────────────────┐
│ AAN Command              │
│ Conversational Operations│
└────────────▲─────────────┘
             │
┌────────────┴─────────────┐
│ Trust Engine             │
│ Risk • Policy • Proofs   │
└────────────▲─────────────┘
             │
┌────────────┴─────────────┐
│ Verification Layer       │
│ Sessions • Signals       │
└────────────▲─────────────┘
             │
┌────────────┴─────────────┐
│ APIs • SDKs • Webhooks   │
└────────────▲─────────────┘
             │
      Partner Platforms
```

---

> ### ⚠️ MVP Developer Disclaimer
> This repository contains the AAN Platform MVP. Several verification components, biometric template matches, and hardware profile evaluations are simulated. Production deployments require certified identity, fraud, security, and cryptographic providers. This MVP is intended for demonstration and is not certified for production use.

---

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

## AAN Command

AAN Command is the operational interface for the AAN Trust Engine.

It enables authorized platform operators to investigate, understand, and manage trust events using natural language while preserving deterministic enforcement, privacy, and complete auditability.

Every response is generated from verifiable trust evidence—not assumptions.

### What You Can Ask

#### Investigate
- Why was this verification denied?
- Explain this trust score.
- Show the evidence behind this decision.

#### Observe
- Show today's high-risk verification sessions.
- Which partner is experiencing the highest bot activity?
- Compare this week's trust metrics with last week.

#### Report
- Generate a trust report for this project.
- Summarize suspicious activity over the last 30 days.
- Export verification statistics.

#### Recommend
- Recommend a policy to reduce ban evasion.
- Identify unusual verification patterns.
- Suggest improvements based on recent activity.

#### Simulate
- What happens if the minimum trust score becomes 85?
- Simulate a stricter verification policy before deployment.

#### Audit
- Who modified this policy?
- Show every administrative action for this project.
- Explain why this decision was made.

### Operating Principles

- AI never becomes the source of truth.
- The AAN Trust Engine always makes the final trust decision.
- Every recommendation is evidence-based.
- Every administrative action is logged.
- Every decision is explainable.
- Every policy change remains reviewable before execution.
- Sensitive raw signals are never exposed through conversational responses.
- Access is enforced through project membership and role-based authorization.

AAN Command is not another chatbot.

It is the conversational operating system for trust infrastructure.

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
