import React, { useState } from 'react';
import { AttestedIdentity, initialIdentities } from './AdminMockData';
import { 
  Search, Filter, Download, ArrowRight, X, Clock, Database, Trash2, ShieldAlert, Check, Calendar, HardDrive 
} from 'lucide-react';

interface IdentitiesTabProps {
  compactMode: boolean;
  searchQuery: string;
  role: string;
  onLogAudit: (action: string, targetType: string, targetId: string, metadata: any) => void;
}

export default function IdentitiesTab({ compactMode, searchQuery, role, onLogAudit }: IdentitiesTabProps) {
  const [identities, setIdentities] = useState<AttestedIdentity[]>(initialIdentities);
  const [selectedIdentity, setSelectedIdentity] = useState<AttestedIdentity | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reputationFilter, setReputationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter Logic
  const filtered = identities.filter(ident => {
    const matchesSearch = ident.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ident.partner.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ident.ip.includes(searchQuery) ||
                          ident.deviceModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ident.status === statusFilter;
    const matchesReputation = reputationFilter === 'all' || ident.deviceReputation.toLowerCase().includes(reputationFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesReputation;
  });

  const handlePurgeUser = (userId: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot purge live identity signatures.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently purge unique signature '${userId}' and revoke its issued cryptographic tokens? This action is immutable.`)) return;
    
    setIdentities(prev => prev.filter(u => u.id !== userId));
    onLogAudit('identity.purge', 'user_identity', userId, { purged_by: role, date: new Date().toISOString() });
    
    if (selectedIdentity?.id === userId) {
      setSelectedIdentity(null);
    }
    alert(`Unique human identity ${userId} and all linked cryptographic signature templates have been securely purged from the cluster.`);
  };

  const handleExport = (format: 'csv' | 'json') => {
    onLogAudit(`export.${format}`, 'attested_registry', 'global_registry', { count: filtered.length });
    const content = format === 'json' 
      ? JSON.stringify(filtered, null, 2)
      : "Human ID,Status,Trust Score,Partner,Last Seen,Device Reputation\n" + 
        filtered.map(i => `${i.id},${i.status},${i.trustScore}%,${i.partner},${i.lastSeen},${i.deviceReputation}`).join("\n");
        
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aan-attested-identities.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`space-y-6 animate-[fadeIn_0.2s_ease-out]`}>
      
      {/* Search, Filter, Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">Attested Human Identity Registry</h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Verifiable human uniqueness mappings protected by zero-knowledge identity signatures. No biometric or raw identity metrics are ever stored.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select Filter */}
          <div className="flex items-center gap-1 bg-[#08090c] border border-white/[0.06] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="Verified">Verified Only</option>
              <option value="Flagged">Flagged Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>

          {/* Export Buttons */}
          <button
            onClick={() => handleExport('json')}
            className="inline-flex items-center gap-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-mono text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-mono text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table List View (Col span 2) */}
        <div className="lg:col-span-2 bg-[#08090c] border border-white/[0.04] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold bg-black/40">
                  <th className="py-3 px-4">Cryptographic Human ID</th>
                  <th className="py-3 px-4">Origin Organization</th>
                  <th className="py-3 px-4">Trust Weight</th>
                  <th className="py-3 px-4">Token Reputation</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs font-mono">
                {filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedIdentity(item)}
                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedIdentity?.id === item.id ? 'bg-[#00E676]/5' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span className="text-[#00E676] block font-bold text-[11px]">{item.id}</span>
                      <span className="text-[9px] text-slate-500">Last Active: {item.lastSeen}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">{item.partner}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.trustScore >= 90 ? 'text-[#00E676] bg-[#00E676]/5' : 'text-rose-400 bg-rose-500/5'}`}>
                        {item.trustScore}% Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.deviceReputation}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-slate-500 hover:text-white inline-flex items-center gap-1 font-bold text-[9px] uppercase cursor-pointer">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deep Details Drawer / Side Panel (Col span 1) */}
        <div className="bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-6">
          {selectedIdentity ? (
            <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
              
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Inspect Identity</span>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedIdentity.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedIdentity(null)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Core Telemetry Data */}
              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trust Posture:</span>
                  <span className={`font-bold ${selectedIdentity.status === 'Verified' ? 'text-[#00E676]' : 'text-rose-400'}`}>
                    {selectedIdentity.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Source:</span>
                  <span className="text-slate-300 font-semibold">{selectedIdentity.partner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reputation Level:</span>
                  <span className="text-slate-300 font-semibold">{selectedIdentity.deviceReputation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Security:</span>
                  <span className="text-slate-300">{selectedIdentity.sessionState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Evaluation Node IP:</span>
                  <span className="text-slate-300">{selectedIdentity.ip} ({selectedIdentity.country})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Token:</span>
                  <span className="text-slate-400 truncate max-w-[150px]" title={selectedIdentity.deviceModel}>
                    {selectedIdentity.deviceModel}
                  </span>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
                  Identity Audit Timeline
                </span>
                
                <div className="relative border-l border-white/[0.06] pl-4 space-y-4">
                  {selectedIdentity.verificationHistory.map((hist, idx) => (
                    <div key={idx} className="relative text-[11px] font-mono">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#00E676]" />
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 block">{hist.date}</span>
                        <span className="text-slate-300 block">{hist.action}</span>
                        <span className="text-slate-500 block">Result: {hist.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Score Graph or Triggers */}
              <div className="space-y-2 bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  Anomalous Risk Triggers
                </span>
                {selectedIdentity.riskHistory.map((rh, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] font-mono py-1">
                    <span className="text-slate-400">{rh.trigger}</span>
                    <span className="text-rose-400">+{rh.score}% Risk</span>
                  </div>
                ))}
              </div>

              {/* Action: Purge identity */}
              <div className="pt-2 border-t border-white/[0.04]">
                <button
                  onClick={() => handlePurgeUser(selectedIdentity.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono py-2 rounded-xl transition-all border border-rose-500/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Unique Identity Keys</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono">Select an attested identity from the registry queue to view detailed historical timelines.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
