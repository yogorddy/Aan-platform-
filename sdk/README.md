# AAN Developer SDKs & Client Libraries

This directory is reserved for developer integrations, client-side wrappers, and integration libraries. 

## Future Licensing Architecture

While the core AAN verification backend, admin dashboards, security scoring engines, and database designs remain strictly proprietary under the **AAN Proprietary License** (see `/LICENSE.md`), individual files and directories inside this `/sdk` workspace may be designated for public release under separate open-source licenses (e.g., MIT or Apache-2.0) in future releases.

### Architectural Separation of Concerns:

1. **Proprietary Core (Closed Source)**:
   - `/server.ts` (Core backend orchestration & state transition verification)
   - `/src/components/AdminDashboard.tsx` & `PartnerDashboard.tsx` (Administrative platforms)
   - `/src/lib/supabaseService.ts` & `/supabase_schema.sql` (Internal threat registries & persistence)
   - `/src/components/VerifySessionFlow.tsx` (Core trust verification session workflow)

2. **Extensible SDK / Client Layer (Open Source Candidates)**:
   - Client-side browser wrappers (to trigger embeddable AAN checkouts)
   - Server-side API clients (e.g., Node.js, Python, Go clients to instantiate sessions securely)
   - Mobile platform bridges (for secure cross-app handovers)

Each candidate SDK subfolder will contain its own distinct open-source LICENSE and configuration when published.
