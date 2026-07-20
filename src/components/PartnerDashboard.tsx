import React, { useState, useEffect } from 'react';
import { 
  Shield, 
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
  HeartPulse
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
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

// Helper to initialize Supabase
const getSupabaseClient = () => {
  const supabaseUrl = 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    "";
  const supabaseAnonKey = 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    "";
  if (supabaseUrl && supabaseAnonKey) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn("Could not construct Supabase client", e);
    }
  }
  return null;
};

interface PartnerDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
  onSetVerificationSessionId: (id: string) => void;
}

export default function PartnerDashboard({ onNavigate, onSetVerificationSessionId }: PartnerDashboardProps) {
  // Onboarding completion state
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('aan_onboarding_completed') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Tenant metadata states
  const [orgName, setOrgName] = useState<string>(() => localStorage.getItem('aan_org_name') || "");
  const [orgType, setOrgType] = useState<string>("SaaS");
  const [orgWebsite, setOrgWebsite] = useState<string>("");
  const [orgUseCase, setOrgUseCase] = useState<string>("bot_defense");

  // Project configuration states
  const [projName, setProjName] = useState<string>(() => localStorage.getItem('aan_project_name') || "");
  const [projEnv, setProjEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [projVolume, setProjVolume] = useState<string>("1k_10k");
  const [projSurface, setProjSurface] = useState<string>("signup");

  // API Credentials states
  const [pubKey, setPubKey] = useState<string>(() => localStorage.getItem('aan_pub_key') || "");
  const [secKey, setSecKey] = useState<string>(() => localStorage.getItem('aan_sec_key') || "");
  const [whSecret, setWhSecret] = useState<string>(() => localStorage.getItem('aan_wh_secret') || "");
  const [projectId, setProjectId] = useState<string>(() => localStorage.getItem('aan_project_id') || "");
  const [keysCopied, setKeysCopied] = useState<Record<string, boolean>>({});

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 
    'session_health' |
    'human_assurance' | 
    'trust_intelligence' | 
    'integrations' | 
    'projects' | 
    'events' | 
    'decisions' | 
    'policies' | 
    'webhooks' | 
    'audit_logs' | 
    'test_lab' | 
    'docs' | 
    'settings'
  >('overview');

  const [loading, setLoading] = useState<boolean>(false);
  const [savingRules, setSavingRules] = useState<boolean>(false);
  const [rulesSuccess, setRulesSuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>( "");
  const [decisionFilter, setDecisionFilter] = useState<string>("all");
  const [selectedGlobalEvent, setSelectedGlobalEvent] = useState<any | null>(null);

  // Administrative Audit Logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "aud_1", action: "API credentials rotated", actor: "admin@aan.network", timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), status: "success", ip: "192.168.1.102" },
    { id: "aud_2", action: "Policy updated (pol_bot_patterns)", actor: "admin@aan.network", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), status: "success", ip: "192.168.1.102" },
    { id: "aud_3", action: "Project environment toggled to PRODUCTION", actor: "developer@aan.network", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), status: "success", ip: "10.0.4.89" },
    { id: "aud_4", action: "New Webhook endpoint registered", actor: "admin@aan.network", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), status: "success", ip: "192.168.1.102" }
  ]);

  // Policy thresholds configuration
  const [trustRules, setTrustRules] = useState({
    autoApproveBelow: 35,
    manualReviewAbove: 36,
    denyAbove: 75,
    duplicateAction: "review",
    botSuspicionAction: "verify",
    fallbackNoCamera: "allow_with_risk_penalty"
  });

  // Automated policies list
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
    },
    {
      id: "pol_bot_patterns",
      name: "Deny known bot patterns",
      type: "Automated Attack Mitigation",
      enabled: true,
      threshold: "Telemetry confidence < 20%",
      recommendedAction: "DENY",
      jsonRule: JSON.stringify({
        rule: "botnet_pattern_fingerprint",
        min_humanness_confidence: 20,
        actions: { below: "DENY" }
      }, null, 2)
    }
  ]);

  // Dynamic verification logs list
  const [events, setEvents] = useState<any[]>(() => {
    const savedEvents = localStorage.getItem('aan_verification_events');
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
    // Seed standard high-quality realistic sandbox data
    return [
      {
        id: "evt_aan_9c4f8d21",
        project: "Default Auth Layer",
        external_user_id: "usr_verified_alice",
        decision: "approved",
        risk_score: 12,
        reason_codes: ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN", "DEVICE_MATCH"],
        device_signal: "iOS Safari (iPhone 14)",
        ip_risk_signal: "Low (0.04)",
        returning_human: true,
        proof_token_status: "valid",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: "evt_aan_3b8a1c9e",
        project: "Default Auth Layer",
        external_user_id: "usr_phantom_botnet",
        decision: "denied",
        risk_score: 94,
        reason_codes: ["DEVICE_SPOOF_DETECTED", "COORDINATED_REPLAY", "HIGH_RISK_IP"],
        device_signal: "Headless Chrome (Linux)",
        ip_risk_signal: "High (0.89)",
        returning_human: false,
        proof_token_status: "revoked",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: "evt_aan_7f2d5e31",
        project: "Default Auth Layer",
        external_user_id: "usr_borderline_charlie",
        decision: "review",
        risk_score: 52,
        reason_codes: ["VOLATILE_NETWORK", "UNKNOWN_UA", "LATENCY_VARIANCE"],
        device_signal: "Android WebView (Samsung S22)",
        ip_risk_signal: "Medium (0.45)",
        returning_human: false,
        proof_token_status: "valid",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: "evt_aan_1d4c2b8a",
        project: "Default Auth Layer",
        external_user_id: "usr_verified_david",
        decision: "approved",
        risk_score: 8,
        reason_codes: ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN"],
        device_signal: "macOS Chrome 124",
        ip_risk_signal: "Low (0.01)",
        returning_human: true,
        proof_token_status: "valid",
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
      }
    ];
  });

  // Trigger credentials generation upon entering Onboarding Step 3
  useEffect(() => {
    if (onboardingStep === 3 && (!pubKey || !secKey)) {
      const generatedProjId = "proj_" + Math.random().toString(36).substring(2, 10);
      const generatedPubKey = `aan_pub_sb_${Math.random().toString(36).substring(2, 16)}`;
      const generatedSecKey = `aan_sec_sb_${Math.random().toString(36).substring(2, 16)}`;
      const generatedWhSecret = `whsec_sb_${Math.random().toString(36).substring(2, 16)}`;
      
      setProjectId(generatedProjId);
      setPubKey(generatedPubKey);
      setSecKey(generatedSecKey);
      setWhSecret(generatedWhSecret);
      
      localStorage.setItem('aan_project_id', generatedProjId);
      localStorage.setItem('aan_pub_key', generatedPubKey);
      localStorage.setItem('aan_sec_key', generatedSecKey);
      localStorage.setItem('aan_wh_secret', generatedWhSecret);
    }
  }, [onboardingStep]);

  // Onboarding Complete Handler
  const handleSaveToSupabaseOnboarding = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('organizations').insert({ id: projectId, name: orgName });
          await supabase.from('projects').insert({ id: projectId, name: projName, env: projEnv });
        }
      }
    } catch (e) {
      console.warn("Supabase onboarding storage failed, utilizing LocalStorage fallback.", e);
    } finally {
      localStorage.setItem('aan_onboarding_completed', 'true');
      setOnboardingCompleted(true);
      setLoading(false);
      
      // Append Audit Log
      const initialAudit = {
        id: "aud_init",
        action: "Organization & Project Node Onboarded",
        actor: "admin@aan.network",
        timestamp: new Date().toISOString(),
        status: "success",
        ip: "192.168.1.102"
      };
      setAuditLogs(prev => [initialAudit, ...prev]);
    }
  };

  const handleSaveTrustRules = () => {
    setSavingRules(true);
    setTimeout(() => {
      setSavingRules(false);
      setRulesSuccess(true);
      
      // Append Audit Log
      const ruleAudit = {
        id: `aud_${Math.random().toString(36).substring(2, 6)}`,
        action: "Trust Policy parameters updated (automated sliders)",
        actor: "admin@aan.network",
        timestamp: new Date().toISOString(),
        status: "success",
        ip: "192.168.1.102"
      };
      setAuditLogs(prev => [ruleAudit, ...prev]);

      setTimeout(() => setRulesSuccess(false), 3000);
    }, 1000);
  };

  const handleSeedEvents = () => {
    const sandboxData = [
      {
        id: "evt_aan_9c4f8d21",
        project: "Default Auth Layer",
        external_user_id: "usr_verified_alice",
        decision: "approved",
        risk_score: 12,
        reason_codes: ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN", "DEVICE_MATCH"],
        device_signal: "iOS Safari (iPhone 14)",
        ip_risk_signal: "Low (0.04)",
        returning_human: true,
        proof_token_status: "valid",
        timestamp: new Date().toISOString()
      }
    ];
    setEvents(sandboxData);
    localStorage.setItem('aan_verification_events', JSON.stringify(sandboxData));
  };

  const handleClearEvents = () => {
    setEvents([]);
    localStorage.removeItem('aan_verification_events');
  };

  // Add event callback from simulation playground
  const onAddEventToGlobalRegistry = (newEvent: any) => {
    setEvents(prev => {
      const updated = [newEvent, ...prev];
      localStorage.setItem('aan_verification_events', JSON.stringify(updated));
      return updated;
    });

    // Add Audit Log
    const attAudit = {
      id: `aud_${Math.random().toString(36).substring(2, 6)}`,
      action: `Assurance verdict evaluated (${newEvent.decision})`,
      actor: "system_attestation_engine",
      timestamp: new Date().toISOString(),
      status: "success",
      ip: "10.0.8.204"
    };
    setAuditLogs(prev => [attAudit, ...prev]);
  };

  // API Credentials rotation handler
  const handleRotateKeys = () => {
    const confirmation = window.confirm("Are you sure you want to rotate your API credentials? Live applications using old keys will fail.");
    if (!confirmation) return;

    const generatedPubKey = `aan_pub_sb_${Math.random().toString(36).substring(2, 16)}`;
    const generatedSecKey = `aan_sec_sb_${Math.random().toString(36).substring(2, 16)}`;
    const generatedWhSecret = `whsec_sb_${Math.random().toString(36).substring(2, 16)}`;
    
    setPubKey(generatedPubKey);
    setSecKey(generatedSecKey);
    setWhSecret(generatedWhSecret);
    
    localStorage.setItem('aan_pub_key', generatedPubKey);
    localStorage.setItem('aan_sec_key', generatedSecKey);
    localStorage.setItem('aan_wh_secret', generatedWhSecret);

    // Add Audit Log
    const rotAudit = {
      id: `aud_${Math.random().toString(36).substring(2, 6)}`,
      action: "API credentials rotated (secret keys)",
      actor: "admin@aan.network",
      timestamp: new Date().toISOString(),
      status: "success",
      ip: "192.168.1.102"
    };
    setAuditLogs(prev => [rotAudit, ...prev]);
    
    alert("API Credentials rotated successfully.");
  };

  // Environment Toggling handler
  const handleToggleEnv = () => {
    const nextEnv = projEnv === 'sandbox' ? 'production' : 'sandbox';
    setProjEnv(nextEnv);
    localStorage.setItem('aan_project_env', nextEnv);

    // Add Audit Log
    const toggAudit = {
      id: `aud_${Math.random().toString(36).substring(2, 6)}`,
      action: `Project environment toggled to ${nextEnv.toUpperCase()}`,
      actor: "admin@aan.network",
      timestamp: new Date().toISOString(),
      status: "success",
      ip: "192.168.1.102"
    };
    setAuditLogs(prev => [toggAudit, ...prev]);
  };

  const handleUpdateProjName = (name: string) => {
    setProjName(name);
    localStorage.setItem('aan_project_name', name);
  };

  // Derive metrics
  const totalAttempts = events.length;
  const approvedHumans = events.filter(e => e.decision === 'approved').length;
  const blockedBots = events.filter(e => e.decision === 'denied').length;
  const reviewCount = events.filter(e => e.decision === 'review').length;

  // Render Onboarding Stepper flow if incomplete
  if (!onboardingCompleted) {
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
            <span className={onboardingStep === 3 ? "text-emerald-600" : ""}>3. Credentials</span>
            <span className={onboardingStep === 4 ? "text-emerald-600" : ""}>4. Complete</span>
          </div>

          <div className="min-h-[14rem] flex flex-col justify-center">
            {onboardingStep === 1 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 1: Administrative Organization Tenant</h3>
                  <p className="text-[11px] text-slate-500 font-light">Establish the legal corporate entity boundary for your workspaces.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Organization Name</label>
                    <input
                      type="text"
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
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 2: Attestation Scope Configuration</h3>
                  <p className="text-[11px] text-slate-500 font-light">Set up the technical project workspace environment to handle traffic.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Project Scope Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Default Auth Layer"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Evaluation Target</label>
                    <select
                      value={projSurface}
                      onChange={(e) => setProjSurface(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900"
                    >
                      <option value="signup">Registration / Signups Protection</option>
                      <option value="api_gate">API Perimeter Defense</option>
                      <option value="auth_layer">Single Sign On Security</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 3: Provision Cryptographic Credentials</h3>
                  <p className="text-[11px] text-slate-500 font-light">Secure, non-recoverable secret keys compiled to initialize connections.</p>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">Publishable Client Key</div>
                    <div className="text-slate-900 truncate">{pubKey}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">Secret Endpoint Key</div>
                    <div className="text-slate-900 truncate">••••••••••••••••••••••••••••••••••••••••</div>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Step 4: Platform Architecture</h3>
                  <p className="text-[11px] text-slate-500 font-light">Confirming privacy constraints. Node attestation pipeline is complete.</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs leading-normal font-light text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Non-custodial Zero-knowledge Standard</span>
                    <p className="mt-0.5 text-slate-500">
                      We operate purely as an offline-first trust platform. Raw user biometrics or passwords never touch our cloud storage databases.
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
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-900"
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
                  setOnboardingStep(4);
                } else if (onboardingStep === 4) {
                  handleSaveToSupabaseOnboarding();
                }
              }}
              disabled={loading}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <span>Configuring node...</span>
              ) : (
                <>
                  <span>{onboardingStep === 4 ? "Complete Node Setup" : "Continue"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Module Registry mapping tab IDs to their respective component renderers
  const MODULE_REGISTRY: Record<string, () => React.ReactNode> = {
    overview: () => (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
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

        {/* Inbound request pipeline chart / summary bar */}
        {totalAttempts === 0 ? (
          <div className="bg-white border border-slate-200/80 p-8 rounded-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-900 text-sm font-semibold">Your attestation project is initialized.</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-light leading-relaxed">
                Trigger calls inside the Test Lab simulation panel or integrated apps to witness real-time posture decisions.
              </p>
            </div>
            <button onClick={handleSeedEvents} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
              Load Sandbox Demonstration Events
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Assurance Verdict Breakdown</h3>
              <button onClick={handleClearEvents} className="text-[9px] font-mono text-slate-400 hover:text-slate-900 uppercase">
                Clear Logs (Reset)
              </button>
            </div>

            <div className="space-y-4 font-mono text-[10px]">
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
        )}

        {/* Quick trust decisions simulator */}
        <TrustDecisionSimulator />

        {/* Recent assessment history list */}
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
                {events.slice(0, 3).map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setActiveTab('events')}>
                    <td className="py-3 px-4 font-mono text-slate-900">{e.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{e.external_user_id}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        e.decision === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
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
    ),
    session_health: () => (
      <SessionHealthTab />
    ),
    human_assurance: () => (
      <HumanAssuranceTab 
        events={events} 
        projName={projName} 
        onAddEventToGlobalRegistry={onAddEventToGlobalRegistry} 
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
    events: () => (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
        {/* Page Header */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Attestation Event Stream</h2>
          <p className="text-xs text-slate-500 mt-1">Granular diagnostic telemetry logs captured on client nodes.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200/80 p-4 rounded-2xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by external user ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {['all', 'approved', 'review', 'denied'].map((status) => (
              <button
                key={status}
                onClick={() => setDecisionFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border tracking-wider cursor-pointer ${
                  decisionFilter === status 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-bold">Event ID</th>
                <th className="py-3 px-4 font-bold">External Ref</th>
                <th className="py-3 px-4 font-bold">Score</th>
                <th className="py-3 px-4 font-bold">Assurance Verdict</th>
                <th className="py-3 px-4 font-bold">Client Posture</th>
                <th className="py-3 px-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {events
                .filter(e => {
                  const matchesSearch = e.external_user_id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFilter = decisionFilter === 'all' || e.decision === decisionFilter;
                  return matchesSearch && matchesFilter;
                })
                .map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedGlobalEvent(e)}>
                    <td className="py-3.5 px-4 font-mono text-slate-900">{e.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{e.external_user_id}</td>
                    <td className="py-3.5 px-4 font-mono">{e.risk_score}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        e.decision === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        e.decision === 'denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {e.decision}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{e.device_signal}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Event detail modal drawer */}
        {selectedGlobalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setSelectedGlobalEvent(null)} />
            <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 p-8 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Assestation Record</span>
                    <h3 className="text-base font-black text-slate-950">{selectedGlobalEvent.id}</h3>
                  </div>
                  <button onClick={() => setSelectedGlobalEvent(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 font-mono text-[11px] text-slate-500 text-left">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>External Reference</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.external_user_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Attestation Verdict</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.decision}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Risk score</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.risk_score}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Client Posture</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.device_signal}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>IP network Health</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.ip_risk_signal}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>ZKP Proof Status</span>
                    <span className="text-slate-900 font-bold">{selectedGlobalEvent.proof_token_status}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedGlobalEvent(null)} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono uppercase tracking-wider">
                Close Profile Record
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    decisions: () => (
      <DecisionsTab events={events} />
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
      <AuditLogsTab auditLogs={auditLogs} />
    ),
    test_lab: () => (
      <TestLabTab 
        projName={projName} 
        onAddEventToGlobalRegistry={onAddEventToGlobalRegistry} 
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
            <h4 className="text-xs font-bold text-slate-900">Recommended Pipeline Pattern</h4>
            <ol className="list-decimal list-inside text-xs text-slate-500 space-y-2 font-light">
              <li>Mount the lightweight <code className="font-mono bg-slate-50 text-emerald-600 px-1 py-0.5 rounded">@aan/web-sdk</code> on your client-side signup or action trigger handlers.</li>
              <li>Inbound client calls returns a highly-compressed secure cryptographically signed <code className="font-mono bg-slate-50 text-emerald-600 px-1 py-0.5 rounded">proofToken</code>.</li>
              <li>Transmit the proofToken to your server backends. Submit a secure post request to <code className="font-mono bg-slate-50 text-slate-800 px-1 py-0.5 rounded">https://api.aan.network/v1/assert</code> to verify claims.</li>
            </ol>
          </div>
        </div>
      </div>
    ),
    settings: () => (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Organization Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure tenant business rules, compliance structures, and authorized domains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">General Configuration</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Legal Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      localStorage.setItem('aan_org_name', e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Primary Business Domain</label>
                  <input
                    type="text"
                    placeholder="acme.com"
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => alert("Organization settings saved successfully.")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 text-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Compliance Status</h3>
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>GDPR & SOC2 Type II Certified Node</span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                This node resides inside secure server enclaves fully certified for HIPAA, GDPR, and ISO/IEC 27001 data processing requirements.
              </p>
            </div>

          </div>
        </div>
      </div>
    )
  };

  // COMPLETE ENTERPRISE TRUST-INFRASTRUCTURE DASHBOARD
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

          {/* 14 items Sidebar Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2">Technical Dashboard</span>
            {[
              { id: 'overview', label: 'Trust Overview', icon: Activity },
              { id: 'session_health', label: 'Session Health', icon: HeartPulse },
              { id: 'human_assurance', label: 'Human Assurance', icon: Fingerprint },
              { id: 'trust_intelligence', label: 'Trust Intelligence', icon: Sparkles },
              { id: 'integrations', label: 'Integrations', icon: Code },
              { id: 'projects', label: 'Projects', icon: Layers },
              { id: 'events', label: 'Events', icon: Terminal },
              { id: 'decisions', label: 'Decisions', icon: CheckCircle2 },
              { id: 'policies', label: 'Policies', icon: Sliders },
              { id: 'webhooks', label: 'Webhooks', icon: Network },
              { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
              { id: 'test_lab', label: 'Test Lab', icon: Play },
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
                    setSelectedGlobalEvent(null);
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
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-mono text-xs font-bold">A</div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-900 block leading-none">{orgName || "Acme Inc."}</span>
              <button 
                onClick={() => onNavigate('landing')}
                className="text-[9px] text-rose-500 hover:underline block cursor-pointer"
              >
                Sign Out / Disconnect
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 p-6 sm:p-10 min-w-0 overflow-y-auto">
        {MODULE_REGISTRY[activeTab] ? MODULE_REGISTRY[activeTab]() : (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">Module under active development.</p>
          </div>
        )}
      </main>

    </div>
  );
}
