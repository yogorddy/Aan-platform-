import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  Fingerprint, 
  ArrowRight, 
  Loader2, 
  Cpu, 
  Sparkles, 
  Key,
  Gamepad2,
  Users,
  Wallet,
  ShoppingBag,
  GraduationCap,
  X,
  Laptop,
  Smartphone,
  Code,
  Zap,
  AlertCircle
} from 'lucide-react';
import AANShieldLogo from './AANShieldLogo';
import AANSignupForm from './AANSignupForm';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: (email?: string) => void;
}

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [activeSpeedStep, setActiveSpeedStep] = useState(0);

  // Auto-running fast animation for Section 8
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeedStep(prev => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setConnectionLogs([]);
    
    const logs = [
      "Initializing secure sandbox enclave...",
      "Extracting local machine telemetry signatures...",
      "Generating ephemeral zero-knowledge keypairs...",
      "Cryptographic handshake complete. Authorization granted."
    ];

    let currentLogIndex = 0;
    
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setConnectionLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => {
          setIsConnecting(false);
          setShowAuthOverlay(false);
          const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
          if (isAuthenticated) {
            onNavigate('partner', '/dashboard');
          } else {
            onStartDemoSession();
          }
        }, 800);
      }
    }, 450);
  };

  const handleOpenAuth = () => {
    setShowAuthOverlay(true);
    setShowSignup(false);
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative selection:bg-[#00D632]/20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#00D632]">
              <AANShieldLogo strokeWidth={6} />
            </div>
            <span className="text-xl font-bold tracking-tight text-black">AAN</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#product" className="hover:text-black transition-colors">Product</a>
            <a href="#platform" className="hover:text-black transition-colors">Platform</a>
            <a href="#privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="#dashboard" className="hover:text-black transition-colors">Console</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenAuth}
              className="px-5 py-2.5 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all active:scale-95"
            >
              Launch Sandbox
            </button>
          </div>
        </div>
      </header>

      {/* ================= SECTION 1: HERO ================= */}
      <section id="product" className="min-h-[90vh] flex flex-col justify-center bg-white px-6 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#00D632]" />
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold">Autonomous Account Network</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-black leading-[1.05] max-w-xl">
              Trust every account.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-lg">
              Know whether an account belongs to a real, returning human. Quietly, safely, and instantly.
            </p>

            <div className="pt-4">
              <button 
                onClick={handleOpenAuth}
                className="px-8 py-4 rounded-full bg-[#00D632] hover:bg-[#00b029] text-black font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-[#00D632]/15 hover:shadow-xl hover:shadow-[#00D632]/25 transition-all active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Elegant simple illustration of verified human */}
            <div className="w-full max-w-sm bg-slate-50 rounded-[2rem] p-8 border border-slate-100/80 shadow-sm relative">
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">INTEGRITY CHECK</span>
              </div>

              <div className="space-y-6 pt-4">
                <div className="w-16 h-16 bg-[#00D632]/10 rounded-2xl flex items-center justify-center text-[#00D632]">
                  <Fingerprint className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold block">Verified Status</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-black tracking-tight">Real Human</h3>
                    <CheckCircle2 className="w-5 h-5 text-[#00D632] fill-[#00D632]/10" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Identity Match</span>
                    <span className="font-mono text-slate-700 font-semibold">99.8% Confirmed</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00D632] h-full rounded-full w-[99.8%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: PLATFORM ================= */}
      <section id="platform" className="min-h-[80vh] flex flex-col justify-center bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-last lg:order-first flex justify-center">
            {/* Elegant mock API payload */}
            <div className="w-full max-w-sm bg-black rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-medium">verify_account.ts</span>
              </div>
              <div className="space-y-4 font-mono text-xs">
                <div className="text-slate-500">// Initialize instant verification</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">res</span> = <span className="text-purple-400">await</span> <span className="text-amber-400">aan</span>.<span className="text-blue-400">verify</span>({`{`}
                  <div className="pl-4">
                    <span className="text-slate-400">token:</span> <span className="text-emerald-400">"session_8f3a..."</span>
                  </div>
                  {`});`}
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <div className="text-slate-500">// Instant JSON response</div>
                  <div className="text-emerald-400">{`{`}</div>
                  <div className="pl-4 text-emerald-400">
                    <div>"human": <span className="text-white">true</span>,</div>
                    <div>"confidence": <span className="text-white">1.00</span>,</div>
                    <div>"verdict": <span className="text-white">"APPROVED"</span></div>
                  </div>
                  <div className="text-emerald-400">{`}`}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight">
              Works with your platform.
            </h2>
            
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-lg">
              Embed enterprise-grade identity integrity into your app with zero operational overhead.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                { label: "No new login", desc: "No frustrating prompts, captchas, or external auth redirect screens." },
                { label: "One API", desc: "A simple, single endpoint that handles telemetry, device fingerprinting, and scoring." },
                { label: "Ready in minutes", desc: "Integrate with our lightweight SDK on any modern framework in less than ten lines of code." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#00D632]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-black">{item.label}</h4>
                    <p className="text-sm text-slate-400 font-light mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: QUIET EVALUATION ================= */}
      <section className="min-h-[85vh] flex flex-col justify-center bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto w-full text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              Detect suspicious activity.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              AAN quietly evaluates trust during sign-in. No friction, no latency, no passwords required.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-sm">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block mb-1">REAL-TIME TRUST RADAR</span>
                  <h3 className="text-lg font-bold text-black">Sign-in Activity Feed</h3>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs text-slate-500">
                  <Zap className="w-3.5 h-3.5 text-[#00D632] fill-[#00D632]/10" />
                  <span>Telemetry Active</span>
                </div>
              </div>

              <div className="space-y-3.5 text-left">
                {[
                  { user: "User #8492", status: "Clean", score: "99% Human", color: "text-[#00D632]", bg: "bg-[#00D632]/5", border: "border-[#00D632]/10" },
                  { user: "User #1134", status: "Anomalous", score: "8% Human", color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/10" },
                  { user: "User #9941", status: "Clean", score: "98% Human", color: "text-[#00D632]", bg: "bg-[#00D632]/5", border: "border-[#00D632]/10" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.border} ${item.bg} flex justify-between items-center transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {item.user.slice(-2)}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-black block">{item.user}</span>
                        <span className="text-xs text-slate-400 font-light">Authenticated from browser environment</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${item.color} block`}>{item.status}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: BOT BLOCKER ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              Keep bots out.
            </h2>
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-lg">
              Fake accounts are stopped before they become a problem. Shield your sign-up, reservation, and API gates effortlessly.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Visual bot filtration graphic */}
            <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-mono text-sm font-bold shrink-0">
                  BOT
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-rose-950 block">Device Spoofing Blocked</span>
                  <span className="text-[10px] text-rose-500 font-mono">Simulated WebGL environment detected</span>
                </div>
                <div className="text-rose-500 text-xs font-bold">Blocked</div>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="w-0.5 h-12 bg-slate-100 relative">
                  <div className="absolute inset-0 bg-[#00D632]/40 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#00D632]/5 rounded-2xl border border-[#00D632]/10">
                <div className="w-10 h-10 rounded-xl bg-[#00D632]/10 flex items-center justify-center text-[#00D632] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-900 block">Real Human Approved</span>
                  <span className="text-[10px] text-slate-400 font-mono">Verified behavioral fingerprint signature</span>
                </div>
                <div className="text-[#00D632] text-xs font-bold">Passed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: RECOGNIZE RETURNING USERS ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-last lg:order-first flex justify-center">
            {/* Elegant cryptographic network illustration */}
            <div className="w-full max-w-sm bg-slate-50 rounded-[2rem] p-8 border border-slate-100/80 shadow-sm relative overflow-hidden">
              <div className="flex flex-col items-center justify-center space-y-6 py-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-dashed border-[#00D632]/30 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-16 h-16 rounded-full bg-[#00D632]/10 flex items-center justify-center text-[#00D632]">
                    <Shield className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-black block">Zero-Knowledge Trust Match</span>
                  <span className="text-[10px] font-mono text-slate-400">Deterministic key: c6e4-92bf-d2c0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              Recognize returning users.
            </h2>
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-lg">
              Recognize trusted returning users without exposing personal information or demanding complex authentications. Pure security, zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: PRIVACY FIRST ================= */}
      <section id="privacy" className="min-h-[80vh] flex flex-col justify-center bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight">
              Privacy first.
            </h2>
            
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-lg">
              We never store cleartext identifiers, passwords, or personal biometrics. Encryption is baked into our platform from day one.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                { label: "No passwords stored", desc: "No databases of credentials to be breached or stolen." },
                { label: "No personal data shared", desc: "User privacy is completely preserved through advanced cryptography." },
                { label: "Partners receive only trust decisions", desc: "Platforms only receive a validated cryptographically-secure trust score." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#00D632]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-black">{item.label}</h4>
                    <p className="text-sm text-slate-400 font-light mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Minimal lock icon */}
            <div className="w-64 h-64 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-center relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#00D632]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="w-24 h-24 bg-[#00D632]/5 border border-[#00D632]/10 rounded-3xl flex items-center justify-center text-[#00D632] shadow-inner">
                <Lock className="w-12 h-12 stroke-[1.5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: BUILT FOR EVERY PLATFORM ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto w-full text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              Built for every platform.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Gaming", icon: Gamepad2 },
              { label: "Social", icon: Users },
              { label: "Finance", icon: Wallet },
              { label: "Commerce", icon: ShoppingBag },
              { label: "Education", icon: GraduationCap }
            ].map((platform, idx) => {
              const IconComp = platform.icon;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-100/70 p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:bg-slate-100/40 transition-colors shadow-sm group">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#00D632] group-hover:border-[#00D632]/20 transition-all duration-300">
                    <IconComp className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-sm font-bold text-black">{platform.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: FAST ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              Fast.
            </h2>
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-md">
              Verifying credentials, computing zero-knowledge cryptography, and evaluating integrity risks takes a fraction of a second.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Fast Minimal Verification Animation */}
            <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-black">Integrity Pipeline</span>
                <span className="text-[10px] font-mono text-slate-400">Total Latency: 42ms</span>
              </div>

              <div className="space-y-3.5">
                {[
                  { label: "Browser Context Evaluated", time: "0.01s", step: 0 },
                  { label: "Zero-Knowledge Enclave Active", time: "0.02s", step: 1 },
                  { label: "Trust Score Calculated", time: "0.01s", step: 2 },
                  { label: "Authorization Approved", time: "Instant", step: 3 }
                ].map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                      activeSpeedStep === step.step 
                        ? 'bg-[#00D632]/5 border-[#00D632]/20 text-[#00D632]' 
                        : activeSpeedStep > step.step 
                          ? 'bg-slate-50 border-slate-100 text-slate-700' 
                          : 'bg-white border-slate-100 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        activeSpeedStep === step.step 
                          ? 'bg-[#00D632] text-white animate-pulse' 
                          : activeSpeedStep > step.step 
                            ? 'bg-[#00D632]/20 text-[#00D632]' 
                            : 'bg-slate-100 text-slate-300'
                      }`}>
                        {activeSpeedStep > step.step ? (
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[#00D632]/10" />
                        ) : (
                          <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold">{step.label}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: ONE SIMPLE DASHBOARD ================= */}
      <section id="dashboard" className="min-h-[85vh] flex flex-col justify-center bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto w-full text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black">
              One simple dashboard.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              Manage your trust metrics, verify recent sign-ins, and inspect real-time platform risk telemetry from a clean unified console.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-sm">
            {/* Elegant high-fidelity console mock */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">TRUST INTEGRITY</span>
                  <div className="text-3xl font-bold text-black mt-1">98.4%</div>
                  <span className="text-[10px] text-[#00D632] font-medium mt-0.5 block">↑ 1.2% this month</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">TOTAL SESSIONS</span>
                  <div className="text-3xl font-bold text-black mt-1">1,489</div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Quietly evaluated</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">BOT ATTEMPTS BLOCKED</span>
                  <div className="text-3xl font-bold text-rose-500 mt-1">112</div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Zero human impact</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-4">Risk & Activity Breakdown</h4>
                <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden flex font-mono text-[10px] font-bold text-white text-center">
                  <div className="bg-[#00D632] flex items-center justify-center w-[92%]">92% Real Humans</div>
                  <div className="bg-amber-400 flex items-center justify-center w-[5%]">5% Review</div>
                  <div className="bg-rose-500 flex items-center justify-center w-[3%]">3% Bots</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 10: PROTECT ================= */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-slate-50 px-6 py-24 border-t border-slate-100">
        <div className="max-w-4xl mx-auto w-full text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-black leading-tight">
              Protect your platform.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-lg mx-auto">
              Ready to verify returning human traffic, eliminate bot accounts, and streamline user authentication? Let's build.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button 
              onClick={handleOpenAuth}
              className="px-8 py-4 rounded-full bg-black hover:bg-slate-800 text-white font-semibold text-sm transition-all active:scale-[0.98]"
            >
              Get Started
            </button>
            <button 
              onClick={handleOpenAuth}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all active:scale-[0.98]"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-[#00D632]">
              <AANShieldLogo strokeWidth={6} />
            </div>
            <span className="text-base font-bold text-black tracking-tight">AAN</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            <button onClick={() => onNavigate('privacy')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none">Terms of Service</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none">Contact Integration</button>
          </div>

          <span className="text-xs text-slate-400 font-light">
            © {new Date().getFullYear()} Autonomous Account Network Inc.
          </span>
        </div>
      </footer>

      {/* ================= MODAL SLIDE-OVER OVERLAY FOR AUTH & CONNECTION HANDSHAKE ================= */}
      <AnimatePresence>
        {showAuthOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isConnecting) setShowAuthOverlay(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              {!isConnecting && (
                <button 
                  onClick={() => setShowAuthOverlay(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {isConnecting ? (
                // Connection Handshake Logger block
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632]">
                      <Loader2 className="w-8 h-8 animate-spin stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black">Verifying Environment</h3>
                      <p className="text-xs text-slate-400 font-light mt-1">Completing zero-knowledge browser check...</p>
                    </div>
                  </div>

                  <div className="bg-black text-[#00D632] font-mono text-[10px] leading-relaxed p-5 rounded-2xl border border-slate-800 space-y-2 h-44 overflow-y-auto">
                    {connectionLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="opacity-60">▸</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="w-1.5 h-3 bg-[#00D632] inline-block animate-pulse ml-0.5" />
                  </div>
                </div>
              ) : showSignup ? (
                // Sign Up form
                <AANSignupForm 
                  onBack={() => setShowSignup(false)} 
                  onSuccess={(email) => {
                    setShowAuthOverlay(false);
                    onStartDemoSession(email);
                  }}
                />
              ) : (
                // Gate Select
                <div className="space-y-8 py-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] p-3">
                      <AANShieldLogo strokeWidth={5} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-black">Establish Secure Connection</h3>
                    <p className="text-xs text-slate-500 font-light max-w-xs">
                      Establish human-identity integrity and access the interactive developer workspace.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleContinue}
                      className="w-full py-4 rounded-2xl bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                      <Shield className="w-4 h-4 text-[#00D632] stroke-[2.5]" />
                      <span>Continue with AAN Guest Sandbox</span>
                    </button>

                    <button 
                      onClick={() => setShowSignup(true)}
                      className="w-full py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>Register / Sign In Organization</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex gap-3 text-left">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[#00D632] shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-black font-bold uppercase tracking-wider">Secure Cryptography</h4>
                      <p className="text-[9.5px] text-slate-400 font-light mt-0.5 leading-relaxed">
                        AAN uses advanced client-side telemetry. Raw passwords, names, or biometrics are never collected or stored.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
