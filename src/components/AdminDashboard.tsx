import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Users, 
  Database, 
  Lock, 
  AlertTriangle,
  RefreshCw, 
  Check, 
  X, 
  Search,
  Sliders,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { User, SignatureTemplate, Device, VerificationSession, AuditLog } from '../types';

interface AdminDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Navigation tabs (max 5)
  const [activeTab, setActiveTab] = useState<'health' | 'identities' | 'audit' | 'policies' | 'bounties'>('health');

  // Core States
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [securityRisk, setSecurityRisk] = useState<any>({ score: 4, level: "low" });
  const [securityReports, setSecurityReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Create Policy State
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyCond, setNewPolicyCond] = useState("Device Trust < 40");
  const [newPolicyAction, setNewPolicyAction] = useState("suspend");
  const [newPolicyDesc, setNewPolicyDesc] = useState("");
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Sessions
      let sessData;
      try {
        const res = await fetch('/api/internal/sessions');
        sessData = await res.json();
      } catch {
        sessData = [];
      }
      setSessions(sessData);

      // 2. Users
      let usersData;
      try {
        const res = await fetch('/api/internal/users');
        usersData = await res.json();
      } catch {
        usersData = [
          { id: "usr_df990a31", external_id: "fintech_external_alice_77", human_score: 98, device_count: 1, created_at: "2026-06-21T06:16:56" },
          { id: "usr_bc120ef6", external_id: "dao_external_bob_99", human_score: 95, device_count: 2, created_at: "2026-06-22T08:14:12" }
        ];
      }
      setUsers(usersData);

      // 3. Devices
      let devData;
      try {
        const res = await fetch('/api/internal/devices');
        devData = await res.json();
      } catch {
        devData = [];
      }
      setDevices(devData);

      // 4. Audit Logs
      let auditsData;
      try {
        const res = await fetch('/api/internal/audit-logs');
        auditsData = await res.json();
      } catch {
        auditsData = [
          { id: "log_1", actor_type: "partner", actor_id: "partner_apps_fintech_123", action: "session.create", target_type: "session", target_id: "vss_session_unconfirmed_9a4", created_at: "2026-06-23T04:16:56.643Z" }
        ];
      }
      setAuditLogs(auditsData);

      // 5. Policies
      let polData;
      try {
        const res = await fetch('/api/internal/policies');
        polData = await res.json();
      } catch {
        polData = [
          { id: "pol_1", name: "Sybil Protection Ruleset", conditions: "face_similarity > 90%", thenAction: "suspend", active: true, description: "Instantly flags identity credentials failing facial biometric uniqueness." },
          { id: "pol_2", name: "Impossible Velocity Limit", conditions: "requests_count_10m > 10", thenAction: "flag", active: true, description: "Flags high-frequency automated verification attempts." }
        ];
      }
      setPolicies(polData);

      // 6. Security Risk & Events
      let secRiskData;
      try {
        const res = await fetch('/api/internal/security-risk');
        secRiskData = await res.json();
      } catch {
        secRiskData = { score: 12, level: "low" };
      }
      setSecurityRisk(secRiskData);

      let secEventsData;
      try {
        const res = await fetch('/api/internal/security-events');
        secEventsData = await res.json();
      } catch {
        secEventsData = [
          { id: "evt_1", event_type: "unusual_ip_activity", severity: "medium", status: "open", metadata: { ip: "192.168.1.50", reason: "Rate limits approached" } }
        ];
      }
      setSecurityEvents(secEventsData);

      // 7. Bug bounty security reports
      let reportsData;
      try {
        const res = await fetch('/api/internal/security-reports');
        reportsData = await res.json();
      } catch {
        reportsData = [
          { id: "rep_1", title: "Memory Leak in Secp256k1 compiling", researcher: "sec_hacker_99", severity: "medium", bounty_status: "paid", bounty_amount: 1200 }
        ];
      }
      setSecurityReports(reportsData);

    } catch (err) {
      console.warn("Using local admin states.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName.trim()) return;
    setIsCreatingPolicy(true);
    try {
      const res = await fetch('/api/internal/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPolicyName,
          conditions: newPolicyCond,
          thenAction: newPolicyAction,
          description: newPolicyDesc
        })
      });
      if (res.ok) {
        setNewPolicyName("");
        setNewPolicyDesc("");
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed creating policy", err);
    } finally {
      setIsCreatingPolicy(false);
    }
  };

  const handlePurgeUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently purge this user identity and its keys from memory?")) return;
    try {
      const res = await fetch('/api/v1/account/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Purge failure", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#8c919d] font-sans flex flex-col md:flex-row">
      
      {/* Redesigned Sidebar (Max 5 Navigation Items) */}
      <aside className="w-full md:w-64 bg-[#08090c] border-b md:border-b-0 md:border-r border-white/[0.04] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-xs block leading-none">AAN</span>
              <span className="text-[8px] font-mono uppercase text-[#646e7a] tracking-widest block mt-0.5">Admin Console</span>
            </div>
          </div>

          {/* Navigation Links (Max 5) */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('health')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'health' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>System Health</span>
            </button>
            
            <button
              onClick={() => setActiveTab('identities')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'identities' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Attested Identities</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'audit' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Audit Trails</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'policies' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Defensive Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('bounties')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'bounties' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bounty Reports</span>
            </button>
          </nav>

        </div>

        <div className="pt-8 border-t border-white/[0.03] mt-8 text-center hidden md:block">
          <button 
            onClick={() => onNavigate('landing')} 
            className="text-[10px] font-mono uppercase text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <span>Platform Home</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 space-y-10 overflow-y-auto max-w-5xl mx-auto w-full relative">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-xs font-mono tracking-wider">Loading global registry...</span>
          </div>
        ) : (
          <>
            
            {/* TAB 1: SYSTEM HEALTH */}
            {activeTab === 'health' && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Threat indicators row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Threat Index Score</span>
                    <span className="text-3xl font-light text-white font-sans">
                      {securityRisk.score || 0}
                      <span className="text-xs text-slate-500 font-mono font-medium ml-2">/ 100 max</span>
                    </span>
                  </div>

                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Active Security Level</span>
                    <span className="text-3xl font-light text-emerald-400 font-sans uppercase">
                      {securityRisk.level || "LOW"}
                    </span>
                  </div>

                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">System Status</span>
                    <span className="text-3xl font-light text-white font-sans flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Nominal</span>
                    </span>
                  </div>
                </div>

                {/* Anomalies and Threats table (answering a business/security question) */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Real-Time Intrusion Anomalies</h2>
                    <p className="text-xs text-slate-500 mt-1">Answering: What active threat anomalies are the posture triggers currently containing?</p>
                  </div>

                  <div className="space-y-2.5">
                    {securityEvents.map((evt) => (
                      <div key={evt.id} className="bg-black/20 border border-white/[0.02] p-4 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-mono text-rose-400 font-semibold">{evt.event_type.replace(/_/g, ' ').toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">Location: {evt.metadata?.ip || "Unknown IP"} • Reason: {evt.metadata?.reason || "N/A"}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/[0.04] border border-rose-500/[0.12] text-[9px] font-mono text-rose-400 font-bold uppercase">
                          {evt.severity} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ATTESTED IDENTITIES */}
            {activeTab === 'identities' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Attested Human Registry</h2>
                  <p className="text-xs text-slate-500 mt-1">Authorized unique user credentials verified via memory signature anchors. Safe to purge on request.</p>
                </div>

                <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-5 font-bold">User UID</th>
                          <th className="py-3 px-5 font-bold">Partner Subject ID</th>
                          <th className="py-3 px-5 font-bold">Trust Authenticity</th>
                          <th className="py-3 px-5 font-bold">Registered Keys</th>
                          <th className="py-3 px-5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-xs text-slate-300">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-5 font-mono text-[11px] text-white font-medium">{user.id}</td>
                            <td className="py-3 px-5 font-mono text-slate-400">{user.external_id}</td>
                            <td className="py-3 px-5 font-mono text-white font-semibold">{user.human_score}% Human</td>
                            <td className="py-3 px-5 font-mono text-slate-400">{user.device_count} hardware token(s)</td>
                            <td className="py-3 px-5 text-right">
                              <button
                                onClick={() => handlePurgeUser(user.id)}
                                className="inline-flex items-center gap-1 bg-rose-500/[0.05] text-rose-400 hover:bg-rose-500/[0.1] text-[10px] font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-rose-500/[0.12]"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Purge Identity</span>
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

            {/* TAB 3: AUDIT TRAILS */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Administrative Logs</h2>
                  <p className="text-xs text-slate-500 mt-1">Cryptographically immutable logs of developer access and platform events.</p>
                </div>

                <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-5 font-bold">Log ID</th>
                          <th className="py-3 px-5 font-bold">Actor</th>
                          <th className="py-3 px-5 font-bold">Action Triggered</th>
                          <th className="py-3 px-5 font-bold">Target Resource</th>
                          <th className="py-3 px-5 font-bold">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-xs text-slate-300">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-5 font-mono text-[11px] text-slate-500">{log.id}</td>
                            <td className="py-3 px-5 font-mono text-white">{log.actor_id}</td>
                            <td className="py-3 px-5 font-mono text-emerald-400">{log.action}</td>
                            <td className="py-3 px-5 font-mono text-slate-400">{log.target_type} ({log.target_id})</td>
                            <td className="py-3 px-5 text-slate-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: DEFENSIVE POLICIES */}
            {activeTab === 'policies' && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Current policies */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white tracking-tight">Active Policy Handlers</h2>
                      <p className="text-xs text-slate-500 mt-1">Automated posture rules evaluated before signing single-session tokens.</p>
                    </div>

                    <div className="space-y-3">
                      {policies.map((pol) => (
                        <div key={pol.id} className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">{pol.name}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/[0.04] text-emerald-400 border border-emerald-500/[0.12] text-[8px] font-mono uppercase font-bold">
                              {pol.thenAction}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">Conditions: {pol.conditions}</p>
                          <p className="text-xs text-[#646e7a]">{pol.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* New policy form */}
                  <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white tracking-tight">Deploy New Defense Rule</h2>
                      <p className="text-xs text-slate-500 mt-1">Append custom verification requirements to the volatile RAM compiler pipeline.</p>
                    </div>

                    <form onSubmit={handleCreatePolicy} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Policy Rule Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Block Suspicious Hardware"
                          value={newPolicyName}
                          onChange={(e) => setNewPolicyName(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Trigger Conditions</label>
                        <input
                          type="text"
                          value={newPolicyCond}
                          onChange={(e) => setNewPolicyCond(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Enforcement Action</label>
                        <select
                          value={newPolicyAction}
                          onChange={(e) => setNewPolicyAction(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors"
                        >
                          <option value="suspend">suspend (Deny attestation and block user)</option>
                          <option value="challenge">challenge (Demand secondary hardware credential)</option>
                          <option value="flag">flag (Authorize session but dispatch threat log)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Rule Description</label>
                        <textarea
                          placeholder="Explain why this policy rule is enforced..."
                          value={newPolicyDesc}
                          onChange={(e) => setNewPolicyDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingPolicy || !newPolicyName.trim()}
                        className="w-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {isCreatingPolicy ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Deploying...</span>
                          </>
                        ) : (
                          <span>Deploy Policy</span>
                        )}
                      </button>
                    </form>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 5: BOUNTY REPORTS */}
            {activeTab === 'bounties' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Bug Bounty Vulnerability Log</h2>
                  <p className="text-xs text-slate-500 mt-1">Audit submissions regarding cryptographic handshakes, secure enclaves, or RAM posture compliance.</p>
                </div>

                <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-5 font-bold">Report Title</th>
                          <th className="py-3 px-5 font-bold">Researcher</th>
                          <th className="py-3 px-5 font-bold">Severity</th>
                          <th className="py-3 px-5 font-bold">Bounty Reward</th>
                          <th className="py-3 px-5 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-xs text-slate-300">
                        {securityReports.map((report) => (
                          <tr key={report.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-5 font-medium text-white">{report.title}</td>
                            <td className="py-3 px-5 font-mono text-slate-400">{report.researcher}</td>
                            <td className="py-3 px-5">
                              <span className="px-2 py-0.5 rounded bg-rose-500/[0.04] text-rose-400 border border-rose-500/[0.12] text-[9px] font-mono uppercase font-bold">
                                {report.severity}
                              </span>
                            </td>
                            <td className="py-3 px-5 font-mono text-white font-semibold">${report.bounty_amount} USD</td>
                            <td className="py-3 px-5 text-right font-mono text-emerald-400 text-[10px] font-bold uppercase">{report.bounty_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </>
        )}
      </main>

    </div>
  );
}
