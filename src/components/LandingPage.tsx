import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  Code, 
  Cpu, 
  ArrowRight, 
  Terminal, 
  FileCode, 
  Check, 
  Layers, 
  RefreshCw, 
  Globe, 
  Clock, 
  Server, 
  AlertTriangle,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Info,
  ChevronRight,
  AlertCircle,
  Smartphone,
  Network,
  Fingerprint,
  Send,
  Sliders,
  Database
} from 'lucide-react';
import { isBrandEnabled } from '../brandConfig';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

const INTEGRATION_CODE_EXAMPLES: Record<string, { desc: string; filename: string; code: string; lang: string }> = {
  curl: {
    lang: "cURL",
    desc: "Step 1: Create a Trust Session when a user takes a critical action or starts signing up.",
    filename: "create_trust_session.sh",
    code: `curl -X POST https://api.aan.com/v1/trust-sessions \\
  -H "Authorization: Bearer aan_key_live_d8134fa" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "usr_9941a_customer",
    "profile": "standard_trust"
  }'`
  },
  typescript: {
    lang: "TypeScript",
    desc: "Step 2 & 3: Create the session, redirect the user, and validate the Trust Token returned upon completion.",
    filename: "verify_flow.ts",
    code: `import { AANClient } from '@aan-protocol/node-sdk';

const aan = new AANClient({ apiKey: process.env.AAN_API_KEY });

// 1. Create a Trust Session
const session = await aan.sessions.create({
  userId: 'usr_9941a_customer',
  profile: 'standard_trust'
});

// 2. Redirect the user when needed (to session.url)
// 3. Validate the Trust Token once the user returns
const result = await aan.tokens.validate({
  sessionId: session.id,
  token: req.body.trustToken
});

// 4. Continue your authentication flow with confidence
if (result.isHuman && !result.isSuspicious) {
  await loginUser(userId);
}`
  },
  python: {
    lang: "Python",
    desc: "Step 3: Validate the Trust Token server-side to inspect the final trust status and risk score.",
    filename: "validate_token.py",
    code: `import requests

# 3. Validate the Trust Token
response = requests.post(
    "https://api.aan.com/v1/proofs/verify",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "session_id": "vss_session_b71",
        "trust_token": "token_sig_93f82e11ac0b"
    }
)

# 4. Inspect status and proceed
result = response.json()
if result["status"] == "passed":
    # Legitimate human returning
    proceed_with_auth()`
  }
};

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [activeLang, setActiveLang] = useState<string>('curl');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Dynamic Real Database States
  const [sessions, setSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>([]);
  const [loadingRealData, setLoadingRealData] = useState<boolean>(true);
  
  // Playback & Selection States
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [playbackStage, setPlaybackStage] = useState<number>(-1); // -1 means no active playback
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState<boolean>(false);
  const [activeNode, setActiveNode] = useState<string>("trust_engine");

  // Fetch true states from real backend
  const fetchLiveStates = async () => {
    try {
      // Offline fallback defaults for seamless standalone preview resilience
      const fallbackSessions = [
        {
          id: "vss_session_unconfirmed_9a4",
          partner_app_id: "partner_apps_fintech_123",
          external_user_id: "fintech_external_alice_77",
          status: "started",
          risk_score: 15,
          duplicate_candidate: false,
          result_reason: "Session initialized/awaiting trust verification.",
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
          result_reason: "Trust signature unique; attestation checks passed.",
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
          result_reason: "Critical: Duplicate signature template identified matching user usr_b710ef67. Integrity checks failed.",
          risk_reasons: ["duplicate_signature_template_hash", "many_accounts_on_one_device", "failed_integrity_handshake"],
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

      const fallbackAuditLogs = [
        {
          id: "log_1",
          actor_type: "partner",
          actor_id: "partner_apps_fintech_123",
          action: "session.create",
          target_type: "session",
          target_id: "vss_session_unconfirmed_9a4",
          metadata: { ext_usr: "fintech_external_alice_77", client_ip: "198.51.100.41", level: "human_unique" },
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        }
      ];

      const fallbackWebhooks = [
        {
          id: "wh_del_1",
          project_id: "proj_security_777",
          event_type: "aan.verification.completed",
          url: "https://poh-partner.com/api/webhooks/aan",
          payload: "{}",
          status: "success",
          response_code: 200,
          response_body: "{\"received\":true}",
          attempts: 1,
          created_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString()
        }
      ];

      const [sessRes, auditRes, whRes] = await Promise.all([
        fetch('/api/internal/sessions').catch((err) => {
          console.warn("Using offline fallback sessions:", err.message || err);
          return null;
        }),
        fetch('/api/internal/audit-logs').catch((err) => {
          console.warn("Using offline fallback audit logs:", err.message || err);
          return null;
        }),
        fetch('/api/internal/webhook-deliveries').catch((err) => {
          console.warn("Using offline fallback webhooks:", err.message || err);
          return null;
        }),
      ]);

      let sessionsSet = false;
      if (sessRes && sessRes.ok) {
        try {
          const contentType = sessRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const sessData = await sessRes.json();
            if (Array.isArray(sessData)) {
              setSessions(sessData);
              sessionsSet = true;
            }
          }
        } catch (jsonErr) {
          console.warn("Failed to parse sessions JSON:", jsonErr);
        }
      }
      if (!sessionsSet) {
        setSessions(fallbackSessions);
      }

      let auditLogsSet = false;
      if (auditRes && auditRes.ok) {
        try {
          const contentType = auditRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const auditData = await auditRes.json();
            if (Array.isArray(auditData)) {
              setAuditLogs(auditData);
              auditLogsSet = true;
            }
          }
        } catch (jsonErr) {
          console.warn("Failed to parse audit logs JSON:", jsonErr);
        }
      }
      if (!auditLogsSet) {
        setAuditLogs(fallbackAuditLogs);
      }

      let webhooksSet = false;
      if (whRes && whRes.ok) {
        try {
          const contentType = whRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const whData = await whRes.json();
            if (Array.isArray(whData)) {
              setWebhookDeliveries(whData);
              webhooksSet = true;
            }
          }
        } catch (jsonErr) {
          console.warn("Failed to parse webhooks JSON:", jsonErr);
        }
      }
      if (!webhooksSet) {
        setWebhookDeliveries(fallbackWebhooks);
      }
    } catch (e) {
      console.warn("Offline fetch fallback executed:", e);
    } finally {
      setLoadingRealData(false);
    }
  };

  useEffect(() => {
    fetchLiveStates();
    const pollInterval = setInterval(fetchLiveStates, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  // Verification Path Playback Timer Loop
  useEffect(() => {
    let timer: any;
    if (isPlaybackPlaying && playbackStage >= 0 && playbackStage <= 6) {
      timer = setTimeout(() => {
        setPlaybackStage(prev => {
          if (prev < 6) {
            // Set active node to follow playback path for intuitive inspection
            const stageNodes = ["client_request", "api_gateway", "authentication", "trust_engine", "decision_engine", "signed_token", "partner_response"];
            setActiveNode(stageNodes[prev + 1]);
            return prev + 1;
          } else {
            setIsPlaybackPlaying(false);
            return prev;
          }
        });
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isPlaybackPlaying, playbackStage]);

  const triggerPlayback = (session: any) => {
    setSelectedSession(session);
    setPlaybackStage(0);
    setIsPlaybackPlaying(true);
    setActiveNode("client_request");
  };

  const stopPlayback = () => {
    setIsPlaybackPlaying(false);
    setPlaybackStage(-1);
    setSelectedSession(null);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Metric Computations based on real-time fetched application state
  const activeSessionsCount = sessions.filter(s => 
    ['created', 'started', 'consent_given', 'verification_started', 'review'].includes(s.status)
  ).length;

  const successfulCount = sessions.filter(s => ['passed', 'proof_issued'].includes(s.status)).length;
  const rejectedCount = sessions.filter(s => s.status === 'failed').length;
  const challengeCount = sessions.filter(s => s.status === 'review').length;

  const completedSessions = sessions.filter(s => s.completed_at && s.created_at);
  const avgVerificationTime = completedSessions.length > 0 
    ? (completedSessions.reduce((acc, s) => {
        const diff = new Date(s.completed_at!).getTime() - new Date(s.created_at).getTime();
        return acc + diff;
      }, 0) / completedSessions.length / 1000).toFixed(2) + "s"
    : "1.25s";

  const scoredSessions = sessions.filter(s => s.status !== 'created' && s.status !== 'started');
  const avgTrustScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((acc, s) => acc + (100 - (s.risk_score || 0)), 0) / scoredSessions.length) + "%"
    : "92%";

  const totalConcluded = sessions.filter(s => ['passed', 'proof_issued', 'failed'].includes(s.status)).length;
  const successRate = totalConcluded > 0
    ? ((successfulCount / totalConcluded) * 100).toFixed(1) + "%"
    : "100%";

  const tokensIssuedCount = sessions.filter(s => s.proof_token && s.proof_token !== "").length;
  const pendingWebhooksCount = webhookDeliveries.filter(d => d.status === 'pending' || d.status === 'failed').length;
  const avgApiLatency = "14.2ms";

  // Map database sessions to Log rows
  const mappedSessions = sessions.map(s => {
    const orgMap: Record<string, string> = {
      "partner_apps_fintech_123": "Fintech Trust",
      "partner_apps_dao_456": "IdentityBlock DAO"
    };
    const org = orgMap[s.partner_app_id] || "Enterprise Hub";
    
    let action = "Session initialized";
    if (s.status === "passed") action = "Verification Proof Signed";
    else if (s.status === "failed") action = "Duplicate Attempt Blocked";
    else if (s.status === "review") action = "Verification Deferred for Review";
    else if (s.status === "started") action = "User Edge Handshake";
    else if (s.status === "consent_given") action = "Privacy Consent Recorded";
    else if (s.status === "verification_started") action = "Postural Telemetry Analysis";
    else if (s.status === "proof_issued") action = "Cryptographic Attestation Issued";

    return {
      id: s.id,
      raw: s,
      org,
      action,
      status: s.status === "failed" ? "rejected" as const : "passed" as const,
      timestamp: new Date(s.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latency: s.completed_at ? `${Math.floor((new Date(s.completed_at).getTime() - new Date(s.created_at).getTime()) / 100) / 10}s` : "Pending"
    };
  });

  // Pipeline stage nodes configurations
  const pipelineStages = [
    { id: "client_request", label: "Client Request", icon: Smartphone, index: 0 },
    { id: "api_gateway", label: "API Gateway", icon: Network, index: 1 },
    { id: "authentication", label: "Authentication", icon: Lock, index: 2 },
    { id: "trust_engine", label: "AAN Trust Engine", icon: Cpu, index: 3 },
    { id: "decision_engine", label: "Decision Engine", icon: Sliders, index: 4 },
    { id: "signed_token", label: "Signed Token", icon: Fingerprint, index: 5 },
    { id: "partner_response", label: "Partner Response", icon: Send, index: 6 }
  ];

  // Logic to determine stage status for specific transaction playbacks vs. nominal system states
  const getStageStatus = (stageIndex: number) => {
    if (selectedSession) {
      if (playbackStage < stageIndex) {
        return 'waiting';
      } else if (playbackStage === stageIndex) {
        return 'processing';
      } else {
        // Evaluate based on the completed transaction details
        if (stageIndex === 3) { // Trust Engine
          if (selectedSession.status === 'failed') return 'failed';
          if (selectedSession.status === 'review') return 'warning';
          return 'completed';
        }
        if (stageIndex === 4) { // Decision Engine
          if (selectedSession.status === 'failed') return 'failed';
          if (selectedSession.status === 'review') return 'warning';
          return 'completed';
        }
        if (stageIndex === 5) { // Signed Token
          if (selectedSession.status === 'failed') return 'failed';
          if (selectedSession.status === 'review') return 'waiting'; // Token bypassed
          return 'completed';
        }
        return 'completed';
      }
    }
    return 'completed'; // nominal green state
  };

  // Retrieve current active node specifications
  const getNodeDetailContent = () => {
    const node = activeNode || "trust_engine";
    
    if (node === "client_request") {
      return {
        title: "Client Request Pipeline",
        desc: "Secure attestation initiation handshake triggered by the parent platform client agent.",
        metrics: [
          { label: "Request Ingress protocol", value: "HTTPS / TLS 1.3" },
          { label: "Incoming payload structure", value: "Strict Type-Safe JSON" },
          { label: "Average package payload size", value: "1.42 KB" }
        ],
        sessionDetails: selectedSession ? [
          { label: "Trust Session ID", value: selectedSession.id },
          { label: "Partner Application ID", value: selectedSession.partner_app_id },
          { label: "Ingress User identifier", value: selectedSession.external_user_id },
          { label: "Request initialized at", value: new Date(selectedSession.created_at).toLocaleString() }
        ] : null
      };
    }

    if (node === "api_gateway") {
      return {
        title: "Edge API Gateway Ingress",
        desc: "Cloudflare edge validation routing, API Key signature matches, and rate limit validation.",
        metrics: [
          { label: "Ingress Router latency", value: "3.84ms" },
          { label: "Active request volume", value: `${sessions.length + 8} active/min` },
          { label: "Ingress error rate", value: "0.00%" }
        ],
        sessionDetails: selectedSession ? [
          { label: "Matched API Route", value: `/api/v1/trust-sessions/${selectedSession.id}` },
          { label: "Client Ingress IP", value: selectedSession.status === 'failed' ? "198.51.100.12" : "203.0.113.88" },
          { label: "Request User Agent", value: selectedSession.status === 'failed' ? "Mozilla/5.0 (Windows NT)" : "AAN-Partner-Client/v1" },
          { label: "Verification Level", value: "human_unique_returning" }
        ] : null
      };
    }

    if (node === "authentication") {
      return {
        title: "Platform Authentication & Consent",
        desc: "Validates API credentials of the dispatching partner and verifies the explicit user privacy consent.",
        metrics: [
          { label: "API Key Validation", value: "PASSED" },
          { label: "Privacy Consent recorded", value: "True (Encrypted Ledger)" },
          { label: "Credential encryption scheme", value: "SHA-256 Hashing" }
        ],
        sessionDetails: selectedSession ? [
          { label: "API Client state", value: "AUTHORIZED" },
          { label: "Consent registered", value: selectedSession.status !== 'started' ? "CONFIRMED" : "PENDING" },
          { label: "Required disclosures", value: "Device Trust Signal, Uniqueness Check" },
          { label: "Privacy protection class", value: "Zero Identity Exposure (ZIE)" }
        ] : null
      };
    }

    if (node === "trust_engine") {
      return {
        title: "AAN Core Trust Engine",
        desc: "Performs strict mathematical checks regarding biological presence, device trust, and template uniqueness.",
        metrics: [
          { label: "Internal evaluation pipeline", value: "7 sequential checkers" },
          { label: "Template comparison speed", value: `${sessions.length * 3 + 12} queries/sec` },
          { label: "Coordinated duplicate prevention rate", value: "99.98% accuracy" }
        ],
        sessionDetails: selectedSession ? [
          { label: "1. Session Validation status", value: "PASSED (Active session)" },
          { label: "2. Device Integrity rating", value: selectedSession.risk_reasons.includes("many_accounts_on_one_device") ? "LOW (Attestation Fingerprint duplicated)" : "HIGH (Trusted client hardware)" },
          { label: "3. Duplicate signature check", value: selectedSession.risk_reasons.includes("duplicate_signature_template_hash") ? "CRITICAL DUPLICATE DETECTED (usr_b710ef67)" : "UNIQUE (No alternate user template matched)" },
          { label: "4. Returning User matching", value: selectedSession.status === 'passed' ? "RECOGNIZED RETURNING USER (usr_b710ef67)" : "NEW SYSTEM ENROLLMENT" },
          { label: "5. Risk engine valuation", value: `${selectedSession.risk_score}/100 Risk Score` },
          { label: "6. Velocity spam throttling", value: "PASSED (Nominal request interval)" },
          { label: "7. Verification verdict", value: selectedSession.result_reason }
        ] : null
      };
    }

    if (node === "decision_engine") {
      return {
        title: "Dynamic Policy & Decision Engine",
        desc: "Fuses risk engine outputs and applies specific partner rules to assign the ultimate verification verdict.",
        metrics: [
          { label: "Enforced default policy", value: "Default Secure Integration Policy" },
          { label: "Dynamic rule enforcement", value: "suspend_if_high_risk" },
          { label: "Average decision latency", value: "0.45ms" }
        ],
        sessionDetails: selectedSession ? [
          { label: "Calculated risk score", value: `${selectedSession.risk_score}/100` },
          { label: "Final verification verdict", value: selectedSession.status === 'failed' ? "REJECTED" : selectedSession.status === 'review' ? "CHALLENGE REQUIRED" : "APPROVED" },
          { label: "Executed Remediation", value: selectedSession.status === 'failed' ? "suspend_credentials" : selectedSession.status === 'review' ? "re_challenge" : "issue_allow_token" },
          { label: "Policy overrides triggered", value: "None (Standard compliance)" }
        ] : null
      };
    }

    if (node === "signed_token") {
      return {
        title: "Signed Proof Token Minting",
        desc: "Encodes the anonymous verification result into an asymmetric single-use proof token for secure client handshake.",
        metrics: [
          { label: "Cryptographic signature scheme", value: "HMAC-SHA256" },
          { label: "Minted proof model format", value: "poh_claims_jwt_v1" },
          { label: "Authorized Token lifetime", value: "30-Day Platform Expiration" }
        ],
        sessionDetails: selectedSession ? [
          { label: "Cryptographic signature issued", value: selectedSession.proof_token ? "TRUE" : "FALSE (Bypassed due to session state)" },
          { label: "Proof token stub", value: selectedSession.proof_token ? `${selectedSession.proof_token.substring(0, 32)}...` : "None generated" },
          { label: "Encoded claims", value: selectedSession.proof_token ? "uniqueness_attested: true, low_risk: true" : "None" },
          { label: "Token audience target", value: selectedSession.partner_app_id }
        ] : null
      };
    }

    if (node === "partner_response") {
      return {
        title: "Platform Webhook & Client Redirect",
        desc: "Transfers the signed proof token to the partner platform and triggers the secure redirect callback.",
        metrics: [
          { label: "Webhook dispatch queue", value: "0 pending" },
          { label: "Deliveries status", value: "100.0% delivery rate" },
          { label: "Average dispatch time", value: "145ms" }
        ],
        sessionDetails: selectedSession ? [
          { label: "Target callback webhook", value: selectedSession.partner_app_id === "partner_apps_fintech_123" ? "https://api.fintechsecure.com/webhooks/poh" : "https://dao.identityblock.org/identity-sync" },
          { label: "HTTP Callback payload delivery", value: selectedSession.status !== 'started' ? "SUCCESS (HTTP 200)" : "WAITING" },
          { label: "Client browser redirect link", value: selectedSession.partner_app_id === "partner_apps_fintech_123" ? "https://poh-partner.com/verify-callback" : "https://dao.identityblock.org/verify-callback" },
          { label: "Webhook delivery validation hash", value: selectedSession.status !== 'started' ? "whsig_93f82e11ac0b..." : "None" }
        ] : null
      };
    }

    return null;
  };

  const details = getNodeDetailContent();

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e5eb] font-sans selection:bg-[#202533] selection:text-white pb-24">
      
      {/* Dynamic styles to inject CSS lines flow animations cleanly */}
      <style>{`
        @keyframes aan-flow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .aan-flow-line {
          stroke-dasharray: 6, 4;
          animation: aan-flow 0.8s linear infinite;
        }
        @keyframes border-glow-blue {
          0%, 100% { border-color: rgba(37, 99, 235, 0.3); box-shadow: 0 0 4px rgba(37, 99, 235, 0.1); }
          50% { border-color: rgba(37, 99, 235, 0.8); box-shadow: 0 0 12px rgba(37, 99, 235, 0.3); }
        }
        .aan-pulse-active-node {
          animation: border-glow-blue 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Infrastructure Top Status Bar */}
      <div className="bg-[#111319] border-b border-[#1b1e28] py-2.5 px-6 font-mono text-[11px] text-[#78819a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AAN GLOBAL NETWORK: ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Uptime: <span className="text-[#a5b0cb] font-semibold">99.9997%</span></span>
            <span>API Response Latency: <span className="text-emerald-400 font-semibold">{avgApiLatency} AVG</span></span>
            <span>Ledger Nodes Online: <span className="text-[#a5b0cb] font-semibold">124/124</span></span>
          </div>
        </div>
      </div>

      {/* Main Structural Navigation bar */}
      <nav className="border-b border-[#1b1e28] bg-[#0d0e12]">
        <div className="max-w-7xl mx-auto px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#141822] border border-[#232a3b] p-1.5 rounded">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-[#5d6780] uppercase leading-none block font-black">Trust Layer Standard</span>
              <span className="font-bold text-sm tracking-tight text-white">Anonymous Attestation Network</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-xs font-mono">
            <button 
              onClick={() => onNavigate('partner')} 
              className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
            >
              Control Plane
            </button>
            <button 
              onClick={() => onNavigate('admin')} 
              className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
            >
              Compliance Ledger
            </button>
            {isBrandEnabled() && (
              <button 
                onClick={() => onNavigate('brand')} 
                className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
              >
                System Spec
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MVP Sandbox Advisory */}
      <div className="max-w-7xl mx-auto px-8 mt-4">
        <div className="bg-[#14151b] border border-amber-900/30 rounded-lg p-4 text-xs text-[#d2ab6c] leading-relaxed font-sans flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#d2ab6c] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">MOCK INTEGRATION PREVIEW — Administrative Sandbox Mode</p>
            <p className="text-[#7f889c]">
              This portal demonstrates the complete architectural flow of the Anonymous Attestation Network. All cryptographic signature checks and device security checks are processed inside the local sandbox environment. In production, connect real hardware, device reputation, and enterprise storage vaults.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-10 pb-8 text-left space-y-5 border-b border-[#1b1e28]">
        <div className="space-y-3 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 bg-[#141822] border border-[#232a3b] px-3 py-1 rounded text-[10px] font-mono text-blue-400 font-semibold tracking-wider uppercase">
            Protocol Specification v4.12
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white font-sans leading-[1.1]">
            Anonymous Attestation Network<br />
            <span className="text-[#78819a]">Internet Trust Infrastructure.</span>
          </h1>
          
          {/* Confident core tagline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 pb-1.5 border-y border-[#1b1e28]/60 max-w-3xl">
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">IDENTITY MODEL</span>
              <span className="text-white text-base font-semibold mt-1 block">One Human.</span>
            </div>
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">ATTESTATION METHOD</span>
              <span className="text-white text-base font-semibold mt-1 block">One Anonymous Proof.</span>
            </div>
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">DATA EXPOSURE LIMIT</span>
              <span className="text-white text-base font-semibold mt-1 block">Zero Identity Shared.</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#78819a] max-w-2xl leading-relaxed">
            AAN is low-friction, zero-exposure verification infrastructure deployed by platforms to check whether access attempts are backed by real, unique, and legitimate human actors without permanently collecting or storing raw personal data.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => onNavigate('partner')}
            className="w-full sm:w-auto bg-white hover:bg-[#e2e5eb] text-[#0d0e12] px-6 py-3 rounded font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Developer Plane</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={onStartDemoSession}
            className="w-full sm:w-auto bg-[#141822] hover:bg-[#1b202e] text-[#a5b0cb] border border-[#232a3b] px-6 py-3 rounded font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Run Interactive Trust Check</span>
          </button>
        </div>
      </header>

      {/* Trust Network Visualization Grid */}
      <section className="max-w-7xl mx-auto px-8 py-10 space-y-8 border-b border-[#1b1e28]">
        
        {/* Real Operational Header */}
        <div className="space-y-3">
          <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Operational Identity Ledger</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Real-time Identity Attestation Pipeline</h2>
          <p className="text-xs text-[#78819a] leading-relaxed max-w-3xl">
            Actual transaction streams and security checkpoints flowing through the AAN Protocol Engine. Click any pipeline node below to explore internal checks, or select an active transaction to replay its full path.
          </p>
        </div>

        {/* Real Operational Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-4 font-mono">
            <span className="text-[10px] text-[#5d6780] uppercase block font-bold">Active Requests</span>
            <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {activeSessionsCount}
            </div>
            <span className="text-[9px] text-[#78819a] block mt-1">In-flight sessions</span>
          </div>
          <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-4 font-mono">
            <span className="text-[10px] text-[#5d6780] uppercase block font-bold">Success Rate</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">{successRate}</div>
            <span className="text-[9px] text-[#78819a] block mt-1">Concluded sessions</span>
          </div>
          <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-4 font-mono">
            <span className="text-[10px] text-[#5d6780] uppercase block font-bold">Average Trust</span>
            <div className="text-lg font-bold text-blue-400 mt-1">{avgTrustScore}</div>
            <span className="text-[9px] text-[#78819a] block mt-1">Biological confidence</span>
          </div>
          <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-4 font-mono">
            <span className="text-[10px] text-[#5d6780] uppercase block font-bold">Signed Proofs</span>
            <div className="text-lg font-bold text-white mt-1">{tokensIssuedCount}</div>
            <span className="text-[9px] text-[#78819a] block mt-1">Issued tokens</span>
          </div>
          <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-4 font-mono">
            <span className="text-[10px] text-[#5d6780] uppercase block font-bold">Queue / Retries</span>
            <div className="text-lg font-bold text-[#d2ab6c] mt-1">{pendingWebhooksCount}</div>
            <span className="text-[9px] text-[#78819a] block mt-1">Webhooks pending</span>
          </div>
        </div>

        {/* Dynamic Dual Plane Log & Flow Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Pipeline Diagram & Node Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Pipeline Stage Container */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6">
              <div className="flex items-center justify-between text-xs font-mono mb-6 border-b border-[#1b1e28] pb-3 text-[#78819a]">
                <span>AAN SECURE DISPATCH PIPELINE</span>
                {selectedSession ? (
                  <span className="text-blue-400 animate-pulse font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    PLAYBACK ACTIVE: [{selectedSession.id}]
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">SYSTEM ACTIVE (NOMINAL)</span>
                )}
              </div>

              {/* Dynamic Connecting SVG Line overlay (For Desktop) */}
              <div className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 z-10 relative">
                  {pipelineStages.map((stage) => {
                    const status = getStageStatus(stage.index);
                    const isSelectedNode = activeNode === stage.id;
                    const IconComp = stage.icon;
                    
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setActiveNode(stage.id)}
                        className={`text-left p-3.5 rounded-lg border font-mono transition-all relative flex flex-col justify-between h-28 cursor-pointer select-none group ${
                          isSelectedNode 
                            ? 'bg-blue-950/45 border-blue-500 text-white aan-pulse-active-node' 
                            : 'bg-[#14161f] border-[#222735] text-[#a5b0cb] hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <IconComp className={`w-4 h-4 ${isSelectedNode ? 'text-blue-400' : 'text-[#5d6780] group-hover:text-blue-400 transition-colors'}`} />
                          
                          {/* LED Light based on Stage Status */}
                          <div className="flex items-center gap-1">
                            {status === 'processing' && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            )}
                            <span className={`w-2 h-2 rounded-full ${
                              status === 'completed' ? 'bg-emerald-500' :
                              status === 'processing' ? 'bg-blue-500' :
                              status === 'failed' ? 'bg-red-500' :
                              status === 'warning' ? 'bg-amber-500 animate-pulse' :
                              'bg-slate-700'
                            }`} />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">Stage 0{stage.index + 1}</span>
                          <span className="text-[11px] font-bold block truncate mt-0.5">{stage.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status info bar */}
              <div className="mt-4 border-t border-[#1b1e28]/70 pt-3 flex items-center justify-between text-[10px] font-mono text-[#5d6780]">
                <span>API Posture Spec: <strong>RFC-944-SECP</strong></span>
                <span>Active Ledger Nodes Checked: <strong>124/124 Nominal</strong></span>
              </div>
            </div>

            {/* Dynamic Node Details Panel */}
            {details && (
              <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between border-b border-[#1b1e28] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      {details.title}
                    </h3>
                    <p className="text-xs text-[#78819a] font-sans mt-1">{details.desc}</p>
                  </div>
                  <span className="font-mono text-[9px] bg-blue-950 border border-blue-900/40 text-blue-400 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Node telemetry
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Global Stage Metrics */}
                  <div className="space-y-3 font-mono">
                    <span className="text-[10px] text-[#5d6780] uppercase block font-bold tracking-wider">Aggregate System Metrics</span>
                    <div className="space-y-2 bg-[#14161f] p-4 rounded-lg border border-[#1b1e28]/60 text-xs">
                      {details.metrics.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-1 first:pt-0 last:pb-0 border-b border-[#1b1e28]/40 last:border-0">
                          <span className="text-[#78819a]">{m.label}</span>
                          <span className="text-white font-bold">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Playback Instance Details */}
                  <div className="space-y-3 font-mono">
                    <span className="text-[10px] text-[#5d6780] uppercase block font-bold tracking-wider">
                      Selected Session Ledger Outputs
                    </span>
                    <div className="bg-[#14161f] p-4 rounded-lg border border-[#1b1e28]/60 text-xs h-[126px] overflow-y-auto">
                      {details.sessionDetails ? (
                        <div className="space-y-2">
                          {details.sessionDetails.map((v, i) => (
                            <div key={i} className="flex justify-between items-start text-[11px] gap-2 py-0.5">
                              <span className="text-[#78819a] shrink-0">{v.label}:</span>
                              <span className={`text-right font-bold break-all ${
                                v.value.includes('CRITICAL') || v.value.includes('REJECTED') ? 'text-red-400' :
                                v.value.includes('PASSED') || v.value.includes('APPROVED') || v.value.includes('TRUE') ? 'text-emerald-400' :
                                v.value.includes('CHALLENGE') ? 'text-amber-400' : 'text-white'
                              }`}>{v.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[#5d6780] text-xs">
                          <Info className="w-5 h-5 mb-1.5 opacity-60 text-slate-500" />
                          <p>No active replay selected.</p>
                          <p className="text-[10px] mt-0.5">Select a transaction on the right to map session details.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Handshake Log Stream (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden flex flex-col justify-between font-mono">
              <div className="bg-[#171a23] px-4 py-3 border-b border-[#1b1e28] flex items-center justify-between text-[10px] text-[#78819a]">
                <span className="font-bold tracking-wider uppercase">Active Handshake Log</span>
                <span className="text-blue-400 animate-pulse font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                  REALTIME
                </span>
              </div>

              {/* Handshake logs list */}
              <div className="p-4 overflow-y-auto max-h-[360px] min-h-[280px] space-y-3 divide-y divide-[#1b1e28]/50 text-[11px]">
                {mappedSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-[#5d6780]">
                    <AlertCircle className="w-7 h-7 mb-2 opacity-50" />
                    <span>No active verification requests.</span>
                    <span className="text-[9px] text-[#78819a] max-w-[200px] mt-1">Sessions appear automatically as clients initiate trust handshakes.</span>
                  </div>
                ) : (
                  mappedSessions.map((tx) => {
                    const isSelected = selectedSession?.id === tx.id;
                    return (
                      <div 
                        key={tx.id} 
                        onClick={() => triggerPlayback(tx.raw)}
                        className={`pt-3 first:pt-0 flex items-start justify-between gap-3 cursor-pointer p-2 rounded transition-all group ${
                          isSelected 
                            ? 'bg-blue-950/20 border border-blue-900/40 text-white shadow' 
                            : 'text-[#78819a] hover:bg-[#151821] hover:text-white'
                        }`}
                      >
                        <div className="space-y-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#e3e5eb] group-hover:text-white truncate">{tx.org}</span>
                            <span className="text-[9px] text-[#5d6780]">[{tx.id}]</span>
                          </div>
                          <span className="text-[10px] text-[#78819a] block truncate">{tx.action}</span>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            tx.status === 'passed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-red-950 text-red-400 border border-red-900/40'
                          }`}>
                            {tx.raw.status.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-[#5d6780] block">{tx.timestamp} ({tx.latency})</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dynamic redacting footnote */}
              <div className="bg-[#171a23] p-2.5 border-t border-[#1b1e28] text-[9px] text-[#5d6780] text-center italic">
                *Identifiers are non-reversible postural hashes. Click a row to trigger path playback.
              </div>
            </div>

            {/* Playback Session Control Deck */}
            {selectedSession && (
              <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-[#1b1e28] pb-2 text-xs text-[#a5b0cb]">
                  <span className="font-bold">PLAYBACK DECK</span>
                  <button 
                    onClick={stopPlayback}
                    className="text-red-400 hover:text-red-300 transition-colors text-[10px] font-bold uppercase"
                  >
                    Close Replay
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5d6780]">Target Ingress:</span>
                    <span className="text-white font-bold">{selectedSession.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5d6780]">Current Stage:</span>
                    <span className="text-blue-400 font-bold uppercase">
                      {playbackStage === 7 ? "COMPLETE" : pipelineStages[playbackStage]?.label || "IDLE"}
                    </span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-[#171a23] rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((playbackStage + 1) / 7) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaybackPlaying(!isPlaybackPlaying)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isPlaybackPlaying ? (
                      <>
                        <Pause className="w-3 h-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Resume Playback
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPlaybackStage(0);
                      setIsPlaybackPlaying(true);
                      setActiveNode("client_request");
                    }}
                    className="bg-[#171a23] hover:bg-[#202431] border border-[#2b3143] text-[#a5b0cb] p-2 rounded transition-all cursor-pointer"
                    title="Restart playback"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* Redesigned Clean Infrastructure-Oriented Blocks Section */}
      <section className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <div className="text-left space-y-2">
          <span className="font-mono text-[10px] tracking-widest text-blue-500 uppercase block font-black">Technical Capability Architecture</span>
          <h2 className="text-3xl font-semibold tracking-tight text-white font-sans">
            Engineered for High-Density Operational Verification
          </h2>
          <p className="text-xs md:text-sm text-[#78819a] max-w-xl">
            Read direct system capability briefs detailing AAN network pipelines, telemetry indexes, and structural models.
          </p>
        </div>

        {/* 2x4 Bento-like grid of deep system explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">01. Verification Activity</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Monitors physical travel velocities and localized network telemetry. Flags bot-like micro-behavior trends in under 12 milliseconds.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">02. Organization Network</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Interconnects institutional gateways securely. Synchronizes zero-knowledge reputation indexes across bank, government, and API partner nodes.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">03. System Health</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Features native replication networks with zero centralized single points of failure. Provides absolute protection from high-velocity DDOS floods.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">04. Privacy Architecture</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Transforms attestation variables into encrypted ephemeral posture hashes. Employs mathematically guaranteed unlinkable cryptographic signatures.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">05. Developer Integration</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Deploys instantly with structured JSON REST endpoints and type-safe SDK bundles. Standardizes custom auth handshakes into 10 lines of backend code.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">06. Security Model</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Recomputes device fingerprint anomalies, VPN/proxy tunnels, and emulator signals on every request to compute risk scores.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">07. Global Availability</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Synchronized across 24 edge latency-sensitive zones globally to provide immediate validation outputs regardless of user location.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">08. Performance Metrics</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Engineered in lightweight compiled Rust. Processes over 500,000 parallel connection streams without bottlenecking databases.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Developer API Console Integration Section */}
      <section className="max-w-7xl mx-auto px-8 py-10 border-t border-[#1b1e28] grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Developer Reference</span>
          <h3 className="text-2xl font-semibold tracking-tight text-white leading-snug">
            Standard REST API Gateway
          </h3>
          <p className="text-xs text-[#78819a] leading-relaxed font-sans">
            AAN infrastructure lives directly on your backend. Issue requests with standard authorization tokens and manage verification policies effortlessly using simple JSON payloads.
          </p>
          
          <div className="flex gap-2 flex-wrap pt-2">
            {Object.keys(INTEGRATION_CODE_EXAMPLES).map((key) => (
              <button
                key={key}
                onClick={() => setActiveLang(key)}
                className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition border cursor-pointer ${
                  activeLang === key 
                    ? 'bg-[#171a23] text-white border-[#2b3143]' 
                    : 'text-[#78819a] hover:text-white border-transparent hover:bg-[#111319]'
                }`}
              >
                {INTEGRATION_CODE_EXAMPLES[key].lang}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden flex flex-col h-80 justify-between">
          <div className="px-4 py-3 border-b border-[#1b1e28] bg-[#171a23] flex items-center justify-between text-[11px] font-mono text-[#78819a]">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[#5d6780]" />
              {INTEGRATION_CODE_EXAMPLES[activeLang].filename}
            </span>
            <button 
              onClick={() => copyCode(INTEGRATION_CODE_EXAMPLES[activeLang].code)}
              className="text-[#78819a] hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : "Copy Code"}
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-auto bg-[#0d0e12] text-[#c0c5d0] font-mono text-[11px] leading-relaxed whitespace-pre">
            {INTEGRATION_CODE_EXAMPLES[activeLang].code}
          </div>

          <div className="p-3 bg-[#111319] border-t border-[#1b1e28] px-4 text-[10px] text-[#5d6780] font-mono">
            {INTEGRATION_CODE_EXAMPLES[activeLang].desc}
          </div>
        </div>
      </section>

      {/* Compliance & Trust Architecture Section */}
      <section className="max-w-7xl mx-auto px-8 py-10 border-t border-[#1b1e28] space-y-6">
        <div className="space-y-3 max-w-3xl">
          <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Trust & Compliance</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Compliance & Enterprise Trust Architecture</h2>
          <p className="text-xs text-[#78819a] leading-relaxed">
            AAN is designed as a secure, decentralized trust infrastructure layer rather than an identity database. Our architecture is engineered to help organizations verify user authenticity and uniqueness while supporting robust privacy safeguards and secure operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Data Minimization */}
          <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-900/40 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-xs text-white uppercase font-bold tracking-wider">1. Data Minimization</h3>
            <p className="text-xs text-[#78819a] leading-relaxed font-sans">
              AAN is built on the principle of strict data minimization, avoiding the collection or storage of unnecessary personal information. The platform processes system and browser-level attestations into transient, encrypted payloads purely to evaluate authenticity and uniqueness in real time. We do not maintain permanent identity databases or centralized repositories of raw credentials. Data processing utilizes secure encryption, access controls, and detailed auditing, and organizations are responsible for defining and configuring their own data retention and disposal policies.
            </p>
          </div>

          {/* Card 2: Platform Integrity */}
          <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-xs text-white uppercase font-bold tracking-wider">2. Platform Integrity</h3>
            <p className="text-xs text-[#78819a] leading-relaxed font-sans">
              Our trust engine helps platforms identify and flag high-risk or suspicious activity, including automated signups, bot traffic, duplicate accounts, emulator abuse, and abnormal verification patterns. By validating client-side hardware signatures and behavioral signals, AAN provides a reliable trust assessment to protect downstream applications from systemic abuse. Please note that while our tools significantly reduce bot and automated threat vectors, they represent a protective defense layer and do not guarantee complete prevention of sophisticated fraud or coordinated human collusion.
            </p>
          </div>

          {/* Card 3: Privacy-Aligned Architecture */}
          <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
            <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-900/40 flex items-center justify-center text-purple-450">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-mono text-xs text-white uppercase font-bold tracking-wider">3. Privacy-Aligned Architecture</h3>
            <p className="text-xs text-[#78819a] leading-relaxed font-sans">
              The AAN Protocol is designed to align with strict privacy frameworks through core architectural controls: explicit user consent, least-privilege access, cryptographically signed verification responses, configurable retention schedules, audit logging, and strict data minimization. Partner organizations only receive the verified results they need, never raw underlying identifiers. Because legal and privacy standards vary by region, organizations planning production deployments must conduct independent reviews against applicable regulations (such as GDPR, UK GDPR, and CCPA/CPRA).
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Footprint Info */}
      <footer className="max-w-7xl mx-auto px-8 mt-24 pt-12 pb-12 border-t border-[#1b1e28] font-mono leading-relaxed space-y-12">
        {/* Resource Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs text-white tracking-tight">AAN Trust & Resource Center</span>
            </div>
            <p className="text-[10px] text-[#78819a] font-sans leading-normal">
              Privacy-preserving trust infrastructure for human verification, account integrity, and secure platform access.
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-[#5d6780]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational (Sandbox)</span>
            </div>
          </div>

          {/* DEVELOPERS Category */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-[#5d6780] tracking-widest font-extrabold block">DEVELOPERS</span>
            <ul className="space-y-2 text-[10px]">
              <li>
                <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/docs'); }} className="text-[#78819a] hover:text-white transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#api-ref" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/api-ref'); }} className="text-[#78819a] hover:text-white transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#sdks" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/sdks'); }} className="text-[#78819a] hover:text-white transition-colors">SDK Downloads</a>
              </li>
              <li>
                <a href="#changelog" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/changelog'); }} className="text-[#78819a] hover:text-white transition-colors">Changelog</a>
              </li>
              <li>
                <a href="#github" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/github'); }} className="text-[#78819a] hover:text-white transition-colors">GitHub Repository</a>
              </li>
            </ul>
          </div>

          {/* SECURITY Category */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-[#5d6780] tracking-widest font-extrabold block">SECURITY & PRIVACY</span>
            <ul className="space-y-2 text-[10px]">
              <li>
                <a href="#security" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/security'); }} className="text-[#78819a] hover:text-white transition-colors">Security Standards</a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/privacy'); }} className="text-[#78819a] hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#trust" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/trust'); }} className="text-[#78819a] hover:text-white transition-colors">Trust Center Matrix</a>
              </li>
              <li>
                <a href="#disclosure" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/disclosure'); }} className="text-[#78819a] hover:text-white transition-colors">Responsible Disclosure</a>
              </li>
              <li>
                <a href="#status" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/status'); }} className="text-[#78819a] hover:text-white transition-colors">System Status</a>
              </li>
            </ul>
          </div>

          {/* COMPANY Category */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-[#5d6780] tracking-widest font-extrabold block">COMPANY</span>
            <ul className="space-y-2 text-[10px]">
              <li>
                <a href="#mission" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/mission'); }} className="text-[#78819a] hover:text-white transition-colors">Mission Statement</a>
              </li>
              {isBrandEnabled() && (
                <li>
                  <a href="#brand" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/brand'); }} className="text-[#78819a] hover:text-white transition-colors">Brand Manual</a>
                </li>
              )}
              <li>
                <a href="#research" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/research'); }} className="text-[#78819a] hover:text-white transition-colors">Research Center</a>
              </li>
              <li>
                <a href="#roadmap" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/roadmap'); }} className="text-[#78819a] hover:text-white transition-colors">Product Roadmap</a>
              </li>
            </ul>
          </div>

          {/* ENTERPRISE Category */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-[#5d6780] tracking-widest font-extrabold block">ENTERPRISE</span>
            <ul className="space-y-2 text-[10px]">
              <li>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/pricing'); }} className="text-[#78819a] hover:text-white transition-colors">Pricing Matrix</a>
              </li>
              <li>
                <a href="#support" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/support'); }} className="text-[#78819a] hover:text-white transition-colors">Support Portal</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/contact'); }} className="text-[#78819a] hover:text-white transition-colors">Contact Sales</a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); onNavigate('trustdocs', '/terms'); }} className="text-[#78819a] hover:text-white transition-colors">Terms & Conditions</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#1b1e28]/50 pt-6 text-[9px] text-[#5d6780]">
          <span>&copy; 2026 Anonymous Attestation Network (AAN). All rights reserved.</span>
          <span>Designed with high-integrity telemetry alignment & enterprise standards.</span>
        </div>
      </footer>

    </div>
  );
}
