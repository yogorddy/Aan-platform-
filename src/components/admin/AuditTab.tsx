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
    <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
      
      {/* SECTION 1: ENTERPRISE AUDIT LOGS */}
      <div className="space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Immutable Enterprise Audit Trails</h2>
            <p className="text-[11px] text-slate-500 mt-1 font-sans font-medium">Cryptographically immutable ledger of developer access, verification events, and policy evaluations.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-mono shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] text-slate-700 focus:outline-none cursor-pointer font-sans font-bold"
              >
                <option value="all">Outcome: All</option>
                <option value="authorized">Authorized Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>

            <button
              onClick={() => handleExport('json')}
              className="bg-white hover:bg-slate-50 border border-slate-200/80 text-[10px] font-bold text-slate-700 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-white hover:bg-slate-50 border border-slate-200/80 text-[10px] font-bold text-slate-700 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Audit Log Table Column */}
          <div className={`${selectedLog ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 space-y-4`}>
            {/* Audit Log Table */}
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                      <th className="py-3 px-4">Ledger Timestamp</th>
                      <th className="py-3 px-4">Subject Actor</th>
                      <th className="py-3 px-4">Organization Scope</th>
                      <th className="py-3 px-4">Executed Action</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4 text-center">Evidence Report</th>
                      <th className="py-3 px-4 text-right">Verifiable Hash Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-600">
                    {filteredLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id;
                      return (
                        <tr 
                          key={log.id} 
                          className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/40 border-l-2 border-emerald-500' : ''}`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="py-3.5 px-4 text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-slate-800 font-bold font-sans">{log.actor_id}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-bold font-sans">{log.orgName}</td>
                          <td className="py-3.5 px-4 text-emerald-600 font-semibold font-sans">{log.action}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase font-sans border ${log.outcome === 'Blocked' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                              {log.outcome}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                onLogAudit('audit.evidence_report_preview', 'session_evidence', log.id, { org: log.orgName });
                              }}
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold font-sans shadow-sm"
                              title="Export Cryptographically Signed Evidence"
                            >
                              <Code className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Export</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-bold tracking-widest uppercase inline-flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              </span>
                              <button
                                onClick={() => handleCopySignature(log.signature)}
                                className="text-slate-400 hover:text-slate-800 text-[9px] cursor-pointer bg-transparent border-none font-bold font-mono transition-colors"
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
            <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-3xl space-y-5 text-left relative animate-[fadeIn_0.2s_ease-out] font-sans shadow-sm">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[9px] font-mono tracking-widest uppercase font-black">AAN Trusted Evidence</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-tight">Session Evidence Report</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Raw cryptographic trust signals and decision logs compiled for audit verification.</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Session/Log Metadata */}
              <div className="bg-slate-50/50 border border-slate-200/50 p-3.5 rounded-2xl space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">SESS ID:</span>
                  <span className="text-slate-700 font-bold truncate max-w-[150px] font-sans" title={selectedLog.id}>{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">SUBJECT ACTOR:</span>
                  <span className="text-slate-800 font-bold font-sans">{selectedLog.actor_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">TENANT SCOPE:</span>
                  <span className="text-emerald-700 font-bold font-sans">{selectedLog.orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">TIMESTAMP:</span>
                  <span className="text-slate-600 font-sans">{new Date(selectedLog.created_at).toLocaleString()}</span>
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
                    <div className="bg-slate-50/30 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Policy Verdict</span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border font-sans ${
                          isBlocked 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {report.trust_decision_verdict.decision}
                        </span>
                      </div>

                      {/* Scores Progress Bars */}
                      <div className="space-y-2.5 text-[10px] font-mono">
                        <div>
                          <div className="flex justify-between text-slate-500 mb-1 font-sans font-bold">
                            <span>TRUST REP SCORE:</span>
                            <span className={isBlocked ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                              {report.trust_decision_verdict.trust_score}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${report.trust_decision_verdict.trust_score}%` }} 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-500 mb-1 font-sans font-bold">
                            <span>RISK VELOCITY CONFIDENCE:</span>
                            <span className="text-slate-800 font-bold">
                              {report.trust_decision_verdict.risk_score}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-slate-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${report.trust_decision_verdict.risk_score}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reasons block */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Decision Rationale Signals:</span>
                      <div className="space-y-1.5">
                        {report.trust_decision_verdict.reasons.map((r: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600 font-medium">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compiled Raw Signals Metrics */}
                    <div className="bg-slate-50/50 border border-slate-200/50 p-3.5 rounded-2xl space-y-2 text-[10px] font-mono text-slate-500">
                      <span className="text-[8px] text-slate-400 uppercase font-black block mb-1">Raw Evaluated Signals Monitor</span>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold">Impossible Travel:</span>
                        <span className={report.telemetry_signals.impossible_travel ? 'text-rose-600 font-bold' : 'text-slate-400 font-bold'}>
                          {report.telemetry_signals.impossible_travel ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold">Credential Stuffing:</span>
                        <span className={report.telemetry_signals.credential_stuffing ? 'text-rose-600 font-bold' : 'text-slate-400 font-bold'}>
                          {report.telemetry_signals.credential_stuffing ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold">Coordinated Bot Indicator:</span>
                        <span className={report.telemetry_signals.bot_network_indicators ? 'text-rose-600 font-bold' : 'text-slate-400 font-bold'}>
                          {report.telemetry_signals.bot_network_indicators ? 'TRUE (FLAGGED)' : 'FALSE'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold">Device Anomaly Score:</span>
                        <span className={report.telemetry_signals.device_anomaly_rating > 50 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {report.telemetry_signals.device_anomaly_rating}% Risk
                        </span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span className="font-bold">Attestation Proof:</span>
                        <span className={report.telemetry_signals.humanness_posture_attestation.proof_verified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {report.telemetry_signals.humanness_posture_attestation.proof_verified ? 'PASSED (ZKP)' : 'FAILED/MISSING'}
                        </span>
                      </div>
                    </div>

                    {/* Raw JSON payload export block */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="uppercase text-slate-400 font-bold flex items-center gap-1 font-mono">
                          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                          Verifiable Payload
                        </span>
                        <button
                          onClick={() => handleCopyReportText(selectedLog)}
                          className="hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors text-slate-400 uppercase font-black text-[8px] bg-transparent border-none font-sans"
                        >
                          {copiedReport ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          {copiedReport ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 font-mono text-[9px] max-h-[140px] overflow-y-auto relative text-slate-700 shadow-inner">
                        <pre className="whitespace-pre overflow-x-auto text-left leading-normal font-medium">
                          {JSON.stringify(report, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleDownloadReport(selectedLog)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 hover:border-emerald-300 text-emerald-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-sans"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
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
      <div className="border-t border-slate-200/60 pt-8 space-y-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-600" />
            Outgoing Webhooks Monitor Center
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-sans font-medium">
            Evaluate, replay, and inspect callback event triggers successfully dispatched to partner servers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Outgoing Webhooks List */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                    <th className="py-3 px-4">Event Topic</th>
                    <th className="py-3 px-4">Recipient Partner</th>
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4">Retries</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {webhooks.map((wh) => (
                    <tr 
                      key={wh.id} 
                      onClick={() => setSelectedWebhook(wh)}
                      className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${selectedWebhook?.id === wh.id ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="py-3.5 px-4 text-slate-800 font-bold font-sans">{wh.event}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-sans font-semibold">{wh.partner}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-sans border ${wh.code === 200 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                          {wh.code} {wh.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold font-sans">{wh.retries} / 5</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplayWebhook(wh);
                          }}
                          className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-950 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer transition-colors font-sans shadow-sm"
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
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 shadow-sm text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              Webhook Payload Inspector
            </span>

            {selectedWebhook ? (
              <div className="space-y-4 font-mono text-xs animate-[fadeIn_0.15s_ease-out]">
                <div className="text-[11px] space-y-1">
                  <span className="text-slate-400 font-bold">Destination Partner:</span>
                  <p className="text-slate-800 font-bold font-sans">{selectedWebhook.partner}</p>
                  <span className="text-slate-400 font-bold mt-2.5 block">Timestamp dispatched:</span>
                  <p className="text-slate-600 font-sans">{selectedWebhook.date}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1 font-sans">JSON Content:</span>
                  <pre className="text-[10px] text-slate-700 overflow-x-auto whitespace-pre-wrap leading-tight font-medium">
                    {JSON.stringify(selectedWebhook.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans font-semibold italic">Select a webhook call log to inspect payloads.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
