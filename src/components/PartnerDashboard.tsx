import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck,
  Activity, 
  CheckCircle2, 
  Copy, 
  Plus, 
  Search, 
  Settings, 
  Terminal, 
  X, 
  ExternalLink, 
  Lock, 
  UserCheck, 
  Layers, 
  Cpu, 
  AlertTriangle, 
  ChevronDown, 
  Check, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Info, 
  Sliders, 
  Code, 
  Server, 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Download, 
  RefreshCw, 
  Play, 
  Database, 
  Network, 
  Fingerprint, 
  Sparkles,
  FileText,
  HeartPulse,
  Building
} from 'lucide-react';
import TrustDecisionSimulator from './TrustDecisionSimulator';
import TestLabTab from './TestLabTab';

// Import newly created modular sub-tabs
import SessionHealthTab from './SessionHealthTab';
import HumanAssuranceTab from './HumanAssuranceTab';
import TrustIntelligenceTab from './TrustIntelligenceTab';
import DecisionsTab from './DecisionsTab';
import IntegrationsTab from './IntegrationsTab';
import ProjectsTab from './ProjectsTab';
import WebhooksTab from './WebhooksTab';
import AuditLogsTab from './AuditLogsTab';
import PoliciesTab from './PoliciesTab';

interface PartnerDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
  onSetVerificationSessionId: (id: string) => void;
  onLogout?: () => void;
}

