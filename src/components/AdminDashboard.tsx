import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserCheck, Activity, Database, Check, AlertOctagon, Terminal, 
  Search, RefreshCw, XCircle, ShieldCheck, Trash2, Shield, Download,
  Sliders, Clock, BarChart3, AlertTriangle, UserPlus, Info, Lock, BookOpen,
  Plus, Eye, X, Filter, ChevronRight, CheckCircle2
} from 'lucide-react';
import { User, SignatureTemplate, Device, VerificationSession, AuditLog } from '../types';
import { isAcademyEnabled } from '../academyConfig';
import { motion, AnimatePresence } from 'motion/react';

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
  // Core Database states
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [signatureTemplates, setSignatureTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enterprise Policies & Chronological timelines
  const [policies, setPolicies] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("usr_df990a31");
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [institutionalConsent, setInstitutionalConsent] = useState(false);

  // Defensive Bypass & Intrusion states
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

  // Bug Bounty Security Reports States
  const [securityReports, setSecurityReports] = useState<any[]>([]);
  const [triagingReportId, setTriagingReportId] = useState<string | null>(null);
  const [triageActionState, setTriageActionState] = useState({ 
    action: 'triage', 
    severity: 'high', 
    bounty_amount: 1000, 
    internal_notes: '', 
    duplicate_of: '' 
  });
  const [isTriaging, setIsTriaging] = useState(false);
  const [bountyFilter, setBountyFilter] = useState<string>("all");

  // Custom inspect drawer state for "Why it exists, What problem it solves, What action to take"
  const [inspectRecord, setInspectRecord] = useState<{
    type: 'session' | 'user' | 'device' | 'signature' | 'audit' | 'security-event';
    data: any;
  } | null>(null);

  // Policy Builder form space
  const [policyForm, setPolicyForm] = useState({
    name: "",
    conditions: "Device Trust < 35 && Automation Confidence > 90%",
    thenAction: "suspend" as 'suspend' | 'challenge' | 'flag' | 'merge_duplicates' | 'remove_fraud' | 'notify',
    description: ""
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'analytics' | 'overrides' | 'users' | 'policies' | 'timeline' | 'devices' | 'signatures' | 'audits' | 'verification-logs' | 'security-alerts' | 'security-reports'>('analytics');

  // Filtering params
  const [auditQuery, setAuditQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [sessionQuery, setSessionQuery] = useState("");
  const [sessionStatus, setSessionStatus] = useState<string>("all");
  const [downloadingExport, setDownloadingExport] = useState(false);

  // Sync timelines when selected user changes
  useEffect(() => {
    if (selectedUserId && activeTab === 'timeline') {
      fetchUserTimeline(selectedUserId);
    }
  }, [selectedUserId, activeTab]);

  useEffect(() => {
    fetchAdminState();
  }, []);

  const handleDownloadAuditSnapshot = async () => {
    setDownloadingExport(true);
    try {
      const response = await fetch('/api/internal/export-verification-audit');
      if (!response.ok) throw new Error('Verification snapshot generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aan_verification_audit_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      fetchAdminState();
    } catch (err) {
      console.error("Failed exporting MVP audit snapshot:", err);
    } finally {
      setDownloadingExport(false);
    }
  };

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
      // 1. Sessions fetch
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

      // 2. Users fetch
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
            human_uid: "human_hash_b710ef67_duplicate",
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 11.8 * 3600 * 1000).toISOString()
          }
        ];
      }
      setUsers(usersData);

      // 3. Devices fetch
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
            device_fingerprint_hash: "sha256_df7819bcde23a105f81239aa",
            trusted: true,
            last_seen_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: "dev_2",
            user_id: "usr_b710ef67",
            device_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy1...",
            platform: "iOS Native App",
            device_fingerprint_hash: "sha256_10cbfa898e88ffcd92994eab",
            trusted: true,
            last_seen_at: new Date(Date.now() - 23.95 * 3600 * 1000).toISOString(),
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ];
      }
      setDevices(devData);

      // 4. Audit logs fetch
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

      // 5. Signatures templates fetch
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
            encrypted_template: "AES_GCM_MOCK_BLOB_89f02cba3912da77fefcc89d0121",
            model_version: "ecc-secp256k1",
            confidence_score: 98.4,
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          },
          {
            id: "tmpl_102",
            user_id: "usr_df990a31",
            template_hash: "sig_hash_b710ef67",
            encrypted_template: "AES_GCM_MOCK_BLOB_de39bca0012bcfeef90a12eefc77",
            model_version: "ecc-secp256k1",
            confidence_score: 92.1,
            created_at: new Date(Date.now() - 11.95 * 3600 * 1000).toISOString()
          }
        ];
      }
      setSignatureTemplates(bioData);

      // 6. Security bypass / intrusion alerts
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
          }
        ];
      }
      setSecurityEvents(secEvents);

      // 7. Security risk
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

      // Sync bug bounty vulnerability reports
      await fetchSecurityReports();

      await fetchPoliciesAndTimelines();
    } catch (err) {
      console.warn("Gracefully unresolved admin sync status", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityReports = async () => {
    try {
      const res = await fetch('/api/internal/security-reports');
      if (res.ok) {
        const data = await res.json();
        setSecurityReports(data);
      }
    } catch (e) {
      console.error("Failed to fetch admin security reports:", e);
    }
  };

  const handleTriageActionSubmit = async (reportId: string) => {
    setIsTriaging(true);
    try {
      const res = await fetch(`/api/internal/security-reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triageActionState)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchSecurityReports();
          setTriagingReportId(null);
          setTriageActionState({ action: 'triage', severity: 'high', bounty_amount: 1000, internal_notes: '', duplicate_of: '' });
        }
      }
    } catch (err) {
      console.error("Failed to execute triage action:", err);
    } finally {
      setIsTriaging(false);
    }
  };

  const triggerSessionAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/internal/sessions/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminState();
        if (inspectRecord?.type === 'session' && inspectRecord.data.id === id) {
          setInspectRecord({
            type: 'session',
            data: { ...inspectRecord.data, status: action === 'approve' ? 'passed' : 'failed' }
          });
        }
      }
    } catch (err) {
      console.error("Action override fail", err);
    }
  };

  const triggerUserAction = async (id: string, action: 'suspend' | 'verify') => {
    try {
      const res = await fetch(`/api/internal/users/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminState();
        if (inspectRecord?.type === 'user' && inspectRecord.data.id === id) {
          setInspectRecord({
            type: 'user',
            data: { ...inspectRecord.data, status: action === 'suspend' ? 'suspended' : 'verified' }
          });
        }
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
        if (inspectRecord?.type === 'security-event' && inspectRecord.data.id === id) {
          setInspectRecord({
            type: 'security-event',
            data: {
              ...inspectRecord.data,
              raw_metadata: { ...inspectRecord.data.raw_metadata, resolved: true, resolution_notes: resolutionNotes }
            }
          });
        }
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
      if (data.success) fetchAdminState();
    } catch (err) {
      console.error("Failed to clear security events:", err);
    }
  };

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

  const handleTogglePolicy = async (policyId: string) => {
    try {
      const res = await fetch(`/api/internal/policies/${policyId}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchAdminState();
    } catch (err) {
      console.error("Policy toggle fail", err);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!window.confirm("Confirm delete this enterprise policy rule?")) return;
    try {
      const res = await fetch(`/api/internal/policies/${policyId}/delete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchAdminState();
    } catch (err) {
      console.error("Policy delete fail", err);
    }
  };

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
        setInspectRecord(null);
        if (selectedUserId === userId) setSelectedUserId("");
        await fetchAdminState();
      } else {
        alert(`Fail: ${data.error}`);
      }
    } catch (err) {
      console.error("Hard purge fail", err);
    }
  };

  // Filtering Lists helper
  const filteredAudits = auditLogs.filter(log => {
    return log.action.toLowerCase().includes(auditQuery.toLowerCase()) || 
           log.actor_id.toLowerCase().includes(auditQuery.toLowerCase()) ||
           log.target_type.toLowerCase().includes(auditQuery.toLowerCase());
  });

  const filteredUsers = users.filter(user => {
    return user.id.toLowerCase().includes(userQuery.toLowerCase()) || 
           user.human_uid.toLowerCase().includes(userQuery.toLowerCase());
  });

  // Highlight Text matches in table rows
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/35 text-white font-semibold rounded px-0.5">{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#07080a] font-sans text-[#8e96a3] selection:bg-[#2563eb]/20 selection:text-white">
      
      {/* Dynamic Header */}
      <header className="bg-[#0c0d12] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-950/40 text-blue-400 p-2 rounded border border-blue-900/40">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-none">Administrative Compliance Console</h1>
            <span className="text-[8px] font-mono uppercase text-[#646e7a] tracking-widest block mt-1.5 font-bold">
              Stage 4 • Trust Governance & Remediation Center
            </span>
          </div>
        </div>

        <div className="flex gap-4 items-center font-mono text-xs select-none">
          {isAcademyEnabled() && (
            <>
              <button 
                onClick={() => onNavigate('academy', undefined, mapTabToLesson(activeTab))} 
                className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-white transition-all bg-blue-950/20 hover:bg-blue-950/40 px-3 py-1.5 rounded border border-blue-900/30 font-bold cursor-pointer uppercase tracking-wider"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain Tab context</span>
              </button>
              <span className="text-white/5 font-mono text-xs">|</span>
            </>
          )}
          <button onClick={() => onNavigate('landing')} className="text-[#646e7a] hover:text-white transition-colors cursor-pointer">
            Landing Portal
          </button>
          <span className="text-white/5 font-mono text-xs">|</span>
          <button onClick={() => onNavigate('partner')} className="text-[#646e7a] hover:text-white transition-colors cursor-pointer font-bold text-blue-400 hover:underline">
            Partner Portal
          </button>
        </div>
      </header>

      {/* Primary Console Layout Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Sidebar Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden p-4 space-y-6">
            
            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#646e7a] font-extrabold block uppercase tracking-widest">COMMAND & TELEMETRY</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab('analytics'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'analytics' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Trust Dashboard</span>
                </button>
                <button
                  onClick={() => { setActiveTab('security-alerts'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'security-alerts' ? 'bg-red-950/40 text-red-200 border border-red-900/30 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Intrusion & Bypass Alerts</span>
                  </div>
                  {securityEvents.filter((e: any) => !e.raw_metadata?.resolved).length > 0 && (
                    <span className="bg-rose-500 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                      {securityEvents.filter((e: any) => !e.raw_metadata?.resolved).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('security-reports'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'security-reports' ? 'bg-yellow-950/40 text-yellow-200 border border-yellow-900/30 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-yellow-500" />
                    <span>Security Bug Bounty</span>
                  </div>
                  {securityReports.filter((r: any) => r.status === 'new' || r.status === 'triaged').length > 0 && (
                    <span className="bg-yellow-500 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                      {securityReports.filter((r: any) => r.status === 'new' || r.status === 'triaged').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#646e7a] font-extrabold block uppercase tracking-widest">OPERATIONAL DIRECTORY</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab('verification-logs'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'verification-logs' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Verification Logs</span>
                </button>
                <button
                  onClick={() => { setActiveTab('overrides'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    activeTab === 'overrides' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-yellow-450" />
                    <span>Identity Overrides</span>
                  </div>
                  {sessions.filter(s => s.status === 'review').length > 0 && (
                    <span className="bg-yellow-500 text-slate-950 font-mono font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                      {sessions.filter(s => s.status === 'review').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('users'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'users' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>User Registries</span>
                </button>
                <button
                  onClick={() => { setActiveTab('timeline'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'timeline' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Account Timelines</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#646e7a] font-extrabold block uppercase tracking-widest">HARDWARE & KEY REPOSITORIES</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab('devices'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'devices' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>Hardware keys & Devices</span>
                </button>
                <button
                  onClick={() => { setActiveTab('signatures'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'signatures' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Signature Indexes</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#646e7a] font-extrabold block uppercase tracking-widest">SYSTEM GOVERNANCE</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setActiveTab('policies'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'policies' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Enterprise Policies</span>
                </button>
                <button
                  onClick={() => { setActiveTab('audits'); setInspectRecord(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'audits' ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg font-bold' : 'hover:bg-white/[0.02] text-[#646e7a]'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-slate-450" />
                  <span>System Audit Rails</span>
                </button>
              </div>
            </div>

          </div>

          {/* Secure Hardware attestation benchmarks */}
          <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl space-y-2 text-left">
            <span className="font-mono text-[9px] text-[#646e7a] font-bold uppercase block">SECURITY STANDARDS DETECTED</span>
            <div className="space-y-1.5 font-mono text-[10px] text-[#646e7a]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>AES-256 GCM Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>HMAC API Key Hashing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Asymmetric RSA-2048 Proofs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Active View Content panel */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Global MVP Advisory Banner */}
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-xl p-4 text-xs text-amber-200/80 leading-relaxed font-sans flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold mb-0.5 text-white">MOCK ATTESTATION PREVIEW — Administrative Sandbox Mode</p>
              <p className="text-[#646e7a]">
                AAN Admin console displays simulated metrics and mock identity records for compliance preview purposes. Raw biometrics are never permanently retained.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-[#646e7a] text-xs bg-[#0c0d12] border border-white/5 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-3" />
              <span>Attesting database records & synchronizing secure ledger...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* 1. Analytics Dashboard view */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6 text-left">
                    {/* Bento Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl space-y-2">
                        <span className="text-[10px] text-[#646e7a] font-mono tracking-widest uppercase block">PLATFORM TRUST</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white font-mono">98.2%</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ +0.4%</span>
                        </div>
                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: '98.2%' }} />
                        </div>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl space-y-2">
                        <span className="text-[10px] text-[#646e7a] font-mono tracking-widest uppercase block">DAILY EVALUATIONS</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white font-mono">1,420</span>
                          <span className="text-[9px] text-blue-400 font-mono font-bold">▲ +12%</span>
                        </div>
                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: '74%' }} />
                        </div>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl space-y-2">
                        <span className="text-[10px] text-[#646e7a] font-mono tracking-widest uppercase block">DUPLICATES BLOCKED</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white font-mono">412</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">Verified</span>
                        </div>
                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl space-y-2">
                        <span className="text-[10px] text-[#646e7a] font-mono tracking-widest uppercase block">THREATS INTERCEPTED</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-red-400 font-mono">219</span>
                          <span className="text-[9px] text-red-400 font-mono font-bold">Critical</span>
                        </div>
                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: '30%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Threat charts and risk analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Risk Distribution Canvas */}
                      <div className="bg-[#0c0d12] border border-white/5 p-6 rounded-2xl space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white">Verification Risk Profile Distribution</h4>
                          <p className="text-[10px] text-[#646e7a]">Continuous aggregate statistics on digital attestation sessions.</p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div>
                            <div className="flex justify-between text-[11px] font-mono mb-1">
                              <span className="text-emerald-400">Low Risk (Score 0-15)</span>
                              <span className="text-white">88.5% (1,257)</span>
                            </div>
                            <div className="w-full bg-black/45 h-2 rounded overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: '88.5%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-mono mb-1">
                              <span className="text-yellow-400">Medium Risk (Score 16-60)</span>
                              <span className="text-white">8.4% (119)</span>
                            </div>
                            <div className="w-full bg-black/45 h-2 rounded overflow-hidden">
                              <div className="bg-yellow-500 h-full" style={{ width: '8.4%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-mono mb-1">
                              <span className="text-red-400">High Risk (Score 61-100)</span>
                              <span className="text-white">3.1% (44)</span>
                            </div>
                            <div className="w-full bg-black/45 h-2 rounded overflow-hidden">
                              <div className="bg-red-500 h-full" style={{ width: '3.1%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bar graph mock */}
                      <div className="bg-[#0c0d12] border border-white/5 p-6 rounded-2xl space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white">Daily Threat Prevention Timeline</h4>
                          <p className="text-[10px] text-[#646e7a]">Spikes indicate coordinated bot swarm bypass attempts.</p>
                        </div>
                        <div className="grid grid-cols-7 gap-2.5 h-28 items-end pt-2 text-center font-mono text-[9px]">
                          {[
                            { day: 'Mon', h: '30%', val: 12 },
                            { day: 'Tue', h: '45%', val: 18 },
                            { day: 'Wed', h: '15%', val: 6 },
                            { day: 'Thu', h: '85%', val: 42 },
                            { day: 'Fri', h: '25%', val: 11 },
                            { day: 'Sat', h: '10%', val: 4 },
                            { day: 'Sun', h: '92%', val: 49 }
                          ].map((dayItem, idx) => (
                            <div key={idx} className="h-full flex flex-col justify-end items-center group relative cursor-pointer">
                              <span className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111319] border border-white/5 rounded px-1.5 py-0.5 text-white font-bold z-10">{dayItem.val}</span>
                              <div className="w-full bg-black/40 rounded-t h-full flex flex-col justify-end overflow-hidden">
                                <div className="bg-blue-500/80 group-hover:bg-blue-400 transition-colors" style={{ height: dayItem.h }} />
                              </div>
                              <span className="text-[#646e7a] block mt-1">{dayItem.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Immutable logs snapshot section */}
                    <div className="bg-[#0c0d12] border border-white/5 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6">
                      <div className="space-y-1 max-w-xl">
                        <h4 className="text-sm font-semibold text-white">Export compliance snapshot history</h4>
                        <p className="text-xs text-[#646e7a] leading-relaxed">
                          Download a signed verification snapshot dataset for enterprise reporting, third-party audits, or offline SIEM integration.
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadAuditSnapshot}
                        disabled={downloadingExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloadingExport ? 'COMPILING SNAPSHOT...' : 'DOWNLOAD LEDGER SCHEMAS'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Intrusion Bypass alerts list */}
                {activeTab === 'security-alerts' && (
                  <div className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl space-y-1.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#646e7a]">Defensive Index</span>
                          <h3 className="font-semibold text-white text-sm">System Intrusion Risk</h3>
                        </div>
                        <div className="flex items-center gap-3 py-2">
                          <span className={`text-4xl font-mono font-extrabold ${securityRisk.score > 60 ? 'text-red-500' : 'text-yellow-400'}`}>
                            {securityRisk.score}
                          </span>
                          <div>
                            <span className="text-xs text-white block uppercase font-bold font-mono tracking-wider">{securityRisk.level}</span>
                            <span className="text-[10px] text-[#646e7a] block font-mono">Bypass attempt telemetry</span>
                          </div>
                        </div>
                        <button
                          onClick={handleResetSecurityEvents}
                          className="w-full bg-black/40 hover:bg-black/80 border border-white/5 text-[#646e7a] hover:text-white px-3 py-1.5 text-center font-mono text-[9px] font-bold rounded cursor-pointer transition-all"
                        >
                          Reset Triggered Alerts
                        </button>
                      </div>

                      <div className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-3">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#646e7a]">ACTIVE HEURISTICS</span>
                          <h3 className="font-semibold text-white text-sm">Threat Vector Counts</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                          <div className="bg-black/20 p-2.5 rounded border border-white/5">
                            <span className="text-[#646e7a] text-[9px] block">Failed Tokens</span>
                            <span className="text-base font-bold text-white mt-0.5 block">{securityRisk.signalsCount?.failedTokens || 0}</span>
                          </div>
                          <div className="bg-black/20 p-2.5 rounded border border-white/5">
                            <span className="text-[#646e7a] text-[9px] block">Bypasses Blocked</span>
                            <span className="text-base font-bold text-white mt-0.5 block">{securityRisk.signalsCount?.impossibleTransitions || 0}</span>
                          </div>
                          <div className="bg-black/20 p-2.5 rounded border border-white/5">
                            <span className="text-[#646e7a] text-[9px] block">Abusive API Keys</span>
                            <span className="text-base font-bold text-white mt-0.5 block">{securityRisk.signalsCount?.apiKeyAbuse || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Mitigation resolution prompt */}
                    {resolvingEventId && (
                      <div className="bg-yellow-950/10 border border-yellow-900/30 p-5 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-bold text-xs font-mono">Security Intervention Resolution • Event #{resolvingEventId}</span>
                          <button onClick={() => setResolvingEventId(null)} className="text-[#646e7a] hover:text-white text-[10px] font-mono hover:underline cursor-pointer">Cancel</button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Mitigation notes, firewall overrides applied..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded px-3 py-2 text-xs text-white flex-1 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => handleResolveEvent(resolvingEventId)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px] px-4 py-2 rounded cursor-pointer shrink-0 transition-colors"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Alerts ledger list */}
                    <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white text-sm">Defensive Bypass Intrusion ledger</h3>
                          <p className="text-[10px] text-[#646e7a]">Deep telemetry logs tracing invalid JWT token structures, tampered claims, and automation triggers.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none"
                          >
                            <option value="all">All Severities</option>
                            <option value="critical">Critical Only</option>
                            <option value="high">High Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                            <tr>
                              <th className="py-3 px-6">Event ID</th>
                              <th className="py-3 px-4">Severity</th>
                              <th className="py-3 px-4">Threat Type</th>
                              <th className="py-3 px-4">IP/User Agent</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-6 text-right">Inspect</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                            {securityEvents
                              .filter(e => severityFilter === 'all' || e.severity === severityFilter)
                              .map(evt => (
                                <tr key={evt.id} className="hover:bg-white/[0.01] group transition-colors">
                                  <td className="py-3.5 px-6 font-bold text-blue-400 select-all">{evt.id}</td>
                                  <td className="py-3.5 px-4">
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                      evt.severity === 'critical' ? 'bg-red-955 border-red-900 text-red-400 font-extrabold' : 'bg-amber-955 border-amber-900 text-amber-500'
                                    }`}>
                                      {evt.severity}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-white text-[10px]">{evt.event_type}</td>
                                  <td className="py-3.5 px-4 text-[#646e7a] text-[10px] font-sans truncate max-w-[120px]" title={`${evt.ip_address} - ${evt.user_agent}`}>
                                    {evt.ip_address}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {evt.raw_metadata?.resolved ? (
                                      <span className="text-[8px] text-emerald-400 border border-emerald-900 bg-emerald-955 px-1.5 py-0.5 rounded uppercase tracking-wider">RESOLVED</span>
                                    ) : (
                                      <button
                                        onClick={() => { setResolvingEventId(evt.id); setResolutionNotes(""); }}
                                        className="bg-black/40 hover:bg-black/80 border border-white/5 px-2 py-0.5 rounded text-[9px] text-[#8e96a3] hover:text-white transition-all cursor-pointer"
                                      >
                                        Mark Resolved
                                      </button>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-6 text-right">
                                    <button
                                      onClick={() => setInspectRecord({ type: 'security-event', data: evt })}
                                      className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                    >
                                      <span>Inspect</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Verification logs directory */}
                {activeTab === 'verification-logs' && (
                  <div className="space-y-6 text-left">
                    {/* Log Stats mini panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] font-mono text-[#646e7a] block font-semibold uppercase">Total volume</span>
                        <span className="text-xl font-bold font-mono text-white block mt-0.5">{sessions.length}</span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] font-mono text-emerald-400 block font-semibold uppercase">Verified human</span>
                        <span className="text-xl font-bold font-mono text-emerald-400 block mt-0.5">
                          {sessions.filter(s => s.status === 'passed').length}
                        </span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] font-mono text-yellow-500 block font-semibold uppercase">Anomalies review</span>
                        <span className="text-xl font-bold font-mono text-yellow-400 block mt-0.5">
                          {sessions.filter(s => s.status === 'review').length}
                        </span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] font-mono text-red-500 block font-semibold uppercase">Failed / Rejected</span>
                        <span className="text-xl font-bold font-mono text-red-400 block mt-0.5">
                          {sessions.filter(s => s.status === 'failed').length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white text-sm">Enterprise verification session index</h3>
                          <p className="text-[10px] text-[#646e7a]">Immutable auditing ledger of unique trust decisions and cryptographic signed assertions.</p>
                        </div>
                      </div>

                      {/* Filter Search controls */}
                      <div className="bg-black/30 p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                          <Search className="w-3.5 h-3.5 text-[#646e7a] absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search Session ID or User ID..."
                            value={sessionQuery}
                            onChange={(e) => setSessionQuery(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded pl-9 pr-3 py-1.5 text-xs text-white font-mono w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono uppercase text-[#646e7a] font-bold">Status:</span>
                          <select
                            value={sessionStatus}
                            onChange={(e) => setSessionStatus(e.target.value)}
                            className="bg-[#0c0d12] border border-white/5 rounded px-2.5 py-1 text-xs text-[#8e96a3] focus:outline-none"
                          >
                            <option value="all">ALL</option>
                            <option value="passed">PASSED</option>
                            <option value="failed">FAILED</option>
                            <option value="review">REVIEW</option>
                          </select>
                        </div>
                      </div>

                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                            <tr>
                              <th className="py-3 px-6">Session ID</th>
                              <th className="py-3 px-4">Partner External User ID</th>
                              <th className="py-3 px-4">Risk outcome</th>
                              <th className="py-3 px-4">Proof Claim JWT snippet</th>
                              <th className="py-3 px-6 text-right">Inspect</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                            {sessions
                              .filter(s => {
                                const matchSearch = s.id.toLowerCase().includes(sessionQuery.toLowerCase()) || s.external_user_id.toLowerCase().includes(sessionQuery.toLowerCase());
                                const matchStatus = sessionStatus === 'all' || s.status === sessionStatus;
                                return matchSearch && matchStatus;
                              })
                              .map(session => {
                                const tokenSnippet = session.proof_token && session.proof_token.length > 15
                                  ? `${session.proof_token.substring(0, 10)}...${session.proof_token.substring(session.proof_token.length - 10)}`
                                  : 'unissued';

                                return (
                                  <tr key={session.id} className="hover:bg-white/[0.01] group transition-colors">
                                    <td className="py-3.5 px-6 font-bold text-blue-400 select-all">{highlightMatch(session.id, sessionQuery)}</td>
                                    <td className="py-3.5 px-4 font-sans text-white font-medium">{highlightMatch(session.external_user_id, sessionQuery)}</td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                          session.status === 'passed' ? 'bg-emerald-955 border-emerald-900 text-emerald-400' :
                                          session.status === 'failed' ? 'bg-red-955 border-red-900 text-red-400' : 'bg-yellow-955 border-yellow-900 text-yellow-500'
                                        }`}>
                                          {session.status}
                                        </span>
                                        <span className="text-[#646e7a] text-[10px]">({session.risk_score}/100)</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-[#646e7a] select-all font-mono text-[10px]">
                                      <code>{tokenSnippet}</code>
                                    </td>
                                    <td className="py-3.5 px-6 text-right">
                                      <button
                                        onClick={() => setInspectRecord({ type: 'session', data: session })}
                                        className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                      >
                                        <span>Inspect</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            {sessions.filter(s => {
                              const matchSearch = s.id.toLowerCase().includes(sessionQuery.toLowerCase()) || s.external_user_id.toLowerCase().includes(sessionQuery.toLowerCase());
                              const matchStatus = sessionStatus === 'all' || s.status === sessionStatus;
                              return matchSearch && matchStatus;
                            }).length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-12 text-[#646e7a] font-mono text-xs">
                                  <div className="max-w-md mx-auto space-y-2 p-6">
                                    <AlertOctagon className="w-8 h-8 text-[#646e7a] mx-auto" />
                                    <p className="font-semibold text-white">No Verification Records Found</p>
                                    <p className="text-[11px]">Your query yielded 0 results. Adjust filters or search keywords.</p>
                                    <button onClick={() => { setSessionQuery(""); setSessionStatus("all"); }} className="bg-white/5 border border-white/5 hover:bg-white/10 px-3 py-1 text-[10px] rounded text-white font-mono cursor-pointer mt-2">
                                      Clear Filters
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Identity Overrides Manual Review */}
                {activeTab === 'overrides' && (
                  <div className="space-y-6 text-left">
                    <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">Identity Auditing & Overrides Queue</h3>
                        <p className="text-[10px] text-[#646e7a]">Override pending or suspicious sessions flagged for manual supervisor validation.</p>
                      </div>

                      {sessions.filter(s => s.status === 'review' || s.status === 'failed').length === 0 ? (
                        <div className="p-12 text-center text-[#646e7a] font-mono text-xs bg-black/20 border border-white/5 rounded-xl">
                          No active manual override candidates found in reviewer queue. Secure attestation pipeline fully automated.
                        </div>
                      ) : (
                        <div className="space-y-3 font-mono">
                          {sessions.filter(s => s.status === 'review' || s.status === 'failed').map(session => (
                            <div key={session.id} className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-400 select-all">{session.id}</span>
                                  <span className="text-[8px] border border-yellow-900 text-yellow-500 bg-yellow-955 px-1.5 py-0.5 rounded font-extrabold uppercase">
                                    {session.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#8e96a3] font-sans">
                                  <strong>External linked User:</strong> {session.external_user_id}
                                </div>
                                <div className="text-[10px] text-[#646e7a] max-w-xl font-sans mt-0.5">
                                  <strong>Anomaly reasons:</strong> {session.result_reason}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => triggerSessionAction(session.id, 'approve')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => triggerSessionAction(session.id, 'reject')}
                                  className="bg-red-950 hover:bg-red-900 border border-red-900 text-red-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. User Registries tab */}
                {activeTab === 'users' && (
                  <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden text-left shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">AuraProof Cryptographic User Directory</h3>
                        <p className="text-[10px] text-[#646e7a]">Zero-knowledge human signatures. Raw identity matrices or files are never recorded.</p>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#646e7a] absolute left-2.5 top-2" />
                        <input
                          type="text"
                          placeholder="Search User ID or signature..."
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          className="bg-black/40 border border-white/5 rounded pl-8 pr-3 py-1 text-xs text-white focus:outline-none w-52"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto text-[11px] font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                          <tr>
                            <th className="py-3 px-6">User UUID</th>
                            <th className="py-3 px-4">Anonymized human_uid Commit</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Inception Date</th>
                            <th className="py-3 px-6 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.01] group transition-colors">
                              <td className="py-3.5 px-6 font-bold text-blue-400 select-all">{highlightMatch(user.id, userQuery)}</td>
                              <td className="py-3.5 px-4 text-[#8e96a3] select-all max-w-[200px] truncate" title={user.human_uid}>
                                {highlightMatch(user.human_uid, userQuery)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                  user.status === 'verified' ? 'bg-emerald-955 border-emerald-900 text-emerald-400' :
                                  user.status === 'suspended' ? 'bg-red-955 border-red-900 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[#646e7a]">{new Date(user.created_at).toLocaleString()}</td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  onClick={() => setInspectRecord({ type: 'user', data: user })}
                                  className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Account timelines */}
                {activeTab === 'timeline' && (
                  <div className="bg-[#0c0d12] border border-white/5 p-6 rounded-2xl text-left space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">Account Trust Timelines</h3>
                        <p className="text-[10px] text-[#646e7a]">Inspect and run audits across individual user decision histories.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase text-[#646e7a] font-bold">Query UUID:</span>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="bg-black/45 border border-white/5 text-xs text-blue-400 rounded px-2.5 py-1 font-mono focus:outline-none"
                        >
                          <option value="">-- select profile --</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.id} ({u.status})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!selectedUserId ? (
                      <div className="p-8 text-center text-[#646e7a] font-mono text-xs">
                        NO ACCOUNT UUID SELECTED. CHOOSE FROM DEPLOYED LIST ABOVE.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                        {/* Summary and remediation controls */}
                        <div className="lg:col-span-1 bg-black/30 border border-white/5 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                          <div className="space-y-3.5">
                            <div>
                              <span className="text-[8px] text-[#646e7a] block uppercase font-bold">Selected User</span>
                              <span className="text-white font-bold block truncate">{selectedUserId}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-[#646e7a] block uppercase font-bold">Status Record</span>
                              <span className={`text-[10px] uppercase font-extrabold font-mono inline-block ${
                                users.find(u => u.id === selectedUserId)?.status === 'verified' ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {users.find(u => u.id === selectedUserId)?.status || 'NOT_FOUND'}
                              </span>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <span className="text-[8px] text-[#646e7a] block uppercase font-bold">Remediation action</span>
                              <div className="flex flex-col gap-1 text-[10px]">
                                <button onClick={() => handleAccountAction(selectedUserId, 'challenge')} className="bg-[#111319] hover:bg-slate-900 border border-white/5 py-1 px-2 rounded text-left text-slate-300">Challenge Session</button>
                                <button onClick={() => handleAccountAction(selectedUserId, 'suspend')} className="bg-[#111319] hover:bg-slate-900 border border-white/5 py-1 px-2 rounded text-left text-yellow-400">Suspend User</button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-white/5 space-y-2">
                            <span className="text-[8px] text-[#646e7a] block uppercase font-bold">Institutional purging zone</span>
                            <div className="bg-red-955/15 border border-red-900/30 p-2.5 rounded-lg space-y-2.5">
                              <label className="flex items-start gap-1.5 text-[9px] text-slate-400 leading-normal select-none cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={institutionalConsent}
                                  onChange={(e) => setInstitutionalConsent(e.target.checked)}
                                  className="mt-0.5 rounded accent-red-600"
                                />
                                <span>I attest security authorization to purge profile permanently.</span>
                              </label>
                              <button
                                onClick={() => handleCompletePurgeProfile(selectedUserId)}
                                disabled={!institutionalConsent}
                                className={`w-full py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                                  institutionalConsent ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-black/25 text-[#646e7a] cursor-not-allowed border border-white/5'
                                }`}
                              >
                                Erase profile permanent
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive chron ledger timeline */}
                        <div className="lg:col-span-2 space-y-4">
                          <span className="text-[8px] text-[#646e7a] uppercase font-bold block">Chronological Trust Actions</span>
                          
                          {timeline.length === 0 ? (
                            <div className="p-12 text-center text-[#646e7a] bg-black/20 border border-white/5 rounded-xl">
                              No history events on user {selectedUserId}. Actions update state in real time.
                            </div>
                          ) : (
                            <div className="relative border-l border-white/5 pl-4 ml-2 space-y-4 py-1.5">
                              {timeline.map((entry) => (
                                <div key={entry.id} className="relative group">
                                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-black" />
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between items-center text-[10px] text-white">
                                      <span className="font-bold">{entry.event}</span>
                                      <span className="text-[9px] text-[#646e7a]">{new Date(entry.timestamp).toISOString().replace('T', ' ').substring(0, 19)}</span>
                                    </div>
                                    <p className="text-[11px] text-[#8e96a3] font-sans">{entry.description}</p>
                                    {entry.trustScoreChange && (
                                      <span className="text-[8px] bg-white/5 text-emerald-400 rounded px-1.5 py-0.5 inline-block mt-1 uppercase">
                                        Impact: {entry.trustScoreChange}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Hardware Keys directory */}
                {activeTab === 'devices' && (
                  <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden text-left shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-semibold text-white text-sm">Hardware Key Trust Registry</h3>
                      <p className="text-[10px] text-[#646e7a]">Enforces cryptographic device key anchors to prevent emulator or hypervisor bypass spoofing.</p>
                    </div>

                    <div className="overflow-x-auto text-[11px] font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                          <tr>
                            <th className="py-3 px-6">User ID Reference</th>
                            <th className="py-3 px-4">Terminal Device Platform</th>
                            <th className="py-3 px-4">Hardware signature Hash</th>
                            <th className="py-3 px-4">Attestation Key</th>
                            <th className="py-3 px-6 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {devices.map(dev => (
                            <tr key={dev.id} className="hover:bg-white/[0.01] group transition-colors">
                              <td className="py-3.5 px-6 font-bold text-blue-400 select-all">{dev.user_id}</td>
                              <td className="py-3.5 px-4 font-sans text-white font-medium">{dev.platform}</td>
                              <td className="py-3.5 px-4 select-all">{dev.device_fingerprint_hash}</td>
                              <td className="py-3.5 px-4 text-teal-400 select-all max-w-[120px] truncate">
                                <code>SHA-256_{dev.device_public_key.substring(27, 48)}...</code>
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  onClick={() => setInspectRecord({ type: 'device', data: dev })}
                                  className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 8. Signature Verification indexes */}
                {activeTab === 'signatures' && (
                  <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden text-left shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-semibold text-white text-sm">Signature Verification indexes directory</h3>
                      <p className="text-[10px] text-[#646e7a]">ZKP attestation templates. Raw credentials or posture metrics are destroyed instantly post-signature generation.</p>
                    </div>

                    <div className="overflow-x-auto text-[11px] font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                          <tr>
                            <th className="py-3 px-6">Signature ID</th>
                            <th className="py-3 px-4">User Link</th>
                            <th className="py-3 px-4">Template Hash commit</th>
                            <th className="py-3 px-4">Model Ver</th>
                            <th className="py-3 px-4">Match confidence</th>
                            <th className="py-3 px-6 text-right font-semibold">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {signatureTemplates.map(tmpl => (
                            <tr key={tmpl.id} className="hover:bg-white/[0.01] group transition-colors">
                              <td className="py-3.5 px-6 select-all">{tmpl.id}</td>
                              <td className="py-3.5 px-4 font-bold text-blue-400 select-all">{tmpl.user_id}</td>
                              <td className="py-3.5 px-4 text-[#8e96a3] select-all font-mono">{tmpl.template_hash}</td>
                              <td className="py-3.5 px-4 text-[#646e7a]">{tmpl.model_version}</td>
                              <td className="py-3.5 px-4 text-emerald-400 font-bold">{tmpl.confidence_score}%</td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  onClick={() => setInspectRecord({ type: 'signature', data: tmpl })}
                                  className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 9. Enterprise Rule & Policies */}
                {activeTab === 'policies' && (
                  <div className="space-y-6 text-left">
                    <div className="bg-[#0c0d12] border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-blue-600/10 text-blue-400 border border-blue-900/30 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded">Remediation Engine</span>
                            <h3 className="font-semibold text-white text-base">Conditional Control Policies</h3>
                          </div>
                          <p className="text-xs text-[#646e7a] leading-relaxed max-w-2xl">
                            Deploy real-time policies that evaluate telemetry conditions (like hardware keys, automation timing thresholds, duplicate templates) to auto-trigger remedies.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowPolicyModal(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shrink-0"
                        >
                          + Configure Custom Rule
                        </button>
                      </div>
                    </div>

                    {/* Policy creator modal block */}
                    {showPolicyModal && (
                      <div className="bg-[#0c0d12] border border-blue-600/30 rounded-2xl p-6 space-y-4 animate-fade-in text-xs font-mono">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                          <span className="font-bold text-white uppercase">Define Engine Rule policy</span>
                          <button onClick={() => setShowPolicyModal(false)} className="text-[#646e7a] hover:text-white cursor-pointer font-bold font-sans">✕</button>
                        </div>
                        <form onSubmit={handleCreatePolicy} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase text-[#646e7a] font-bold">Rule Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Bot Farm Signup check"
                              value={policyForm.name}
                              onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                              className="w-full bg-black/45 border border-white/5 px-3 py-2 rounded focus:outline-none focus:border-blue-500 text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase text-[#646e7a] font-bold">Mitigation Target</label>
                            <select
                              value={policyForm.thenAction}
                              onChange={(e: any) => setPolicyForm({ ...policyForm, thenAction: e.target.value })}
                              className="w-full bg-black/45 border border-white/5 px-3 py-2 rounded focus:outline-none text-slate-350"
                            >
                              <option value="suspend">Suspend User</option>
                              <option value="challenge">Challenge Session</option>
                              <option value="flag">Flag Risk</option>
                              <option value="remove_fraud">Erase Fraud profile</option>
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] uppercase text-[#646e7a] font-bold">IF CONDITIONS MET (No-Code Evaluation query)</label>
                            <input
                              type="text"
                              value={policyForm.conditions}
                              onChange={(e) => setPolicyForm({ ...policyForm, conditions: e.target.value })}
                              className="w-full bg-black/45 border border-white/5 px-3 py-2 rounded focus:outline-none text-blue-400"
                              required
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] uppercase text-[#646e7a] font-bold">Remediation team summary Note</label>
                            <textarea
                              rows={2}
                              value={policyForm.description}
                              onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                              className="w-full bg-black/45 border border-white/5 px-3 py-2 rounded focus:outline-none text-slate-350"
                              placeholder="Describe why this policy was created..."
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowPolicyModal(false)} className="bg-black/30 border border-white/5 hover:bg-white/5 px-4 py-1.5 rounded text-[#8e96a3] cursor-pointer">Cancel</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-1.5 rounded cursor-pointer">Deploy Policy</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Policies listing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      {policies.map(p => (
                        <div key={p.id} className="bg-[#0c0d12] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center gap-3">
                              <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${p.active ? 'bg-emerald-955 border-emerald-900 text-emerald-400' : 'bg-black/45 text-slate-500 border-white/5'}`}>
                                {p.active ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#646e7a] font-sans line-clamp-2">{p.description}</p>
                          </div>
                          <div className="bg-black/40 border border-white/5 p-2.5 rounded text-blue-400 select-all break-all whitespace-pre-wrap leading-normal">
                            <span className="text-[#646e7a] block text-[8px] uppercase font-bold mb-1 select-none">EVALUATION QUERY</span>
                            {p.conditions}
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] text-[#646e7a] uppercase font-bold">REMEDY:</span>
                              <span className="text-[9px] bg-indigo-955 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900 uppercase font-extrabold">{p.thenAction}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleTogglePolicy(p.id)} className="bg-black/40 hover:bg-black/85 border border-white/5 rounded px-2 py-0.5 text-[10px] text-[#8e96a3] hover:text-white cursor-pointer transition-all">Toggle</button>
                              <button onClick={() => handleDeletePolicy(p.id)} className="border border-white/5 rounded px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-955 hover:text-white cursor-pointer transition-all">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* 10. System Audit Logs trail */}
                {activeTab === 'audits' && (
                  <div className="bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden text-left shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">Cryptographic Compliance Audit Trail</h3>
                        <p className="text-[10px] text-[#646e7a]">Immutable auditing database indexing administrator interventions, policy deploys, and webhook operations.</p>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#646e7a] absolute left-2.5 top-2" />
                        <input
                          type="text"
                          placeholder="Search Audit trail..."
                          value={auditQuery}
                          onChange={(e) => setAuditQuery(e.target.value)}
                          className="bg-black/44 border border-white/5 rounded pl-8 pr-3 py-1 text-xs text-white focus:outline-none w-52 font-mono"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto text-[10px] font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-black/30 font-mono text-[9px] uppercase tracking-wider text-[#646e7a] border-b border-white/5">
                          <tr>
                            <th className="py-3 px-6">ID</th>
                            <th className="py-3 px-4">Actor ID / Type</th>
                            <th className="py-3 px-4">Event trigger</th>
                            <th className="py-3 px-4">Target context</th>
                            <th className="py-3 px-4">Metadata Payload</th>
                            <th className="py-3 px-6 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {filteredAudits.map(log => (
                            <tr key={log.id} className="hover:bg-white/[0.01] group transition-colors">
                              <td className="py-3 px-6 text-[#646e7a]">{log.id}</td>
                              <td className="py-3 px-4">
                                <span className="text-white font-bold">{log.actor_type.toUpperCase()}</span>: 
                                <code className="text-[#646e7a] text-[9px] block truncate max-w-[100px]" title={log.actor_id}>{log.actor_id}</code>
                              </td>
                              <td className="py-3 px-4 text-emerald-400 font-bold">{highlightMatch(log.action, auditQuery)}</td>
                              <td className="py-3 px-4 font-bold text-white">
                                {log.target_type.toUpperCase()}: <span className="text-blue-400 font-normal text-[9px] block">{log.target_id}</span>
                              </td>
                              <td className="py-3 px-4 text-[#646e7a] max-w-xs truncate font-mono text-[9px]" title={JSON.stringify(log.metadata)}>
                                {JSON.stringify(log.metadata)}
                              </td>
                              <td className="py-3 px-6 text-right">
                                <button
                                  onClick={() => setInspectRecord({ type: 'audit', data: log })}
                                  className="text-blue-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 ml-auto group-hover:translate-x-0.5"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 11. Security Bug Bounty Reports Management */}
                {activeTab === 'security-reports' && (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">Security Bug Bounty Console</h3>
                        <p className="text-[10px] text-[#646e7a]">Review incoming whitehat vulnerability reports, assign severity, trigger payouts, and coordinate responsible patches.</p>
                      </div>
                      
                      {/* Filtering */}
                      <div className="flex gap-2.5">
                        <select
                          value={bountyFilter}
                          onChange={(e) => setBountyFilter(e.target.value)}
                          className="bg-black/45 border border-white/5 rounded px-3 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-yellow-500 font-mono"
                        >
                          <option value="all">All Statuses</option>
                          <option value="new">Pending Triage</option>
                          <option value="triaged">Triaged</option>
                          <option value="patched">Patched</option>
                          <option value="payout_paid">Paid Tiers</option>
                          <option value="duplicate">Duplicates</option>
                          <option value="closed">Closed / Invalid</option>
                        </select>
                      </div>
                    </div>

                    {/* Stats widgets */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl font-mono text-left">
                        <span className="text-[#646e7a] text-[9px] uppercase font-bold block">Total Disclosures</span>
                        <span className="text-xl font-bold text-white mt-1 block">{securityReports.length}</span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl font-mono text-left border-l-2 border-l-yellow-500">
                        <span className="text-yellow-500 text-[9px] uppercase font-bold block">Pending Triage</span>
                        <span className="text-xl font-bold text-yellow-500 mt-1 block">
                          {securityReports.filter((r: any) => r.status === 'new').length}
                        </span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl font-mono text-left border-l-2 border-l-emerald-500">
                        <span className="text-emerald-400 text-[9px] uppercase font-bold block">Paid Payouts</span>
                        <span className="text-xl font-bold text-emerald-400 mt-1 block">
                          {securityReports.filter((r: any) => r.status === 'payout_paid').length}
                        </span>
                      </div>
                      <div className="bg-[#0c0d12] border border-white/5 p-4 rounded-xl font-mono text-left">
                        <span className="text-slate-400 text-[9px] uppercase font-bold block">Total Paid Rewards</span>
                        <span className="text-xl font-bold text-white mt-1 block">
                          ${securityReports.reduce((sum: number, r: any) => sum + (r.bounty_amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      
                      {/* Left: Reports table */}
                      <div className="lg:col-span-2 bg-[#0c0d12] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-4 bg-black/30 border-b border-white/5 font-bold text-white text-xs font-mono uppercase">
                          Active Vulnerability Reports
                        </div>

                        <div className="overflow-x-auto text-[11px] font-mono">
                          <table className="w-full text-left">
                            <thead className="bg-black/20 text-[#646e7a] text-[9px] uppercase border-b border-white/5">
                              <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Vulnerability Title</th>
                                <th className="p-3">Researcher</th>
                                <th className="p-3">Severity</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-350">
                              {securityReports
                                .filter((r: any) => bountyFilter === 'all' || r.status === bountyFilter)
                                .map((rep: any) => (
                                  <tr key={rep.id} className="hover:bg-white/[0.01] transition">
                                    <td className="p-3 text-[#646e7a] font-mono text-[10px]">{rep.id}</td>
                                    <td className="p-3 font-semibold text-white max-w-[150px] truncate" title={rep.title}>{rep.title}</td>
                                    <td className="p-3 text-slate-400 max-w-[120px] truncate" title={rep.reporter_contact}>{rep.reporter_contact}</td>
                                    <td className="p-3">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        rep.severity === 'critical' ? 'bg-red-955 text-red-400 border border-red-900/40' :
                                        rep.severity === 'high' ? 'bg-orange-950 text-orange-400 border border-orange-900/40' :
                                        rep.severity === 'medium' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/40' :
                                        'bg-blue-950 text-blue-400 border border-blue-900/40'
                                      }`}>
                                        {rep.severity}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                        rep.status === 'payout_paid' || rep.status === 'patched' ? 'bg-emerald-950 text-emerald-400' :
                                        rep.status === 'duplicate' || rep.status === 'closed' ? 'bg-slate-900 text-slate-500' :
                                        'bg-yellow-950 text-yellow-500 animate-pulse'
                                      }`}>
                                        {rep.status?.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => {
                                          setTriagingReportId(rep.id);
                                          setTriageActionState({
                                            action: 'triage',
                                            severity: rep.severity,
                                            bounty_amount: rep.bounty_amount || 1000,
                                            internal_notes: rep.internal_notes || '',
                                            duplicate_of: rep.duplicate_of || ''
                                          });
                                        }}
                                        className="text-blue-400 hover:text-white underline text-[10px] cursor-pointer"
                                      >
                                        Triage &rarr;
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Triaging & Action Form */}
                      <div className="lg:col-span-1 space-y-4">
                        {triagingReportId ? (
                          (() => {
                            const selectedReport = securityReports.find(r => r.id === triagingReportId);
                            if (!selectedReport) return null;

                            return (
                              <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-5 space-y-4 font-mono text-[11px] text-slate-350">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span className="text-white font-bold uppercase text-xs font-mono">TRIAGE RADAR: {selectedReport.id}</span>
                                  <button onClick={() => setTriagingReportId(null)} className="text-[#646e7a] hover:text-white">&times;</button>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <span className="text-slate-500 text-[9px] block">TITLE & CATEGORY</span>
                                    <span className="text-white font-bold">{selectedReport.title}</span>
                                    <span className="text-blue-400 text-[9px] block uppercase font-semibold mt-0.5">{selectedReport.category?.replace('_', ' ')}</span>
                                  </div>

                                  <div>
                                    <span className="text-slate-500 text-[9px] block font-mono">AFFECTED COMPONENT</span>
                                    <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded text-[10px] break-all block mt-0.5">{selectedReport.affected_system}</code>
                                  </div>

                                  <div className="max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded border border-white/5 space-y-2">
                                    <div>
                                      <span className="text-slate-500 text-[9px] block uppercase font-mono">Reproduction steps</span>
                                      <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">{selectedReport.reproduction_steps}</p>
                                    </div>
                                    {selectedReport.submitted_evidence && (
                                      <div className="pt-2 border-t border-white/5">
                                        <span className="text-slate-500 text-[9px] block uppercase font-mono">Evidence / Payload</span>
                                        <pre className="text-yellow-400 text-[10.5px] overflow-x-auto whitespace-pre">{selectedReport.submitted_evidence}</pre>
                                      </div>
                                    )}
                                  </div>

                                  {/* Management form */}
                                  <form onSubmit={(e) => { e.preventDefault(); handleTriageActionSubmit(selectedReport.id); }} className="space-y-3 border-t border-white/5 pt-3">
                                    <div className="space-y-1">
                                      <span className="text-slate-500 text-[9px] block uppercase font-mono">Triage Phase *</span>
                                      <select
                                        value={triageActionState.action}
                                        onChange={(e) => setTriageActionState({ ...triageActionState, action: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/5 rounded py-1 px-2 focus:outline-none focus:border-yellow-500 text-white font-mono text-[11px]"
                                      >
                                        <option value="triage">Assign Severity & Notes</option>
                                        <option value="mark_duplicate">Mark as Duplicate</option>
                                        <option value="apply_patch">Mark Patched / remediated</option>
                                        <option value="approve_payout">Approve Bounty Payout</option>
                                        <option value="close">Close / Invalid report</option>
                                      </select>
                                    </div>

                                    {triageActionState.action === 'triage' && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <span className="text-slate-500 text-[9px] block uppercase font-mono">Severity</span>
                                          <select
                                            value={triageActionState.severity}
                                            onChange={(e) => setTriageActionState({ ...triageActionState, severity: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/5 rounded py-1 px-2 text-white font-mono text-[11px]"
                                          >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-slate-500 text-[9px] block uppercase font-mono">Bounty ($)</span>
                                          <input
                                            type="number"
                                            value={triageActionState.bounty_amount}
                                            onChange={(e) => setTriageActionState({ ...triageActionState, bounty_amount: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-950 border border-white/5 rounded py-1 px-2 text-emerald-400 font-bold font-mono text-[11px]"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {triageActionState.action === 'mark_duplicate' && (
                                      <div className="space-y-1">
                                        <span className="text-slate-500 text-[9px] block uppercase font-mono">Original Report ID</span>
                                        <input
                                          type="text"
                                          required
                                          placeholder="e.g. rep_8ef77b"
                                          value={triageActionState.duplicate_of}
                                          onChange={(e) => setTriageActionState({ ...triageActionState, duplicate_of: e.target.value })}
                                          className="w-full bg-slate-950 border border-white/5 rounded py-1 px-2 text-white font-mono text-[11px]"
                                        />
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <span className="text-slate-500 text-[9px] block uppercase font-mono">Response Notes</span>
                                      <textarea
                                        required
                                        placeholder="Add notes for the whitehat. This will display on their search status page."
                                        value={triageActionState.internal_notes}
                                        onChange={(e) => setTriageActionState({ ...triageActionState, internal_notes: e.target.value })}
                                        className="w-full h-20 bg-slate-950 border border-white/5 rounded py-1 px-2 text-slate-300 font-sans text-xs"
                                      />
                                    </div>

                                    <button
                                      type="submit"
                                      disabled={isTriaging}
                                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 py-1.5 rounded font-bold font-mono transition text-xs"
                                    >
                                      {isTriaging ? "Deploying triage..." : "Save Triage Assessment &rarr;"}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-6 text-center text-[#646e7a] font-mono text-[11px] h-full flex flex-col justify-center items-center">
                            <Shield className="h-8 w-8 text-[#646e7a]/40 mb-2" />
                            SELECT A WHITEHAT DISCLOSURE TO ACTIVATE SECURE TRIAGING CONTROLS
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      {/* Interactive Operational Inspection Drawer overlay panel */}
      <AnimatePresence>
        {inspectRecord && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectRecord(null)}
              className="fixed inset-0 bg-black/60 z-40 cursor-pointer"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 180 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0c0d12] border-l border-white/5 shadow-2xl z-50 flex flex-col justify-between text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-950/40 text-blue-400 p-2 rounded border border-blue-900/40">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Operational Inspector</h3>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#646e7a] block mt-0.5">
                      Scope: {inspectRecord.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectRecord(null)}
                  className="text-[#646e7a] hover:text-white cursor-pointer hover:rotate-90 transition-transform p-1 rounded hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Attributes Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs leading-relaxed">
                
                {/* Structural boundaries definitions - Why, Problem, action */}
                <div className="bg-[#111319] border border-white/5 p-4 rounded-xl space-y-1.5">
                  <span className="font-mono text-[9px] text-blue-400 block font-bold uppercase tracking-wider">Audit Attestation Meta</span>
                  <div className="space-y-1 text-slate-350">
                    <p><strong>Why this exists:</strong> Allows administrator validation & remediation checks inside Stage 4.</p>
                    <p><strong>Problem solved:</strong> Prevents unauthorized bot activity, duplicate templates, and evasive bypass attempts while keeping private identity protected.</p>
                    <p><strong>Administrator capability:</strong> Statefully modify directories, approve override challenges, or perform compliant account database purges.</p>
                  </div>
                </div>

                {/* Main Attributes list depending on record type */}
                <div className="space-y-4">
                  <span className="font-mono text-[9px] uppercase text-[#646e7a] tracking-widest block font-bold">DIRECTORY DATASET FIELDS</span>
                  
                  {inspectRecord.type === 'session' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Session ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Linked User:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.external_user_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Attestation Risk:</span>
                        <span className="text-white font-bold">{inspectRecord.data.risk_score} / 100</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Duplicate match:</span>
                        <span className="text-white font-bold">{inspectRecord.data.duplicate_candidate ? 'DUPLICATE MATCHED' : 'UNIQUE'}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="text-[#646e7a] block">Outcome rationale note:</span>
                        <div className="bg-black/40 p-2.5 rounded text-[11px] text-slate-300 font-sans">{inspectRecord.data.result_reason}</div>
                      </div>
                    </div>
                  )}

                  {inspectRecord.type === 'user' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">User UUID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Status code:</span>
                        <span className="text-white font-bold uppercase">{inspectRecord.data.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">ZKP Human UID Commit:</span>
                        <span className="text-slate-400 select-all truncate max-w-[200px]" title={inspectRecord.data.human_uid}>{inspectRecord.data.human_uid}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Inception:</span>
                        <span className="text-white font-bold">{new Date(inspectRecord.data.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {inspectRecord.type === 'device' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Device Record ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">User link ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.user_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Fingerprint hash:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.device_fingerprint_hash}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">OS Platform:</span>
                        <span className="text-white font-bold font-sans">{inspectRecord.data.platform}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">RSA PEM Attestation Public Key:</span>
                        <div className="bg-black/40 p-2.5 rounded font-mono text-[9px] text-[#646e7a] select-all break-all h-20 overflow-y-auto">
                          {inspectRecord.data.device_public_key}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectRecord.type === 'signature' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Record ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Account link:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.user_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Uniqueness template Hash:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.template_hash}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Confidence:</span>
                        <span className="text-emerald-400 font-bold">{inspectRecord.data.confidence_score}%</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Encrypted buffer blob snapshot:</span>
                        <div className="bg-black/40 p-2 rounded text-[10px] select-all break-all">
                          {inspectRecord.data.encrypted_template}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectRecord.type === 'security-event' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Threat event ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Vector type:</span>
                        <span className="text-white font-bold text-[10px]">{inspectRecord.data.event_type}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">IP Location:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.ip_address}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Detected path:</span>
                        <span className="text-white font-bold text-[10px]">{inspectRecord.data.request_path || '/'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Anomaly diagnostic text:</span>
                        <p className="bg-black/40 p-2 rounded font-sans text-[11px] text-red-400 leading-normal">{inspectRecord.data.detection_reason}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Decrypted headers metadata block:</span>
                        <pre className="bg-black/50 p-2 rounded text-[9px] text-[#8e96a3] overflow-x-auto select-all">{JSON.stringify(inspectRecord.data.raw_metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {inspectRecord.type === 'audit' && (
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Audit log ID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Audit actor UUID:</span>
                        <span className="text-white font-bold select-all">{inspectRecord.data.actor_id}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Triggered action:</span>
                        <span className="text-emerald-400 font-bold uppercase">{inspectRecord.data.action}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[#646e7a]">Target Scope:</span>
                        <span className="text-white font-bold">{inspectRecord.data.target_type} • {inspectRecord.data.target_id}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Decoded Claims values:</span>
                        <pre className="bg-black/50 p-2 rounded text-[9px] text-[#8e96a3] overflow-x-auto select-all">{JSON.stringify(inspectRecord.data.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Quick Administrator Remediations Actions panel */}
              <div className="p-6 border-t border-white/5 bg-black/40 space-y-4">
                <span className="font-mono text-[9px] uppercase text-[#646e7a] tracking-widest block font-bold">REMEDIATION QUICK ACTION</span>
                
                {inspectRecord.type === 'session' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => triggerSessionAction(inspectRecord.data.id, 'approve')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] py-2 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Override
                    </button>
                    <button
                      onClick={() => triggerSessionAction(inspectRecord.data.id, 'reject')}
                      className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900/40 font-mono font-bold text-[10px] py-2 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Session
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUserId(inspectRecord.data.external_user_id || 'usr_df990a31');
                        setActiveTab('timeline');
                        setInspectRecord(null);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-white/5 text-xs py-2 rounded col-span-2 text-center text-white cursor-pointer"
                    >
                      Inspect linked user timeline →
                    </button>
                  </div>
                )}

                {inspectRecord.type === 'user' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {inspectRecord.data.status === 'suspended' ? (
                        <button
                          onClick={() => triggerUserAction(inspectRecord.data.id, 'verify')}
                          className="bg-emerald-950 border border-emerald-900 text-emerald-400 py-1.5 rounded cursor-pointer hover:bg-emerald-800 hover:text-white"
                        >
                          Reinstate profile
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerUserAction(inspectRecord.data.id, 'suspend')}
                          className="bg-yellow-950/20 border border-yellow-900/30 text-yellow-400 py-1.5 rounded cursor-pointer hover:bg-yellow-900 hover:text-slate-950"
                        >
                          Suspend Profile
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUserId(inspectRecord.data.id);
                          setActiveTab('timeline');
                          setInspectRecord(null);
                        }}
                        className="bg-slate-900 border border-white/5 py-1.5 rounded text-white cursor-pointer hover:bg-slate-800"
                      >
                        Browse timeline
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <span className="text-[8px] text-red-400 font-mono font-bold block uppercase tracking-wider">CRITICAL PROFILE PURGING</span>
                      <div className="bg-red-955/15 border border-red-900/30 p-2.5 rounded-lg space-y-2 text-xs">
                        <label className="flex items-start gap-1.5 text-[9px] text-slate-400 leading-normal cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={institutionalConsent}
                            onChange={(e) => setInstitutionalConsent(e.checked || e.target.checked)}
                            className="mt-0.5 rounded accent-red-600"
                          />
                          <span>Confirm authorization to purge this user profile forever.</span>
                        </label>
                        <button
                          onClick={() => handleCompletePurgeProfile(inspectRecord.data.id)}
                          disabled={!institutionalConsent}
                          className={`w-full py-1.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                            institutionalConsent ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-black/25 text-[#646e7a] border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          Erase Record permanent
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {inspectRecord.type === 'device' && (
                  <div className="space-y-2 text-[10px] font-mono">
                    <p className="text-[#646e7a]">Device hardware public keys are linked to physical hardware signatures. Suspend the parent user or trigger custom security policies to enforce challenges.</p>
                    <button
                      onClick={() => {
                        setSelectedUserId(inspectRecord.data.user_id);
                        setActiveTab('timeline');
                        setInspectRecord(null);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-white/5 py-2 rounded text-white text-xs cursor-pointer text-center"
                    >
                      Open device owner timeline →
                    </button>
                  </div>
                )}

                {inspectRecord.type === 'security-event' && (
                  <div className="space-y-3 font-mono">
                    {inspectRecord.data.raw_metadata?.resolved ? (
                      <div className="bg-emerald-955/10 border border-emerald-900/30 p-3 rounded-lg text-emerald-400 text-[11px] leading-relaxed">
                        <strong>Resolution Note:</strong> "{inspectRecord.data.raw_metadata.resolution_notes}"
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[#646e7a] text-[9px] block uppercase font-bold">Apply active resolution override</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Mitigation notes, firewall overrides..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none"
                          />
                          <button
                            onClick={() => handleResolveEvent(inspectRecord.data.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inspectRecord.type === 'signature' && (
                  <div className="text-[10px] font-mono text-[#646e7a]">
                    <span>Post-attestation signature indexes cannot be statefully altered because raw biological timings are shredded from RAM. Remediate or purge the parent user node if suspicious duplicates arise.</span>
                  </div>
                )}

                {inspectRecord.type === 'audit' && (
                  <div className="text-[10px] font-mono text-[#646e7a]">
                    <span>Cryptographic audit trail ledger records are immutable and cannot be statefully altered. Use direct SIEM APIs for external ledger audits.</span>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
