import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { 
  VerificationSession, 
  AuditLog, 
  SecurityEvent, 
  PartnerApp,
  SecurityReport,
  IntegrationRequest,
  IntegrationRequestStatusHistory
} from "../types";

// ============================================================================
// AAN PLATFORM — PRIVACY-PRESERVING IDENTITY DB REPOSITORY LAYER
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: SupabaseClient | null = null;
let isConfigured = false;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConfigured = true;
    console.log("[AAN INFRASTRUCTURE] Database Status: SECURE REMOTE SUPABASE DB CONNECTED (Service-Role Client Initialized)");
  } catch (err: any) {
    console.warn("[AAN INFRASTRUCTURE] Failed to initialize Supabase client (using local state fallback):", err.message || err);
  }
} else {
  console.log(
    "[AAN INFRASTRUCTURE] DEVELOPMENT-ONLY FALLBACK: Remote Supabase database is not configured. " +
    "Simulating all active database transactions and RLS in-memory. " +
    "To connect a live cloud database, configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY inside .env"
  );
}

function getDeterministicUUID(str: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(15, 18)}-${hash.slice(18, 30)}`;
}

export function isSupabaseConnected(): boolean {
  return isConfigured;
}


export function disableRemoteDatabase(): void {
  isConfigured = false;
}

/**
 * Centralized DB Error and Table Missing handler to guarantee graceful fallback
 */
function handleDbError(error: any, operationName: string) {
  const msg = error.message || "";
  if (
    msg.includes("relation") || 
    msg.includes("table") || 
    msg.includes("schema cache") || 
    msg.includes("does not exist") || 
    msg.includes("not found")
  ) {
    console.warn(`[AAN DB NOTICE] Required table or relation is missing in remote database during "${operationName}": "${msg}".`);
    console.warn("[AAN DB NOTICE] Switching AAN Platform to offline sandbox memory mode. Please run supabase_schema.sql in your Supabase SQL Editor to link remote tables.");
    isConfigured = false; // Gracefully switch to memory state to prevent continuous error logging
  } else {
    console.warn(`[AAN DB GRACEFUL FALLBACK] Failed during ${operationName}:`, msg);
  }
}

/**
 * Service/Repository layer wrapping data access for AAN Identity Platform.
 * If Supabase variables are set, writes and reads from Postgres tables.
 * Otherwise, routes to local memory state fallback (passed in or resolved).
 */
export const supabaseService = {
  
  /**
   * 1. CREATE VERIFICATION SESSION
   */
  async createVerificationSession(
    session: VerificationSession,
    localStore: VerificationSession[]
  ): Promise<VerificationSession> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] INSERT verification_session ${session.id} to Supabase`);
      const { data, error } = await supabase
        .from("verification_sessions")
        .insert({
          id: session.id,
          partner_app_id: session.partner_app_id,
          external_user_id: session.external_user_id,
          status: session.status,
          risk_score: session.risk_score,
          duplicate_candidate: session.duplicate_candidate,
          result_reason: session.result_reason,
          risk_reasons: session.risk_reasons,
          proof_token: session.proof_token,
          created_at: session.created_at,
          completed_at: session.completed_at
        })
        .select()
        .single();

      if (error) {
        handleDbError(error, "createVerificationSession");
        localStore.unshift(session);
        return session;
      }
      return data as VerificationSession;
    } else {
      // Local development fallback
      localStore.unshift(session);
      return session;
    }
  },

  /**
   * 2. UPDATE VERIFICATION SESSION STATUS
   */
  async updateVerificationSession(
    sessionId: string,
    updates: Partial<VerificationSession>,
    localStore: VerificationSession[]
  ): Promise<VerificationSession | null> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] UPDATE verification_session ${sessionId} in Supabase`);
      const { data, error } = await supabase
        .from("verification_sessions")
        .update({
          ...updates,
          completed_at: updates.completed_at || (updates.status === "passed" || updates.status === "failed" ? new Date().toISOString() : null)
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        handleDbError(error, "updateVerificationSession");
        return fallbackUpdate(sessionId, updates, localStore);
      }
      return data as VerificationSession;
    } else {
      return fallbackUpdate(sessionId, updates, localStore);
    }
  },

  /**
   * 3. RECORD AUDIT EVENT
   */
  async recordAuditEvent(
    log: AuditLog,
    localStore: AuditLog[]
  ): Promise<AuditLog> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] APPEND audit_log event: ${log.action}`);
      const { data, error } = await supabase
        .from("audit_logs")
        .insert({
          id: log.id,
          actor_type: log.actor_type,
          actor_id: log.actor_id,
          action: log.action,
          target_type: log.target_type,
          target_id: log.target_id,
          metadata: log.metadata,
          created_at: log.created_at
        })
        .select()
        .single();

      if (error) {
        handleDbError(error, "recordAuditEvent");
        localStore.unshift(log);
        return log;
      }
      return data as AuditLog;
    } else {
      localStore.unshift(log);
      return log;
    }
  },

  /**
   * 4. RECORD SECURITY SIGNAL / BYPASS DETECTOR / INTRUSION ATTEMPT
   */
  async recordSecurityEvent(
    event: SecurityEvent,
    localStore: SecurityEvent[]
  ): Promise<SecurityEvent> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] APPEND security_event: ${event.event_type} (${event.severity})`);
      const { data, error } = await supabase
        .from("security_events")
        .insert({
          id: event.id,
          severity: event.severity,
          event_type: event.event_type,
          actor_type: event.actor_type,
          actor_id: event.actor_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          session_id: event.session_id,
          partner_app_id: event.partner_app_id,
          request_path: event.request_path,
          detection_reason: event.detection_reason,
          raw_metadata: event.raw_metadata,
          created_at: event.created_at
        })
        .select()
        .single();

      if (error) {
        handleDbError(error, "recordSecurityEvent");
        localStore.unshift(event);
        return event;
      }
      return data as SecurityEvent;
    } else {
      localStore.unshift(event);
      return event;
    }
  },

  /**
   * 5. MANAGE PARTNER APPS / PROJECTS & KEYS
   */
  async savePartnerApp(
    partnerApp: PartnerApp,
    localStore: PartnerApp[]
  ): Promise<PartnerApp> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] UPSERT partner_app project in Supabase`);
      const { data, error } = await supabase
        .from("partner_apps")
        .upsert({
          id: partnerApp.id,
          name: partnerApp.name,
          api_key_hash: partnerApp.api_key_hash,
          webhook_url: partnerApp.webhook_url,
          status: partnerApp.status,
          created_at: partnerApp.created_at
        })
        .select()
        .single();

      if (error) {
        handleDbError(error, "savePartnerApp");
        localStore.unshift(partnerApp);
        return partnerApp;
      }
      return data as PartnerApp;
    } else {
      const existingIdx = localStore.findIndex(x => x.id === partnerApp.id);
      if (existingIdx >= 0) {
        localStore[existingIdx] = partnerApp;
      } else {
        localStore.unshift(partnerApp);
      }
      return partnerApp;
    }
  },

  /**
   * 6. FIND PARTNER APP BY KEY HASH
   */
  async findPartnerAppByHash(
    hash: string,
    localStore: PartnerApp[]
  ): Promise<PartnerApp | null> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("partner_apps")
        .select("*")
        .eq("api_key_hash", hash)
        .maybeSingle();

      if (error) {
        handleDbError(error, "findPartnerAppByHash");
        return localStore.find(x => x.api_key_hash === hash) || null;
      }
      return data as PartnerApp | null;
    } else {
      return localStore.find(x => x.api_key_hash === hash) || null;
    }
  },

  /**
   * 7. CREATE SECURITY REPORT (BUG BOUNTY RESPONSIBLE DISCLOSURE)
   */
  async createSecurityReport(
    report: SecurityReport,
    localStore: SecurityReport[]
  ): Promise<SecurityReport> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] INSERT security_report ${report.id} to Supabase`);
      const { data, error } = await supabase
        .from("security_reports")
        .insert({
          id: report.id,
          title: report.title,
          category: report.category,
          severity: report.severity,
          affected_system: report.affected_system,
          reproduction_steps: report.reproduction_steps,
          submitted_evidence: report.submitted_evidence,
          reporter_contact: report.reporter_contact,
          status: report.status,
          bounty_amount: report.bounty_amount,
          internal_notes: report.internal_notes,
          created_at: report.created_at,
          resolved_at: report.resolved_at
        })
        .select()
        .single();

      if (error) {
        handleDbError(error, "createSecurityReport");
        localStore.unshift(report);
        return report;
      }
      return data as SecurityReport;
    } else {
      localStore.unshift(report);
      return report;
    }
  },

  /**
   * 8. UPDATE SECURITY REPORT (TRIAGE / PATCH / PAYOUT / NOTES)
   */
  async updateSecurityReport(
    reportId: string,
    updates: Partial<SecurityReport>,
    localStore: SecurityReport[]
  ): Promise<SecurityReport | null> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] UPDATE security_report ${reportId} in Supabase`);
      const { data, error } = await supabase
        .from("security_reports")
        .update(updates)
        .eq("id", reportId)
        .select()
        .single();

      if (error) {
        handleDbError(error, "updateSecurityReport");
        const idx = localStore.findIndex(r => r.id === reportId);
        if (idx >= 0) {
          localStore[idx] = { ...localStore[idx], ...updates };
          return localStore[idx];
        }
        return null;
      }
      return data as SecurityReport;
    } else {
      const idx = localStore.findIndex(r => r.id === reportId);
      if (idx >= 0) {
        localStore[idx] = { ...localStore[idx], ...updates };
        return localStore[idx];
      }
      return null;
    }
  },

  /**
   * 9. CREATE INTEGRATION REQUEST
   */
  async createIntegrationRequest(
    request: IntegrationRequest,
    localStore: IntegrationRequest[]
  ): Promise<IntegrationRequest> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("integration_requests")
        .insert(request)
        .select()
        .single();

      if (error) {
        handleDbError(error, "createIntegrationRequest");
        localStore.unshift(request);
        return request;
      }
      return data as IntegrationRequest;
    } else {
      localStore.unshift(request);
      return request;
    }
  },

  /**
   * 10. GET INTEGRATION REQUESTS
   */
  async getIntegrationRequests(
    localStore: IntegrationRequest[]
  ): Promise<IntegrationRequest[]> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("integration_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        handleDbError(error, "getIntegrationRequests");
        return localStore;
      }
      return data as IntegrationRequest[];
    } else {
      return localStore;
    }
  },

  /**
   * 11. UPDATE INTEGRATION REQUEST
   */
  async updateIntegrationRequest(
    requestId: string,
    updates: Partial<IntegrationRequest>,
    localStore: IntegrationRequest[]
  ): Promise<IntegrationRequest | null> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("integration_requests")
        .update(updates)
        .eq("id", requestId)
        .select()
        .single();

      if (error) {
        handleDbError(error, "updateIntegrationRequest");
        const idx = localStore.findIndex(r => r.id === requestId);
        if (idx >= 0) {
          localStore[idx] = { ...localStore[idx], ...updates, updated_at: new Date().toISOString() };
          return localStore[idx];
        }
        return null;
      }
      return data as IntegrationRequest;
    } else {
      const idx = localStore.findIndex(r => r.id === requestId);
      if (idx >= 0) {
        localStore[idx] = { ...localStore[idx], ...updates, updated_at: new Date().toISOString() };
        return localStore[idx];
      }
      return null;
    }
  },

  /**
   * 12. CREATE STATUS HISTORY ENTRY
   */
  async createIntegrationRequestStatusHistory(
    history: IntegrationRequestStatusHistory,
    localStore: IntegrationRequestStatusHistory[]
  ): Promise<IntegrationRequestStatusHistory> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("integration_request_status_history")
        .insert(history)
        .select()
        .single();

      if (error) {
        handleDbError(error, "createIntegrationRequestStatusHistory");
        localStore.unshift(history);
        return history;
      }
      return data as IntegrationRequestStatusHistory;
    } else {
      localStore.unshift(history);
      return history;
    }
  },

  /**
   * 13. GET STATUS HISTORY FOR REQUEST
   */
  async getIntegrationRequestStatusHistory(
    requestId: string,
    localStore: IntegrationRequestStatusHistory[]
  ): Promise<IntegrationRequestStatusHistory[]> {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("integration_request_status_history")
        .select("*")
        .eq("integration_request_id", requestId)
        .order("changed_at", { ascending: true });

      if (error) {
        handleDbError(error, "getIntegrationRequestStatusHistory");
        return localStore.filter(h => h.integration_request_id === requestId);
      }
      return data as IntegrationRequestStatusHistory[];
    } else {
      return localStore.filter(h => h.integration_request_id === requestId);
    }
  },

  /**
   * 14. TRUST INTELLIGENCE API: GET METRICS
   */
  async getTrustMetrics(): Promise<any> {
    try {
      const res = await fetch("/api/trust/metrics");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err: any) {
      console.warn("getTrustMetrics API failed:", err);
      return null;
    }
  },

  /**
   * 15. TRUST INTELLIGENCE API: GET CLUSTERS
   */
  async getTrustClusters(): Promise<any[]> {
    try {
      const res = await fetch("/api/trust/clusters");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getTrustClusters API failed:", err);
      return [];
    }
  },

  /**
   * 16. TRUST INTELLIGENCE API: GET VERIFIED HUMANS
   */
  async getVerifiedHumans(): Promise<any[]> {
    try {
      const res = await fetch("/api/trust/humans");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getVerifiedHumans API failed:", err);
      return [];
    }
  },

  /**
   * 17. TRUST INTELLIGENCE API: GET TIMELINE
   */
  async getTrustTimelineData(): Promise<any[]> {
    try {
      const res = await fetch("/api/trust/timeline");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getTrustTimelineData API failed:", err);
      return [];
    }
  },

  /**
   * 18. TRUST INTELLIGENCE API: GET ALERTS
   */
  async getPartnerAlerts(): Promise<any[]> {
    try {
      const res = await fetch("/api/trust/alerts");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getPartnerAlerts API failed:", err);
      return [];
    }
  },

  /**
   * 19. TRUST INTELLIGENCE API: DISMISS ALERT
   */
  async dismissAlert(id: string): Promise<any> {
    try {
      const res = await fetch("/api/trust/alerts/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      return await res.json();
    } catch (err) {
      console.warn("dismissAlert API failed:", err);
      return null;
    }
  },

  /**
   * 20. TEST LAB API: GET RUNS
   */
  async getTestLabRuns(): Promise<any[]> {
    try {
      const res = await fetch("/api/trust/test-lab/runs");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getTestLabRuns API failed:", err);
      return [];
    }
  },

  /**
   * 21. TEST LAB API: TRIGGER RUN
   */
  async runSimulationScenario(scenario_type: string): Promise<any> {
    try {
      const res = await fetch("/api/trust/test-lab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_type })
      });
      return await res.json();
    } catch (err) {
      console.warn("runSimulationScenario API failed:", err);
      return null;
    }
  },

  /**
   * 22. TRUST INTELLIGENCE API: GET UNIFIED GRAPH DATA
   */
  async getTrustGraphData(): Promise<any> {
    try {
      const res = await fetch("/api/trust/graph-data");
      if (!res.ok) throw new Error("HTTP error: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("getTrustGraphData API failed:", err);
      return null;
    }
  },

  /**
   * 23. HANDSHAKE: CREATE TRUST EVENT IN SUPABASE (aan_trust_events)
   */
  async createTrustEvent(
    event: {
      session_id: string;
      project_id?: string;
      external_user_id: string;
      decision: string;
      risk_score: number;
      reason_codes: string[];
      signal_payload: Record<string, any>;
      proof_token?: string;
      created_at: string;
      completed_at?: string | null;
    },
    localStore: any[]
  ): Promise<any> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] INSERT aan_trust_event for session ${event.session_id} to Supabase`);
      try {
        const { data, error } = await supabase
          .from("aan_trust_events")
          .insert({
            session_id: event.session_id,
            project_id: event.project_id || null,
            external_user_id: event.external_user_id,
            decision: event.decision,
            risk_score: event.risk_score,
            reason_codes: event.reason_codes,
            signal_payload: event.signal_payload,
            proof_token: event.proof_token || null,
            created_at: event.created_at,
            completed_at: event.completed_at || null
          })
          .select()
          .single();

        if (error) {
          handleDbError(error, "createTrustEvent");
          localStore.unshift(event);
          return event;
        }
        return data;
      } catch (err) {
        console.warn("[AAN DB GRACEFUL FALLBACK] createTrustEvent exception:", err);
        localStore.unshift(event);
        return event;
      }
    } else {
      localStore.unshift(event);
      return event;
    }
  },

  /**
   * 24. HANDSHAKE: UPDATE TRUST EVENT IN SUPABASE (aan_trust_events)
   */
  async updateTrustEvent(
    sessionId: string,
    updates: {
      decision: string;
      risk_score: number;
      reason_codes: string[];
      proof_token: string;
      completed_at: string;
    },
    localStore: any[]
  ): Promise<any> {
    if (isConfigured && supabase) {
      console.log(`[AAN DB] UPDATE aan_trust_events for session ${sessionId} in Supabase`);
      try {
        const { data, error } = await supabase
          .from("aan_trust_events")
          .update({
            decision: updates.decision,
            risk_score: updates.risk_score,
            reason_codes: updates.reason_codes,
            proof_token: updates.proof_token,
            completed_at: updates.completed_at
          })
          .eq("session_id", sessionId)
          .select()
          .single();

        if (error) {
          handleDbError(error, "updateTrustEvent");
          const idx = localStore.findIndex(e => e.session_id === sessionId);
          if (idx >= 0) {
            localStore[idx] = { ...localStore[idx], ...updates };
            return localStore[idx];
          }
          return null;
        }
        return data;
      } catch (err) {
        console.warn("[AAN DB GRACEFUL FALLBACK] updateTrustEvent exception:", err);
        const idx = localStore.findIndex(e => e.session_id === sessionId);
        if (idx >= 0) {
          localStore[idx] = { ...localStore[idx], ...updates };
          return localStore[idx];
        }
        return null;
      }
    } else {
      const idx = localStore.findIndex(e => e.session_id === sessionId);
      if (idx >= 0) {
        localStore[idx] = { ...localStore[idx], ...updates };
        return localStore[idx];
      }
      return null;
    }
  },

  /**
   * 25. SYNC TRUST GRAPH INTELLIGENCE TO SUPABASE
   */
  async syncGraphIntelligenceToDb(dbState: any): Promise<void> {
    if (!isConfigured || !supabase) {
      return;
    }
    try {
      console.log("[AAN DB SYNC] Starting asynchronous Supabase Trust Graph sync...");

      // A. Sync trust_clusters
      if (dbState.trustClusters && dbState.trustClusters.length > 0) {
        const clustersToUpsert = dbState.trustClusters.map((c: any) => {
          let id = c.id;
          if (id.startsWith("cluster_dynamic_")) {
            id = getDeterministicUUID(id);
          }
          return {
            id,
            name: c.name,
            risk_score: c.risk_score,
            confidence_score: c.confidence_score,
            status: c.status,
            algorithm: c.algorithm,
            verified_humans_count: c.verified_humans_count,
            partner_accounts_count: c.partner_accounts_count,
            trust_devices_count: c.trust_devices_count,
            events_count: c.events_count,
            decisions_count: c.decisions_count,
            last_activity: c.last_activity,
            created_at: c.created_at
          };
        });

        const { error: clusterErr } = await supabase
          .from("trust_clusters")
          .upsert(clustersToUpsert, { onConflict: "id" });
        
        if (clusterErr) {
          console.warn("[AAN DB SYNC] Failed to sync trust_clusters:", clusterErr.message);
        }
      }

      // B. Sync verified_humans
      if (dbState.verifiedHumans && dbState.verifiedHumans.length > 0) {
        const humansToUpsert = dbState.verifiedHumans.map((h: any) => {
          let clusterId = h.primary_cluster_id;
          if (clusterId && clusterId.startsWith("cluster_dynamic_")) {
            clusterId = getDeterministicUUID(clusterId);
          }
          return {
            id: h.id,
            name: h.name,
            status: h.status === "passed" || h.status === "within_policy" ? "within_policy" : h.status === "failed" || h.status === "exceeds_policy" ? "exceeds_policy" : "needs_review",
            last_seen: h.last_seen || new Date().toISOString(),
            avg_trust_score: h.avg_trust_score !== undefined ? h.avg_trust_score : 85,
            highest_risk_score: h.highest_risk_score !== undefined ? h.highest_risk_score : 15,
            relationship_confidence: h.relationship_confidence !== undefined ? h.relationship_confidence : 95,
            total_accounts: h.total_accounts || 1,
            known_devices_count: h.known_devices_count || 1,
            primary_cluster_id: clusterId || null,
            created_at: h.created_at || new Date().toISOString()
          };
        });

        const { error: humanErr } = await supabase
          .from("verified_humans")
          .upsert(humansToUpsert, { onConflict: "id" });

        if (humanErr) {
          console.warn("[AAN DB SYNC] Failed to sync verified_humans:", humanErr.message);
        }
      }

      // C. Sync trust_relationships
      if (dbState.trustRelationships && dbState.trustRelationships.length > 0) {
        const relationshipsToUpsert = dbState.trustRelationships.map((r: any) => {
          let clusterId = r.cluster_id;
          if (clusterId && clusterId.startsWith("cluster_dynamic_")) {
            clusterId = getDeterministicUUID(clusterId);
          }
          return {
            id: r.id,
            human_id: r.human_id,
            type: r.type,
            source: r.source,
            target: r.target,
            confidence: r.confidence,
            evidence: r.evidence,
            status: r.status === "passed" || r.status === "verified" ? "verified" : r.status || "review",
            recommendation: r.recommendation || "",
            cluster_id: clusterId || null,
            created_at: r.created_at || new Date().toISOString()
          };
        });

        const { error: relErr } = await supabase
          .from("trust_relationships")
          .upsert(relationshipsToUpsert, { onConflict: "id" });

        if (relErr) {
          console.warn("[AAN DB SYNC] Failed to sync trust_relationships:", relErr.message);
        }
      }

      console.log("[AAN DB SYNC] Asynchronous Supabase Trust Graph sync completed successfully.");
    } catch (err: any) {
      console.warn("[AAN DB SYNC] Error inside syncGraphIntelligenceToDb:", err.message || err);
    }
  }
};

// Internal private helper for local updates
function fallbackUpdate(
  id: string,
  updates: Partial<VerificationSession>,
  store: VerificationSession[]
): VerificationSession | null {
  const index = store.findIndex(s => s.id === id);
  if (index >= 0) {
    const updated = {
      ...store[index],
      ...updates,
      completed_at: updates.completed_at !== undefined ? updates.completed_at : (updates.status === "passed" || updates.status === "failed" ? new Date().toISOString() : null)
    };
    store[index] = updated;
    return updated;
  }
  return null;
}
