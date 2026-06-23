# AAN

Privacy-preserving proof-of-human identity infrastructure.

## Why AAN Exists

Modern digital platforms face an escalating battle against automated bots, sybil attacks, and multi-account fraud. Existing verification solutions force a false choice: either ask users for intrusive government documents, or accept widespread platform exploitation.

AAN exists to solve this dilemma. It helps platforms prove that an account is managed by a unique, real human, without collecting, storing, or exposing their raw biometric data or real-world credentials.

We are building a trust layer for the internet that respects personal privacy by design.

---

## How AAN Works

AAN is designed as an API-first verification platform. The verification cycle consists of three phases:

1. **Session Instantiation**: A partner application initiates a verification session via the API. This returns a temporary, secure verification checkout URL.
2. **User Verification**: The user visits the verification URL, provides explicit consent, and performs an ephemeral biometric check (such as a 3D liveness and face template generation) in their browser.
3. **Proof Delivery**: AAN processes the session, encrypts the high-dimensional biometric template, runs risk checks, and generates a cryptographically signed proof token. The raw media is permanently deleted from memory immediately.

---

## What AAN Returns

AAN never shares raw biometric representations, government IDs, facial templates, or hardware records with partner applications. Instead, the partner receives only a signed proof token containing clean, pseudonymous assertions:

- **is_real_human**: Verifies that the user has successfully passed a 3D liveness check.
- **is_unique_human**: Verifies that the user's biometric footprint does not match any existing enrolled ledger.
- **is_same_person**: Confirms that a returning user matches the same identity registered previously.
- **risk_score**: A clean anomaly index reflecting device or session-level fraud flags.

---

## Core Features

- **Decoupled Biometric Geometry**: Ephemeral template generation without central storage of raw face geometry, screen captures, or images.
- **Risk Scoring Engine**: Real-time validation of signals, including hardware signatures, device fingerprint associations, liveness tokens, session timeouts, and template collisions.
- **Interactive Developer Console**: A complete web interface allowing developers to manage API endpoints, trigger webhooks, query database records, and run trial sessions statefully in a sandboxed environment.
- **Sovereign Brand Manual**: An integrated manual containing visual design tokens, design principles, and developer integration frameworks.

---

## Architecture Overview

AAN uses a modern full-stack web architecture. 

During development, an Express backend serves API requests and integrates with Vite middleware to render an interactive React front-end. In production, the server is compiled into a single self-contained executable to ensure maximum performance and reliable cold-start response times.

---

## Data Model

AAN relies on seven core database tables that map clean relationships without exposing private information:

- **Users**: Tracks high-level pseudonym status (pending, verified, rejected, suspended) tied to an immutable, cryptographically anonymized human identifier.
- **Biometric Templates**: Stores encrypted high-dimensional numerical embeddings to prevent duplicate registrations, with no raw image data preserved.
- **Devices**: Records hardware-locked browser fingerprints to flag multi-account attacks on a single machine.
- **Partner Apps**: Authorizes external applications. API keys are hashed with SHA-256 immediately upon creation.
- **Partner User Links**: Provides isolated, app-specific identifiers for users to shield them from cross-app tracking.
- **Verification Sessions**: Manages individual session lifecycles, capturing real-time risk factors and computing intermediate status flags.
- **Audit Logs**: An immutable, write-only system ledger recording validation events and changes in system settings.

---

## API Overview

The AAN API exposes four main endpoints to programmatically manage the verification lifecycle:

### Create Session
`POST /api/v1/verification-sessions`  
Creates a unique session and returns an interactive verification checkout URL.

### Submit Biometric Results
`POST /api/v1/verification-sessions/:id/biometric`  
Processes ephemeral 3D liveness tokens and client device fingerprints.

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
  - `VerifySessionFlow.tsx` - Ephemeral video liveness scanner UI.
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

## Roadmap

- **FIDO2 / WebAuthn Ledger**: Tie unique user identifiers directly to hardware security keys for stronger returning human guarantees.
- **Zero-Knowledge Proofs**: Utilize advanced zero-knowledge techniques so partner applications can verify assertions without querying AAN servers.
- **Plug-and-Play UI Widgets**: Pre-built web components and mobile SDKs to integrate verification checks into registration flows within minutes.

---

## License

AAN is licensed under the MIT License. See individual code headers for detail.
