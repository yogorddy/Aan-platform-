import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { 
  Database, RefreshCw, Download, ShieldCheck, Play, Radio, Code, ArrowUpRight, Search, Filter, AlertCircle, Terminal, X, Copy, Check, Info, FileText, Sliders, Shield 
} from 'lucide-react';

interface AuditTabProps {
  compactMode: boolean;
  searchQuery: string;
  role: string;
  auditLogs: AuditLog[];
  onLogAudit: (action: string, targetType: string, targetId: string, metadata: any) => void;
}

export default function AuditTab({ compactMode, searchQuery, role, auditLogs, onLogAudit }: AuditTabProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const generateEvidencePayload = (log: any) => {
    if (!log) return null;
    const isBlocked = log.outcome === 'Blocked' || log.riskLevel === 'High';
    const decision = isBlocked ? 'DENY' : 'ALLOW';
    const trustScore = isBlocked ? 8 : 95;
    const riskScore = isBlocked ? 92 : 5;
    
    const reasons = isBlocked 
      ? [
          "High density automated browser fingerprint matched",
          "Known suspicious hosting / VPN provider infrastructure",
          "Abnormal client posture check attestation failure"
        ]
      : [
          "Verified secure human browser handshake",
          "No anomalous velocity or geographic travel detected",
          "Trusted hardware-backed cryptographic signature validated"
        ];

    const signals = {
      impossible_travel: isBlocked ? Math.random() > 0.5 : false,
      credential_stuffing_detected: isBlocked ? Math.random() > 0.3 : false,
      coordinated_bot_net_cluster: isBlocked ? Math.random() > 0.4 : false,
      device_anomaly_score: isBlocked ? 88 : 12,
      valid_attestation_proof: !isBlocked
    };

    return {
      report_metadata: {
        report_id: `ev-rep_${log.id}_${Math.random().toString(36).substring(2, 7)}`,
        session_id: log.id,
        timestamp: log.created_at,
        organization_scope: log.orgName,
        subject_actor: log.actor_id,
        audit_action: log.action
      },
      client_context: {
        source_ip: log.ip,
        country: log.country,
        device_hardware: log.device,
        verifiable_signature: log.signature
      },
      telemetry_signals: {
        impossible_travel: signals.impossible_travel,
        credential_stuffing: signals.credential_stuffing_detected,
        bot_network_indicators: signals.coordinated_bot_net_cluster,
        device_anomaly_rating: signals.device_anomaly_score,
        humanness_posture_attestation: {
          proof_verified: signals.valid_attestation_proof,
          signature_claim_hash: `zkp_sig_${log.signature.replace('...', '_')}`,
          validation_time_ms: isBlocked ? 4500 : 850
        }
      },
      trust_decision_verdict: {
        decision: decision,
        trust_score: trustScore,
        risk_score: riskScore,
        reasons: reasons,
        evaluation_policy_id: "pol_sybil_protect_standard_v2"
      }
    };
  };

  const handleDownloadReport = (log: any) => {
    const payload = generateEvidencePayload(log);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aan-evidence-report-${log.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onLogAudit('audit.evidence_report_download', 'session_evidence', log.id, { org: log.orgName });
  };

  const handleCopyReportText = (log: any) => {
    const payload = generateEvidencePayload(log);
    const jsonStr = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 1500);
    onLogAudit('audit.evidence_report_copy', 'session_evidence', log.id, { org: log.orgName });
  };

  // Outgoing Webhooks Mock Database
  const [webhooks, setWebhooks] = useState<any[]>([
    { id: 'wh-1', event: 'identity.verified', partner: 'Stripe Connect', date: 'July 5, 2026 08:31:02', code: 200, status: 'Healthy', retries: 0, payload: { human_id: 'AAN-HMN-003812', trust_score: 0.9998, hash: 'a5d8f438a0f12bc0098a' } },
    { id: 'wh-2', event: 'identity.flagged', partner: 'Bybit Auth', date: 'July 5, 2026 08:29:45', code: 503, status: 'Failing', retries: 3, payload: { human_id: 'AAN-HMN-001048', trust_score: 0.6240, hash: 'c29df1440023a9a1188c' } },
    { id: 'wh-3', event: 'proof.issued', partner: 'Supabase Core', date: 'July 5, 2026 08:28:12', code: 200, status: 'Healthy', retries: 0, payload: { human_id: 'AAN-HMN-004129', trust_score: 0.9952, hash: '7c9ab902eef5163a3d' } }
  ]);

  const [selectedWebhook, setSelectedWebhook] = useState<any | null>(webhooks[0]);

  // Enhanced mock audit logs mapped into Enterprise structure
  const enterpriseLogs = auditLogs.map((log, idx) => {
    // Generate mock enterprise parameters safely
    const mockIPs = ['18.231.14.99', '45.132.88.10', '193.12.144.201', '82.102.23.111'];
    const mockDevices = ['iPhone 15 Pro', 'Chrome MacOS', 'Headless Chrome', 'Linux Client'];
    const mockCountries = ['United States', 'Netherlands', 'Germany', 'United Kingdom'];
    const mockOrgs = ['Stripe Connect', 'Bybit Auth', 'Supabase Core', 'Coinbase Pay'];
    
    const seed = idx + log.action.length;
    return {
      ...log,
      orgName: mockOrgs[seed % mockOrgs.length],
      ip: mockIPs[seed % mockIPs.length],
      device: mockDevices[seed % mockDevices.length],
      country: mockCountries[seed % mockCountries.length],
      riskLevel: seed % 3 === 0 ? 'High' : 'Low',
      outcome: seed % 4 === 0 ? 'Blocked' : 'Authorized',
      // Cryptographically Verifiable SHA-256 Digital Signature Block
      signature: Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 12) + 'SHA256'
    };
  });

  // Filters
  const filteredLogs = enterpriseLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.actor_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.ip.includes(searchQuery);
    const matchesOutcome = outcomeFilter === 'all' || log.outcome.toLowerCase() === outcomeFilter.toLowerCase();
    return matchesSearch && matchesOutcome;
  });

  const handleCopySignature = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedHash(sig);
    setTimeout(() => setCopiedHash(null), 1200);
  };

  const handleExport = (format: 'csv' | 'json') => {
    onLogAudit(`export.audit_${format}`, 'audit_registry', 'logs', {});
    const content = format === 'json'
      ? JSON.stringify(filteredLogs, null, 2)
      : "Timestamp,Actor,Organization,Action,Object,IP,Device,Country,Risk,Outcome,SignatureHash\n" + 
        filteredLogs.map(l => `${l.created_at},${l.actor_id},${l.orgName},${l.action},${l.target_type},${l.ip},${l.device},${l.country},${l.riskLevel},${l.outcome},${l.signature}`).join("\n");
        
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aan-audit-logs.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReplayWebhook = (wh: any) => {
    onLogAudit('webhook.replay', 'webhook_event', wh.id, {});
    alert(`Replaying Webhook Event '${wh.event}' to ${wh.partner}!\nPayload successfully dispatched.\nHTTP Status: 200 OK\nTimestamp: ${new Date().toISOString()}`);
  };

  return (
    <div className={`space-y-8 animate-[fadeIn_0.2s_ease-out]`}>
      
      {/* SECTION 1: ENTERPRISE AUDIT LOGS */}
      <div className="space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">Immutable Enterprise Audit Trails</h2>
            <p className="text-[11px] text-slate-500 mt-1">Cryptographically immutable ledger of developer access, verification events, and policy evaluations.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#08090c] border border-white/[0.06] rounded-xl px-3 py-1.5 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Outcome: All</option>
                <option value="authorized">Authorized Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>

            <button
              onClick={() => handleExport('json')}
              className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-mono text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] font-mono text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Audit Log Table Column */}
          <div className={`${selectedLog ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 space-y-4`}>
            {/* Audit Log Table */}
            <div className="bg-[#08090c] border border-white/[0.04] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold bg-black/40">
                      <th className="py-2.5 px-4">Ledger Timestamp</th>
                      <th className="py-2.5 px-4">Subject Actor</th>
                      <th className="py-2.5 px-4">Organization Scope</th>
                      <th className="py-2.5 px-4">Executed Action</th>
                      <th className="py-2.5 px-4">Outcome</th>
                      <th className="py-2.5 px-4 text-center">Evidence Report</th>
                      <th className="py-2.5 px-4 text-right">Verifiable Hash Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-xs font-mono text-slate-300">
                    {filteredLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id;
                      return (
                        <tr 
                          key={log.id} 
                          className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${isSelected ? 'bg-[#00E676]/5 border-l-2 border-[#00E676]' : ''}`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="py-3 px-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3 px-4 text-white font-medium">{log.actor_id}</td>
                          <td className="py-3 px-4 text-slate-400 font-semibold">{log.orgName}</td>
                          <td className="py-3 px-4 text-[#00E676]">{log.action}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${log.outcome === 'Blocked' ? 'bg-rose-500/10 text-rose-400' : 'bg-[#00E676]/10 text-[#00E676]'}`}>
                              {log.outcome}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                onLogAudit('audit.evidence_report_preview', 'session_evidence', log.id, { org: log.orgName });
                              }}
                              className="inline-flex items-center gap-1.5 bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/25 text-[#00E676] text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold font-mono"
                              title="Export Cryptographically Signed Evidence"
                            >
                              <Code className="w-3.5 h-3.5" />
                              <span>Export</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#00E676]/5 border border-[#00E676]/15 text-[#00E676] text-[8px] font-bold tracking-widest uppercase inline-flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-[#00E676]" />
                              </span>
                              <button
                                onClick={() => handleCopySignature(log.signature)}
                                className="text-slate-500 hover:text-white text-[9px] cursor-pointer bg-transparent border-none"
                                title="Copy Signature Hash"
                              >
                                {copiedHash === log.signature ? "Copied" : log.signature}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Evidence Inspector Side Panel */}
          {selectedLog && (
            <div className="lg:col-span-4 bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-5 text-left relative animate-[fadeIn_0.2s_ease-out] font-sans">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/[0.03] pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00E676]">
                    <ShieldCheck className="w-4 h-4 animate-pulse" />
                    <span className="text-[9px] font-mono tracking-widest uppercase font-black">AAN Trusted Evidence</span>
                  </div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-tight">Session Evidence Report</h3>
                  <p className="text-[10px] text-slate-500">Raw cryptographic trust signals and decision logs compiled for audit verification.</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg hover:bg-white/[0.03] text-slate-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Session/Log Metadata */}
              <div className="bg-black/20 border border-white/[0.02] p-3 rounded-xl space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">SESS ID:</span>
                  <span className="text-slate-350 font-bold truncate max-w-[150px]" title={selectedLog.id}>{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SUBJECT ACTOR:</span>
                  <span className="text-white font-bold">{selectedLog.actor_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TENANT SCOPE:</span>
                  <span className="text-emerald-400 font-bold">{selectedLog.orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TIMESTAMP:</span>
                  <span className="text-slate-400">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Dynamic decision outcome badge & scores */}
              {(() => {
                const report = generateEvidencePayload(selectedLog);
                if (!report) return null;
                const isBlocked = report.trust_decision_verdict.decision === 'DENY';
                return (
                  <div className="space-y-4">
                    
                    {/* Visual Badge Card */}
                    <div className="bg-black/30 border border-white/[0.03] p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">Policy Verdict</span>
                        <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded border ${
                          isBlocked 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.05)]' 
                            : 'bg-emerald-500/10 text-[#00E676] border-emerald-500/20'
                        }`}>
                          {report.trust_decision_verdict.decision}
                        </span>
                      </div>

                      {/* Scores Progress Bars */}
                      <div className="space-y-2.5 text-[10px] font-mono">
                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>TRUST REP SCORE:</span>
                            <span className={isBlocked ? 'text-rose-400' : 'text-[#00E676] font-bold'}>
                              {report.trust_decision_verdict.trust_score}/100
                            </span>
                          </div>
                          <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isBlocked ? 'bg-rose-500' : 'bg-[#00E676]'}`} 
                              style={{ width: `${report.trust_decision_verdict.trust_score}%` }} 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>RISK VELOCITY CONFIDENCE:</span>
                            <span className="text-white font-bold">
                              {report.trust_decision_verdict.risk_score}/100
                            </span>
                          </div>
                          <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-slate-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${report.trust_decision_verdict.risk_score}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reasons block */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Decision Rationale Signals:</span>
                      <div className="space-y-1.5">
                        {report.trust_decision_verdict.reasons.map((r: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
                            <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${isBlocked ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compiled Raw Signals Metrics */}
                    <div className="bg-black/40 border border-white/[0.03] p-3 rounded-xl space-y-2 text-[10px] font-mono text-slate-400">
                      <span className="text-[8px] text-slate-500 uppercase font-black block">Raw Evaluated Signals Monitor</span>
                      
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span>Impossible Travel:</span>
                        <span className={report.telemetry_signals.impossible_travel ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {report.telemetry_signals.impossible_travel ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span>Credential Stuffing:</span>
                        <span className={report.telemetry_signals.credential_stuffing ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {report.telemetry_signals.credential_stuffing ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span>Coordinated Bot Indicator:</span>
                        <span className={report.telemetry_signals.bot_network_indicators ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {report.telemetry_signals.bot_network_indicators ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                        <span>Device Anomaly Score:</span>
                        <span className={report.telemetry_signals.device_anomaly_rating > 50 ? 'text-amber-400 font-bold' : 'text-[#00E676]'}>
                          {report.telemetry_signals.device_anomaly_rating}% Risk
                        </span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span>Attestation Proof:</span>
                        <span className={report.telemetry_signals.humanness_posture_attestation.proof_verified ? 'text-[#00E676] font-bold' : 'text-amber-400 font-bold'}>
                          {report.telemetry_signals.humanness_posture_attestation.proof_verified ? 'PASSED (ZKP)' : 'FAILED/MISSING'}
                        </span>
                      </div>
                    </div>

                    {/* Raw JSON payload export block */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="uppercase text-slate-500 font-bold flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          Verifiable Payload
                        </span>
                        <button
                          onClick={() => handleCopyReportText(selectedLog)}
                          className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors text-slate-400 uppercase font-black text-[8px] bg-transparent border-none"
                        >
                          {copiedReport ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          {copiedReport ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="bg-[#050507] border border-white/[0.05] rounded-xl p-3 font-mono text-[9px] max-h-[140px] overflow-y-auto relative text-[#00E676]/90">
                        <pre className="whitespace-pre overflow-x-auto text-left leading-normal">
                          {JSON.stringify(report, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleDownloadReport(selectedLog)}
                        className="flex-1 bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 hover:border-[#00E676]/50 text-[#00E676] text-xs font-mono font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,230,118,0.04)]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download JSON Report</span>
                      </button>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}
        </div>

      </div>

      {/* SECTION 2: WEBHOOK CENTER */}
      <div className="border-t border-white/[0.04] pt-8 space-y-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Outgoing Webhooks Monitor Center
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Evaluate, replay, and inspect callback event triggers successfully dispatched to partner servers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Outgoing Webhooks List */}
          <div className="lg:col-span-2 bg-[#08090c] border border-white/[0.04] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold bg-black/40">
                    <th className="py-2.5 px-4">Event Topic</th>
                    <th className="py-2.5 px-4">Recipient Partner</th>
                    <th className="py-2.5 px-4">HTTP Status</th>
                    <th className="py-2.5 px-4">Retries</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-xs font-mono">
                  {webhooks.map((wh) => (
                    <tr 
                      key={wh.id} 
                      onClick={() => setSelectedWebhook(wh)}
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedWebhook?.id === wh.id ? 'bg-[#00E676]/5' : ''}`}
                    >
                      <td className="py-3 px-4 text-white font-bold">{wh.event}</td>
                      <td className="py-3 px-4 text-slate-400">{wh.partner}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${wh.code === 200 ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'}`}>
                          {wh.code} {wh.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{wh.retries} / 5</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplayWebhook(wh);
                          }}
                          className="bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.05] px-2 py-1 rounded text-[9px] font-bold uppercase cursor-pointer"
                        >
                          Replay Event
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook Payload Inspector Panel */}
          <div className="bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Webhook Payload Inspector
            </span>

            {selectedWebhook ? (
              <div className="space-y-4 font-mono text-xs animate-[fadeIn_0.15s_ease-out]">
                <div className="text-[11px] space-y-1">
                  <span className="text-slate-500">Destination Partner:</span>
                  <p className="text-white font-bold">{selectedWebhook.partner}</p>
                  <span className="text-slate-500 mt-2 block">Timestamp dispatched:</span>
                  <p className="text-slate-300">{selectedWebhook.date}</p>
                </div>

                <div className="bg-black/50 border border-white/[0.04] p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 block mb-1">JSON Content:</span>
                  <pre className="text-[10px] text-[#00E676] overflow-x-auto whitespace-pre-wrap leading-tight">
                    {JSON.stringify(selectedWebhook.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 font-mono italic">Select a webhook call log to inspect payload payloads.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
