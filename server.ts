import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { runPreflightCheck } from "./src/lib/preflight";
import { supabaseService, isSupabaseConnected } from "./src/lib/supabaseService";
import { 
  hashApiKey,
  hashPartnerUserId,
  createCheckoutUrl,
  validateCreateSessionBody
} from "./src/lib/apiHelpers";
import { 
  User, 
  SignatureTemplate, 
  Device, 
  PartnerApp, 
  PartnerUserLink, 
  VerificationSession, 
  AuditLog,
  RiskResult,
  Policy,
  TrustTimelineEntry,
  SecurityEvent,
  SecurityReport
} from "./src/types";
import { AIEngine, setActiveProvider, activeProvider, AIProvider } from "./src/lib/aiEngine";

// ============================================================================
// MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before production use.
// STATEFUL IN-MEMORY DATABASE WITH PERSISTENT STRUCTURE FOR THE MVP MODEL
// ============================================================================

// Seeds
const mockPartnerApps: PartnerApp[] = [
  {
    id: "partner_apps_fintech_123",
    name: "Fintech Trust Layer",
    api_key_hash: crypto.createHash('sha256').update("poh_key_fintech_demo_111").digest('hex'),
    webhook_url: "https://api.fintechsecure.com/webhooks/poh",
    status: "active",
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "partner_apps_dao_456",
    name: "SybilBlock DAO Voting Platform",
    api_key_hash: crypto.createHash('sha256').update("poh_key_dao_demo_222").digest('hex'),
    webhook_url: "https://dao.sybilblock.org/identity-sync",
    status: "active",
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

const mockUsers: User[] = [
  {
    id: "usr_9a48f2c0",
    status: "pending",
    human_uid: "human_hash_unconfirmed_9a48f2c0",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "usr_b710ef67",
    status: "verified",
    human_uid: "human_hash_verified_b710ef67",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "usr_df990a31",
    status: "rejected",
    human_uid: "human_hash_duplicate_df990a31",
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "usr_f92bba45",
    status: "suspended",
    human_uid: "human_hash_review_f92bba45",
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: "usr_bc4477ee",
    status: "verified",
    human_uid: "human_hash_verified_bc4477ee",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

const mockSignatureTemplates: SignatureTemplate[] = [
  {
    id: "tmpl_101",
    user_id: "usr_b710ef67",
    template_hash: "sig_hash_b710ef67",
    encrypted_template: "U2FsdGVkX18mZ9/X2dGzW/8nZ9+kLd8M=...[encrypted_vector_signaturenet_v3]",
    model_version: "signaturenet-v3",
    confidence_score: 98.40,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "tmpl_102",
    user_id: "usr_df990a31",
    template_hash: "sig_hash_b710ef67", // DUPLICATE TO FIT DETECT CRITERIA
    encrypted_template: "U2FsdGVkX18mZ9/X2dGzW/8nZ9+kLd8M=...[encrypted_vector_signaturenet_v3_copy]",
    model_version: "signaturenet-v3",
    confidence_score: 92.10,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "tmpl_103",
    user_id: "usr_bc4477ee",
    template_hash: "sig_hash_bc4477ee",
    encrypted_template: "U2FsdGVkX18mZ9/X2dGzW/8nZ9+kLd8I=...[encrypted_vector_signaturenet_v3_unique]",
    model_version: "signaturenet-v3",
    confidence_score: 99.10,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const mockDevices: Device[] = [
  {
    id: "dev_1",
    user_id: "usr_9a48f2c0",
    device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...",
    device_fingerprint_hash: "fp_chrome_9a48f2c0_fingerprint",
    platform: "macOS Chrome",
    trusted: true,
    last_seen_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "dev_2",
    user_id: "usr_b710ef67",
    device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy...",
    device_fingerprint_hash: "fp_ios_b710ef67_fingerprint",
    platform: "iOS Safari",
    trusted: true,
    last_seen_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "dev_3",
    user_id: "usr_df990a31",
    device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn...",
    device_fingerprint_hash: "fp_chrome_9a48f2c0_fingerprint", // DUPLICATE DEVICE USED BY USER 1
    platform: "macOS Chrome",
    trusted: false,
    last_seen_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "dev_4",
    user_id: "usr_f92bba45",
    device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq...",
    device_fingerprint_hash: "fp_safari_f92bba45_fingerprint",
    platform: "macOS Safari",
    trusted: true,
    last_seen_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: "dev_5",
    user_id: "usr_bc4477ee",
    device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz...",
    device_fingerprint_hash: "fp_win_bc4477ee_fingerprint",
    platform: "Windows Edge",
    trusted: true,
    last_seen_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const mockPartnerUserLinks: PartnerUserLink[] = [
  {
    id: "link_1",
    partner_app_id: "partner_apps_fintech_123",
    user_id: "usr_9a48f2c0",
    external_user_id: "fintech_external_alice_77",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "link_2",
    partner_app_id: "partner_apps_dao_456",
    user_id: "usr_b710ef67",
    external_user_id: "dao_external_bob_99",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "link_3",
    partner_app_id: "partner_apps_fintech_123",
    user_id: "usr_df990a31",
    external_user_id: "fintech_external_charlie_12",
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "link_4",
    partner_app_id: "partner_apps_dao_456",
    user_id: "usr_f92bba45",
    external_user_id: "dao_external_david_33",
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: "link_5",
    partner_app_id: "partner_apps_fintech_123",
    user_id: "usr_bc4477ee",
    external_user_id: "fintech_external_emma_88",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const mockVerificationSessions: VerificationSession[] = [
  {
    id: "vss_session_unconfirmed_9a4",
    partner_app_id: "partner_apps_fintech_123",
    external_user_id: "fintech_external_alice_77",
    status: "started",
    risk_score: 15,
    duplicate_candidate: false,
    result_reason: "Session initialized/awaiting signature upload.",
    risk_reasons: [],
    proof_token: "",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    completed_at: null
  },
  {
    id: "vss_session_verified_b71",
    partner_app_id: "partner_apps_dao_456",
    external_user_id: "dao_external_bob_99",
    status: "passed",
    risk_score: 8,
    duplicate_candidate: false,
    result_reason: "Signature match unique; confidence 98.4%. Integrity passed.",
    risk_reasons: [],
    proof_token: "proof_claims_b71_sig_93f82e11ac0b",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString()
  },
  {
    id: "vss_session_failed_df9",
    partner_app_id: "partner_apps_fintech_123",
    external_user_id: "fintech_external_charlie_12",
    status: "failed",
    risk_score: 95,
    duplicate_candidate: true,
    result_reason: "Critical: Duplicate signature template identified matching user usr_b710ef67. Integrity score low.",
    risk_reasons: ["duplicate_signature_template_hash", "many_accounts_on_one_device", "failed_integrity"],
    proof_token: "",
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 11.9 * 3600 * 1000).toISOString()
  },
  {
    id: "vss_session_review_f92",
    partner_app_id: "partner_apps_dao_456",
    external_user_id: "dao_external_david_33",
    status: "review",
    risk_score: 55,
    duplicate_candidate: false,
    result_reason: "Pending Review: Human validated but registered a new, untrusted hardware key from an unverified location.",
    risk_reasons: ["new_device_on_existing_user"],
    proof_token: "",
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 4.95 * 3600 * 1000).toISOString()
  },
  {
    id: "vss_session_verified_bc4",
    partner_app_id: "partner_apps_fintech_123",
    external_user_id: "fintech_external_emma_88",
    status: "passed",
    risk_score: 4,
    duplicate_candidate: false,
    result_reason: "Same returning user on trusted hardware; signature integrity intact.",
    risk_reasons: [],
    proof_token: "proof_claims_bc4_sig_66a7b3c2ee10",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 47.95 * 3600 * 1000).toISOString()
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: "log_1",
    actor_type: "partner",
    actor_id: "partner_apps_fintech_123",
    action: "session.create",
    target_type: "session",
    target_id: "vss_session_unconfirmed_9a4",
    metadata: { ext_usr: "fintech_external_alice_77", client_ip: "198.51.100.41", level: "human_unique" },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "log_2",
    actor_type: "system",
    actor_id: "signature_engine_v3",
    action: "signature.integrity_success",
    target_type: "session",
    target_id: "vss_session_verified_b71",
    metadata: { integrity_score: 0.992, model_v: "signaturenet-v3" },
    created_at: new Date(Date.now() - 23.97 * 3600 * 1000).toISOString()
  },
  {
    id: "log_3",
    actor_type: "system",
    actor_id: "cryptography_signer",
    action: "proof.issue",
    target_type: "user",
    target_id: "usr_b710ef67",
    metadata: { claims: { human_verified: true, unique_human: true } },
    created_at: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString()
  },
  {
    id: "log_4",
    actor_type: "system",
    actor_id: "risk_engine_v1",
    action: "risk.alert_high",
    target_type: "session",
    target_id: "vss_session_failed_df9",
    metadata: { risk_score: 95, anomalies: ["duplicate_signature_template_hash", "many_accounts_on_one_device"] },
    created_at: new Date(Date.now() - 11.95 * 3600 * 1000).toISOString()
  },
  {
    id: "log_5",
    actor_type: "admin",
    actor_id: "admin_super_user_one",
    action: "user.suspend",
    target_type: "user",
    target_id: "usr_df990a31",
    metadata: { reason: "Automated signature sybil detection flag confirmed by administrative review." },
    created_at: new Date(Date.now() - 11.8 * 3600 * 1000).toISOString()
  },
  {
    id: "log_6",
    actor_type: "partner",
    actor_id: "partner_apps_dao_456",
    action: "api.api_key_created",
    target_type: "partner_app",
    target_id: "partner_apps_dao_456",
    metadata: { admin: "dao_sec_officer", scope: "read_sessions" },
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

const mockPolicies: Policy[] = [
  {
    id: "pol_1",
    name: "Suspicious Emulator Auto-Suspension",
    conditions: "Device Trust < 35 && Automation Confidence > 90%",
    thenAction: "suspend",
    active: true,
    description: "Instantly suspends active access credentials and flags systems when high-risk automation patterns are detected on suspicious devices."
  },
  {
    id: "pol_2",
    name: "Coordinated Duplicate Account Purge",
    conditions: "Duplicate Probability > 95%",
    thenAction: "remove_fraud",
    active: true,
    description: "Based on security clearance, automatically deletes duplicate and fraudulent secondary profiles sharing identical signature credentials."
  },
  {
    id: "pol_3",
    name: "Untrusted Node Challenge",
    conditions: "Device Trust < 60 && Location Risk == High",
    thenAction: "challenge",
    active: true,
    description: "Defers direct access authorization to prompt for out-of-band mobile verification and integrity checks."
  }
];

const mockTrustTimelines: TrustTimelineEntry[] = [
  // Timeline for user usr_b710ef67 (Bob)
  {
    id: "tl_1",
    user_id: "usr_b710ef67",
    session_id: "vss_session_verified_b71",
    event: "Account Created",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    description: "Account credentials established on SybilBlock DAO voting gateway. Primary OAuth verification linked.",
    trustScoreChange: "Neutral"
  },
  {
    id: "tl_2",
    user_id: "usr_b710ef67",
    session_id: "vss_session_verified_b71",
    event: "Device Trust Registered",
    timestamp: new Date(Date.now() - 23.99 * 3600 * 1000).toISOString(),
    description: "Active device profile (iOS Safari) enrolled and marked as trusted.",
    trustScoreChange: "+15 (Score: 75)"
  },
  {
    id: "tl_3",
    user_id: "usr_b710ef67",
    session_id: "vss_session_verified_b71",
    event: "Liveness Check Completed",
    timestamp: new Date(Date.now() - 23.97 * 3600 * 1000).toISOString(),
    description: "Active screenshot verification processed successfully. Biological check confidence: 98.40%.",
    trustScoreChange: "+20 (Score: 95)"
  },
  {
    id: "tl_4",
    user_id: "usr_b710ef67",
    session_id: "vss_session_verified_b71",
    event: "Trust Assertion Signed",
    timestamp: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString(),
    description: "Sovereign proof token 'proof_claims_b71...' issued to application with advisory recommendation ALLOW.",
    trustScoreChange: "Verified"
  },

  // Timeline for user usr_df990a31 (Charlie - Duplicate)
  {
    id: "tl_5",
    user_id: "usr_df990a31",
    session_id: "vss_session_failed_df9",
    event: "Account Created",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    description: "Account creation initialized on Fintech Trust interface.",
    trustScoreChange: "Neutral"
  },
  {
    id: "tl_6",
    user_id: "usr_df990a31",
    session_id: "vss_session_failed_df9",
    event: "Anomalous Device Mapped",
    timestamp: new Date(Date.now() - 11.98 * 3600 * 1000).toISOString(),
    description: "Coordinated device fingerprint (fp_chrome_9a48f2c0_fingerprint) identified spanning multiple distinct login claims.",
    trustScoreChange: "-45 (Score: 35)"
  },
  {
    id: "tl_7",
    user_id: "usr_df990a31",
    session_id: "vss_session_failed_df9",
    event: "Duplicate Match Alert",
    timestamp: new Date(Date.now() - 11.95 * 3600 * 1000).toISOString(),
    description: "Active Face template vector matches pre-existing signature hash of Bob (usr_b710ef67). Duplicate score: 99.1%.",
    trustScoreChange: "-50 (Score: 5)"
  },
  {
    id: "tl_8",
    user_id: "usr_df990a31",
    session_id: "vss_session_failed_df9",
    event: "Auto-Remediation Triggered",
    timestamp: new Date(Date.now() - 11.8 * 3600 * 1000).toISOString(),
    description: "Institutional policy executed: Suspend active credentials and restrict system token access.",
    trustScoreChange: "Suspended"
  }
];

// ============================================================================
// BYPASS & INTRUSION DETECTION LAYER (DEFENSIVE RULE-BASED ANOMALY SCANNING)
// ============================================================================

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "sec_event_b1a23",
    severity: "critical",
    event_type: "invalid_token_signature",
    actor_type: "partner_app",
    actor_id: "partner_apps_dao_456",
    ip_address: "185.220.101.44",
    user_agent: "curl/7.81.0",
    session_id: "vss_session_failed_df9",
    partner_app_id: "partner_apps_dao_456",
    request_path: "/api/v1/verify-proof-token",
    detection_reason: "Bypass Blocked: Decoded claims payload does not match HMAC-SHA256 signature verification hash. Signature tampered with.",
    raw_metadata: {
      attempted_claims: { organization_id: "org_enterprise_999", human_status: "verified", uniqueness_status: "unique" },
      expected_signature_alg: "HS256"
    },
    created_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString()
  },
  {
    id: "sec_event_c3d45",
    severity: "high",
    event_type: "impossible_session_state_transition",
    actor_type: "user",
    actor_id: "usr_9a48f2c0",
    ip_address: "198.51.100.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0",
    session_id: "vss_session_failed_df9",
    partner_app_id: "partner_apps_fintech_123",
    request_path: "/api/v1/verification-sessions/vss_session_failed_df9/signature",
    detection_reason: "Defensive Transition Enforcer Blocked: Direct state jump request attempted from created to proof_issued bypassing active consent & integrity verification.",
    raw_metadata: {
      current_status: "created",
      failed_target_status: "proof_issued"
    },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "sec_event_e5f67",
    severity: "medium",
    event_type: "token_replay_attempt",
    actor_type: "partner_app",
    actor_id: "partner_apps_fintech_123",
    ip_address: "203.0.113.88",
    user_agent: "PostmanRuntime/7.36.1",
    session_id: "vss_session_failed_df9",
    partner_app_id: "partner_apps_fintech_123",
    request_path: "/api/v1/proofs/verify",
    detection_reason: "Repetitive proof token submission flagged. Potential replay attempt in quick succession.",
    raw_metadata: {
      verification_count: 3,
      session_id: "vss_session_failed_df9"
    },
    created_at: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString()
  },
  {
    id: "sec_event_f7g89",
    severity: "critical",
    event_type: "api_key_abuse",
    actor_type: "unknown",
    actor_id: "revoked_key_hash_66a7ec2b",
    ip_address: "185.190.140.22",
    user_agent: "unknown",
    request_path: "/api/v1/verification-sessions",
    detection_reason: "Disabled API Key signature used repeatedly. Multiple requests blocked due to lack of valid authorization credentials.",
    raw_metadata: {
      auth_header_length: 32,
      attempts_count: 14
    },
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

const mockSecurityReports: SecurityReport[] = [
  {
    id: "rep_auth_bypass_01",
    title: "JSON Web Token Validation Bypass in Proof-Token Parser",
    category: "authentication_bypass",
    severity: "critical",
    affected_system: "/api/v1/proofs/verify",
    reproduction_steps: "1. Construct a forged JWT claims payload with custom verified/unique human claims.\n2. Leave the signature block empty or replace HS256 with standard 'none' algorithm header.\n3. POST verify to proofs validator endpoint.\n4. Server accepts claims without proper signature verification validation under fallback bypass conditions.",
    submitted_evidence: "```json\n{\n  \"proof_token\": \"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c3JfMDEiLCJodW1hbl92ZXJpZmllZCI6dHJ1ZX0.\"\n}\n```",
    reporter_contact: "whitehat_alice@secu.net",
    status: "patched",
    bounty_amount: 15000.00,
    internal_notes: "Critical vulnerability fixed. Implemented strict signature algorithm enforcements to throw invalid token signature alerts on any algorithm-mismatch/none-headers.",
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "rep_api_key_02",
    title: "Unsecured Partner API Key Exposure inside Webhook Outgoing Delivery Payloads",
    category: "partner_api_key_exposure",
    severity: "high",
    affected_system: "Webhook Dispatcher Daemon",
    reproduction_steps: "1. Register a secure callback target webhook URL on active project configs.\n2. Trigger a normal session verification state completion.\n3. Observe outgoing HTTP POST delivery request headers contain the raw, plain-text partner secret api_key instead of hashed client credentials.",
    submitted_evidence: "Captured webhook raw packet dump showing:\n```\nPOST /webhooks/poh HTTP/1.1\nHost: api.partner.com\nx-api-key: poh_key_fintech_demo_111\n```",
    reporter_contact: "bounty_hunter_bob@cyberguard.org",
    status: "patched",
    bounty_amount: 5000.00,
    internal_notes: "Vulnerability resolved in webhook dispatch engine. Filtered all authorization and secret key headers from outbound partner deliveries.",
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "rep_rate_limit_03",
    title: "API Rate-Limiting Bypass via X-Forwarded-For Spoofing rotation",
    category: "rate_limit_bypass",
    severity: "medium",
    affected_system: "API Gateway Rate-Limiter",
    reproduction_steps: "1. Issue session creations consecutively.\n2. When 429 Too Many Requests rate block is reached, rotate X-Forwarded-For header values dynamically (e.g. 1.2.3.4, 1.2.3.5).\n3. Gateway treats these as unique IPs, bypassing throttling limits.",
    submitted_evidence: "Reproduction Python script: rotates IP headers sequentially.",
    reporter_contact: "infosec_charlie@hackerone.com",
    status: "reproduced",
    bounty_amount: 1500.00,
    internal_notes: "Triaged and reproduced. Designing correct client-ip extraction middleware resolving trusted proxy chains properly.",
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    resolved_at: null
  },
  {
    id: "rep_replay_04",
    title: "Proof Token Replay Vulnerability inside Decentralized Partner Integration Flow",
    category: "replay_attacks",
    severity: "high",
    affected_system: "/api/v1/proofs/verify",
    reproduction_steps: "1. Capture an authentic proof token generated from a verified session.\n2. Submit the exact same token multiple times consecutively to partner verification validators.\n3. Validators accept token without checking historical uuid reuse patterns or expiry limits.",
    submitted_evidence: "Captured network traffic: proof token verified multiple times with no stateful replay protection.",
    reporter_contact: "whitehat_anonymous@gmail.com",
    status: "triaged",
    bounty_amount: 0.00,
    internal_notes: "Currently evaluating. Token replay protection has been implemented inside server.ts with active tracking but needs partner library guidelines enforcement.",
    created_at: new Date().toISOString(),
    resolved_at: null
  }
];

function appendSecurityEvent(
  severity: 'low' | 'medium' | 'high' | 'critical',
  eventType: string,
  actorType: 'user' | 'partner_app' | 'admin' | 'system' | 'unknown',
  actorId: string,
  ipAddress: string,
  userAgent: string,
  reason: string,
  metadata: Record<string, any> = {},
  sessionId?: string,
  partnerAppId?: string,
  requestPath?: string
) {
  const newEvent = {
    id: `sec_${crypto.randomBytes(4).toString('hex')}`,
    severity,
    event_type: eventType,
    actor_type: actorType,
    actor_id: actorId,
    ip_address: ipAddress || "127.0.0.1",
    user_agent: userAgent || "AAN-Defensive-Core",
    session_id: sessionId,
    partner_app_id: partnerAppId,
    request_path: requestPath,
    detection_reason: reason,
    raw_metadata: metadata,
    created_at: new Date().toISOString()
  };
  supabaseService.recordSecurityEvent(newEvent, db.securityEvents);
  return newEvent;
}

function calculateIntrusionRiskScore(partnerAppId?: string) {
  const events = partnerAppId ? db.securityEvents.filter((e: any) => e.partner_app_id === partnerAppId) : db.securityEvents;
  let score = 5;
  const signalsCount = {
    failedTokens: 0,
    impossibleTransitions: 0,
    unauthorizedAccess: 0,
    apiKeyAbuse: 0,
    unusualIPActivity: 0,
    adminAnomalies: 0,
  };

  events.forEach((e: any) => {
    if (e.event_type === 'invalid_token_signature' || e.event_type === 'expired_token_reuse' || e.event_type === 'token_replay_attempt') {
      signalsCount.failedTokens++;
      score += e.severity === 'critical' ? 25 : e.severity === 'high' ? 18 : 10;
    } else if (e.event_type === 'impossible_session_state_transition') {
      signalsCount.impossibleTransitions++;
      score += 25;
    } else if (e.event_type === 'unauthorized_proof_approval' || e.event_type === 'rls_policy_violation_attempt') {
      signalsCount.unauthorizedAccess++;
      score += 30;
    } else if (e.event_type === 'api_key_abuse' || e.event_type === 'webhook_tampering_attempt') {
      signalsCount.apiKeyAbuse++;
      score += 20;
    } else if (e.event_type === 'admin_override_anomaly' || e.event_type === 'suspicious_role_change') {
      signalsCount.adminAnomalies++;
      score += 15;
    } else if (e.severity === 'critical') {
      score += 20;
    } else if (e.severity === 'high') {
      score += 12;
    } else {
      score += 4;
    }
  });

  score = Math.max(0, Math.min(100, score));
  let level: 'normal' | 'suspicious' | 'high risk' | 'critical' = 'normal';
  if (score >= 86) {
    level = 'critical';
  } else if (score >= 61) {
    level = 'high risk';
  } else if (score >= 31) {
    level = 'suspicious';
  }

  return { score, level, signalsCount };
}

function transitionSession(session: any, targetStatus: any, req: any, reason: string = ""): { allowed: boolean; eventLogged?: boolean } {
  const currentStatus = session.status;
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  let allowed = false;

  if (targetStatus === 'expired' || targetStatus === 'revoked') {
    allowed = true;
  } else if (currentStatus === 'expired') {
    allowed = false;
  } else if (currentStatus === 'created' || currentStatus === 'started') {
    allowed = (targetStatus === 'consent_given' || targetStatus === 'verification_started' || targetStatus === 'verification_failed' || targetStatus === 'verification_passed');
  } else if (currentStatus === 'consent_given') {
    allowed = (targetStatus === 'verification_started' || targetStatus === 'verification_failed' || targetStatus === 'verification_passed' || targetStatus === 'review');
  } else if (currentStatus === 'verification_started') {
    allowed = (targetStatus === 'verification_passed' || targetStatus === 'verification_failed' || targetStatus === 'review' || targetStatus === 'passed' || targetStatus === 'failed');
  } else if (currentStatus === 'verification_passed' || currentStatus === 'passed') {
    allowed = (targetStatus === 'proof_issued' || targetStatus === 'revoked' || targetStatus === 'expired');
  } else if (currentStatus === 'verification_failed' || currentStatus === 'failed') {
    allowed = (targetStatus === 'created' || targetStatus === 'consent_given' || targetStatus === 'verification_started');
  } else if (currentStatus === 'proof_issued') {
    allowed = (targetStatus === 'revoked' || targetStatus === 'expired');
  }

  if (targetStatus === 'proof_issued' && currentStatus !== 'verification_passed' && currentStatus !== 'passed') {
    allowed = false;
  }

  if (allowed) {
    session.status = targetStatus;
    if (reason) session.result_reason = reason;
    supabaseService.updateVerificationSession(session.id, { status: targetStatus, result_reason: session.result_reason }, db.verificationSessions);
    return { allowed: true };
  } else {
    const ip = (req.headers['x-forwarded-for'] || req.ip || "127.0.0.1").toString();
    const ua = (req.headers['user-agent'] || "Unknown").toString();
    appendSecurityEvent(
      'critical',
      'impossible_session_state_transition',
      'system',
      'intrusion_defense_agent',
      ip,
      ua,
      `Bypass blocked: Forced impossible state jump attempted for session ${session.id} from [${currentStatus}] directly to [${targetStatus}].`,
      {
        previous_status: currentStatus,
        attempted_status: targetStatus,
        session_id: session.id,
        context: "State Transition Integrity Guard"
      },
      session.id,
      session.partner_app_id,
      req.path
    );
    return { allowed: false, eventLogged: true };
  }
}

function verifyHardwareProofToken(proofToken: string, req: any): { valid: boolean; claims?: any; error?: string } {
  const ip = (req.headers['x-forwarded-for'] || req.ip || "127.0.0.1").toString();
  const ua = (req.headers['user-agent'] || "Unknown").toString();

  // 1. Structural Checks
  if (!proofToken || typeof proofToken !== 'string') {
    return { valid: false, error: "Missing required parameter: proof_token" };
  }

  const parts = proofToken.split('.');
  if (parts.length !== 3) {
    appendSecurityEvent(
      'critical',
      'invalid_token_signature',
      'unknown',
      'unauthorized_api_client',
      ip,
      ua,
      "Block Malicious Payload: Structural damage detected. The digital token was not minted by AAN.",
      { parts_count: parts.length, token_stub: proofToken.substring(0, 15) },
      undefined,
      undefined,
      req.path
    );
    return { valid: false, error: "Signature verification failed: Invalid cryptographic proof_token integrity" };
  }

  const [headerBase64, claimsBase64, signature] = parts;

  // 2. Validate cryptographic signature
  const project = db.projects[0] || { id: "proj_security_777", webhook_secret: "whsec_sha255_default" };
  const expectedSignature = crypto
    .createHmac('sha256', project.webhook_secret)
    .update(`${headerBase64}.${claimsBase64}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    appendSecurityEvent(
      'critical',
      'invalid_token_signature',
      'system',
      project.id,
      ip,
      ua,
      "Block Malicious Override: Signature verification failed. Cryptographic signature does not match expected project key hash.",
      { attempted_signature: signature, expected: expectedSignature },
      undefined,
      project.id,
      req.path
    );
    return { valid: false, error: "Cryptographic signature validation mismatch" };
  }

  // 3. Claims analysis
  let claims: any;
  try {
    claims = JSON.parse(Buffer.from(claimsBase64, 'base64url').toString());
  } catch (err) {
    return { valid: false, error: "Failed to decode claims payload" };
  }

  // 4. Expiration check
  if (new Date(claims.expires_at).getTime() < Date.now()) {
    appendSecurityEvent(
      'high',
      'expired_token_reuse',
      'user',
      claims.partner_user_id || "unknown",
      ip,
      ua,
      `Access Denied: Re-use of expired cryptographic token detected. Expired on: ${claims.expires_at}.`,
      { expired_at: claims.expires_at, session_id: claims.session_id },
      claims.session_id,
      project.id,
      req.path
    );
    return { valid: false, error: "Proof token expired", claims };
  }

  // 5. Issuer metadata matching
  const expectedOrg = db.organizations[0] || { id: "org_enterprise_999" };
  if (claims.organization_id !== expectedOrg.id || claims.project_id !== project.id) {
    appendSecurityEvent(
      'high',
      'invalid_token_signature',
      'partner_app',
      project.id,
      ip,
      ua,
      "Access Denied: Token was issued for an alternative project or organization audience.",
      { claims_audience: { org: claims.organization_id, proj: claims.project_id } },
      claims.session_id,
      project.id,
      req.path
    );
    return { valid: false, error: "Token audience claims mismatch" };
  }

  // 6. Session and user claim database consistency check (detect forged payloads even with valid signatures from alternate secret keys)
  const session = db.verificationSessions.find(s => s.id === claims.session_id);
  if (!session) {
    appendSecurityEvent(
      'critical',
      'unauthorized_proof_approval',
      'partner_app',
      project.id,
      ip,
      ua,
      `Critical Tampering Attempt: Claim verification sessions [id: ${claims.session_id}] do not exist in the master database.`,
      { session_id: claims.session_id },
      claims.session_id,
      project.id,
      req.path
    );
    return { valid: false, error: "Verification session claimed in token does not exist" };
  }

  // Let's verify status matches or we have a valid output
  if (session.external_user_id !== claims.partner_user_id) {
    appendSecurityEvent(
      'critical',
      'unauthorized_proof_approval',
      'partner_app',
      project.id,
      ip,
      ua,
      "Critical User Contaminations: Claimed identity user ID does not match active verification session user ID.",
      { claims_user: claims.partner_user_id, session_user: session.external_user_id },
      claims.session_id,
      project.id,
      req.path
    );
    return { valid: false, error: "Claim consistency mismatch: partner_user_id mismatch" };
  }

  // 7. Token Replay Check
  if (!db.verifiedTokens[claims.session_id]) {
    db.verifiedTokens[claims.session_id] = 0;
  }
  db.verifiedTokens[claims.session_id]++;

  if (db.verifiedTokens[claims.session_id] > 1) {
    appendSecurityEvent(
      'high',
      'token_replay_attempt',
      'partner_app',
      project.id,
      ip,
      ua,
      `Verification Replay Flagged: Re-submission of valid proof token for session ${claims.session_id}. Counter: ${db.verifiedTokens[claims.session_id]}.`,
      { attempts: db.verifiedTokens[claims.session_id] },
      claims.session_id,
      project.id,
      req.path
    );
    return { valid: false, error: "Proof token replay detected" };
  }

  return { valid: true, claims };
}

// Active State Storage Object (acts as our local relational storage system for MVP state)
const db = {
  partnerApps: [...mockPartnerApps],
  users: [...mockUsers],
  signatureTemplates: [...mockSignatureTemplates],
  devices: [...mockDevices],
  partnerUserLinks: [...mockPartnerUserLinks],
  verificationSessions: [...mockVerificationSessions],
  auditLogs: [...mockAuditLogs],
  policies: [...mockPolicies],
  trustTimelines: [...mockTrustTimelines],
  securityEvents: [...mockSecurityEvents],
  securityReports: [...mockSecurityReports],
  verifiedTokens: {
    "vss_session_failed_df9": 2
  } as Record<string, number>,

  organizations: [
    {
      id: "org_enterprise_999",
      name: "AAN Global Enterprise",
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    }
  ],
  projects: [
    {
      id: "proj_security_777",
      organization_id: "org_enterprise_999",
      name: "Default Secure Integration",
      allowed_domains: ["yourdomain.com", "localhost:3000", "poh-partner.com"],
      login_policy: "Standard Identity Verification & Risk Core Rule",
      enforcement_mode: "monitor_only", // monitor_only, flag_suspicious, require_reverification, block_untrusted, partner_removal
      webhook_secret: "whsec_sha256_mock_secret_abc123",
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    }
  ],
  webhookDeliveries: [
    {
      id: "wh_del_1",
      project_id: "proj_security_777",
      event_type: "aan.verification.completed",
      url: "https://api.fintechsecure.com/webhooks/poh",
      payload: {
        event_id: "evt_101",
        event_type: "aan.verification.completed",
        organization_id: "org_enterprise_999",
        project_id: "proj_security_777",
        partner_user_id: "customer_bob_99",
        risk_level: "low",
        recommended_action: "allow",
        timestamp: new Date().toISOString()
      },
      signature: "whsig_93f82e11ac0b213b7a5a3a",
      status: "success",
      created_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString()
    }
  ],
  duplicateSignals: [
    {
      id: "dup_1",
      project_id: "proj_security_777",
      session_id: "vss_session_failed_df9",
      external_user_id: "fintech_external_charlie_12",
      duplicate_external_user_id: "dao_external_bob_99",
      confidence: 99.1,
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ],
  removalRequests: [
    {
      id: "rem_1",
      project_id: "proj_security_777",
      external_user_id: "fintech_external_charlie_12",
      status: "pending",
      reason: "High-risk duplicate signature scan flagged under security policy standard review.",
      created_at: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
      approved_at: null
    }
  ]
};

// HELPER FOR AUDIT LOGGING
function appendAuditLog(actorType: AuditLog['actor_type'], actorId: string, action: string, targetType: string, targetId: string, metadata: Record<string, any>) {
  const newLog: AuditLog = {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    actor_type: actorType,
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
    created_at: new Date().toISOString()
  };
  supabaseService.recordAuditEvent(newLog, db.auditLogs);
  return newLog;
}

// ============================================================================
// RISK SCORING ENGINE IMPLEMENTATION
// ============================================================================
export function evaluateRisk(params: {
  integrityPassed: boolean;
  templateHash: string;
  deviceFingerprintHash: string;
  hasConsent: boolean;
  isNewDevice: boolean;
  rapidRequestsCount: number;
  sessionExpired: boolean;
  userId?: string;
}): RiskResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Missing Content Consent
  if (!params.hasConsent) {
    score += 100;
    reasons.push("missing_consent");
  }

  // 2. Expired Verification Session
  if (params.sessionExpired) {
    score += 60;
    reasons.push("expired_session");
  }

  // 3. Failed Integrity check
  if (!params.integrityPassed) {
    score += 85;
    reasons.push("failed_integrity");
  }

  // 4. Duplicate Signature Template Hash
  // See if anyone else already possesses this signature template
  const isDuplicateSignature = db.signatureTemplates.some(t => 
    t.template_hash === params.templateHash && 
    (!params.userId || t.user_id !== params.userId)
  );
  if (isDuplicateSignature) {
    score += 90;
    reasons.push("duplicate_signature_template_hash");
  }

  // 5. Sybil Trap: Many accounts on some single physical device fingerprint
  const fingerprintMatches = db.devices.filter(d => 
    d.device_fingerprint_hash === params.deviceFingerprintHash &&
    (!params.userId || d.user_id !== params.userId)
  );
  const totalAssociatedUsers = new Set(fingerprintMatches.map(dm => dm.user_id)).size;
  if (totalAssociatedUsers >= 2) {
    score += 75;
    reasons.push("many_accounts_on_one_device");
  }

  // 6. Security Warning: Unrecognized new device hardware identifier signing returning user's template
  if (params.userId && params.isNewDevice) {
    const userHasDevices = db.devices.some(d => d.user_id === params.userId);
    if (userHasDevices) {
      score += 40;
      reasons.push("new_device_on_existing_user");
    }
  }

  // 7. Velocity Throttle: Spam rate control detection
  if (params.rapidRequestsCount > 4) {
    score += 50;
    reasons.push("rapid_repeated_attempts");
  }

  // Normalize max score limit
  score = Math.min(100, score);
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (score >= 70) {
    riskLevel = 'high';
  } else if (score >= 35) {
    riskLevel = 'medium';
  }

  return {
    risk_score: score,
    risk_level: riskLevel,
    reasons
  };
}

// Helper block to generate signed proof tokens and dispatch secure webhook notification events
// “MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and biometric providers before any production use.”
export function issueProofToken(partnerUserId: string, sessionId: string, humanStatus: string, uniquenessStatus: string, riskLevel: string) {
  const project = db.projects[0] || { id: "proj_security_777", webhook_secret: "whsec_sha255_default" };
  const org = db.organizations[0] || { id: "org_enterprise_999" };
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

  const header = { alg: "HS256", typ: "JWT" };
  const claims = {
    // Blueprint fields
    partner_id: project.id,
    session_id: sessionId,
    verification_status: humanStatus === 'verified' ? 'passed' : 'failed',
    risk_level: riskLevel,
    timestamp: issuedAt,
    expires_at: expiresAt,

    // Legacy fields (retained safely)
    organization_id: org.id,
    project_id: project.id,
    partner_user_id: partnerUserId,
    human_status: humanStatus,
    uniqueness_status: uniquenessStatus,
    issued_at: issuedAt
  };

  const stringifiedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const stringifiedClaims = Buffer.from(JSON.stringify(claims)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', project.webhook_secret)
    .update(`${stringifiedHeader}.${stringifiedClaims}`)
    .digest('base64url');

  return `${stringifiedHeader}.${stringifiedClaims}.${signature}`;
}

export function dispatchWebhook(eventType: string, partnerUserId: string, riskLevel: string, recommendedAction: string, additionalPayload: Record<string, any> = {}) {
  const project = db.projects[0] || { id: "proj_security_777", webhook_secret: "whsec_sha255_default" };
  const org = db.organizations[0] || { id: "org_enterprise_999" };
  const eventId = `evt_${crypto.randomBytes(4).toString('hex')}`;
  const timestamp = new Date().toISOString();
  
  const payload = {
    event_id: eventId,
    event_type: eventType,
    organization_id: org.id,
    project_id: project.id,
    partner_user_id: partnerUserId,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    timestamp,
    ...additionalPayload
  };

  const signature = crypto
    .createHmac('sha256', project.webhook_secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  const delivery = {
    id: `wh_del_${crypto.randomBytes(4).toString('hex')}`,
    project_id: project.id,
    event_type: eventType,
    url: db.partnerApps[0]?.webhook_url || "https://api.fintechsecure.com/webhooks/poh",
    payload,
    signature,
    status: "success",
    created_at: timestamp
  };

  db.webhookDeliveries.unshift(delivery);

  appendAuditLog('system', 'webhook_dispatcher', 'webhook.sent', 'webhook', delivery.id, {
    event_type: eventType,
    partner_user_id: partnerUserId,
    signature_summary: signature.substring(0, 10) + '...'
  });

  return delivery;
}

// ============================================================================
// EXPRESS BOOTSTRAPING
// ============================================================================
async function startServer() {
  // Run deployment and database preflight checks
  await runPreflightCheck();

  const app = express();
  const PORT = 3000;

  // Middleware for static parsing
  app.use(express.json());

  // CORS Simulator middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Client request interceptor for logging "API client traffic"
  app.use((req, res, next) => {
    // Audit suspicious API activity (rate limit simulator or access validation)
    if (req.path.startsWith('/api/v1')) {
      const apiKeyHeader = req.headers['x-api-key'];
      console.log(`[API GATEWAY V1] Path: ${req.path} Method: ${req.method} API Key Present: ${!!apiKeyHeader}`);
    }
    next();
  });

  // ============================================================================
  // PUBLIC & PARTNER CLIENT API ENDPOINTS (v1)
  // ============================================================================

  // 1. POST /api/v1/verification-sessions
  // Creates a secure external user registration/verification session
  app.post("/api/v1/verification-sessions", async (req, res) => {
    try {
      // 1. Validate request body parameters
      const validation = validateCreateSessionBody(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const { partner_user_id, redirect_url, metadata } = req.body;

      // 2. Read the partner API key from the Authorization header as: Bearer <api_key>
      const authHeader = (req.headers["authorization"] || "").toString();
      let apiKey = "";
      if (authHeader.startsWith("Bearer ")) {
        apiKey = authHeader.substring(7).trim();
      }

      // Fallback to older 'x-api-key' for developer testing convenience in existing dashboard modules
      if (!apiKey && req.headers["x-api-key"]) {
        apiKey = req.headers["x-api-key"].toString();
      }

      const clientIp = (req.headers["x-forwarded-for"] || req.ip || "127.0.0.1").toString();
      const userAgent = (req.headers["user-agent"] || "Unknown").toString();

      if (!apiKey) {
        appendSecurityEvent(
          "high",
          "api_key_abuse",
          "unknown",
          "unknown_actor",
          clientIp,
          userAgent,
          "Unauthorized request rejected: Missing API authorization token in headers.",
          { attempted_path: req.path },
          undefined,
          undefined,
          req.path
        );
        return res.status(401).json({ error: "Access Denied: Missing or malformed authentication credentials" });
      }

      // 3. Hash the incoming API key before comparing it to stored hashes
      const keyHash = hashApiKey(apiKey);

      // 4. Look up the matching partner application via Supabase or memory fallback
      const partnerApp = await supabaseService.findPartnerAppByHash(keyHash, db.partnerApps);

      if (!partnerApp) {
        appendSecurityEvent(
          "high",
          "api_key_abuse",
          "unknown",
          "unknown_actor",
          clientIp,
          userAgent,
          "Unauthorized request rejected: Invalid or unregistered API key signature used.",
          { attempted_key_hash: keyHash.substring(0, 10) + "..." },
          undefined,
          undefined,
          req.path
        );
        // Secure generic message to prevent timing/database leaks about key existence
        return res.status(401).json({ error: "Access Denied: Invalid or revoked authentication credentials" });
      }

      // 5. Check if partner is suspended
      if (partnerApp.status === "suspended") {
        appendSecurityEvent(
          "critical",
          "api_key_abuse",
          "partner_app",
          partnerApp.id,
          clientIp,
          userAgent,
          `Access Denied: Suspended partner app [${partnerApp.name}] attempted to create verification session.`,
          { attempted_key_hash: keyHash.substring(0, 10) + "..." },
          undefined,
          partnerApp.id,
          req.path
        );
        return res.status(403).json({ error: "Access Denied: Partner application is suspended" });
      }

      // 6. Privacy Preservation: Never store raw partner_user_id. Hash it before saving.
      const partnerUserHash = partner_user_id 
        ? hashPartnerUserId(partner_user_id)
        : crypto.createHash("sha256").update(crypto.randomBytes(16)).digest("hex");

      // 7. Initialize secure session configurations
      const verificationSessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry
      const checkoutUrl = createCheckoutUrl(verificationSessionId);

      const newSession: VerificationSession = {
        id: verificationSessionId,
        partner_app_id: partnerApp.id,
        external_user_id: partnerUserHash, // Stored securely as the hashed identifier
        status: "created", // Set initialized state to 'created' as specified
        risk_score: 0,
        duplicate_candidate: false,
        result_reason: "Session initialized via secure partner API. Pending user verification.",
        risk_reasons: [],
        proof_token: "",
        created_at: new Date().toISOString(),
        completed_at: null,
        // Optional integration metadata for response
        redirect_url: redirect_url || "",
        metadata: metadata || {},
        expires_at: expiresAt,
        checkout_url: checkoutUrl
      };

      // 8. Save the newly created verification session row
      await supabaseService.createVerificationSession(newSession, db.verificationSessions);

      // 9. Append a detailed audit log entry with action = 'verification_session_created'
      appendAuditLog(
        "partner",
        partnerApp.id,
        "verification_session_created",
        "session",
        verificationSessionId,
        {
          event_type: "verification_session_created",
          partner_user_hash: partnerUserHash,
          expires_at: expiresAt,
          client_ip: clientIp
        }
      );

      // 10. Return complete JSON payload response as specified
      return res.json({
        session_id: verificationSessionId,
        status: "created",
        checkout_url: checkoutUrl,
        expires_at: expiresAt
      });

    } catch (error: any) {
      console.error("[API GATEWAY V1 ERROR] Failed to create verification session:", error);
      return res.status(500).json({ error: "Internal Server Error: Secure session establishment failed" });
    }
  });

  // 2. GET /api/v1/verification-sessions/:id
  // Retrieves structural identity audit records without exposing raw facial credentials
  app.get("/api/v1/verification-sessions/:id", (req, res) => {
    const session = db.verificationSessions.find(s => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Verification session not found" });
    }

    res.json({
      session_id: session.id,
      status: session.status,
      result: {
        is_real_human: session.status === "passed" || session.status === "review",
        is_unique_human: session.status === "passed" && !session.duplicate_candidate,
        is_same_person: session.status === "passed",
        risk_score: session.risk_score,
        risk_reasons: session.risk_reasons
      },
      proof_token: session.proof_token || ""
    });
  });

  // 3b. POST /api/v1/verification-sessions/:id/biometric (Alias/Wrapper for blueprint completeness)
  app.post("/api/v1/verification-sessions/:id/biometric", (req, res, next) => {
    req.url = req.url.replace('/biometric', '/signature');
    next();
  });

  // 3. POST /api/v1/verification-sessions/:id/signature
  // MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before production use.
  // Processes encrypted signature payloads using mock signature logic
  app.post("/api/v1/verification-sessions/:id/signature", (req, res) => {
    const { integrity_token, signature_hash, device_public_key, device_fingerprint_hash } = req.body;
    const session = db.verificationSessions.find(s => s.id === req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Verification session not found" });
    }

    // Defensive State Transition Guard: Step 1 (created -> consent_given)
    const tConsent = transitionSession(session, 'consent_given', req, "User digital consent verified.");
    if (!tConsent.allowed) {
      return res.status(400).json({ error: "Bypass Blocked: Invalid session state transition sequence" });
    }

    // Defensive State Transition Guard: Step 2 (consent_given -> verification_started)
    const tStarted = transitionSession(session, 'verification_started', req, "Signature active verification started.");
    if (!tStarted.allowed) {
      return res.status(400).json({ error: "Bypass Blocked: Invalid session state transition sequence" });
    }

    // Capture User Identification linkage
    const linkedUserLink = db.partnerUserLinks.find(l => 
      l.partner_app_id === session.partner_app_id && 
      l.external_user_id === session.external_user_id
    );

    let targetUserId = linkedUserLink?.user_id;
    let isNewUser = false;

    if (!targetUserId) {
      isNewUser = true;
      targetUserId = `usr_${crypto.randomBytes(4).toString('hex')}`;
      
      const newUser: User = {
        id: targetUserId,
        status: "pending",
        human_uid: `human_hash_${crypto.randomBytes(4).toString('hex')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      db.users.unshift(newUser);

      const newLink: PartnerUserLink = {
        id: `link_${crypto.randomBytes(4).toString('hex')}`,
        partner_app_id: session.partner_app_id,
        user_id: targetUserId,
        external_user_id: session.external_user_id,
        created_at: new Date().toISOString()
      };
      db.partnerUserLinks.push(newLink);
    }

    // Verify template existence 
    const isNewDevice = !db.devices.some(d => d.user_id === targetUserId && d.device_fingerprint_hash === device_fingerprint_hash);

    // Evaluate Risk Signals
    const integrityPassed = integrity_token === "integrity_passed_token" || integrity_token === "mock_face_verified_true" || integrity_token === "signature_passed_token";
    
    // Evaluate if the duplicate signature mimics someone else
    const isDuplicateSignature = db.signatureTemplates.some(t => 
      t.template_hash === signature_hash && t.user_id !== targetUserId
    );

    const riskResult = evaluateRisk({
      integrityPassed,
      templateHash: signature_hash || "unknown_signature",
      deviceFingerprintHash: device_fingerprint_hash || "unknown_fingerprint",
      hasConsent: true,
      isNewDevice,
      rapidRequestsCount: 1,
      sessionExpired: false,
      userId: targetUserId
    });

    // Update Session Fields Statefully
    session.risk_score = riskResult.risk_score;
    session.duplicate_candidate = isDuplicateSignature;
    session.risk_reasons = riskResult.reasons;

    // Register Device
    const newDevice: Device = {
      id: `dev_${crypto.randomBytes(4).toString('hex')}`,
      user_id: targetUserId,
      device_public_key: device_public_key || "RSA_KEY_TEMP_PLACEHOLDER",
      device_fingerprint_hash: device_fingerprint_hash || "FINGERPRINT_HASH_PLACEHOLDER",
      platform: req.headers['user-agent']?.split(')')[0]?.split('(')[1] || "Web-BrowserClient",
      trusted: riskResult.risk_score < 70,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.devices.push(newDevice);

    // Enroll in signature database if low risk and passed integrity
    if (integrityPassed && !isDuplicateSignature) {
      const templateId = `tmpl_${crypto.randomBytes(4).toString('hex')}`;
      const newTemplate: SignatureTemplate = {
        id: templateId,
        user_id: targetUserId,
        template_hash: signature_hash || `sig_hash_${crypto.randomBytes(4).toString('hex')}`,
        encrypted_template: `U2FsdGVkX18BFE72F...[encrypted_signature_vector_version_signaturenet_v3]`,
        model_version: "signaturenet-v3",
        confidence_score: 97.2,
        created_at: new Date().toISOString()
      };
      db.signatureTemplates.push(newTemplate);
    }

    // Final state evaluation
    const activeProject = db.projects[0];
    const emMode = activeProject.enforcement_mode;

    if (riskResult.risk_score >= 70) {
      // Direct state transition
      transitionSession(session, 'verification_failed', req, "Anomalous user verification score triggers blocklist restrictions. Reason: " + riskResult.reasons.join(", "));
      
      const targetUserObj = db.users.find(u => u.id === targetUserId);
      if (targetUserObj) targetUserObj.status = "rejected";

      // Dispatch high risk webhook
      dispatchWebhook('aan.risk.high', session.external_user_id, riskResult.risk_level, 'deny', {
        risk_score: riskResult.risk_score,
        risk_reasons: riskResult.reasons
      });

      if (isDuplicateSignature) {
        dispatchWebhook('aan.duplicate.detected', session.external_user_id, riskResult.risk_level, 'deny', {
          signature_hash_summary: signature_hash ? signature_hash.substring(0, 12) + "..." : "unknown"
        });
      }
    } else if (riskResult.risk_score >= 35) {
      // Move to review
      transitionSession(session, 'review', req, "Unrecognized multi-device environment flags registered. Pending administrative manual override review.");
      
      dispatchWebhook('aan.reverification.required', session.external_user_id, riskResult.risk_level, 'manual_review', {
        risk_score: riskResult.risk_score,
        risk_reasons: riskResult.reasons
      });
    } else {
      // Move to passed
      const passTransition = transitionSession(session, 'verification_passed', req, "Fully preservation-compliant structural match succeeded. Signed Proof of Human token minted.");
      
      if (passTransition.allowed) {
        session.completed_at = new Date().toISOString();
        const uniquenessStatus = isDuplicateSignature ? 'duplicate' : 'unique';
        
        // cryptographic JWT-structured proof token signing
        session.proof_token = issueProofToken(session.external_user_id, session.id, 'verified', uniquenessStatus, riskResult.risk_level);

        // Move to proof_issued
        transitionSession(session, 'proof_issued', req, "Signed Proof of Human token successfully minted and released.");

        const targetUserObj = db.users.find(u => u.id === targetUserId);
        if (targetUserObj) {
          targetUserObj.status = "verified";
          targetUserObj.updated_at = new Date().toISOString();
        }

        // Dispatch verification completed webhook
        dispatchWebhook('aan.verification.completed', session.external_user_id, riskResult.risk_level, 'allow', {
          session_id: session.id,
          uniqueness_status: uniquenessStatus
        });
      }
    }

    appendAuditLog(
      'system',
      'signature_engine_v3',
      'signature.verify_outcome',
      'session',
      session.id,
      { risk_level: riskResult.risk_level, score: riskResult.risk_score, reasons: riskResult.reasons }
    );

    res.json({ status: "processing" });
  });

  // 4. POST /api/v1/proofs/verify
  // Third party check: Cryptographic signed proof validator matching returning tokens
  app.post("/api/v1/proofs/verify", (req, res) => {
    const proof_token = req.body.proof_token || req.body.trust_token;

    if (!proof_token) {
      return res.status(400).json({ error: "Missing required string parameter: proof_token or trust_token" });
    }

    const verificationResult = verifyHardwareProofToken(proof_token, req);

    if (!verificationResult.valid) {
      return res.status(400).json({
        valid: false,
        claims: null,
        error: verificationResult.error || "Signature verification failed: Invalid cryptographic proof_token integrity"
      });
    }

    const cl = verificationResult.claims || {};

    res.json({
      valid: true,
      claims: {
        // Blueprint fields
        partner_id: cl.partner_id || cl.project_id,
        session_id: cl.session_id,
        verification_status: cl.verification_status || (cl.human_status === 'verified' ? 'passed' : 'failed'),
        risk_level: cl.risk_level,
        timestamp: cl.timestamp || cl.issued_at,
        expires_at: cl.expires_at,

        // Legacy compatibility fields
        human_verified: cl.human_status === 'verified',
        unique_human: cl.uniqueness_status === 'unique',
        issued_at: cl.issued_at
      }
    });
  });

  // 5. POST /api/v1/verify-session
  // Core REST Integration API between partner login system and AAN risk grading
  app.post("/api/v1/verify-session", (req, res) => {
    const { partner_user_id, email_hash, phone_hash, ip_address, device_fingerprint, session_id, timestamp } = req.body;

    if (!partner_user_id) {
      return res.status(400).json({ error: "Missing required string parameter: partner_user_id" });
    }

    const apiKey = (req.headers['x-api-key'] || "").toString();
    let partnerApp = db.partnerApps[0];
    
    if (apiKey) {
      const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const finder = db.partnerApps.find(app => app.api_key_hash === hash);
      if (finder) {
        partnerApp = finder;
      }
    }

    const link = db.partnerUserLinks.find(l => l.external_user_id === partner_user_id && l.partner_app_id === partnerApp.id);
    let user = link ? db.users.find(u => u.id === link.user_id) : null;

    let duplicateSignalsFound = false;
    let duplicateUserId = "";

    const userEmailHash = email_hash || "";
    const userPhoneHash = phone_hash || "";
    if (userEmailHash.includes("duplicate") || userPhoneHash.includes("duplicate") || partner_user_id.includes("duplicate") || userEmailHash === "sha256_duplicate_user_char_99") {
      duplicateSignalsFound = true;
      duplicateUserId = "usr_b710ef67"; // Match Bob
    }

    const activeProject = db.projects[0];
    const emMode = activeProject?.enforcement_mode || "monitor_only";

    let riskScore = 12;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const riskReasons: string[] = [];

    if (duplicateSignalsFound) {
      riskScore = 85;
      riskLevel = 'high';
      riskReasons.push("duplicate_signature_template_hash");
    }

    if (device_fingerprint && user) {
      const knownDevice = db.devices.some(d => d.user_id === user!.id && d.device_fingerprint_hash === device_fingerprint);
      if (!knownDevice) {
        riskScore += 30;
        riskReasons.push("new_device_on_existing_user");
      }
    }

    if (riskScore >= 85) {
      riskLevel = 'critical';
    } else if (riskScore >= 70) {
      riskLevel = 'high';
    } else if (riskScore >= 35) {
      riskLevel = 'medium';
    }

    let recommendedAction: 'allow' | 'flag' | 'require_reverification' | 'deny' | 'manual_review' = 'allow';
    
    if (emMode === 'block_untrusted' && (riskLevel === 'high' || riskLevel === 'critical')) {
      recommendedAction = 'deny';
    } else if (emMode === 'require_reverification' && (!user || user.status !== 'verified')) {
      recommendedAction = 'require_reverification';
    } else if (emMode === 'flag_suspicious' && (riskLevel === 'high' || riskLevel === 'medium')) {
      recommendedAction = 'flag';
    } else if (riskLevel === 'medium') {
      recommendedAction = 'manual_review';
    } else if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendedAction = 'deny';
    }

    const verificationSessionId = session_id || `vss_${crypto.randomBytes(3).toString('hex')}`;
    let existingSession = db.verificationSessions.find(s => s.id === verificationSessionId);
    
    if (!existingSession) {
      existingSession = {
        id: verificationSessionId,
        partner_app_id: partnerApp.id,
        external_user_id: partner_user_id,
        status: user && user.status === 'verified' ? 'passed' : 'started',
        risk_score: riskScore,
        duplicate_candidate: duplicateSignalsFound,
        result_reason: `API verification checkpoint executed under policy guidelines. Enforcement mode: ${emMode}.`,
        risk_reasons: riskReasons,
        proof_token: "",
        created_at: new Date().toISOString(),
        completed_at: user && user.status === 'verified' ? new Date().toISOString() : null
      };
      supabaseService.createVerificationSession(existingSession, db.verificationSessions);
    }

    let humanStatus = 'pending';
    if (user) {
      if (user.status === 'verified' && riskLevel !== 'critical') {
        humanStatus = 'verified';
      } else if (user.status === 'rejected' || riskLevel === 'critical') {
        humanStatus = 'suspended';
      }
    }

    let uniquenessStatus = 'unchecked';
    if (humanStatus === 'verified') {
      uniquenessStatus = duplicateSignalsFound ? 'duplicate' : 'unique';
    }

    let proofToken = "";
    if (humanStatus === 'verified' && recommendedAction === 'allow') {
      proofToken = issueProofToken(partner_user_id, verificationSessionId, humanStatus, uniquenessStatus, riskLevel);
      existingSession.proof_token = proofToken;
      existingSession.status = 'passed';
      supabaseService.updateVerificationSession(existingSession.id, { proof_token: proofToken, status: 'passed' }, db.verificationSessions);
    }

    if (duplicateSignalsFound) {
      const exists = db.duplicateSignals.some(s => s.session_id === verificationSessionId);
      if (!exists) {
        db.duplicateSignals.unshift({
          id: `dup_${crypto.randomBytes(4).toString('hex')}`,
          project_id: activeProject.id,
          session_id: verificationSessionId,
          external_user_id: partner_user_id,
          duplicate_external_user_id: duplicateUserId,
          confidence: 99.1,
          created_at: new Date().toISOString()
        });
        
        dispatchWebhook('aan.duplicate.detected', partner_user_id, riskLevel, recommendedAction, {
          detected_duplicate_user: duplicateUserId,
          matching_confidence: 99.1
        });
      }
    }

    if (emMode === 'partner_removal' && (riskLevel === 'high' || riskLevel === 'critical')) {
      const exists = db.removalRequests.some(r => r.external_user_id === partner_user_id);
      if (!exists) {
        db.removalRequests.unshift({
          id: `rem_${crypto.randomBytes(4).toString('hex')}`,
          project_id: activeProject.id,
          external_user_id: partner_user_id,
          status: 'pending',
          reason: `High risk critical threat flagged during external API entry evaluation. Reasons: ${riskReasons.join(', ')}`,
          created_at: new Date().toISOString(),
          approved_at: null
        });

        dispatchWebhook('aan.account.removal_requested', partner_user_id, riskLevel, recommendedAction, {
          reason: `Auto flagged critical velocity and hash duplicate anomaly`
        });
      }
    }

    appendAuditLog('partner', partnerApp.id, 'session.verify_claim', 'session', verificationSessionId, {
      partner_user_id,
      risk_level: riskLevel,
      recommended_action: recommendedAction,
      human_status: humanStatus,
      uniqueness_status: uniquenessStatus
    });

    let decision: 'ALLOW' | 'REVIEW' | 'CHALLENGE' | 'DENY' = 'ALLOW';
    if (recommendedAction === 'allow') decision = 'ALLOW';
    else if (recommendedAction === 'manual_review' || recommendedAction === 'flag') decision = 'REVIEW';
    else if (recommendedAction === 'require_reverification') decision = 'CHALLENGE';
    else if (recommendedAction === 'deny') decision = 'DENY';

    res.json({
      // Blueprint Fields
      human_verified: humanStatus === 'verified',
      returning_user: !!user,
      risk_score: riskScore,
      uniqueness_score: duplicateSignalsFound ? 15 : (riskScore > 50 ? 65 : 98),
      decision: decision,
      proof_token: proofToken,
      reason_codes: riskReasons,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),

      // Legacy Compatibility Fields
      human_status: humanStatus,
      uniqueness_status: uniquenessStatus,
      risk_level: riskLevel,
      recommended_action: recommendedAction,
      session_id: verificationSessionId
    });
  });

  // 6. POST /api/v1/verify-proof-token
  // Proof verification endpoint confirming that a token was issued by AAN and matches the signature
  app.post("/api/v1/verify-proof-token", (req, res) => {
    const { proof_token } = req.body;

    if (!proof_token) {
      return res.status(400).json({ error: "Missing required parameter: proof_token" });
    }

    const verificationResult = verifyHardwareProofToken(proof_token, req);

    if (!verificationResult.valid) {
      return res.status(401).json({
        valid: false,
        error: verificationResult.error || "Cryptographic signature validation failure"
      });
    }

    res.json({
      valid: true,
      claims: verificationResult.claims
    });
  });


  // ============================================================================
  // INTERNAL FE DASHBOARD OPERATIONS (UI Data Bindings)
  // ============================================================================

  app.get("/api/internal/sessions", (req, res) => {
    res.json(db.verificationSessions);
  });

  app.get("/api/internal/users", (req, res) => {
    // Return users mapped safely without displaying encrypted templates
    res.json(db.users);
  });

  app.get("/api/internal/devices", (req, res) => {
    res.json(db.devices);
  });

  app.get("/api/internal/signatures", (req, res) => {
    // Expose metadata stats only for security compliance audits
    const complianceStats = db.signatureTemplates.map(t => ({
      id: t.id,
      user_id: t.user_id,
      template_hash: t.template_hash,
      encrypted_payload_hash: crypto.createHash('sha256').update(t.encrypted_template).digest('hex').substring(0, 16) + '...',
      model_version: t.model_version,
      confidence_score: t.confidence_score,
      created_at: t.created_at
    }));
    res.json(complianceStats);
  });

  app.get("/api/internal/audit-logs", (req, res) => {
    res.json(db.auditLogs);
  });

  app.post("/api/internal/audit-logs", (req, res) => {
    const { action, target_type, target_id, metadata } = req.body;
    appendAuditLog('partner', 'partner_super_user', action || 'profile.change', target_type || 'verification_profile', target_id || 'prof_standard', metadata || {});
    res.json({ success: true, count: db.auditLogs.length });
  });

  // ============================================================================
  // ADMINISTRATIVE SECURITY CONTROL ENDPOINTS
  // ============================================================================

  app.get("/api/internal/security-events", (req, res) => {
    const { severity, event_type, partner_app_id } = req.query;
    let filteredEvents = [...db.securityEvents];

    if (severity) {
      filteredEvents = filteredEvents.filter((e: any) => e.severity === severity);
    }
    if (event_type) {
      filteredEvents = filteredEvents.filter((e: any) => e.event_type === event_type);
    }
    if (partner_app_id) {
      filteredEvents = filteredEvents.filter((e: any) => e.partner_app_id === partner_app_id);
    }

    res.json(filteredEvents);
  });

  app.get("/api/internal/security-risk", (req, res) => {
    const { partner_app_id } = req.query;
    const stats = calculateIntrusionRiskScore(partner_app_id as string | undefined);
    res.json(stats);
  });

  app.post("/api/internal/security-events/:id/resolve", (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const event = db.securityEvents.find((e: any) => e.id === id);

    if (!event) {
      return res.status(404).json({ error: "Security event not found" });
    }

    event.raw_metadata = {
      ...(event.raw_metadata || {}),
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes || "System Administrator dismissed this intrusion flag."
    };

    appendAuditLog(
      'admin',
      'admin_super_user_one',
      'security_event.resolve',
      'security_event',
      id,
      { notes, event_type: event.event_type }
    );

    res.json({ success: true, event });
  });

  app.post("/api/internal/security-events/clear", (req, res) => {
    db.securityEvents = [...mockSecurityEvents];
    appendAuditLog('admin', 'admin_super_user_one', 'security_events.reset', 'security_event_table', 'all', {});
    res.json({ success: true, count: db.securityEvents.length });
  });

  // Action overrides (re-evaluating, suspending, and verifying)
  app.post("/api/internal/sessions/:id/action", (req, res) => {
    const { action } = req.body; // 'approve' | 'reject'
    const session = db.verificationSessions.find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const linkedUserLink = db.partnerUserLinks.find(l => 
      l.partner_app_id === session.partner_app_id && 
      l.external_user_id === session.external_user_id
    );

    if (action === "approve") {
      const oldScore = session.risk_score;
      if (oldScore >= 70 || session.duplicate_candidate) {
        const ip = (req.headers['x-forwarded-for'] || req.ip || "127.0.0.1").toString();
        const ua = (req.headers['user-agent'] || "Unknown").toString();
        appendSecurityEvent(
          'medium',
          'admin_override_anomaly',
          'admin',
          'admin_super_user_one',
          ip,
          ua,
          `Risky Admin Override Approved: Session ${session.id} verified despite high risk level (${oldScore}/100) or duplicate candidate flags.`,
          { previous_score: oldScore, duplicate_candidate: session.duplicate_candidate },
          session.id,
          session.partner_app_id,
          req.path
        );
      }

      session.status = "passed";
      session.risk_score = 5; // Reduced post manual audit review
      session.proof_token = `proof_claims_${crypto.randomBytes(3).toString('hex')}_sig_manual_${crypto.randomBytes(4).toString('hex')}`;
      session.completed_at = new Date().toISOString();
      session.result_reason = "Session manual override approved by System Administrator.";

      if (linkedUserLink) {
        const u = db.users.find(usr => usr.id === linkedUserLink.user_id);
        if (u) {
          u.status = "verified";
          u.updated_at = new Date().toISOString();
        }
      }
      appendAuditLog('admin', 'admin_super_user_one', 'session.override_approve', 'session', session.id, { previous_score: session.risk_score });
    } else {
      session.status = "failed";
      session.result_reason = "Session rejected under Administrative review security policy.";
      if (linkedUserLink) {
        const u = db.users.find(usr => usr.id === linkedUserLink.user_id);
        if (u) {
          u.status = "rejected";
          u.updated_at = new Date().toISOString();
        }
      }
      appendAuditLog('admin', 'admin_super_user_one', 'session.override_reject', 'session', session.id, { previous_score: session.risk_score });
    }

    res.json({ success: true, session });
  });

  app.post("/api/internal/users/:id/action", (req, res) => {
    const { action } = req.body; // 'suspend' | 'verify'
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (action === "suspend") {
      user.status = "suspended";
      appendAuditLog('admin', 'admin_super_user_one', 'user.suspend', 'user', user.id, {});
    } else {
      user.status = "verified";
      appendAuditLog('admin', 'admin_super_user_one', 'user.reinstate', 'user', user.id, {});
    }
    user.updated_at = new Date().toISOString();
    res.json({ success: true, user });
  });

  // Partner APIs management endpoints
  app.get("/api/internal/api-keys", (req, res) => {
    res.json(db.partnerApps);
  });

  app.post("/api/internal/api-keys", (req, res) => {
    const { name, webhook_url } = req.body;
    if (!name) return res.status(400).json({ error: "Missing partner name description" });

    const keyToken = `poh_key_${crypto.randomBytes(8).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(keyToken).digest('hex');

    const newPartner: PartnerApp = {
      id: `partner_apps_${crypto.randomBytes(4).toString('hex')}`,
      name,
      api_key_hash: keyHash,
      webhook_url: webhook_url || "",
      status: "active",
      created_at: new Date().toISOString()
    };

    supabaseService.savePartnerApp(newPartner, db.partnerApps);

    appendAuditLog('admin', 'admin_super_user_one', 'partner_app.create', 'partner_app', newPartner.id, { name });

    // Return the Unhashed plain key ONCE for the partner app interface (security-standard)
    res.json({
      partner: newPartner,
      plain_text_key_warning: keyToken
    });
  });

  app.post("/api/internal/partner-apps/:id/status", (req, res) => {
    const { action } = req.body; // 'suspend' | 'activate'
    const partner = db.partnerApps.find(p => p.id === req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner app not found" });

    partner.status = action === "suspend" ? "suspended" : "active";
    appendAuditLog('admin', 'admin_super_user_one', `partner_app.${action}`, 'partner_app', partner.id, {});
    
    res.json({ success: true, partner });
  });

  // Simulation support - allows users to trigger simulated webhook delivery from the playground dashboards
  app.post("/api/internal/sessions/:id/test-webhook", (req, res) => {
    const session = db.verificationSessions.find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const partner = db.partnerApps.find(p => p.id === session.partner_app_id);
    const webhookTarget = partner?.webhook_url || "https://partnerapp.com/webhooks/identity";

    // Simulate async POST delivery logging
    console.log(`[SIMULATED WEBHOOK TRIGGERED]`);
    console.log(`Target: POST ${webhookTarget}`);
    console.log(`Payload:`, {
      event: "verification.session_updated",
      session_id: session.id,
      external_user_id: session.external_user_id,
      status: session.status,
      risk_score: session.risk_score,
      proof_token: session.proof_token || null
    });

    res.json({
      success: true,
      delivered_to: webhookTarget,
      payload: {
        event: "verification.session_updated",
        session_id: session.id,
        external_user_id: session.external_user_id,
        status: session.status,
        risk_score: session.risk_score,
        proof_token: session.proof_token
      }
    });
  });

  // ============================================================================
  // DECOUPLED AI ENGINE & ROUTING ENDPOINTS (LAYER 2 & LAYER 3 CO-PILOT)
  // ============================================================================
  
  app.get("/api/internal/ai/config", (req, res) => {
    res.json({
      activeProvider,
      providers: AIEngine.getProviderSchema()
    });
  });

  app.post("/api/internal/ai/config", (req, res) => {
    const { provider } = req.body;
    const allowed: AIProvider[] = ['gemini', 'openai', 'anthropic', 'local_llm'];
    
    if (!provider || !allowed.includes(provider)) {
      return res.status(400).json({ error: "Invalid provider specified. Must be one of: gemini, openai, anthropic, local_llm" });
    }

    setActiveProvider(provider as AIProvider);
    appendAuditLog('admin', 'admin_super_user_one', 'ai.provider_changed', 'ai_engine', 'active_routing', {
      new_provider: provider,
      context: "Enterprise Provider Independence Strategy"
    });

    res.json({ success: true, activeProvider: provider });
  });

  app.post("/api/internal/ai/explain-risk", async (req, res) => {
    try {
      const { type, targetId } = req.body;
      if (!type || !targetId) {
        return res.status(400).json({ error: "Missing required parameters: type, targetId" });
      }

      let prompt = "";
      let systemInstruction = "You are AAN's decoupled AI Risk Analyzer. Summarize the raw data, highlight any anomalies, and explain the threat landscape. Keep the analysis factual and clear.";

      if (type === 'user') {
        const user = db.users.find(u => u.id === targetId);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Find linked sessions, devices, templates
        const sessions = db.verificationSessions.filter(s => s.external_user_id === user.id || s.id.includes(targetId.substring(4)));
        const devices = db.devices.filter(d => d.user_id === user.id);
        const templates = db.signatureTemplates.filter(t => t.user_id === user.id);

        prompt = `Analyze this user record:
User ID: ${user.id}
Status: ${user.status}
Created At: ${user.created_at}

Associated Sessions: ${JSON.stringify(sessions, null, 2)}
Associated Devices: ${JSON.stringify(devices, null, 2)}
Associated Signature Templates: ${JSON.stringify(templates, null, 2)}

Provide a security risk assessment, highlighting any Sybil patterns or device collisions. Recommend compliance actions (e.g., maintain suspension, require reverification).`;
      } else if (type === 'session') {
        const session = db.verificationSessions.find(s => s.id === targetId);
        if (!session) return res.status(404).json({ error: "Session not found" });

        prompt = `Analyze this verification session:
Session ID: ${session.id}
Partner App ID: ${session.partner_app_id}
External User ID: ${session.external_user_id}
Status: ${session.status}
Risk Score: ${session.risk_score}
Duplicate Candidate: ${session.duplicate_candidate}
Result Reason: ${session.result_reason}
Risk Reasons: ${JSON.stringify(session.risk_reasons)}
Created At: ${session.created_at}

Provide a forensic breakdown explaining exactly why this risk score was generated, what signal caused the flag, and how the partner application should react.`;
      } else if (type === 'security-event') {
        const event = db.securityEvents.find(e => e.id === targetId);
        if (!event) return res.status(404).json({ error: "Security event not found" });

        prompt = `Analyze this security intrusion alert:
Event ID: ${event.id}
Severity: ${event.severity}
Event Type: ${event.event_type}
Actor: ${event.actor_type} (ID: ${event.actor_id})
IP Address: ${event.ip_address}
User Agent: ${event.user_agent}
Request Path: ${event.request_path}
Detection Reason: ${event.detection_reason}
Metadata: ${JSON.stringify(event.raw_metadata, null, 2)}

Explain the nature of this attack vector (e.g. JWT signature bypass, impossible state transition), its potential business impact, and how AAN's deterministic core defended against it.`;
      } else {
        return res.status(400).json({ error: "Invalid type specified. Must be 'user', 'session', or 'security-event'" });
      }

      const aiResponse = await AIEngine.generateText(prompt, systemInstruction);
      res.json(aiResponse);
    } catch (err: any) {
      console.error("[AI ENGINE] Error generating risk explanation:", err);
      res.status(500).json({ error: "Failed to generate AI explanation" });
    }
  });

  app.post("/api/internal/ai/chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const systemInstruction = "You are AAN's Independent AI Security Investigator. Assist the compliance officer by searching and describing anomalies in logs. Emphasize that you are a cognitive copilot and do not make final trust decisions.";
      const aiResponse = await AIEngine.generateText(prompt, systemInstruction);
      res.json(aiResponse);
    } catch (err: any) {
      console.error("[AI ENGINE] Error in AI Copilot Chat:", err);
      res.status(500).json({ error: "Failed to query AI Copilot" });
    }
  });


  // ============================================================================
  // ENTERPRISE TRUST OPERATIONAL ENDPOINTS (AAN POLICY, TIMELINE, ENFORCEMENT)
  // ============================================================================

  // ============================================================================
  // BUG BOUNTY & RESPONSIBLE DISCLOSURE ENDPOINTS (TESLA-STYLE)
  // ============================================================================
  app.get("/api/internal/security-reports", (req, res) => {
    res.json(db.securityReports);
  });

  app.post("/api/internal/security-reports", async (req, res) => {
    try {
      const { title, category, severity, affected_system, reproduction_steps, submitted_evidence, reporter_contact } = req.body;
      
      if (!title || !category || !severity || !affected_system || !reproduction_steps || !reporter_contact) {
        return res.status(400).json({ error: "Missing required security report fields." });
      }

      const reportId = `rep_${crypto.randomBytes(4).toString('hex')}`;
      const newReport: SecurityReport = {
        id: reportId,
        title,
        category,
        severity,
        affected_system,
        reproduction_steps,
        submitted_evidence: submitted_evidence || "",
        reporter_contact,
        status: "new",
        bounty_amount: 0.00,
        internal_notes: "",
        created_at: new Date().toISOString(),
        resolved_at: null
      };

      await supabaseService.createSecurityReport(newReport, db.securityReports);

      appendAuditLog(
        'user',
        reporter_contact,
        'security_report.submitted',
        'security_report',
        reportId,
        { title, category, severity, affected_system }
      );

      res.json({ success: true, report: newReport });
    } catch (err: any) {
      console.error("[BUG BOUNTY] Error submitting security report:", err);
      res.status(500).json({ error: "Internal server error submitting report" });
    }
  });

  app.post("/api/internal/security-reports/:id/action", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, severity, status, bounty_amount, internal_notes, duplicate_of } = req.body;
      
      const report = db.securityReports.find(r => r.id === id);
      if (!report) {
        return res.status(404).json({ error: "Security report not found" });
      }

      const updates: Partial<SecurityReport> = {};
      let auditAction = 'security_report.update';

      if (action === 'triage') {
        updates.status = 'triaged';
        updates.internal_notes = internal_notes || report.internal_notes;
        auditAction = 'security_report.triaged';
      } else if (action === 'assign_severity') {
        updates.severity = severity;
        auditAction = 'security_report.severity_assigned';
      } else if (action === 'mark_duplicate') {
        updates.status = 'duplicate';
        updates.internal_notes = `Marked as duplicate of report ${duplicate_of}. ${internal_notes || ""}`.trim();
        auditAction = 'security_report.marked_duplicate';
      } else if (action === 'patch') {
        updates.status = 'patched';
        updates.internal_notes = internal_notes || report.internal_notes;
        updates.resolved_at = new Date().toISOString();
        auditAction = 'security_report.patched';
      } else if (action === 'approve_bounty') {
        updates.status = 'payout_approved';
        updates.bounty_amount = Number(bounty_amount) || 0;
        updates.internal_notes = internal_notes || report.internal_notes;
        auditAction = 'security_report.bounty_approved';
      } else if (action === 'payout') {
        updates.status = 'payout_paid';
        updates.internal_notes = internal_notes || report.internal_notes;
        auditAction = 'security_report.bounty_paid';
      } else if (action === 'close') {
        updates.status = 'closed';
        updates.resolved_at = report.resolved_at || new Date().toISOString();
        updates.internal_notes = internal_notes || report.internal_notes;
        auditAction = 'security_report.closed';
      } else if (action === 'update_notes') {
        updates.internal_notes = internal_notes;
        auditAction = 'security_report.notes_updated';
      } else if (action === 'reproduce') {
        updates.status = 'reproduced';
        updates.internal_notes = internal_notes || report.internal_notes;
        auditAction = 'security_report.reproduced';
      }

      await supabaseService.updateSecurityReport(id, updates, db.securityReports);

      appendAuditLog(
        'admin',
        'admin_super_user_one',
        auditAction,
        'security_report',
        id,
        { action, updates }
      );

      res.json({ success: true, report: { ...report, ...updates } });
    } catch (err: any) {
      console.error("[BUG BOUNTY] Error taking action on security report:", err);
      res.status(500).json({ error: "Internal server error executing action" });
    }
  });

  // 1. Policy Administration
  app.get("/api/internal/policies", (req, res) => {
    res.json(db.policies);
  });

  app.post("/api/internal/policies", (req, res) => {
    const { name, conditions, thenAction, description, id } = req.body;
    if (!name || !conditions || !thenAction) {
      return res.status(400).json({ error: "Missing required policy parameters" });
    }

    if (id) {
      // Update
      const policyIdx = db.policies.findIndex(p => p.id === id);
      if (policyIdx !== -1) {
        db.policies[policyIdx] = {
          ...db.policies[policyIdx],
          name,
          conditions,
          thenAction,
          description: description || db.policies[policyIdx].description
        };
        appendAuditLog('admin', 'admin_super_user_one', 'policy.update', 'policy', id, db.policies[policyIdx]);
        return res.json({ success: true, policy: db.policies[policyIdx] });
      }
    }

    // Create
    const newPolicy: Policy = {
      id: `pol_${Math.random().toString(36).substr(2, 9)}`,
      name,
      conditions,
      thenAction,
      active: true,
      description: description || "Custom developer-defined decision enforcement rule."
    };
    db.policies.push(newPolicy);
    appendAuditLog('admin', 'admin_super_user_one', 'policy.create', 'policy', newPolicy.id, newPolicy);
    res.json({ success: true, policy: newPolicy });
  });

  app.post("/api/internal/policies/:id/toggle", (req, res) => {
    const policy = db.policies.find(p => p.id === req.params.id);
    if (!policy) return res.status(404).json({ error: "Policy not found" });

    policy.active = !policy.active;
    appendAuditLog('admin', 'admin_super_user_one', 'policy.toggle', 'policy', policy.id, { active: policy.active });
    res.json({ success: true, policy });
  });

  app.post("/api/internal/policies/:id/delete", (req, res) => {
    const idx = db.policies.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Policy not found" });

    const deleted = db.policies.splice(idx, 1)[0];
    appendAuditLog('admin', 'admin_super_user_one', 'policy.delete', 'policy', req.params.id, deleted);
    res.json({ success: true, deleted });
  });

  // 2. Trust Timeline Queries
  app.get("/api/internal/timeline/global", (req, res) => {
    res.json(db.trustTimelines);
  });

  app.get("/api/internal/timeline/:userId", (req, res) => {
    const userTimeline = db.trustTimelines.filter(t => t.user_id === req.params.userId)
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(userTimeline);
  });

  app.post("/api/internal/timeline", (req, res) => {
    const { userId, event, description, trustScoreChange, sessionId } = req.body;
    if (!userId || !event || !description) {
      return res.status(400).json({ error: "Missing required timeline payload fields" });
    }

    const newTimelineEntry: TrustTimelineEntry = {
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      session_id: sessionId,
      event,
      timestamp: new Date().toISOString(),
      description,
      trustScoreChange: trustScoreChange || "Neutral"
    };

    db.trustTimelines.unshift(newTimelineEntry);
    res.json({ success: true, entry: newTimelineEntry });
  });

  // 3. Export Audit Data Files
  app.get("/api/internal/export-audit", (req, res) => {
    const logsJson = JSON.stringify(db.auditLogs, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=aan_audit_export.json");
    res.send(logsJson);
  });

  // Export verification sessions audit logs securely for organization admins
  app.get("/api/internal/export-verification-audit", (req, res) => {
    const activeProject = db.projects[0] || { id: "proj_security_777" };
    const activeOrg = db.organizations[0] || { id: "org_enterprise_999" };
    const requesterId = "admin_super_user_one";

    // Limit to most recent 500 logs
    const recentSessions = db.verificationSessions.slice(0, 500);

    const verifiedLogs = recentSessions.map(session => {
      // Risk level mapping based on numeric scores
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (session.risk_score >= 85) {
        riskLevel = 'critical';
      } else if (session.risk_score >= 70) {
        riskLevel = 'high';
      } else if (session.risk_score >= 35) {
        riskLevel = 'medium';
      }

      // Recommended action mapping based on risk score and status
      let recommendedAction = 'allow';
      if (session.risk_score >= 70) {
        recommendedAction = 'deny';
      } else if (session.risk_score >= 35) {
        recommendedAction = 'manual_review';
      } else if (session.status === 'passed') {
        recommendedAction = 'allow';
      } else if (session.status === 'review') {
        recommendedAction = 'manual_review';
      } else if (session.status === 'failed') {
        recommendedAction = 'deny';
      }

      // Human status mapping
      let humanStatus = 'pending';
      if (session.status === 'passed') {
        humanStatus = 'verified';
      } else if (session.status === 'failed') {
        humanStatus = 'suspended';
      } else if (session.status === 'review') {
        humanStatus = 'pending_review';
      }

      // Uniqueness status mapping based on duplicate status
      const uniquenessStatus = session.status === 'passed'
        ? (session.duplicate_candidate ? 'duplicate' : 'unique')
        : 'unchecked';

      // Hash/obfuscate proof token to protect privacy
      const proofTokenHash = session.proof_token
        ? crypto.createHash('sha256').update(session.proof_token).digest('hex')
        : null;

      // Determine related risk event ids using duplicate signals and threat markers
      const relativeDupSignals = db.duplicateSignals.filter(sig => sig.session_id === session.id);
      const relatedRiskEventIds = [
        ...relativeDupSignals.map(sig => sig.id),
        ...session.risk_reasons.map((r, i) => `risk_reason_${session.id}_${i}`)
      ];

      return {
        verification_session_id: session.id,
        partner_user_id: session.external_user_id,
        session_id: session.id,
        human_status: humanStatus,
        uniqueness_status: uniquenessStatus,
        risk_level: riskLevel,
        risk_score: session.risk_score,
        recommended_action: recommendedAction,
        proof_token_hash: proofTokenHash,
        created_at: session.created_at,
        completed_at: session.completed_at,
        related_risk_event_ids: relatedRiskEventIds
      };
    });

    const exportPayload = {
      label: "MVP audit snapshot",
      export_timestamp: new Date().toISOString(),
      organization_id: activeOrg.id,
      project_id: activeProject.id,
      requesting_admin_user_id: requesterId,
      verification_logs: verifiedLogs
    };

    // Prepend a high level audit log registering this export download instantly
    appendAuditLog(
      'admin',
      requesterId,
      'verification_logs.export',
      'project',
      activeProject.id,
      {
        count: verifiedLogs.length,
        label: "MVP audit snapshot"
      }
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=aan_verification_audit_${Date.now()}.json`);
    res.send(JSON.stringify(exportPayload, null, 2));
  });


  // ============================================================================
  // PUBLIC ENTERPRISE WEB API (V1 EXTENSIONS)
  // ============================================================================

  /**
   * POST /api/v1/trust/evaluate
   * Analyzes available signals statefully to deliver structured trust evidence.
   */
  app.post("/api/v1/trust/evaluate", (req, res) => {
    const { session_id, external_user_id } = req.body;
    
    // Attempt load of specified session or pick latest failed as a showcase of signals
    let session = db.verificationSessions.find(s => s.id === session_id || s.external_user_id === external_user_id);
    if (!session) {
      session = db.verificationSessions[0]; // fallback
    }

    // Map rich security factors based on session state
    const isFailed = session.status === "failed";
    const riskScore = session.risk_score;
    
    const deviceTrustScore = isFailed ? 25 : 92;
    const duplicateProb = isFailed ? 0.98 : 0.02;
    const automationLikelihood = isFailed ? "HIGH_INDICATORS" : "NEGLIGIBLE";
    const recommendation = riskScore > 75 ? "REJECT" : riskScore > 40 ? "CHALLENGE" : "ALLOW";

    res.json({
      evaluation_id: `eval_${crypto.randomBytes(6).toString('hex')}`,
      session_id: session.id,
      timestamp: new Date().toISOString(),
      trust_metrics: {
        human_confidence_score: isFailed ? 0.12 : 0.99,
        device_trust_score: deviceTrustScore,
        risk_score: riskScore,
        duplicate_account_probability: duplicateProb,
        session_integrity: isFailed ? "compromised" : "optimal"
      },
      signatures: {
        automation_indicators: isFailed ? ["emulator_detected", "browser_spoof", "high_velocity"] : ["none"],
        hardware_profile_reputation: isFailed ? "untrusted_residential_node" : "verified_primary_device",
        verified_assertion_signature: session.proof_token ? crypto.createHash('sha256').update(session.proof_token).digest('hex').substring(0, 32) : "unsigned_evidence_unapproved"
      },
      recommendation,
      policy_advisory: `Recommendation is advisory. AAN never enforces lockout unilaterally without approved institutional policy instructions.`
    });
  });

  /**
   * POST /api/v1/policy/evaluate
   * Preview rule triggers for a mock payload before forcing automated responses.
   */
  app.post("/api/v1/policy/evaluate", (req, res) => {
    const { device_trust_score, automation_confidence, duplicate_probability } = req.body;
    const matched: Policy[] = [];
    
    const devTrust = Number(device_trust_score) || 100;
    const autoConf = Number(automation_confidence) || 0;
    const dupProb = Number(duplicate_probability) || 0;

    db.policies.forEach(pol => {
      if (!pol.active) return;
      if (pol.id === "pol_1" && devTrust < 35 && autoConf > 90) {
        matched.push(pol);
      }
      if (pol.id === "pol_2" && dupProb > 95) {
        matched.push(pol);
      }
      if (pol.id === "pol_3" && devTrust < 60) {
        matched.push(pol);
      }
    });

    res.json({
      evaluation_time: new Date().toISOString(),
      payload_assessed: { device_trust_score: devTrust, automation_confidence: autoConf, duplicate_probability: dupProb },
      active_policies_triggered: matched,
      suggested_action: matched.length > 0 ? matched[0].thenAction : "none"
    });
  });

  /**
   * POST /api/v1/policy/enforce
   * Performs real state changes, timelines, and audit traces based on a triggered policy.
   */
  app.post("/api/v1/policy/enforce", (req, res) => {
    const { policy_id, user_id, session_id } = req.body;
    
    const policy = db.policies.find(p => p.id === policy_id);
    if (!policy) return res.status(404).json({ error: "Target policy not found or inactive" });

    const user = db.users.find(u => u.id === user_id);
    if (!user) return res.status(404).json({ error: "Target user not found" });

    const action = policy.thenAction;
    let description = "";

    if (action === "suspend") {
      user.status = "suspended";
      description = `Automatic enforcement: User suspended by system daemon triggering policy '${policy.name}'.`;
    } else if (action === "challenge") {
      user.status = "pending";
      description = `Automatic enforcement: Session token challenge initiated on user account based on policy '${policy.name}'.`;
    } else if (action === "remove_fraud") {
      // Purge completely as requested!
      description = `Automatic enforcement: Purged profile databases completely under compliance clearance. Policy: '${policy.name}'.`;
      
      // Perform deletion
      const userIdx = db.users.findIndex(u => u.id === user_id);
      if (userIdx !== -1) db.users.splice(userIdx, 1);
      
      // Delete their signature templates
      db.signatureTemplates = db.signatureTemplates.filter(t => t.user_id !== user_id);
      // Delete their known devices
      db.devices = db.devices.filter(d => d.user_id !== user_id);
    } else {
      description = `Policy '${policy.name}' evaluation completed. Advisory notification dispatched to security logs.`;
    }

    // If not removed entirely, update timestamp
    if (user && action !== "remove_fraud") {
      user.updated_at = new Date().toISOString();
    }

    // Record Event on global timelines
    const newTimelineEntry: TrustTimelineEntry = {
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user_id,
      session_id,
      event: `Policy Triggered: ${policy.name}`,
      timestamp: new Date().toISOString(),
      description,
      trustScoreChange: action === "suspend" ? "Suspended" : action === "remove_fraud" ? "Purged" : "Neutral"
    };
    db.trustTimelines.unshift(newTimelineEntry);

    // Write immutable audit log
    appendAuditLog('system', 'policy_engine_v1', `policy.enforced`, 'user', user_id, {
      policy_id: policy.id,
      enforced_action: action,
      outcome: description
    });

    res.json({
      success: true,
      enforced_policy: policy.name,
      remediation_action: action,
      status_outcome: description,
      timeline_logged: newTimelineEntry
    });
  });

  /**
   * POST /api/v1/account/challenge
   * Initiates session challenges statefully.
   */
  app.post("/api/v1/account/challenge", (req, res) => {
    const { user_id, session_id } = req.body;
    const user = db.users.find(u => u.id === user_id);
    if (!user) return res.status(404).json({ error: "User Account not found" });

    user.status = "pending";
    user.updated_at = new Date().toISOString();

    const desc = "Administrative core challenge requested. Cryptographic signature integrity validation required at next session entry.";
    
    // Add timeline & audit
    db.trustTimelines.unshift({
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      session_id,
      event: "Security Challenge Initiated",
      timestamp: new Date().toISOString(),
      description: desc,
      trustScoreChange: "-10 (Score: Challenge Mode)"
    });
    appendAuditLog('admin', 'admin_super_user_one', 'account.challenge', 'user', user.id, { session_id });

    res.json({ success: true, message: "Challenge dispatched successfully", user });
  });

  /**
   * POST /api/v1/account/suspend
   * Suspends a specific user account under customer approved policy scope.
   */
  app.post("/api/v1/account/suspend", (req, res) => {
    const { user_id, session_id, reason } = req.body;
    const user = db.users.find(u => u.id === user_id);
    if (!user) return res.status(404).json({ error: "User Account not found" });

    user.status = "suspended";
    user.updated_at = new Date().toISOString();

    const desc = reason || "Administrative security suspend issued. All downstream session scopes invalidated.";

    db.trustTimelines.unshift({
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      session_id,
      event: "Account Suspended",
      timestamp: new Date().toISOString(),
      description: desc,
      trustScoreChange: "Suspended"
    });
    appendAuditLog('admin', 'admin_super_user_one', 'account.suspend', 'user', user.id, { reason: desc });

    res.json({ success: true, message: "User suspended successfully", user });
  });

  /**
   * POST /api/v1/account/disable
   * Disables a user account under customer approved policy scope.
   */
  app.post("/api/v1/account/disable", (req, res) => {
    const { user_id, session_id } = req.body;
    const user = db.users.find(u => u.id === user_id);
    if (!user) return res.status(404).json({ error: "User Account not found" });

    user.status = "rejected"; // Disabled mapping
    user.updated_at = new Date().toISOString();

    db.trustTimelines.unshift({
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      session_id,
      event: "Account Disabled",
      timestamp: new Date().toISOString(),
      description: "User profile set to disabled state. Authentication tokens revoked.",
      trustScoreChange: "Disabled"
    });
    appendAuditLog('admin', 'admin_super_user_one', 'account.disable', 'user', user.id, {});

    res.json({ success: true, message: "User disabled successfully", user });
  });

  /**
   * POST /api/v1/account/merge
   * Combines verified identity profiles when duplicate template hashes occur.
   */
  app.post("/api/v1/account/merge", (req, res) => {
    const { source_user_id, target_user_id } = req.body;
    const srcUser = db.users.find(u => u.id === source_user_id);
    const tgtUser = db.users.find(u => u.id === target_user_id);
    
    if (!srcUser || !tgtUser) return res.status(404).json({ error: "One or both user accounts not found in directory" });

    // Simulate merge
    srcUser.status = "rejected"; // mark as secondary deactivated
    srcUser.updated_at = new Date().toISOString();

    tgtUser.status = "verified";
    tgtUser.updated_at = new Date().toISOString();

    // Map source link vectors to target
    db.partnerUserLinks.filter(l => l.user_id === source_user_id).forEach(l => {
      l.user_id = target_user_id; // link mapping transferred
    });

    db.trustTimelines.unshift({
      id: `tl_${Math.random().toString(36).substr(2, 9)}`,
      user_id: target_user_id,
      event: "Twin Profiles Merged",
      timestamp: new Date().toISOString(),
      description: `Integrates duplicate template history of source user ${source_user_id} into unified record under administrative authorization.`,
      trustScoreChange: "Consolidated"
    });

    appendAuditLog('admin', 'admin_super_user_one', 'account.merge', 'user', target_user_id, { merged_source_user: source_user_id });

    res.json({ success: true, message: "Profiles merged statefully", consolidated_user: tgtUser });
  });

  /**
   * POST /api/v1/account/remove
   * DELETES unwanted or fraudulent profiles completely with approved institutional authority.
   */
  app.post("/api/v1/account/remove", (req, res) => {
    const { user_id, approved_by_institution } = req.body;
    if (!user_id) return res.status(400).json({ error: "Missing Target user_id profile to delete" });
    if (!approved_by_institution) {
      return res.status(403).json({ error: "Institution clearance checkbox is required to execute a hard database purge of account files." });
    }

    const user = db.users.find(u => u.id === user_id);
    if (!user) return res.status(404).json({ error: "Target profile not found in active in-memory directory." });

    // Perform permanent relational deletion of all associated profile files
    db.users = db.users.filter(u => u.id !== user_id);
    db.signatureTemplates = db.signatureTemplates.filter(t => t.user_id !== user_id);
    db.devices = db.devices.filter(d => d.user_id !== user_id);
    
    const associatedLinks = db.partnerUserLinks.filter(l => l.user_id === user_id);
    db.partnerUserLinks = db.partnerUserLinks.filter(l => l.user_id !== user_id);

    // Generate permanent security immutable audit trail log
    appendAuditLog('admin', 'admin_super_user_one', 'account.purge_deleted', 'user', user_id, {
      approved_by: "Institutional Security Operator Clearance Token",
      signature_purged: true,
      devices_purged: true,
      partner_links_revokedCount: associatedLinks.length
    });

    res.json({
      success: true,
      message: "COMPLETELY PURGED Profile. All signature hashes, physical device signatures, and platform user links have been permanently deleted from storage.",
      purged_id: user_id,
      remediation: "DATABASE_CLEANSE_COMPLETE"
    });
  });

  // ============================================================================
  // PARTNER INFRASTRUCTURE CONFIGURATION ENDPOINTS (INTERNAL)
  // ============================================================================
  
  app.get("/api/internal/partner-config", (req, res) => {
    const project = db.projects[0];
    const org = db.organizations[0];
    res.json({
      organization: org,
      project: project,
      supabase_connected: isSupabaseConnected()
    });
  });

  app.post("/api/internal/partner-config", (req, res) => {
    const { org_name, proj_name, allowed_domains, enforcement_mode, webhook_url } = req.body;
    
    if (org_name && db.organizations[0]) {
      db.organizations[0].name = org_name;
    }
    
    if (db.projects[0]) {
      if (proj_name) db.projects[0].name = proj_name;
      if (allowed_domains) db.projects[0].allowed_domains = Array.isArray(allowed_domains) ? allowed_domains : allowed_domains.split(',').map((d: string) => d.trim());
      if (enforcement_mode) db.projects[0].enforcement_mode = enforcement_mode;
    }

    if (webhook_url && db.partnerApps[0]) {
      db.partnerApps[0].webhook_url = webhook_url;
    }

    appendAuditLog('partner', 'partner_super_user', 'partner_config.update', 'project', db.projects[0].id, {
      org_name,
      proj_name,
      enforcement_mode,
      allowed_domains,
      webhook_url
    });

    res.json({ success: true, project: db.projects[0], organization: db.organizations[0] });
  });

  app.get("/api/internal/webhook-deliveries", (req, res) => {
    res.json(db.webhookDeliveries);
  });

  app.get("/api/internal/duplicate-signals", (req, res) => {
    res.json(db.duplicateSignals);
  });

  app.get("/api/internal/removal-requests", (req, res) => {
    res.json(db.removalRequests);
  });

  app.post("/api/internal/removal-requests/:id/approve", (req, res) => {
    const request = db.removalRequests.find(r => r.id === req.params.id);
    if (!request) return res.status(404).json({ error: "Removal request not found" });

    const link = db.partnerUserLinks.find(l => l.external_user_id === request.external_user_id);
    if (link) {
      const userId = link.user_id;
      db.users = db.users.filter(u => u.id !== userId);
      db.signatureTemplates = db.signatureTemplates.filter(t => t.user_id !== userId);
      db.devices = db.devices.filter(d => d.user_id !== userId);
      db.partnerUserLinks = db.partnerUserLinks.filter(l => l.user_id !== userId);
    }

    request.status = 'approved';
    request.approved_at = new Date().toISOString();

    appendAuditLog('partner', 'partner_operator', 'account.removal_approved', 'user', request.external_user_id, {
      reason: request.reason,
      approved_at: request.approved_at
    });

    res.json({ success: true, request });
  });


  // ============================================================================
  // VITE RENDER ENVIRONMENT SETUPS (Dev vs Production)
  // ============================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Verification Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to bootstrap server core logic", err);
  process.exit(1);
});
