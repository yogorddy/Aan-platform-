import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Sliders, 
  HelpCircle, 
  ArrowRight,
  Database,
  Terminal,
  Server
} from 'lucide-react';

interface AuditLogsTabProps {
  auditLogs: any[];
}

export default function AuditLogsTab({ auditLogs }: AuditLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>Administrative Audit Logs</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review legal customer administrative actions, rotated keys, threshold updates, and workspace configuration adjustments.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
              <th className="py-3 px-4 font-bold">Audit Ref</th>
              <th className="py-3 px-4 font-bold">Administrative Action</th>
              <th className="py-3 px-4 font-bold">Performed By</th>
              <th className="py-3 px-4 font-bold">Actor IP</th>
              <th className="py-3 px-4 font-bold">Execution</th>
              <th className="py-3 px-4 font-bold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                  No administrative actions matched the filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono text-slate-900">{log.id}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-sans font-medium">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-500">{log.actor}</td>
                  <td className="py-3.5 px-4 text-slate-500">{log.ip}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Security notice */}
      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3 text-[10px]">
        <Server className="w-4 h-4 text-slate-400 mt-0.5" />
        <div className="space-y-1">
          <span className="text-slate-950 font-bold">Immutability Guarantee</span>
          <p className="text-slate-500 leading-normal font-light">
            Audit logs are signed and synced to the secure AAN decentralized block storage queue. Any attempt to modify or bypass this log triggers an automatic peer-node posture revocation alert.
          </p>
        </div>
      </div>
    </div>
  );
}
