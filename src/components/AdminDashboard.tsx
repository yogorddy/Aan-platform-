import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserCheck, Activity, Database, Check, AlertOctagon, Terminal, 
  Search, RefreshCw, XCircle, ShieldCheck, Heart, Trash2, Shield, Download,
  Sliders, Clock, BarChart3, HelpCircle, AlertTriangle, Play, Flame, UserPlus,
  Share2, ChevronRight, Settings, Info, Lock, BookOpen
} from 'lucide-react';
import { User, SignatureTemplate, Device, VerificationSession, AuditLog } from '@/src/types';
import { isAcademyEnabled } from '../academyConfig';

interface AdminDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
}

function mapTabToLesson(tab: string): string {
  const map: Record<string, string> = {
    analytics: "analytics",
    overrides: "removal_requests",
    users: "users",
    policies: "roles_permissions",
    timeline: "device_trust",
    devices: "device_trust",
    signatures: "duplicate_detection",
    audits: "audit_logs",
    "verification-logs": "verification_sessions"
  };
  return map[tab] || "intro";
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Database states
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [signatureTemplates, setSignatureTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enterprise specific custom state containers
  const [policies, setPolicies] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("usr_df990a31");
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [institutionalConsent, setInstitutionalConsent] = useState(false);

  // Defensive bypass & intrusion detection state
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [securityRisk, setSecurityRisk] = useState<{ score: number; level: string; signalsCount: any }>({
    score: 0,
    level: "normal",
    signalsCount: { failedTokens: 0, impossibleTransitions: 0, unauthorizedAccess: 0, apiKeyAbuse: 0, unusualIPActivity: 0, adminAnomalies: 0 }
  });
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  
  // Custom Policy Builder Form Space
  const [policyForm, setPolicyForm] = useState({
    name: "",
    conditions: "Device Trust < 35 && Automation Confidence > 90%",
    thenAction: "suspend" as 'suspend' | 'challenge' | 'flag' | 'merge_duplicates' | 'remove_fraud' | 'notify',
    description: ""
  });

  // Active view tab state (within Admin dashboard context)
  const [activeTab, setActiveTab] = useState<'analytics' | 'overrides' | 'users' | 'policies' | 'timeline' | 'devices' | 'signatures' | 'audits' | 'verification-logs' | 'security-alerts'>('analytics');

  // Filter params
  const [auditQuery, setAuditQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [sessionQuery, setSessionQuery] = useState("");
  const [sessionStatus, setSessionStatus] = useState<string>("all");
  const [downloadingExport, setDownloadingExport] = useState(false);

  // Securely export and download the audit log snapshot from backend
  const handleDownloadAuditSnapshot = async () => {
    setDownloadingExport(true);
    try {
      const response = await fetch('/api/internal/export-verification-audit');
      if (!response.ok) {
        throw new Error('Verification snapshot generation failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aan_verification_audit_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Refresh database states dynamically so the audit rail lists this download event
      fetchAdminState();
    } catch (err) {
      console.error("Failed exporting MVP audit snapshot:", err);
    } finally {
      setDownloadingExport(false);
    }
  };

  useEffect(() => {
    fetchAdminState();
  }, []);

  // Sync timelines when selected user undergoes change
  useEffect(() => {
    if (selectedUserId && activeTab === 'timeline') {
      fetchUserTimeline(selectedUserId);
    }
  }, [selectedUserId, activeTab]);

  const fetchUserTimeline = async (userId: string) => {
    try {
      const res = await fetch(`/api/internal/timeline/${userId}`);
      const data = await res.json();
      setTimeline(data);
    } catch (err) {
      console.error("Timeline loading mismatch", err);
    }
  };

  const fetchPoliciesAndTimelines = async () => {
    try {
      const polRes = await fetch('/api/internal/policies');
      const polData = await polRes.json();
      setPolicies(polData);
      
      if (selectedUserId) {
        fetchUserTimeline(selectedUserId);
      }
    } catch (err) {
      console.error("Fails matching rule datasets", err);
    }
  };

  const fetchAdminState = async () => {
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

      // 2. Fetch users with fallback
      let usersData;
      try {
        const usersRes = await fetch('/api/internal/users');
        usersData = await usersRes.json();
      } catch (e) {
        usersData = [
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
            human_uid: "human_hash_b710ef67",
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString()
          },
          {
            id: "usr_df990a31",
            status: "suspended",
            human_uid: "human_hash_b710ef67_sybil",
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 11.8 * 3600 * 1000).toISOString()
          }
        ];
      }
      setUsers(usersData);

      // 3. Fetch devices with fallback
      let devData;
      try {
        const devRes = await fetch('/api/internal/devices');
        devData = await devRes.json();
      } catch (e) {
        devData = [
          {
            id: "dev_1",
            user_id: "usr_9a48f2c0",
            device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv0...",
            platform: "macOS Chrome",
            attestation_status: "passed",
            risk_score: 10,
            last_seen_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: "dev_2",
            user_id: "usr_b710ef67",
            device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy1...",
            platform: "iOS Native App",
            attestation_status: "passed",
            risk_score: 5,
            last_seen_at: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ];
      }
      setDevices(devData);

      // 4. Fetch audit-logs with fallback
      let auditsData;
      try {
        const auditsRes = await fetch('/api/internal/audit-logs');
        auditsData = await auditsRes.json();
      } catch (e) {
        auditsData = [
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
      }
      setAuditLogs(auditsData);

      // 5. Fetch signatures with fallback
      let bioData;
      try {
        const bioRes = await fetch('/api/internal/signatures');
        bioData = await bioRes.json();
      } catch (e) {
        bioData = [
          {
            id: "tmpl_101",
            user_id: "usr_b710ef67",
            template_hash: "sig_hash_b710ef67",
            model_version: "ecc-secp256k1",
            confidence_score: 98.4,
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          },
          {
            id: "tmpl_102",
            user_id: "usr_df990a31",
            template_hash: "sig_hash_b710ef67",
            model_version: "ecc-secp256k1",
            confidence_score: 92.1,
            created_at: new Date(Date.now() - 11.95 * 3600 * 1000).toISOString()
          }
        ];
      }
      setSignatureTemplates(bioData);

      // 6. Fetch live security events with fallbacks
      let secEvents;
      try {
        const secRes = await fetch('/api/internal/security-events');
        secEvents = await secRes.json();
      } catch (e) {
        secEvents = [
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
            created_at: new Date(Date.now() - 3.5 * 3600 * 1005).toISOString()
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
            created_at: new Date(Date.now() - 2 * 3600 * 1005).toISOString()
          }
        ];
      }
      setSecurityEvents(secEvents);

      // 7. Fetch live security risk report with fallback
      let secRisk;
      try {
        const riskRes = await fetch('/api/internal/security-risk');
        secRisk = await riskRes.json();
      } catch (e) {
        secRisk = {
          score: 45,
          level: "suspicious",
          signalsCount: { failedTokens: 1, impossibleTransitions: 1, unauthorizedAccess: 0, apiKeyAbuse: 0, unusualIPActivity: 0, adminAnomalies: 0 }
        };
      }
      setSecurityRisk(secRisk);

      await fetchPoliciesAndTimelines();
    } catch (err) {
      console.warn("Gracefully unresolved admin sync status: using client verification repository", err);
    } finally {
      setLoading(false);
    }
  };

  // Perform administrator override overrides on pending/review sessions statefully
  const triggerSessionAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/internal/sessions/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh everything statefully
        fetchAdminState();
      }
    } catch (err) {
      console.error("Action override fail", err);
    }
  };

  // Perform administrator user suspension override statefully
  const triggerUserAction = async (id: string, action: 'suspend' | 'verify') => {
    try {
      const res = await fetch(`/api/internal/users/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminState();
      }
    } catch (err) {
      console.error("User override fail", err);
    }
  };

  const handleResolveEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/internal/security-events/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: resolutionNotes })
      });
      const data = await res.json();
      if (data.success) {
        setResolvingEventId(null);
        setResolutionNotes("");
        fetchAdminState();
      }
    } catch (err) {
      console.error("Failed to resolve security event:", err);
    }
  };

  const handleResetSecurityEvents = async () => {
    if (!window.confirm("Are you sure you want to restore simulated security mock event telemetry?")) return;
    try {
      const res = await fetch(`/api/internal/security-events/clear`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAdminState();
      }
    } catch (err) {
      console.error("Failed to clear security events:", err);
    }
  };

  // Create an Enterprise security policy dynamically
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.name || !policyForm.conditions) return;

    try {
      const res = await fetch('/api/internal/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowPolicyModal(false);
        setPolicyForm({
          name: "",
          conditions: "Device Trust < 35 && Automation Confidence > 90%",
          thenAction: "suspend",
          description: ""
        });
        await fetchAdminState();
      }
    } catch (err) {
      console.error("Failed creating rule", err);
    }
  };

  // Toggle active/inactive states of policies
  const handleTogglePolicy = async (policyId: string) => {
    try {
      const res = await fetch(`/api/internal/policies/${policyId}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchAdminState();
      }
    } catch (err) {
      console.error("Policy toggle fail", err);
    }
  };

  // Delete policy rule completely
  const handleDeletePolicy = async (policyId: string) => {
    if (!window.confirm("Confirm delete this enterprise policy rule?")) return;
    try {
      const res = await fetch(`/api/internal/policies/${policyId}/delete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchAdminState();
      }
    } catch (err) {
      console.error("Policy delete fail", err);
    }
  };

  // Trigger custom stateful account challenge or suspension
  const handleAccountAction = async (userId: string, actionType: 'challenge' | 'suspend' | 'disable') => {
    try {
      const res = await fetch(`/api/v1/account/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          session_id: "vss_manual_admin_event",
          reason: "Manual Administrator intervention."
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Account successfully updated: ${actionType.toUpperCase()}`);
        await fetchAdminState();
      }
    } catch (err) {
      console.error("Account action trigger fail", err);
    }
  };

  // Trigger Policy Enforce statefully on a user profile
  const handleEnforcePolicyOnUser = async (policyId: string, userId: string) => {
    try {
      const res = await fetch(`/api/v1/policy/enforce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: policyId,
          user_id: userId,
          session_id: "vss_manual_enforcement"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Policy Rule '${data.enforced_policy}' executed: [${data.remediation_action.toUpperCase()}] - ${data.status_outcome}`);
        await fetchAdminState();
      }
    } catch (err) {
      console.error("Policy enforce mismatch", err);
    }
  };

  // Deletes Unwanted / Fraudulent profiles completely upon Institutional approval!
  const handleCompletePurgeProfile = async (userId: string) => {
    if (!institutionalConsent) {
      alert("Institutional Security Consent is strictly required. Please check the clearance checkmark before purging user records.");
      return;
    }

    const confirmPurge = window.confirm(
      ` DANGER - IRREVERSIBLE CRIME ANALYSIS PURGE:\n\n` +
      `This action will permanently delete User ${userId} from the directory. All zero-knowledge signature hashes, physical device signatures, and developer platform linking histories will be completely purged from AAN. Under no circumstance can this dataset be incepted again.\n\n` +
      `Proceed with absolute deletion?`
    );

    if (!confirmPurge) return;

    try {
      const res = await fetch('/api/v1/account/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          approved_by_institution: true
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`SUCCEEDED: Profile ${userId} has been completely deleted and purged from all AAN system directories.`);
        setInstitutionalConsent(false);
        // If the purged user was currently chosen, shift selected user
        if (selectedUserId === userId) {
          setSelectedUserId("");
        }
        await fetchAdminState();
      } else {
        alert(`Fail: ${data.error}`);
      }
    } catch (err) {
      console.error("Hard purge fail", err);
    }
  };

  // Filter lists helper
  const filteredAudits = auditLogs.filter(log => {
    return log.action.toLowerCase().includes(auditQuery.toLowerCase()) || 
           log.actor_id.toLowerCase().includes(auditQuery.toLowerCase()) ||
           log.target_type.toLowerCase().includes(auditQuery.toLowerCase());
  });

  const filteredUsers = users.filter(user => {
    return user.id.toLowerCase().includes(userQuery.toLowerCase()) || 
           user.human_uid.toLowerCase().includes(userQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0d0e12] font-sans text-[#e3e5eb] selection:bg-[#202533]">
      
      {/* Dashboard Top Header Bar */}
      <header className="bg-[#111319] border-b border-[#1b1e28] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#171a23] text-emerald-400 p-2 rounded border border-[#232a3b]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Administrative Compliance Console</h1>
            <p className="text-[10px] text-[#5d6780] font-mono uppercase font-black">Internal Secure System Directory Overview</p>
          </div>
        </div>

        <div className="flex gap-4 items-center select-none">
          {isAcademyEnabled() && (
            <>
              <button 
                onClick={() => onNavigate('academy', undefined, mapTabToLesson(activeTab))} 
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white transition-all bg-[#171a23] hover:bg-[#1f2431] px-3 py-1.5 rounded border border-[#232a3b] cursor-pointer font-bold font-mono uppercase tracking-wider blink-subtle"
                title="Open contextual explanation for this feature inside the learning Academy"
              >
                <BookOpen className="w-3.5 h-3.5 animate-none" />
                <span>Explain This View</span>
              </button>
              <span className="text-[#1b1e28] font-mono text-xs">|</span>
            </>
          )}
          <button 
            onClick={() => onNavigate('landing')} 
            className="text-xs text-[#78819a] hover:text-white transition-colors cursor-pointer"
          >
             Public Portal
          </button>
          <span className="text-[#1b1e28] font-mono text-xs">|</span>
          <button 
            onClick={() => onNavigate('partner')} 
            className="text-xs text-[#78819a] hover:text-white transition-colors font-mono hover:underline cursor-pointer"
          >
            Partner Portal 
          </button>
        </div>
      </header>

      {/* Primary Dashboard Grid with Side-Sub Navigation tab links */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left mini Sidebar links */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden p-4">
            <span className="font-mono text-[9px] text-[#5d6780] font-extrabold block uppercase tracking-wider mb-3">Auditing Directories</span>
            
            <div className="flex flex-col gap-1.5 font-sans text-xs">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Trust Dashboard
              </button>

              <button
                onClick={() => setActiveTab('verification-logs')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'verification-logs' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                Verification Logs
              </button>

              <button
                onClick={() => setActiveTab('overrides')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'overrides' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Identity Overrides
                {sessions.filter(s => s.status === 'review').length > 0 && (
                  <span className="ml-auto bg-yellow-500 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                    {sessions.filter(s => s.status === 'review').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'users' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                User Registries
              </button>

              <button
                onClick={() => setActiveTab('policies')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'policies' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Sliders className="w-4 h-4 text-indigo-400" />
                Enterprise Policies
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'timeline' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                Account Timelines
              </button>

              <button
                onClick={() => setActiveTab('devices')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'devices' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Database className="w-4 h-4" />
                Hardware keys & Devices
              </button>

              <button
                onClick={() => setActiveTab('signatures')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'signatures' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Activity className="w-4 h-4" />
                Signature Verification Indexes
              </button>

              <button
                onClick={() => setActiveTab('audits')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'audits' ? 'bg-[#171a23] text-white border-l-2 border-blue-600 font-bold font-semibold' : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <Terminal className="w-4 h-4" />
                System Audit Rails
              </button>

              <button
                onClick={() => setActiveTab('security-alerts')}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer relative ${
                  activeTab === 'security-alerts'
                    ? 'bg-rose-950/80 border border-rose-800 text-rose-200 font-semibold'
                    : 'hover:bg-[#171a23]/40 text-[#78819a] hover:text-[#e3e5eb]'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 ${securityEvents.some((e: any) => !e.raw_metadata?.resolved && e.severity === 'critical') ? 'text-red-500 animate-bounce' : 'text-rose-500'}`} />
                <span>Intrusion & Bypass Alerts</span>
                {securityEvents.filter((e: any) => !e.raw_metadata?.resolved).length > 0 && (
                  <span className="ml-[1px] bg-red-650 bg-red-600 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full leading-none shrink-0">
                    {securityEvents.filter((e: any) => !e.raw_metadata?.resolved).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] p-4 rounded-xl text-xs space-y-2">
            <span className="font-mono text-[9px] text-[#5d6780] font-bold uppercase block">SECURITY STANDARDS MET</span>
            <div className="flex items-center gap-1.5 text-[#78819a] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              AES-GCM Encryption Enabled
            </div>
            <div className="flex items-center gap-1.5 text-[#78819a] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SHA-256 API Key hashing
            </div>
            <div className="flex items-center gap-1.5 text-[#78819a] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RSA-2048 Device signatures
            </div>
          </div>
        </div>

        {/* Right Tab Content Block */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Global MVP Mock Disclaimer */}
          <div className="bg-[#1a1412] border border-amber-900/30 rounded-lg p-4 text-xs text-[#d2ab6c] leading-relaxed font-sans flex gap-3">
            <span className="text-[#d2ab6c] font-bold shrink-0 text-xs">⚠️ SANDBOX ADVISORY:</span>
            <div>
              <p className="font-semibold mb-0.5">MOCK ATTESTATION PREVIEW — Administrative Sandbox Mode</p>
              <p className="text-[#78819a]">
                AAN Admin console displays simulated metrics and mock identity records for MVP purposes. Legal compliance, certified security registries, or absolute threat protection are not active or claimed.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#78819a] text-xs bg-[#111319] border border-[#1b1e28] rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
              Syncing compliance server registry datasets...
            </div>
          ) : (
            <>
              {/* Tab: Analytics & Trust Dashboard */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Top KPIs Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">PLATFORM TRUST SCORE</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white font-mono">98.2%</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ +0.4%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.2%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">DAILY TRUST EVALUATIONS</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white font-mono">1,420</span>
                        <span className="text-[10px] text-blue-400 font-mono font-bold">▲ +12%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">DUPLICATES PREVENTED</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white font-mono">412</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Verified</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">FRAUD ATTEMPTS BLOCKED</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-red-400 font-mono">219</span>
                        <span className="text-[10px] text-red-400 font-mono font-bold">High Risk</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Policy and Threat Analytics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Automation Attempts Thwarted</span>
                        <p className="text-2xl font-bold font-mono text-white">725</p>
                      </div>
                      <div className="bg-purple-950 p-2.5 rounded-lg border border-purple-900 text-purple-400">
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Automated Policy Executions</span>
                        <p className="text-2xl font-bold font-mono text-white">158</p>
                      </div>
                      <div className="bg-indigo-950 p-2.5 rounded-lg border border-indigo-900 text-indigo-400">
                        <Sliders className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Active Account Challenges</span>
                        <p className="text-2xl font-bold font-mono text-white">88</p>
                      </div>
                      <div className="bg-yellow-950/60 p-2.5 rounded-lg border border-yellow-900/60 text-yellow-400">
                        <Clock className="w-5 h-5 hover:rotate-12 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Primary Visual Analytics Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Session Risk Distribution (Pure CSS Custom Chart) */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-white text-sans">Session Risk Distribution Assertion</h4>
                        <p className="text-[10px] text-slate-400">Aggregate telemetry across global authentication gateways.</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-emerald-400 font-medium">Low Risk (0 - 15) — Safe Households</span>
                            <span className="text-slate-300">88.5% (1,257 sessions)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded" style={{ width: '88.5%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-yellow-400 font-medium">Medium Risk (16 - 60) — Challenge Gateways</span>
                            <span className="text-slate-300">8.4% (119 sessions)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded" style={{ width: '8.4%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-red-400 font-medium">High Risk (61 - 100) — System Lockout</span>
                            <span className="text-slate-300">3.1% (44 sessions)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded overflow-hidden">
                            <div className="bg-red-500 h-full rounded" style={{ width: '3.1%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg text-[10px] text-slate-400 font-mono">
                         <strong className="text-slate-300">Enforcement Strategy:</strong> Dynamic challenges and profile automations reduce friction on 88% of requests while keeping bad actors off our servers entirely.
                      </div>
                    </div>

                    {/* Device Reputation Trends */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-white text-sans">Device Reputation Index Trends</h4>
                        <p className="text-[10px] text-slate-400">Chronological telemetry indicating virtual environments & emulation risk patterns.</p>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 h-32 items-end pt-3 text-center">
                        {[
                          { val: '30%', label: 'Mon' },
                          { val: '45%', label: 'Tue' },
                          { val: '15%', label: 'Wed' },
                          { val: '75%', label: 'Thu' },
                          { val: '20%', label: 'Fri' },
                          { val: '10%', label: 'Sat' },
                          { val: '92%', label: 'Sun' }
                        ].map((day, dIdx) => (
                          <div key={dIdx} className="h-full flex flex-col justify-end items-center group relative cursor-pointer">
                            <div className="text-[8px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 absolute -top-4 transition-all">{day.val}</div>
                            <div className="w-full bg-slate-950 rounded h-full relative overflow-hidden flex flex-col justify-end">
                              <div className="bg-sky-500/80 rounded group-hover:bg-sky-400 transition-all pointer-events-none" style={{ height: day.val }}></div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 block mt-1.5">{day.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Threat Matrix Index: <strong className="text-amber-400">HEURISTIC ACTIVE</strong></span>
                        <span>Updated: Real-time via Web Hooks</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs Export and Documentation */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-1 max-w-xl">
                      <h4 className="text-sm font-bold text-white">Immutable Administrative Export</h4>
                      <p className="text-xs text-slate-400">Download cryptographically hashed, signed verification histories and audit ledgers in standard JSON schemas for direct integration alongside enterprise SIEM products (Splunk, Datadog).</p>
                    </div>

                    <a 
                      href="/api/internal/export-audit" 
                      download
                      className="bg-slate-950 hover:bg-slate-850 text-white border border-slate-800 text-xs px-4 py-2.5 rounded-lg font-mono transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      EXPORT_AUDIT_LOG_SCHEMAS.JSON
                    </a>
                  </div>
                </div>
              )}

              {/* Tab: Enterprise Policy Engine */}
              {activeTab === 'policies' && (
                <div className="space-y-6">
                  {/* Policy Explainer Banner */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600/10 text-blue-400 border border-blue-900/30 font-mono text-[9px] uppercase px-2 py-0.5 rounded">CONTROLS</span>
                        <h3 className="font-bold text-white text-base">Administrative Decision Engine</h3>
                      </div>
                      <p className="text-xs text-slate-350 max-w-2xl leading-relaxed">
                        AAN implements a flexible, policy-driven security system. Organizations define custom, no-code logic evaluating continuous metadata signals (device repute, template duplicates, network proxies) to automatically trigger customer-approved suspensions, challenges, or hard profile database purges, maintaining 100% compliance transparency.
                      </p>
                      
                      <div className="pt-2">
                        <button 
                          onClick={() => setShowPolicyModal(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          Configure Custom Rule
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Policy Dialog/Modal */}
                  {showPolicyModal && (
                    <div className="bg-slate-900 border-2 border-blue-600 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h4 className="font-bold text-white text-sm">Create Control Policy Rule</h4>
                        <button 
                          onClick={() => setShowPolicyModal(false)}
                          className="text-slate-400 hover:text-white font-bold cursor-pointer"
                        >
                          
                        </button>
                      </div>

                      <form onSubmit={handleCreatePolicy} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-slate-400 block font-bold">Policy Rule Name Description</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Bot Farm Signup Remediation"
                            value={policyForm.name}
                            onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded focus:outline-none focus:border-blue-600 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-slate-400 block font-bold">Policy Remediation Action</label>
                          <select 
                            value={policyForm.thenAction}
                            onChange={(e: any) => setPolicyForm({ ...policyForm, thenAction: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded focus:outline-none text-slate-300"
                          >
                            <option value="suspend">Suspend Credentials</option>
                            <option value="challenge">Force Session Challenge</option>
                            <option value="flag">Generate Security Flag</option>
                            <option value="remove_fraud">Purge Fraud Profile COMPLETELY</option>
                            <option value="merge_duplicates">Auto-Merge Duplicates</option>
                          </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] uppercase text-slate-400 block font-bold">Active Evaluation Query (No-Code Boolean)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Device Trust < 30 && Automation Likelihood > 90%"
                            value={policyForm.conditions}
                            onChange={(e) => setPolicyForm({ ...policyForm, conditions: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded focus:outline-none text-blue-400"
                            required
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] uppercase text-slate-400 block font-bold">Security Team Explanatory Summary Note</label>
                          <textarea 
                            rows={2}
                            placeholder="e.g. Automatically clean database profiles which bypass typical browser signatures..."
                            value={policyForm.description}
                            onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded focus:outline-none text-slate-300"
                          />
                        </div>

                        <div className="md:col-span-2 pt-2 flex justify-end gap-3">
                          <button 
                            type="button" 
                            onClick={() => setShowPolicyModal(false)}
                            className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded text-slate-400 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded text-white font-medium transition cursor-pointer"
                          >
                            Deploy Engine Policy
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Policies Config Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((p) => {
                      const isRemoveAction = p.thenAction === 'remove_fraud';
                      return (
                        <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="font-bold text-white text-sm select-all">{p.name}</h4>
                              <span className={`inline-block font-mono text-[8px] px-2 py-0.5 rounded border uppercase ${
                                p.active 
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900' 
                                  : 'bg-slate-950 text-slate-500 border-slate-800'
                              }`}>
                                {p.active ? "ACTIVE POLICY" : "DISABLED"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{p.description}</p>
                          </div>

                          <div className="bg-slate-950 border border-slate-850/60 p-3 rounded font-mono text-xs text-sky-400 whitespace-pre-wrap select-all">
                            <span className="text-slate-500 select-none text-[10px] block uppercase font-bold mb-1">IF CONDITIONS MATCH</span>
                            {p.conditions}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase text-slate-500">ENFORCEMENT:</span>
                              <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                                isRemoveAction 
                                  ? 'bg-red-950 text-red-400 border border-red-900/40' 
                                  : 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                              }`}>
                                {p.thenAction === 'remove_fraud' ? 'PURGE PROFILE' : p.thenAction.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <button 
                                onClick={() => handleTogglePolicy(p.id)}
                                className="text-[10px] text-slate-400 hover:text-white border border-slate-800 px-2 py-1 rounded hover:bg-slate-950/40 transition cursor-pointer"
                              >
                                {p.active ? "Deactivate" : "Activate"}
                              </button>
                              <button 
                                onClick={() => handleDeletePolicy(p.id)}
                                className="text-[10px] text-red-500 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2 py-1 rounded transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: Continuous Account Trust Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-850 pb-4">
                      <div>
                        <h3 className="font-bold text-white text-base">Account Trust Timelines</h3>
                        <p className="text-xs text-slate-400 font-sans">Query and browse complete interactive decision trails on any user profile.</p>
                      </div>

                      {/* Dropdown Selector to change active audited account profile */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold whitespace-nowrap">Choose Profile ID</label>
                        <select 
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="bg-slate-950 border border-slate-800 px-3 py-2 rounded text-xs select-all text-blue-400 font-mono focus:outline-none"
                        >
                          <option value="">-- Choose User ID --</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{`${u.id} (${u.status})`}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!selectedUserId ? (
                      <div className="text-center py-10 text-slate-500 font-mono text-xs">
                         NO PROFILE ID SELECTED. SELECT AN ACTIVE ACCOUNT FROM THE DROPDOWN LIST ABOVE.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Summary & Enforcement Command Controls */}
                        <div className="lg:col-span-1 space-y-5 bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Selected Record Node</span>
                              <h4 className="font-mono text-xs select-all font-bold text-white">{selectedUserId}</h4>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Primary Database Directory Attributes</span>
                              <div className="space-y-1.5 text-[11px] font-mono text-slate-350">
                                <div className="flex justify-between">
                                  <span>Node Status:</span>
                                  <span className={`font-bold ${
                                    users.find(u => u.id === selectedUserId)?.status === "verified" 
                                      ? "text-emerald-400" 
                                      : users.find(u => u.id === selectedUserId)?.status === "suspended" 
                                        ? "text-yellow-400" 
                                        : "text-red-400"
                                  }`}>
                                    {users.find(u => u.id === selectedUserId)?.status.toUpperCase() || "DELETED / NOT_FOUND"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Human Integrity SHA:</span>
                                  <span className="text-slate-450 text-[9px] truncate max-w-[120px]" title={users.find(u => u.id === selectedUserId)?.human_uid}>
                                    {users.find(u => u.id === selectedUserId)?.human_uid || "NONE_LINKED"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Inception (UTC):</span>
                                  <span className="text-slate-400 text-[10px]">
                                    {users.find(u => u.id === selectedUserId)?.created_at 
                                      ? new Date(users.find(u => u.id === selectedUserId)!.created_at).toISOString().substring(11, 19)
                                      : "N/A"
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">MANUAL ENFORCEMENT OVERRIDES</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                <button 
                                  onClick={() => handleAccountAction(selectedUserId, 'challenge')}
                                  className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-2 py-1.5 rounded text-left transition cursor-pointer"
                                >
                                   Challenge Session
                                </button>
                                <button 
                                  onClick={() => handleAccountAction(selectedUserId, 'suspend')}
                                  className="bg-slate-900 border border-slate-800 text-yellow-500 hover:text-yellow-400 px-2 py-1.5 rounded text-left transition cursor-pointer"
                                >
                                   Suspend User
                                </button>
                                <button 
                                  onClick={() => handleAccountAction(selectedUserId, 'disable')}
                                  className="col-span-2 bg-slate-900 border border-slate-800 text-red-500 hover:text-red-400 px-2 py-1.5 rounded text-left transition cursor-pointer"
                                >
                                   Lock/Disable Profile
                                </button>
                              </div>
                            </div>

                            {/* State-Connected Policy Execution Panel */}
                            <div className="space-y-2 pt-2 border-t border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">RUN ACTIVE SECURITY POLICY</span>
                              <div className="space-y-1.5">
                                <select 
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleEnforcePolicyOnUser(e.target.value, selectedUserId);
                                      e.target.value = ""; // reset
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-[10px] font-mono focus:outline-none"
                                >
                                  <option value="">-- Apply Policy Action --</option>
                                  {policies.filter(p => p.active).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                                <p className="text-[9px] text-slate-550 italic leading-snug">Runs the policy daemon statefully, modifying directory records instantly.</p>
                              </div>
                            </div>
                          </div>

                          {/* HARD PROFILE PURGE/DELETE ACTION ZONE */}
                          <div className="pt-3 border-t border-red-950/40 space-y-2">
                            <span className="text-[9px] font-mono text-red-400 uppercase block font-bold">INSTITUTION-APPROVED DELETION</span>
                            
                            <div className="bg-red-950/15 border border-red-900/30 p-3 rounded-lg space-y-3">
                              <label className="flex items-start gap-2 text-[10px] text-slate-350 select-none cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={institutionalConsent}
                                  onChange={(e) => setInstitutionalConsent(e.target.checked)}
                                  className="mt-0.5 rounded accent-red-600 bg-slate-950 border-slate-800"
                                />
                                <span className="leading-relaxed font-sans">
                                  <strong>Confirm Institutional Clearance</strong> to completely erase and purge all profile structures permanently.
                                </span>
                              </label>

                              <button 
                                onClick={() => handleCompletePurgeProfile(selectedUserId)}
                                disabled={!institutionalConsent}
                                className={`w-full py-2 rounded text-[10px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  institutionalConsent 
                                    ? 'bg-red-600 hover:bg-red-500 text-white font-black' 
                                    : 'bg-slate-900 border border-slate-800 text-slate-550 select-none cursor-not-allowed'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                PURGE PROFILE FROM DB
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Middle/Right: Interactive Chronological Timeline Feed */}
                        <div className="lg:col-span-2 space-y-4">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Chronological Decision Ledger</span>
                          
                          {timeline.length === 0 ? (
                            <div className="p-8 text-center text-[11px] font-mono text-slate-550 bg-slate-950 border border-slate-850 rounded-xl">
                               No history timeline entries registered for user {selectedUserId}. Actions trigger real-time updates.
                            </div>
                          ) : (
                            <div className="relative border-l-2 border-slate-850 pl-5 ml-2.5 space-y-5 py-2">
                              {timeline.map((entry) => {
                                const isFlagEvent = entry.event.toLowerCase().includes('duplicate') || entry.event.toLowerCase().includes('fail') || entry.event.toLowerCase().includes('suspend') || entry.event.toLowerCase().includes('purge');
                                return (
                                  <div key={entry.id} className="relative group">
                                    {/* timeline bullet dot */}
                                    <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 ${
                                      isFlagEvent 
                                        ? 'bg-red-500 border-red-950' 
                                        : 'bg-emerald-500 border-emerald-950'
                                    }`}></div>

                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs font-bold text-white font-sans">{entry.event}</span>
                                          {entry.session_id && (
                                            <span className="text-[8px] font-mono text-slate-400 bg-slate-950 border border-slate-850 px-1 rounded block mt-0.5">
                                              {entry.session_id}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono font-medium">{new Date(entry.timestamp).toISOString().substring(0, 19).replace('T', ' ')}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{entry.description}</p>
                                      
                                      {entry.trustScoreChange && (
                                        <div className="flex items-center gap-1 font-mono text-[9px] mt-1">
                                          <span className="text-slate-500 uppercase">Impact Assessment:</span>
                                          <span className={`font-bold ${
                                            entry.trustScoreChange.includes('+') 
                                              ? 'text-emerald-400' 
                                              : entry.trustScoreChange.includes('-') || entry.trustScoreChange.toLowerCase().includes('purge') || entry.trustScoreChange.toLowerCase().includes('suspend')
                                                ? 'text-red-400' 
                                                : 'text-sky-400'
                                          }`}>
                                            {entry.trustScoreChange}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Real-Time Verification Logs & Audit Exports */}
              {activeTab === 'verification-logs' && (
                <div className="space-y-6">
                  {/* Top Stats Cards within log tab */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-black block">Total Volume</span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">{sessions.length}</span>
                      <span className="text-[10px] text-slate-400">Total sessions logged</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] font-mono text-emerald-500 uppercase font-black block">Verified (Passed)</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                        {sessions.filter(s => s.status === 'passed').length}
                      </span>
                      <span className="text-[10px] text-slate-400">Low risk / unique human resolved</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] font-mono text-yellow-500 uppercase font-black block">Pending Review</span>
                      <span className="text-xl font-bold font-mono text-yellow-400 mt-1 block">
                        {sessions.filter(s => s.status === 'review').length}
                      </span>
                      <span className="text-[10px] text-slate-400">Flagged anomaly queue</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] font-mono text-red-500 uppercase font-black block">Failed (Rejected)</span>
                      <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
                        {sessions.filter(s => s.status === 'failed').length}
                      </span>
                      <span className="text-[10px] text-slate-400">High-risk threats blocked</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-sm">Enterprise Verification Session Ledger</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Secure ledger of unique trust validations, trust score outcomes, and platform claims.</p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={handleDownloadAuditSnapshot}
                          disabled={downloadingExport}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-450 text-white font-mono text-[11px] font-bold px-4 py-2 rounded flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingExport ? 'animate-bounce' : ''}`} />
                          {downloadingExport ? 'Redacting & Exporting...' : 'Download Audit Snapshot'}
                        </button>
                        <button onClick={fetchAdminState} className="bg-slate-950 p-2 border border-slate-800 rounded text-slate-400 hover:text-white">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative w-full sm:w-72">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search Session ID or User ID..."
                          value={sessionQuery}
                          onChange={(e) => setSessionQuery(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white font-mono w-full focus:outline-none focus:border-slate-700"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className="text-[10px] text-slate-500 font-mono">STATUS FILTER:</span>
                        <select
                          value={sessionStatus}
                          onChange={(e) => setSessionStatus(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs px-2.5 py-1.5 rounded focus:outline-none"
                        >
                          <option value="all">ALL STATUSES</option>
                          <option value="passed">VERIFIED (PASSED)</option>
                          <option value="failed">FAILED (REJECTED)</option>
                          <option value="review">PENDING REVIEW (REVIEW)</option>
                          <option value="started">INITIATED (STARTED)</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                          <tr>
                            <th className="py-3 px-6">Session ID</th>
                            <th className="py-3 px-4">Partner User ID</th>
                            <th className="py-3 px-4">Human & Uniqueness Status</th>
                            <th className="py-3 px-4">Risk Level & Score</th>
                            <th className="py-3 px-4">Proof Token Hash Digest</th>
                            <th className="py-3 px-6 text-right">Created At (UTC)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {sessions
                            .filter(s => {
                              const matchSearch = 
                                s.id.toLowerCase().includes(sessionQuery.toLowerCase()) ||
                                s.external_user_id.toLowerCase().includes(sessionQuery.toLowerCase());
                              const matchStatus = sessionStatus === 'all' || s.status === sessionStatus;
                              return matchSearch && matchStatus;
                            })
                            .map((session) => {
                              // Risk level mapping
                              let riskColor = 'text-emerald-400 bg-emerald-950/45 border-emerald-900/40';
                              let riskText = 'Low Risk';
                              if (session.risk_score >= 85) {
                                riskColor = 'text-red-500 bg-red-950/45 border-red-950/40 font-bold';
                                riskText = 'Critical Risk';
                              } else if (session.risk_score >= 70) {
                                riskColor = 'text-red-400 bg-red-950/30 border-red-900/40 font-bold';
                                riskText = 'High Risk';
                              } else if (session.risk_score >= 35) {
                                riskColor = 'text-yellow-500 bg-yellow-950/30 border-yellow-905/40';
                                riskText = 'Medium Risk';
                              }

                              const tokenSnippet = session.proof_token && session.proof_token.length > 15
                                ? `${session.proof_token.substring(0, 10)}...${session.proof_token.substring(session.proof_token.length - 10)}`
                                : 'not_generated';

                              return (
                                <tr key={session.id} className="hover:bg-slate-950/10 font-mono">
                                  <td className="py-3.5 px-6 font-bold text-blue-400">{session.id}</td>
                                  <td className="py-3.5 px-4">
                                    <span className="text-slate-200">{session.external_user_id}</span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                                        session.status === 'passed' 
                                          ? 'bg-emerald-950/45 text-emerald-400 border-emerald-900/40' 
                                          : session.status === 'failed' 
                                            ? 'bg-red-950/45 text-red-500 border-red-900/40' 
                                            : 'bg-yellow-950/45 text-yellow-500 border-yellow-900/40'
                                      }`}>
                                        {session.status}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {session.status === 'passed' 
                                          ? (session.duplicate_candidate ? 'duplicate' : 'unique') 
                                          : 'unchecked'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${riskColor}`}>
                                        {riskText}
                                      </span>
                                      <span className="text-slate-400 font-bold">{session.risk_score}/100</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-550 text-[10px] select-all">
                                    <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-850">
                                      {tokenSnippet}
                                    </code>
                                  </td>
                                  <td className="py-3.5 px-6 text-right text-slate-500">{new Date(session.created_at).toISOString().substring(0, 19).replace('T', ' ')}</td>
                                </tr>
                              );
                            })}
                          {sessions.filter(s => {
                            const matchSearch = 
                              s.id.toLowerCase().includes(sessionQuery.toLowerCase()) ||
                              s.external_user_id.toLowerCase().includes(sessionQuery.toLowerCase());
                            const matchStatus = sessionStatus === 'all' || s.status === sessionStatus;
                            return matchSearch && matchStatus;
                          }).length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-500">
                                No matching verification logs found for filter combination "{sessionStatus}" and search term.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1: Manual Session Overrides for exceptions */}
              {activeTab === 'overrides' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Identity Auditing & Session Overrides</h3>
                      <p className="text-[10px] text-slate-400">Review high uncertainty anomaly sessions flagged for manual verification overrides.</p>
                    </div>
                    <button onClick={fetchAdminState} className="bg-slate-950 p-2 border border-slate-800 rounded text-slate-400 hover:text-white">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {sessions.filter(s => s.status === 'review' || s.status === 'failed').length === 0 ? (
                      <div className="text-center p-8 text-xs text-slate-500">
                        No active anomalies or pending session reviews reported in this interval. All processes verified smooth.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessions.filter(s => s.status === 'review' || s.status === 'failed').map((session) => (
                          <div key={session.id} className="bg-slate-950 border border-slate-850 p-5 rounded-lg space-y-4 flex flex-col justify-between md:flex-row md:items-center">
                            <div className="space-y-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-blue-400 font-bold">{session.id}</span>
                                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                  session.status === 'review' ? 'bg-yellow-950/45 text-yellow-500 border border-yellow-900/40' : 'bg-red-950/45 text-red-500 border border-red-900/40'
                                }`}>
                                  {session.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-305 font-mono">
                                <b>Linked External User ID:</b> <code>{session.external_user_id}</code>
                              </div>
                              <div className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                                <b>Anomaly Logs:</b> {session.result_reason}
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {session.risk_reasons.map((reason, idx) => (
                                  <span key={idx} className="bg-red-950/40 border border-red-900/40 text-red-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    {((reason) || '').toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2.5 items-center pt-4 md:pt-0">
                              <div className="text-right pr-2">
                                <span className="text-[9px] text-slate-500 font-mono block">ANOMALY GRADE</span>
                                <span className={`text-base font-bold font-mono ${session.risk_score >= 70 ? 'text-red-400' : 'text-yellow-500'}`}>{session.risk_score} / 100</span>
                              </div>
                              <button
                                onClick={() => triggerSessionAction(session.id, 'approve')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold px-3 py-2 rounded flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => triggerSessionAction(session.id, 'reject')}
                                className="bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white font-mono text-[10px] font-bold px-3 py-2 rounded flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: User lists and suspension toggles */}
              {activeTab === 'users' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">AuraProof Cryptographic User Directory</h3>
                      <p className="text-[10px] text-slate-400">Review zero-knowledge user hashes and physical status records safely.</p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search User ID or hash..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-xs font-mono focus:outline-none w-52"
                    />
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                        <tr>
                          <th className="py-3.5 px-6">User UUID</th>
                          <th className="py-3.5 px-4">Anonymized human_uid Commit</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Created Chronology</th>
                          <th className="py-3.5 px-6 text-right">Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-950/30">
                            <td className="py-4 px-6 font-mono text-blue-400 font-semibold">{user.id}</td>
                            <td className="py-4 px-4 font-mono select-all text-slate-350">{user.human_uid}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${
                                user.status === 'verified' ? 'bg-emerald-950/45 border-emerald-900/50 text-emerald-400' :
                                user.status === 'suspended' ? 'bg-red-955/45 border-red-900/50 text-red-400 animate-pulse' :
                                'bg-slate-950 border-slate-850 text-slate-400'
                              }`}>
                                {((user.status) || '').toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-500">{new Date(user.created_at).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right space-x-2">
                              {user.status === 'suspended' ? (
                                <button
                                  onClick={() => triggerUserAction(user.id, 'verify')}
                                  className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-400 hover:bg-emerald-800 hover:text-white px-2 py-1 rounded transition-all font-mono font-bold cursor-pointer inline-block"
                                  title="Reinstate profile"
                                >
                                  Reinstate
                                </button>
                              ) : (
                                <button
                                  onClick={() => triggerUserAction(user.id, 'suspend')}
                                  className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 hover:bg-red-900 hover:text-white px-2 py-1 rounded transition-all font-mono font-bold cursor-pointer inline-block"
                                  title="Flag or Suspend user profile"
                                >
                                  Flag/Suspend
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  const clearanceConfirmed = window.confirm(
                                    ` INSTITUTIONAL APPROVAL REQUIRED\n\n` +
                                    `This action will permanently delete user profile ${user.id}.\n` +
                                    `Do you have institutional security authorization to purge this record?`
                                  );
                                  if (!clearanceConfirmed) return;
                                  
                                  try {
                                    const res = await fetch('/api/v1/account/remove', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        user_id: user.id,
                                        approved_by_institution: true
                                      })
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      alert(`Succeeded: Profile ${user.id} has been completely deleted and purged from all AAN system directories.`);
                                      await fetchAdminState();
                                    } else {
                                      alert(`Purge failed: ${data.error}`);
                                    }
                                  } catch (err) {
                                    console.error("Purge action failed", err);
                                  }
                                }}
                                className="text-[10px] bg-red-955 border border-red-900/50 text-red-400 hover:bg-red-650 hover:text-white px-2 py-1 rounded transition-all font-mono font-bold cursor-pointer inline-block"
                                title="Delete profile permanently"
                              >
                                Delete Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Devices hardware signatures */}
              {activeTab === 'devices' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-850">
                    <h3 className="font-bold text-white text-sm">Hardware Key Registry</h3>
                    <p className="text-[10px] text-slate-400">Anchor registers tracking user public signing keys to detect spoofed hypervisors or multi-profile emulators.</p>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                        <tr>
                          <th className="py-3.5 px-6">User ID Reference</th>
                          <th className="py-3.5 px-4">Terminal Device Platform</th>
                          <th className="py-3.5 px-4">Hardware Fingerprint Hash</th>
                          <th className="py-3.5 px-4">PEM Public Key Hash</th>
                          <th className="py-3.5 px-6">Hardware Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {devices.map((device) => (
                          <tr key={device.id} className="hover:bg-slate-950/20">
                            <td className="py-4 px-6 font-mono text-blue-400 font-semibold">{device.user_id}</td>
                            <td className="py-4 px-4 font-sans font-medium text-slate-205">{device.platform}</td>
                            <td className="py-4 px-4 font-mono text-slate-400 select-all">{device.device_fingerprint_hash}</td>
                            <td className="py-4 px-4 font-mono text-[10px] text-teal-400 select-all">SHA-256_{device.device_public_key.substring(27, 48)}...</td>
                            <td className="py-4 px-6">
                              <span className={`inline-block font-mono text-[9px] uppercase px-2 py-0.5 rounded ${
                                device.trusted ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-900/40 text-red-400 border border-red-900'
                              }`}>
                                {device.trusted ? "TRUSTED KEY" : "RISK FLAGGED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Cryptographic Signature indexes stats */}
              {activeTab === 'signatures' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-850">
                    <h3 className="font-bold text-white text-sm">Signature Verification Indexes</h3>
                    <p className="text-[10px] text-slate-400">Zero-knowledge secure verification signatures. Raw credentials or private keys are never stored on the platform.</p>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                        <tr>
                          <th className="py-3.5 px-6">Signature record ID</th>
                          <th className="py-3.5 px-4">User ID Link</th>
                          <th className="py-3.5 px-4">Signature Hash</th>
                          <th className="py-3.5 px-4">Payload Representation</th>
                          <th className="py-3.5 px-4">Verification Algorithm</th>
                          <th className="py-3.5 px-6 text-right">Confidence Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {signatureTemplates.map((tmpl) => (
                          <tr key={tmpl.id} className="hover:bg-slate-950/20">
                            <td className="py-4 px-6 font-mono text-xs">{tmpl.id}</td>
                            <td className="py-4 px-4 font-mono text-xs text-blue-400 font-semibold">{tmpl.user_id}</td>
                            <td className="py-4 px-4 font-mono text-xs text-slate-350 select-all">{tmpl.template_hash}</td>
                            <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                              {tmpl.encrypted_template ? tmpl.encrypted_template.slice(0, 32) + "..." : "AES_GCM_ENCRYPTED_SIGNATURE"}
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-400">{tmpl.model_version}</td>
                            <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">{tmpl.confidence_score}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Immutable system audit logs */}
              {activeTab === 'audits' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-bold text-white text-sm">Cryptographic Compliance Audit Trail</h3>
                      <p className="text-[10px] text-slate-400">Immutable ledger logging system triggers, compliance validations, and administrative parameter updates.</p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search audit actions or actors..."
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-xs font-mono focus:outline-none w-52"
                    />
                  </div>

                  <div className="overflow-x-auto text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                        <tr>
                          <th className="py-3 px-6">Log ID</th>
                          <th className="py-3 px-4">Actor ID / Scope</th>
                          <th className="py-3 px-4">Action Event</th>
                          <th className="py-3 px-4">Audited Target</th>
                          <th className="py-3 px-4">Event Payload Metadata</th>
                          <th className="py-3 px-6 text-right">Chronology (UTC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {filteredAudits.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-950/20 font-mono">
                            <td className="py-3 px-6 text-slate-500">{log.id}</td>
                            <td className="py-3 px-4">
                              <span className="text-slate-205 font-sans font-bold">{((log.actor_type) || '').toUpperCase()}</span>: 
                              <code className="text-slate-400 text-[10px] block truncate max-w-[120px]">{log.actor_id}</code>
                            </td>
                            <td className="py-3 px-4 text-emerald-400 font-bold">{log.action}</td>
                            <td className="py-3 px-4 text-xs text-slate-100 uppercase">
                              {log.target_type}: <span className="text-blue-400 text-[10px] lowercase">{log.target_id}</span>
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate text-[10px] text-slate-400 JSON-payload">
                              {JSON.stringify(log.metadata)}
                            </td>
                            <td className="py-3 px-6 text-right text-slate-500">{new Date(log.created_at).toISOString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Intrusion & Bypass Alerts Hub */}
              {activeTab === 'security-alerts' && (
                <div className="space-y-6">
                  {/* High level overview grids */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gauge Panel */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-xl">
                      <div>
                        <span className="font-mono text-[9px] text-slate-450 uppercase tracking-widest block mb-1">AGGREGATED RISK STATE</span>
                        <h3 className="font-bold text-white text-base">Intrusion Risk Score</h3>
                      </div>
                      <div className="py-4 flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                            securityRisk.score >= 75 ? 'text-red-500' :
                            securityRisk.score >= 40 ? 'text-amber-500' : 'text-emerald-400'
                          }`}>
                            {securityRisk.score}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">/100</span>
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded font-mono inline-block ${
                            securityRisk.score >= 75 ? 'bg-red-950 border border-red-800 text-red-200' :
                            securityRisk.score >= 40 ? 'bg-amber-955 border border-amber-900 text-amber-200' :
                            'bg-emerald-955 border border-emerald-900 text-emerald-200'
                          }`}>
                            {securityRisk.level.toUpperCase()} STATUS
                          </div>
                          <p className="text-[10px] text-slate-450">Continuous system security event monitoring index.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleResetSecurityEvents}
                        className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-400 hover:text-white px-3 py-1.5 text-center font-mono text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Reset Triggered Telemetry
                      </button>
                    </div>

                    {/* Threat Vectors Aggregates */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl md:col-span-2 shadow-xl flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[9px] text-slate-450 uppercase tracking-widest block mb-1">CYBER RISK VECTORS</span>
                        <h3 className="font-bold text-white text-base">Active Monitoring Indicators</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 text-xs font-mono">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 truncate">Failed Tokens</span>
                          <span className="text-lg font-bold text-white mt-1">{(securityRisk.signalsCount?.failedTokens || 0)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between font-mono">
                          <span className="text-[10px] text-slate-400 truncate">Blocked Transitions</span>
                          <span className="text-lg font-bold text-white mt-1">{(securityRisk.signalsCount?.impossibleTransitions || 0)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 truncate">Unauthorized API</span>
                          <span className="text-lg font-bold text-white mt-1">{(securityRisk.signalsCount?.unauthorizedAccess || 0)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 truncate">Key Re-Verification</span>
                          <span className="text-lg font-bold text-white mt-1">{(securityRisk.signalsCount?.apiKeyAbuse || 0)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 truncate">Unusual IP Spikes</span>
                          <span className="text-lg font-bold text-white mt-1">{(securityRisk.signalsCount?.unusualIPActivity || 0)}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 truncate">Admin Overrides</span>
                          <span className="text-lg font-bold text-yellow-500 mt-1">{(securityRisk.signalsCount?.adminAnomalies || 0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                        <span>Continuous background heuristics validating cryptographic attestation signatures on the device hardware layer.</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Alerts directory container */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-sm">Defensive Intrusion Events Ledger</h3>
                        <p className="text-[10px] text-slate-400">Deep telemetry list tracing attempts to bypass, spoof, or force tokens outside authorized state channels.</p>
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        {/* Filters */}
                        <select
                          value={severityFilter}
                          onChange={(e) => setSeverityFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-slate-700"
                        >
                          <option value="all">All Severities</option>
                          <option value="critical">Critical Only</option>
                          <option value="high">High Only</option>
                          <option value="medium">Medium Only</option>
                          <option value="low">Low Only</option>
                        </select>

                        <select
                          value={eventTypeFilter}
                          onChange={(e) => setEventTypeFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-slate-700"
                        >
                          <option value="all">All Vector Types</option>
                          <option value="invalid_token_signature">Token Signature Tamper</option>
                          <option value="impossible_session_state_transition">Impossible Transitions</option>
                          <option value="replay_attack_attempt">Replay Attacks</option>
                          <option value="unauthorized_api_key_abuse">API Key Abuse</option>
                          <option value="admin_override_anomaly">Admin Overrides</option>
                        </select>

                        <button onClick={fetchAdminState} className="bg-slate-950 p-2.5 border border-slate-850 rounded text-slate-450 hover:text-white cursor-pointer transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Active resolve box */}
                    {resolvingEventId && (
                      <div className="bg-slate-950 border-b border-slate-850 p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                            Security Alert Intervention: Resolve Event {resolvingEventId}
                          </h4>
                          <button onClick={() => setResolvingEventId(null)} className="text-slate-400 hover:text-white font-mono text-[11px] hover:underline">Cancel</button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Enter mitigation review, firewall rules applied, or override justification notes..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 flex-1 focus:outline-none focus:border-slate-750 font-sans"
                          />
                          <button
                            onClick={() => handleResolveEvent(resolvingEventId)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px] px-4 py-2 rounded shrink-0 cursor-pointer transition-colors"
                          >
                            Execute Resolve Override
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-slate-950 font-mono text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-850">
                          <tr>
                            <th className="py-3 px-6">Event ID</th>
                            <th className="py-3 px-4">Severity</th>
                            <th className="py-3 px-4">Threat Event Type</th>
                            <th className="py-3 px-4">Actor ID / host</th>
                            <th className="py-3 px-4">Reason / payload</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-6 text-right">Sequence (UTC)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {securityEvents
                            .filter((e: any) => severityFilter === "all" || e.severity === severityFilter)
                            .filter((e: any) => eventTypeFilter === "all" || e.event_type === eventTypeFilter)
                            .length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center p-12 text-slate-500 font-mono text-xs">
                                  No anomalies or bypass intrusion alerts registered matching this query. Defensive shield fully intact.
                                </td>
                              </tr>
                            ) : (
                              securityEvents
                                .filter((e: any) => severityFilter === "all" || e.severity === severityFilter)
                                .filter((e: any) => eventTypeFilter === "all" || e.event_type === eventTypeFilter)
                                .map((evt: any) => (
                                  <tr key={evt.id} className="hover:bg-slate-950/20">
                                    <td className="py-4 px-6 text-slate-500 font-bold">{evt.id}</td>
                                    <td className="py-4 px-4 text-xs font-mono">
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                        evt.severity === 'critical' ? 'bg-red-955 border border-red-900 text-red-400 font-extrabold' :
                                        evt.severity === 'high' ? 'bg-amber-955 border border-amber-900 text-amber-500 font-bold' :
                                        evt.severity === 'medium' ? 'bg-yellow-955 border border-yellow-900 text-yellow-500 font-medium' :
                                        'bg-slate-850 border border-slate-800 text-slate-400'
                                      }`}>
                                        {evt.severity.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-white text-[11px] font-mono">{evt.event_type}</td>
                                    <td className="py-4 px-4 font-sans text-[10px] space-y-0.5 max-w-[140px] truncate">
                                      <div className="font-extrabold text-slate-300 uppercase leading-none">{evt.actor_type}: <code className="font-mono text-slate-450">{evt.actor_id}</code></div>
                                      <div className="font-mono text-[9px] text-slate-500 leading-none mt-1">{evt.ip_address}</div>
                                      <div className="font-mono text-[9px] text-slate-500 truncate" title={evt.user_agent}>{evt.user_agent}</div>
                                    </td>
                                    <td className="py-4 px-4 max-w-sm space-y-1.5 font-sans">
                                      <p className="text-slate-100 text-[10px] font-medium leading-relaxed">{evt.detection_reason}</p>
                                      <div className="bg-slate-950 p-2 rounded border border-slate-850 font-mono text-[9px] text-slate-400 overflow-x-auto whitespace-pre leading-normal">
                                        {JSON.stringify(evt.raw_metadata || {}, null, 1)}
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 font-sans">
                                      {evt.raw_metadata?.resolved ? (
                                        <div className="space-y-1 text-slate-400 text-[10px]">
                                          <span className="text-emerald-400 font-bold border border-emerald-900 bg-emerald-955 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider text-[8px]">RESOLVED</span>
                                          <p className="text-[9px] italic text-slate-500 line-clamp-2 leading-snug" title={evt.raw_metadata.resolution_notes}>"{evt.raw_metadata.resolution_notes}"</p>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setResolvingEventId(evt.id);
                                            setResolutionNotes("");
                                          }}
                                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-mono text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition-all uppercase"
                                        >
                                          Mark Resolved
                                        </button>
                                      )}
                                    </td>
                                    <td className="py-4 px-6 text-right text-slate-500 max-w-[100px] truncate">{new Date(evt.created_at).toISOString()}</td>
                                  </tr>
                                ))
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
