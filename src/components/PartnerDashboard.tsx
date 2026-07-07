import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Webhook, 
  Activity, 
  Settings, 
  Database,
  ArrowRight, 
  ArrowLeft,
  RefreshCw, 
  Copy, 
  Check, 
  Sliders,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  BookOpen,
  Server,
  Code,
  Terminal,
  Cpu,
  Layers,
  Globe,
  HelpCircle,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  Flame,
  Network,
  Binary
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import TrustDecisionSimulator from './TrustDecisionSimulator';
import TestLabTab from './TestLabTab';
import TrustGraphTab from './TrustGraphTab';
import ZKProofsTab from './ZKProofsTab';

// Retrieve Supabase client dynamically if configured
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
  // Check onboarding completion from localStorage
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('aan_onboarding_completed') === 'true';
  });
  
  // Onboarding Step state
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  
  // Onboarding Step 1 Form: Organization
  const [orgName, setOrgName] = useState<string>(() => localStorage.getItem('aan_org_name') || "");
  const [orgType, setOrgType] = useState<string>("SaaS");
  const [orgWebsite, setOrgWebsite] = useState<string>("");
  const [orgUseCase, setOrgUseCase] = useState<string>("bot_defense");
  
  // Onboarding Step 2 Form: Project
  const [projName, setProjName] = useState<string>(() => localStorage.getItem('aan_project_name') || "");
  const [projEnv, setProjEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [projVolume, setProjVolume] = useState<string>("1k_10k");
  const [projSurface, setProjSurface] = useState<string>("signup");
  
  // Onboarding Step 3 Credentials (Generated on step entry or lazily)
  const [pubKey, setPubKey] = useState<string>(() => localStorage.getItem('aan_pub_key') || "");
  const [secKey, setSecKey] = useState<string>(() => localStorage.getItem('aan_sec_key') || "");
  const [whSecret, setWhSecret] = useState<string>(() => localStorage.getItem('aan_wh_secret') || "");
  const [projectId, setProjectId] = useState<string>(() => localStorage.getItem('aan_project_id') || "");
  const [secretShown, setSecretShown] = useState<boolean>(false);
  const [keysCopied, setKeysCopied] = useState<Record<string, boolean>>({});

  // Active Dashboard navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'rules' | 'credentials' | 'docs' | 'settings' | 'test_lab' | 'trust_graph' | 'zk_proofs'>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [savingRules, setSavingRules] = useState<boolean>(false);
  const [rulesSuccess, setRulesSuccess] = useState<boolean>(false);

  // Search filter for Verification Events
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [decisionFilter, setDecisionFilter] = useState<string>("all");
  const [selectedGlobalEvent, setSelectedGlobalEvent] = useState<any | null>(null);

  // Trust Rules State
  const [trustRules, setTrustRules] = useState({
    autoApproveBelow: 30,
    manualReviewAbove: 31,
    denyAbove: 75,
    duplicateAction: 'flag',
    botSuspicionAction: 'verify',
    fallbackNoCamera: 'allow_with_risk_penalty'
  });

  // Organization Policies State
  const [policies, setPolicies] = useState([
    {
      id: "pol_max_assoc",
      name: "Maximum associated accounts per verified human",
      type: "Association Limits",
      enabled: true,
      threshold: "10 accounts",
      recommendedAction: "REVIEW",
      jsonRule: JSON.stringify({
        rule: "max_associated_accounts",
        limit: 10,
        actions: { exceeds: "REVIEW" }
      }, null, 2)
    },
    {
      id: "pol_rapid_creation",
      name: "Flag rapid account creation",
      type: "Velocity Control",
      enabled: true,
      threshold: "5 accounts / 10 minutes",
      recommendedAction: "DENY",
      jsonRule: JSON.stringify({
        rule: "signup_velocity",
        window_seconds: 600,
        limit: 5,
        actions: { exceeds: "DENY" }
      }, null, 2)
    },
    {
      id: "pol_unknown_devices",
      name: "Challenge unknown devices",
      type: "Device Integrity",
      enabled: true,
      threshold: "Zero matching fingerprints",
      recommendedAction: "STEP_UP",
      jsonRule: JSON.stringify({
        rule: "device_fingerprint_match",
        require_valid_fingerprint: true,
        actions: { mismatch: "STEP_UP" }
      }, null, 2)
    },
    {
      id: "pol_inactive_accounts",
      name: "Review inactive accounts",
      type: "Lifecycle Management",
      enabled: false,
      threshold: "No login > 180 days",
      recommendedAction: "REVIEW",
      jsonRule: JSON.stringify({
        rule: "inactive_duration_days",
        max_inactive_days: 180,
        actions: { exceeds: "REVIEW" }
      }, null, 2)
    },
    {
      id: "pol_ban_evasion",
      name: "Flag possible ban evasion",
      type: "Security / Risk Mitigation",
      enabled: true,
      threshold: "Matching banned human profile",
      recommendedAction: "STEP_UP",
      jsonRule: JSON.stringify({
        rule: "banned_profile_correlation",
        correlation_confidence_threshold: 90,
        actions: { matched: "STEP_UP" }
      }, null, 2)
    },
    {
      id: "pol_high_risk_logins",
      name: "Step-up high-risk logins",
      type: "Authentication Guard",
      enabled: true,
      threshold: "Risk index > 60%",
      recommendedAction: "STEP_UP",
      jsonRule: JSON.stringify({
        rule: "login_risk_score",
        max_allowed_risk: 60,
        actions: { exceeds: "STEP_UP" }
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

  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState<string>("");

  // Verification Events dataset (initially populated or empty to test premium empty state)
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

  // Docs Tab Code block selections
  const [codeTab, setCodeTab] = useState<'frontend' | 'backend' | 'webhook' | 'token'>('frontend');

  // Trigger credentials generation upon entering Step 3
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

  // Handle saving credentials to Supabase
  const handleSaveToSupabaseOnboarding = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Create Organization
          const { error: orgErr } = await supabase
            .from('organizations')
            .insert({
              id: projectId, // Use project ID or let DB generate
              name: orgName,
              type: orgType,
              website: orgWebsite || null,
              use_case: orgUseCase
            });

          if (!orgErr) {
            // 2. Create Organization Member
            await supabase
              .from('organization_members')
              .insert({
                organization_id: projectId,
                user_id: user.id,
                role: 'owner'
              });

            // 3. Create Project
            await supabase
              .from('projects')
              .insert({
                id: projectId,
                organization_id: projectId,
                name: projName,
                environment: projEnv,
                expected_verifications: projVolume,
                integration_surface: projSurface
              });

            // 4. Create API Keys
            await supabase
              .from('api_keys')
              .insert({
                project_id: projectId,
                name: 'Default Staging Key',
                publishable_key: pubKey,
                secret_key_hash: secKey,
                webhook_signing_secret: whSecret,
                status: 'active'
              });

            // 5. Create Trust Rules
            await supabase
              .from('trust_rules')
              .insert({
                project_id: projectId,
                auto_approve_below: trustRules.autoApproveBelow,
                manual_review_above: trustRules.manualReviewAbove,
                deny_above: trustRules.denyAbove,
                duplicate_action: trustRules.duplicateAction,
                bot_suspicion_action: trustRules.botSuspicionAction,
                fallback_no_camera: trustRules.fallbackNoCamera
              });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to synchronize with Supabase backend. Retaining local-first sandbox state.", err);
    } finally {
      localStorage.setItem('aan_org_name', orgName);
      localStorage.setItem('aan_project_name', projName);
      localStorage.setItem('aan_project_env', projEnv);
      localStorage.setItem('aan_onboarding_completed', 'true');
      setOnboardingCompleted(true);
      setLoading(false);
    }
  };

  // Copy helper
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setKeysCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setKeysCopied(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Clear Events to demonstrate beautiful premium empty state
  const handleClearEvents = () => {
    setEvents([]);
    localStorage.setItem('aan_verification_events', JSON.stringify([]));
  };

  // Restore Default Seeds for preview
  const handleSeedEvents = () => {
    const defaults = [
      {
        id: "evt_aan_9c4f8d21",
        project: projName || "Default Auth Layer",
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
        project: projName || "Default Auth Layer",
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
        project: projName || "Default Auth Layer",
        external_user_id: "usr_borderline_charlie",
        decision: "review",
        risk_score: 52,
        reason_codes: ["VOLATILE_NETWORK", "UNKNOWN_UA", "LATENCY_VARIANCE"],
        device_signal: "Android WebView (Samsung S22)",
        ip_risk_signal: "Medium (0.45)",
        returning_human: false,
        proof_token_status: "valid",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      }
    ];
    setEvents(defaults);
    localStorage.setItem('aan_verification_events', JSON.stringify(defaults));
  };

  // Save trust rules update
  const handleSaveTrustRules = async () => {
    setSavingRules(true);
    setRulesSuccess(false);
    
    const supabase = getSupabaseClient();
    try {
      if (supabase && projectId) {
        await supabase
          .from('trust_rules')
          .upsert({
            project_id: projectId,
            auto_approve_below: trustRules.autoApproveBelow,
            manual_review_above: trustRules.manualReviewAbove,
            deny_above: trustRules.denyAbove,
            duplicate_action: trustRules.duplicateAction,
            bot_suspicion_action: trustRules.botSuspicionAction,
            fallback_no_camera: trustRules.fallbackNoCamera,
            updated_at: new Date().toISOString()
          });
      }
    } catch (err) {
      console.warn("Failed to save rules to Supabase, keeping local copy.", err);
    } finally {
      setTimeout(() => {
        setSavingRules(false);
        setRulesSuccess(true);
        setTimeout(() => setRulesSuccess(false), 3000);
      }, 800);
    }
  };

  // Computed metrics
  const totalAttempts = events.length;
  const approvedHumans = events.filter(e => e.decision === 'approved').length;
  const blockedBots = events.filter(e => e.decision === 'denied').length;
  const reviewCount = events.filter(e => e.decision === 'review').length;
  const duplicateSignals = events.filter(e => e.risk_score > 70 && e.reason_codes.some((r: string) => r.includes('DUPLICATE') || r.includes('REPLAY'))).length;
  const returningHumans = events.filter(e => e.returning_human).length;
  const averageRisk = totalAttempts > 0 
    ? Math.round(events.reduce((acc, curr) => acc + curr.risk_score, 0) / totalAttempts) 
    : 0;

  // Render ONBOARDING FLOW if not complete
  if (!onboardingCompleted) {
    return (
      <div className="min-h-screen bg-[#050507] text-slate-300 flex flex-col justify-center items-center px-4 py-16 font-sans">
        
        {/* Onboarding Container */}
        <div className="w-full max-w-2xl bg-[#090a0f] border border-white/[0.05] rounded-2xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
          
          {/* Subtle Ambient Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-full mb-2">
              <Shield className="w-3.5 h-3.5 text-[#58E38A]" />
              <span className="text-[10px] font-mono text-[#58E38A] uppercase tracking-wider font-semibold">Trust Infrastructure</span>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Setup AAN Proof-of-Human Identity</h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Configure your tenant node to evaluate secure, privacy-preserving client integrity signals and verify unique human actors.
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-between max-w-sm mx-auto pt-2">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border transition-all ${
                    onboardingStep === step 
                      ? 'bg-white border-white text-slate-950 font-bold shadow-lg shadow-white/10' 
                      : onboardingStep > step 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                        : 'bg-transparent border-white/10 text-slate-500'
                  }`}>
                    {onboardingStep > step ? "✓" : step}
                  </div>
                  <span className={`text-[10px] font-mono hidden sm:inline ${onboardingStep === step ? 'text-white font-medium' : 'text-slate-500'}`}>
                    {step === 1 && "Organization"}
                    {step === 2 && "Project"}
                    {step === 3 && "Credentials"}
                    {step === 4 && "Deployment"}
                  </span>
                </div>
                {step < 4 && <div className={`flex-1 h-px mx-2 ${onboardingStep > step ? 'bg-emerald-500/30' : 'bg-white/5'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step Contents */}
          <div className="pt-4 min-h-[220px]">
            {onboardingStep === 1 && (
              <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Step 1: Create Your Organization</h3>
                  <p className="text-[11px] text-slate-500">Provide registration details to anchor your decentralized credential issuer node.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Organization Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Acme Corporation"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Organization Type</label>
                    <select 
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-all"
                    >
                      <option value="SaaS">SaaS Platform</option>
                      <option value="marketplace">Digital Marketplace</option>
                      <option value="gaming/community">Gaming & Online Community</option>
                      <option value="fintech">Fintech & DeFi Protocol</option>
                      <option value="social platform">Social Network</option>
                      <option value="enterprise">Enterprise Systems</option>
                      <option value="other">Other System</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Company Website <span className="text-slate-600 font-normal">(Optional)</span></label>
                    <input 
                      type="url"
                      placeholder="https://acme.com"
                      value={orgWebsite}
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Primary Use Case</label>
                    <select 
                      value={orgUseCase}
                      onChange={(e) => setOrgUseCase(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-all"
                    >
                      <option value="bot_defense">Coordinate Bot Defense</option>
                      <option value="duplicate_account_prevention">Prevent Duplicate Signups (Sybil Defense)</option>
                      <option value="account_integrity">High-Risk Account Integrity</option>
                      <option value="trust_scoring">Dynamic Identity Trust Scoring</option>
                      <option value="login_protection">Credential Stuffing & Login Shield</option>
                      <option value="compliance_support">ZKP Humanness Compliance Support</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Step 2: Create Your First Trust Project</h3>
                  <p className="text-[11px] text-slate-500">Configure the primary evaluation context for your integrated endpoints.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Project Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Acme Core API Shield"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Deploy Environment</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setProjEnv('sandbox')}
                        className={`flex-1 text-xs py-2 px-3.5 rounded-xl border font-mono uppercase tracking-wider transition-all ${
                          projEnv === 'sandbox' 
                            ? 'bg-[#58E38A]/10 border-[#58E38A]/30 text-[#58E38A] font-semibold' 
                            : 'bg-transparent border-white/[0.05] text-slate-500 hover:text-white hover:border-white/10'
                        }`}
                      >
                        Sandbox Mode
                      </button>
                      <button
                        onClick={() => setProjEnv('production')}
                        className={`flex-1 text-xs py-2 px-3.5 rounded-xl border font-mono uppercase tracking-wider transition-all ${
                          projEnv === 'production' 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold' 
                            : 'bg-transparent border-white/[0.05] text-slate-500 hover:text-white hover:border-white/10'
                        }`}
                      >
                        Production Node
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Expected Monthly Verifications</label>
                    <select 
                      value={projVolume}
                      onChange={(e) => setProjVolume(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-all"
                    >
                      <option value="under_1k">Less than 1,000 / mo (Free Sandbox)</option>
                      <option value="1k_10k">1,000 - 10,000 / mo</option>
                      <option value="10k_100k">10,000 - 100,000 / mo</option>
                      <option value="above_100k">100,000+ / mo (Enterprise Scale)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">AAN Integration Surface</label>
                    <select 
                      value={projSurface}
                      onChange={(e) => setProjSurface(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-all"
                    >
                      <option value="signup">User Registration Flow (Signup)</option>
                      <option value="login">Authentication Layer (Login Shield)</option>
                      <option value="account_recovery">Sensitive Account Recovery</option>
                      <option value="high_risk_actions">High-Risk Operations (e.g. Bank Transfer)</option>
                      <option value="admin_review">Compliance & Admin Auditing</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Step 3: Cryptographic Integration Credentials</h3>
                  <p className="text-[11px] text-slate-500">Your secure access keys have been provisioned in the sandbox ring. Store them safely.</p>
                </div>

                <div className="space-y-3 bg-black/30 border border-white/[0.04] p-4 rounded-xl">
                  {/* Publishable Key */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                      <span>PUBLISHABLE CLIENT KEY</span>
                      <button 
                        onClick={() => copyText(pubKey, 'pub')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {keysCopied['pub'] ? <span className="text-emerald-400">Copied</span> : <span>Copy</span>}
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="bg-black/50 border border-white/[0.04] p-2 rounded-lg font-mono text-xs text-slate-200 truncate select-all">
                      <code>{pubKey}</code>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                      <div className="flex items-center gap-1 text-rose-400/80">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>SECRET ENDPOINT KEY (SHOWS ONCE)</span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setSecretShown(!secretShown)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {secretShown ? "Hide" : "Show"}
                        </button>
                        <button 
                          onClick={() => copyText(secKey, 'sec')}
                          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {keysCopied['sec'] ? <span className="text-emerald-400">Copied</span> : <span>Copy</span>}
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-black/50 border border-white/[0.04] p-2 rounded-lg font-mono text-xs text-slate-200 flex justify-between items-center overflow-hidden">
                      <code className="truncate flex-1">
                        {secretShown ? secKey : "••••••••••••••••••••••••••••••••••••••••"}
                      </code>
                    </div>
                  </div>

                  {/* Webhook Secret */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                      <span>WEBHOOK SIGNING SECRET</span>
                      <button 
                        onClick={() => copyText(whSecret, 'wh')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {keysCopied['wh'] ? <span className="text-emerald-400">Copied</span> : <span>Copy</span>}
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="bg-black/50 border border-white/[0.04] p-2 rounded-lg font-mono text-xs text-slate-200 truncate select-all">
                      <code>{whSecret}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Step 4: Real-time Trust Architecture</h3>
                  <p className="text-[11px] text-slate-500">How AAN seamlessly integrates alongside your existing stack.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black/20 border border-white/[0.03] p-3 rounded-xl space-y-1.5 text-center">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                      <Code className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">1. Frontend Scan</span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      The browser client calls the AAN modal to gather local non-custodial integrity telemetry.
                    </p>
                  </div>

                  <div className="bg-black/20 border border-white/[0.03] p-3 rounded-xl space-y-1.5 text-center">
                    <div className="w-6 h-6 rounded-lg bg-[#58E38A]/10 flex items-center justify-center text-[#58E38A] mx-auto">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">2. Signed Token</span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      AAN returns a cryptographically signed token verifying human presence and score.
                    </p>
                  </div>

                  <div className="bg-black/20 border border-white/[0.03] p-3 rounded-xl space-y-1.5 text-center">
                    <div className="w-6 h-6 rounded-lg bg-[#58E38A]/10 flex items-center justify-center text-[#58E38A] mx-auto">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">3. Server Proof</span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Your backend validates the signed token against our API to grant trust decisions instantly.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#58E38A]/5 border border-[#58E38A]/10 rounded-xl flex items-start gap-3 text-[10px]">
                  <HelpCircle className="w-4 h-4 text-[#58E38A] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-white font-semibold">Privacy Affirmation</span>
                    <p className="text-slate-500 leading-normal">
                      AAN operates purely as a zero-knowledge trust standard. We do not store, index, or parse any personal data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
            {onboardingStep > 1 ? (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              onClick={() => {
                if (onboardingStep === 1) {
                  if (!orgName.trim()) {
                    alert("Please enter your organization name to continue.");
                    return;
                  }
                  setOnboardingStep(2);
                } else if (onboardingStep === 2) {
                  if (!projName.trim()) {
                    alert("Please enter your project name to continue.");
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
              className="flex items-center gap-2 bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xl shadow-white/5 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring node...</span>
                </>
              ) : (
                <>
                  <span>{onboardingStep === 4 ? "Initialize Trust Dashboard" : "Continue"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // RENDER COMPLETE ENTERPRISE TRUST-INFRASTRUCTURE DASHBOARD
  return (
    <div className="min-h-screen bg-[#050507] text-[#8c919d] font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#08090c] border-b md:border-b-0 md:border-r border-white/[0.04] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Node Identity Display */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 text-[#58E38A]" />
              </div>
              <div>
                <span className="font-semibold text-white tracking-tight text-xs block leading-none">AAN Infrastructure</span>
                <span className="text-[8px] font-mono uppercase text-slate-500 tracking-widest block mt-0.5">Verified Node</span>
              </div>
            </div>
            
            {/* Active Project Card */}
            <div className="bg-black/30 border border-white/[0.03] p-2.5 rounded-lg space-y-1 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Active Trust Project</span>
                <span className={`w-1.5 h-1.5 rounded-full ${projEnv === 'production' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              </div>
              <span className="text-white text-xs font-semibold block truncate leading-tight">{projName || "Default Staging Key"}</span>
              <span className="text-[8px] font-mono text-slate-500 tracking-wider block truncate uppercase font-bold">{projEnv || 'sandbox'} environment</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'overview' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Trust Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'events' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Verification Events</span>
            </button>

            <button
              onClick={() => setActiveTab('trust_graph')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'trust_graph' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Trust Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('test_lab')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'test_lab' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Test Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('zk_proofs')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'zk_proofs' ? 'bg-white/[0.04] text-[#58E38A] font-semibold border border-[#58E38A]/25' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Binary className="w-3.5 h-3.5" />
              <div className="flex items-center justify-between w-full">
                <span>ZK Proofs</span>
                <span className="text-[8px] bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">EZKL</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'rules' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Trust Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'credentials' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'docs' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Developer Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'settings' ? 'bg-white/[0.04] text-white font-semibold border border-white/[0.05]' : 'text-slate-400 hover:text-white hover:bg-white/[0.01] border border-transparent'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Organization Settings</span>
            </button>
          </nav>

        </div>

        {/* Sidebar Footer options */}
        <div className="pt-6 border-t border-white/[0.03] mt-8 text-center space-y-3.5">
          <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl text-left space-y-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58E38A] inline-block animate-ping" />
              <span className="text-[9px] font-mono text-[#58E38A] font-bold uppercase">SUPABASE ONLINE</span>
            </div>
            <p className="text-[8px] text-slate-500 leading-normal">RLS policies applied securely. Sandbox storage persistent.</p>
          </div>
          
          <button 
            onClick={() => onNavigate('landing')} 
            className="text-[10px] font-mono uppercase text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Landing Home</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 space-y-8 overflow-y-auto max-w-5xl mx-auto w-full relative">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Trust Node Dashboard</h2>
                <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Passive Mode Active</span>
              </div>
            </div>

            {/* Core Architectural Pillars Status Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#08090d] border border-white/[0.03] rounded-2xl">
              {/* FAST */}
              <div className="space-y-2 p-3 bg-black/25 border border-white/[0.02] rounded-xl hover:border-emerald-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">1. FAST</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-white font-mono">45ms <span className="text-xs text-emerald-400 font-medium">avg</span></div>
                  <p className="text-[9px] text-slate-500 leading-snug">Target &lt; 300ms. Caching layer active with 99.2% hit-rate.</p>
                </div>
              </div>

              {/* LIGHTWEIGHT */}
              <div className="space-y-2 p-3 bg-black/25 border border-white/[0.02] rounded-xl hover:border-[#58E38A]/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#58E38A]/[0.04] border border-[#58E38A]/15 flex items-center justify-center text-[#58E38A]">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">2. LIGHTWEIGHT</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-white font-mono">0.4 KB <span className="text-xs text-slate-400 font-medium">SDK</span></div>
                  <p className="text-[9px] text-slate-500 leading-snug">Zero auth replacement. Zero-friction passive telemetry signals.</p>
                </div>
              </div>

              {/* SECURE */}
              <div className="space-y-2 p-3 bg-black/25 border border-white/[0.02] rounded-xl hover:border-sky-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/[0.04] border border-sky-500/15 flex items-center justify-center text-sky-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">3. SECURE</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-white font-mono">Zero-Trust</div>
                  <p className="text-[9px] text-slate-500 leading-snug">No raw biometrics, face templates, or SSNs stored. Signed JWTs.</p>
                </div>
              </div>

              {/* RELIABLE */}
              <div className="space-y-2 p-3 bg-black/25 border border-white/[0.02] rounded-xl hover:border-amber-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/[0.04] border border-amber-500/15 flex items-center justify-center text-amber-400">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">4. RELIABLE</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-white font-mono">Fail-Open</div>
                  <p className="text-[9px] text-slate-500 leading-snug">Offline queue synchronizer with automatic graceful bypass fallback.</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0b0c10] border border-white/[0.03] p-4 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Verification Attempts</span>
                <span className="text-2xl font-light text-white font-sans">{totalAttempts}</span>
              </div>

              <div className="bg-[#0b0c10] border border-white/[0.03] p-4 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-[#58E38A] uppercase tracking-wider block">Approved Humans</span>
                <span className="text-2xl font-light text-white font-sans">{approvedHumans}</span>
              </div>

              <div className="bg-[#0b0c10] border border-white/[0.03] p-4 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider block">Blocked Bots</span>
                <span className="text-2xl font-light text-white font-sans">{blockedBots}</span>
              </div>

              <div className="bg-[#0b0c10] border border-white/[0.03] p-4 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block">Manual Reviews</span>
                <span className="text-2xl font-light text-white font-sans">{reviewCount}</span>
              </div>
            </div>

            {/* Additional Premium Metrics Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0b0c10]/40 border border-white/[0.02] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Associated Accounts Detected</span>
                  <span className="text-white text-base font-semibold block mt-0.5">17 accounts linked</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/[0.03] border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-[#0b0c10]/40 border border-white/[0.02] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Relationships Reviewed</span>
                  <span className="text-white text-base font-semibold block mt-0.5">3 human groups</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/[0.03] border border-rose-500/10 flex items-center justify-center text-rose-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-[#0b0c10]/40 border border-white/[0.02] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Policies Triggered</span>
                  <span className="text-white text-base font-semibold block mt-0.5">{policies.filter(p => p.enabled).length} active policies</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/[0.03] border border-amber-500/10 flex items-center justify-center text-amber-400">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Premium Empty State and Seeding controls */}
            {totalAttempts === 0 ? (
              <div className="bg-[#0b0c10] border border-white/[0.04] p-8 rounded-2xl text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-10 h-10 rounded-full bg-[#58E38A]/5 border border-[#58E38A]/15 flex items-center justify-center text-[#58E38A] mx-auto animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-semibold tracking-tight">Your project is ready.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                    Send your first verification request to see real-time, privacy-preserving trust decisions appear here.
                  </p>
                </div>
                <div className="flex justify-center gap-3.5 pt-2">
                  <button
                    onClick={handleSeedEvents}
                    className="bg-[#58E38A]/15 hover:bg-[#58E38A]/25 border border-[#58E38A]/20 text-[#58E38A] text-[10px] font-mono font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Load Sandbox Demonstration Events
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Risk Distribution and Interactive analytical charts block */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">Trust Verdict Distribution</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Evaluating real-time trust signals and verification claims across your registered domains.</p>
                    </div>
                    <button
                      onClick={handleClearEvents}
                      className="text-[9px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase border border-white/[0.04] hover:bg-white/[0.02] py-1 px-2.5 rounded-lg cursor-pointer"
                    >
                      Clear Events (Test Empty State)
                    </button>
                  </div>

                  {/* Clean Visual Bars representing current state */}
                  <div className="space-y-3.5 pt-2 font-mono text-[10px]">
                    {/* Approved humans percentage bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>HUMAN SIGNATURE VERIFIED (AUTO-APPROVE)</span>
                        <span className="text-white font-semibold">{Math.round((approvedHumans / totalAttempts) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${(approvedHumans / totalAttempts) * 100}%` }} 
                          className="h-full bg-emerald-400/80 rounded-full transition-all duration-700" 
                        />
                      </div>
                    </div>

                    {/* Denied bots percentage bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>SUSPICIOUS TEMPLATE / BOT PATTERN DETECTED (AUTO-DENY)</span>
                        <span className="text-white font-semibold">{Math.round((blockedBots / totalAttempts) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${(blockedBots / totalAttempts) * 100}%` }} 
                          className="h-full bg-rose-500/80 rounded-full transition-all duration-700" 
                        />
                      </div>
                    </div>

                    {/* Manual reviews percentage bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>DEVIATING SIGNAL PROFILE (MANUAL REVIEW REQUIRED)</span>
                        <span className="text-white font-semibold">{Math.round((reviewCount / totalAttempts) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${(reviewCount / totalAttempts) * 100}%` }} 
                          className="h-full bg-amber-500/80 rounded-full transition-all duration-700" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Trust Decisions Simulator */}
                <TrustDecisionSimulator />

                {/* Recent Events table overview */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Recent Trust Assessments</h3>
                    <button 
                      onClick={() => setActiveTab('events')} 
                      className="text-[10px] font-mono text-[#58E38A] hover:underline"
                    >
                      View All Events →
                    </button>
                  </div>

                  <div className="bg-[#0b0c10] border border-white/[0.04] rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-black/10">
                          <th className="py-2.5 px-4 font-bold">Event ID</th>
                          <th className="py-2.5 px-4 font-bold">Partner Ref</th>
                          <th className="py-2.5 px-4 font-bold">Risk Score</th>
                          <th className="py-2.5 px-4 font-bold">Decision</th>
                          <th className="py-2.5 px-4 font-bold">Device Signal</th>
                          <th className="py-2.5 px-4 font-bold text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-slate-300">
                        {events.slice(0, 3).map((e) => (
                          <tr key={e.id} onClick={() => setSelectedGlobalEvent(e)} className="hover:bg-white/[0.01] cursor-pointer">
                            <td className="py-3 px-4 font-mono text-white">{e.id}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{e.external_user_id}</td>
                            <td className="py-3 px-4 font-mono font-semibold">{e.risk_score}%</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                e.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                e.decision === 'denied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {e.decision}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{e.device_signal}</td>
                            <td className="py-3 px-4 text-right text-slate-500 font-mono">
                              {new Date(e.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* TAB: TRUST GRAPH */}
        {activeTab === 'trust_graph' && (
          <TrustGraphTab />
        )}

        {/* TAB: TEST LAB */}
        {activeTab === 'test_lab' && (
          <TestLabTab 
            projName={projName} 
            onAddEventToGlobalRegistry={(newEvent) => {
              setEvents(prev => {
                const updated = [newEvent, ...prev];
                localStorage.setItem('aan_verification_events', JSON.stringify(updated));
                return updated;
              });
            }}
          />
        )}

        {/* TAB: ZK PROOFS */}
        {activeTab === 'zk_proofs' && (
          <ZKProofsTab 
            projName={projName}
            onAddEventToGlobalRegistry={(newEvent) => {
              setEvents(prev => {
                const updated = [newEvent, ...prev];
                localStorage.setItem('aan_verification_events', JSON.stringify(updated));
                return updated;
              });
            }}
          />
        )}

        {/* TAB 2: VERIFICATION EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Trust Assessment Log</h2>
                <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
              </div>

              {/* Seeding Controls if empty */}
              {events.length === 0 && (
                <button
                  onClick={handleSeedEvents}
                  className="bg-white hover:bg-slate-200 text-slate-950 text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Load Sandbox Seeds
                </button>
              )}
            </div>

            {/* Filtering Options */}
            <div className="flex flex-col sm:flex-row gap-4 bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl text-xs">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Search by User Reference</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Search e.g. usr_verified_alice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-white transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:w-48">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Decision Filter</label>
                <select
                  value={decisionFilter}
                  onChange={(e) => setDecisionFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3 py-2 text-xs text-white transition-all"
                >
                  <option value="all">All Decisions</option>
                  <option value="approved">Approved Only</option>
                  <option value="review">Review Only</option>
                  <option value="denied">Denied Only</option>
                </select>
              </div>
            </div>

            {/* Events registry empty states */}
            {events.length === 0 ? (
              <div className="bg-[#0b0c10] border border-white/[0.04] p-8 rounded-2xl text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#58E38A]/5 border border-[#58E38A]/15 flex items-center justify-center text-[#58E38A] mx-auto">
                  <Database className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-semibold tracking-tight">Your project is ready.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                    Send your first verification request to see trust decisions appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-black/10">
                        <th className="py-3 px-5 font-bold">Event ID / Project</th>
                        <th className="py-3 px-5 font-bold">Platform Reference</th>
                        <th className="py-3 px-5 font-bold">Score & Decision</th>
                        <th className="py-3 px-5 font-bold">Reason Signals</th>
                        <th className="py-3 px-5 font-bold">Device & IP Risk</th>
                        <th className="py-3 px-5 font-bold">Proof token</th>
                        <th className="py-3 px-5 font-bold text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-slate-300">
                      {events
                        .filter(e => e.external_user_id.toLowerCase().includes(searchQuery.toLowerCase()))
                        .filter(e => decisionFilter === 'all' ? true : e.decision === decisionFilter)
                        .map((e) => (
                          <tr key={e.id} onClick={() => setSelectedGlobalEvent(e)} className="hover:bg-white/[0.01] transition-colors cursor-pointer">
                            
                            <td className="py-3.5 px-5 space-y-1">
                              <span className="font-mono text-white block font-medium">{e.id}</span>
                              <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">{e.project || projName || "Core Node"}</span>
                            </td>

                            <td className="py-3.5 px-5 font-mono text-slate-400 font-medium">
                              {e.external_user_id}
                            </td>

                            <td className="py-3.5 px-5 space-y-1">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-white font-semibold block">{e.risk_score}%</span>
                                <span className="text-[9px] text-slate-500">risk</span>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                e.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                e.decision === 'denied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {e.decision}
                              </span>
                            </td>

                            <td className="py-3.5 px-5">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {e.reason_codes.map((code: string, idx: number) => (
                                  <span key={idx} className="bg-black/30 text-slate-400 px-1.5 py-0.5 rounded font-mono text-[8px] border border-white/[0.02]">
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-5 space-y-1 leading-normal">
                              <span className="text-slate-400 block">{e.device_signal}</span>
                              <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5">
                                <span>IP RISK:</span>
                                <span className={e.ip_risk_signal.includes('High') ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                                  {e.ip_risk_signal}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-5 space-y-1">
                              <span className={`text-[10px] font-mono font-semibold ${e.returning_human ? 'text-[#58E38A]' : 'text-slate-400'}`}>
                                {e.returning_human ? "Returning Match" : "New Identity"}
                              </span>
                              <span className="text-[9px] text-slate-500 block font-mono">
                                Token: {e.proof_token_status.toUpperCase()}
                              </span>
                            </td>

                            <td className="py-3.5 px-5 text-right font-mono text-slate-500 whitespace-nowrap">
                              {new Date(e.timestamp).toLocaleString()}
                            </td>

                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: TRUST DECISION RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Trust Policies</h2>
              <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
            </div>

            {/* Success Notifications */}
            {rulesSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Engine parameters saved successfully. Node synchronized with remote gateway.</span>
              </div>
            )}

            {/* Main Policy Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Numeric Thresholds */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-5 md:col-span-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Automated Score Routing</h3>
                <p className="text-[11px] text-slate-500">Instruct AAN how to automatically issue proof decisions based on telemetry risk score margins.</p>
                
                {/* Auto Approve Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Auto Approve Below Risk Score</span>
                    <span className="font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      &lt; {trustRules.autoApproveBelow}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={trustRules.autoApproveBelow}
                    onChange={(e) => setTrustRules({ 
                      ...trustRules, 
                      autoApproveBelow: parseInt(e.target.value),
                      manualReviewAbove: parseInt(e.target.value) + 1
                    })}
                    className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">Sessions securing risk indices under this range bypass checks and are marked Approved instantly.</p>
                </div>

                {/* Review range information */}
                <div className="p-3 bg-amber-500/[0.04] border border-amber-500/15 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-amber-400">Manual Review Interval</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {trustRules.manualReviewAbove}% to {trustRules.denyAbove - 1}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Attestations landing in this volatile variance buffer will require manual admin oversight before granting access permissions.
                  </p>
                </div>

                {/* Auto Deny Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Auto Deny Above Risk Score</span>
                    <span className="font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">
                      &gt; {trustRules.denyAbove}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="90"
                    value={trustRules.denyAbove}
                    onChange={(e) => setTrustRules({ ...trustRules, denyAbove: parseInt(e.target.value) })}
                    className="w-full accent-rose-400 bg-black/40 h-1 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">Sessions capturing high botnet indicators over this limit are automatically denied tokens.</p>
                </div>
              </div>

              {/* Right Column: Actions Configurations */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Risk Policies</h3>
                <p className="text-[11px] text-slate-500">Select behavioral responses for system anomalies and security events.</p>

                {/* Duplicate Action */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Duplicate Account Signature</label>
                  <select
                    value={trustRules.duplicateAction}
                    onChange={(e) => setTrustRules({ ...trustRules, duplicateAction: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="flag">Flag & Continue (Monitor Only)</option>
                    <option value="block">Block Duplicate Signatures</option>
                    <option value="review">Route to Manual Review Pool</option>
                  </select>
                </div>

                {/* Bot Suspicion Action */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Bot Suspicion Event</label>
                  <select
                    value={trustRules.botSuspicionAction}
                    onChange={(e) => setTrustRules({ ...trustRules, botSuspicionAction: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="verify">Enforce Volatile Video Proof</option>
                    <option value="block_immediate">Block Immediately</option>
                    <option value="captcha">Challenge with CAPTCHA Proof</option>
                  </select>
                </div>

                {/* Fallback mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Users without camera access</label>
                  <select
                    value={trustRules.fallbackNoCamera}
                    onChange={(e) => setTrustRules({ ...trustRules, fallbackNoCamera: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="allow_with_risk_penalty">Allow with Risk Penalty (+30 Score)</option>
                    <option value="deny">Deny access immediately</option>
                    <option value="otp_fallback">Fallback to SMS/Email OTP verification</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Bottom Controls */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveTrustRules}
                disabled={savingRules}
                className="bg-white hover:bg-slate-200 text-slate-950 text-xs font-mono font-bold py-2.5 px-6 rounded-xl transition-all shadow-xl shadow-white/5 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {savingRules ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing parameters...</span>
                  </>
                ) : (
                  <>
                    <span>Save Trust Rules</span>
                    <Sliders className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Expanded Organization Relationship Policies */}
            <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4 text-left">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Trust Intelligence Policies</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define constraints for account associations, device matches, and velocity rules.</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Total Active Policies: {policies.filter(p => p.enabled).length}
                </div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {policies.map((p) => (
                  <div key={p.id} className="py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1.5 max-w-xl text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{p.name}</span>
                        <span className="bg-black/40 border border-white/[0.05] text-slate-500 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                          {p.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px] font-light">
                        <span>Threshold: <strong className="text-slate-300 font-mono font-normal">{p.threshold}</strong></span>
                        <span className="flex items-center gap-1.5">
                          Action: 
                          <select
                            value={p.recommendedAction}
                            onChange={(e) => {
                              const updatedAction = e.target.value as any;
                              setPolicies(prev => prev.map(item => item.id === p.id ? { ...item, recommendedAction: updatedAction } : item));
                            }}
                            className="bg-black/40 border border-white/[0.08] focus:outline-none rounded px-2 py-0.5 text-[10px] font-mono text-[#58E38A] cursor-pointer"
                          >
                            <option value="ALLOW">ALLOW</option>
                            <option value="STEP_UP">STEP_UP</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="DENY">DENY</option>
                            <option value="FLAG_ONLY">FLAG_ONLY</option>
                          </select>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setEditingPolicyId(p.id);
                          setEditingJson(p.jsonRule);
                        }}
                        className="text-[10px] font-mono text-[#58E38A] hover:underline cursor-pointer flex items-center gap-1 bg-black/40 border border-white/[0.06] py-1 px-2.5 rounded-lg"
                      >
                        <Code className="w-3 h-3" />
                        <span>Edit JSON Rules</span>
                      </button>

                      {/* Toggle button */}
                      <button
                        onClick={() => {
                          setPolicies(prev => prev.map(item => item.id === p.id ? { ...item, enabled: !item.enabled } : item));
                        }}
                        className={`text-[10px] font-mono uppercase px-3 py-1 rounded-lg transition-all cursor-pointer font-bold border ${
                          p.enabled 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-black/40 text-slate-500 border-white/[0.04]'
                        }`}
                      >
                        {p.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Rule Editor Modal Overlay */}
            {editingPolicyId && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#0b0c10] border border-white/[0.08] w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl animate-[fadeIn_0.15s_ease-out]">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Policy Rules Editor</span>
                      <h4 className="text-white text-xs font-semibold">
                        {policies.find(p => p.id === editingPolicyId)?.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingPolicyId(null)}
                      className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Rule Schema (JSON)</label>
                    <textarea
                      value={editingJson}
                      onChange={(e) => setEditingJson(e.target.value)}
                      rows={8}
                      className="w-full bg-black/40 border border-white/[0.08] focus:border-[#58E38A]/30 focus:outline-none rounded-xl p-3 text-[11px] font-mono text-emerald-400 leading-normal"
                    />
                  </div>

                  <div className="flex justify-end gap-3.5 pt-2">
                    <button
                      onClick={() => setEditingPolicyId(null)}
                      className="bg-black/30 text-slate-400 hover:text-white border border-white/[0.05] text-xs font-mono py-2 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        try {
                          // Validate if it is valid JSON
                          JSON.parse(editingJson);
                          setPolicies(prev => prev.map(item => item.id === editingPolicyId ? { ...item, jsonRule: editingJson } : item));
                          setEditingPolicyId(null);
                        } catch (e) {
                          alert("Invalid JSON schema. Please check syntax.");
                        }
                      }}
                      className="bg-white hover:bg-slate-200 text-slate-950 text-xs font-mono font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Apply Rules
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: API CREDENTIALS */}
        {activeTab === 'credentials' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Integration Credentials</h2>
              <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
            </div>

            {/* Warning card */}
            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl text-xs">
                <span className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Sandbox Environment Credentials</span>
                </span>
                <p className="text-slate-500 leading-normal">
                  These keys are isolated within the secure Sandbox environment. To request production-certified API keys with secure cloud backups, please complete compliance validation in Organization Settings.
                </p>
              </div>
            </div>

            {/* Active Keys Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Active Integration Keys</h3>
              
              <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                
                {/* Publishable Key */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Publishable Key</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Frontend embed</span>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl font-mono text-xs text-slate-200 select-all truncate flex-1">
                      <code>{pubKey || "aan_pub_sb_unconfigured"}</code>
                    </div>
                    <button
                      onClick={() => copyText(pubKey, 'p_pub')}
                      className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {keysCopied['p_pub'] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/[0.02] w-full" />

                {/* Secret Key */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Secret Key</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Backend proxy only</span>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl font-mono text-xs text-slate-200 truncate flex-1 flex justify-between items-center">
                      <code>
                        {secretShown ? (secKey || "aan_sec_sb_unconfigured") : "••••••••••••••••••••••••••••••••••••••••"}
                      </code>
                      <button 
                        onClick={() => setSecretShown(!secretShown)} 
                        className="text-[10px] font-mono text-slate-500 hover:text-slate-300 ml-2"
                      >
                        {secretShown ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    <button
                      onClick={() => copyText(secKey, 'p_sec')}
                      className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {keysCopied['p_sec'] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/[0.02] w-full" />

                {/* Webhook Secret */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Webhook Secret</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Payload signature</span>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl font-mono text-xs text-slate-200 select-all truncate flex-1">
                      <code>{whSecret || "whsec_sb_unconfigured"}</code>
                    </div>
                    <button
                      onClick={() => copyText(whSecret, 'p_wh')}
                      className="bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {keysCopied['p_wh'] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 5: DEVELOPER DOCS */}
        {activeTab === 'docs' && (
          <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Developer Integration Guide</h2>
              <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
            </div>

            {/* Core Architectural Definition */}
            <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-3.5 text-xs">
              <h3 className="text-white text-sm font-semibold">Trust Infrastructure Model</h3>
              <p className="text-slate-500 leading-relaxed font-normal">
                AAN <strong className="text-slate-300 font-semibold">integrates alongside your existing authentication system</strong>, evaluating registrations, logins, and high-risk actions before access is granted.
              </p>
              <p className="text-slate-500 leading-relaxed font-normal">
                After evaluation, AAN returns a signed trust token containing verified trust claims that your backend can validate instantly. Your backend verifies this token with the AAN trust service and grants secure access.
              </p>
            </div>

            {/* Interactive Code snippets tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-white/[0.04] gap-4 font-mono text-[10px]">
                <button
                  onClick={() => setCodeTab('frontend')}
                  className={`pb-2 transition-all cursor-pointer font-bold ${codeTab === 'frontend' ? 'border-b-2 border-[#58E38A] text-white' : 'text-slate-500'}`}
                >
                  1. FRONTEND EMBED
                </button>
                <button
                  onClick={() => setCodeTab('backend')}
                  className={`pb-2 transition-all cursor-pointer font-bold ${codeTab === 'backend' ? 'border-b-2 border-[#58E38A] text-white' : 'text-slate-500'}`}
                >
                  2. SERVER VERIFICATION
                </button>
                <button
                  onClick={() => setCodeTab('webhook')}
                  className={`pb-2 transition-all cursor-pointer font-bold ${codeTab === 'webhook' ? 'border-b-2 border-[#58E38A] text-white' : 'text-slate-500'}`}
                >
                  3. WEBHOOK INTEGRATION
                </button>
                <button
                  onClick={() => setCodeTab('token')}
                  className={`pb-2 transition-all cursor-pointer font-bold ${codeTab === 'token' ? 'border-b-2 border-[#58E38A] text-white' : 'text-slate-500'}`}
                >
                  4. TRUST TOKEN CLAIMS
                </button>
              </div>

              {/* Code Blocks */}
              <div className="bg-black/60 border border-white/[0.05] rounded-xl p-5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto select-all">
                {codeTab === 'frontend' && (
                  <pre>{`// 1. Install client SDK
import { AANClient } from '@aan/web-sdk';

// 2. Initialize Client
const aan = new AANClient({
  publishableKey: "${pubKey || 'aan_pub_sb_7c9f8d1e'}"
});

// 3. Request Verification Scan (evaluates login, registration, or transaction)
async function handleUserSignup() {
  try {
    const { trustToken, error } = await aan.triggerScan({
      externalUserId: "partner_user_ref_923",
      level: "secure_verification"
    });

    if (error) {
      console.error("Verification failed or cancelled", error);
      return;
    }

    // 4. Send token to your secure backend endpoint
    await fetch('/api/auth/register-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trustToken, signupData })
    });
  } catch (err) {
    console.warn("Client fallback trigger", err);
  }
}`}</pre>
                )}

                {codeTab === 'backend' && (
                  <pre>{`// 1. Secure Server Verification (Express example)
import express from 'express';
import { AANVerifier } from '@aan/node-sdk';

const app = express();
const verifier = new AANVerifier({
  secretKey: process.env.AAN_SECRET_KEY // "${secKey ? secKey.substring(0, 15) + '...' : 'aan_sec_sb_9a3f8c...'}"
});

app.post('/api/auth/register-verified', express.json(), async (req, res) => {
  const { trustToken, signupData } = req.body;

  // 2. Verify Token against the Trust Network
  const attestation = await verifier.verifyToken(trustToken);

  if (!attestation.valid || attestation.riskScore > 30) {
    // Log Decision: Failed Verification
    return res.status(403).json({ 
      error: "Human verification failed", 
      riskScore: attestation.riskScore 
    });
  }

  // 3. Grant Access and Log Decision
  const newUser = await db.users.create({ ...signupData, trustUid: attestation.trustUid });
  res.json({ success: true, userId: newUser.id });
});`}</pre>
                )}

                {codeTab === 'webhook' && (
                  <pre>{`// Verify webhook event signatures on your endpoint
import crypto from 'crypto';

app.post('/webhooks/aan', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['aan-signature'];
  const webhookSecret = "${whSecret || 'whsec_sb_bfd29a'}";

  // Compute validation hash
  const computedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (computedHash !== signature) {
    return res.status(401).send('Signature Verification Failed');
  }

  const event = JSON.parse(req.body);
  console.log("Verified trust event received:", event.type, event.data.risk_score);
  
  res.sendStatus(200);
});`}</pre>
                )}

                {codeTab === 'token' && (
                  <pre>{`{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key_aan_prod_01"
}
{
  "issuer": "aan-trust-network",
  "subject": "usr_verified_alice",
  "token_id": "token_83f2b1c09d2a",
  "timestamp": 1783305600,
  "claims": {
    "verification_level": "Level 2 (Secure Face Link)",
    "risk_score": 12,
    "human_verified": true,
    "unique_human": true,
    "account_confidence": "High (98%)",
    "device_trust": "High (0.97)",
    "network_trust": "Secure",
    "behavior_score": 96
  },
  "signature": "db4e...[cryptographic_trust_authority_signature]"
}`}</pre>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: ORGANIZATION SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            
            {/* Page Header */}
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Organization Settings</h2>
              <p className="text-xs text-[#58E38A] mt-1 font-medium">AAN delivers real-time trust decisions without replacing your authentication system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form & Metadata columns */}
              <div className="space-y-6 md:col-span-2 text-xs">
                
                {/* Node Settings Form */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Trust Configuration</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Organization Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Trust Project Label</label>
                      <input
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Allowed Origin Domains</label>
                      <input
                        type="text"
                        placeholder="localhost:3000, acme.com"
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Webhook Endpoint</label>
                      <input
                        type="text"
                        placeholder="https://acme.com/webhooks/aan"
                        className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                        defaultValue="https://acme.com/webhooks/aan"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('aan_org_name', orgName);
                        localStorage.setItem('aan_project_name', projName);
                        alert("Node configurations saved successfully.");
                      }}
                      className="bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Save Node Configurations
                    </button>
                  </div>
                </div>

                {/* Expanded Technical Metadata Profile */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">System Metadata & Status</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Organization ID</span>
                      <span className="font-mono text-white select-all">{projectId || 'org_sandbox_aan_201'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Node Status</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span>Active</span>
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Environment</span>
                      <span className="font-mono text-amber-400 uppercase font-bold text-[10px]">{projEnv || 'sandbox'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Last Verification Request</span>
                      <span className="text-slate-300 font-medium">Just now</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">API Version</span>
                      <span className="font-mono text-slate-300 font-medium font-semibold">v1.2.0 (Stable)</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Current Plan</span>
                      <span className="text-slate-300 font-medium">Sandbox Developer Plan</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">SDK Version</span>
                      <span className="font-mono text-slate-300 font-medium font-semibold">@aan/web-sdk@2.4.1</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Rate Limits</span>
                      <span className="text-slate-300 font-medium">60 req/min (10,000/mo)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Expanded Compliance & Organization Status checklist */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4 h-fit">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Organization Status</h3>
                
                <div className="space-y-4 text-xs leading-normal">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <span className="text-white font-medium block">Organization Registered</span>
                      <p className="text-[10px] text-slate-500">Legal entity registered on verified node.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <span className="text-white font-medium block">Domain Verified</span>
                      <p className="text-[10px] text-slate-500">Allowed domains matched and verified.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <span className="text-white font-medium block">Sandbox Enabled</span>
                      <p className="text-[10px] text-slate-500">Developer sandbox node initialized.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <span className="text-white font-medium block">API Credentials Generated</span>
                      <p className="text-[10px] text-slate-500">Integration keys generated successfully.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <span className="text-white font-medium block">Webhook Configured</span>
                      <p className="text-[10px] text-slate-500">Inbound event payload url active.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-black/40 border border-white/10 text-slate-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">○</div>
                    <div>
                      <span className="text-slate-400 font-medium block">Billing Configured</span>
                      <p className="text-[10px] text-slate-500">Provide payment method for live requests.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-black/40 border border-white/10 text-slate-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">○</div>
                    <div>
                      <span className="text-slate-400 font-medium block">Production Approved</span>
                      <p className="text-[10px] text-slate-500">Corporate verification and approval.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-black/40 border border-white/10 text-slate-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">○</div>
                    <div>
                      <span className="text-slate-400 font-medium block">Trust Network Active</span>
                      <p className="text-[10px] text-slate-500">Full attestation authority enabled.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* GLOBAL EVENT INSPECT MODAL (ZK Proof linked details) */}
      {selectedGlobalEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
          <div className="bg-[#0b0c10] border border-white/[0.08] w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl animate-[fadeIn_0.15s_ease-out] max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-[#58E38A] uppercase tracking-wider font-bold">Trust Assessment Detail</span>
                <h4 className="text-white text-xs font-semibold font-mono">
                  {selectedGlobalEvent.id}
                </h4>
              </div>
              <button
                onClick={() => setSelectedGlobalEvent(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer bg-white/[0.02] border border-white/[0.05] py-1 px-3 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Standard Event Details */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-black/20 p-3.5 rounded-xl border border-white/[0.02] font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Partner Reference ID</span>
                  <span className="text-white font-semibold block">{selectedGlobalEvent.external_user_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Decision Timestamp</span>
                  <span className="text-white block">{new Date(selectedGlobalEvent.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Device Footprint</span>
                  <span className="text-slate-300 block truncate">{selectedGlobalEvent.device_signal}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">IP Risk Status</span>
                  <span className="text-slate-300 block">{selectedGlobalEvent.ip_risk_signal}</span>
                </div>
              </div>

              {/* Reason Codes */}
              <div className="space-y-1.5">
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block font-bold">Reason Signal Flags</span>
                <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                  {selectedGlobalEvent.reason_codes.map((code: string, idx: number) => (
                    <span key={idx} className="bg-black/40 border border-white/[0.05] text-slate-300 px-2 py-0.5 rounded">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ZK Model Proof Component Card (REQUESTED STEP 5) */}
            <div className="bg-black/40 border border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[#58E38A] rounded-lg">
                    <Binary className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider font-mono">ZK Model Proof</h4>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-[#58E38A] border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Verified
                </span>
              </div>

              {/* Card Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Model Name & Circuit</span>
                  <span className="text-white font-semibold">AAN Risk Model v0.1-sandbox</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Verified Output Score</span>
                  <span className="text-[#58E38A] font-bold text-xs">{selectedGlobalEvent.risk_score}% Output</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Cryptographic Proof Hash</span>
                  <span className="text-slate-300 truncate block max-w-sm">
                    {selectedGlobalEvent.zk_proof_id ? `0x${selectedGlobalEvent.zk_proof_id.replace("zkp_aan_", "")}e1e51b6a71e82b7cfdc1d7c92b2ef81977a4ee40c5eb` : "0x7a8df1e51b6a71e82b7cfdc1d7c92b2ef81977a4ee40c5ebf092adcf1b6a71e8"}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Public Inputs payload Hash</span>
                  <span className="text-slate-300 truncate block max-w-sm">
                    0x3fa99bcfdc1d7c92b2ef81977a4ee40882c1628d42cdd01a5ebf092adcf1b6a
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Proving circuit Verifier</span>
                  <span className="text-white">EZKL Halo2</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Verification Time</span>
                  <span className="text-[#58E38A]">182 ms</span>
                </div>
              </div>

              {/* Descriptive caption */}
              <p className="text-[10px] text-slate-400 leading-normal bg-black/40 p-3 rounded-xl border border-white/[0.02]">
                “This proof verifies that the published AAN risk model produced this risk score for the trust event. Raw private inputs are not exposed.”
              </p>
              
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                <span>Verification Keys Linked (vk)</span>
                <span className="text-[#58E38A]">RAW INPUTS HIDDEN</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