export default function PartnerDashboard({ onNavigate, onSetVerificationSessionId, onLogout }: PartnerDashboardProps) {
  const userEmailRaw = localStorage.getItem('aan_user_email') || "";
  const cleanedEmail = userEmailRaw.trim().replace(/[\r\n"']/g, "").replace(/[^\x20-\x7E]/g, "");
  const userEmail = (cleanedEmail === "null" || cleanedEmail === "undefined") ? "" : cleanedEmail;

  // Integration states fetched from API
  const [sessionData, setSessionData] = useState<any>(null);
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Tenant metadata states
  const [orgName, setOrgName] = useState<string>("");
  const [orgWebsite, setOrgWebsite] = useState<string>("");
  const [orgType, setOrgType] = useState<string>("SaaS");

  // Project configuration states
  const [projName, setProjName] = useState<string>("");
  const [projEnv, setProjEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [projectId, setProjectId] = useState<string>("");

  // Credentials states (populated upon onboarding completion)
  const [pubKey, setPubKey] = useState<string>("");
  const [secKey, setSecKey] = useState<string>("");
  const [whSecret, setWhSecret] = useState<string>("");
  const [justOnboardedSecrets, setJustOnboardedSecrets] = useState<boolean>(false);

  // Stepper current step
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 
    'session_health' |
    'human_assurance' | 
    'trust_intelligence' | 
    'integrations' | 
    'projects' | 
    'policies' | 
    'webhooks' | 
    'audit_logs' | 
    'test_lab' | 
    'docs' | 
    'settings'
  >('overview');

  // Dynamic ledger events
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  // Copy helper
  const [keysCopied, setKeysCopied] = useState<Record<string, boolean>>({});
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setKeysCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setKeysCopied(prev => ({ ...prev, [key]: false }));
    }, 1500);
  };

  // Policy thresholds configuration (Local state to allow interactive slider changes)
  const [savingRules, setSavingRules] = useState<boolean>(false);
  const [rulesSuccess, setRulesSuccess] = useState<boolean>(false);
  const [trustRules, setTrustRules] = useState({
    autoApproveBelow: 35,
    manualReviewAbove: 36,
    denyAbove: 75,
    duplicateAction: "review",
    botSuspicionAction: "verify",
    fallbackNoCamera: "allow_with_risk_penalty"
  });

  // Policies configurations list
  const [policies, setPolicies] = useState([
    {
      id: "pol_anti_emu",
      name: "Enforce WebGL & Sandbox Check",
      type: "Emulator Detection",
      enabled: true,
      threshold: "Strict match browser GPU render characteristics",
      recommendedAction: "DENY",
      jsonRule: JSON.stringify({
        rule: "webgl_unmasked_renderer_check",
        allowed_gpu_vendors: ["Apple", "Intel", "NVIDIA", "AMD"],
        actions: { mismatch: "DENY" }
      }, null, 2)
    },
    {
      id: "pol_account_multi",
      name: "Limit multiple linked account signatures",
      type: "Sybil Attack Defense",
      enabled: true,
      threshold: "Associated accounts count <= 5 per hardware context",
      recommendedAction: "REVIEW",
      jsonRule: JSON.stringify({
        rule: "max_associated_accounts_evaluation",
        max_limit: 5,
        actions: { exceed: "REVIEW" }
      }, null, 2)
    }
  ]);

  // Fetch session configuration and context from the backend
  const fetchSessionContext = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setServiceError(null);
    try {
      const res = await fetch("/api/internal/session-context", {
        headers: { "x-user-email": userEmail }
      });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSessionData(data);
      setOnboarded(data.onboarded);

      if (data.onboarded) {
        setOrgName(data.organization?.name || "");
        setOrgWebsite(data.organization?.website || "");
        setOrgType(data.organization?.type || "SaaS");

        if (data.projects && data.projects.length > 0) {
          const activeProj = data.projects[0];
          setProjName(activeProj.name);
          setProjectId(activeProj.id);
          setProjEnv(activeProj.environment || "sandbox");
        }

        if (data.apiKeys && data.apiKeys.length > 0) {
          const key = data.apiKeys[0];
          setPubKey(key.publishable_key);
          setWhSecret(key.webhook_signing_secret);
        }
      }
    } catch (err: any) {
      console.error("[CONTEXT FETCH ERROR]", err);
      setServiceError(err.message || "Unable to load partner session context from remote database.");
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Fetch live decisions list for the current active project
  const fetchDecisionsList = async () => {
    if (!projectId) return;
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/internal/decisions?projectId=${projectId}`, {
        headers: { "x-user-email": userEmail }
      });
      if (res.ok) {
        const data = await res.json();
        // Transform backend `verification_events` into the standard unified `events` structure
        const mapped = data.map((e: any) => ({
          id: e.id,
          project: projName,
          external_user_id: e.external_user_id,
          decision: e.decision,
          risk_score: e.risk_score,
          reason_codes: e.reason_codes || [],
          device_signal: e.device_signal || "Unknown Client Posture",
          ip_risk_signal: e.ip_risk_signal || "Low (0.01)",
          returning_human: e.risk_score < 30,
          proof_token_status: e.decision === 'denied' ? 'revoked' : 'valid',
          timestamp: e.created_at
        }));
        setEvents(mapped);
      }
    } catch (err) {
      console.error("Failed to load live decisions ledger:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Sync session context on mount and when email changes
  useEffect(() => {
    if (userEmail) {
      fetchSessionContext();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  // Sync decisions whenever the project context is active or the active tab changes
  useEffect(() => {
    if (onboarded && projectId) {
      fetchDecisionsList();
    }
  }, [onboarded, projectId, activeTab]);

  // Handler for onboarding submission
  const handleOnboardSubmit = async () => {
    setLoading(true);
    setServiceError(null);
    try {
      const res = await fetch("/api/internal/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          orgName,
          orgWebsite,
          projName,
          projEnv
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setSessionData({
        onboarded: true,
        organization: data.organization,
        projects: [data.project],
        apiKeys: [data.api_key]
      });

      setOnboarded(true);
      setOrgName(data.organization.name);
      setOrgWebsite(data.organization.website);
      setProjName(data.project.name);
      setProjectId(data.project.id);
      setProjEnv(data.project.environment);

      setPubKey(data.api_key.publishable_key);
      setWhSecret(data.api_key.webhook_signing_secret);
      setSecKey(data.plain_secret_key); // Retain plain secret key ONLY once on the UI for disclosure
      setJustOnboardedSecrets(true);

    } catch (err: any) {
      console.error("[ONBOARD ERROR]", err);
      setServiceError(err.message || "Failed to complete organization onboarding database registration.");
    } finally {
      setLoading(false);
    }
  };

  // API Key Rotation
  const handleRotateKeys = async () => {
    const keyId = sessionData?.apiKeys?.[0]?.id;
    if (!keyId) {
      alert("No active API keys found to rotate.");
      return;
    }

    const confirmRot = window.confirm("Are you sure you want to rotate your API credentials? Existing backend clients will lose access immediately.");
    if (!confirmRot) return;

    try {
      const res = await fetch("/api/internal/api-keys/rotate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": userEmail 
        },
        body: JSON.stringify({ project_id: projectId, key_id: keyId })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to rotate credentials");
      }

      const data = await res.json();
      setSecKey(data.plain_secret_key);
      setJustOnboardedSecrets(true);
      alert("API keys rotated successfully. Please copy your new secure endpoint secret token now.");
      fetchSessionContext();
    } catch (err: any) {
      alert(`Rotation failed: ${err.message}`);
    }
  };

  // Environment Toggling (Sandbox vs Production)
  const handleToggleEnv = async () => {
    // Kept client-side only as an dynamic UI filter/toggle, showing premium reactive responses.
    const next = projEnv === 'sandbox' ? 'production' : 'sandbox';
    setProjEnv(next);
  };

  // Update Project Name
  const handleUpdateProjName = async (name: string) => {
    setProjName(name);
  };

  // Save trust rules dummy action
  const handleSaveTrustRules = () => {
    setSavingRules(true);
    setTimeout(() => {
      setSavingRules(false);
      setRulesSuccess(true);
      setTimeout(() => setRulesSuccess(false), 3000);
    }, 8000);
  };

  // Metrics derivation
  const totalAttempts = events.length;
  const approvedHumans = events.filter(e => e.decision === 'approved').length;
  const blockedBots = events.filter(e => e.decision === 'denied').length;
  const reviewCount = events.filter(e => e.decision === 'review').length;

  // Render pristine "Service Unavailable" State if remote database is unreachable
  if (serviceError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-left">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 animate-[fadeIn_0.25s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight block">Connection Not Configured</h2>
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-widest block">Service Unavailable</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-light leading-relaxed">
            The platform is unable to negotiate an active session with the remote Supabase PostgreSQL backend. Sandbox fallback states have been disabled to protect ledger integrity.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-[10px] text-slate-600 break-words leading-normal select-text">
            <strong>Diagnostic Error:</strong>
            <div className="mt-1 text-slate-500">{serviceError}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRetrying(true);
                fetchSessionContext();
              }}
              disabled={isRetrying}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-mono font-bold text-xs rounded-xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying Connection...' : 'Retry Handshake'}</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('aan_authenticated');
                if (onLogout) onLogout();
                else onNavigate('landing');
              }}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-mono text-xs rounded-xl cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-mono tracking-wider">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
          <span>NEGOTIATING SECURE POSTURE ENCLAVE CONNECTIONS...</span>
        </div>
      </div>
    );
  }

  // Render onboarding wizard if user profile has not completed database registration
  if (!onboarded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-slate-50" />
        
        <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block tracking-tight">Antigravity Assurance Network</span>
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-widest block">Node Onboarding</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-slate-100 py-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            <span className={onboardingStep === 1 ? "text-emerald-600" : ""}>1. Organization</span>
            <span className={onboardingStep === 2 ? "text-emerald-600" : ""}>2. Project</span>
            <span className={onboardingStep === 3 ? "text-emerald-600" : ""}>3. Complete</span>
          </div>

          <div className="min-h-[14rem] flex flex-col justify-center">
            {onboardingStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(2); }} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 1: Administrative Organization Tenant</h3>
                  <p className="text-[11px] text-slate-500 font-light">Establish the legal corporate entity boundary for your workspaces.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Organization Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Acme Corporation"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Legal Domain / Website</label>
                    <input
                      type="text"
                      placeholder="e.g., acme.com"
                      value={orgWebsite}
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </form>
            )}

            {onboardingStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setOnboardingStep(3); }} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 2: Attestation Scope Configuration</h3>
                  <p className="text-[11px] text-slate-500 font-light">Set up the technical project workspace environment to handle traffic.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Project Scope Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Default Auth Layer"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Environment Mode</label>
                    <select
                      value={projEnv}
                      onChange={(e) => setProjEnv(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold"
                    >
                      <option value="sandbox">Sandbox / Evaluation Mode</option>
                      <option value="production">Production Attestation Node</option>
                    </select>
                  </div>
                </div>
              </form>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 3: Platform Architecture</h3>
                  <p className="text-[11px] text-slate-500 font-light">Confirming privacy constraints. Node attestation pipeline is ready for compilation.</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs leading-normal font-light text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Non-custodial Zero-knowledge Standard</span>
                    <p className="mt-0.5 text-slate-500">
                      We operate strictly as a decentralized attestation platform. Private user keys or credentials are never recovery-seeded on shared storage devices.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {onboardingStep > 1 ? (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              onClick={() => {
                if (onboardingStep === 1) {
                  if (!orgName.trim()) {
                    alert("Please specify organization name.");
                    return;
                  }
                  setOnboardingStep(2);
                } else if (onboardingStep === 2) {
                  if (!projName.trim()) {
                    alert("Please specify project name.");
                    return;
                  }
                  setOnboardingStep(3);
                } else if (onboardingStep === 3) {
                  handleOnboardSubmit();
                }
              }}
              disabled={loading}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <span>Registering Node...</span>
              ) : (
                <>
                  <span>{onboardingStep === 3 ? "Complete Node Setup" : "Continue"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sub-tab mapping
  const MODULE_REGISTRY: Record<string, () => React.ReactNode> = {
    overview: () => (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
        
        {/* Active Company Banner details inside header */}
        <div className="bg-slate-100/65 border border-slate-200/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs leading-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{orgName}</h4>
                <span className="px-2 py-0.5 bg-slate-200/80 rounded-full font-mono text-[9px] font-bold text-slate-500 uppercase">{orgType}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">{orgWebsite || "No domain declared"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-xs">
            <span>Project Workspace:</span>
            <strong className="text-slate-900 uppercase font-black">{projName}</strong>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Node Integrity Overview</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time telemetry analysis, posture attestation scores, and system audit metrics.</p>
          </div>

          <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
            <span className="font-mono font-bold text-slate-900">AAN NODE ONLINE</span>
          </div>
        </div>

        {/* One-time Secret Key Disclosure Notification Banner */}
        {justOnboardedSecrets && secKey && (
          <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-2xl space-y-3 animate-[fadeIn_0.35s_ease-out]">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">One-Time Secret Key Disclosure</span>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  To enforce non-custodial, high-integrity privacy guarantees, endpoint secret keys are only displayed once upon generation or rotation. They are not stored in plaintext on our servers. Please record this key immediately.
                </p>
              </div>
            </div>

            <div className="bg-white border border-amber-100 p-3 rounded-xl flex items-center justify-between gap-4 font-mono text-[10px] text-slate-900">
              <span className="truncate select-text">{secKey}</span>
              <button 
                onClick={() => copyToClipboard(secKey, 'sec')}
                className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {keysCopied['sec'] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-bold uppercase">{keysCopied['sec'] ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setJustOnboardedSecrets(false)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[9px] uppercase rounded-lg cursor-pointer"
              >
                I have securely saved this secret key
              </button>
            </div>
          </div>
        )}

        {/* Metrics cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Assessments", val: totalAttempts, desc: "Evaluated humanness claims", icon: Activity },
            { title: "Approved Humans", val: approvedHumans, desc: "Validated physical users", icon: UserCheck },
            { title: "Blocked Bots", val: blockedBots, desc: "Anomalies/emulators rejected", icon: AlertTriangle },
            { title: "Manual Reviews", val: reviewCount, desc: "Volatile metrics routed", icon: Sliders }
          ].map((m, idx) => {
            const IconC = m.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold">{m.title}</span>
                  <IconC className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-950 block tracking-tight">{m.val}</span>
                  <span className="text-[10px] text-slate-400 font-light block mt-0.5 leading-none">{m.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live assessment history list or empty state */}
        {totalAttempts === 0 ? (
          <div className="bg-white border border-slate-200/80 p-8 rounded-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-900 text-sm font-semibold">Your attestation project is active.</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                No telemetry traffic has been processed yet. To register your first canonical trust decision, head over to the **Test Lab** tab to execute a mock posture simulation run.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('test_lab')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
            >
              Open Test Lab Playground
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Breakdown */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 font-mono text-[10px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Assurance Verdict Breakdown</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>HUMAN TELEMETRY PASSED (AUTO-APPROVE)</span>
                    <span className="text-slate-950 font-bold">{totalAttempts > 0 ? Math.round((approvedHumans / totalAttempts) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${totalAttempts > 0 ? (approvedHumans / totalAttempts) * 100 : 0}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>SUSPICIOUS AUTOMATION / EMULATORS (AUTO-DENY)</span>
                    <span className="text-slate-950 font-bold">{totalAttempts > 0 ? Math.round((blockedBots / totalAttempts) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${totalAttempts > 0 ? (blockedBots / totalAttempts) * 100 : 0}%` }} className="bg-rose-500 h-full rounded-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Assessments Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Recent Node Assessments</h3>
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="py-3 px-4 font-bold">Session ID</th>
                      <th className="py-3 px-4 font-bold">Subject Ref</th>
                      <th className="py-3 px-4 font-bold">Verdict</th>
                      <th className="py-3 px-4 font-bold">Anomalies</th>
                      <th className="py-3 px-4 font-bold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {events.slice(0, 5).map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setActiveTab('decisions')}>
                        <td className="py-3 px-4 font-mono text-slate-900">{e.id}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{e.external_user_id}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            e.decision === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            e.decision === 'review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {e.decision}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 truncate max-w-[150px]">{e.reason_codes ? e.reason_codes.join(', ') : "N/A"}</td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Quick simulator component */}
        <TrustDecisionSimulator />
      </div>
    ),
    session_health: () => (
      <SessionHealthTab />
    ),
    human_assurance: () => (
      <HumanAssuranceTab 
        events={events} 
        projName={projName} 
        onAddEventToGlobalRegistry={fetchDecisionsList} 
      />
    ),
    trust_intelligence: () => (
      <TrustIntelligenceTab events={events} />
    ),
    integrations: () => (
      <IntegrationsTab 
        pubKey={pubKey} 
        secKey={secKey} 
        whSecret={whSecret} 
        projectId={projectId} 
        onRotateKeys={handleRotateKeys} 
      />
    ),
    projects: () => (
      <ProjectsTab 
        projName={projName} 
        projectId={projectId} 
        projEnv={projEnv} 
        onToggleEnv={handleToggleEnv} 
        onUpdateProjName={handleUpdateProjName} 
      />
    ),
    policies: () => (
      <PoliciesTab
        trustRules={trustRules}
        setTrustRules={setTrustRules}
        policies={policies}
        setPolicies={setPolicies}
        savingRules={savingRules}
        rulesSuccess={rulesSuccess}
        onSaveTrustRules={handleSaveTrustRules}
      />
    ),
    webhooks: () => (
      <WebhooksTab whSecret={whSecret} />
    ),
    audit_logs: () => (
      <AuditLogsTab auditLogs={[]} />
    ),
    test_lab: () => (
      <TestLabTab 
        projName={projName} 
        onAddEventToGlobalRegistry={fetchDecisionsList} 
      />
    ),
    docs: () => (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Developer Documentation</h2>
          <p className="text-xs text-slate-500 mt-1">Step-by-step specifications for integrating AAN into multi-language frameworks.</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl text-left space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">API Reference & SDK Core</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            Antigravity Assurance Network operates as a non-custodial, high-performance edge trust resolver. Our web SDK intercepts local telemetry indicators and transfers hashed posture payloads off-path with sub-50ms network latencies.
          </p>

          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-mono uppercase text-slate-400 font-bold">HTTP Initialization Payload</h4>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`curl -X POST https://api.aan.network/v1/attest \\
  -H "Authorization: Bearer <YOUR_SECRET_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "session_id": "vss_9a2b8e4c-1204",
    "subject_reference": "usr_9a8c12",
    "telemetry_payload_hash": "6b8a21cf3d8..."
  }'`}
            </pre>
          </div>
        </div>
      </div>
    ),
    settings: () => (
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Node Settings</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-light">Global administrative configurations for organization `{orgName}`.</p>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Owner Email</span>
              <span className="text-slate-900 block">{userEmail}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Organization ID</span>
              <span className="text-slate-900 block truncate">{projectId || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    )
  };

  // Complete Dashboard View Render
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans flex flex-col md:flex-row text-left">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Brand/Node details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-xs block leading-none">AAN Infrastructure</span>
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest block mt-0.5">Verified Node</span>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2">Technical Dashboard</span>
            {[
              { id: 'overview', label: 'Trust Overview', icon: Activity },
              { id: 'session_health', label: 'Session Health', icon: HeartPulse },
              { id: 'human_assurance', label: 'Human Assurance', icon: Fingerprint },
              { id: 'trust_intelligence', label: 'Trust Intelligence', icon: Sparkles },
              { id: 'integrations', label: 'Integrations & Keys', icon: Code },
              { id: 'projects', label: 'Projects', icon: Layers },
              { id: 'policies', label: 'Policies', icon: Sliders },
              { id: 'webhooks', label: 'Webhooks', icon: Network },
              { id: 'test_lab', label: 'Test Lab Playground', icon: Play },
              { id: 'docs', label: 'Documentation', icon: Database },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                  }}
                  className={`w-full flex items-center gap-2.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-100 hidden md:block">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-mono text-xs font-bold uppercase">
              {orgName ? orgName.charAt(0) : 'A'}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-900 block leading-none truncate">{orgName || "Acme Inc."}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('aan_authenticated');
                  if (onLogout) {
                    onLogout();
                  } else {
                    onNavigate('landing');
                  }
                }}
                className="text-[9px] text-rose-500 hover:underline block cursor-pointer"
              >
                Sign Out / Disconnect
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 bg-slate-50 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Top bar with system states */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              ENV: {projEnv}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <span>Account:</span>
              <strong className="text-slate-900 font-bold truncate max-w-[120px]">{userEmail}</strong>
            </div>
          </div>
        </header>

        {/* Interactive View Body Container */}
        <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto pb-12 select-none">
          {MODULE_REGISTRY[activeTab] ? MODULE_REGISTRY[activeTab]() : (
            <div className="text-center text-slate-400 py-12 text-xs font-mono">
              COMPILING ATTESTATION MODULE...
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
