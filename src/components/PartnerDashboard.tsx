import React, { useState, useEffect } from 'react';
import { 
  Key, Webhook, Activity, Code, Shield, User, CornerDownRight, Check, AlertTriangle, 
  Search, Play, ArrowRight, RefreshCw, Send, HelpCircle, Eye, EyeOff, Sliders,
  Database, BookOpen, Trash2, FolderSync, Info, Settings, ShieldCheck, Terminal, Award, HelpCircle as HelpIcon, Layers, ClipboardList
} from 'lucide-react';
import { VerificationSession, PartnerApp } from '@/src/types';
import IntegrationWizardTab from './IntegrationWizardTab';
import DeveloperPortalTab from './DeveloperPortalTab';
import SandboxTab from './SandboxTab';
import HealthMonitorTab from './HealthMonitorTab';
import CertificationTab from './CertificationTab';
import VerificationProfilesTab from './VerificationProfilesTab';
import { isAcademyEnabled } from '../academyConfig';

interface PartnerDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
  onSetVerificationSessionId: (id: string) => void;
}

function mapTabToLesson(tab: string): string {
  const map: Record<string, string> = {
    overview: "partner_dashboard",
    projects: "projects",
    "api-keys": "api_keys",
    policies: "roles_permissions",
    logs: "verification_sessions",
    risks: "risk_engine",
    duplicates: "duplicate_detection",
    webhooks: "webhook_system",
    removals: "removal_requests",
    audits: "audit_logs",
    docs: "developer_sdk",
    wizard: "projects",
    "developer-portal": "developer_sdk",
    sandbox: "sandbox_engine",
    health: "risk_engine",
    certification: "projects",
    profiles: "verification_profiles"
  };
  return map[tab] || "intro";
}

