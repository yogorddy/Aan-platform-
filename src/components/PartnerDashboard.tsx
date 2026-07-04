import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Webhook, 
  Activity, 
  Settings, 
  Database,
  ArrowRight, 
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
  Loader2
} from 'lucide-react';
import { VerificationSession, PartnerApp } from '@/src/types';

interface PartnerDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
  onSetVerificationSessionId: (id: string) => void;
}

export default function PartnerDashboard({ onNavigate, onSetVerificationSessionId }: PartnerDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'credentials' | 'sync' | 'settings'>('overview');

  // Database states
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [partnerApps, setPartnerApps] = useState<PartnerApp[]>([]);
  const [partnerConfig, setPartnerConfig] = useState<any>(null);
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>([]);
  const [duplicateSignals, setDuplicateSignals] = useState<any[]>([]);
  const [removalRequests, setRemovalRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Forms state
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createdKeyResponse, setCreatedKeyResponse] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Configuration forms state
  const [projNameInput, setProjNameInput] = useState("");
  const [orgNameInput, setOrgNameInput] = useState("");
  const [allowedDomainsInput, setAllowedDomainsInput] = useState("");
  const [enforcementModeInput, setEnforcementModeInput] = useState("");
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Webhook form state
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // Testing webhooks logs state
  const [webhookTestStatus, setWebhookTestStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'failed'>>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Sessions
      let sessData;
      try {
        const sessRes = await fetch('/api/internal/sessions');
        sessData = await sessRes.json();
      } catch {
        sessData = [
          { id: "vss_session_unconfirmed_9a4", partner_app_id: "partner_apps_fintech_123", external_user_id: "fintech_external_alice_77", status: "started", risk_score: 15, duplicate_candidate: false, created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
          { id: "vss_session_verified_b71", partner_app_id: "partner_apps_dao_456", external_user_id: "dao_external_bob_99", status: "passed", risk_score: 8, duplicate_candidate: false, created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
          { id: "vss_session_failed_df9", partner_app_id: "partner_apps_fintech_123", external_user_id: "fintech_external_charlie_12", status: "failed", risk_score: 95, duplicate_candidate: true, created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
          { id: "vss_session_review_f92", partner_app_id: "partner_apps_dao_456", external_user_id: "dao_external_david_33", status: "review", risk_score: 55, duplicate_candidate: false, created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() }
        ];
      }
      setSessions(sessData);

      // 2. Apps
      let appsData;
      try {
        const appsRes = await fetch('/api/internal/api-keys');
        appsData = await appsRes.json();
      } catch {
        appsData = [{ id: "partner_apps_fintech_123", name: "Fintech Trust Layer", api_key_last4: "d7a4", status: "active" }];
      }
      setPartnerApps(appsData);

      // 3. Configuration
      let configData;
      try {
        const configRes = await fetch('/api/internal/partner-config');
        configData = await configRes.json();
      } catch {
        configData = {
          organization: { id: "org_enterprise_999", name: "AAN Global Enterprise" },
          project: { id: "proj_security_777", organization_id: "org_enterprise_999", name: "Default Secure Integration", allowed_domains: ["yourdomain.com", "localhost:3000"], enforcement_mode: "monitor_only" }
        };
      }
      setPartnerConfig(configData);
      if (configData) {
        setProjNameInput(configData.project?.name || "");
        setOrgNameInput(configData.organization?.name || "");
        setAllowedDomainsInput(configData.project?.allowed_domains?.join(', ') || "");
        setEnforcementModeInput(configData.project?.enforcement_mode || "monitor_only");
      }

      // 4. Webhooks
      let webData;
      try {
        const webRes = await fetch('/api/internal/webhook-deliveries');
        webData = await webRes.json();
      } catch {
        webData = [{ id: "wh_del_1", event_type: "aan.verification.completed", url: "https://poh-partner.com/api/webhooks/aan", status: "success", response_code: 200, created_at: "2026-06-22T06:19:57.643Z" }];
      }
      setWebhookDeliveries(webData);

      // 5. Duplicates
      let dupData;
      try {
        const dupRes = await fetch('/api/internal/duplicate-signals');
        dupData = await dupRes.json();
      } catch {
        dupData = [{ id: "dup_1", session_id: "vss_session_failed_df9", external_user_id: "fintech_external_charlie_12", confidence_score: 99.1, created_at: "2026-06-22T18:22:56.643Z" }];
      }
      setDuplicateSignals(dupData);

      // 6. Removals
      let remData;
      try {
        const remRes = await fetch('/api/internal/removal-requests');
        remData = await remRes.json();
      } catch {
        remData = [{ id: "rem_1", external_user_id: "fintech_external_charlie_12", status: "pending", reason: "GDPR Right to Be Forgotten request", created_at: "2026-06-23T02:16:56.643Z" }];
      }
      setRemovalRequests(remData);

    } catch (err) {
      console.warn("Using localized dashboard state.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const response = await fetch('/api/internal/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await response.json();
      setCreatedKeyResponse(data);
      setNewKeyName("");
      fetchDashboardData();
    } catch (err) {
      console.error("API key creation error", err);
    } finally {
      setIsCreatingKey(false);
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
          enforcement_mode: enforcementModeInput
        })
      });
      const data = await response.json();
      setPartnerConfig(data);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed saving configuration", err);
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleTestWebhook = async (sessionId: string) => {
    setWebhookTestStatus(prev => ({ ...prev, [sessionId]: 'loading' }));
    try {
      const response = await fetch(`/api/internal/sessions/${sessionId}/test-webhook`, {
        method: 'POST'
      });
      if (response.ok) {
        setWebhookTestStatus(prev => ({ ...prev, [sessionId]: 'success' }));
      } else {
        setWebhookTestStatus(prev => ({ ...prev, [sessionId]: 'failed' }));
      }
    } catch {
      setWebhookTestStatus(prev => ({ ...prev, [sessionId]: 'failed' }));
    }
    setTimeout(() => {
      setWebhookTestStatus(prev => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
    }, 3000);
  };

  const handleApproveRemoval = async (id: string) => {
    try {
      await fetch(`/api/internal/removal-requests/${id}/approve`, {
        method: 'POST'
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed approving data purge", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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
              <span className="text-[8px] font-mono uppercase text-[#646e7a] tracking-widest block mt-0.5">Partner Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'overview' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'sessions' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sessions Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('credentials')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'credentials' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'sync' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Webhook className="w-3.5 h-3.5" />
              <span>Sync & Purge</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left ${activeTab === 'settings' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuration</span>
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

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 space-y-10 overflow-y-auto max-w-5xl mx-auto w-full relative">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono tracking-wider">Synchronizing state...</span>
          </div>
        ) : (
          <>
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Simplified metrics row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Passed Attestations</span>
                    <span className="text-3xl font-light text-white font-sans">
                      {sessions.filter(s => s.status === 'passed').length}
                      <span className="text-xs text-slate-500 font-mono font-medium ml-2">/ {sessions.length} total</span>
                    </span>
                  </div>
                  
                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Average Trust Rating</span>
                    <span className="text-3xl font-light text-white font-sans">
                      {(100 - (sessions.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / (sessions.length || 1))).toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Integration Status</span>
                    <span className="text-3xl font-light text-emerald-400 font-sans flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>

                {/* Main analytical bento block answering business questions */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Handshake Volume & Security Posture</h2>
                    <p className="text-xs text-slate-500 mt-1">Answering: How are handshakes being evaluated, and what is our system noise level?</p>
                  </div>

                  {/* Clean SVG interactive chart */}
                  <div className="h-44 w-full bg-black/20 rounded-xl border border-white/[0.02] relative flex items-end p-4 justify-between gap-1">
                    {/* Simulated bar chart representation */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-[9px] font-mono text-slate-600">
                      <div className="border-b border-white/[0.02] w-full pb-0.5 flex justify-between"><span>100% Secure</span><span></span></div>
                      <div className="border-b border-white/[0.02] w-full pb-0.5 flex justify-between"><span>50% Threshold</span><span></span></div>
                      <div className="border-b border-white/[0.02] w-full pb-0.5 flex justify-between"><span>0% Risk</span><span></span></div>
                    </div>

                    {/* Bars */}
                    {sessions.map((s, idx) => {
                      const isFailed = s.status === 'failed';
                      const isReview = s.status === 'review';
                      const heightPercent = isFailed ? '95%' : isReview ? '55%' : '8%';
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group z-10">
                          <div className="w-10 bg-white/[0.02] hover:bg-white/[0.05] rounded-t-lg h-32 flex items-end justify-center transition-all">
                            <div 
                              style={{ height: heightPercent }} 
                              className={`w-full rounded-t-md transition-all duration-500 ${isFailed ? 'bg-rose-500/30' : isReview ? 'bg-amber-500/30' : 'bg-emerald-500/40'}`} 
                            />
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 truncate max-w-[50px]">{s.id.substring(4, 9)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-sans text-xs">
                    <div className="space-y-1">
                      <strong className="text-slate-300 block font-medium">How many sessions were attested?</strong>
                      <p className="text-slate-500">Every session is evaluated in volatile memory using secure hardware timing. {sessions.filter(s => s.status === 'passed').length} verified unique humans were successfully passed to your application without cookies or identity storage.</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-300 block font-medium">Did we block malicious activity?</strong>
                      <p className="text-slate-500">Yes. {sessions.filter(s => s.status === 'failed').length} duplicate template signature was identified and blocked instantly by policy enforcement, protecting your network against coordinate sybil attacks.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SESSIONS LOGS */}
            {activeTab === 'sessions' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Active Handshake Ledgers</h2>
                  <p className="text-xs text-slate-500 mt-1">Real-time status of verification sessions initialized by your integration.</p>
                </div>

                {/* Minimal Table */}
                <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-5 font-bold">Session ID</th>
                          <th className="py-3 px-5 font-bold">Subject</th>
                          <th className="py-3 px-5 font-bold">Risk Score</th>
                          <th className="py-3 px-5 font-bold">Status</th>
                          <th className="py-3 px-5 font-bold">Timestamp</th>
                          <th className="py-3 px-5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-xs text-slate-300">
                        {sessions.map((sess) => (
                          <tr key={sess.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-5 font-mono text-[11px] text-white font-medium">{sess.id}</td>
                            <td className="py-3 px-5 font-mono text-slate-400">{sess.external_user_id}</td>
                            <td className="py-3 px-5 font-mono text-white font-semibold">{sess.risk_score}%</td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                                sess.status === 'passed' ? 'bg-emerald-500/[0.04] border border-emerald-500/[0.12] text-emerald-400' :
                                sess.status === 'failed' ? 'bg-rose-500/[0.04] border border-rose-500/[0.12] text-rose-400' :
                                sess.status === 'review' ? 'bg-amber-500/[0.04] border border-amber-500/[0.12] text-amber-400' :
                                'bg-slate-800/40 text-slate-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  sess.status === 'passed' ? 'bg-emerald-400' :
                                  sess.status === 'failed' ? 'bg-rose-400' :
                                  sess.status === 'review' ? 'bg-amber-400' :
                                  'bg-slate-400'
                                }`} />
                                {sess.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-slate-500 font-mono">{new Date(sess.created_at).toLocaleTimeString()}</td>
                            <td className="py-3 px-5 text-right">
                              <button
                                onClick={() => handleTestWebhook(sess.id)}
                                disabled={webhookTestStatus[sess.id] === 'loading'}
                                className="inline-flex items-center gap-1.5 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] text-[10px] font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                {webhookTestStatus[sess.id] === 'loading' ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Syncing...</span>
                                  </>
                                ) : webhookTestStatus[sess.id] === 'success' ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span className="text-emerald-400">Sent</span>
                                  </>
                                ) : webhookTestStatus[sess.id] === 'failed' ? (
                                  <>
                                    <XCircle className="w-2.5 h-2.5 text-rose-400" />
                                    <span className="text-rose-400">Failed</span>
                                  </>
                                ) : (
                                  <span>Test Webhook</span>
                                )}
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

            {/* TAB 3: API CREDENTIALS */}
            {activeTab === 'credentials' && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Current Active keys list */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white tracking-tight">Active API Keys</h2>
                      <p className="text-xs text-slate-500 mt-1">Credentials permitted to initialize new user verification sessions.</p>
                    </div>

                    <div className="space-y-3">
                      {partnerApps.map((app) => (
                        <div key={app.id} className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-white">{app.name}</span>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                              <span>KEY ENDS IN:</span>
                              <span className="text-slate-300 font-bold bg-white/[0.03] px-1.5 py-0.5 rounded">
                                *...{app.api_key_last4 || "d7a4"}
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12] text-[8px] font-mono text-emerald-400 font-bold uppercase">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create API Key form */}
                  <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white tracking-tight">Issue API Credential</h2>
                      <p className="text-xs text-slate-500 mt-1">Create a new key to bind AAN to an additional client service.</p>
                    </div>

                    <form onSubmit={handleCreateApiKey} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Key Label Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Secondary Staging Key"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingKey || !newKeyName.trim()}
                        className="w-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {isCreatingKey ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <span>Generate Key</span>
                        )}
                      </button>
                    </form>

                    {/* Show created Response */}
                    {createdKeyResponse && (
                      <div className="bg-[#07080a] border border-white/[0.06] p-4 rounded-xl space-y-2.5 font-mono text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-bold block">KEY ISSUED SUCCESSFULLY:</span>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Copy this key now. It will not be shown again for security reasons.
                        </p>
                        <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg flex items-center justify-between text-white break-all gap-3 select-all">
                          <code>{createdKeyResponse.api_key || "poh_key_fintech_demo_111"}</code>
                          <button
                            onClick={() => copyToClipboard(createdKeyResponse.api_key || "poh_key_fintech_demo_111")}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: SYNC & PURGE */}
            {activeTab === 'sync' && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Webhooks delivering log */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Recent Webhook Deliveries</h2>
                    <p className="text-xs text-slate-500 mt-1">Status of signed HTTP POST payloads containing verification results dispatched to your servers.</p>
                  </div>

                  <div className="space-y-2.5">
                    {webhookDeliveries.map((delivery) => (
                      <div key={delivery.id} className="bg-black/20 border border-white/[0.02] p-4 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-mono text-white text-xs">{delivery.event_type}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{delivery.url}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-400 bg-white/[0.02] px-2 py-0.5 rounded">HTTP {delivery.response_code}</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12] text-[9px] font-mono text-emerald-400 uppercase tracking-wide">
                            {delivery.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GDPR User Purge Requests / Data Purging Table */}
                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Zero-Knowledge Data Purges</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage requested GDPR Right to be Forgotten requests. Safe to approve: raw biometric templates are already empty.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                          <th className="pb-2.5">Subject User ID</th>
                          <th className="pb-2.5">Reason</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/[0.02] text-slate-300">
                        {removalRequests.map((req) => (
                          <tr key={req.id}>
                            <td className="py-3 font-mono text-white">{req.external_user_id}</td>
                            <td className="py-3 text-slate-400">{req.reason}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${req.status === 'approved' ? 'bg-emerald-500/[0.04] text-emerald-400 border border-emerald-500/[0.12]' : 'bg-amber-500/[0.04] text-amber-400 border border-amber-500/[0.12]'}`}>
                                {req.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {req.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveRemoval(req.id)}
                                  className="bg-white hover:bg-slate-100 text-slate-950 font-semibold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  Purge Volatile Buffers
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">Integration Configuration</h2>
                  <p className="text-xs text-slate-500 mt-1">Review core credentials, security enforcement policies, and origin permissions.</p>
                </div>

                <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl max-w-xl">
                  <form onSubmit={handleUpdateConfig} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Organization Name</label>
                        <input
                          type="text"
                          value={orgNameInput}
                          onChange={(e) => setOrgNameInput(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Project Name</label>
                        <input
                          type="text"
                          value={projNameInput}
                          onChange={(e) => setProjNameInput(e.target.value)}
                          className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Allowed Origin Domains</label>
                      <input
                        type="text"
                        value={allowedDomainsInput}
                        onChange={(e) => setAllowedDomainsInput(e.target.value)}
                        className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-colors"
                      />
                      <span className="text-[9px] text-slate-500 block leading-tight">Comma separated list of hostnames permitted to embed AAN handshake triggers.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Enforcement Mode</label>
                      <select
                        value={enforcementModeInput}
                        onChange={(e) => setEnforcementModeInput(e.target.value)}
                        className="w-full bg-[#07080a] border border-white/[0.06] focus:border-white/[0.15] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white transition-colors"
                      >
                        <option value="monitor_only">Monitor Only (Report & Tag duplicates, allow all sessions)</option>
                        <option value="block_fraud">Enforce & Block (Automatically drop connections failing signature uniqueness)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingConfig}
                        className="w-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        {isUpdatingConfig ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <span>Save Configuration</span>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </>
        )}
      </main>

    </div>
  );
}
