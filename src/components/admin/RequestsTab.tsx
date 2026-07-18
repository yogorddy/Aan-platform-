import React, { useState } from 'react';
import { IntegrationRequest } from '../../types';
import { 
  Mail, Check, X, RefreshCw, Calendar, User, Tag, AlertTriangle, ExternalLink, Play, Code, ArrowRight, Layers 
} from 'lucide-react';

interface RequestsTabProps {
  compactMode: boolean;
  role: string;
  requests: IntegrationRequest[];
  pendingTransitions: Record<string, { status: string; reason: string; adminNotes: string }>;
  setPendingTransitions: React.Dispatch<React.SetStateAction<Record<string, { status: string; reason: string; adminNotes: string }>>>;
  handleUpdateStatus: (id: string, newStatus: string, changeReason?: string, adminNotes?: string) => Promise<void>;
  toggleTimeline: (requestId: string) => void;
  expandedTimelineId: string | null;
  historyLoading: boolean;
  historyCache: Record<string, any[]>;
  fetchAdminData: () => void;
}

export default function RequestsTab({
  compactMode,
  role,
  requests,
  pendingTransitions,
  setPendingTransitions,
  handleUpdateStatus,
  toggleTimeline,
  expandedTimelineId,
  historyLoading,
  historyCache,
  fetchAdminData
}: RequestsTabProps) {

  // Checklist state for request IDs
  const [checklists, setChecklists] = useState<Record<string, { domain: boolean; security: boolean; terms: boolean }>>({});
  
  // Custom states for reviewer, labels, and target completion dates per request ID
  const [reviewerAssign, setReviewerAssign] = useState<Record<string, string>>({});
  const [priorityAssign, setPriorityAssign] = useState<Record<string, 'high' | 'normal' | 'low'>>({});
  const [labelAssign, setLabelAssign] = useState<Record<string, string>>({});
  const [targetCompletion, setTargetCompletion] = useState<Record<string, string>>({});
  const [generatedSandboxCreds, setGeneratedSandboxCreds] = useState<Record<string, string>>({});

  const toggleChecklistItem = (requestId: string, item: 'domain' | 'security' | 'terms') => {
    setChecklists(prev => {
      const current = prev[requestId] || { domain: false, security: false, terms: false };
      return {
        ...prev,
        [requestId]: { ...current, [item]: !current[item] }
      };
    });
  };

  const handleGenerateSandboxKeys = (requestId: string, orgName: string) => {
    const sandboxKey = `aan_sk_sandbox_${orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}_` + Math.random().toString(36).substring(2, 10);
    setGeneratedSandboxCreds(prev => ({
      ...prev,
      [requestId]: sandboxKey
    }));
    alert(`Sandbox credentials generated for ${orgName}:\n\nAPI KEY: ${sandboxKey}\n\nThis key operates on simulated clusters for testing purposes.`);
  };

  const handleTestSandboxWebhook = (orgName: string) => {
    alert(`Sandbox callback successfully fired to ${orgName}'s receiver endpoint.\n\nPayload: {"event":"sandbox.test","timestamp":"${new Date().toISOString()}","status":"verified"}\nResponse: 200 OK`);
  };

  return (
    <div className={`space-y-6 animate-[fadeIn_0.2s_ease-out]`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Onboarding & Integration Requests Pipeline</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Reviewing submissions from platform partners initiating AAN network node integrations.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/60 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all text-slate-700 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sync Pipeline</span>
        </button>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
            <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-mono">No requests in the onboarding pipeline queue.</p>
          </div>
        ) : (
          requests.map((req) => {
            const isPendingTransition = !!pendingTransitions[req.id];
            const chk = checklists[req.id] || { domain: false, security: false, terms: false };
            const rev = reviewerAssign[req.id] || "unassigned";
            const prio = priorityAssign[req.id] || req.urgency || "normal";
            const lbl = labelAssign[req.id] || "Fintech";
            const target = targetCompletion[req.id] || "2026-07-20";
            const sandboxKey = generatedSandboxCreds[req.id];

            return (
              <div key={req.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-sm">
                
                {/* 1. Header Details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-bold text-slate-900 text-base">{req.organization_name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/60 text-[10px] font-mono text-slate-500 font-bold">
                        {req.request_code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${prio === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                        {prio} Priority
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-mono font-bold uppercase">
                        {lbl} Label
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold font-sans">
                      Representative: <span className="text-slate-800 font-bold">{req.contact_name}</span> • <span className="text-slate-500 font-medium">{req.email}</span>
                      {req.phone && <span className="text-slate-400 font-medium"> • Phone: {req.phone}</span>}
                    </div>
                  </div>

                  {/* Onboarding Metadata Status selection */}
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Process Status</label>
                    <select
                      value={isPendingTransition ? pendingTransitions[req.id].status : req.status}
                      disabled={role === 'read-only' || role === 'auditor'}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        if (nextStatus === req.status) {
                          setPendingTransitions(prev => {
                            const updated = { ...prev };
                            delete updated[req.id];
                            return updated;
                          });
                        } else {
                          setPendingTransitions(prev => ({
                            ...prev,
                            [req.id]: {
                              status: nextStatus,
                              reason: '',
                              adminNotes: req.admin_notes || ''
                            }
                          }));
                        }
                      }}
                      className="bg-slate-50 border border-slate-200/60 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-slate-700 transition-colors cursor-pointer font-sans font-bold shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* 2. Transition Reviewer Panel */}
                {isPendingTransition && (
                  <div className="bg-[#00C853]/5 border border-[#00C853]/20 p-4 rounded-2xl space-y-3 animate-[fadeIn_0.15s_ease-out]">
                    <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-emerald-600" />
                      <span>Configure Status Transition to <span className="text-emerald-700 uppercase font-extrabold">{pendingTransitions[req.id].status}</span></span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Change Reason <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={pendingTransitions[req.id].reason}
                          onChange={(e) => setPendingTransitions(prev => ({
                            ...prev,
                            [req.id]: { ...prev[req.id], reason: e.target.value }
                          }))}
                          placeholder="e.g., Compliance criteria met"
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Admin Notes (Internal review logs)</label>
                        <input
                          type="text"
                          value={pendingTransitions[req.id].adminNotes}
                          onChange={(e) => setPendingTransitions(prev => ({
                            ...prev,
                            [req.id]: { ...prev[req.id], adminNotes: e.target.value }
                          }))}
                          placeholder="Internal remarks for security log audits..."
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setPendingTransitions(prev => {
                          const updated = { ...prev };
                          delete updated[req.id];
                          return updated;
                        })}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/60 text-[10px] font-bold text-slate-600 cursor-pointer shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(
                          req.id,
                          pendingTransitions[req.id].status,
                          pendingTransitions[req.id].reason,
                          pendingTransitions[req.id].adminNotes
                        )}
                        disabled={!pendingTransitions[req.id].reason.trim()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
                      >
                        Apply Posture Change
                      </button>
                    </div>
                  </div>
                )}
                {/* 3. Workflow Control & Allocation Options */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                  
                  {/* Left Column: Use Case & Message Detail */}
                  <div className="lg:col-span-2 space-y-4">
                    {req.use_case && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Integration Use Case</span>
                        <p className="text-slate-700 font-semibold font-sans leading-relaxed">{req.use_case}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Inbound Message Request</span>
                      <p className="text-slate-600 bg-slate-50/55 p-3.5 rounded-2xl border border-slate-200/50 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                        "{req.message}"
                      </p>
                    </div>

                    {/* Architectural Integration Path Diagram */}
                    <div className="space-y-2 bg-slate-50/40 border border-slate-200/60 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold block flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        Proposed Network Node Architecture Pipeline
                      </span>
                      
                      {/* Diagram representation */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] font-mono">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 text-center w-full sm:w-auto shadow-sm">
                          <span className="text-slate-600 block font-bold">User Device</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold">MFA Signature</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#00C853] shrink-0 rotate-90 sm:rotate-0" />
                        
                        <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-[#00C853]/35 text-center w-full sm:w-auto shadow-sm">
                          <span className="text-[#00C853] block font-extrabold">AAN Gateway</span>
                          <span className="text-[8px] text-emerald-600 block mt-0.5 font-bold">Policy Check</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#00C853] shrink-0 rotate-90 sm:rotate-0" />

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 text-center w-full sm:w-auto shadow-sm">
                          <span className="text-slate-600 block font-bold">Proof Engine</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold">ZKP Generation</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#00C853] shrink-0 rotate-90 sm:rotate-0" />

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 text-center w-full sm:w-auto shadow-sm">
                          <span className="text-slate-600 block font-bold">{req.organization_name}</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold">Webhook Hook</span>
                        </div>
                      </div>
                    </div>

                    {/* Developer Sandbox Panel */}
                    <div className="bg-slate-50/30 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-emerald-600" />
                        Technical Sandbox Suite
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateSandboxKeys(req.id, req.organization_name)}
                          className="bg-white hover:bg-[#00C853]/5 text-slate-700 hover:text-emerald-700 border border-slate-200/60 hover:border-[#00C853]/20 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          Generate Sandbox API Keys
                        </button>
                        <button
                          onClick={() => handleTestSandboxWebhook(req.organization_name)}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/60 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          Trigger Webhook Test Event
                        </button>
                      </div>
                      {sandboxKey && (
                        <div className="p-2 bg-emerald-50/30 border border-emerald-100 rounded-xl font-mono text-[9px] text-[#00C853] flex justify-between items-center font-bold">
                          <span>Sandbox Secret Key: {sandboxKey}</span>
                          <span className="text-emerald-700 text-[8px] uppercase font-bold bg-emerald-50 px-1.5 py-0.5 rounded">READY FOR INTEGRATION</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Allocation Controls, Review Checklists */}
                  <div className="space-y-4">
                                     {/* Allocation Metadata Block */}
                    <div className="bg-slate-50/40 border border-slate-200/60 p-4 rounded-2xl space-y-3 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Internal Allocation Attributes</span>
                      
                      {/* Reviewer Dropdown */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 block font-bold">Reviewer Assigned</span>
                        <select
                          value={rev}
                          onChange={(e) => setReviewerAssign(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500 font-sans font-bold shadow-sm"
                        >
                          <option value="unassigned">Unassigned</option>
                          <option value="alex_compliance">Alex (Compliance)</option>
                          <option value="sarah_security">Sarah (Security)</option>
                          <option value="michael_trust">Michael (Trust Eng)</option>
                        </select>
                      </div>

                      {/* Custom Label Dropdown */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 block font-bold">Organization Category Label</span>
                        <select
                          value={lbl}
                          onChange={(e) => setLabelAssign(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500 font-sans font-bold shadow-sm"
                        >
                          <option value="Fintech">Fintech Partner</option>
                          <option value="Web3">Sovereign Web3 / DAO</option>
                          <option value="Enterprise">Fortune 500 Security</option>
                          <option value="GovTech">Government Integrity</option>
                        </select>
                      </div>

                      {/* Targeted Completion date */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 block font-bold">Target Deployment Date</span>
                        <input
                          type="date"
                          value={target}
                          onChange={(e) => setTargetCompletion(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500 font-sans font-bold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Interactive Reviewer Checklist */}
                    <div className="bg-slate-50/40 border border-slate-200/60 p-4 rounded-2xl space-y-3 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Compliance Checklist
                      </span>
                      
                      <div className="space-y-2 text-[11px]">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950 font-bold font-sans">
                          <input
                            type="checkbox"
                            checked={chk.domain}
                            onChange={() => toggleChecklistItem(req.id, 'domain')}
                            className="accent-[#00C853] rounded"
                          />
                          <span className={chk.domain ? 'line-through text-slate-400 font-normal' : ''}>Verify Enterprise Domain Domain</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950 font-bold font-sans">
                          <input
                            type="checkbox"
                            checked={chk.security}
                            onChange={() => toggleChecklistItem(req.id, 'security')}
                            className="accent-[#00C853] rounded"
                          />
                          <span className={chk.security ? 'line-through text-slate-400 font-normal' : ''}>Complete Sandbox Webhook Test</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950 font-bold font-sans">
                          <input
                            type="checkbox"
                            checked={chk.terms}
                            onChange={() => toggleChecklistItem(req.id, 'terms')}
                            className="accent-[#00C853] rounded"
                          />
                          <span className={chk.terms ? 'line-through text-slate-400 font-normal' : ''}>Approve Compliance Terms SLA</span>
                        </label>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                        <span>Checklist Completion:</span>
                        <span className="text-[#00C853] font-bold text-xs">
                          {Object.values(chk).filter(Boolean).length} / 3 Complete
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 4. Collapsible History Audit Timeline Selector */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <button
                    onClick={() => toggleTimeline(req.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 hover:text-emerald-700 bg-transparent border-none cursor-pointer p-0 font-bold"
                  >
                    <span>{expandedTimelineId === req.id ? 'Hide Audit Log Timeline' : 'View Status History & Audit Timeline'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 transform transition-transform duration-150 ${expandedTimelineId === req.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {/* Timeline rendering */}
                {expandedTimelineId === req.id && (
                  <div className="mt-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Inbound Status Transition Records</h4>
                    {historyLoading && !historyCache[req.id] ? (
                      <div className="text-center py-4 text-slate-400 text-xs font-mono flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Fetching credentials database...</span>
                      </div>
                    ) : !historyCache[req.id] || historyCache[req.id].length === 0 ? (
                      <p className="text-slate-500 text-xs font-mono italic">No status transitions recorded yet for this request in this terminal session.</p>
                    ) : (
                      <div className="relative border-l border-slate-200/80 ml-2 pl-4 space-y-4">
                        {historyCache[req.id].map((hist, idx) => (
                          <div key={hist.id || idx} className="relative text-xs">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-50 border border-emerald-500" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                                <span className="text-slate-400 font-medium">{new Date(hist.changed_at).toLocaleString()}</span>
                                {hist.previous_status && <span className="text-slate-400 line-through uppercase font-medium">{hist.previous_status}</span>}
                                <span className="text-slate-400 font-bold">→</span>
                                <span className="text-emerald-600 uppercase font-bold">{hist.new_status}</span>
                              </div>
                              <div className="text-slate-700 font-sans font-medium">
                                Reason: <span className="text-slate-900 font-bold">{hist.change_reason || "No compliance details provided."}</span>
                              </div>
                              {hist.metadata?.admin_notes && (
                                <div className="text-[10px] text-amber-600 italic font-sans font-semibold">
                                  Notes: "{hist.metadata.admin_notes}"
                                </div>
                              )}
                              <div className="text-slate-400 text-[10px] font-mono font-medium">
                                Action Actor ID: {hist.changed_by || "admin_super_user"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
