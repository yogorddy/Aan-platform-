import React, { useState } from 'react';
import { 
  Fingerprint, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import ZKProofsTab from './ZKProofsTab';

interface HumanAssuranceTabProps {
  events: any[];
  projName: string;
  onAddEventToGlobalRegistry: (event: any) => void;
}

export default function HumanAssuranceTab({ events, projName, onAddEventToGlobalRegistry }: HumanAssuranceTabProps) {
  const [showZkProofs, setShowZkProofs] = useState(false);

  // Derive metrics
  const totalAttempts = events.length;
  const approvedHumans = events.filter(e => e.decision === 'approved').length;
  const humanConfidencePct = totalAttempts > 0 ? Math.round((approvedHumans / totalAttempts) * 100) : 100;

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-emerald-600" />
            <span>Human Assurance Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validate whether an account or interaction is backed by a real, unique, and returning human.
          </p>
        </div>

        <button
          onClick={() => setShowZkProofs(!showZkProofs)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
            showZkProofs 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/15"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{showZkProofs ? "Hide Cryptographic Proofs" : "View ZK Cryptographic Proofs"}</span>
        </button>
      </div>

      {showZkProofs ? (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-bold">Advanced Cryptographic Module</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Zero-Knowledge (ZKP) Attestation Engine</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Compile machine-learning models into EZKL arithmetic circuits. Validate telemetry constraints off-path without sharing raw device or network signals.
            </p>
          </div>
          <ZKProofsTab projName={projName} onAddEventToGlobalRegistry={onAddEventToGlobalRegistry} />
        </div>
      ) : (
        <>
          {/* Main Human Assurance Indicators Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Humanity Confidence</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">{humanConfidencePct}%</span>
                <p className="text-[11px] text-slate-400 font-light">Average humanity rating across incoming sessions.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${humanConfidencePct}%` }} className="bg-[#00D632] h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Uniqueness Index</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">{totalAttempts > 0 ? "High Assurance" : "Pending"}</span>
                <p className="text-[11px] text-slate-400 font-light">Confirming distinct device/identity signatures without cross-site tracking.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00D632] h-full rounded-full w-full" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Continuity (Returning)</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">Active</span>
                <p className="text-[11px] text-slate-400 font-light">Preserving session relationship histories via zero-knowledge tokens.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00D632] h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Privacy & Methodology details */}
          <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl space-y-4 text-left">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Privacy-Preserving Assurance Framework</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px]">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">1. Mathematical Hash Integrity</h4>
                <p className="text-slate-500 font-light leading-relaxed">
                  No passwords, emails, or hardware keys are ever stored in cleartext. Posture values are securely transformed into non-reversible mathematical digests.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">2. Device Sandbox Enclaves</h4>
                <p className="text-slate-500 font-light leading-relaxed">
                  Telemetry collection runs safely within sandboxed worker containers to secure raw posture variables against external injection.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Human Assurance specific profiles */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Recent Humanness Assertions</h3>
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-4 font-bold">Session Reference</th>
                    <th className="py-3 px-4 font-bold">Human Verdict</th>
                    <th className="py-3 px-4 font-bold">Uniqueness Confidence</th>
                    <th className="py-3 px-4 font-bold">Returning Status</th>
                    <th className="py-3 px-4 font-bold text-right">Assurance Stamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-light">
                        No active humanness assertions found. Use Test Lab to simulate events.
                      </td>
                    </tr>
                  ) : (
                    events.slice(0, 5).map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-slate-900">{e.id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            e.decision === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {e.decision === 'approved' ? "Verified Human" : "Rejected / Risk"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{e.decision === 'approved' ? '99.8%' : '12.4%'}</td>
                        <td className="py-3.5 px-4 text-slate-500">{e.returning_human ? "Verified Continuity" : "New Environment"}</td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
