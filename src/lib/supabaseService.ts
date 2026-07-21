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

export let supabase: SupabaseClient | null = null;
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
    console.error("[AAN INFRASTRUCTURE] Failed to initialize Supabase client:", err.message || err);
  }
} else {
  console.log("[AAN INFRASTRUCTURE] SUPABASE NOT CONFIGURED IN ENVIRONMENT");
}

export function isSupabaseConnected(): boolean {
  return isConfigured && supabase !== null;
}

export function disableRemoteDatabase(): void {
  // Deprecated under the "No Simulated Fallback" directive. We keep the function signature to avoid preflight breaks.
}

function getDeterministicUUID(str: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(15, 18)}-${hash.slice(18, 30)}`;
}

/**
 * Service/Repository layer wrapping data access for AAN Identity Platform.
 * Strictly communicates with Supabase. All fallback/offline state code has been removed.
 */
export const supabaseService = {
  
  /**
   * 1. CREATE VERIFICATION SESSION
   */
  async createVerificationSession(
    session: VerificationSession,
    _localStore?: any[]
  ): Promise<VerificationSession> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] createVerificationSession failed:", error.message);
      throw error;
    }
    return data as VerificationSession;
  },

  /**
   * 2. UPDATE VERIFICATION SESSION STATUS
   */
  async updateVerificationSession(
    sessionId: string,
    updates: Partial<VerificationSession>,
    _localStore?: any[]
  ): Promise<VerificationSession | null> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] updateVerificationSession failed:", error.message);
      throw error;
    }
    return data as VerificationSession;
  },

  /**
   * 3. RECORD AUDIT EVENT
   */
  async recordAuditEvent(
    log: AuditLog,
    _localStore?: any[]
  ): Promise<AuditLog> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] recordAuditEvent failed:", error.message);
      throw error;
    }
    return data as AuditLog;
  },

  /**
   * 4. RECORD SECURITY SIGNAL / BYPASS DETECTOR / INTRUSION ATTEMPT
   */
  async recordSecurityEvent(
    event: SecurityEvent,
    _localStore?: any[]
  ): Promise<SecurityEvent> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] recordSecurityEvent failed:", error.message);
      throw error;
    }
    return data as SecurityEvent;
  },

  /**
   * 5. MANAGE PARTNER APPS / PROJECTS & KEYS
   */
  async savePartnerApp(
    partnerApp: PartnerApp,
    _localStore?: any[]
  ): Promise<PartnerApp> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] savePartnerApp failed:", error.message);
      throw error;
    }
    return data as PartnerApp;
  },

  /**
   * 6. FIND PARTNER APP BY KEY HASH
   */
  async findPartnerAppByHash(
    hash: string,
    _localStore?: any[]
  ): Promise<PartnerApp | null> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("partner_apps")
      .select("*")
      .eq("api_key_hash", hash)
      .maybeSingle();

    if (error) {
      console.error("[AAN DB ERROR] findPartnerAppByHash failed:", error.message);
      throw error;
    }
    return data as PartnerApp | null;
  },

  /**
   * 7. CREATE SECURITY REPORT (BUG BOUNTY RESPONSIBLE DISCLOSURE)
   */
  async createSecurityReport(
    report: SecurityReport,
    _localStore?: any[]
  ): Promise<SecurityReport> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
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
      console.error("[AAN DB ERROR] createSecurityReport failed:", error.message);
      throw error;
    }
    return data as SecurityReport;
  },

  /**
   * 8. UPDATE SECURITY REPORT (TRIAGE / PATCH / PAYOUT / NOTES)
   */
  async updateSecurityReport(
    reportId: string,
    updates: Partial<SecurityReport>,
    _localStore?: any[]
  ): Promise<SecurityReport | null> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    console.log(`[AAN DB] UPDATE security_report ${reportId} in Supabase`);
    const { data, error } = await supabase
      .from("security_reports")
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] updateSecurityReport failed:", error.message);
      throw error;
    }
    return data as SecurityReport;
  },

  /**
   * 9. CREATE INTEGRATION REQUEST
   */
  async createIntegrationRequest(
    request: IntegrationRequest,
    _localStore?: any[]
  ): Promise<IntegrationRequest> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("integration_requests")
      .insert(request)
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] createIntegrationRequest failed:", error.message);
      throw error;
    }
    return data as IntegrationRequest;
  },

  /**
   * 10. GET INTEGRATION REQUESTS
   */
  async getIntegrationRequests(
    _localStore?: any[]
  ): Promise<IntegrationRequest[]> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("integration_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[AAN DB ERROR] getIntegrationRequests failed:", error.message);
      throw error;
    }
    return data as IntegrationRequest[];
  },

  /**
   * 11. UPDATE INTEGRATION REQUEST
   */
  async updateIntegrationRequest(
    requestId: string,
    updates: Partial<IntegrationRequest>,
    _localStore?: any[]
  ): Promise<IntegrationRequest | null> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("integration_requests")
      .update(updates)
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] updateIntegrationRequest failed:", error.message);
      throw error;
    }
    return data as IntegrationRequest;
  },

  /**
   * 12. CREATE STATUS HISTORY ENTRY
   */
  async createIntegrationRequestStatusHistory(
    history: IntegrationRequestStatusHistory,
    _localStore?: any[]
  ): Promise<IntegrationRequestStatusHistory> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("integration_request_status_history")
      .insert(history)
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] createIntegrationRequestStatusHistory failed:", error.message);
      throw error;
    }
    return data as IntegrationRequestStatusHistory;
  },

  /**
   * 13. GET STATUS HISTORY FOR REQUEST
   */
  async getIntegrationRequestStatusHistory(
    requestId: string,
    _localStore?: any[]
  ): Promise<IntegrationRequestStatusHistory[]> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
      .from("integration_request_status_history")
      .select("*")
      .eq("integration_request_id", requestId)
      .order("changed_at", { ascending: true });

    if (error) {
      console.error("[AAN DB ERROR] getIntegrationRequestStatusHistory failed:", error.message);
      throw error;
    }
    return data as IntegrationRequestStatusHistory[];
  },

  /**
   * 14. TRUST INTELLIGENCE API: GET METRICS
   */
  async getTrustMetrics(): Promise<any> {
    const res = await fetch("/api/trust/metrics");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 15. TRUST INTELLIGENCE API: GET CLUSTERS
   */
  async getTrustClusters(): Promise<any[]> {
    const res = await fetch("/api/trust/clusters");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 16. TRUST INTELLIGENCE API: GET VERIFIED HUMANS
   */
  async getVerifiedHumans(): Promise<any[]> {
    const res = await fetch("/api/trust/humans");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 17. TRUST INTELLIGENCE API: GET TIMELINE
   */
  async getTrustTimelineData(): Promise<any[]> {
    const res = await fetch("/api/trust/timeline");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 18. TRUST INTELLIGENCE API: GET ALERTS
   */
  async getPartnerAlerts(): Promise<any[]> {
    const res = await fetch("/api/trust/alerts");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 19. TRUST INTELLIGENCE API: DISMISS ALERT
   */
  async dismissAlert(id: string): Promise<any> {
    const res = await fetch("/api/trust/alerts/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    return await res.json();
  },

  /**
   * 20. TEST LAB API: GET RUNS
   */
  async getTestLabRuns(): Promise<any[]> {
    const res = await fetch("/api/trust/test-lab/runs");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 21. TEST LAB API: TRIGGER RUN
   */
  async runSimulationScenario(scenario_type: string): Promise<any> {
    const res = await fetch("/api/trust/test-lab/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_type })
    });
    return await res.json();
  },

  /**
   * 22. TRUST INTELLIGENCE API: GET UNIFIED GRAPH DATA
   */
  async getTrustGraphData(): Promise<any> {
    const res = await fetch("/api/trust/graph-data");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    return await res.json();
  },

  /**
   * 23. HANDSHAKE: CREATE TRUST EVENT IN SUPABASE
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
    _localStore?: any[]
  ): Promise<any> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    console.log(`[AAN DB] INSERT aan_trust_event for session ${event.session_id} to Supabase`);
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
        proof_token: event.proof_token || "",
        created_at: event.created_at,
        completed_at: event.completed_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] createTrustEvent failed:", error.message);
      throw error;
    }
    return data;
  },

  /**
   * 24. UPDATE TRUST EVENT IN SUPABASE
   */
  async updateTrustEvent(
    sessionId: string,
    updates: any,
    _localStore?: any[]
  ): Promise<any> {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    console.log(`[AAN DB] UPDATE aan_trust_event for session ${sessionId} in Supabase`);
    const { data, error } = await supabase
      .from("aan_trust_events")
      .update(updates)
      .eq("session_id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("[AAN DB ERROR] updateTrustEvent failed:", error.message);
      throw error;
    }
    return data;
  },

  /**
   * 25. STATE SYNC
   */
  async syncGraphIntelligenceToDb(db: any): Promise<void> {
    if (!supabase) return;
    try {
      console.log("[AAN DB SYNC] Beginning graph intelligence sync to Supabase...");
      
      // A. Sync trust_clusters
      if (db.trustClusters && db.trustClusters.length > 0) {
        const clustersToUpsert = db.trustClusters.map((c: any) => ({
          id: c.id.startsWith("cluster_dynamic_") ? getDeterministicUUID(c.id) : c.id,
          name: c.name,
          risk_score: c.risk_score,
          confidence_score: c.confidence_score,
          status: c.status,
          algorithm: c.algorithm || "louvain",
          verified_humans_count: c.verified_humans_count,
          partner_accounts_count: c.partner_accounts_count,
          trust_devices_count: c.trust_devices_count,
          events_count: c.events_count,
          decisions_count: c.decisions_count,
          last_activity: c.last_activity || new Date().toISOString(),
          created_at: c.created_at || new Date().toISOString()
        }));

        const { error: clusterErr } = await supabase
          .from("trust_clusters")
          .upsert(clustersToUpsert, { onConflict: "id" });

        if (clusterErr) {
          console.warn("[AAN DB SYNC] Failed to sync trust_clusters:", clusterErr.message);
        }
      }

      // B. Sync verified_humans
      if (db.verifiedHumans && db.verifiedHumans.length > 0) {
        const humansToUpsert = db.verifiedHumans.map((h: any) => {
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
      if (db.trustRelationships && db.trustRelationships.length > 0) {
        const relationshipsToUpsert = db.trustRelationships.map((r: any) => {
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
