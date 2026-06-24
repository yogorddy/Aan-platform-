import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Fingerprint, 
  Activity, 
  Code, 
  Lock, 
  CheckCircle, 
  Database, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight, 
  Server, 
  Terminal, 
  FileCode, 
  Check, 
  Cpu, 
  RefreshCw, 
  Layers, 
  BookOpen, 
  Info, 
  ExternalLink, 
  Key, 
  Sliders, 
  HeartHandshake 
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

const INTEGRATION_CODE_EXAMPLES: Record<string, { desc: string; filename: string; code: string; lang: string }> = {
  curl: {
    lang: "Bash",
    desc: "Initiate an invisible verification session token directly via server-to-server POST endpoint.",
    filename: "initiate_session.sh",
    code: `curl -X POST https://api.aan.com/v1/verification-sessions \\
  -H "Authorization: Bearer aan_key_live_d8134fa" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_user_id": "customer_9941a",
    "verification_level": "human_unique",
    "supported_metrics": ["liveness", "hardware_signature"]
  }'`
  },
  typescript: {
    lang: "TypeScript",
    desc: "Secure full-type configuration implementing returning users hardware key validations.",
    filename: "verify_session.ts",
    code: `import { AANClient } from '@aan/sdk-node';

const aan = new AANClient({
  apiKey: process.env.AAN_API_KEY,
  environment: 'production'
});

async function verifyAccess(userId: string): Promise<boolean> {
  const session = await aan.sessions.create({
    externalUserId: userId,
    configuration: { requireLiveness: true }
  });
  
  // Return the secure, non-reusable redirect channel URL
  return session.verificationUrl;
}`
  },
  python: {
    lang: "Python",
    desc: "Lightweight integration compatible with modern Python web backends like FastAPI.",
    filename: "aan_integration.py",
    code: `import requests

def get_trust_grant_url(user_id: str):
    response = requests.post(
        "https://api.aan.com/v1/verification-sessions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "external_user_id": user_id, 
            "policy": "uniqueness_enforced"
        }
    )
    return response.json().get("verification_url")`
  }
};

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [activeLang, setActiveLang] = useState<string>('curl');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedTrustMark, setSelectedTrustMark] = useState<string>('verified');
  const [trustMarkStyle, setTrustMarkStyle] = useState<'minimal' | 'bordered' | 'badge'>('bordered');
  
  const trustMarkText: Record<string, string> = {
    verified: 'Verified by AAN',
    secured: 'Secured by AAN',
    humanness: 'Human Verification by AAN',
    powered: 'Trust Powered by AAN'
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 font-sans selection:bg-slate-800 selection:text-white pb-20">
      
      {/* Infrastructure Top Banner (Operational Status Alert Only) */}
      <div className="z-20 bg-slate-900 border-b border-slate-800 text-center py-2 px-4 font-mono text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>AAN Infrastructure State:</span>
          <span className="text-white font-semibold">Decentralized Trust Protocol Online</span>
          <span className="text-slate-600">|</span>
          <span>API Latency:</span>
          <span className="text-emerald-400 font-semibold">14ms Average</span>
        </div>
      </div>

      {/* Main Structural Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 border-b border-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-slate-400" />
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase leading-none block">System Layer</span>
            <span className="font-sans font-bold text-sm text-slate-200">AAN Protocol</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
          <button 
            onClick={() => onNavigate('partner')} 
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Partner Engine
          </button>
          <button 
            onClick={() => onNavigate('admin')} 
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Compliance Admin
          </button>
        </div>
      </nav>

      {/* MVP Mock Disclaimer Banner */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4 text-xs text-amber-200/90 leading-relaxed font-sans flex gap-3">
          <span className="text-amber-500 font-bold shrink-0 text-sm">⚠️ MVP Sandbox Notice:</span>
          <div>
            <p className="font-semibold mb-0.5">MOCK IMPLEMENTATION — Replace with certified identity, biometric, fraud, and security providers before production use.</p>
            <p className="text-amber-400/80">
              AAN Platform is in simulated MVP mode. No raw selfies are permanently saved, and legal compliance or unbreakable security is not claimed. Connect production databases and official verification partners before live deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-850 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span>Human Verification Infrastructure</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Privacy-Preserving Proof of Human Access.
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          AAN is a quiet, zero-exposure verification and trust layer that partner platforms deploy at <b>login, signup, account recovery, and suspicious activity checkpoints</b>. We securely reduce bots, duplicate accounts, and coordinated abuse without centralized biometric storage.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => onNavigate('partner')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-white text-slate-950 px-5 py-2 rounded text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Launch Developer Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onStartDemoSession}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-5 py-2 rounded text-xs font-mono tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Simulate Verification Flow</span>
          </button>
        </div>
      </header>

      {/* Embedded Brand Presence Widget (Subtle Trust Marks) */}
      <section className="max-w-4xl mx-auto px-6 py-6 my-4">
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-8 space-y-6">
          <div className="text-center md:text-left space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#5c6e83] uppercase block font-semibold">Embedded Brand Presence</span>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">AAN Standard Trust Marks</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Platforms embed this subtle mark within checkout rails or signup portals. It certifies cryptographic liveness checks other websites can verify without tracking user records over the wire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-4 space-y-4 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block mb-1.5">1. Select Labeling Content</span>
                <div className="flex flex-col gap-1.5">
                  {Object.keys(trustMarkText).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTrustMark(key)}
                      className={`text-left px-3 py-1.5 rounded transition ${
                        selectedTrustMark === key 
                          ? 'bg-slate-900 text-white font-bold border border-slate-800' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
                      }`}
                    >
                      {trustMarkText[key]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col justify-between border border-slate-900 bg-[#0c0f16] p-6 rounded-lg">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4 block">Rendered Preview</span>
              
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="flex items-center gap-2 select-none">
                  {/* Subtle Vector Symbol */}
                  <div className="w-5 h-5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center text-slate-300 font-sans text-[11px] font-bold">
                    A
                  </div>
                  <span className="text-xs font-sans font-medium text-slate-300 tracking-tight">
                    {trustMarkText[selectedTrustMark]}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                <span>Understated, confidence-inspiring trust signal</span>
                <code className="bg-slate-950 px-2 py-1 rounded text-emerald-400 text-[9px] border border-slate-900">
                  &lt;AANTrustMark variant="{selectedTrustMark}" /&gt;
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY / TRIPLE AUDIENCES */}
      <section className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="space-y-3 p-4 border-t border-slate-900">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">PLATFORM AUDIENCE 01</span>
          <h2 className="text-xs text-white uppercase font-bold tracking-wider">Partner Organizations</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Configure integration policies dynamically. Monitor overall human-uniqueness signals, query webhook deliveries, and analyze institutional metrics inside the console. This is an operational portal, not a marketing site.
          </p>
        </div>

        <div className="space-y-3 p-4 border-t border-slate-900">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">PLATFORM AUDIENCE 02</span>
          <h2 className="text-xs text-white uppercase font-bold tracking-wider">Developers</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Implement lightweight client SDK bindings, inspect generated signatures, audit webhook log delivery streams, and register rotating API keys with zero larping or complexity.
          </p>
        </div>

        <div className="space-y-3 p-4 border-t border-slate-900">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">PLATFORM AUDIENCE 03</span>
          <h2 className="text-xs text-white uppercase font-bold tracking-wider">Security & Compliance</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Validate system cryptographic audit rails. Monitor real-time intrusion and token replay alarms. Analyze device reputation signals and duplicate templates anomalies lists.
          </p>
        </div>

      </section>

      {/* WHAT, WHY, HOW FRAMEWORK SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="border-t border-slate-900/60 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">FOUNDATIONAL MODEL</span>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mt-1">What AAN Is</h3>
          </div>
          <div className="md:col-span-8 text-xs text-slate-400 space-y-4 font-sans leading-relaxed">
            <p>
              AAN is an underlying protocols standard, not a traditional destination website. It resides silently beneath the platform authentication layer, acting as a one-click validation gate.
            </p>
            <p>
              Instead of requesting high-privilege credentials like Social Security Numbers or permanent Government ID uploads, AAN analyzes temporary, local hardware parameters, device signatures, and mathematical geometric liveness signals.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900/60 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">MISSION SPECIFICATION</span>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mt-1">Why AAN Exists</h3>
          </div>
          <div className="md:col-span-8 text-xs text-slate-400 space-y-4 font-sans leading-relaxed">
            <p>
              With the explosion of automated, cost-less AI bots and complex Sybil coordinate networks, digital platforms can no longer differentiate genuine human actors from artificial automated instances. Traditional CAPTCHAs are trivial to bypass, and centralized biometric repositories represent structural targets for state-level adversaries.
            </p>
            <p>
              AAN exists to solve this dilemma by providing a robust, decentralized, non-custodial assurance metric: establishing whether an operator is a unique, live human, without knowing who that human is.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900/60 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">OPERATIONAL PIPELINE</span>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mt-1">THE INVISIBLE INTEGRATION</h3>
          </div>
          <div className="md:col-span-8">
            <div className="relative border-l border-slate-800 pl-6 space-y-8 text-xs">
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-2 h-2 rounded-full bg-slate-400" />
                <h4 className="font-mono text-white uppercase font-bold text-[11px] mb-1">01. Request Hook</h4>
                <p className="text-slate-400 font-sans max-w-lg leading-relaxed">
                  A user attempts to sign in or perform a sensitive operation on the partner's platform. The partner backend requests a secure, single-use token of validation from AAN.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-2 h-2 rounded-full bg-slate-400" />
                <h4 className="font-mono text-white uppercase font-bold text-[11px] mb-1">02. Ephemeral Verification</h4>
                <p className="text-slate-400 font-sans max-w-lg leading-relaxed">
                  AAN runs a background liveness check inside the client browser. No raw images are sent over the network; the evaluation is compressed into a temporary geometric facial footprint representation.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-2 h-2 rounded-full bg-slate-400" />
                <h4 className="font-mono text-white uppercase font-bold text-[11px] mb-1">03. Cryptographic Resolution</h4>
                <p className="text-slate-400 font-sans max-w-lg leading-relaxed">
                  AAN returns a signed cryptographic trust decision token to the partner server. No data is cached; the local biometric coordinates are scrubbed, and the user continues on the partner platform seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900/60 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">SECURITY ASSURANCE</span>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mt-1">How Privacy is Preserved</h3>
          </div>
          <div className="md:col-span-8 text-xs text-slate-400 space-y-4 font-sans leading-relaxed">
            <p>
              We believe biometric data should never be centralized or correlated. AAN does not store name logs, government documents, raw selfies, or physical coordinate maps. 
            </p>
            <p>
              Our verification pipeline computes an encrypted mathematical vector representing facial topology hashes. This vector is computed server-side, checked anonymously against the system, and discarded. Partner platforms receive only a binary resolution status and signed token—keeping user identity completely anonymous.
            </p>
          </div>
        </div>
      </section>

      {/* Developer API Code Sandbox */}
      <section className="max-w-4xl mx-auto px-6 py-6 border-t border-slate-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block font-semibold">Developers</span>
            <h3 className="text-lg font-sans font-semibold text-white tracking-tight leading-snug">
              Quiet REST Integration API
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Interact with the decentralized trust matrix with less than ten lines of clean server-side code. Generate secure credentials, register webhooks, and process JSON-friendly payloads over secure channels.
            </p>
            
            <div className="flex gap-2 flex-wrap pt-2">
              {Object.keys(INTEGRATION_CODE_EXAMPLES).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveLang(key)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition border cursor-pointer ${
                    activeLang === key 
                      ? 'bg-slate-900 text-white border-slate-800' 
                      : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/30'
                  }`}
                >
                  {INTEGRATION_CODE_EXAMPLES[key].lang}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0c0f16] border border-slate-900 rounded-lg overflow-hidden flex flex-col h-80 justify-between">
            <div className="p-4 border-b border-slate-900/60 bg-slate-950 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                {INTEGRATION_CODE_EXAMPLES[activeLang].filename}
              </span>
              <button 
                onClick={() => copyCode(INTEGRATION_CODE_EXAMPLES[activeLang].code)}
                className="text-slate-500 hover:text-white hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : "Copy Code"}
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-auto bg-[#0a0d13] text-slate-300 font-mono text-[10.5px] leading-relaxed whitespace-pre">
              {INTEGRATION_CODE_EXAMPLES[activeLang].code}
            </div>

            <div className="p-3 bg-slate-950/70 border-t border-slate-900 border-none px-4 text-[10px] text-slate-500 font-sans italic">
              {INTEGRATION_CODE_EXAMPLES[activeLang].desc}
            </div>
          </div>
        </div>
      </section>

      {/* Constraints Acknowledgement */}
      <section className="max-w-4xl mx-auto px-6 py-6 border-t border-slate-900/60 pt-12 space-y-4">
        <h4 className="font-mono text-xs text-white uppercase font-bold tracking-wider">Limitations & Compliance Boundaries</h4>
        <div className="p-4 rounded border border-slate-900 bg-slate-950/40 text-[11px] text-slate-400 space-y-2.5 font-sans leading-relaxed">
          <p>
            <b>1. Perfect Security Statement:</b> No electronic validation standard can promise absolute immunity to coordinate human spoofing or synthetic physical replay loops. AAN operates as a high-density defense mitigation barrier that eliminates automated digital actors in subseconds.
          </p>
          <p>
            <b>2. Regulatory Compliance:</b> This software represents the MVP sandbox preview. Prior to deployment in high-regulatory environments (such as HIPAA healthcare networks or Swiss FINMA financial operations), organizations should consult internal compliance offices regarding state security frameworks.
          </p>
          <p>
            <b>3. Sandbox Restrictions:</b> All facial geometries checked in this sandbox are simulated matching tests. The platform maintains no permanent, physical face database records, preserving ultimate user anonymity.
          </p>
        </div>
      </section>

      {/* Corporate Footprint Info */}
      <footer className="max-w-4xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center text-slate-500 text-[10.5px] font-mono leading-relaxed space-y-2">
        <p>&copy; 2026 AAN Protocol Laboratory. Internet-wide trust coordination and identity decoupling infrastructure. All rights reserved.</p>
        <p className="text-[9.5px] text-slate-600">Represented in active staging environments as standard MVP Trust Architecture. Fully client-contained cryptographic checks.</p>
      </footer>

    </div>
  );
}