export default function PartnerDashboard({ onNavigate, onSetVerificationSessionId }: PartnerDashboardProps) {
  // Primary relational DB local state containers
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [partnerApps, setPartnerApps] = useState<PartnerApp[]>([]);
  const [partnerConfig, setPartnerConfig] = useState<any>(null);
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>([]);
  const [duplicateSignals, setDuplicateSignals] = useState<any[]>([]);
  const [removalRequests, setRemovalRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout sidebar tab state
  const [activeTab, setActiveTab] = useState<
    'overview' | 'organizations' | 'verification-activity' | 'security-center' | 'trust-analytics' | 'api-keys' | 'webhooks' | 'audit-logs' | 'developers' | 'documentation' | 'settings'
  >('overview');

  // Sub-tab toggles inside advanced hubs
  const [orgSubTab, setOrgSubTab] = useState<'settings' | 'policies' | 'profiles'>('settings');
  const [securitySubTab, setSecuritySubTab] = useState<'threats' | 'sybils' | 'removals'>('threats');
  const [trustSubTab, setTrustSubTab] = useState<'health' | 'badge'>('health');
  const [devSubTab, setDevSubTab] = useState<'setup' | 'sandbox' | 'playground'>('setup');

  // Search & Filter controllers
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // Input forms state
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [createdApiKeyResponse, setCreatedApiKeyResponse] = useState<any>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // Project updating state
  const [projNameInput, setProjNameInput] = useState("");
  const [orgNameInput, setOrgNameInput] = useState("");
  const [allowedDomainsInput, setAllowedDomainsInput] = useState("");
  const [enforcementModeInput, setEnforcementModeInput] = useState("");
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Webhook custom simulation states
  const [activeSimSessionId, setActiveSimSessionId] = useState("");
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [simulatedWebhookResult, setSimulatedWebhookResult] = useState<any>(null);

  // API Playground dynamic state
  const [playgroundApiKey, setPlaygroundApiKey] = useState("poh_key_fintech_demo_111");
  const [playgroundMethod, setPlaygroundMethod] = useState<'verify_session' | 'verify_proof'>('verify_session');
  const [playgroundExtUserId, setPlaygroundExtUserId] = useState("user_example_99");
  const [playgroundEmailHash, setPlaygroundEmailHash] = useState("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
  const [playgroundPhoneHash, setPlaygroundPhoneHash] = useState("");
  const [playgroundDeviceFingerprint, setPlaygroundDeviceFingerprint] = useState("");
  const [playgroundProofToken, setPlaygroundProofToken] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);

  // Guided Onboarding flow states
  const [onboardingStep, setOnboardingStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aan_onboarding_step');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aan_onboarding_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [onboardingKeyName, setOnboardingKeyName] = useState("Production API Key");
  const [onboardingGeneratedKey, setOnboardingGeneratedKey] = useState<any>(null);
  const [onboardingKeyCopied, setOnboardingKeyCopied] = useState(false);
  const [onboardingWebhookUrl, setOnboardingWebhookUrl] = useState("https://api.mycompany.com/v1/aan-webhook");
  const [onboardingWebhookSaved, setOnboardingWebhookSaved] = useState(false);
  const [onboardingQuizAnswer, setOnboardingQuizAnswer] = useState<string | null>(null);
  const [onboardingQuizCorrect, setOnboardingQuizCorrect] = useState<boolean | null>(null);
  const [onboardingPlaygroundExtUser, setOnboardingPlaygroundExtUser] = useState("user_poh_onboard_77");
  const [onboardingPlaygroundLoading, setOnboardingPlaygroundLoading] = useState(false);
  const [onboardingPlaygroundResponse, setOnboardingPlaygroundResponse] = useState<any>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Persistence side effects
  const saveOnboardingStep = (step: number) => {
    setOnboardingStep(step);
    try {
      localStorage.setItem('aan_onboarding_step', step.toString());
    } catch (e) {
      console.warn("Storage write blocked", e);
    }
  };

  const handleOnboardingDismiss = () => {
    setOnboardingDismissed(true);
    try {
      localStorage.setItem('aan_onboarding_dismissed', 'true');
    } catch (e) {
      console.warn("Storage write blocked", e);
    }
  };

  const handleOnboardingReset = () => {
    setOnboardingDismissed(false);
    setOnboardingGeneratedKey(null);
    setOnboardingKeyCopied(false);
    setOnboardingWebhookSaved(false);
    setOnboardingQuizAnswer(null);
    setOnboardingQuizCorrect(null);
    setOnboardingPlaygroundResponse(null);
    saveOnboardingStep(1);
    try {
      localStorage.setItem('aan_onboarding_dismissed', 'false');
    } catch (e) {
      console.warn("Storage write blocked", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live sessions with fallback
      let sessData;
      try {
        const sessRes = await fetch('/api/internal/sessions');
        sessData = await sessRes.json();
      } catch (e) {
        sessData = [
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
      }
      setSessions(sessData);

      // 2. Fetch active credentials
      let appsData;
      try {
        const appsRes = await fetch('/api/internal/api-keys');
        appsData = await appsRes.json();
      } catch (e) {
        appsData = [
          {
            id: "partner_apps_fintech_123",
            name: "Fintech Trust Layer",
            api_key_hash: "78a14d2a200844559330e",
            api_key_last4: "d7a4",
            status: "active"
          }
        ];
      }
      setPartnerApps(appsData);

      // 3. Fetch active configuration (org & project settings)
      let configData;
      try {
        const configRes = await fetch('/api/internal/partner-config');
        configData = await configRes.json();
      } catch (e) {
        configData = {
          organization: {
            id: "org_enterprise_999",
            name: "AAN Global Enterprise",
            created_at: "2026-05-24T06:16:56.643Z"
          },
          project: {
            id: "proj_security_777",
            organization_id: "org_enterprise_999",
            name: "Default Secure Integration",
            allowed_domains: ["yourdomain.com", "localhost:3000", "poh-partner.com"],
            enforcement_mode: "monitor_only"
          }
        };
      }
      setPartnerConfig(configData);
      if (configData) {
        setProjNameInput(configData.project?.name || "");
        setOrgNameInput(configData.organization?.name || "");
        setAllowedDomainsInput(configData.project?.allowed_domains?.join(', ') || "");
        setEnforcementModeInput(configData.project?.enforcement_mode || "monitor_only");
      }

      // 4. Fetch webhooks log
      let webData;
      try {
        const webRes = await fetch('/api/internal/webhook-deliveries');
        webData = await webRes.json();
      } catch (e) {
        webData = [
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
            created_at: "2026-06-22T06:19:57.643Z"
          }
        ];
      }
      setWebhookDeliveries(webData);

      // 5. Fetch duplicate signals
      let dupData;
      try {
        const dupRes = await fetch('/api/internal/duplicate-signals');
        dupData = await dupRes.json();
      } catch (e) {
        dupData = [
          {
            id: "dup_1",
            project_id: "proj_security_777",
            session_id: "vss_session_failed_df9",
            external_user_id: "fintech_external_charlie_12",
            signature_template_id: "tmpl_102",
            matched_user_id: "usr_b710ef67",
            matched_template_id: "tmpl_101",
            confidence_score: 99.1,
            created_at: "2026-06-22T18:22:56.643Z"
          }
        ];
      }
      setDuplicateSignals(dupData);

      // 6. Fetch removal requests
      let remData;
      try {
        const remRes = await fetch('/api/internal/removal-requests');
        remData = await remRes.json();
      } catch (e) {
        remData = [
          {
            id: "rem_1",
            project_id: "proj_security_777",
            external_user_id: "fintech_external_charlie_12",
            status: "pending",
            reason: "GDPR Right to Be Forgotten request filed by user.",
            created_at: "2026-06-23T02:16:56.643Z"
          }
        ];
      }
      setRemovalRequests(remData);

      // 7. Fetch audit logs
      let audData;
      try {
        const audRes = await fetch('/api/internal/audit-logs');
        audData = await audRes.json();
      } catch (e) {
        audData = [
          {
            id: "log_1",
            actor_type: "partner",
            actor_id: "partner_apps_fintech_123",
            action: "session.create",
            target_type: "session",
            target_id: "vss_session_unconfirmed_9a4",
            metadata: { ext_usr: "fintech_external_alice_77", client_ip: "198.51.100.41", level: "human_unique" },
            created_at: "2026-06-23T04:16:56.643Z"
          }
        ];
      }
      setAuditLogs(audData);

      // 8. Fetch active custom rules
      let polData;
      try {
        const polRes = await fetch('/api/internal/policies');
        polData = await polRes.json();
      } catch (e) {
        polData = [
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
            description: "Based on security clearance, automatically deletes duplicate and fraudulent secondary profiles sharing identical facial credentials."
          }
        ];
      }
      setPolicies(polData);

    } catch (err) {
      console.warn("Gracefully unresolved sync status: using client verification repository", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      const response = await fetch('/api/internal/partner-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: orgNameInput,
          proj_name: projNameInput,
          allowed_domains: allowedDomainsInput,
          enforcement_mode: enforcementModeInput,
          webhook_url: newWebhookUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        setPartnerConfig(data);
        setActiveTab('overview');
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed saving configuration payload", err);
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    setIsCreatingKey(true);
    try {
      const response = await fetch('/api/internal/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          webhook_url: newWebhookUrl
        })
      });
      const data = await response.json();
      setCreatedApiKeyResponse(data);
      setNewKeyName("");
      
      // Refresh credentials state lists
      fetchDashboardData();
    } catch (err) {
      console.error("Failed creating API token key", err);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleSimulateWebhook = async (sessionId: string) => {
    if (!sessionId) return;
    setSimulatingWebhook(true);
    setSimulatedWebhookResult(null);
    try {
      const response = await fetch(`/api/internal/sessions/${sessionId}/test-webhook`, {
        method: 'POST'
      });
      const data = await response.json();
      setSimulatedWebhookResult(data);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed simulating webhook trigger callback", err);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const handleApproveRemoval = async (requestId: string) => {
    try {
      const response = await fetch(`/api/internal/removal-requests/${requestId}/approve`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed approving hard purge user removal request", err);
    }
  };

  const executePlaygroundRequest = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    try {
      let url = "";
      let options: RequestInit = {};

      if (playgroundMethod === 'verify_session') {
        url = "/api/v1/verify-session";
        options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": playgroundApiKey
          },
          body: JSON.stringify({
            partner_user_id: playgroundExtUserId,
            email_hash: playgroundEmailHash,
            phone_hash: playgroundPhoneHash,
            device_fingerprint: playgroundDeviceFingerprint,
            timestamp: new Date().toISOString()
          })
        };
      } else {
        url = "/api/v1/verify-proof-token";
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proof_token: playgroundProofToken
          })
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setPlaygroundResponse(data);
      
      if (playgroundMethod === 'verify_session' && data.proof_token) {
        setPlaygroundProofToken(data.proof_token);
      }

      // Refresh backboards state logs
      fetchDashboardData();
    } catch (err: any) {
      setPlaygroundResponse({ error: "Failed executing playground request gateway", message: err.message });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Filter verification sessions
  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const score = session.risk_score;
    let category = "low";
    if (score >= 85) category = "critical";
    else if (score >= 70) category = "high";
    else if (score >= 35) category = "medium";
    
    const matchesRisk = riskFilter === "all" || category === riskFilter;
    const matchesSearch = session.id.toLowerCase().includes(searchValue.toLowerCase()) || 
                          session.external_user_id.toLowerCase().includes(searchValue.toLowerCase());
    return matchesStatus && matchesRisk && matchesSearch;
  });

  // Filter Audit log searches
  const filteredAuditLogs = auditLogs.filter(log => {
    return log.action.toLowerCase().includes(searchValue.toLowerCase()) ||
           log.actor_id.toLowerCase().includes(searchValue.toLowerCase()) ||
           log.target_id.toLowerCase().includes(searchValue.toLowerCase());
  });

  const getEnforcementBadgeColor = (mode: string) => {
    switch(mode) {
      case 'monitor_only': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'flag_suspicious': return 'bg-yellow-950/40 text-yellow-500 border-yellow-900/50';
      case 'require_reverification': return 'bg-blue-950/40 text-blue-400 border-blue-900/50';
      case 'block_untrusted': return 'bg-red-950/40 text-red-400 border-red-900/50';
      case 'partner_removal': return 'bg-purple-950/40 text-purple-400 border-purple-900/50';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const activeProject = partnerConfig?.project || {
    name: "Default Secure Integration",
    allowed_domains: ["yourdomain.com", "localhost:3000"],
    login_policy: "Standard Identity Verification & Risk Core Rule",
    enforcement_mode: "monitor_only"
  };

  const activeOrg = partnerConfig?.organization || {
    name: "AAN Global Enterprise"
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] font-sans text-[#e3e5eb] flex flex-col selection:bg-[#202533]">
      
      {/* Horiz Header */}
      <header className="bg-[#111319] border-b border-[#1b1e28] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#171a23] text-blue-500 p-2 rounded border border-[#232a3b]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#5d6780] font-bold uppercase tracking-widest">{activeOrg.name}</span>
            <h1 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              Partner Identity Integration Console
              <span className="text-[10px] bg-[#171a23] border border-[#232a3b] font-mono text-[#78819a] font-semibold px-2 py-0.5 rounded uppercase">
                {activeProject.enforcement_mode}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex gap-4 items-center select-none">
          {isAcademyEnabled() && (
            <>
              <button 
                onClick={() => onNavigate('academy', undefined, mapTabToLesson(activeTab))} 
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white transition-all bg-[#171a23] hover:bg-[#1f2431] px-3.5 py-1.5 rounded border border-[#232a3b] cursor-pointer font-bold font-mono uppercase tracking-wider blink-subtle"
                title="Open contextual explanation for this feature inside the learning Academy"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain This View</span>
              </button>
              <span className="text-[#1b1e28] font-mono text-xs">|</span>
            </>
          )}
          <button 
            onClick={() => onNavigate('landing')} 
            className="text-xs text-[#78819a] hover:text-white transition-all bg-[#171a23] hover:bg-[#1f2431] px-3 py-1.5 rounded border border-[#232a3b] cursor-pointer"
          >
             Public Center
          </button>
          <span className="text-[#1b1e28] font-mono text-xs">|</span>
          <button 
            onClick={() => onNavigate('admin')} 
            className="text-xs text-white hover:bg-[#e2e5eb] hover:text-[#0d0e12] transition-all bg-[#171a23] border border-[#232a3b] font-semibold px-3 py-1.5 rounded cursor-pointer"
          >
            Admin Verification Platform 
          </button>
        </div>
      </header>

      {/* Main Grid Portal */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side menu */}
        <aside className="w-full md:w-64 bg-[#111319]/95 border-r border-[#1b1e28] p-4 space-y-1.5 shrink-0">
          <span className="text-[10px] font-mono text-[#5d6780] uppercase tracking-widest block px-3 mb-2 font-bold">Workspace Navigation</span>
          
          <button 
            onClick={() => { setActiveTab('overview'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'overview' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>

          <button 
            onClick={() => { setActiveTab('organizations'); setOrgSubTab('settings'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${(activeTab === 'organizations' && orgSubTab === 'settings') ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Projects
          </button>

          <button 
            onClick={() => { setActiveTab('organizations'); setOrgSubTab('policies'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${(activeTab === 'organizations' && orgSubTab === 'policies') ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            Trust Rules
          </button>

          <button 
            onClick={() => { setActiveTab('organizations'); setOrgSubTab('profiles'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${(activeTab === 'organizations' && orgSubTab === 'profiles') ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Shield className="w-4 h-4 text-red-400" />
            Trust Profiles
          </button>

          <button 
            onClick={() => { setActiveTab('api-keys'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'api-keys' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Key className="w-4 h-4" />
            API Keys
          </button>

          <button 
            onClick={() => { setActiveTab('webhooks'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'webhooks' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Webhook className="w-4 h-4" />
            Webhooks
          </button>

          <button 
            onClick={() => { setActiveTab('audit-logs'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'audit-logs' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <ClipboardList className="w-4 h-4 text-teal-400" />
            Activity
          </button>

          <button 
            onClick={() => { setActiveTab('verification-activity'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'verification-activity' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Database className="w-4 h-4" />
            Decisions
          </button>

          <button 
            onClick={() => { setActiveTab('documentation'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'documentation' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            Documentation
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setSearchValue(""); }}
            className={`w-full flex items-center gap-2.5 text-xs font-medium px-3.5 py-2.5 rounded transition-all text-left ${activeTab === 'settings' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold' : 'text-[#78819a] hover:text-[#e3e5eb] hover:bg-[#171a23]/40'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

        </aside>

        {/* Right workspace view */}
        <main className="flex-1 overflow-y-auto p-5 bg-[#0d0e12]">
          
          {/* Global MVP Mock Disclaimer */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 mb-4 text-xs text-[#78819a] leading-relaxed font-sans flex items-center gap-3 animate-fadeIn">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>This workspace contains demonstration data for development purposes.</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 text-[#78819a]">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-xs font-mono">Synchronizing workspace metadata streams...</p>
            </div>
          ) : (
            <>
              {/* ==================== OVERVIEW TAB ==================== */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-fadeIn">
                               {/* Alert banner for active project settings info */}
                  <div className="bg-[#111319] border border-[#1b1e28] p-4 rounded-xl flex items-start gap-3.5">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Platform Integration Policy Active</h4>
                      <p className="text-xs text-[#78819a] mt-1 leading-normal">
                        Your workspace is configured under the <b className="text-white">“{activeProject.name}”</b> project blueprint. 
                        Active enforcement mechanism is <span className="text-white underline font-mono">{activeProject.enforcement_mode}</span>.
                      </p>
                    </div>
                    {onboardingDismissed && (
                      <button
                        onClick={handleOnboardingReset}
                        className="text-xs bg-[#171a23] hover:bg-[#1f2431] text-blue-400 border border-[#232a3b] px-3 py-1.5 rounded cursor-pointer transition-colors shrink-0 font-mono font-bold"
                      >
                        REOPEN ONBOARDING GUIDE
                      </button>
                    )}
                  </div>

                  {/* GUIDED ONBOARDING FLOW FOR NEW PARTNERS */}
                  {!onboardingDismissed ? (
                    <div className="bg-gradient-to-br from-[#121620] to-[#0c0e14] border border-blue-900/40 rounded-xl p-6 relative overflow-hidden animate-fadeIn shadow-2xl shadow-blue-950/10">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1b1e28] pb-5 mb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                              Interactive Guide
                            </span>
                            <span className="text-xs text-[#5d6780] font-mono">Step {onboardingStep} of 4</span>
                          </div>
                          <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2 font-sans">
                            <Shield className="w-5 h-5 text-blue-400" />
                            AAN Partner Onboarding Flow
                          </h2>
                          <p className="text-xs text-[#78819a] mt-1">
                            Establish your credentials, set up live alerts, and run your first cryptographic humanness verification session.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={handleOnboardingDismiss}
                            className="text-[11px] text-[#5d6780] hover:text-white transition-colors cursor-pointer font-mono uppercase tracking-wider"
                            title="Hide this guide. You can reopen it at any time."
                          >
                            Dismiss Guide
                          </button>
                        </div>
                      </div>

                      {/* Stepper progress tracker */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                          { step: 1, title: '1. Core Principles' },
                          { step: 2, title: '2. Generate API Key' },
                          { step: 3, title: '3. Webhook Target' },
                          { step: 4, title: '4. API Handshake' }
                        ].map((s) => (
                          <button
                            key={s.step}
                            onClick={() => saveOnboardingStep(s.step)}
                            className={`h-1.5 rounded transition-all duration-300 relative group cursor-pointer ${
                              onboardingStep === s.step 
                                ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                                : onboardingStep > s.step 
                                  ? 'bg-emerald-500/80' 
                                  : 'bg-[#1b1e28]'
                            }`}
                          >
                            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#171a23] border border-[#232a3b] text-[9px] text-[#78819a] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-mono">
                              {s.title}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Step Contents */}
                      <div className="min-h-[220px]">
                        {/* STEP 1: Understand the Product */}
                        {onboardingStep === 1 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-[#111319]/80 border border-[#1b1e28] p-4 rounded-lg">
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center mb-3">
                                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                                </div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Zero-Knowledge Trust</h4>
                                <p className="text-[11px] text-[#78819a] mt-1.5 leading-relaxed">
                                  We never store raw passwords, SSNs, or physical ID documents. AAN translates trust signals into anonymous mathematical hashes.
                                </p>
                              </div>
                              <div className="bg-[#111319]/80 border border-[#1b1e28] p-4 rounded-lg">
                                <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center mb-3">
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Platform Decentralization</h4>
                                <p className="text-[11px] text-[#78819a] mt-1.5 leading-relaxed">
                                  Proof-of-Human keys are tied with user-owned hardware signatures. Partner apps query identity status without having access to user credentials.
                                </p>
                              </div>
                              <div className="bg-[#111319]/80 border border-[#1b1e28] p-4 rounded-lg">
                                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center mb-3">
                                  <Activity className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Real-Time Risk Engine</h4>
                                <p className="text-[11px] text-[#78819a] mt-1.5 leading-relaxed">
                                  Our engine continuously analyses device fingerprints, trusted hardware keys, and credential velocity to instantly flag sybil attacks.
                                </p>
                              </div>
                            </div>

                            {/* Interactive Quiz to solidify knowledge */}
                            <div className="bg-[#171a23]/50 border border-[#232a3b] p-4 rounded-lg mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <HelpCircle className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white font-mono">Quick Concept Check</span>
                                <div className="relative group ml-auto">
                                  <Info className="w-3.5 h-3.5 text-[#5d6780] hover:text-white cursor-help" />
                                  <span className="absolute right-0 bottom-6 bg-[#111319] border border-[#1b1e28] p-2 rounded text-[10px] text-[#78819a] w-48 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    AAN acts as an identity protection proxy, ensuring zero compliance risk for partners.
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#e3e5eb] leading-relaxed">
                                True or False: To ensure compliance, your platform must ingest and store the user's raw video recording or physical photo.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOnboardingQuizAnswer('true');
                                    setOnboardingQuizCorrect(false);
                                  }}
                                  className={`px-4 py-2 rounded text-xs font-medium border transition-all text-left cursor-pointer ${
                                    onboardingQuizAnswer === 'true'
                                      ? 'bg-red-500/10 border-red-500/50 text-red-200'
                                      : 'bg-[#111319] border-[#1b1e28] text-[#78819a] hover:border-blue-500/30'
                                  }`}
                                >
                                  True — We need to store raw files.
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOnboardingQuizAnswer('false');
                                    setOnboardingQuizCorrect(true);
                                  }}
                                  className={`px-4 py-2 rounded text-xs font-medium border transition-all text-left cursor-pointer ${
                                    onboardingQuizAnswer === 'false'
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 font-bold'
                                      : 'bg-[#111319] border-[#1b1e28] text-[#78819a] hover:border-blue-500/30'
                                  }`}
                                >
                                  False — Biometrics are processed on-device and purged instantly.
                                </button>
                              </div>

                              {onboardingQuizAnswer && (
                                <div className="mt-3 animate-fadeIn">
                                  {onboardingQuizCorrect ? (
                                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                                      <Check className="w-4 h-4 shrink-0" />
                                      <span><b>Spot on!</b> Storing raw images is a privacy and security liability. AAN keeps you fully insulated.</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-xs text-red-400">
                                      <AlertTriangle className="w-4 h-4 shrink-0" />
                                      <span><b>Incorrect.</b> AAN purges raw images immediately. Your app only gets anonymized cryptographic trust tokens.</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(2)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-900/10 cursor-pointer"
                              >
                                <span>Continue to API Key</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 2: Generate API Key */}
                        {onboardingStep === 2 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="bg-[#111319]/80 border border-[#1b1e28] p-5 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Key className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Generate Partner Credentials</span>
                                <div className="relative group ml-auto">
                                  <HelpCircle className="w-3.5 h-3.5 text-[#5d6780] hover:text-white cursor-help" />
                                  <span className="absolute right-0 bottom-6 bg-[#111319] border border-[#1b1e28] p-2 rounded text-[10px] text-[#78819a] w-48 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    The API key allows your secure backend server to request and parse user verification states.
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#78819a] leading-relaxed mb-4">
                                Give your first key a friendly identifier name. We will hash this credential using SHA-256 before writing it to our database.
                              </p>

                              {!onboardingGeneratedKey ? (
                                <form 
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!onboardingKeyName) return;
                                    setIsCreatingKey(true);
                                    try {
                                      const response = await fetch('/api/internal/api-keys', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          name: onboardingKeyName
                                        })
                                      });
                                      const data = await response.json();
                                      setOnboardingGeneratedKey(data);
                                      // Also refresh the primary state list
                                      fetchDashboardData();
                                    } catch (err) {
                                      console.error("Failed creating API token key", err);
                                    } finally {
                                      setIsCreatingKey(false);
                                    }
                                  }}
                                  className="flex flex-col sm:flex-row gap-3"
                                >
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={onboardingKeyName}
                                      onChange={(e) => setOnboardingKeyName(e.target.value)}
                                      placeholder="e.g. Production Backend Key"
                                      required
                                      className="w-full bg-[#171a23] border border-[#232a3b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={isCreatingKey}
                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-200 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                  >
                                    {isCreatingKey ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Key className="w-3.5 h-3.5" />
                                    )}
                                    <span>Generate Key</span>
                                  </button>
                                </form>
                              ) : (
                                <div className="space-y-3">
                                  <div className="bg-[#171a23] border border-emerald-500/30 p-3.5 rounded-lg">
                                    <span className="text-[10px] text-emerald-400 font-bold font-mono block uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5" /> Credential Created Successfully
                                    </span>
                                    <div className="flex items-center gap-2 bg-[#0d0e12] p-2.5 rounded border border-[#232a3b]">
                                      <code className="text-xs text-white select-all font-mono break-all flex-1">
                                        {onboardingGeneratedKey.raw_api_key}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(onboardingGeneratedKey.raw_api_key);
                                          setOnboardingKeyCopied(true);
                                          setTimeout(() => setOnboardingKeyCopied(false), 2000);
                                        }}
                                        className="text-[10px] text-blue-400 hover:text-white font-mono bg-[#171a23] px-2 py-1 rounded border border-[#232a3b] cursor-pointer"
                                      >
                                        {onboardingKeyCopied ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-yellow-500 block mt-2 font-mono leading-normal">
                                      ⚠️ Save this key now! It will never be displayed in plaintext again.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(1)}
                                className="text-xs text-[#5d6780] hover:text-white font-mono cursor-pointer"
                              >
                                Back to Core Principles
                              </button>
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(3)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-900/10 cursor-pointer"
                              >
                                <span>Continue to Webhooks</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: Webhook Target */}
                        {onboardingStep === 3 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="bg-[#111319]/80 border border-[#1b1e28] p-5 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Webhook className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Configure Live Webhook Handlers</span>
                                <div className="relative group ml-auto">
                                  <HelpCircle className="w-3.5 h-3.5 text-[#5d6780] hover:text-white cursor-help" />
                                  <span className="absolute right-0 bottom-6 bg-[#111319] border border-[#1b1e28] p-2 rounded text-[10px] text-[#78819a] w-48 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    When a user completes their verification flow, AAN fires an asynchronous POST request to this URL.
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#78819a] leading-relaxed mb-4">
                                Webhooks are vital. Instead of polling our API repeatedly, we will notify your servers in real-time when a verification changes state.
                              </p>

                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <input
                                    type="url"
                                    value={onboardingWebhookUrl}
                                    onChange={(e) => {
                                      setOnboardingWebhookUrl(e.target.value);
                                      setOnboardingWebhookSaved(false);
                                    }}
                                    placeholder="https://api.yourdomain.com/v1/aan-webhook"
                                    className="w-full bg-[#171a23] border border-[#232a3b] text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!onboardingWebhookUrl) return;
                                    setIsUpdatingConfig(true);
                                    try {
                                      const response = await fetch('/api/internal/partner-config', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          org_name: activeProject.name || "Default Project",
                                          proj_name: activeProject.name || "Default Project",
                                          allowed_domains: activeProject.allowed_domains?.join(', ') || "",
                                          enforcement_mode: activeProject.enforcement_mode || "monitor_only",
                                          webhook_url: onboardingWebhookUrl
                                        })
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        setOnboardingWebhookSaved(true);
                                        fetchDashboardData();
                                      }
                                    } catch (err) {
                                      console.error("Failed saving onboarding webhook", err);
                                    } finally {
                                      setIsUpdatingConfig(false);
                                    }
                                  }}
                                  disabled={isUpdatingConfig}
                                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-200 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                  {isUpdatingConfig ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Webhook className="w-3.5 h-3.5" />
                                  )}
                                  <span>Save Settings</span>
                                </button>
                              </div>

                              {onboardingWebhookSaved && (
                                <div className="mt-3 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400 animate-fadeIn flex items-center gap-2">
                                  <Check className="w-4 h-4 shrink-0" />
                                  <span>Webhook URL updated to <b>{onboardingWebhookUrl}</b> and ready to accept attestation events.</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(2)}
                                className="text-xs text-[#5d6780] hover:text-white font-mono cursor-pointer"
                              >
                                Back to API Key
                              </button>
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(4)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-900/10 cursor-pointer"
                              >
                                <span>Continue to Live API test</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 4: Interactive API Walkthrough & Live Session Handshake */}
                        {onboardingStep === 4 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                              {/* Left column: SDK/Code snippet with interactive tooltips */}
                              <div className="lg:col-span-6 space-y-3">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                  <Terminal className="w-4 h-4 text-blue-400" />
                                  Initiate Session (cURL / Request)
                                </h4>
                                <p className="text-[11px] text-[#78819a] leading-normal">
                                  Hover over key variables to understand payload parameters:
                                </p>

                                <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-3.5 font-mono text-[11px] leading-relaxed relative overflow-x-auto text-gray-300">
                                  <div className="text-blue-400">curl -X POST \</div>
                                  <div className="pl-4">"https://api.aan.org/api/v1/verification-sessions" \</div>
                                  
                                  {/* Interactive Tooltip Header */}
                                  <div className="pl-4 flex items-center gap-1 group relative py-0.5">
                                    <span>-H "</span>
                                    <span 
                                      onMouseEnter={() => setActiveTooltip('apikey')}
                                      onMouseLeave={() => setActiveTooltip(null)}
                                      className="text-emerald-400 underline decoration-dotted decoration-emerald-500 cursor-help font-bold"
                                    >
                                      x-api-key: {onboardingGeneratedKey?.raw_api_key?.substring(0, 10) || "poh_key_onboarding..."}...
                                    </span>
                                    <span>" \</span>
                                    {activeTooltip === 'apikey' && (
                                      <div className="absolute left-0 bottom-6 bg-slate-900 border border-blue-500/30 p-2 rounded text-[10px] text-gray-200 w-56 z-10 shadow-xl leading-normal">
                                        <b>x-api-key</b>: The private, unique token you generated in Step 2. Never expose this key in front-end client code.
                                      </div>
                                    )}
                                  </div>

                                  <div className="pl-4">-H "Content-Type: application/json" \</div>
                                  <div className="pl-4 text-blue-400">-d '{"{"}</div>
                                  
                                  {/* Interactive Tooltip Ext User */}
                                  <div className="pl-8 group relative py-0.5">
                                    <span>"</span>
                                    <span 
                                      onMouseEnter={() => setActiveTooltip('extuser')}
                                      onMouseLeave={() => setActiveTooltip(null)}
                                      className="text-indigo-400 underline decoration-dotted decoration-indigo-400 cursor-help font-bold"
                                    >
                                      external_user_id
                                    </span>
                                    <span>": "</span>
                                    <input
                                      type="text"
                                      value={onboardingPlaygroundExtUser}
                                      onChange={(e) => setOnboardingPlaygroundExtUser(e.target.value)}
                                      className="bg-[#171a23] border border-[#232a3b] text-white text-[11px] px-1 rounded focus:outline-none focus:border-blue-500 font-mono w-36"
                                    />
                                    <span>",</span>
                                    {activeTooltip === 'extuser' && (
                                      <div className="absolute left-0 bottom-6 bg-slate-900 border border-blue-500/30 p-2 rounded text-[10px] text-gray-200 w-56 z-10 shadow-xl leading-normal">
                                        <b>external_user_id</b>: Standard persistent ID of the user in your partner DB. Used to link their verification claim.
                                      </div>
                                    )}
                                  </div>

                                  {/* Interactive Tooltip Level */}
                                  <div className="pl-8 group relative py-0.5">
                                    <span>"</span>
                                    <span 
                                      onMouseEnter={() => setActiveTooltip('level')}
                                      onMouseLeave={() => setActiveTooltip(null)}
                                      className="text-amber-400 underline decoration-dotted decoration-amber-400 cursor-help font-bold"
                                    >
                                      verification_level
                                    </span>
                                    <span>": "standard"</span>
                                    {activeTooltip === 'level' && (
                                      <div className="absolute left-0 bottom-6 bg-slate-900 border border-blue-500/30 p-2 rounded text-[10px] text-gray-200 w-56 z-10 shadow-xl leading-normal">
                                        <b>verification_level</b>: "standard" checks credential and device trust indicators. "high" enforces secure hardware signatures.
                                      </div>
                                    )}
                                  </div>

                                  <div className="pl-4 text-blue-400">{"}"}'</div>
                                </div>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    setOnboardingPlaygroundLoading(true);
                                    setOnboardingPlaygroundResponse(null);
                                    try {
                                      // Run real POST request to register user session
                                      const keyToUse = onboardingGeneratedKey?.raw_api_key || "poh_key_fintech_demo_111";
                                      const response = await fetch('/api/v1/verification-sessions', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'x-api-key': keyToUse
                                        },
                                        body: JSON.stringify({
                                          external_user_id: onboardingPlaygroundExtUser
                                        })
                                      });
                                      const data = await response.json();
                                      setOnboardingPlaygroundResponse(data);
                                      fetchDashboardData();
                                    } catch (e: any) {
                                      setOnboardingPlaygroundResponse({ error: "Failed to perform handshake", message: e.message });
                                    } finally {
                                      setOnboardingPlaygroundLoading(false);
                                    }
                                  }}
                                  disabled={onboardingPlaygroundLoading}
                                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                                >
                                  {onboardingPlaygroundLoading ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5" />
                                  )}
                                  <span>Execute API Request Handshake</span>
                                </button>
                              </div>

                              {/* Right column: API response visualization */}
                              <div className="lg:col-span-6 space-y-3">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                  <Terminal className="w-4 h-4 text-emerald-400" />
                                  Live JSON Response
                                </h4>
                                <p className="text-[11px] text-[#78819a] leading-normal">
                                  Execute the handshake on the left to witness real-time platform generation.
                                </p>

                                <div className="bg-[#111319] border border-[#1b1e28] rounded-lg p-3.5 font-mono text-[11px] leading-relaxed min-h-[140px] text-emerald-400 relative">
                                  {onboardingPlaygroundResponse ? (
                                    <div className="space-y-1 select-all animate-fadeIn">
                                      <div>{"{"}</div>
                                      <div className="pl-4 text-gray-300">"id": <span className="text-emerald-300">"{onboardingPlaygroundResponse.id || onboardingPlaygroundResponse.id}"</span>,</div>
                                      <div className="pl-4 text-gray-300">"status": <span className="text-amber-300">"{onboardingPlaygroundResponse.status}"</span>,</div>
                                      <div className="pl-4 text-gray-300">"external_user_id": <span className="text-indigo-300">"{onboardingPlaygroundResponse.external_user_id}"</span>,</div>
                                      <div className="pl-4 text-gray-300">"risk_score": <span className="text-emerald-300">{onboardingPlaygroundResponse.risk_score}</span>,</div>
                                      <div className="pl-4 text-gray-300">"duplicate_candidate": <span className="text-emerald-300">{String(onboardingPlaygroundResponse.duplicate_candidate)}</span>,</div>
                                      <div className="pl-4 text-gray-300">"result_reason": <span className="text-[#78819a]">"{onboardingPlaygroundResponse.result_reason}"</span></div>
                                      <div>{"}"}</div>
                                      
                                      {onboardingPlaygroundResponse.id && (
                                        <div className="mt-4 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded text-[10px] text-emerald-400 leading-normal font-sans">
                                          🎉 <b>Success!</b> A secure verification session ID was created. Direct your client device to:
                                          <div className="mt-1.5 font-mono text-[9px] bg-black/40 p-1.5 rounded text-white select-all">
                                            {window.location.origin}/verify/session/{onboardingPlaygroundResponse.id}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-[#5d6780]">
                                      <Code className="w-6 h-6 mb-2 stroke-1" />
                                      <span className="text-[10px] font-mono text-center">Awaiting execution...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Final Congratulations & Checkmark */}
                            {onboardingPlaygroundResponse?.id && (
                              <div className="bg-gradient-to-r from-emerald-950/20 to-blue-950/20 border border-emerald-500/20 rounded-lg p-4 mt-4 animate-fadeIn flex flex-col sm:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Award className="w-5 h-5 text-emerald-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Onboarding Checklist Finalized!</h4>
                                    <p className="text-[11px] text-[#78819a] mt-0.5">
                                      You've successfully mastered identity principles, credentials, hooks, and active handshakes.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleOnboardingDismiss}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
                                >
                                  Finish & Launch Dashboard
                                </button>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                              <button
                                type="button"
                                onClick={() => saveOnboardingStep(3)}
                                className="text-xs text-[#5d6780] hover:text-white font-mono cursor-pointer"
                              >
                                Back to Webhook Target
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111319] border border-[#1b1e28] p-4 rounded-xl flex items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Onboarding Checklist Complete</h4>
                          <p className="text-[11px] text-[#78819a] mt-0.5">
                            You completed the guided tutorial. Feel free to reset and re-run this flow at any point.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleOnboardingReset}
                        className="text-xs text-blue-400 hover:text-white transition-all bg-[#171a23] hover:bg-[#1f2431] px-3 py-1.5 rounded border border-[#232a3b] font-mono uppercase font-bold tracking-wider cursor-pointer"
                      >
                        Reset Guide
                      </button>
                    </div>
                  )}

                  {/* Main Dashboard trust metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Trust Decisions Today</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">{sessions.length}</div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Total trust sessions evaluated today</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Trusted Users</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">
                        {sessions.filter(s => s.status === 'passed').length}
                      </div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Legitimate humans verified</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-yellow-500 font-bold uppercase tracking-wider block">Suspicious Sessions</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">
                        {sessions.filter(s => s.status === 'review' || (s.risk_score >= 35 && s.risk_score < 70)).length}
                      </div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Sessions flagged for potential risk</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-wider block">High-Risk Attempts</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">
                        {sessions.filter(s => s.status === 'failed' || s.risk_score >= 70).length}
                      </div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Prevented bot or malicious access</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Duplicate Accounts Prevented</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">{duplicateSignals.length}</div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Sybil or multi-account attempts stopped</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-teal-400 font-bold uppercase tracking-wider block">Platform Health</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">Active</div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Uptime and API services functional</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Active Integrations</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">
                        {partnerApps.length || 2}
                      </div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Connected customer applications</span>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl">
                      <span className="font-mono text-[9px] text-purple-400 font-bold uppercase tracking-wider block">Average Response Time</span>
                      <div className="text-3xl font-semibold text-white mt-2 tracking-tight">1.25s</div>
                      <span className="text-[10px] text-[#5d6780] block mt-1">Mean trust evaluation duration</span>
                    </div>
                  </div>

                  {/* Account Removal Queue status indicator */}
                  <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Account Removal Queue</h4>
                      <p className="text-xs text-[#78819a] mt-1 leading-normal">
                        Manage automated right-to-be-forgotten requests.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[#78819a] bg-[#171a23] px-3.5 py-1.5 rounded-lg border border-[#232a3b]">
                      {removalRequests.length} Pending Requests
                    </div>
                  </div>

                  {/* Integration Overview */}
                  <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Code className="text-blue-400 w-4.5 h-4.5" />
                      Platform Integration Overview
                    </h3>
                    <p className="text-xs text-[#78819a] leading-relaxed">
                      AAN operates as an enterprise trust infrastructure layer sitting between user registration and your core authentication system to verify uniqueness and reduce automated threat activity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="bg-[#0d0e12] p-5 rounded-xl border border-[#1b1e28] text-xs">
                        <b className="text-blue-400 block mb-1">1. Verification Session Creation</b>
                        <p className="text-[#78819a] leading-relaxed mt-1">
                          When a user triggers login or sign-up, your server requests a verification session via <code className="text-emerald-400 text-[10px]">/api/v1/verify-session</code>.
                        </p>
                      </div>
                      <div className="bg-[#0d0e12] p-5 rounded-xl border border-[#1b1e28] text-xs">
                        <b className="text-blue-400 block mb-1">2. User Verification Redirection</b>
                        <p className="text-[#78819a] leading-relaxed mt-1">
                          If re-verification is required, direct the user to the verification path <code className="text-emerald-400 text-[10px]">/verify/session/[id]</code>.
                        </p>
                      </div>
                      <div className="bg-[#0d0e12] p-5 rounded-xl border border-[#1b1e28] text-xs">
                        <b className="text-blue-400 block mb-1">3. Proof Token Verification</b>
                        <p className="text-[#78819a] leading-relaxed mt-1">
                          Verify the signed cryptographically secure proof token using <code className="text-emerald-400 text-[10px]">/api/v1/verify-proof-token</code> before authorizing downstream access.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== ORGANIZATIONS TAB: SETTINGS ==================== */}
              {activeTab === 'organizations' && orgSubTab === 'settings' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-[#1b1e28] gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setOrgSubTab('settings')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'settings' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Project Settings
                    </button>
                    <button
                      onClick={() => setOrgSubTab('policies')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'policies' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Trust Rules
                    </button>
                    <button
                      onClick={() => setOrgSubTab('profiles')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'profiles' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Trust Profiles
                    </button>
                  </div>
                  <div className="border-b border-[#1b1e28] pb-4">
                    <h2 className="text-lg font-bold text-white">Project Security</h2>
                    <p className="text-xs text-[#78819a]">Manage origin restrictions, allowed domains, and platform protection modes.</p>
                  </div>

                  <form onSubmit={handleUpdateConfig} className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-5 max-w-2xl text-left">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5">Organization Label Name</label>
                        <input 
                          type="text"
                          required
                          value={orgNameInput}
                          onChange={(e) => setOrgNameInput(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5">Project Integration Label</label>
                        <input 
                          type="text"
                          required
                          value={projNameInput}
                          onChange={(e) => setProjNameInput(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5">Allowed Domain Origins (comma separated list)</label>
                        <input 
                          type="text"
                          required
                          value={allowedDomainsInput}
                          onChange={(e) => setAllowedDomainsInput(e.target.value)}
                          placeholder="localhost:3000, yourdomain.com, api.yourdomain.com"
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5">Protection Mode (Required)</label>
                        <select
                          value={enforcementModeInput}
                          onChange={(e) => setEnforcementModeInput(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] text-xs p-2 rounded text-slate-300 focus:outline-none font-mono"
                        >
                          <option value="monitor_only">Monitor only (Passive logging)</option>
                          <option value="flag_suspicious">Flag suspicious accounts (Permissive checks)</option>
                          <option value="require_reverification">Require re-verification (Strict loops)</option>
                          <option value="block_untrusted">Block high-risk accounts (Immediate programmatic API block)</option>
                          <option value="partner_removal">Partner-approved removal mode (Purge queues)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-[#1b1e28] pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdatingConfig}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded transition-all cursor-pointer"
                      >
                        {isUpdatingConfig ? "Saving Protection Settings..." : "Save Protection Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==================== API KEYS TAB ==================== */}
              {activeTab === 'api-keys' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-[#1b1e28] pb-4">
                    <h2 className="text-lg font-bold text-white">Cryptographic API Key Credentials</h2>
                    <p className="text-xs text-[#78819a]">Generate hashed enterprise access keys to connect your server-side framework.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left">
                    
                    <form onSubmit={handleCreateApiKey} className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
                      <h3 className="font-bold text-white text-sm">Generate credential API Key</h3>
                      
                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1">Key descriptor name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Fintech Production Auth Portal"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1">Webhook Target Endpoints Url (Optional)</label>
                        <input 
                          type="url"
                          placeholder="https://api.yourdomain.com/aan-webhooks"
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingKey}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded transition-all cursor-pointer"
                      >
                        {isCreatingKey ? "Generating securely..." : "Generate Plaintext Secret Key"}
                      </button>
                    </form>

                    <div className="space-y-4">
                      {createdApiKeyResponse && (
                        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs font-mono">
                          <span className="text-emerald-400 font-bold block mb-1 text-[10px] uppercase">Plaintext Access Key Created (Reveal Warn)</span>
                          <div className="bg-[#0d0e12] p-3 rounded border border-[#1b1e28] break-all select-all font-bold text-slate-100 flex items-center justify-between">
                            <code>{createdApiKeyResponse.plain_text_key_warning}</code>
                          </div>
                          <p className="text-[10px] text-[#78819a] mt-2 leading-relaxed italic">
                            * Safety Policy: Record this key immediately. It is permanently hashed using SHA-255 inside database directories and cannot be displayed again.
                          </p>
                        </div>
                      )}

                      <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4 text-left">
                        <span className="font-mono text-[9px] text-[#78819a] font-bold uppercase tracking-wider block">Active Hashed Access Keys</span>
                        <div className="space-y-3">
                          {partnerApps.map(app => (
                            <div key={app.id} className="bg-[#0d0e12] p-3 rounded-lg border border-[#1b1e28] flex items-center justify-between text-xs">
                              <div>
                                <h4 className="font-bold text-white mb-0.5">{app.name}</h4>
                                <span className="font-mono text-[9px] text-[#5d6780] block truncate max-w-xs">SHA-256 Hash: {app.api_key_hash}</span>
                                {app.webhook_url && (
                                  <span className="text-blue-500 block font-mono text-[10px] mt-1">Target Webhook: {app.webhook_url}</span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 rounded">
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== ORGANIZATIONS TAB: POLICIES ==================== */}
              {activeTab === 'organizations' && orgSubTab === 'policies' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-[#1b1e28] gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setOrgSubTab('settings')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'settings' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Project Settings
                    </button>
                    <button
                      onClick={() => setOrgSubTab('policies')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'policies' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      MFA Login Policies
                    </button>
                    <button
                      onClick={() => setOrgSubTab('profiles')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'profiles' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Verification Profiles
                    </button>
                  </div>
                  <div className="border-b border-[#1b1e28] pb-4 text-left">
                    <h2 className="text-lg font-bold text-white">Automation Rules & Threat Risk Thresholds Policies</h2>
                    <p className="text-xs text-[#78819a]">Configure conditional rules triggered by device reputations and duplicate account anomalies.</p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden text-left">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                        <tr>
                          <th className="py-4 px-6">Rule Label</th>
                          <th className="py-4 px-4">Evaluation Pattern</th>
                          <th className="py-4 px-4 text-center">Outcome Remediation</th>
                          <th className="py-4 px-4">Description</th>
                          <th className="py-4 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b1e28] text-slate-300">
                        {policies.map(p => (
                          <tr key={p.id}>
                            <td className="py-4 px-6 font-bold text-white">{p.name}</td>
                            <td className="py-4 px-4 font-mono text-blue-400">{p.conditions}</td>
                            <td className="py-4 px-4 text-center">
                              <span className="bg-[#0d0e12] text-red-400 border border-red-900/40 font-mono text-[9px] font-bold uppercase rounded px-2.5 py-0.5">
                                {p.thenAction}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-[#78819a]">{p.description}</td>
                            <td className="py-4 px-6 text-right font-mono text-[10px]">
                              <span className={`font-bold uppercase ${p.active ? 'text-emerald-400' : 'text-[#5d6780]'}`}>
                                {p.active ? "● ACTIVE_ENFORCED" : "○ INACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== VERIFICATION SESSIONS TAB ==================== */}
              {activeTab === 'verification-activity' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-[#1b1e28] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                    <div>
                      <h2 className="text-lg font-bold text-white">Trust Decisions</h2>
                      <p className="text-xs text-[#78819a]">Continuous risk engine grades for incoming platform integrations.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Search session or user ID..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="bg-[#111319] border border-[#1b1e28] text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 font-mono w-48 text-white"
                      />

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#111319] border border-[#1b1e28] text-xs p-1.5 rounded text-slate-300 focus:outline-none font-mono"
                      >
                        <option value="all">ALL VERDICTS</option>
                        <option value="started">STARTED</option>
                        <option value="passed">PASSED</option>
                        <option value="review">REVIEW</option>
                        <option value="failed">FAILED</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden shadow-lg text-left">
                    {filteredSessions.length === 0 ? (
                      <div className="p-12 text-center text-[#78819a] text-xs font-mono">
                        No active trust sessions match filters.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                            <tr>
                              <th className="py-4 px-6">Session ID</th>
                              <th className="py-4 px-4">Partner User ID</th>
                              <th className="py-4 px-4 text-center">Status</th>
                              <th className="py-4 px-4 text-right">Anomaly Score</th>
                              <th className="py-4 px-4">Signals / Evaluation flags</th>
                              <th className="py-4 px-6 text-right">Trust Flow</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1b1e28] text-slate-300">
                            {filteredSessions.map(session => (
                              <tr key={session.id} className="hover:bg-[#0d0e12]/30">
                                <td className="py-4 px-6 font-mono text-[11px] text-blue-400 font-semibold">{session.id}</td>
                                <td className="py-4 px-4 font-mono text-[11px]">{session.external_user_id}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                                    session.status === 'passed' ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' :
                                    session.status === 'review' ? 'bg-yellow-950/40 border-yellow-900/50 text-yellow-500' :
                                    session.status === 'failed' ? 'bg-red-950/40 border-red-900/50 text-red-500' :
                                    'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}>
                                    {session.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right font-mono font-bold">
                                  <span className={session.risk_score >= 70 ? 'text-red-400' : session.risk_score >= 35 ? 'text-yellow-500' : 'text-slate-300'}>
                                    {session.risk_score} / 100
                                  </span>
                                </td>
                                <td className="py-4 px-4 max-w-xs truncate font-mono text-[10px] text-slate-400">
                                  {session.risk_reasons.length > 0 ? (
                                    <span className="text-red-400 font-bold">{session.risk_reasons.join(", ")}</span>
                                  ) : (
                                    <span className="text-slate-500">None detected</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    onClick={() => {
                                      onSetVerificationSessionId(session.id);
                                      onNavigate('verify');
                                    }}
                                    className="bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 px-3 py-1.5 rounded transition-all font-semibold font-mono text-[10px] cursor-pointer"
                                  >
                                    Review Challenge Gate
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== SECURITY CENTER: THREATS ==================== */}
              {activeTab === 'security-center' && securitySubTab === 'threats' && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex border-b border-[#1b1e28] gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setSecuritySubTab('threats')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'threats' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Threat Events
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('sybils')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'sybils' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Duplicate Account Detection
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('removals')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'removals' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Removal Claims Queue
                    </button>
                  </div>
                  <div className="border-b border-[#1b1e28] pb-4">
                    <h2 className="text-lg font-bold text-white">Anomalous Engine Threat Risk Events</h2>
                    <p className="text-xs text-[#78819a]">Reviews and override queries targeting high-risk emulators, proxy networks, and bot structures.</p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden text-left">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                        <tr>
                          <th className="py-3.5 px-6">Session</th>
                          <th className="py-3.5 px-4">Integrator id</th>
                          <th className="py-3.5 px-4">Risk Level</th>
                          <th className="py-3.5 px-4">Engine Reasons</th>
                          <th className="py-3.5 px-6 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b1e28] text-slate-300">
                        {sessions.filter(s => s.risk_score >= 35).map(s => (
                          <tr key={s.id}>
                            <td className="py-4 px-6 font-mono text-blue-400">{s.id}</td>
                            <td className="py-4 px-4 font-mono">{s.external_user_id}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                                s.risk_score >= 70 ? 'bg-red-950/40 border-red-900/50 text-red-500' : 'bg-yellow-950/40 border-yellow-900/50 text-yellow-500'
                              }`}>
                                {s.risk_score >= 70 ? "CRITICAL/HIGH" : "MEDIUM"}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] text-red-400">{s.risk_reasons.join(', ')}</td>
                            <td className="py-4 px-6 text-right font-mono font-bold text-white">{s.risk_score} / 100</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== SECURITY CENTER: SYBILS ==================== */}
              {activeTab === 'security-center' && securitySubTab === 'sybils' && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex border-b border-[#1b1e28] gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setSecuritySubTab('threats')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'threats' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Threat Events
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('sybils')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'sybils' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Duplicate Account Detection
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('removals')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'removals' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Removal Claims Queue
                    </button>
                  </div>
                  <div className="border-b border-[#1b1e28] pb-4 text-left">
                    <h2 className="text-lg font-bold text-white">Duplicate Account Detection</h2>
                    <p className="text-xs text-[#78819a]">Detections where processed hardware signatures target multiple decoupled external partner credentials.</p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl flex items-start gap-3 bg-yellow-950/10 border-yellow-900/25 mb-6 text-left">
                    <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0" />
                    <p className="text-xs leading-normal text-yellow-400">
                      <b>Duplicate Account Warning:</b> Standard duplicate accounts are flagged when users attempt to register multiple credentials using identical device signatures or cryptographic keys. Our privacy preservation system alerts your workspace without showing raw private details.
                    </p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden text-left">
                    {duplicateSignals.length === 0 ? (
                      <div className="p-12 text-center text-[#78819a] text-xs font-mono">
                        No signature twin collusion signals currently registered.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                          <tr>
                            <th className="py-4 px-6">Twin Hash Link ID</th>
                            <th className="py-4 px-4">Primary User profile</th>
                            <th className="py-4 px-4">Decoupled Twin User claimant</th>
                            <th className="py-4 px-4 text-center">Matches Confidence</th>
                            <th className="py-4 px-6 text-right">Detected Event Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300 font-mono">
                          {duplicateSignals.map(dup => (
                            <tr key={dup.id}>
                              <td className="py-4 px-6 text-blue-400 font-bold">{dup.id}</td>
                              <td className="py-4 px-4 text-white font-semibold">{dup.external_user_id}</td>
                              <td className="py-4 px-4 text-red-400 font-semibold">{dup.duplicate_external_user_id}</td>
                              <td className="py-3.5 px-4 text-center text-yellow-400 font-bold">{dup.confidence}% Match</td>
                              <td className="py-4 px-6 text-right text-slate-400 text-[10px]">{new Date(dup.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== WEBHOOKS TAB ==================== */}
              {activeTab === 'webhooks' && (
                <div className="space-y-8 animate-fadeIn">
                       <div className="border-b border-[#1b1e28] pb-4 text-left">
                    <h2 className="text-lg font-bold text-white">Cryptographic Webhook Broadcasting Gateway</h2>
                    <p className="text-xs text-[#78819a]">Configure asynchronous post event receivers with HMAC-SHA256 headers verification.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left">
                    
                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-emerald-400" />
                        Configure Broadcast Target
                      </h3>
                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5">Webhook Shared Signature Secret (whsec)</label>
                        <div className="bg-[#0d0e12] p-3 rounded font-mono text-slate-300 border border-[#1b1e28] text-xs flex justify-between items-center">
                          <code>{activeProject.webhook_secret}</code>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] uppercase tracking-wider mb-1.5 flex justify-between">
                          <span>Target Broadcast Url</span>
                          <span className="text-emerald-400 text-[9px]">POST JSON PAYLOAD</span>
                        </label>
                        <input 
                          type="url"
                          required
                          placeholder="https://api.yourdomain.com/aan-hook"
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if(!newWebhookUrl) return;
                          handleUpdateConfig(new Event('submit') as any);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 font-semibold text-xs py-2 rounded transition-all cursor-pointer"
                      >
                        Renew Webhook Broadcast Endpoint
                      </button>
                    </div>

                    {/* Interactive webhook simulation playground requested for partners */}
                    <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-4">
                      <h3 className="font-bold text-white text-sm">Send Webhook Test sandbox</h3>
                      <p className="text-xs text-[#78819a]">Trigger standard mockup verification events to testing payloads integration.</p>
                      
                      <div>
                        <label className="block text-[10px] font-mono text-[#78819a] mb-1.5">Select session resource to simulate</label>
                        <select
                          value={activeSimSessionId}
                          onChange={(e) => setActiveSimSessionId(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-[#1b1e28] text-xs p-2 rounded text-slate-250 focus:outline-none font-mono"
                        >
                          <option value="">-- Choose active session --</option>
                          {sessions.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.id} ({s.external_user_id} - {s.status})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleSimulateWebhook(activeSimSessionId)}
                        disabled={!activeSimSessionId || simulatingWebhook}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {simulatingWebhook ? "Broadcasting..." : "Dispatch Simulated Webhook"}
                      </button>

                      {simulatedWebhookResult && (
                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-[11px] font-mono space-y-1">
                          <span className="text-emerald-400 font-bold block text-[10px] uppercase">Webhook Delivery Results:</span>
                          <div className="text-slate-300">Status: <b className="text-emerald-400">Broadcast Success (200 OK)</b></div>
                          <div className="text-slate-300 truncate">Payload signature hex string: <code className="text-blue-400 font-semibold">{simulatedWebhookResult.delivery?.signature}</code></div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Dispatched logs table */}
                  <div className="space-y-4 text-left">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78819a]">Dispatched Webhooks Gate Log</span>
                    <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                      {webhookDeliveries.length === 0 ? (
                        <div className="p-8 text-center text-[#78819a] text-xs font-mono">
                          No webhook payloads dispatched.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                            <tr>
                              <th className="py-3 px-6">Log ID</th>
                              <th className="py-3 px-4">Dispatched Event Type</th>
                              <th className="py-3 px-4">Target Payload endpoint</th>
                              <th className="py-3 px-4 text-center">Signature (x-aan-signature)</th>
                              <th className="py-3 px-6 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1b1e28] text-slate-300 font-mono">
                            {webhookDeliveries.map(d => (
                              <tr key={d.id} className="hover:bg-[#0d0e12]/30">
                                <td className="py-4 px-6 text-blue-400">{d.id}</td>
                                <td className="py-4 px-4 text-emerald-400 font-bold text-[11px]">{d.event_type}</td>
                                <td className="py-4 px-4 text-slate-300 truncate max-w-xs">{d.url}</td>
                                <td className="py-4 px-4 text-center text-indigo-400 text-[10px] tracking-tighter truncate max-w-xs">
                                  {d.signature}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 font-bold uppercase px-2 py-0.5 rounded">
                                    {d.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== SECURITY CENTER: REMOVALS ==================== */}
              {activeTab === 'security-center' && securitySubTab === 'removals' && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex border-b border-[#1b1e28] gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setSecuritySubTab('threats')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'threats' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Threat Events
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('sybils')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'sybils' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Duplicate Account Detection
                    </button>
                    <button
                      onClick={() => setSecuritySubTab('removals')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${securitySubTab === 'removals' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-[#78819a] hover:text-white'}`}
                    >
                      Removal Claims Queue
                    </button>
                  </div>
                  <div className="border-b border-[#1b1e28] pb-4">
                    <h2 className="text-lg font-bold text-white">Partner-Approved User Removal and Data Deletion Requests</h2>
                    <p className="text-xs text-[#78819a]">Manage and process account deletion and data minimization requests.</p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] p-6 rounded-xl flex items-start gap-3 bg-purple-950/10 border-purple-900/25 mb-6">
                    <Info className="text-purple-400 w-5 h-5 shrink-0" />
                    <p className="text-xs leading-normal text-purple-300">
                      <b>Data Deletion and Minimization:</b> User deletion requests require partner review and instruction. Use this workspace block to review requested deletions, then click "Approve Account Deletion" to execute a full wipe of all associated verification template identifiers.
                    </p>
                  </div>

                  <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                    {removalRequests.length === 0 ? (
                      <div className="p-12 text-center text-[#78819a] text-xs font-mono">
                        No user removal or data deletion requests queued.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0d0e12] text-[#78819a] font-mono uppercase text-[9px] tracking-wider border-b border-[#1b1e28]">
                          <tr>
                            <th className="py-4 px-6">Removal Request ID</th>
                            <th className="py-4 px-4">Subject identity</th>
                            <th className="py-4 px-4">Clearance Reason / Justification</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-6 text-right">Administrative Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b1e28] text-slate-300">
                          {removalRequests.map(r => (
                            <tr key={r.id}>
                              <td className="py-4 px-6 font-mono text-zinc-400">{r.id}</td>
                              <td className="py-4 px-4 font-mono text-white font-bold">{r.external_user_id}</td>
                              <td className="py-4 px-4 text-[#78819a] max-w-sm text-xs leading-normal">{r.reason}</td>
                              <td className="py-4 px-4 font-mono">
                                <span className={`inline-block text-[9px] font-bold uppercase rounded px-2.5 py-0.5 border ${
                                  r.status === 'approved' ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' : 'bg-yellow-950/40 border-yellow-900/50 text-yellow-500'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {r.status === 'pending' ? (
                                  <button
                                    onClick={() => handleApproveRemoval(r.id)}
                                    className="bg-red-600 hover:bg-red-500 text-white font-semibold text-[10px] font-mono uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
                                  >
                                    Approve Deletion
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-mono text-[#5d6780]">Deleted on {new Date(r.approved_at).toLocaleDateString()}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== AUDIT LOGS TAB ==================== */}
              {activeTab === 'audit-logs' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Immutable Operational Audit logs trail</h2>
                      <p className="text-xs text-slate-400">Strict chronological accounting files detailing organizational configurations updates and webhook deliveries.</p>
                    </div>

                    <input 
                      type="text"
                      placeholder="Search audit trail..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 font-mono w-48"
                    />
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[9px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-6">Timestamp UTC</th>
                          <th className="py-3 px-4">Action Event Tag</th>
                          <th className="py-3 px-4 text-center">Actor System</th>
                          <th className="py-3 px-4">Target Resource</th>
                          <th className="py-3 px-6 text-right">Discovered Payload Attributes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11px]">
                        {filteredAuditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-950/20">
                            <td className="py-3.5 px-6 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-emerald-400 font-semibold">{log.action}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-white font-bold inline-block uppercase text-[9px]">
                                {log.actor_type}: {log.actor_id.substring(0, 10)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-blue-400">{log.target_type}: {log.target_id}</td>
                            <td className="py-3.5 px-6 text-right text-[10px] text-slate-400 max-w-xs truncate">
                              {JSON.stringify(log.metadata)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== SETTINGS TAB ==================== */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Workspace & Corporate Organization Settings</h2>
                    <p className="text-xs text-slate-400 font-mono">Manage credential tokens ownership, whsec rotations, and corporate labels metadata.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 max-w-xl font-mono text-xs text-slate-300">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wide">Corporate metadata indices</span>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span>Organization ID:</span>
                      <span className="text-white font-bold">{activeOrg.id || "org_enterprise_999"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span>Integration Blueprint ID:</span>
                      <span className="text-white font-bold">{activeProject.id || "proj_security_777"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span>Active Enforcement mechanism:</span>
                      <span className="text-emerald-400 font-bold">{activeProject.enforcement_mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cryptographic Whsec Secret:</span>
                      <span className="text-white font-bold truncate max-w-[200px]">{activeProject.webhook_secret}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 max-w-xl font-mono text-xs text-slate-300">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wide">Database Connectivity & Schema Integrity</span>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span>Connection Status:</span>
                      {partnerConfig?.supabase_connected ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Secure Cloud DB (Postgres)
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Simulated Local Sandbox (In-Memory Fallback)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-normal">
                      {partnerConfig?.supabase_connected ? (
                        "Your cloud database is connected and active. Row level security policies and tables are synchronized in real-time."
                      ) : (
                        "The platform is operating in secure local memory fallback. To synchronize data persistently in a remote database, verify your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables, and execute the SQL declarations found in supabase_schema.sql in your Supabase SQL Editor."
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== API DOCS TAB ==================== */}
              {activeTab === 'documentation' && (
                <div className="space-y-8 animate-fadeIn text-slate-300 max-w-4xl">
                  
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Integration Portal REST API & Webhooks Reference</h2>
                    <p className="text-xs text-slate-400">Authentic technical documentation covering our sandbox and product core specs.</p>
                  </div>

                  {/* Flow Diagram */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Integration Workflow Architecture</h3>
                    <div className="bg-slate-950 p-4 rounded border border-slate-850 font-mono text-[11px] text-blue-400 leading-normal whitespace-pre">
{`User Signup/Login Request on Platform
        │
        ▼  (Platform Backend checks risk profile)
Platform Server  ───►  [POST] /api/v1/verify-session  (Returns Recommended Action)
        │
┌───────┴────────────────────────────────┐
│ Recommended Action: ALLOW              │ Recommended Action: REQUIRE_REVERIFICATION
▼                                        ▼
Verify Success (Mint Proof Certificate)  Force Redirect browser to:
                                         /verify/session/[id]  (Facial check)
                                                 │
                                                 ▼
                                         Webhook fired: aan.verification.completed
                                                 │
                                                 ▼
                                         Platform calls: [POST] /api/v1/verify-proof-token`}
                    </div>
                  </div>

                  {/* Endpoint 1 description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-blue-600 text-white font-mono font-bold text-[10px] px-2 py-1 rounded">POST</span>
                      <code className="text-sm font-bold text-white font-mono">/api/v1/verify-session</code>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Main integration pipeline endpoint. Triggered by platform servers on user login state initialization to verify risk anomalies without exposing private credentials or signatures.
                    </p>
                    
                    <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                      <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28] font-mono text-[10px] text-[#5d6780]">
                        REQUEST PAYLOAD HEADERS / BODY JSON
                      </div>
                      <pre className="p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`curl -X POST https://api.aan.trust/api/v1/verify-session \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: poh_key_sandbox_secret" \\
     -d '{
       "partner_user_id": "user_example_99",
       "email_hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
       "phone_hash": "f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9",
       "device_fingerprint": "optional_fingerprint_id",
       "timestamp": "${new Date().toISOString()}"
     }'`}
                      </pre>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                      <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28] font-mono text-[10px] text-[#5d6780]">
                        RESPONSE SCHEMAS (JSON VERDICT)
                      </div>
                      <pre className="p-4 font-mono text-[11px] text-blue-300 overflow-x-auto">
{`{
  "verification_status": "passed",
  "uniqueness_status": "unique",
  "risk_level": "low",
  "risk_score": 12,
  "proof_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRp...",
  "recommended_action": "allow",
  "session_id": "vss_a9b1c2d3e4f5",
  "expires_at": "${new Date(Date.now() + 15 * 60 * 1000).toISOString()}"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Endpoint 2 description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-blue-600 text-white font-mono font-bold text-[10px] px-2 py-1 rounded">POST</span>
                      <code className="text-sm font-bold text-white font-mono">/api/v1/verify-proof-token</code>
                    </div>
                    <p className="text-xs text-[#78819a] leading-relaxed">
                      Platform backend signature verification query. Confirms that a secure authentication claims token was issued by AAN global systems.
                    </p>

                    <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                      <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28] font-mono text-[10px] text-[#5d6780]">
                        REQUEST RAW SECRET SEGMENT
                      </div>
                      <pre className="p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`curl -X POST https://api.aan.trust/api/v1/verify-proof-token \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: poh_key_sandbox_secret" \\
     -d '{
       "proof_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }'`}
                      </pre>
                    </div>

                    <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden">
                      <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28] font-mono text-[10px] text-[#5d6780]">
                        VERIFIED DECODED CLAIMS RESPONSE MATCH
                      </div>
                      <pre className="p-4 font-mono text-[11px] text-blue-300 overflow-x-auto">
{`{
  "valid": true,
  "claims": {
    "organization_id": "org_enterprise_999",
    "project_id": "proj_security_777",
    "partner_user_id": "user_example_99",
    "session_id": "vss_a9b1c2d3e4f5",
    "verification_status": "passed",
    "uniqueness_status": "unique",
    "risk_level": "low",
    "issued_at": "${new Date().toISOString()}",
    "expires_at": "${new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()}"
  }
}`}
                      </pre>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'developers' && devSubTab === 'setup' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setDevSubTab('setup')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'setup' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      01. Integration Wizard
                    </button>
                    <button
                      onClick={() => setDevSubTab('playground')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'playground' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      02. Developer Portal
                    </button>
                    <button
                      onClick={() => setDevSubTab('sandbox')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'sandbox' ? 'border-[#f43f5e] text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      03. Sandbox Stage controls
                    </button>
                  </div>
                  <IntegrationWizardTab 
                    onNavigateToAcademy={(lessonId) => onNavigate('academy', undefined, lessonId)}
                    onRefreshDashboard={fetchDashboardData}
                  />
                </div>
              )}

              {activeTab === 'developers' && devSubTab === 'playground' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setDevSubTab('setup')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'setup' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      01. Integration Wizard
                    </button>
                    <button
                      onClick={() => setDevSubTab('playground')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'playground' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      02. Developer Portal
                    </button>
                    <button
                      onClick={() => setDevSubTab('sandbox')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'sandbox' ? 'border-[#f43f5e] text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      03. Sandbox Stage controls
                    </button>
                  </div>
                  <DeveloperPortalTab 
                    onNavigateToAcademy={(lessonId) => onNavigate('academy', undefined, lessonId)}
                  />
                </div>
              )}

              {activeTab === 'developers' && devSubTab === 'sandbox' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setDevSubTab('setup')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'setup' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      01. Integration Wizard
                    </button>
                    <button
                      onClick={() => setDevSubTab('playground')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'playground' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      02. Developer Portal
                    </button>
                    <button
                      onClick={() => setDevSubTab('sandbox')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${devSubTab === 'sandbox' ? 'border-[#f43f5e] text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      03. Sandbox Stage controls
                    </button>
                  </div>
                  <SandboxTab 
                    onAddAuditLog={(action, entity, status, detail) => {
                      const newLog = {
                        id: "aud_sb_" + Math.random().toString(36).substring(2, 7),
                        actor: "SAN_PLAYGROUND",
                        action,
                        entity,
                        status,
                        detail,
                        timestamp: new Date().toISOString()
                      };
                      setAuditLogs(prev => [newLog, ...prev]);
                    }}
                  />
                </div>
              )}

              {activeTab === 'trust-analytics' && trustSubTab === 'health' && (
                <div className="space-y-6">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setTrustSubTab('health')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${trustSubTab === 'health' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Telemetry Health
                    </button>
                    <button
                      onClick={() => setTrustSubTab('badge')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${trustSubTab === 'badge' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Compliance Badge
                    </button>
                  </div>
                  <HealthMonitorTab 
                    onNavigateToAcademy={(lessonId) => onNavigate('academy', undefined, lessonId)}
                  />
                </div>
              )}

              {activeTab === 'trust-analytics' && trustSubTab === 'badge' && (
                <div className="space-y-6">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setTrustSubTab('health')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${trustSubTab === 'health' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Telemetry Health
                    </button>
                    <button
                      onClick={() => setTrustSubTab('badge')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${trustSubTab === 'badge' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Compliance Badge
                    </button>
                  </div>
                  <CertificationTab 
                    onNavigateToAcademy={(lessonId) => onNavigate('academy', undefined, lessonId)}
                  />
                </div>
              )}

              {activeTab === 'organizations' && orgSubTab === 'profiles' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex border-b border-slate-800 gap-1.5 mb-6 font-mono text-[11px]">
                    <button
                      onClick={() => setOrgSubTab('settings')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'settings' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Project Settings
                    </button>
                    <button
                      onClick={() => setOrgSubTab('policies')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'policies' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      MFA Login Policies
                    </button>
                    <button
                      onClick={() => setOrgSubTab('profiles')}
                      className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${orgSubTab === 'profiles' ? 'border-blue-500 text-white font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                      Verification Profiles
                    </button>
                  </div>
                  <VerificationProfilesTab 
                    partnerApps={partnerApps}
                    onNavigateToAcademy={(lessonId) => onNavigate('academy', undefined, lessonId)}
                    onAddAuditLog={async (action, targetType, targetId, metadata) => {
                      try {
                        await fetch('/api/internal/audit-logs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action, target_type: targetType, target_id: targetId, metadata })
                        });
                        fetchDashboardData();
                      } catch (e) {
                        console.error("Failed to append audit log on backend", e);
                      }
                    }}
                  />
                </div>
              )}

            </>
          )}

        </main>

      </div>

      {/* Interactive API Explorer playground panel */}
      <section className="bg-slate-900 border-t border-slate-850 p-6 z-10 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          
          <div className="lg:w-1/2 space-y-4">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase font-mono tracking-tight">
              <Terminal className="text-blue-400 w-4.5 h-4.5" />
              API Explorer
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Test server-side queries statefully in real time. Choose your parameters and dispatch payloads to verify immediate risk scores and validate trust tokens.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setPlaygroundMethod('verify_session'); setPlaygroundResponse(null); }}
                className={`py-2 px-3 text-[11px] font-mono font-bold rounded cursor-pointer transition-all ${playgroundMethod === 'verify_session' ? 'bg-blue-600 text-white' : 'bg-slate-950 hover:bg-slate-800 text-slate-400'}`}
              >
                POST /api/v1/verify-session
              </button>
              <button 
                onClick={() => { setPlaygroundMethod('verify_proof'); setPlaygroundResponse(null); }}
                className={`py-2 px-3 text-[11px] font-mono font-bold rounded cursor-pointer transition-all ${playgroundMethod === 'verify_proof' ? 'bg-blue-600 text-white' : 'bg-slate-950 hover:bg-slate-800 text-slate-400'}`}
              >
                POST /api/v1/verify-proof-token
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-850 pt-3">
              {playgroundMethod === 'verify_session' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">Partner User ID</label>
                      <input 
                        type="text"
                        value={playgroundExtUserId}
                        onChange={(e) => setPlaygroundExtUserId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">Email (Trigger Duplicate)</label>
                      <input 
                        type="text"
                        value={playgroundEmailHash}
                        onChange={(e) => setPlaygroundEmailHash(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none font-mono"
                        placeholder="Insert 'duplicate' to test"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">Device Fingerprint hash</label>
                      <input 
                        type="text"
                        value={playgroundDeviceFingerprint}
                        onChange={(e) => setPlaygroundDeviceFingerprint(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none font-mono"
                        placeholder="e.g. fingerprint_hash_9a62"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">API access authorization token</label>
                      <input 
                        type="text"
                        value={playgroundApiKey}
                        onChange={(e) => setPlaygroundApiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 font-bold">Cryptographically signed Proof Token</label>
                  <textarea
                    rows={2}
                    value={playgroundProofToken}
                    onChange={(e) => setPlaygroundProofToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none font-mono resize-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={executePlaygroundRequest}
              disabled={playgroundLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {playgroundLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Dispatch Secure REST API Request
            </button>
          </div>

          <div className="lg:w-1/2 w-full font-mono text-xs">
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 min-h-[160px] flex flex-col justify-between shadow-inner">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    SECURE_GATEWAY_OUT.JSON
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">HTTP STATUS: 200 OK</span>
                </div>

                {playgroundLoading ? (
                  <div className="text-slate-400 text-center py-6">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-1" />
                    Awaiting authorization signature verification...
                  </div>
                ) : playgroundResponse ? (
                  <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-40 leading-tight select-all">
                    {JSON.stringify(playgroundResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-400 py-8 text-center italic text-[11px] leading-tight">
                    Submit a stateful query parameter form to preview structured AAN server JSON responses.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-900 pt-2 text-[9px] text-slate-500 flex items-center justify-between">
                <span>COMPONENT: AAN_PARTNER_API_ROUTER</span>
                <span>TRUSTED SECURED TUNNEL CONNECTION</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
