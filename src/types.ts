export type UserStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type VerificationSessionStatus = 
  | 'started' | 'passed' | 'failed' | 'review'
  | 'created' | 'consent_given' | 'verification_started' | 'verification_passed' | 'verification_failed' | 'proof_issued' | 'expired' | 'revoked';

export interface SecurityEvent {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_type: string;
  actor_type: 'user' | 'partner_app' | 'admin' | 'system' | 'unknown';
  actor_id: string;
  ip_address: string;
  user_agent: string;
  session_id?: string;
  partner_app_id?: string;
  request_path?: string;
  detection_reason: string;
  raw_metadata: Record<string, any>;
  created_at: string;
}


export interface User {
  id: string; // uuid
  status: UserStatus;
  human_uid: string; // privacy-safe identifier, e.g. unique signature hash
  created_at: string;
  updated_at: string;
}

export interface SignatureTemplate {
  id: string;
  user_id: string;
  template_hash: string;
  encrypted_template: string; // Mock encrypted representation
  model_version: string;
  confidence_score: number;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  device_public_key: string;
  device_fingerprint_hash: string;
  platform: string;
  trusted: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface PartnerApp {
  id: string;
  name: string;
  api_key_hash: string;
  webhook_url: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface PartnerUserLink {
  id: string;
  partner_app_id: string;
  user_id: string;
  external_user_id: string;
  created_at: string;
}

export interface VerificationSession {
  id: string;
  partner_app_id: string;
  external_user_id: string;
  status: VerificationSessionStatus;
  risk_score: number; // 0 to 100
  duplicate_candidate: boolean;
  result_reason: string;
  risk_reasons: string[];
  proof_token: string;
  created_at: string;
  completed_at: string | null;
  redirect_url?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  checkout_url?: string;
}

export interface AuditLog {
  id: string;
  actor_type: 'system' | 'partner' | 'admin' | 'user';
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Risk scoring engine output structure
export interface RiskResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  reasons: string[];
}

// Integrity service mocks
export interface IntegrityCheckMockResult {
  passed: boolean;
  confidence: number;
  reasons: string[];
}

// API Payloads
export interface CreateSessionRequest {
  external_user_id: string;
  callback_url: string;
  verification_level: 'human' | 'human_unique';
}

export interface CreateSessionResponse {
  session_id: string;
  verification_url: string;
  expires_at: string;
}

export interface GetSessionResultResponse {
  session_id: string;
  status: VerificationSessionStatus;
  result: {
    is_real_human: boolean;
    is_unique_human: boolean;
    is_same_person: boolean;
    risk_score: number;
    risk_reasons: string[];
  };
  proof_token: string;
}

export interface SubmitSignatureRequest {
  integrity_token: string;
  signature_hash: string;
  device_public_key: string;
  device_fingerprint_hash: string;
  platform?: string;
}

export interface SubmitSignatureResponse {
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface VerifyProofRequest {
  proof_token: string;
}

export interface VerifyProofResponse {
  valid: boolean;
  claims: {
    human_verified: boolean;
    unique_human: boolean;
    issued_at: string;
    expires_at: string;
  };
}

export interface Policy {
  id: string;
  name: string;
  conditions: string;
  thenAction: 'suspend' | 'challenge' | 'flag' | 'merge_duplicates' | 'remove_fraud' | 'notify';
  active: boolean;
  description: string;
}

export interface TrustTimelineEntry {
  id: string;
  user_id: string;
  session_id?: string;
  event: string;
  timestamp: string;
  description: string;
  trustScoreChange?: string;
}

// Configurable Verification Profiles & Signal-Based Architecture
export interface VerificationSignalDefinition {
  id: string;
  name: string;
  description: string;
  purpose: string;
  privacyImpact: string;
  recommendedUse: string;
  enterpriseRec: string;
  required: boolean; // whether required or optional in current profile context
  enabled: boolean;  // whether active in current profile context
}

export interface VerificationProfile {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  signals: Record<string, { enabled: boolean; required: boolean }>;
  assignedProjectIds: string[]; // Partner App/Project IDs assigned to this profile
  createdAt: string;
  updatedAt: string;
}

export interface ProfileHistoryEntry {
  id: string;
  profileId: string;
  profileName: string;
  changedBy: string; // Admin / Partner email or username
  previousConfig: Record<string, { enabled: boolean; required: boolean }>;
  newConfig: Record<string, { enabled: boolean; required: boolean }>;
  timestamp: string;
  reason: string;
}

export interface SecurityReport {
  id: string;
  title: string;
  category: 
    | 'authentication_bypass'
    | 'partner_api_key_exposure'
    | 'cross_organization_data_access'
    | 'forged_verification_tokens'
    | 'replay_attacks'
    | 'webhook_spoofing'
    | 'admin_dashboard_access'
    | 'rate_limit_bypass'
    | 'bot_abuse_at_scale'
    | 'unauthorized_partner_actions'
    | 'privacy_leaks'
    | 'audit_log_tampering'
    | 'verification_approval_bypass';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_system: string;
  reproduction_steps: string;
  submitted_evidence?: string;
  reporter_contact: string;
  status: 'new' | 'triaged' | 'duplicate' | 'reproduced' | 'patched' | 'payout_approved' | 'payout_paid' | 'closed';
  bounty_amount: number;
  internal_notes?: string;
  created_at: string;
  resolved_at?: string | null;
}


