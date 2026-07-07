import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Users, Database, Sliders, Mail, RefreshCw, Layers, Layout, Eye, Search, Maximize2, Minimize2, Check, ExternalLink, Settings, ShieldAlert, Cpu
} from 'lucide-react';
import { AuditLog, IntegrationRequest, IntegrationRequestStatusHistory } from '../types';
import AANShieldLogo from './AANShieldLogo';

// Import our highly polished, enterprise modular subcomponents
import HealthTab from './admin/HealthTab';
import IdentitiesTab from './admin/IdentitiesTab';
import PartnersTab from './admin/PartnersTab';
import RequestsTab from './admin/RequestsTab';
import PolicyTab from './admin/PolicyTab';
import AuditTab from './admin/AuditTab';

interface AdminDashboardProps {
  onNavigate: (page: string, path?: string, lessonId?: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Tabs management
  const [activeTab, setActiveTab] = useState<'health' | 'identities' | 'partners' | 'requests' | 'policies' | 'audit'>('health');
  
  // Customization Options
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [role, setRole] = useState<string>('super-admin'); // super-admin, security-analyst, compliance-officer, auditor
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [requests, setRequests] = useState<IntegrationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Expanded History Cache for Integration requests
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<string, IntegrationRequestStatusHistory[]>>({});
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [pendingTransitions, setPendingTransitions] = useState<Record<string, { status: string; reason: string; adminNotes: string }>>({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Integration Requests
      let reqsData: IntegrationRequest[] = [];
      try {
        const res = await fetch('/api/internal/integration-requests');
        if (res.ok) {
          reqsData = await res.json();
        }
      } catch (e) {
        console.warn("Could not fetch database integration requests, using defaults.", e);
      }
      
      // Default fallback requests matching our enterprise scope
      if (!reqsData || reqsData.length === 0) {
        reqsData = [
          {
            id: "req_stripe_connect",
            request_code: "AAN-REQ-0012",
            organization_name: "Stripe Connect",
            contact_name: "John Collison",
            email: "jcollison@stripe.com",
            use_case: "Integrate biometric identity confirmation to eliminate multi-account voucher abuse on Stripe platforms.",
            message: "We need an enterprise-grade Sybil-resistance interface with hardware key anchors. Our team prefers the SDK with high-reputation validation scores.",
            status: "pending",
            urgency: "high",
            source: "form",
            created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            status_changed_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
          },
          {
            id: "req_supabase_core",
            request_code: "AAN-REQ-0015",
            organization_name: "Supabase Core",
            contact_name: "Paul Copplestone",
            email: "paul@supabase.io",
            use_case: "Provide native anonymous verified credentials as part of Supabase Auth offerings.",
            message: "This will enable database administrators to configure trust gates requiring visitors to present valid ZK proofs before calling edge functions.",
            status: "reviewed",
            urgency: "normal",
            source: "api",
            created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            status_changed_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
          }
        ];
      }
      setRequests(reqsData);

      // 2. Fetch Audit Logs
      let auditsData: AuditLog[] = [];
      try {
        const res = await fetch('/api/internal/audit-logs');
        if (res.ok) {
          auditsData = await res.json();
        }
      } catch (e) {
        console.warn("Could not fetch database audit logs, using defaults.", e);
      }

      if (!auditsData || auditsData.length === 0) {
        auditsData = [
          { id: "log_001", actor_type: "partner", actor_id: "alex_compliance", action: "policy.update", target_type: "security_policy", target_id: "pol_sybil_protect", metadata: {}, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
          { id: "log_002", actor_type: "partner", actor_id: "sarah_security", action: "partner.key_rotate", target_type: "api_key", target_id: "Supabase Core", metadata: {}, created_at: new Date(Date.now() - 12 * 60000).toISOString() },
          { id: "log_003", actor_type: "partner", actor_id: "michael_trust", action: "identity.purge", target_type: "user_identity", target_id: "AAN-HMN-0082", metadata: {}, created_at: new Date(Date.now() - 45 * 60000).toISOString() }
        ];
      }
      setAuditLogs(auditsData);

    } catch (err) {
      console.warn("Using local fallback data in Admin Console.", err);
    } finally {
      setLoading(false);
    }
  };

  // Log auditing action centrally to stateful ledger
  const handleLogAudit = (action: string, targetType: string, targetId: string, metadata: any = {}) => {
    const newLog: AuditLog = {
      id: `log_gen_${Date.now()}`,
      actor_type: 'partner',
      actor_id: role === 'super-admin' ? 'super_admin_user' : role,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Fetch status history with mock data fallback if API fails
  const fetchStatusHistory = async (requestId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/internal/integration-requests/${requestId}/status-history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryCache(prev => ({ ...prev, [requestId]: data }));
      } else {
        throw new Error("HTTP failure");
      }
    } catch (err) {
      // Setup smart mock history list matching the request status
      const fallbackHistory = [
        {
          id: `hist_1_${requestId}`,
          integration_request_id: requestId,
          previous_status: '',
          new_status: 'pending',
          changed_by: 'system_gateway',
          changed_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          change_reason: 'Inbound pipeline submission received.',
          metadata: {}
        }
      ];
      setHistoryCache(prev => ({ ...prev, [requestId]: fallbackHistory }));
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleTimeline = (requestId: string) => {
    if (expandedTimelineId === requestId) {
      setExpandedTimelineId(null);
    } else {
      setExpandedTimelineId(requestId);
      fetchStatusHistory(requestId);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, changeReason?: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/internal/integration-requests/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          change_reason: changeReason,
          admin_notes: adminNotes
        })
      });
      
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { 
          ...r, 
          status: newStatus as any, 
          status_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          admin_notes: adminNotes !== undefined ? adminNotes : r.admin_notes
        } : r));
      } else {
        throw new Error("Local Sync Required");
      }
    } catch (e) {
      // Local State Management fallback
      setRequests(prev => prev.map(r => r.id === id ? { 
        ...r, 
        status: newStatus as any, 
        status_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        admin_notes: adminNotes !== undefined ? adminNotes : r.admin_notes
      } : r));
    }

    // Instantly append history locally
    const newTransition: IntegrationRequestStatusHistory = {
      id: `hist_tr_${Date.now()}`,
      integration_request_id: id,
      previous_status: requests.find(r => r.id === id)?.status || 'pending',
      new_status: newStatus,
      changed_by: role,
      changed_at: new Date().toISOString(),
      change_reason: changeReason || 'Compliance criteria updated.',
      metadata: { admin_notes: adminNotes }
    };

    setHistoryCache(prev => ({
      ...prev,
      [id]: [newTransition, ...(prev[id] || [])]
    }));

    // Clear pending transitions
    setPendingTransitions(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    handleLogAudit('integration.status_change', 'integration_request', id, { previous_status: requests.find(r => r.id === id)?.status, new_status: newStatus });
  };

  return (
    <div className={`min-h-screen bg-[#050507] text-[#8c919d] font-sans flex flex-col lg:flex-row ${compactMode ? 'text-xs' : ''}`}>
      
      {/* SIDEBAR: NAV CONTROL */}
      <aside className="w-full lg:w-64 bg-[#08090c] border-b lg:border-b-0 lg:border-r border-white/[0.04] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
              <AANShieldLogo className="w-5 h-5" strokeWidth={8} />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-xs block leading-none">AAN</span>
              <span className="text-[8px] font-mono uppercase text-[#58E38A] tracking-widest block mt-1">Admin Platform v2.0</span>
            </div>
          </div>

          {/* Active Analyst Role Switcher */}
          <div className="bg-black/40 border border-white/[0.04] p-3 rounded-xl space-y-1.5 font-mono text-[10px]">
            <span className="text-slate-500 uppercase block font-bold tracking-wider">Active Credentials</span>
            <div className="flex items-center gap-1.5 bg-[#050507] border border-white/[0.06] rounded-lg px-2 py-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent border-none text-[10px] text-white focus:outline-none cursor-pointer w-full"
              >
                <option value="super-admin">Super Admin</option>
                <option value="security-analyst">Security Analyst</option>
                <option value="compliance-officer">Compliance Officer</option>
                <option value="auditor">Read-Only Auditor</option>
              </select>
            </div>
          </div>

          {/* Navigation Links (Max 6 tabs) */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('health')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'health' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>System Health</span>
            </button>
            
            <button
              onClick={() => setActiveTab('identities')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'identities' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attested Identities</span>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'partners' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Partner Tenants</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'requests' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Integration Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'policies' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Defensive Policies</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'audit' ? 'bg-white/[0.04] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'}`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Trails</span>
            </button>
          </nav>

        </div>

        {/* Console back-link control */}
        <div className="pt-8 border-t border-white/[0.03] mt-8 text-center hidden lg:block">
          
          {/* Customization toggles inside Sidebar Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-4 bg-black/20 p-2 rounded-lg border border-white/[0.02]">
            <span>Compact Density</span>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="text-emerald-400 hover:text-emerald-300 bg-transparent border-none cursor-pointer"
            >
              {compactMode ? "ON" : "OFF"}
            </button>
          </div>

          <button 
            onClick={() => onNavigate('landing')} 
            className="text-[10px] font-mono uppercase text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto bg-transparent border-none cursor-pointer"
          >
            <span>Exit Admin Console</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto w-full relative">
        
        {/* GLOBAL HEADER BAR: Live indicators, Search Filter, Sync */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.03] pb-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse shrink-0" />
            <div>
              <h1 className="font-sans font-bold text-white text-lg tracking-tight uppercase">
                {activeTab === 'health' && "System Posture Monitor"}
                {activeTab === 'identities' && "Attested Human Registry"}
                {activeTab === 'partners' && "Integrating Tenants Directory"}
                {activeTab === 'requests' && "Integration Requests pipeline"}
                {activeTab === 'policies' && "Verifiable Policies Cluster"}
                {activeTab === 'audit' && "Enterprise Ledger Audit Trails"}
              </h1>
              <p className="text-[11px] text-slate-500">
                Evaluating cryptographic uniqueness anchors under active role context: <span className="text-white uppercase font-bold">{role.replace('-', ' ')}</span>
              </p>
            </div>
          </div>

          {/* Search bar + Compact Button on Mobile */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search global registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-60 bg-[#08090c] border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]/40 transition-colors"
              />
            </div>

            <button
              onClick={fetchAdminData}
              title="Refresh Cluster State"
              className="p-2 bg-[#08090c] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENT LOADING VIEW */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono tracking-wider">Syncing cluster states securely...</span>
          </div>
        ) : (
          <div className="space-y-8 animate-[fadeIn_0.15s_ease-out]">
            
            {/* CONDITIONAL SUBCOMPONENT RENDERERS */}
            {activeTab === 'health' && (
              <HealthTab 
                compactMode={compactMode} 
                searchQuery={searchQuery} 
                role={role} 
                onLogAudit={handleLogAudit} 
              />
            )}

            {activeTab === 'identities' && (
              <IdentitiesTab 
                compactMode={compactMode} 
                searchQuery={searchQuery} 
                role={role} 
                onLogAudit={handleLogAudit} 
              />
            )}

            {activeTab === 'partners' && (
              <PartnersTab 
                compactMode={compactMode} 
                role={role} 
                onLogAudit={handleLogAudit} 
              />
            )}

            {activeTab === 'requests' && (
              <RequestsTab 
                compactMode={compactMode} 
                role={role} 
                requests={requests}
                pendingTransitions={pendingTransitions}
                setPendingTransitions={setPendingTransitions}
                handleUpdateStatus={handleUpdateStatus}
                toggleTimeline={toggleTimeline}
                expandedTimelineId={expandedTimelineId}
                historyLoading={historyLoading}
                historyCache={historyCache}
                fetchAdminData={fetchAdminData}
              />
            )}

            {activeTab === 'policies' && (
              <PolicyTab 
                compactMode={compactMode} 
                role={role} 
                onLogAudit={handleLogAudit} 
              />
            )}

            {activeTab === 'audit' && (
              <AuditTab 
                compactMode={compactMode} 
                searchQuery={searchQuery} 
                role={role} 
                auditLogs={auditLogs} 
                onLogAudit={handleLogAudit} 
              />
            )}

          </div>
        )}
      </main>

    </div>
  );
}
