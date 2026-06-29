import React, { useState, useEffect } from 'react';
import { 
  Check, AlertTriangle, Sliders, Plus, Copy, FileCode, CheckCircle2,
  Trash2, HelpCircle, Eye, ShieldAlert, History, TrendingUp, X, 
  ChevronRight, Save, Info, Sparkles, Terminal, LogOut, BookOpen
} from 'lucide-react';
import { VerificationProfile, ProfileHistoryEntry, PartnerApp } from '../types';
import { isAcademyEnabled } from '../academyConfig';

interface VerificationProfilesTabProps {
  partnerApps: PartnerApp[];
  onAddAuditLog: (action: string, targetType: string, targetId: string, metadata: Record<string, any>) => void;
  onNavigateToAcademy: (lessonId: string) => void;
}

interface SignalMetadata {
  id: string;
  name: string;
  description: string;
  purpose: string;
  privacyImpact: string;
  recommendedUse: string;
  enterpriseRec: string;
}

const STATIC_SIGNALS: SignalMetadata[] = [
  {
    id: "email_hash",
    name: "Email Hash (SHA-256)",
    description: "Verifies unique user presence using anonymized identifiers.",
    purpose: "Allows us to recognize returning humans and prevent duplicate accounts without storing plain text emails.",
    privacyImpact: "The raw email is hashed locally on your device and never stored or sent in plain text.",
    recommendedUse: "Standard signup, account creation, and user enrollment pipelines.",
    enterpriseRec: "Mandatory for general anti-abuse and multi-account threat prevention."
  },
  {
    id: "phone_hash",
    name: "Phone Hash (SHA-256)",
    description: "Connects trust verification to a unique mobile network identifier.",
    purpose: "Helps confirm the existence of a real, unique human backed by a mobile carrier subscription.",
    privacyImpact: "Converts phone numbers into mathematical hashes, ensuring plain phone records are never logged.",
    recommendedUse: "High-fraud gateways, financial withdrawals, and secure passwordless verification.",
    enterpriseRec: "Highly recommended for verification flows that offer transactional value, credits, or premium incentives."
  },
  {
    id: "partner_user_id",
    name: "Partner User ID",
    description: "Securely links trust status directly to your user database.",
    purpose: "Lets your platform reconcile session results with accounts while keeping the actual user profile anonymous to AAN.",
    privacyImpact: "Entirely obfuscated from any external platform or database.",
    recommendedUse: "All standard production verification pipelines.",
    enterpriseRec: "Required to establish database mappings."
  },
  {
    id: "session_id",
    name: "Trust Session ID",
    description: "A single-use transaction token that secures the active session.",
    purpose: "Secures the trust handoff and prevents replay attacks while the session is processed.",
    privacyImpact: "Strictly transient, leaving no permanent user footprint.",
    recommendedUse: "All integration pipelines.",
    enterpriseRec: "Mandatory core security mechanism."
  },
  {
    id: "device_identifier",
    name: "Device Trust Signal",
    description: "Identifies unique user devices without cookies or persistent hardware tracking.",
    purpose: "Allows platforms to detect when a single automated bot or emulator is generating hundreds of fake accounts.",
    privacyImpact: "Evaluated using local browser sandboxes, meaning zero cookies or cross-site tracking files are used.",
    recommendedUse: "Rapid verification attempts, public registration endpoints.",
    enterpriseRec: "Highly recommended to combat device emulators and scripted botnets."
  },
  {
    id: "ip_address",
    name: "Truncated IP Address",
    description: "Geographic network verification, truncated to protect home locations.",
    purpose: "Recognizes trusted residential connections and detects malicious proxies or automated server farms.",
    privacyImpact: "Truncated to broad subnet ranges (like /24) to mask precise locations while retaining security signals.",
    recommendedUse: "Real-time automated risk grading.",
    enterpriseRec: "Recommended for secure checkout checkpoints and transactional routing."
  },
  {
    id: "browser_metadata",
    name: "Browser Signals",
    description: "Used to recognize trusted browsers and detect suspicious changes without storing personal browsing history.",
    purpose: "Identifies automated testing scripts, emulators, and headless bots attempting to mimic genuine human browsers.",
    privacyImpact: "Analyzed ephemerally on-the-fly without persistent tracing or tracking cookies.",
    recommendedUse: "General fraud mitigation.",
    enterpriseRec: "Indispensable signal defending against simple scripting attacks."
  },
  {
    id: "operating_system",
    name: "Operating System Signatures",
    description: "Confirms basic device system configurations.",
    purpose: "Helps verify device authenticity by checking if OS characteristics align with browser characteristics.",
    privacyImpact: "Standard technical headers only, containing no personal files or settings.",
    recommendedUse: "Standard diagnostic support.",
    enterpriseRec: "Basic telemetry validation benchmark."
  },
  {
    id: "passkey_webauthn",
    name: "Passkey / WebAuthn Attestation",
    description: "Uses cryptographic keypairs to establish strong device presence.",
    purpose: "Allows secure, frictionless passwordless login that proves possession of a real physical device.",
    privacyImpact: "Relies entirely on standard local authentication; no private biometric keys ever leave the device.",
    recommendedUse: "High-security financial portals, administrator dashboards.",
    enterpriseRec: "Leading cryptographic signal for maximum enterprise security."
  },
  {
    id: "verified_id_provider",
    name: "Verified Identity Provider",
    description: "Connects verified external enterprise or institutional clearing networks.",
    purpose: "Verifies high-assurance organization or regulatory trust compliance for specialized applications.",
    privacyImpact: "Securely scoped assertions containing only the essential verification status.",
    recommendedUse: "B2B client platforms.",
    enterpriseRec: "Outstanding signal for corporate partner onboarding configurations."
  },
  {
    id: "custom_org_signal",
    name: "Organization Signal",
    description: "Allows custom platform signals tailored to specific business logic.",
    purpose: "Enables integrations to map custom threat data or legacy metadata to the AAN trust decision engine.",
    privacyImpact: "Completely configured and governed by your organization.",
    recommendedUse: "Bespoke business rulesets.",
    enterpriseRec: "Ideal for integrations requiring legacy CRM alignment."
  }
];

