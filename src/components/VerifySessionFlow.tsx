import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Check, 
  X, 
  Globe, 
  Loader2, 
  Camera, 
  ChevronRight, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface VerifySessionFlowProps {
  sessionId?: string;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

export default function VerifySessionFlow({ sessionId: initialSessionId, onComplete, onNavigate }: VerifySessionFlowProps) {
  const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
  // Flow states: 'auth' -> 'camera_check' -> 'processing' -> 'success'
  const [step, setStep] = useState<'auth' | 'camera_check' | 'processing' | 'success'>('auth');
  
  // Camera simulation state
  const [cameraPermission, setCameraPermission] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Processing page timing states
  const [processingIndex, setProcessingIndex] = useState<number>(0);
  const processingTexts = ["Analyzing...", "Verifying...", "Generating proof...", "Complete."];

  useEffect(() => {
    if (!sessionId) {
      setSessionId(`vss_${Math.random().toString(36).substring(2, 11)}`);
    }
  }, [sessionId]);

  // Handle local camera stream simulation
  useEffect(() => {
    if (step === 'camera_check' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera hardware access denied or not present; falling back to high-fidelity canvas simulation.", err);
          setCameraPermission(false);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  // Handle Processing steps automatically
  useEffect(() => {
    if (step === 'processing') {
      setProcessingIndex(0);
      const timer1 = setTimeout(() => setProcessingIndex(1), 800);
      const timer2 = setTimeout(() => setProcessingIndex(2), 1600);
      const timer3 = setTimeout(() => setProcessingIndex(3), 2400);
      const timer4 = setTimeout(() => setStep('success'), 3200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [step]);

  const platform = {
    name: "Sovereign Digital Platform",
    domain: "sovereigndigital.com",
    logoLetter: "S"
  };

  const steps = [
    { id: 'auth', label: 'Consent', desc: 'Secure Handshake' },
    { id: 'camera_check', label: 'Attestation', desc: 'Humanness Proof' },
    { id: 'processing', label: 'Computation', desc: 'Generating Proof' },
    { id: 'success', label: 'Completed', desc: 'Proof Signed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#050507] text-[#8c919d] font-sans selection:bg-emerald-500/10 selection:text-white flex flex-col justify-between py-12 px-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.015)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Header & Animated Progress Indicator */}
      <div className="max-w-sm mx-auto w-full relative z-20 mb-6 mt-1 px-1">
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-[8px] font-mono tracking-widest text-[#00E676] uppercase font-bold">
              AAN SECURE HANDSHAKE
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 font-semibold bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded-md">
            {Math.round(progressPercent)}% COMPLETE
          </span>
        </div>

        {/* Outer track bar */}
        <div className="relative h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.01]">
          {/* Glowing background bar */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
          />
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-4 gap-1 mt-2.5">
          {steps.map((s, idx) => {
            const isActive = s.id === step;
            const isCompleted = currentStepIndex > idx;
            return (
              <div key={s.id} className="text-center space-y-0.5">
                <span className={`block text-[9px] font-mono font-bold tracking-wider transition-colors duration-300 ${isActive ? 'text-[#00E676]' : isCompleted ? 'text-emerald-400/70' : 'text-slate-600'}`}>
                  {s.label}
                </span>
                <span className={`hidden sm:block text-[8px] font-sans font-medium transition-colors duration-300 leading-none ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full relative z-10 my-auto py-4">
        
        <AnimatePresence mode="wait">

          {/* STEP 1: AUTHENTICATION PAGE */}
          {step === 'auth' && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full space-y-6 text-center"
            >
              {/* Header */}
              <div className="space-y-1">
                <h1 id="verify-with-aan-title" className="text-xl font-normal text-white tracking-tight">
                  Verify with AAN
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Continue securely with {platform.name}
                </p>
              </div>

              {/* Platform Card */}
              <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/[0.06] flex items-center justify-center text-white font-bold text-xs">
                    {platform.logoLetter}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white tracking-tight">
                      {platform.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-wide flex items-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5 text-slate-600" />
                      {platform.domain}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12] text-[9px] font-mono font-medium text-emerald-400">
                  <Lock className="w-2.5 h-2.5" />
                  ENCRYPTED
                </div>
              </div>

              {/* Shared and Not Shared Lists */}
              <div className="bg-[#0b0c10]/40 border border-white/[0.03] rounded-2xl p-4 space-y-4 text-left">
                
                {/* Requested */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Requested Authorization
                  </span>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 text-xs font-bold font-mono">✓</span>
                      <span>Verify you are a real human</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 text-xs font-bold font-mono">✓</span>
                      <span>Check if you are a returning verified user</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 text-xs font-bold font-mono">✓</span>
                      <span>Evaluate trust for this login session</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-emerald-400 text-xs font-bold font-mono">✓</span>
                      <span>Issue a signed trust proof</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-white/[0.04]" />

                {/* What will NOT be shared */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Never Exposed
                  </span>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="text-rose-400/80 text-xs font-bold font-mono">✕</span>
                      <span>No government ID</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="text-rose-400/80 text-xs font-bold font-mono">✕</span>
                      <span>No biometric images</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="text-rose-400/80 text-xs font-bold font-mono">✕</span>
                      <span>No personal identity documents</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="text-rose-400/80 text-xs font-bold font-mono">✕</span>
                      <span>No unnecessary personal information</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Session Summary */}
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-left border-t border-white/[0.03] pt-4">
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 block font-bold">Purpose</span>
                  <span className="text-[10px] text-slate-300 font-sans">Authentication</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 block font-bold">Data Shared</span>
                  <span className="text-[10px] text-slate-300 font-sans">Minimum Required</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 block font-bold">Trust Proof</span>
                  <span className="text-[10px] text-slate-300 font-sans">Single Session</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 block font-bold">Credential</span>
                  <span className="text-[10px] text-slate-300 font-sans">Verified by AAN</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setStep('camera_check')}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: VERIFICATION PAGE (CAMERA CHECK) */}
          {step === 'camera_check' && (
            <motion.div 
              key="camera_check"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6 text-center"
            >
              {/* Step info & Progress */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Step 2 of 3
                </span>
                <h2 className="text-base font-normal text-white tracking-tight">
                  Verify Humanness
                </h2>
                <p className="text-xs text-slate-500">
                  Hold your device steady and look directly at the screen.
                </p>
              </div>

              {/* Camera Frame Viewport */}
              <div className="relative aspect-square w-full rounded-3xl bg-[#090a0e] border border-white/[0.04] overflow-hidden flex items-center justify-center shadow-inner">
                {cameraPermission ? (
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  // Elegant Animated Mock Face Outline
                  <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient">
                    <svg className="w-32 h-32 text-slate-700 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}

                {/* Animated Face-scanning reticle lines */}
                <div className="absolute inset-x-6 top-1/4 bottom-1/4 border border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                </div>

                {/* Tech scanline bar */}
                <div className="absolute inset-x-0 w-full h-0.5 bg-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-[bounce_3s_infinite]" />

                {/* Little overlay indicating security is active */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-wide font-bold">
                  <Camera className="w-3 h-3 animate-pulse" />
                  Live Video Attestation
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs text-slate-500 italic max-w-xs mx-auto">
                No image data is stored. Handshake signatures are computed instantly and fully purged from RAM.
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={() => setStep('processing')}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Continue Verification</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING PAGE */}
          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.15 }}
              className="w-full py-12 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-white/[0.03]" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Signing Proof
                </h3>
                <p className="text-xs font-mono text-slate-500 tracking-wider">
                  {processingTexts[processingIndex]}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS PAGE */}
          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full space-y-6 text-center"
            >
              {/* Success Checkmark Circle */}
              <div className="flex justify-center py-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12]" />
                  <div className="w-10 h-10 rounded-full bg-emerald-500/[0.1] flex items-center justify-center text-emerald-400">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-normal text-white tracking-tight">
                  Identity Verified Securely
                </h2>
                <p className="text-xs text-slate-500">
                  Your single-session trust proof has been signed.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onComplete}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                >
                  <span>Return to Platform</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Very small footer */}
      <div className="text-center mt-8 space-y-2 relative z-10">
        <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase flex items-center justify-center gap-1.5">
          <span>Verified by AAN</span>
          <span className="text-slate-800">•</span>
          <span>Privacy by Design</span>
          <span className="text-slate-800">•</span>
          <span>Trust Infrastructure</span>
        </div>
      </div>

    </div>
  );
}
