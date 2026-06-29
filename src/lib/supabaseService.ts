import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  VerificationSession, 
  AuditLog, 
  SecurityEvent, 
  PartnerApp 
} from "../types";

// ============================================================================
// AAN PLATFORM — PRIVACY-PRESERVING IDENTITY DB REPOSITORY LAYER
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || "";
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

export function isSupabaseConnected(): boolean {
  return isConfigured;
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
