import React, { useState } from 'react';
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
  Key
} from 'lucide-react';
import AANShieldLogo from './AANShieldLogo';
import AANSignupForm from './AANSignupForm';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: (email?: string) => void;
}

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [showSignup, setShowSignup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStage, setConnectionStage] = useState('');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

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
        setConnectionStage(logs[currentLogIndex]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => {
          const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
          if (isAuthenticated) {
            onNavigate('partner', '/dashboard');
          } else {
            onStartDemoSession();
          }
        }, 500);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#050507] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a110e] via-[#050507] to-[#020203] text-white font-sans flex flex-col items-center justify-between py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden select-none">
      
      {/* Background vector infrastructure grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98104_1px,transparent_1px),linear-gradient(to_bottom,#10b98104_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Soft Ambient Glows */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#58E38A]/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#58E38A]/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Placeholder */}
      <div className="w-full max-w-sm flex justify-center items-center z-10 opacity-60">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/[0.04] rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#58E38A] animate-ping" />
          <span className="text-[8px] font-mono tracking-widest text-[#58E38A] uppercase font-bold">AAN SECURE ENTRY v1.2</span>
        </div>
      </div>

      {/* Center Content Container */}
      <motion.div 
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.7, ease: "easeOut" }}
         className="w-full max-w-sm flex-1 flex flex-col items-center justify-center text-center space-y-10 z-10 py-6"
      >
        {!showSignup ? (
          <>
            {/* Brand Lockup */}
            <div className="flex flex-col items-center space-y-5">
              {/* Refined Master Logo with rotating technology ring */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Rotating Outer Tech Ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#58E38A]/20 pointer-events-none"
                />
                
                {/* Secondary static outer boundaries */}
                <div className="absolute -inset-2 rounded-2xl border border-white/[0.01] pointer-events-none" />
                <div className="absolute -inset-2 rounded-2xl border-t border-b border-[#58E38A]/5 pointer-events-none" />

                {/* Main Logo Card */}
                <motion.div 
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="w-24 h-24 flex items-center justify-center drop-shadow-[0_0_35px_rgba(88,227,138,0.18)] bg-black/40 border border-white/[0.05] p-4.5 rounded-[2rem]"
                >
                  <AANShieldLogo className="w-full h-full" strokeWidth={4.5} />
                </motion.div>
              </div>

              {/* Master Text logo */}
              <div className="space-y-1.5">
                <h1 className="text-5xl font-black tracking-[0.25em] text-white font-sans uppercase pl-4 leading-none">
                  AAN
                </h1>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em] font-medium">
                  TRUST INFRASTRUCTURE
                </p>
              </div>
            </div>

            {/* Poetic Tagline & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-sans">
                Real-time trust decisions for modern applications<span className="text-[#58E38A]">.</span>
              </h2>
              <p className="text-[11.5px] sm:text-[12px] text-slate-400 font-normal leading-relaxed max-w-xs mx-auto">
                AAN integrates seamlessly alongside your authentication stack, evaluating behavioral anomalies and network signatures instantly.
              </p>
            </div>

            {/* Interactive Dynamic Actions */}
            <div className="w-full space-y-3.5 pt-2">
              <AnimatePresence mode="wait">
                {isConnecting ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full bg-black/40 border border-[#58E38A]/20 rounded-2xl p-5 text-left space-y-3 shadow-inner"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-[#58E38A] font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Security Handshake Active</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[9px] text-slate-500 leading-relaxed border-t border-white/[0.03] pt-3">
                      {connectionLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#58E38A]/60 shrink-0">▸</span>
                          <span className={idx === connectionLogs.length - 1 ? "text-slate-300 font-bold" : "text-slate-600"}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full space-y-3"
                  >
                    {/* Action 1: Continue with AAN */}
                    <button 
                      onClick={handleContinue}
                      className="w-full py-4 px-6 rounded-2xl bg-[#58E38A] hover:bg-[#4ae07e] text-black font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_30px_rgba(88,227,138,0.22)] hover:shadow-[0_4px_40px_rgba(88,227,138,0.38)] active:scale-[0.98] border border-[#58E38A]/20 font-sans tracking-wide"
                    >
                      <Shield className="w-4 h-4 mr-2 shrink-0 stroke-[2.5]" />
                      <span>Continue with AAN</span>
                    </button>

                    {/* Action 2: I'm new to AAN */}
                    <button 
                      onClick={() => setShowSignup(true)}
                      className="w-full py-4 px-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center transition-all cursor-pointer border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.98] font-sans"
                    >
                      <Key className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                      <span>I'm new to AAN</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Micro-Badges Row */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-center space-y-1">
                <Shield className="w-3.5 h-3.5 text-[#58E38A]/70" />
                <span className="text-[9px] font-mono tracking-wider font-semibold text-slate-500 uppercase">Secure</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-center space-y-1">
                <Fingerprint className="w-3.5 h-3.5 text-[#58E38A]/70" />
                <span className="text-[9px] font-mono tracking-wider font-semibold text-slate-500 uppercase">Private</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-center space-y-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#58E38A]/70" />
                <span className="text-[9px] font-mono tracking-wider font-semibold text-slate-500 uppercase">Verified</span>
              </div>
            </div>
          </>
        ) : (
          <AANSignupForm 
            onBack={() => setShowSignup(false)} 
            onSuccess={(email) => onStartDemoSession(email)}
          />
        )}

      </motion.div>

      {/* Refined Zero-Knowledge Privacy Card */}
      <div className="w-full max-w-sm z-10 pt-4 px-1">
        <div className="w-full bg-white/[0.01] border border-white/[0.04] hover:border-[#58E38A]/10 transition-colors rounded-2xl p-4 flex items-start gap-3.5 text-left shadow-2xl">
          <div className="p-2 bg-[#58E38A]/10 rounded-xl border border-[#58E38A]/20 text-[#58E38A] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-mono text-white font-bold uppercase tracking-wider">Zero-Knowledge Trust Assured</h4>
            <p className="text-[9.5px] text-slate-500 leading-relaxed font-light">
              AAN leverages client-side cryptographic telemetry. We never store, process, or view your cleartext identities or raw biometrics.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Utility Dock */}
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[9px] font-mono text-slate-600 hover:text-slate-400 transition-colors z-20 pt-10">
        <button onClick={() => onNavigate('privacy')} className="hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none">Privacy Policy</button>
        <span className="text-slate-800">•</span>
        <button onClick={() => onNavigate('terms')} className="hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none">Terms of Service</button>
        <span className="text-slate-800">•</span>
        <button onClick={() => onNavigate('contact')} className="hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none">Contact Integration</button>
      </div>

    </div>
  );
}
