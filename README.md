# AAN Platform

Privacy-preserving trust verification infrastructure.

> **⚠️ MOCK sandboxed sandbox DISCLAIMER**
> This repository contains the AAN Platform MVP. Anywhere verification, identity matching, trust tokens, risk scoring, device trust, or duplicate detection is mocked, it is simulated. 
> *“MOCK IMPLEMENTATION — Replace with certified identity, fraud, and security providers before production use.”*
>
> In this MVP:
> - Raw personal or physical device secrets are never stored.
> - Perfect fraud prevention or legally binding compliant verification is not claimed.
> - High-security production cryptographic signing must be connected to certified HSM providers.

## Why AAN Exists

Modern digital platforms face an escalating battle against automated bots, sybil attacks, and multi-account fraud. Existing verification solutions force a false choice: either ask users for intrusive government documents and personal data, or accept widespread platform exploitation.

AAN exists to solve this dilemma. It helps platforms prove that an access attempt is legitimate and unique, without collecting, storing, or exposing raw personal identifiers, device secrets, or real-world credentials.

AAN evaluates the trustworthiness of an access attempt using privacy-preserving system signals while minimizing the collection of personal information. AAN does not identify who a person is. It helps determine whether an access attempt appears legitimate, duplicated, automated, or suspicious.

We are building a trust layer for the internet that respects personal privacy by design.

---

## How AAN Works

AAN is designed as an API-first verification platform. The verification cycle consists of three phases:

1. **Session Instantiation**: A partner application initiates a verification session via the API. This returns a temporary, secure verification checkout URL.
2. **User Verification**: The user visits the verification URL, provides explicit consent, and performs an ephemeral trust handshake (evaluating session integrity, request parameters, and request consistency) in their browser without requiring camera access.
3. **Proof Delivery**: AAN processes the session, encrypts the anonymized system signal commitments, runs risk checks, and generates a cryptographically signed proof token. Any temporary session context is permanently deleted from memory immediately.

---

## What AAN Returns

AAN never shares raw personal information, device secrets, internal trust calculations, or private system signals with partner applications. Instead, the partner receives only a signed proof token containing clean, pseudonymous assertions:

- **is_verified**: Verifies that the access attempt has successfully passed all session and integrity checks.
- **is_unique**: Verifies that the access footprint does not match any duplicate or suspicious patterns in the enrolled ledger.
- **risk_score**: A clean anomaly index reflecting device or session-level fraud flags.
- **reason_codes**: Optional machine-readable codes detailing detected anomalies without revealing raw signals.

---

## Core Features

- **Decoupled Trust Signals**: Ephemeral verification without central storage of private identifiers, device credentials, or personal information.
- **Risk Scoring Engine**: Real-time validation of signals, including hardware signatures, device consistency metrics, session timeouts, and duplicate check collisions.
- **Interactive Developer Console**: A complete web interface allowing developers to manage API endpoints, trigger webhooks, query database records, and run trial sessions statefully in a sandboxed environment.
- **Sovereign Brand Manual**: An integrated manual containing visual design tokens, design principles, and developer integration frameworks.

---

## Architecture Overview

AAN uses a modern full-stack web architecture. 

During development, an Express backend serves API requests and integrates with Vite middleware to render an interactive React front-end. In production, the server is compiled into a single self-contained executable to ensure maximum performance and reliable cold-start response times.

---

## Data Model

AAN relies on core database tables that map clean relationships without exposing private information:

- **Users**: Tracks high-level verification status (pending, verified, rejected, suspended) tied to an immutable, cryptographically anonymized unique commitment identifier.
- **Verification Signatures**: Stores encrypted high-dimensional numerical signals to prevent duplicate registrations, with no private or personal data preserved.
- **Devices**: Records secure browser consistency markers to flag multi-account attacks on a single machine.
- **Partner Apps**: Authorizes external applications. API keys are hashed with SHA-256 immediately upon creation.
- **Partner User Links**: Provides isolated, app-specific identifiers for users to shield them from cross-app tracking.
- **Verification Sessions**: Manages individual session lifecycles, capturing real-time risk factors and computing intermediate status flags.
- **Audit Logs**: An immutable, write-only system ledger recording validation events and changes in system settings.

---

## API Overview

The AAN API exposes endpoints to programmatically manage the verification lifecycle:

### Create Session
`POST /api/v1/verification-sessions`  
Creates a unique session and returns an interactive verification checkout URL.

### Submit Trust Signals
`POST /api/v1/verification-sessions/:id/signals`  
Processes ephemeral integrity parameters and device consistency signals.

### Retrieve Session Results
`GET /api/v1/verification-sessions/:id`  
Returns verification status, computed risk indicators, and the signed proof token.

### Verify Signed Proof
`POST /api/v1/proofs/verify`  
Validates the structural integrity and expiration of a cryptographic claim token received from a client.

*Detailed payload formats and interactive trials are available inside the developer dashboard portal.*

---

## Project Structure

- `server.ts` - Core full-stack Express server and database mock states.
- `supabase_schema.sql` - Production database schemas, indexes, and row-level security (RLS) rules.
- `src/types.ts` - Shared domain objects, session states, and audit models.
- `src/App.tsx` - Main single-page router and user interface role controller.
- `src/components/` - Focused frontend components split by active systems:
  - `LandingPage.tsx` - Public enterprise product positioning.
  - `VerifySessionFlow.tsx` - Ephemeral trust check UI.
  - `PartnerDashboard.tsx` - Sandbox API keys generator and webhook loggers.
  - `AdminDashboard.tsx` - Administrative system ledger and audit overrides.
  - `BrandBook.tsx` - Core visual tokens and brand guidebooks.

---

## Getting Started

### Requirements
- Node.js (v18 or higher)
- npm

### Install
Clone the repository and install dependencies:
```bash
npm install
```

### Development
Start the Express API gateway and the automatic rebuilding Vite dashboard on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
Compile the React application and bundle the Express server into a production-optimized package:
```bash
npm run build
```

Run the compiled production server:
```bash
npm run start
```

---

## Licensing

This repository contains proprietary software owned by AAN. Unless explicitly stated otherwise, no portion of this repository is licensed for public reuse.
