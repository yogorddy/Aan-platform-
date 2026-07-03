import React, { useState } from 'react';
import { Shield, ArrowRight, ShieldCheck, Cpu, Code2, Sparkles, RefreshCw, EyeOff, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  // Sandbox Simulator state
  const [scenario, setScenario] = useState<'fintech' | 'dao' | 'gpu'>('fintech');
  const [profileType, setProfileType] = useState<'human' | 'duplicate' | 'bot'>('human');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>({
    status: "passed",
    risk_score: 4,
    decision: "ALLOW_SESSION",
    reasons: [],
    proof_token: "aan_proof_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhYW4iLCJzdWIiOiJ1c3JfYmMyIiwiY29udGV4dCI6ImZpbnRlY2giLCJodW1hbl9zdGF0dXMiOiJ2ZXJpZmllZCIsInVuaXF1ZW5lc3MiOiJ1bmlxdWUiLCJyaXNrX3Njb3JlIjo0fQ.signed_sig"
  });

  // Explorer state
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'compiled' | 'purged'>('idle');
  const [scanTelemetry, setScanTelemetry] = useState<string>("");

  const handleRunSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      if (profileType === 'human') {
        setSimResult({
          status: "passed",
          risk_score: 4,
          decision: "ALLOW_SESSION",
          reasons: [],
          proof_token: `aan_proof_jwt_${Math.random().toString(36).substring(2, 10)}_eyJpc3MiOiJhYW4iLCJzdWIiOiJ1c3JfYmMyIiwiY29udGV4dCI6IiR7c2NlbmFyaW99IiwiY29udGV4dCI6InVuaXF1ZV9odW1hbiIsImh1bWFuX3N0YXR1cyI6InZlcmlmaWVkIiwidW5pcXVlbmVzcyI6InVuaXF1ZSIsInJpc2tfc2NvcmUiOjR9`
        });
      } else if (profileType === 'duplicate') {
        setSimResult({
          status: "review",
          risk_score: 55,
          decision: "CHALLENGE_ADDITIONAL_FACTOR",
          reasons: ["new_device_on_existing_user", "mismatched_returning_user_signal"],
          proof_token: `aan_proof_jwt_${Math.random().toString(36).substring(2, 10)}_eyJpc3MiOiJhYW4iLCJzdWIiOiJ1c3JfYmMyIiwiY29udGV4dCI6IiR7c2NlbmFyaW99IiwiY29udGV4dCI6ImR1cGxpY2F0ZV9wYXR0ZXJuIiwiY29udGV4dCI6InN1c3BpY2lvdXMiLCJyaXNrX3Njb3JlIjo1NX0`
        });
      } else {
        setSimResult({
          status: "failed",
          risk_score: 95,
          decision: "DENY_ACCESS",
          reasons: ["rapid_repeated_attempts", "suspicious_automation_patterns", "device_emulation_risk"],
          proof_token: ""
        });
      }
    }, 850);
  };

  const handleStartExplorerScan = () => {
    setScanState('scanning');
    setScanTelemetry("Reading hardware keys & touch timing intervals...");
    setTimeout(() => {
      setScanTelemetry("Attesting system integrity, calculating posture parameters...");
    }, 1000);
    setTimeout(() => {
      setScanState('compiled');
      setScanTelemetry("Signature Compiled: sha256_90f23d7781b1...");
    }, 2000);
    setTimeout(() => {
      setScanState('purged');
      setScanTelemetry("SUCCESS: Ephemeral buffers permanently overwritten. RAM cleared.");
    }, 3800);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#8e96a3] font-sans selection:bg-blue-600/20 selection:text-white flex flex-col justify-between py-12 px-6 md:px-12 lg:px-24">
      
      {/* Reduced Navigation Header */}
      <nav className="max-w-7xl mx-auto w-full flex items-center justify-between mb-16 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-950 p-1.5 rounded border border-blue-900/30 text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-md tracking-tight block leading-none">AAN</span>
            <span className="text-[8px] font-mono uppercase text-[#646e7a] tracking-widest block mt-1">Trust Infrastructure</span>
          </div>
        </div>

        {/* Minimal Navigation links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-tight">
          <button 
            onClick={() => onNavigate('landing')} 
            className="text-white font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            Platform
          </button>
          <button 
            onClick={() => onNavigate('trustdocs', 'sdks')} 
            className="text-[#646e7a] hover:text-white transition-colors cursor-pointer"
          >
            Developers
          </button>
          <button 
            onClick={() => onNavigate('trustdocs', 'docs')} 
            className="text-[#646e7a] hover:text-white transition-colors cursor-pointer"
          >
            Documentation
          </button>
          <button 
            onClick={() => onNavigate('trustdocs', 'pricing')} 
            className="text-[#646e7a] hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button 
            onClick={() => onNavigate('trustdocs', 'security')} 
            className="text-[#646e7a] hover:text-white transition-colors cursor-pointer"
          >
            Security
          </button>
        </div>

        {/* Quiet sign in */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('partner')} 
            className="text-xs font-mono font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:scale-[1.01]"
          >
            Partner Console
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center space-y-24">
        
        {/* Mission Statement Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-block bg-blue-950/40 text-blue-400 border border-blue-900/40 font-bold px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest leading-none">
              Stage 1: Establishing Intent
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
              Privacy-preserving proof-of-human infrastructure.
            </h1>
            <p className="text-base md:text-lg text-[#646e7a] font-normal leading-relaxed max-w-2xl">
              AAN is a quiet, enterprise-grade trust engine that helps digital platforms reduce bots, duplicate accounts, and identity fraud — without collecting, storing, or exposing personal identity data.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button 
                onClick={() => onNavigate('partner')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-6 py-3.5 rounded transition-all cursor-pointer flex items-center gap-2 group shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                <span>Deploy AAN Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={onStartDemoSession}
                className="text-xs font-mono text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20 bg-white/[0.02] px-5 py-3.5 rounded flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Run Interactive Attestation</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-xl font-mono text-xs">
              <div>
                <span className="text-white font-bold text-lg block">99.9%</span>
                <span className="text-[10px] text-[#646e7a] block uppercase tracking-wide">Bot Defended</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg block">0.0 ms</span>
                <span className="text-[10px] text-[#646e7a] block uppercase tracking-wide">PII Retained</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg block">1.2M+</span>
                <span className="text-[10px] text-[#646e7a] block uppercase tracking-wide">Attested Users</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-b from-[#111319] to-[#090b0e] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Attestation Sandbox</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <p className="text-xs text-[#646e7a] mb-6">
              Simulate AAN's cryptographic handshake. Choose an active scenario and profile to generate a signed Proof Token.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setScenario('fintech')}
                  className={`py-1.5 px-2 rounded border font-mono text-[10px] transition-all cursor-pointer ${scenario === 'fintech' ? 'bg-blue-950/40 border-blue-500 text-white font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                >
                  Fintech App
                </button>
                <button 
                  onClick={() => setScenario('dao')}
                  className={`py-1.5 px-2 rounded border font-mono text-[10px] transition-all cursor-pointer ${scenario === 'dao' ? 'bg-blue-950/40 border-blue-500 text-white font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                >
                  DAO Governance
                </button>
                <button 
                  onClick={() => setScenario('gpu')}
                  className={`py-1.5 px-2 rounded border font-mono text-[10px] transition-all cursor-pointer ${scenario === 'gpu' ? 'bg-blue-950/40 border-blue-500 text-white font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                >
                  Cloud GPU Core
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-mono text-[#646e7a] block font-semibold">Attestation Subject Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setProfileType('human')}
                    className={`py-2 px-1.5 rounded border transition-all text-center cursor-pointer ${profileType === 'human' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                  >
                    Human (Safe)
                  </button>
                  <button 
                    onClick={() => setProfileType('duplicate')}
                    className={`py-2 px-1.5 rounded border transition-all text-center cursor-pointer ${profileType === 'duplicate' ? 'bg-yellow-950/30 border-yellow-500 text-yellow-400 font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                  >
                    Duplicate (Review)
                  </button>
                  <button 
                    onClick={() => setProfileType('bot')}
                    className={`py-2 px-1.5 rounded border transition-all text-center cursor-pointer ${profileType === 'bot' ? 'bg-red-955/30 border-red-500 text-red-400 font-bold' : 'bg-black/20 border-white/5 text-[#646e7a] hover:text-white'}`}
                  >
                    Sybil Bot (Block)
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold py-2 px-4 rounded border border-white/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing RAM Heuristics...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Simulate Dynamic Handshake</span>
                  </>
                )}
              </button>

              <AnimatePresence mode="wait">
                {simResult && !simulating && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3.5 rounded bg-black/40 border border-white/5 font-mono text-[10px] space-y-2 mt-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#646e7a]">Decision Output:</span>
                      <span className={`font-bold ${simResult.decision === 'ALLOW_SESSION' ? 'text-emerald-400' : simResult.decision === 'DENY_ACCESS' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {simResult.decision}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#646e7a]">Calculated Risk Score:</span>
                      <span className="text-white font-bold">{simResult.risk_score} / 100</span>
                    </div>
                    {simResult.reasons.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Flag Reasons:</span>
                        <div className="flex flex-wrap gap-1">
                          {simResult.reasons.map((r: string) => (
                            <span key={r} className="bg-red-950/30 text-red-400 px-1 rounded border border-red-900/30 text-[9px]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {simResult.proof_token ? (
                      <div className="space-y-1">
                        <span className="text-[#646e7a] block">Signed Proof Token (JWT Claims Payload):</span>
                        <div className="bg-[#0c0d12] p-2 rounded text-[9px] text-[#8e96a3] break-all border border-white/5 overflow-y-auto max-h-16 select-all scrollbar-thin">
                          <code>{simResult.proof_token}</code>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-[9px] bg-red-955/20 p-2 rounded border border-red-900/20">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        <span>Token issuance withheld. Access denied due to critical threat score.</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Dynamic Interactive Explorer Block */}
        <section className="space-y-6 text-left border-t border-white/5 pt-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#646e7a] block font-semibold mb-1">
              Data Privacy Sandbox
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Privacy Guard telemetry compiler.
            </h2>
            <p className="text-xs text-[#646e7a] leading-relaxed mt-1">
              Verify how AAN compiles device signals in memory, triggers attestation checks, and permanently overwrites buffers to prevent storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 bg-slate-900/40 border border-white/5 p-6 rounded-xl space-y-4">
              <span className="font-bold text-white text-xs block uppercase tracking-wide font-mono">Sandbox User Device</span>
              
              <div className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#646e7a]">
                  <span>Sensor Captures (Touch timing, key velocities)</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${scanState === 'scanning' ? 'bg-blue-500 animate-ping' : scanState === 'compiled' ? 'bg-blue-400' : 'bg-slate-600'}`} />
                </div>

                <div className="h-10 bg-black/60 rounded flex items-center justify-center border border-white/5 px-4 overflow-hidden relative">
                  {scanState === 'idle' && <span className="text-[10px] text-slate-500 font-mono">Telemetry idle.</span>}
                  {scanState === 'scanning' && (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      <span className="text-[10px] text-blue-400 font-mono">Capturing biological timing...</span>
                    </div>
                  )}
                  {scanState === 'compiled' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Signature hash established in RAM.</span>
                    </div>
                  )}
                  {scanState === 'purged' && (
                    <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px]">
                      <EyeOff className="w-3.5 h-3.5 text-blue-500" />
                      <span>Volatile buffers shredded (0.0ms stored)</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleStartExplorerScan}
                disabled={scanState === 'scanning'}
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-mono font-bold py-2.5 rounded border border-blue-500/20 text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Initialize Ephemeral Capture</span>
              </button>
            </div>

            <div className="md:col-span-7 bg-[#0c0d12] border border-white/5 p-6 rounded-xl space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-white font-bold">RAM Live Sandbox Terminal</span>
                <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">Console Log</span>
              </div>

              <div className="space-y-2 text-[#646e7a] min-h-[120px] font-mono text-[10px] leading-relaxed">
                <div>[SYSTEM] Booting ephemeral sandbox framework...</div>
                <div>[SYSTEM] Listening to device cryptographic anchors...</div>
                {scanTelemetry && (
                  <div className="text-blue-400 font-bold">&gt; {scanTelemetry}</div>
                )}
                {scanState === 'compiled' && (
                  <div className="text-slate-200">
                    <div>[COMPILE] Signature template hash generated in non-swap RAM block:</div>
                    <div className="text-emerald-400 select-all font-semibold pl-3">hash = ecc-secp256k1_sha256_90f23d7781b1731671239aa8e...</div>
                  </div>
                )}
                {scanState === 'purged' && (
                  <div className="text-[#646e7a] space-y-1">
                    <div className="text-emerald-400 font-bold">[RAM] Shredding cryptographic signature buffers... Done.</div>
                    <div className="text-emerald-400 font-bold">[RAM] Ephemeral posture arrays overwritten with random zeroes... Done.</div>
                    <div className="text-slate-300 font-bold">[SUCCESS] Zero traces remaining. Raw biological cues permanently destroyed. Only Signed Proof Token generated.</div>
                  </div>
                )}
              </div>

              <div className="bg-[#111319] p-3.5 rounded border border-white/5 font-sans text-[11px] text-[#646e7a]">
                <strong className="text-slate-300 block mb-0.5">Privacy Assertion:</strong> Because raw biometric templates and camera capture files are shredded post-verification, AAN is immune to data breach leaks and compliance concerns.
              </div>
            </div>
          </div>
        </section>

        {/* Three Trust Principles Card Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-16">
          <div className="bg-[#111319]/40 border border-white/5 p-6 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-900/40 text-blue-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-white text-sm font-semibold tracking-tight">Zero permanent storage.</h3>
            <p className="text-xs leading-relaxed text-[#646e7a]">
              Biological timing and posture measurements are processed entirely in volatile RAM and immediately purged. We do not store biometrics, images, or files.
            </p>
          </div>

          <div className="bg-[#111319]/40 border border-white/5 p-6 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-white text-sm font-semibold tracking-tight">Cryptographic uniqueness.</h3>
            <p className="text-xs leading-relaxed text-[#646e7a]">
              We verify that an interaction is backed by a unique, real human without reading, mapping, or recording their physical identifiers.
            </p>
          </div>

          <div className="bg-[#111319]/40 border border-white/5 p-6 rounded-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-white text-sm font-semibold tracking-tight">Compartmentalized proof.</h3>
            <p className="text-xs leading-relaxed text-[#646e7a]">
              Partner applications receive only asymmetric signed tokens indicating verification status and risk scores. Private client context remains intact.
            </p>
          </div>
        </section>

      </main>

      {/* Timeless Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-24 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-[#404652] gap-4 text-left">
        <span>© 2026 AAN Trust Infrastructure. All rights reserved.</span>
        <div className="flex gap-6">
          <button onClick={() => onNavigate('trustdocs', 'privacy')} className="hover:text-[#646e7a] cursor-pointer">Privacy Policy</button>
          <button onClick={() => onNavigate('trustdocs', 'terms')} className="hover:text-[#646e7a] cursor-pointer">Terms of Service</button>
        </div>
      </footer>

    </div>
  );
}