const DEFAULT_PROFILES: VerificationProfile[] = [
  {
    id: "prof_basic",
    name: "Basic Trust",
    description: "Fast, privacy-first verification for everyday applications.",
    isCustom: false,
    signals: {
      email_hash: { enabled: true, required: true },
      partner_user_id: { enabled: true, required: true },
      session_id: { enabled: true, required: true },
      phone_hash: { enabled: false, required: false },
      device_identifier: { enabled: false, required: false },
      ip_address: { enabled: false, required: false },
      browser_metadata: { enabled: false, required: false },
      operating_system: { enabled: false, required: false },
      passkey_webauthn: { enabled: false, required: false },
      verified_id_provider: { enabled: false, required: false },
      custom_org_signal: { enabled: false, required: false },
    },
    assignedProjectIds: [],
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-01T12:00:00Z"
  },
  {
    id: "prof_standard",
    name: "Standard Trust",
    description: "Balanced protection for most platforms. Helps prevent duplicate accounts and common automated abuse while keeping the user experience smooth.",
    isCustom: false,
    signals: {
      email_hash: { enabled: true, required: true },
      partner_user_id: { enabled: true, required: true },
      session_id: { enabled: true, required: true },
      phone_hash: { enabled: true, required: false },
      device_identifier: { enabled: true, required: true },
      ip_address: { enabled: true, required: false },
      browser_metadata: { enabled: true, required: true },
      operating_system: { enabled: true, required: false },
      passkey_webauthn: { enabled: false, required: false },
      verified_id_provider: { enabled: false, required: false },
      custom_org_signal: { enabled: false, required: false },
    },
    assignedProjectIds: [],
    createdAt: "2026-06-02T14:30:00Z",
    updatedAt: "2026-06-02T14:30:00Z"
  },
  {
    id: "prof_high_security",
    name: "High Security",
    description: "Designed for environments requiring stronger trust decisions and additional evidence before access is granted.",
    isCustom: false,
    signals: {
      email_hash: { enabled: true, required: true },
      partner_user_id: { enabled: true, required: true },
      session_id: { enabled: true, required: true },
      phone_hash: { enabled: true, required: true },
      device_identifier: { enabled: true, required: true },
      ip_address: { enabled: true, required: true },
      browser_metadata: { enabled: true, required: true },
      operating_system: { enabled: true, required: true },
      passkey_webauthn: { enabled: false, required: false },
      verified_id_provider: { enabled: false, required: false },
      custom_org_signal: { enabled: true, required: false },
    },
    assignedProjectIds: [],
    createdAt: "2026-06-03T09:15:00Z",
    updatedAt: "2026-06-03T09:15:00Z"
  },
  {
    id: "prof_financial",
    name: "Financial",
    description: "Recommended for regulated financial services requiring higher assurance and stricter risk evaluation.",
    isCustom: false,
    signals: {
      email_hash: { enabled: true, required: true },
      partner_user_id: { enabled: true, required: true },
      session_id: { enabled: true, required: true },
      phone_hash: { enabled: true, required: true },
      device_identifier: { enabled: true, required: true },
      ip_address: { enabled: true, required: true },
      browser_metadata: { enabled: true, required: true },
      operating_system: { enabled: true, required: true },
      passkey_webauthn: { enabled: true, required: false },
      verified_id_provider: { enabled: true, required: false },
      custom_org_signal: { enabled: true, required: true },
    },
    assignedProjectIds: [],
    createdAt: "2026-06-04T10:00:00Z",
    updatedAt: "2026-06-24T10:00:00Z"
  }
];

