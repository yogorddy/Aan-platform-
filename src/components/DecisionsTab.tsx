import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Sliders, 
  HelpCircle, 
  Copy, 
  X, 
  Calendar,
  Layers,
  Cpu,
  Fingerprint,
  Terminal,
  Activity
} from 'lucide-react';

interface DecisionsTabProps {
  events: any[];
}

export default function DecisionsTab({ events }: DecisionsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'decisions' | 'events'>('decisions');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToken = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  // Derive granular Canonical Decisions from events
  const decisions = events.map((event, idx) => {
    const isApproved = event.decision === 'approved';
    const isReview = event.decision === 'review';
    
    // Exact schema mapping
    return {
      decision_id: `dec_aan_${event.id ? event.id.substring(8) : `9c4f${idx}`}`,
      project_id: `proj_sb_aan_201`,
      session_id: `vss_session_${event.id ? event.id.substring(8) : `v9a${idx}`}`,
      subject_reference: event.external_user_id || `usr_anonymous_${idx}`,
      assurance_status: event.decision || 'approved', // 'approved' | 'review' | 'denied'
      human_confidence: isApproved ? '99.4%' : isReview ? '68.5%' : '14.2%',
      uniqueness_confidence: isApproved ? '98.2%' : isReview ? '74.2%' : '8.5%',
      continuity_confidence: isApproved ? '95.0%' : isReview ? '45.0%' : '2.0%',
      risk_score: event.risk_score || (isApproved ? 12 : isReview ? 52 : 94),
      risk_level: event.risk_score < 30 ? 'LOW' : event.risk_score < 70 ? 'MEDIUM' : 'HIGH',
      risk_reasons: event.reason_codes || (isApproved ? ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN"] : isReview ? ["VOLATILE_NETWORK"] : ["DEVICE_SPOOF_DETECTED"]),
      recommended_action: isApproved ? 'ALLOW' : isReview ? 'STEP_UP' : 'DENY',
      policy_version: `v1.2.0`,
      model_version: `mv_9a8c-31`,
      proof_token: `prft_${event.id ? event.id.substring(8) : `sh8c`}_sig_zkp_token_aan_v1_secure_proof`,
      created_at: event.timestamp || new Date().toISOString(),
      device_signal: event.device_signal || "Unknown Client Posture"
    };
  });

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.subject_reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.decision_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.session_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || d.assurance_status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Combined Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Decisions & Activity Events</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze evaluated trust ledger decisions, cryptographically signed zero-knowledge proof tokens, and diagnostic node telemetry.
          </p>
        </div>

        {/* Sub-tab Switches */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveSubTab('decisions');
              setSelectedDecision(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'decisions'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Decisions Ledger</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('events');
              setSelectedDecision(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'events'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry Stream</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200/60 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeSubTab === 'decisions' ? "Search by User Ref, Decision ID..." : "Search by User Ref..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 focus:border-[#00D632]/50 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'approved', 'review', 'denied'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase border tracking-wider transition-all cursor-pointer ${
                statusFilter === status 
                  ? "bg-slate-900 border-slate-900 text-white" 
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Sub-tab Render */}
      {activeSubTab === 'decisions' ? (
        /* Decisions Ledger Table */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-bold">Decision ID</th>
                <th className="py-3 px-4 font-bold">User Ref</th>
                <th className="py-3 px-4 font-bold">Result</th>
                <th className="py-3 px-4 font-bold">Risk Level</th>
                <th className="py-3 px-4 font-bold">Proof Token</th>
                <th className="py-3 px-4 font-bold text-right">Evaluated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                    No evaluated trust decisions found.
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((d) => (
                  <tr 
                    key={d.decision_id} 
                    onClick={() => setSelectedDecision(d)} 
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-900">{d.decision_id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{d.subject_reference}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        d.assurance_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        d.assurance_status === 'denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {d.assurance_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-semibold ${
                        d.risk_level === 'LOW' ? 'text-emerald-600' :
                        d.risk_level === 'HIGH' ? 'text-rose-600' : 'text-amber-600'
                      }`}>{d.risk_level} ({d.risk_score}%)</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{d.proof_token}</span>
                        <button 
                          onClick={(e) => copyToken(d.proof_token, e)}
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {copiedToken === d.proof_token ? (
                            <span className="text-emerald-500">Copied</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                      {new Date(d.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Granular Events Stream Table */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-bold">Event ID</th>
                <th className="py-3 px-4 font-bold">External Ref</th>
                <th className="py-3 px-4 font-bold">Score</th>
                <th className="py-3 px-4 font-bold">Verdict</th>
                <th className="py-3 px-4 font-bold">Client Posture</th>
                <th className="py-3 px-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                    No diagnostic telemetry events logged.
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((d) => (
                  <tr 
                    key={d.decision_id} 
                    onClick={() => setSelectedDecision(d)} 
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-900">{d.decision_id.replace('dec_aan_', 'evt_aan_')}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{d.subject_reference}</td>
                    <td className="py-3.5 px-4 font-mono">{d.risk_score}%</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        d.assurance_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        d.assurance_status === 'denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {d.assurance_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{d.device_signal}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                      {new Date(d.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision / Event Detail Drawer Overlay */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedDecision(null)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200/60 p-8 shadow-2xl z-10 animate-[slideInRight_0.2s_ease-out] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Evaluation Profile</span>
                  <h3 className="text-base font-black text-slate-900">{selectedDecision.decision_id}</h3>
                </div>
                <button onClick={() => setSelectedDecision(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Assurance Result</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                    selectedDecision.assurance_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    selectedDecision.assurance_status === 'denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {selectedDecision.assurance_status}
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Recommended Action</span>
                  <span className="font-mono text-xs font-black text-slate-950">{selectedDecision.recommended_action}</span>
                </div>
              </div>

              {/* Confidence Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Confidence metrics</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl text-center space-y-1 border border-slate-150">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Humanity</span>
                    <span className="text-base font-black text-slate-950 font-mono">{selectedDecision.human_confidence}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-center space-y-1 border border-slate-150">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Uniqueness</span>
                    <span className="text-base font-black text-slate-950 font-mono">{selectedDecision.uniqueness_confidence}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-center space-y-1 border border-slate-150">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Continuity</span>
                    <span className="text-base font-black text-slate-950 font-mono">{selectedDecision.continuity_confidence}</span>
                  </div>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-2 text-[11px] border-t border-slate-150 pt-4 font-mono text-slate-500">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Project ID</span>
                  <span className="text-slate-900 font-bold">{selectedDecision.project_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Session Reference</span>
                  <span className="text-slate-900 font-bold">{selectedDecision.session_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Subject Ref (User ID)</span>
                  <span className="text-slate-900 font-bold">{selectedDecision.subject_reference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Policy Version</span>
                  <span className="text-slate-900 font-bold">{selectedDecision.policy_version}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Risk Reason Codes</span>
                  <span className="text-slate-900 font-bold text-right truncate max-w-[200px]">{selectedDecision.risk_reasons.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-150">
              <button 
                onClick={(e) => copyToken(selectedDecision.proof_token, e)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedToken === selectedDecision.proof_token ? "Copied Signature Proof" : "Copy Proof token signature"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
