import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface VerifySessionFlowProps {
  sessionId?: string;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

interface TrustScenario {
  id: string;
  name: string;
  decision: 'APPROVED' | 'CHALLENGE REQUIRED' | 'PENDING REVIEW' | 'REJECTED';
  riskScore: number;
  summary: string;
}

const TRUST_SCENARIOS: TrustScenario[] = [
  {
    id: 'approved',
    name: 'Standard User (Low Risk)',
    decision: 'APPROVED',
    riskScore: 6,
    summary: 'Unique, real user signature verified.'
  },
  {
    id: 'step_up',
    name: 'Secondary Device Check Needed',
    decision: 'CHALLENGE REQUIRED',
    riskScore: 35,
    summary: 'Liveness confirmed but device signature is new.'
  },
  {
    id: 'review',
    name: 'Manual Audit Pending',
    decision: 'PENDING REVIEW',
    riskScore: 55,
    summary: 'Conflicts in timing thresholds requiring admin verification.'
  },
  {
    id: 'rejected',
    name: 'Duplicate Signature Found',
    decision: 'REJECTED',
    riskScore: 94,
    summary: 'Duplicate template detected matching an existing ledger record.'
  }
];

export default function VerifySessionFlow({ sessionId: initialSessionId, onComplete, onNavigate }: VerifySessionFlowProps) {
  const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
  const [activeScenario, setActiveScenario] = useState<TrustScenario>(TRUST_SCENARIOS[0]);
  const [flowState, setFlowState] = useState<'idle' | 'checking' | 'verified' | 'blocked' | 'review'>('idle');

  useEffect(() => {
    if (!sessionId) {
      setSessionId(`vss_${Math.random().toString(36).substring(2, 11)}`);
    }
  }, [sessionId]);

  const runVerification = () => {
    setFlowState('checking');
    setTimeout(() => {
      // Direct mapping to selected scenario decision state
      if (activeScenario.id === 'approved' || activeScenario.id === 'step_up') {
        setFlowState('verified');
      } else if (activeScenario.id === 'rejected') {
        setFlowState('blocked');
      } else {
        setFlowState('review');
      }
    }, 1600);
  };

  const handleSelectScenario = (scen: TrustScenario) => {
    setActiveScenario(scen);
    setFlowState('idle');
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#8e96a3] font-sans selection:bg-blue-600/20 selection:text-white flex flex-col justify-between py-16 px-6 sm:px-12">
      
      {/* Quiet Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/5 pb-6 mb-12">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-white text-sm tracking-tight">Trust Verification</span>
        </div>
        <div className="text-[10px] font-mono text-[#5d6470]">
          Session: <span className="text-white font-mono">{sessionId}</span>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center flex-1 my-auto">
        
        {/* LEFT CARD: THE RESTRAINED VERIFICATION PANEL */}
        <div className="md:col-span-7 flex justify-center">
          <div className="border border-white/5 bg-[#0b0c0f] rounded-xl p-8 sm:p-10 w-full max-w-md min-h-[300px] flex flex-col justify-between space-y-8">
            
            {/* 1. IDLE STATE */}
            {flowState === 'idle' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h2 className="text-lg font-medium text-white tracking-tight">Confirm secure connection.</h2>
                  <p className="text-xs text-[#646e7a] leading-relaxed">
                    Verify secure, unique human presence. This platform employs non-identifying telemetry to block automated attacks.
                  </p>
                </div>

                <button
                  onClick={runVerification}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono py-3.5 rounded transition-colors cursor-pointer"
                >
                  Verify Presence
                </button>
              </div>
            )}

            {/* 2. CHECKING STATE */}
            {flowState === 'checking' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-xs font-mono text-white tracking-wide">Checking trust...</span>
              </div>
            )}

            {/* 3. VERIFIED STATE */}
            {flowState === 'verified' && (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-white">Verification Complete</span>
                  </div>

                  {/* Clean Requested list */}
                  <div className="space-y-3 pt-2 font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Human verified</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Unique session</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Low risk</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full bg-white hover:bg-[#e2e5eb] text-slate-950 text-xs font-mono py-3.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* 4. BLOCKED STATE */}
            {flowState === 'blocked' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-white">Access Denied</span>
                  </div>
                  <p className="text-xs text-[#646e7a] leading-relaxed">
                    Uniqueness policy conflict detected. This signature matches an existing profile on the ledger.
                  </p>
                </div>

                <button
                  onClick={() => setFlowState('idle')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-mono py-3 rounded transition-colors cursor-pointer"
                >
                  Retry Verification
                </button>
              </div>
            )}

            {/* 5. REVIEW STATE */}
            {flowState === 'review' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-white">Verification Pending</span>
                  </div>
                  <p className="text-xs text-[#646e7a] leading-relaxed">
                    Atypical device context. Awaiting manual administrator verification override to proceed.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('admin')}
                  className="w-full bg-white hover:bg-[#e2e5eb] text-slate-950 text-xs font-mono py-3 rounded transition-colors cursor-pointer"
                >
                  Admin Portal Override
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT SIDEBAR: SANDBOX CONTROLLER */}
        <div className="md:col-span-5 space-y-6">
          <div className="border border-white/5 bg-[#0b0c0f] rounded-xl p-6 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#646e7a] block font-bold">
              Sandbox Controller
            </span>
            <p className="text-[11px] text-[#646e7a] leading-relaxed">
              Select a scenario context to test different risk assessments and evaluate client response paths.
            </p>

            <div className="space-y-2 pt-2">
              {TRUST_SCENARIOS.map((scen) => {
                const isActive = activeScenario.id === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen)}
                    className={`w-full p-3.5 rounded text-left transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      isActive 
                        ? 'bg-blue-950/20 border border-blue-500/30 text-white' 
                        : 'border border-white/5 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-medium text-white">{scen.name}</span>
                      <span className="text-[8px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-[#8e96a3]">
                        {scen.decision}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#646e7a] leading-relaxed line-clamp-1">{scen.summary}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Disclaimer */}
      <div className="text-center mt-12 text-[10px] font-mono text-[#404652]">
        All data is processed ephemerally. Active privacy-safety compliance standards enforced.
      </div>

    </div>
  );
}