export default function VerificationProfilesTab({ partnerApps, onAddAuditLog, onNavigateToAcademy }: VerificationProfilesTabProps) {
  const [profiles, setProfiles] = useState<VerificationProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("prof_standard");
  const [history, setHistory] = useState<ProfileHistoryEntry[]>([]);
  
  // UI States
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>("");
  const [newProfileDesc, setNewProfileDesc] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [auditReason, setAuditReason] = useState<string>("");
  const [selectedSignalId, setSelectedSignalId] = useState<string>("email_hash");
  const [assignProjectIds, setAssignProjectIds] = useState<string[]>([]);

  // Editable temporary profile state
  const [tempProfile, setTempProfile] = useState<VerificationProfile | null>(null);

  // Initialize and load from localstorage
  useEffect(() => {
    const storedProfiles = localStorage.getItem('aan_verification_profiles');
    const storedHistory = localStorage.getItem('aan_profile_history');

    let loadedProfiles: VerificationProfile[] = [];
    if (storedProfiles) {
      try {
        loadedProfiles = JSON.parse(storedProfiles);
      } catch (e) {
        loadedProfiles = [...DEFAULT_PROFILES];
      }
    } else {
      loadedProfiles = [...DEFAULT_PROFILES];
      // Automatically assign first project if any exists
      if (partnerApps.length > 0 && loadedProfiles.length > 1) {
        loadedProfiles[1].assignedProjectIds = [partnerApps[0].id];
      }
      localStorage.setItem('aan_verification_profiles', JSON.stringify(loadedProfiles));
    }
    setProfiles(loadedProfiles);

    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        setHistory([]);
      }
    } else {
      const initialHistory: ProfileHistoryEntry[] = [
        {
          id: "hist_1",
          profileId: "prof_standard",
          profileName: "Standard Verification",
          changedBy: "platform_migration@aan.trust",
          previousConfig: {},
          newConfig: loadedProfiles.find(p => p.id === "prof_standard")?.signals || {},
          timestamp: "2026-06-22T05:00:00Z",
          reason: "System initialization of standard signal mapping profile."
        }
      ];
      setHistory(initialHistory);
      localStorage.setItem('aan_profile_history', JSON.stringify(initialHistory));
    }
  }, [partnerApps]);

  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0] || DEFAULT_PROFILES[0];
  const activeSignal = STATIC_SIGNALS.find(s => s.id === selectedSignalId) || STATIC_SIGNALS[0];

  // Sync temp profile when going into edit mode or switching selected profile
  useEffect(() => {
    if (activeProfile) {
      setTempProfile({
        ...activeProfile,
        signals: JSON.parse(JSON.stringify(activeProfile.signals)) // deep copy
      });
      setAssignProjectIds(activeProfile.assignedProjectIds || []);
    }
  }, [selectedProfileId, editMode, activeProfile]);

  const saveProfilesToLocalStorage = (newProfiles: VerificationProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('aan_verification_profiles', JSON.stringify(newProfiles));
  };

  const saveHistoryToLocalStorage = (newHistory: ProfileHistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('aan_profile_history', JSON.stringify(newHistory));
  };

  // Actions
  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;

    const newId = `prof_custom_${Date.now()}`;
    const newProf: VerificationProfile = {
      id: newId,
      name: newProfileName,
      description: newProfileDesc || "Custom organization verification profile.",
      isCustom: true,
      signals: JSON.parse(JSON.stringify(DEFAULT_PROFILES[0].signals)), // start with Basic copy
      assignedProjectIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...profiles, newProf];
    saveProfilesToLocalStorage(updated);
    
    // Add history item
    const newHist: ProfileHistoryEntry = {
      id: `hist_${Date.now()}`,
      profileId: newId,
      profileName: newProfileName,
      changedBy: "admin@aan.trust",
      previousConfig: {},
      newConfig: newProf.signals,
      timestamp: new Date().toISOString(),
      reason: "Custom profile creation."
    };
    saveHistoryToLocalStorage([newHist, ...history]);

    onAddAuditLog(
      "verification_profile.created",
      "verification_profile",
      newId,
      { profile_name: newProfileName }
    );

    setSelectedProfileId(newId);
    setShowCreateModal(false);
    setNewProfileName("");
    setNewProfileDesc("");
  };

  const handleDuplicateProfile = () => {
    const newId = `prof_custom_${Date.now()}`;
    const newProf: VerificationProfile = {
      id: newId,
      name: `Copy of ${activeProfile.name}`,
      description: `Duplicated config from ${activeProfile.name}. ${activeProfile.description}`,
      isCustom: true,
      signals: JSON.parse(JSON.stringify(activeProfile.signals)),
      assignedProjectIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...profiles, newProf];
    saveProfilesToLocalStorage(updated);

    const newHist: ProfileHistoryEntry = {
      id: `hist_${Date.now()}`,
      profileId: newId,
      profileName: newProf.name,
      changedBy: "admin_duplicate@aan.trust",
      previousConfig: {},
      newConfig: newProf.signals,
      timestamp: new Date().toISOString(),
      reason: `Duplicated config from profile: ${activeProfile.name}`
    };
    saveHistoryToLocalStorage([newHist, ...history]);

    onAddAuditLog(
      "verification_profile.duplicated",
      "verification_profile",
      newId,
      { duplicated_from: activeProfile.id, source_name: activeProfile.name }
    );

    setSelectedProfileId(newId);
  };

  const handleSaveProfileChanges = () => {
    if (!tempProfile) return;

    // Build changes comparison
    const previousSignals = activeProfile.signals;
    const newSignals = tempProfile.signals;

    const updatedProfiles = profiles.map(p => {
      if (p.id === selectedProfileId) {
        return {
          ...p,
          signals: newSignals,
          assignedProjectIds: assignProjectIds,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    saveProfilesToLocalStorage(updatedProfiles);

    const finalReason = auditReason.trim() || "Standard security settings adjustment.";
    const newHist: ProfileHistoryEntry = {
      id: `hist_${Date.now()}`,
      profileId: activeProfile.id,
      profileName: activeProfile.name,
      changedBy: "administrator@aan.trust",
      previousConfig: previousSignals,
      newConfig: newSignals,
      timestamp: new Date().toISOString(),
      reason: finalReason
    };

    saveHistoryToLocalStorage([newHist, ...history]);

    onAddAuditLog(
      "verification_profile.updated",
      "verification_profile",
      activeProfile.id,
      { 
        profile_name: activeProfile.name, 
        audit_reason: finalReason,
        assigned_projects: assignProjectIds
      }
    );

    setEditMode(false);
    setAuditReason("");
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const target = profiles.find(p => p.id === id);
    if (!target) return;
    if (!target.isCustom) {
      return;
    }

    const updated = profiles.filter(p => p.id !== id);
    saveProfilesToLocalStorage(updated);
    
    onAddAuditLog(
      "verification_profile.deleted",
      "verification_profile",
      id,
      { profile_name: target.name }
    );

    setSelectedProfileId(updated[0]?.id || "prof_standard");
  };

  const handleToggleSignalTemp = (sigId: string) => {
    if (!tempProfile) return;
    const current = tempProfile.signals[sigId] || { enabled: false, required: false };
    const nextEnabled = !current.enabled;
    const nextRequired = nextEnabled ? current.required : false; // false if disabled

    setTempProfile({
      ...tempProfile,
      signals: {
        ...tempProfile.signals,
        [sigId]: { enabled: nextEnabled, required: nextRequired }
      }
    });
  };

  const handleToggleRequiredTemp = (sigId: string) => {
    if (!tempProfile) return;
    const current = tempProfile.signals[sigId] || { enabled: false, required: false };
    if (!current.enabled) return; // Cannot make required if disabled

    setTempProfile({
      ...tempProfile,
      signals: {
        ...tempProfile.signals,
        [sigId]: { ...current, required: !current.required }
      }
    });
  };

  const handleToggleProjectAssignment = (projId: string) => {
    if (assignProjectIds.includes(projId)) {
      setAssignProjectIds(assignProjectIds.filter(id => id !== projId));
    } else {
      setAssignProjectIds([...assignProjectIds, projId]);
    }
  };

  // Build the live API request representation in JSON
  const renderLivePayloadPreview = () => {
    const payload: Record<string, any> = {
      verification_profile: activeProfile.id,
      timestamp: new Date().toISOString()
    };

    // Populate active signals
    STATIC_SIGNALS.forEach(sig => {
      // Check active profile configurations
      const config = activeProfile.signals[sig.id];
      if (config && config.enabled) {
        if (sig.id === "email_hash") {
          payload["email_hash"] = "93f8e21a32a6881c15f9d1bb8a4d46ba0975618b111db0d7ec00ef0efb19793f";
        } else if (sig.id === "phone_hash") {
          payload["phone_hash"] = "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";
        } else if (sig.id === "partner_user_id") {
          payload["partner_user_id"] = "partner_customer_bob_99";
        } else if (sig.id === "session_id") {
          payload["session_id"] = "vss_sb_1092a472910f543";
        } else if (sig.id === "device_identifier") {
          payload["device_fingerprint_hash"] = "sha256_df_67e3a90b4115e0a";
        } else if (sig.id === "ip_address") {
          payload["ip_address_truncated"] = "192.168.1.0/24";
        } else if (sig.id === "browser_metadata") {
          payload["browser_metadata"] = {
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
            screen_resolution: "1920x1080",
            language: "en-US",
            canvas_rendered: true
          };
        } else if (sig.id === "operating_system") {
          payload["operating_system"] = "macOS";
        } else if (sig.id === "passkey_webauthn") {
          payload["passkey_webauthn_signature"] = "webauthn_mock_sig_99011ba2";
        } else if (sig.id === "verified_id_provider") {
          payload["verified_id_provider"] = "google_idc_certified";
        } else if (sig.id === "custom_org_signal") {
          payload["custom_signals"] = {
            loyalty_tier: "platinum",
            registration_country: "US"
          };
        }
      }
    });

    return JSON.stringify(payload, null, 2);
  };

  // Build client curl commands
  const renderCurlPreview = () => {
    const selectedProjectObj = partnerApps.find(app => assignProjectIds.includes(app.id)) || partnerApps[0];
    const keyPreview = selectedProjectObj ? `poh_key_${selectedProjectObj.name.toLowerCase()}_sandbox_secret` : "poh_key_sandbox_secret";
    
    let itemsStr = "";
    STATIC_SIGNALS.forEach(sig => {
      const config = activeProfile.signals[sig.id];
      if (config && config.enabled) {
        if (sig.id === "email_hash") {
          itemsStr += `,\n       "email_hash": "93f8e21a32ab9..."`;
        } else if (sig.id === "phone_hash") {
          itemsStr += `,\n       "phone_hash": "ca978112ca1b..."`;
        } else if (sig.id === "partner_user_id") {
          itemsStr += `,\n       "partner_user_id": "customer_bob_99"`;
        } else if (sig.id === "device_identifier") {
          itemsStr += `,\n       "device_fingerprint": "sha256_df_67e3a9..."`;
        }
      }
    });

    return `curl -X POST https://api.aan.trust/api/v1/verification-sessions \\
     -H "Content-Type: application/json" \\
     -H "x-api-key: ${keyPreview}" \\
     -d '{
       "verification_profile": "${activeProfile.id}"${itemsStr}
     }'`;
  };

  // Mock analytics totals per profile
  const getProfileMockMetrics = (pId: string) => {
    const maps: Record<string, { total: number; passed: number; failed: number; risk: number }> = {
      prof_basic: { total: 12450, passed: 11980, failed: 470, risk: 3.7 },
      prof_standard: { total: 48900, passed: 46250, failed: 2650, risk: 5.4 },
      prof_high_security: { total: 5410, passed: 4710, failed: 700, risk: 12.9 },
      prof_financial: { total: 1102, passed: 981, failed: 121, risk: 10.9 }
    };
    return maps[pId] || { total: 450, passed: 410, failed: 40, risk: 8.8 };
  };

  const metricsObj = getProfileMockMetrics(activeProfile.id);

  return (
    <div className="space-y-6 text-slate-300 max-w-6xl animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1b1e28] pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-mono tracking-tight font-extrabold text-white leading-tight">Configurable Trust Profiles</h2>
          </div>
          <p className="text-xs text-[#78819a] mt-1 max-w-xl">
            AAN is signal-driven, not data-hungry. Prevent over-collection of sensitive user parameters by enabling only the minimum evidence parameters required.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAcademyEnabled() && (
            <button
              onClick={() => onNavigateToAcademy("verification_profiles")}
              className="flex items-center gap-1.5 text-xs text-blue-404 hover:text-white transition-all bg-[#111319] border border-[#1b1e28] px-3.5 py-2 rounded-lg cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Profiles Academy</span>
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ===================== PROFILES LIST SIDE (4 cols) ===================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#78819a] uppercase tracking-widest">Active Profiles</span>
              <span className="text-[9px] font-mono bg-[#0d0e12] px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-900/30">
                {profiles.length} TOTAL
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {profiles.map(p => {
                const isSelected = p.id === selectedProfileId;
                const assignedCount = p.assignedProjectIds?.length || 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProfileId(p.id); setEditMode(false); }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500/80' 
                        : 'bg-[#0d0e12] border-[#1b1e28] hover:bg-slate-850/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{p.name}</h4>
                      {p.isCustom ? (
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 py-0.1 rounded font-bold border border-emerald-900/40">CUSTOM</span>
                      ) : (
                        <span className="text-[8px] bg-[#111319] text-slate-500 px-1 py-0.1 rounded font-bold">SYSTEM</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#78819a] mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1b1e28]/40 text-[9px] font-mono">
                      <span className="text-[#78819a]">
                        {Object.values(p.signals).filter((s: any) => s.enabled).length} Enabled Signals
                      </span>
                      <span className={assignedCount > 0 ? "text-blue-400" : "text-[#78819a]"}>
                        {assignedCount === 0 ? 'No apps' : `${assignedCount} app${assignedCount > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOCK USAGE STATISTICS PANEL */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#78819a] uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Profile Usage (30D)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0d0e12] p-2.5 rounded border border-[#1b1e28]">
                <span className="text-[9px] text-[#78819a] block">Total Evaluations</span>
                <span className="text-sm font-extrabold text-white mt-1 block font-mono">
                  {metricsObj.total.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#0d0e12] p-2.5 rounded border border-[#1b1e28]">
                <span className="text-[9px] text-[#78819a] block">Pass Rate</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1 block font-mono">
                  {((metricsObj.passed / metricsObj.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-1.5 pt-1.5 border-t border-[#1b1e28] text-xs">
              <div className="flex justify-between">
                <span className="text-[#78819a]">Failed / Blocked</span>
                <span className="font-mono text-white text-[11px]">{metricsObj.failed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78819a]">Anomalous Risk Rate</span>
                <span className="font-mono text-red-400 text-[11px]">{metricsObj.risk}%</span>
              </div>
            </div>
          </div>

          {/* PROJECT ASSIGNMENT MATRIX */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#78819a] uppercase tracking-widest block">
              Assign to Sandbox Apps
            </span>
            {partnerApps.length === 0 ? (
              <p className="text-[10.5px] text-slate-500 italic">No apps registered. Create an app first in Project Settings.</p>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {partnerApps.map(app => {
                  const isAssigned = editMode 
                    ? assignProjectIds.includes(app.id)
                    : activeProfile.assignedProjectIds?.includes(app.id);
                  return (
                    <div 
                      key={app.id}
                      onClick={() => { if (editMode) handleToggleProjectAssignment(app.id); }}
                      className={`flex items-center justify-between p-2 rounded text-xs transition-all ${
                        isAssigned 
                          ? 'bg-blue-900/10 border border-blue-900/40 text-blue-300' 
                          : 'bg-[#0d0e12] border border-[#1b1e28] text-[#78819a]'
                      } ${editMode ? 'cursor-pointer hover:bg-[#111319]' : 'opacity-85 pointer-events-none'}`}
                    >
                      <span className="truncate font-medium">{app.name}</span>
                      {isAssigned && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {editMode && (
              <p className="text-[10px] text-[#78819a] leading-normal italic mt-1.5">
                Click apps above to bind them statefully to this profile. Saving will update routing targets.
              </p>
            )}
          </div>

        </div>

        {/* ===================== CENTRAL BUILDER AND PREVIEW (8 cols) ===================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PROFILE CONTROL PANEL HEADER CARD */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1b1e28] pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">{activeProfile.name}</h3>
                  <span className="text-[9px] font-mono text-zinc-500 bg-[#0d0e12] px-2 py-0.5 rounded">
                    ID: {activeProfile.id}
                  </span>
                </div>
                <p className="text-xs text-[#78819a] leading-relaxed max-w-xl">{activeProfile.description}</p>
              </div>

              {!editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDuplicateProfile}
                    className="flex items-center gap-1 text-xs bg-[#0d0e12] border border-[#1b1e28] hover:bg-[#111319] hover:text-white px-3 py-1.5 rounded cursor-pointer transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setTempProfile(JSON.parse(JSON.stringify(activeProfile)));
                      setAssignProjectIds(activeProfile.assignedProjectIds || []);
                    }}
                    className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure Signals</span>
                  </button>
                  {activeProfile.isCustom && (
                    <button
                      onClick={() => handleDeleteProfile(activeProfile.id)}
                      className="text-xs text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 cursor-pointer transition-all"
                      title="Delete Custom Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditMode(false); setTempProfile(null); }}
                    className="text-xs bg-[#0d0e12] border border-[#1b1e28] px-3 py-1.5 rounded cursor-pointer transition-all hover:bg-[#111319]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfileChanges}
                    disabled={!tempProfile}
                    className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded cursor-pointer transition-all shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Blueprint</span>
                  </button>
                </div>
              )}
            </div>

            {/* AUDIT WRITE REASON FIELD */}
            {editMode && (
              <div className="bg-[#0d0e12] p-4 border border-[#1b1e28] rounded-lg space-y-2 animate-fadeIn">
                <span className="text-[10px] font-mono text-[#78819a] font-bold uppercase tracking-wider block">
                  Mandatory Modification Audit Reason
                </span>
                <input
                  type="text"
                  placeholder="e.g., Minimizing compliance overhead by disabling browser metrics hashes, as requested by legal."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full bg-[#111319] border border-[#1b1e28] text-xs text-white px-3 py-2.5 rounded focus:outline-none placeholder-slate-600 font-mono"
                />
                <span className="text-[9px] text-[#78819a] block italic leading-normal">
                  Your team will see this audit log reason in compliance logs. Leaving blank defaults logging references.
                </span>
              </div>
            )}

            {/* ===================== DYNAMIC INTERACTIVE REQUEST BUILDER GRID ===================== */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#78819a] uppercase tracking-widest block">
                {editMode ? "INTERACTIVE SIGNAL BUILDER EDITOR" : "ACTIVE PROFILE SIGNALS MATRIX"}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {STATIC_SIGNALS.map(sig => {
                  // Get configuration either from temp (editing) or static profile
                  const config = editMode 
                    ? tempProfile?.signals[sig.id] || { enabled: false, required: false }
                    : activeProfile.signals[sig.id] || { enabled: false, required: false };
                  
                  const isSelectedForDocs = sig.id === selectedSignalId;

                  return (
                    <div
                      key={sig.id}
                      onClick={() => setSelectedSignalId(sig.id)}
                      className={`p-3 rounded-lg border flex flex-col justify-between transition-all cursor-pointer ${
                        isSelectedForDocs 
                          ? 'border-slate-500 bg-[#0d0e12]' 
                          : 'border-[#1b1e28] hover:border-slate-700 bg-slate-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">{sig.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 max-w-[200px] truncate block">
                            ${sig.id}
                          </span>
                        </div>

                        {/* Interactive toggle block */}
                        {editMode ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleSignalTemp(sig.id)}
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                                config.enabled 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-[#0d0e12] text-slate-500 hover:bg-[#111319]'
                              }`}
                            >
                              {config.enabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                            
                            <button
                              onClick={() => handleToggleRequiredTemp(sig.id)}
                              disabled={!config.enabled}
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all ${
                                !config.enabled 
                                  ? 'opacity-40 cursor-not-allowed bg-[#0d0e12] text-slate-600' 
                                  : config.required 
                                    ? 'bg-blue-600 text-white cursor-pointer' 
                                    : 'bg-[#0d0e12] text-slate-500 hover:bg-[#111319] cursor-pointer'
                              }`}
                            >
                              {config.required ? 'REQUIRED' : 'OPTIONAL'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {config.enabled ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                                <Check className="w-2.5 h-2.5" />
                                {config.required ? 'REQUIRED' : 'OPTIONAL'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-medium text-slate-600 bg-[#0d0e12] px-2 py-0.5 rounded pr-2.5">
                                IGNORED
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-[10.5px] text-[#78819a] mt-2.5 line-clamp-1 leading-normal italic">{sig.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC DOCUMENTATION OF SELECTED SIGNAL UNDER BULLET CHIPS */}
            <div className="bg-[#0d0e12] p-4 border border-[#1b1e28] rounded-xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] font-mono text-white font-bold uppercase tracking-wider">
                  Why We Use This: {activeSignal.name} (${activeSignal.id})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-[#78819a] block uppercase tracking-wider">Functional Purpose:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">{activeSignal.purpose}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78819a] block uppercase tracking-wider">Privacy-Preserving Footprint:</span>
                    <p className="text-[#78819a] leading-relaxed">{activeSignal.privacyImpact}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-[#78819a] block uppercase tracking-wider">Recommended Use Case:</span>
                    <p className="text-slate-300 leading-relaxed">{activeSignal.recommendedUse}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78819a] block uppercase tracking-wider">Enterprise Roadmap Guideline:</span>
                    <p className="text-blue-300 leading-relaxed font-mono">{activeSignal.enterpriseRec}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ===================== PLAYGROUND / API SCHEMAS PREVIEW ===================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* JSON Schema Previews */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-[#1b1e28] pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#78819a] font-bold font-mono">
                    <FileCode className="text-blue-404 w-4 h-4" />
                    DYNAMIC_PAYLOAD_BODY.JSON
                  </div>
                  <span className="text-[9px] text-[#78819a] font-bold font-mono uppercase">API BODY PREVIEW</span>
                </div>
                <pre className="p-2 bg-[#0d0e12] rounded text-[10.5px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-tight select-all">
                  {renderLivePayloadPreview()}
                </pre>
              </div>
              <div className="border-t border-[#1b1e28] pt-2 text-[9px] text-[#78819a] italic mt-3 font-mono">
                Only active signals in this profile are parsed by AAN's gateway router middleware.
              </div>
            </div>

            {/* CURL PREVIEWS */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-[#1b1e28] pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#78819a] font-bold font-mono">
                    <Terminal className="text-emerald-404 w-4 h-4" />
                    SECURED_EXPRESS_REQUEST.SH
                  </div>
                  <span className="text-[9px] text-[#78819a] font-bold font-mono uppercase">CURL SCRIPT PREVIEW</span>
                </div>
                <pre className="p-2 bg-[#0d0e12] rounded text-[10.5px] font-mono text-blue-300 overflow-x-auto max-h-56 whitespace-pre-wrap leading-normal select-all break-all">
                  {renderCurlPreview()}
                </pre>
              </div>
              <div className="border-t border-[#1b1e28] pt-2 text-[9px] text-[#78819a] mt-3 flex justify-between font-mono">
                <span>API VERSION: v1.2</span>
                <span className="text-emerald-500">MOCK_SANDBOX_STAGING</span>
              </div>
            </div>

          </div>

          {/* ===================== AUDIT LOG HISTORY OF THE INSTANCE ===================== */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#1b1e28] pb-2">
              <span className="text-[10px] font-mono font-bold text-[#78819a] uppercase tracking-widest flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                Profile Immutable Change Audit History
              </span>
              <span className="text-[9px] font-mono text-[#78819a] font-bold">MUTABILITY INDEX</span>
            </div>

            <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-[#78819a] italic py-2">No historical change logs recorded for profiles.</p>
              ) : (
                history
                  .filter(h => h.profileId === selectedProfileId)
                  .map(entry => (
                    <div key={entry.id} className="text-xs space-y-1 bg-[#0d0e12] p-2.5 rounded border border-[#1b1e28] leading-normal">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-mono text-zinc-400 font-bold">{entry.changedBy}</span>
                        <span className="text-[9.5px] font-mono text-[#78819a]">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 leading-relaxed font-sans">{entry.reason}</p>
                      
                      {/* Configuration Diff Preview if any */}
                      {Object.keys(entry.previousConfig || {}).length > 0 && (
                        <div className="pt-1.5 border-t border-[#1b1e28] text-[9.5px] font-mono text-[#78819a] space-y-0.5">
                          <span className="uppercase font-bold block text-[8px] text-zinc-600 mb-0.5">MODIFICATION DIFF FLAGS:</span>
                          {Object.keys(entry.newConfig).map(key => {
                            const prev = entry.previousConfig[key];
                            const curr = entry.newConfig[key];
                            const sigMeta = STATIC_SIGNALS.find(s => s.id === key);
                            const name = sigMeta ? sigMeta.name : key;
                            
                            if (prev?.enabled !== curr?.enabled || prev?.required !== curr?.required) {
                              return (
                                <div key={key} className="flex flex-wrap items-center gap-1">
                                  <span className="text-slate-400">{name}:</span>
                                  <span className="line-through text-red-500">
                                    [enabled: {prev?.enabled ? 'Y' : 'N'}, req: {prev?.required ? 'Y' : 'N'}]
                                  </span>
                                  <span className="text-zinc-600"></span>
                                  <span className="text-green-400 font-bold">
                                    [enabled: {curr?.enabled ? 'Y' : 'N'}, req: {curr?.required ? 'Y' : 'N'}]
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE NEW PROFILE MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#111319] border border-[#1b1e28] text-slate-300 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Create New Custom Profile
              </h3>
              <p className="text-xs text-[#78819a] leading-normal font-sans">
                Declare a brand new Trust Profile ruleset. This customized layout can be assigned dynamically to any registered project.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-[#78819a] uppercase font-bold mb-1.5">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gaming High Friction Profile"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] text-xs text-white p-2.5 rounded focus:outline-none placeholder-slate-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#78819a] uppercase font-bold mb-1.5">Description (SLA / Compliance Target)</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this profile is configured and where in the customer onboarding flow this checklist is enforced."
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] text-xs text-white p-2.5 rounded focus:outline-none placeholder-slate-600 resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs bg-[#0d0e12] hover:bg-[#111319] border border-[#1b1e28] text-[#78819a] px-4 py-2 rounded-lg cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
