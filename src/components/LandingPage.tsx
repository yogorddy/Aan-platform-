import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  Code, 
  Cpu, 
  ArrowRight, 
  Terminal, 
  FileCode, 
  Check, 
  Layers, 
  RefreshCw, 
  Globe, 
  Clock, 
  Server, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

const INTEGRATION_CODE_EXAMPLES: Record<string, { desc: string; filename: string; code: string; lang: string }> = {
  curl: {
    lang: "cURL",
    desc: "Initiate an anonymous verification session via secure server-to-server TLS request.",
    filename: "initiate_session.sh",
    code: `curl -X POST https://api.aan.com/v1/verification-sessions \\
  -H "Authorization: Bearer aan_key_live_d8134fa" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_user_id": "usr_9941a_customer",
    "verification_policy": "strict_uniqueness",
    "required_attestations": ["system_integrity", "hardware_signature"]
  }'`
  },
  typescript: {
    lang: "TypeScript",
    desc: "Register verification sessions and retrieve cryptographic proof handshakes.",
    filename: "verify_session.ts",
    code: `import { AANProtocol } from '@aan-protocol/node-sdk';

const aan = new AANProtocol({
  apiKey: process.env.AAN_API_KEY,
  environment: 'production'
});

async function requestTrustHandshake(userId: string): Promise<string> {
  const session = await aan.sessions.create({
    externalUserId: userId,
    requirePosturalAttestation: true,
    policy: 'unique_human_returning'
  });
  
  // Returns single-use anonymous verification URL
  return session.verificationUrl;
}`
  },
  python: {
    lang: "Python",
    desc: "Query verification proofs server-side to authorize critical action checkpoints.",
    filename: "verify_proof.py",
    code: `import requests

def verify_token_resolution(session_id: str, proof_token: str):
    response = requests.post(
        "https://api.aan.com/v1/proofs/verify",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "session_id": session_id,
            "proof_token": proof_token
        }
    )
    # Returns verification status, risk scores, and signed proof tokens
    return response.json()`
  }
};

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [activeLang, setActiveLang] = useState<string>('curl');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Interactive Live Visualization States
  const [activeTransactions, setActiveTransactions] = useState<Array<{
    id: string;
    org: string;
    action: string;
    status: 'passed' | 'rejected';
    timestamp: string;
    latency: string;
  }>>([
    { id: 'tx-881a', org: 'Cloudflare', action: 'Bot Check Passed', status: 'passed', timestamp: '12:47:58', latency: '12ms' },
    { id: 'tx-881b', org: 'Stripe API', action: 'Sybil Defense Mitigated', status: 'passed', timestamp: '12:47:56', latency: '15ms' },
    { id: 'tx-881c', org: 'Sovereign Bank', action: 'Account Hijack Rejected', status: 'rejected', timestamp: '12:47:55', latency: '18ms' },
    { id: 'tx-881d', org: 'NHS Portal', action: 'Unique Human Attested', status: 'passed', timestamp: '12:47:52', latency: '11ms' },
  ]);

  useEffect(() => {
    const orgs = ['Vercel', 'Linear Corp', 'BofA Enterprise', 'HealthLink', 'GitHub Engine', 'Supabase Cloud'];
    const actions = ['Session Integrity Handshake', 'Returning Signature Match', 'Hardware Integrity Checked', 'Duplicate Signature Rejected'];
    
    const interval = setInterval(() => {
      const isPass = Math.random() > 0.18;
      const newTx = {
        id: `tx-${Math.random().toString(36).substring(2, 6)}`,
        org: orgs[Math.floor(Math.random() * orgs.length)],
        action: isPass ? actions[Math.floor(Math.random() * 3)] : actions[3],
        status: (isPass ? 'passed' : 'rejected') as 'passed' | 'rejected',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        latency: `${Math.floor(Math.random() * 10) + 10}ms`
      };
      setActiveTransactions(prev => [newTx, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e5eb] font-sans selection:bg-[#202533] selection:text-white pb-24">
      
      {/* Infrastructure Top Status Bar */}
      <div className="bg-[#111319] border-b border-[#1b1e28] py-2.5 px-6 font-mono text-[11px] text-[#78819a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AAN GLOBAL NETWORK: ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Uptime: <span className="text-[#a5b0cb] font-semibold">99.9997%</span></span>
            <span>API Response Latency: <span className="text-emerald-400 font-semibold">14ms AVG</span></span>
            <span>Ledger Nodes Online: <span className="text-[#a5b0cb] font-semibold">124/124</span></span>
          </div>
        </div>
      </div>

      {/* Main Structural Navigation bar */}
      <nav className="border-b border-[#1b1e28] bg-[#0d0e12]">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#141822] border border-[#232a3b] p-1.5 rounded">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-[#5d6780] uppercase leading-none block font-black">Trust Layer Standard</span>
              <span className="font-bold text-sm tracking-tight text-white">Anonymous Authentication Network</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-xs font-mono">
            <button 
              onClick={() => onNavigate('partner')} 
              className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
            >
              Control Plane
            </button>
            <button 
              onClick={() => onNavigate('admin')} 
              className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
            >
              Compliance Ledger
            </button>
            <button 
              onClick={() => onNavigate('brand')} 
              className="text-[#a5b0cb] hover:text-white transition-colors cursor-pointer"
            >
              System Spec
            </button>
          </div>
        </div>
      </nav>

      {/* MVP Sandbox Advisory */}
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="bg-[#14151b] border border-amber-900/30 rounded-lg p-4 text-xs text-[#d2ab6c] leading-relaxed font-sans flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#d2ab6c] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">MOCK INTEGRATION PREVIEW — Administrative Sandbox Mode</p>
            <p className="text-[#7f889c]">
              This portal demonstrates the complete architectural flow of the Anonymous Authentication Network. All cryptographic signature checks and liveness audits are processed inside the local sandbox environment. In production, connect real hardware, device reputation, and enterprise storage vaults.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-20 pb-16 text-left space-y-8 border-b border-[#1b1e28]">
        <div className="space-y-4 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 bg-[#141822] border border-[#232a3b] px-3 py-1 rounded text-[10px] font-mono text-blue-400 font-semibold tracking-wider uppercase">
            Protocol Specification v4.12
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white font-sans leading-[1.1]">
            Anonymous Authentication Network<br />
            <span className="text-[#78819a]">Internet Trust Infrastructure.</span>
          </h1>
          
          {/* Confident core tagline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 pb-2 border-y border-[#1b1e28]/60 max-w-3xl">
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">IDENTITY MODEL</span>
              <span className="text-white text-base font-semibold mt-1 block">One Human.</span>
            </div>
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">ATTESTATION METHOD</span>
              <span className="text-white text-base font-semibold mt-1 block">One Anonymous Proof.</span>
            </div>
            <div className="p-1">
              <span className="font-mono text-[10px] text-[#5d6780] block uppercase tracking-wider font-bold">DATA EXPOSURE LIMIT</span>
              <span className="text-white text-base font-semibold mt-1 block">Zero Identity Shared.</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#78819a] max-w-2xl leading-relaxed">
            AAN is low-friction, zero-exposure verification infrastructure deployed by platforms to check whether access attempts are backed by real, unique, and legitimate human actors without permanently collecting or storing raw personal data.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => onNavigate('partner')}
            className="w-full sm:w-auto bg-white hover:bg-[#e2e5eb] text-[#0d0e12] px-6 py-3 rounded font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Developer Plane</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={onStartDemoSession}
            className="w-full sm:w-auto bg-[#141822] hover:bg-[#1b202e] text-[#a5b0cb] border border-[#232a3b] px-6 py-3 rounded font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Run Interactive Trust Check</span>
          </button>
        </div>
      </header>

      {/* Trust Network Visualization Grid */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-[#1b1e28]">
        
        {/* Left Side: SVG Live Trust Visualization representation */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Live Telemetry Simulation</span>
            <h2 className="text-xl font-semibold text-white tracking-tight">Active Trust Handshakes</h2>
            <p className="text-xs text-[#78819a] leading-relaxed max-w-lg">
              Below is a real-time logical visualization of anonymous posture verifications traveling from clients across decentralized gateways. Cryptographic proofs are issued instantaneously upon hardware attestations.
            </p>
          </div>

          {/* Graphical Map block representing active network nodes */}
          <div className="relative mt-8 bg-[#111319] border border-[#1b1e28] rounded-xl p-6 h-80 overflow-hidden flex flex-col justify-between">
            
            {/* Visual network matrix nodes */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2f364a 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
            
            {/* Animated connections */}
            <div className="relative z-10 flex-1 flex items-center justify-between px-6">
              
              {/* Origin Client Nodes Group */}
              <div className="flex flex-col gap-12 text-center">
                <div className="relative bg-[#171a23] border border-[#2b3143] p-2.5 rounded-lg text-xs font-mono max-w-[120px]">
                  <div className="absolute -right-3 top-1/2 w-3 h-px bg-blue-500 animate-pulse" />
                  <span className="text-white block font-semibold">User Edge</span>
                  <span className="text-[9px] text-[#5d6780]">Attestation Hook</span>
                </div>
                <div className="relative bg-[#171a23] border border-[#2b3143] p-2.5 rounded-lg text-xs font-mono max-w-[120px]">
                  <div className="absolute -right-3 top-1/2 w-3 h-px bg-blue-500 animate-pulse" />
                  <span className="text-white block font-semibold">API Gateway</span>
                  <span className="text-[9px] text-[#5d6780]">TLS Endpoint</span>
                </div>
              </div>

              {/* Dynamic Connecting Lines SVG Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Route 1 */}
                  <path d="M 120 80 Q 240 60 360 140" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
                  {/* Route 2 */}
                  <path d="M 120 190 Q 240 210 360 140" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="5,5" />
                  {/* Route 3 */}
                  <path d="M 360 140 H 520" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                </svg>
              </div>

              {/* Core Verification Processing Node */}
              <div className="relative bg-[#171a23] border border-blue-600/50 p-4 rounded-xl text-center z-10 max-w-[140px] shadow-lg shadow-blue-950/20">
                <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-900">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-white block text-xs font-mono font-bold">AAN Trust Engine</span>
                <span className="text-[8px] text-emerald-400 font-mono">POSTURE COMPARATOR</span>
              </div>

              {/* Authenticated Output Group */}
              <div className="flex flex-col gap-12 text-center z-10">
                <div className="relative bg-[#171a23] border border-emerald-950 p-2.5 rounded-lg text-xs font-mono max-w-[120px]">
                  <span className="text-emerald-400 block font-semibold">Proof Token</span>
                  <span className="text-[9px] text-[#5d6780]">Signed ECDSA</span>
                </div>
                <div className="relative bg-[#171a23] border border-[#2b3143] p-2.5 rounded-lg text-xs font-mono max-w-[120px]">
                  <span className="text-white block font-semibold">Webhook</span>
                  <span className="text-[9px] text-[#5d6780]">Sync Dispatch</span>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#5d6780] border-t border-[#1b1e28]/70 pt-3 mt-4">
              <span>Status: <strong className="text-emerald-400">NOMINAL</strong></span>
              <span>Cryptographic standard: ECDSA SECP256K1</span>
            </div>
          </div>
        </div>

        {/* Right Side: Log Stream of Live Transactions */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Audit Ledgers</span>
            <h3 className="text-xl font-semibold text-white tracking-tight">Active Handshake Log</h3>
            <p className="text-xs text-[#78819a] leading-relaxed">
              Continuous validation logs showing actual real-time platform posture verifications evaluated via transient attestation hashes. No persistent identity trace is stored.
            </p>
          </div>

          <div className="mt-8 bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden flex flex-col h-80 justify-between font-mono">
            <div className="bg-[#171a23] px-4 py-3 border-b border-[#1b1e28] flex items-center justify-between text-[10px] text-[#78819a]">
              <span>VERIFICATION ACTIVITY LOGS</span>
              <span className="text-blue-400">POLLING</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 divide-y divide-[#1b1e28]/50 text-[11px]">
              {activeTransactions.map((tx, idx) => (
                <div key={tx.id} className={`pt-3 first:pt-0 flex items-start justify-between gap-3 ${idx === 0 ? 'text-white' : 'text-[#78819a]'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#e3e5eb]">{tx.org}</span>
                      <span className="text-[9px] text-[#5d6780]">[{tx.id}]</span>
                    </div>
                    <span className="text-xs font-sans text-[#78819a] block">{tx.action}</span>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      tx.status === 'passed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-red-950 text-red-400 border border-red-900/40'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-[#5d6780] block">{tx.timestamp} ({tx.latency})</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#171a23] p-2.5 border-t border-[#1b1e28] text-[9px] text-[#5d6780] text-center italic">
              *All user identifiers are converted to non-reversible postural hashes prior to evaluation.
            </div>
          </div>

        </div>
      </section>

      {/* Redesigned Clean Infrastructure-Oriented Blocks Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        <div className="text-left space-y-2">
          <span className="font-mono text-[10px] tracking-widest text-blue-500 uppercase block font-black">Technical Capability Architecture</span>
          <h2 className="text-3xl font-semibold tracking-tight text-white font-sans">
            Engineered for High-Density Operational Verification
          </h2>
          <p className="text-xs md:text-sm text-[#78819a] max-w-xl">
            Read direct system capability briefs detailing AAN network pipelines, telemetry indexes, and structural models.
          </p>
        </div>

        {/* 2x4 Bento-like grid of deep system explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">01. Verification Activity</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Monitors physical travel velocities and localized network telemetry. Flags bot-like micro-behavior trends in under 12 milliseconds.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">02. Organization Network</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Interconnects institutional gateways securely. Synchronizes zero-knowledge reputation indexes across bank, government, and API partner nodes.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">03. System Health</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Features native replication networks with zero centralized single points of failure. Provides absolute protection from high-velocity DDOS floods.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">04. Privacy Architecture</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Transforms attestation variables into encrypted ephemeral posture hashes. Employs mathematically guaranteed unlinkable cryptographic signatures.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">05. Developer Integration</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Deploys instantly with structured JSON REST endpoints and type-safe SDK bundles. Standardizes custom auth handshakes into 10 lines of backend code.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">06. Security Model</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Recomputes device fingerprint anomalies, VPN/proxy tunnels, and emulator signals on every request to compute risk scores.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">07. Global Availability</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Synchronized across 24 edge latency-sensitive zones globally to provide immediate validation outputs regardless of user location.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 space-y-4">
            <div className="text-blue-500 bg-[#171a23] border border-[#232a3b] w-10 h-10 rounded flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">08. Performance Metrics</h4>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Engineered in lightweight compiled Rust. Processes over 500,000 parallel connection streams without bottlenecking databases.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Developer API Console Integration Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 border-t border-[#1b1e28] grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <span className="font-mono text-[10px] tracking-widest text-[#5d6780] uppercase block font-black">Developer Reference</span>
          <h3 className="text-2xl font-semibold tracking-tight text-white leading-snug">
            Standard REST API Gateway
          </h3>
          <p className="text-xs text-[#78819a] leading-relaxed font-sans">
            AAN infrastructure lives directly on your backend. Issue requests with standard authorization tokens and manage verification policies effortlessly using simple JSON payloads.
          </p>
          
          <div className="flex gap-2 flex-wrap pt-2">
            {Object.keys(INTEGRATION_CODE_EXAMPLES).map((key) => (
              <button
                key={key}
                onClick={() => setActiveLang(key)}
                className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition border cursor-pointer ${
                  activeLang === key 
                    ? 'bg-[#171a23] text-white border-[#2b3143]' 
                    : 'text-[#78819a] hover:text-white border-transparent hover:bg-[#111319]'
                }`}
              >
                {INTEGRATION_CODE_EXAMPLES[key].lang}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden flex flex-col h-80 justify-between">
          <div className="px-4 py-3 border-b border-[#1b1e28] bg-[#171a23] flex items-center justify-between text-[11px] font-mono text-[#78819a]">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[#5d6780]" />
              {INTEGRATION_CODE_EXAMPLES[activeLang].filename}
            </span>
            <button 
              onClick={() => copyCode(INTEGRATION_CODE_EXAMPLES[activeLang].code)}
              className="text-[#78819a] hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : "Copy Code"}
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-auto bg-[#0d0e12] text-[#c0c5d0] font-mono text-[11px] leading-relaxed whitespace-pre">
            {INTEGRATION_CODE_EXAMPLES[activeLang].code}
          </div>

          <div className="p-3 bg-[#111319] border-t border-[#1b1e28] px-4 text-[10px] text-[#5d6780] font-mono">
            {INTEGRATION_CODE_EXAMPLES[activeLang].desc}
          </div>
        </div>
      </section>

      {/* Structured Limitations and Compliance block */}
      <section className="max-w-7xl mx-auto px-8 py-12 border-t border-[#1b1e28] space-y-4">
        <h4 className="font-mono text-xs text-white uppercase font-bold tracking-wider">Technical Limitations & Sandbox Guardrails</h4>
        <div className="p-5 rounded-lg border border-[#1b1e28] bg-[#111319] text-[11px] text-[#78819a] space-y-3 font-sans leading-relaxed">
          <p>
            <strong>1. No Permanent Identity Vaults:</strong> AAN enforces the principle of zero data preservation. Our system architecture converts dynamic browser telemetry outputs into temporary, highly securely encrypted posture templates, which are fully destroyed post-handshake resolution.
          </p>
          <p>
            <strong>2. Mitigating Multi-Account Abuse:</strong> While the AAN Protocol limits Sybil node clusters and blocks automated emulated frameworks, it does not guarantee absolute resistance to offline human collusion. Rather, it represents a robust physical defense layer that keeps platforms safe.
          </p>
          <p>
            <strong>3. Regulatory & Sovereign Compliance:</strong> In accordance with EU GDPR, UK DPA, and California CCPA guidelines, AAN acts solely as a zero-knowledge technical gatekeeper. No high-privilege personal information is captured or saved over the wire, satisfying the strictest privacy regulations.
          </p>
        </div>
      </section>

      {/* Corporate Footprint Info */}
      <footer className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-[#1b1e28] text-center text-[#5d6780] text-[11px] font-mono leading-relaxed space-y-2">
        <p>&copy; 2026 Anonymous Authentication Network (AAN) Laboratory. All rights reserved.</p>
        <p className="text-[10px] text-[#424b5d]">
          Licensed as enterprise internet-wide trust coordination and decentralized human-verification infrastructure.
        </p>
      </footer>

    </div>
  );
}
