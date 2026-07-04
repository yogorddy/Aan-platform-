import React from 'react';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050507] text-[#8c919d] font-sans selection:bg-emerald-500/10 selection:text-white flex flex-col justify-between py-12 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">AAN</span>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center space-y-8 z-10 py-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12] text-[10px] font-mono text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>DECENTRALIZED TRUST HANDSHAKE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.1] max-w-2xl font-sans">
            The invisible trust layer of the internet.
          </h1>

          <p className="text-sm sm:text-base text-[#646e7a] max-w-xl mx-auto leading-relaxed font-light">
            AAN is a quiet, enterprise-grade trust engine that verifies real human users and detects multi-accounting instantly — in volatile memory, without storing biometric, personal, or private identity data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <button 
            onClick={onStartDemoSession}
            className="w-full sm:w-auto bg-white hover:bg-slate-150 text-slate-950 text-xs font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-[0.99]"
          >
            <span>Verify with AAN</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full border-t border-white/[0.03] pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#404652] gap-4 z-10">
        <span>© 2026 AAN Trust Infrastructure.</span>
        <div className="flex gap-6">
          <button onClick={() => onNavigate('privacy', '/privacy')} className="hover:text-[#646e7a] cursor-pointer">Privacy</button>
          <button onClick={() => onNavigate('terms', '/terms')} className="hover:text-[#646e7a] cursor-pointer">Terms</button>
        </div>
      </footer>

    </div>
  );
}
