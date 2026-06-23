import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, AlertTriangle, Cpu, Database, EyeOff, Loader2, RefreshCw, 
  User, Key, Fingerprint, Mail, Smartphone, Eye, Camera, AppWindow,
  Sliders, Lock, Compass, MapPin, Laptop, ShieldCheck, Activity, Terminal,
  BookOpen, Code, FileText, Settings, HeartHandshake, ArrowRight, Github, 
  HelpCircle, AlertCircle, Sparkles, MessageSquare, Globe, ArrowUpRight, CheckCircle2,
  Trash2, Send, Info
} from 'lucide-react';

interface TrustDocsPortalProps {
  activeSubSection?: string;
  onNavigate: (page: string, customPath?: string) => void;
}

export default function TrustDocsPortal({ activeSubSection = 'docs', onNavigate }: TrustDocsPortalProps) {
  const [currentSection, setCurrentSection] = useState<string>(activeSubSection);

  // Sync state if prop changes (e.g. user clicks another footer link)
  useEffect(() => {
    if (activeSubSection) {
      setCurrentSection(activeSubSection);
    }
  }, [activeSubSection]);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    onNavigate('trustdocs', `/${section}`);
  };

  // Support state simulations
  const [contactForm, setContactForm] = useState({
    type: 'sales',
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');

  // Support Portal Ticket Simulator
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({ title: '', category: 'technical', depth: 'developer', text: '' });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ type: 'sales', name: '', email: '', organization: '', message: '' });
    }, 4000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.text) return;
    const ticket = {
      id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newTicket.title,
      category: newTicket.category,
      depth: newTicket.depth,
      text: newTicket.text,
      status: 'Open',
      created: new Date().toLocaleTimeString()
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ title: '', category: 'technical', depth: 'developer', text: '' });
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  // Side Navigation Groups
  const categories = [
    {
      title: "DEVELOPERS",
      items: [
        { id: "docs", label: "Documentation", icon: BookOpen },
        { id: "api-ref", label: "API Reference", icon: Code },
        { id: "sdks", label: "SDK Downloads", icon: Cpu },
        { id: "changelog", label: "Changelog", icon: Activity },
        { id: "github", label: "GitHub Repository", icon: Github }
      ]
    },
    {
      title: "SECURITY",
      items: [
        { id: "security", label: "Security Standards", icon: ShieldCheck },
        { id: "privacy", label: "Privacy Policy", icon: EyeOff },
        { id: "trust", label: "Trust Center Matrix", icon: Sliders },
        { id: "disclosure", label: "Responsible Disclosure", icon: AlertTriangle },
        { id: "status", label: "System Status", icon: Activity }
      ]
    },
    {
      title: "COMPANY",
      items: [
        { id: "mission", label: "Mission Statement", icon: HeartHandshake },
        { id: "brand", label: "Brand Manual", icon: FileText },
        { id: "research", label: "Research Center", icon: Compass },
        { id: "roadmap", label: "Product Roadmap", icon: Sliders }
      ]
    },
    {
      title: "ENTERPRISE",
      items: [
        { id: "pricing", label: "Pricing Matrix", icon: Sliders },
        { id: "support", label: "Support Portal", icon: HelpCircle },
        { id: "contact", label: "Contact Sales", icon: Mail },
        { id: "terms", label: "Terms & Conditions", icon: Lock }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600Selection">
      
      {/* Mini Breadcrumb & Global Secure Anchor */}
      <div className="bg-slate-900 border-b border-slate-800 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex gap-0.5 items-end cursor-pointer group"
            >
              <span className="w-1.5 h-4 bg-blue-600 rounded-sm group-hover:bg-blue-500 transition-all" />
              <span className="w-1.5 h-5 bg-white rounded-sm" />
              <span className="font-sans font-black text-white text-xs ml-2 tracking-tight">AAN Trust & Resource Center</span>
            </div>
            <span className="text-slate-400 text-xs">/</span>
            <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-blue-400 uppercase tracking-widest border border-slate-800">
              {currentSection.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational (Sandbox environment)
            </span>
            <button 
              onClick={() => onNavigate('landing')}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-3 py-1 rounded transition-all text-[10px]"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg sticky top-6">
            <div className="mb-4 pb-3 border-b border-slate-800">
              <span className="font-sans font-bold text-xs text-white uppercase tracking-wider block">RESOURCE DIRECTORY</span>
              <p className="text-[10px] text-slate-500 mt-1">Select an enterprise article or documentation reference to inspect details.</p>
            </div>

            <nav className="space-y-5">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="font-mono text-[9px] text-slate-500 tracking-widest font-extrabold block">{cat.title}</span>
                  <div className="flex flex-col gap-1">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionChange(item.id)}
                          className={`w-full text-left font-sans text-xs py-1.5 px-2.5 rounded transition-all flex items-center gap-2 group cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600/10 border-l-2 border-blue-600 text-white font-bold' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-350'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* RIGHT COLUMN: Interactive Content Space */}
        <main className="lg:col-span-9 bg-slate-900/30 border border-slate-900 rounded-lg p-6 lg:p-8 space-y-8 select-text">
          
          {/* ==================== 1. DOCUMENTATION ==================== */}
          {currentSection === 'docs' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">DEVELOPER REFERENCE</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Technical Platform Documentation</h1>
                <p className="text-sm text-slate-400 mt-1">A thorough overview of the AAN architecture, mission statement, and session lifecycles.</p>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-lg p-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-800 mb-2">
                  <span>SYSTEM OVERVIEW SUMMARY</span>
                  <span className="text-blue-500">MVP MODEL 0.3.0</span>
                </div>
                <div>AAN operates as a decentralized, privacy-preserving digital trust layer. It serves as an active decision mechanism to help platforms verify genuine human status without permanently retaining or assembling client identity files.</div>
              </div>

              {/* 1.1 Mission & What AAN Is */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-1.5 font-sans flex items-center gap-2">
                  <span className="text-slate-500 text-xs">1.1</span> What is AAN?
                </h2>
                <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
                  <p>
                    AAN (Adaptive Assurance Network) is a modern digital identity middleware infrastructure. Modern platforms are plagued by automated botnets, duplicate registrations, sybil account networks, and credential stuffing vectors. Traditional MFA processes are cumbersome, and heavyweight document-based checks (government IDs) introduce high drop-off and severe privacy risks.
                  </p>
                  <p>
                    AAN bridges this gap. By evaluating device-bound credentials, contextual telemetry (residential proxy routing, browser execution layers, fast action tempos), and optionally evaluating transient face liveness markers, AAN provides deterministic assurance of returning unique human status.
                  </p>
                </div>
              </div>

              {/* 1.2 Mission Statement */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-1.5 font-sans flex items-center gap-2">
                  <span className="text-slate-500 text-xs">1.2</span> Core Institutional Mission
                </h2>
                <p className="text-xs text-slate-400 italic bg-slate-900/50 p-4 border border-slate-850 rounded-lg leading-relaxed">
                  "AAN provides adaptive authentication and trust infrastructure that helps organizations evaluate login risk and apply verification policies appropriate to each authentication attempt."
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our architecture guarantees strict data minimization. Sensitive liveness video streams, face map configurations, and location logs are processed strictly in client memory. Only short-lived cryptographic assertion hashes are synced and logged to verify user status, mitigating structural breach damage.
                </p>
              </div>

              {/* 1.3 Architecture Diagrams & Slife lifecycle */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-1.5 font-sans flex items-center gap-2">
                  <span className="text-slate-500 text-xs">1.3</span> Integrated Architecture Overview
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The diagram below explains the typical flow of an AAN integrated authentication attempt:
                </p>

                {/* ASCII Diagram representation */}
                <pre className="bg-slate-950 border border-slate-850 p-4 rounded-lg font-mono text-[10px] text-blue-400 overflow-x-auto leading-relaxed select-all">
{`   [ Standard Client Browser ] ──────(1. Initial Access request)─────> [ Organization Server ]
                │                                                          │
         (2. Assesses local                                        (3. Requests AAN session
         device-integrity and                                      via POST /verify-sessions)
         sends telemetry signs)                                            │
                │                                                          ▼
                ▼                                                [   AAN Trust API   ]
    [ Adaptive Challenge Check ] <───(4. Triggers if risk index > 35)─── [ (Evaluates risk index) ]
         (User touches Key or                                              │
          checks optional Camera)                                          │
                │                                                          │
                └─────────────────(5. Signs proof token assertion)─────────┘`}
                </pre>

                <p className="text-xs text-slate-400 leading-relaxed">
                  The session lifecycle contains three discrete conditions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest block font-bold">1. LOW RISK (PASS)</span>
                    <p className="text-[10px] text-slate-400 mt-1">Instant stateless validation. Requires zero secondary user checkpoints.</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                    <span className="font-mono text-[9px] text-yellow-400 uppercase tracking-widest block font-bold">2. SUSPICIOUS STATE (CHALLENGE)</span>
                    <p className="text-[10px] text-slate-400 mt-1">Requires user to solve an enabled adaptive verification factor (Passkey, OTP, optional Camera Liveness).</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                    <span className="font-mono text-[9px] text-red-400 uppercase tracking-widest block font-bold">3. CRITICAL LIMIT (BLOCK)</span>
                    <p className="text-[10px] text-slate-400 mt-1">Automatic request termination. Logs incident telemetry permanently inside immutable ledgers.</p>
                  </div>
                </div>
              </div>

              {/* 1.4 Integration and Onboarding FAQ */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-1.5 font-sans flex items-center gap-2">
                  <span className="text-slate-500 text-xs">1.4</span> Organization Integration Checklist
                </h2>
                <ul className="text-xs text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed">
                  <li><strong>Account Onboarding:</strong> Partner admins register on the AAN console and initiate a secure Workspace.</li>
                  <li><strong>API Configuration:</strong> Access Keys are minted using secure, non-reversible SHA-256 hashes.</li>
                  <li><strong>Callback Integrations:</strong> Define custom webhooks representing pass/fail callback triggers.</li>
                  <li><strong>Client SDK Mount:</strong> Embed standard lightweight listener loaders directly inside critical login frames.</li>
                </ul>
              </div>

              {/* 1.5 Limits, Error Handling, and FAQ */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-1.5 font-sans flex items-center gap-2">
                  <span className="text-slate-500 text-xs">1.5</span> Service Level Limits & Error Conventions
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To protect public endpoint instances from service starvation vectors, AAN enforces granular throttling rules:
                </p>
                <table className="w-full text-left text-xs text-slate-400 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-200 font-mono text-[10px]">
                      <th className="py-2">LICENSE LEVEL</th>
                      <th className="py-2">WINDOW MATRIX</th>
                      <th className="py-2">BURST CAPACITY</th>
                      <th className="py-2">RESET CYCLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className="py-2 text-white font-semibold">Sandbox Portal</td>
                      <td className="py-2">100 requests</td>
                      <td className="py-2">5 requests/sec</td>
                      <td className="py-2">1 hour</td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className="py-2 text-white font-semibold">Enterprise Core</td>
                      <td className="py-2">Dynamic Limit</td>
                      <td className="py-2">500 requests/sec</td>
                      <td className="py-2">Realtime Rolling</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 2. API REFERENCE ==================== */}
          {currentSection === 'api-ref' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">REFERENCE SCHEMA</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">API Reference Portal</h1>
                <p className="text-sm text-slate-400 mt-1">RESTful endpoints, structured payloads, status codes, and error payloads for integration.</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-850 rounded-lg">
                <div className="flex items-center gap-3 text-xs text-slate-350">
                  <strong className="text-white">Global Base URI:</strong>
                  <code className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-blue-400 font-mono">https://api.aan.trust/v1</code>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                  <span>Authentication Method:</span>
                  <code className="text-emerald-400 font-mono">Bearer (Minted Partner SHA-256 API Key)</code>
                </div>
              </div>

              {/* Endpoints */}
              <div className="space-y-6">
                
                {/* Endpoint 1: POST /verify */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-950 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-900">POST</span>
                    <code className="text-white text-xs font-bold font-mono">/verify</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth Required: Yes</span>
                  </div>
                  <p className="text-xs text-slate-405 leading-relaxed">
                    Evaluates structural telemetry payload and issues cryptographic proof claim assertion. Used for instantaneous risk screening.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">REQUEST BODY (JSON)</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-slate-350 overflow-x-auto leading-relaxed select-all">
{`{
  "session_token": "vss_9f83ea1",
  "account_claim": "user@example.com",
  "client_ip": "198.51.100.42",
  "verification_policy": "standard"
}`}
                      </pre>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">RESPONSE FORMAT</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed select-all">
{`{
  "qualified": true,
  "risk_score": 12,
  "proof_token": "proof_sig_b83fa...",
  "evaluated_at": "2026-06-18T18:00:22Z"
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong>Potential Errors:</strong> <code>400 Bad Request</code> (missing parameters), <code>401 Unauthorized</code> (invalid SHA token key).
                  </div>
                </div>

                {/* Endpoint 2: POST /session */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-950 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-900">POST</span>
                    <code className="text-white text-xs font-bold font-mono">/session</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth Required: Yes</span>
                  </div>
                  <p className="text-xs text-slate-405 leading-relaxed">
                    Mints a fresh, short-lived session token (vss_*) with configured verification lifetimes. This starts the device integrity collection sequence.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">REQUEST BODY (JSON)</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-slate-350 overflow-x-auto leading-relaxed">
{`{
  "lifetime_seconds": 600,
  "metadata": { "platform": "web_beta" }
}`}
                      </pre>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">RESPONSE FORMAT</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "session_token": "vss_a8d7fc9d3",
  "expires_at": "2026-06-18T18:10:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Endpoint 3: GET /status */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-950 text-blue-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-blue-900">GET</span>
                    <code className="text-white text-xs font-bold font-mono">/status</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth Required: No</span>
                  </div>
                  <p className="text-xs text-slate-405 leading-relaxed">
                    Public node health checker. Returns connectivity state and active sandbox network status.
                  </p>
                  <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed max-w-sm">
{`{
  "status": "operational",
  "environment": "developer_sandbox_v3"
}`}
                  </pre>
                </div>

                {/* Endpoint 4: POST /organization */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-950 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-900">POST</span>
                    <code className="text-white text-xs font-bold font-mono">/organization</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth Required: Elevated Token Only</span>
                  </div>
                  <p className="text-xs text-slate-405 leading-relaxed">
                    Registers a new partner institutional boundary within the sandbox node system.
                  </p>
                  <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-slate-330 overflow-x-auto leading-relaxed max-w-md">
{`{
  "org_name": "Sovereign Financial Corp",
  "admin_email": "compliance@sovfin.com"
}`}
                  </pre>
                </div>

                {/* Endpoint 5: GET /audit-events */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-950 text-blue-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-blue-900">GET</span>
                    <code className="text-white text-xs font-bold font-mono">/audit-events</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth Required: Yes</span>
                  </div>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Returns structural immutable telemetry log events synced during previous sessions for audit logs compliance.
                  </p>
                  <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
{`[
  {
    "event_id": "aud_7a9f8231",
    "trigger_source": "user_claim_eval",
    "timestamp": "2026-06-18T17:45:10Z",
    "risk_score_evaluation": 12
  }
]`}
                  </pre>
                </div>

                {/* Endpoint 6: DELETE /verification */}
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-red-955 text-red-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-red-900/50">DELETE</span>
                    <code className="text-white text-xs font-bold font-mono">/verification</code>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">Auth: Admin / Deletion Token</span>
                  </div>
                  <p className="text-xs text-slate-405 leading-relaxed">
                    Purges all records of account claims, telemetry links, and verification sessions associated with a specific user profile instantly.
                  </p>
                  <pre className="bg-slate-950 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-slate-350 max-w-sm">
{`{
  "user_id": "usr_94a8c88f2"
}`}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 3. SDK DOWNLOADS ==================== */}
          {currentSection === 'sdks' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-semibold uppercase tracking-widest block mb-1">DOWNLOAD ARCHIVES</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Software Development Kits (SDKs)</h1>
                <p className="text-sm text-slate-400 mt-1">Lightweight wrapper integrations designed to simplify trust assertion handshakes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">JavaScript/TypeScript SDK</span>
                      <span className="font-mono text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-900 font-bold uppercase tracking-widest">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed font-sans">
                      Client-side signal listener. Collects continuous safe hardware indicators in-browser without caching permanent cookies or storing raw logs.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">REST Integration Schema</span>
                      <span className="font-mono text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 font-bold uppercase tracking-widest">Available</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed font-sans">
                      Direct integration with raw HTTPS endpoints. Recommended choice for financial setups, backends, and low-dependency systems.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">Node.js Enterprise Server SDK</span>
                      <span className="font-mono text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-950 font-bold uppercase tracking-widest">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed font-sans">
                      Verify signed claims tokens and secure webhooks instantly within standard Express, Nest, or Koa backend runtimes.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">React Client Wrapper</span>
                      <span className="font-mono text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-950 font-bold uppercase tracking-widest">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed font-sans">
                      Provides dedicated React hooks to fetch risk scores and launch adaptive liveness modals inline within UI transitions.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-slate-400 text-xs">Swift iOS SDK</span>
                      <span className="font-mono text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-900 font-bold uppercase tracking-widest">Planned</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Planned Swift interface package to leverage device-bound iOS system Secure Enclaves to assert trust seamlessly.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-slate-400 text-xs">Android Kotlin SDK</span>
                      <span className="font-mono text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-900 font-bold uppercase tracking-widest">Planned</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Planned Android system library using Android KeyStore modules to certify physical application signatures.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 4. CHANGELOG ==================== */}
          {currentSection === 'changelog' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">DEVELOPMENT JOURNALS</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Changelog & Version History</h1>
                <p className="text-sm text-slate-400 mt-1">Audit log of system patches, updates, and framework refinements.</p>
              </div>

              <div className="space-y-8 pl-4 border-l border-slate-850">
                
                <div className="relative space-y-2">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white uppercase">Version 0.3.0</span>
                    <span className="text-[10px] text-slate-500 font-mono">June 2026 (Active Sandbox)</span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Released advanced multi-signal heuristics integration console. Partners can now toggle required adaptive challenges on matching profiles. Introduced immutable audit ledgers synced to internal timeline databases for governance audit trails.
                  </p>
                </div>

                <div className="relative space-y-2">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-slate-950" />
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white uppercase">Version 0.2.0</span>
                    <span className="text-[10px] text-slate-500 font-mono">May 2026</span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Designed full session-based flows supporting device integrity screening, FIDO2/WebAuthn mock validation assertions, and temporary browser environment checks.
                  </p>
                </div>

                <div className="relative space-y-2">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-950" />
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white uppercase">Version 0.1.0</span>
                    <span className="text-[10px] text-slate-500 font-mono">April 2026</span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Assembled public landing infrastructure, interactive user verification flow simulation mockup, and initial risk assessment matrix structures.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 5. GITHUB REPOSITORY ==================== */}
          {currentSection === 'github' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-slate-450 font-bold uppercase tracking-widest block mb-1">DEVELOPER SOURCING</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">GitHub Repository Sourcing</h1>
                <p className="text-sm text-slate-400 mt-1">Access policies for our core codebase, API servers, and SDK layout configurations.</p>
              </div>

              <div className="p-6 bg-slate-950/50 border border-slate-850 rounded-lg space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-400">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-red-400 uppercase font-extrabold block">REPOSITORY STATUS: PRIVATE</span>
                    <span className="font-sans font-bold text-sm text-white">Sovereign Source Isolation</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  As our digital trust infrastructure runs inside critical government portals, commercial banks, and health registries globally, the core platform code repository remains under private, controlled isolation. 
                </p>
                <div className="p-4 bg-slate-900/40 border border-slate-900 text-xs text-slate-355 rounded space-y-1">
                  <strong>Access Policy during Pilot Program:</strong> Eligible institutional partners and technical evaluation committees receive audited, controlled repository read access during active trial schedules.
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. SECURITY STANDARDS ==================== */}
          {currentSection === 'security' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">PROTECTION MANUAL</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Technical Security Standards</h1>
                <p className="text-sm text-slate-400 mt-1">An honest, factual overview of core cryptographic controls, transport parameters, and standards alignment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 uppercase font-bold block">1. SECURE METRICS TRANSPORT</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    All telemetry, request parameters, and tokens require HTTPS routed exclusively through TLS 1.3 channels to assert strong forward secrecy globally.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 uppercase font-bold block">2. SECRET DESTRUCTURING / HASHING</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Partner access secrets are hashed instantly using Argon2id or salted bcrypt algorithms before storing, preventing key extraction vectors.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 uppercase font-bold block">3. SHORT-LIVED JWT LIFECYCLES</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Risk tokens are cryptographically signed using proprietary, rotating RSA keys with brief ephemeral lifespans contextually restricted to transaction bounds.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 uppercase font-bold block">4. SECURED ROLE COMPARTMENTALIZATION</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Strict Role-Based Access Control (RBAC) separates administrative platform controls from workspace credentials, applying rigid Principle of Least Privilege limits.
                  </p>
                </div>

              </div>

              {/* Compliance disclaimer and production roadmap */}
              <div className="p-5 bg-slate-950/65 border border-slate-850 rounded-lg space-y-3.5">
                <span className="font-mono text-[9px] text-yellow-400 uppercase font-extrabold block">FUTURE PRODUCTION SECURITY ROADMAP</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AAN is presented inside a simulated sandbox environment. The following formal commercial certifications are planned with independent auditors during pilot progression:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[10px]">
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-350 block font-bold">● SOC 2 Type II</span>
                    <span className="text-slate-500 block text-[9px] mt-0.5">Planned for Q1 2027</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-350 block font-bold">● ISO/IEC 27001</span>
                    <span className="text-slate-500 block text-[9px] mt-0.5">Planned for Q2 2027</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-350 block font-bold">● NIST SP 800-53</span>
                    <span className="text-slate-500 block text-[9px] mt-0.5">Under Active Alignment Study</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 7. PRIVACY POLICY ==================== */}
          {currentSection === 'privacy' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">LEGAL ALIGNMENT</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-slate-400 mt-1">A transparent, factual review of exactly what signals are processed, and our non-negotiable retention boundaries.</p>
              </div>

              <div className="space-y-5 leading-relaxed text-xs text-slate-400">
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">1. Scope and Minimization</h3>
                  <p>
                    AAN focuses on evaluating temporary, contextual indicators of human integrity. We treat persistent user profiling as a systemic security hazard. Our systems operate under strict limits regarding client personal identifiable storage, conforming to data minimization goals.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">2. Information We Process</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-405">
                    <li><strong>Contextual Signals:</strong> Client device IP metadata (to resolve state proxy, data-center nodes, or impossible velocity travels).</li>
                    <li><strong>Device Fingerprints:</strong> Declared browser platform parameters, screen bounds, and hardware thread metadata.</li>
                    <li><strong>Optional Face Liveness metrics:</strong> Hashed biometric landmark values computed entirely in client memory buffers to satisfy elevated verification hurdles.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">3. Information We DO NOT Collect</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-405">
                    <li>Persistent biological face models, voice embeddings, or structural physical templates.</li>
                    <li>Government identity registry snapshots, driver's licenses, or national registration numbers.</li>
                    <li>Real consumer names, physical addresses, or financial data structures.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">4. Data Retention & Purge Rules</h3>
                  <p>
                    Verification session telemetry logs are purged automatically and completely from active volatile database registries exactly 24 hours following session resolution or expiration. Organizations maintain options to trigger instant <code>DELETE /verification</code> instructions on behalf of users at any interval.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">5. Use of Cookies</h3>
                  <p>
                    Cookies are restricted strictly to functional JWT storage to support legitimate admin dashboards. Security features explicitly reject tracking, telemetry, or marketing analytical scripts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 8. TRUST CENTER MATRIX ==================== */}
          {currentSection === 'trust' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">COMPLIANCE CONTROL</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Trust Center Matrix</h1>
                <p className="text-sm text-slate-400 mt-1">Live operational integrity checklist, known limitations, and active status tracking.</p>
              </div>

              {/* Factual table on features and states */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden font-mono text-[11px]">
                <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-800 p-3 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <span>PORTAL LAYER</span>
                  <span>STATUS MATRIX</span>
                  <span>SECURITY ASSERTION</span>
                </div>
                {[
                  { name: "Verification Service", status: "Operational", assert: "Subsecond evaluation latency" },
                  { name: "Session Validation", status: "Operational", assert: "Transient evaluation matching" },
                  { name: "Symmetric Encryption", status: "Enabled", assert: "AES-256 for active fields" },
                  { name: "Compliance Logging", status: "Enabled", assert: "Immutable internal timeline hashes" },
                  { name: "Raw Face Snapshots", status: "Not Stored", assert: "Purged instantly after landmark hash" },
                  { name: "Biometric Map database", status: "Not Stored", assert: "Decoupled architecture" },
                  { name: "Government Database Links", status: "Not Stored", assert: "Pre-KYC level proxying only" },
                  { name: "Demo Sandbox Utilities", status: "Mocked", assert: "Simulated liveness camera frames" }
                ].map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-3 p-3 border-b border-slate-900/80 hover:bg-slate-900/10 text-slate-350">
                    <span className="text-white font-sans font-bold text-xs">{row.name}</span>
                    <span className={`font-semibold ${
                      row.status === 'Operational' || row.status === 'Enabled' 
                        ? 'text-emerald-400' 
                        : row.status === 'Mocked' ? 'text-blue-400 font-bold' : 'text-slate-400'
                    }`}>● {row.status}</span>
                    <span className="text-slate-450 text-[10px]">{row.assert}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-850 pb-1 pt-2">Known Technical Limitations</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The contextual device risk calculation may flag users operating premium dedicated residential IP ranges linked to high-velocity VPN nodes or business secure networks. AAN mitigates this false friction by prioritizing low-摩擦 biometric challenge touch gestures during elevated thresholds rather than terminating access outright.
                </p>
                
                <h3 className="font-sans font-bold text-white text-sm border-b border-slate-850 pb-1">Responsible Disclosure Guideline</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  If you discover structural gaps or integration leaks, contact <code>security@aan.trust</code> immediately using our disclosure timeline rules.
                </p>
              </div>
            </div>
          )}

          {/* ==================== 9. SYSTEM STATUS ==================== */}
          {currentSection === 'status' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">HEALTH MONITOR</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Platform System Status</h1>
                <p className="text-sm text-slate-400 mt-1">Real-time status indicators across standard interface nodes, APIs, and portal runtimes.</p>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-800 text-emerald-400 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wide">Overall Matrix Status: Operational (Demo Sandbox Workspace)</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { component: "Public Website Landing Page", status: "Operational", health: "Sandbox Gateway" },
                  { component: "Developer Playground Portal", status: "Operational", health: "Sandbox Node" },
                  { component: "Verification API Server REST", status: "Operational", health: "Vss API Sandbox" },
                  { component: "Partner Analytics Dashboard", status: "Operational", health: "Secure Workspace Controller" },
                  { component: "Organization Administrator Console", status: "Operational", health: "Admin Portal Root" }
                ].map((comp, cIdx) => (
                  <div key={cIdx} className="p-3.5 bg-slate-950/50 border border-slate-850 rounded flex items-center justify-between text-slate-400 select-all">
                    <div>
                      <span className="text-white block font-sans font-semibold text-xs">{comp.component}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Segment: {comp.health}</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-990/20 px-2 py-0.5 rounded text-[10px]">
                      ● {comp.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-850 rounded text-xs text-slate-450 text-center font-mono">
                Uptime percentages are illustrative representation. Active servers are running inside Sandboxed Cloud cluster instances.
              </div>
            </div>
          )}

          {/* ==================== 10. MISSION ==================== */}
          {currentSection === 'mission' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">SOVEREIGN STATEMENT</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Our Core Mission</h1>
                <p className="text-sm text-slate-400 mt-1">Why AAN exists, the problems we solve, and our commitments to decentralized privacy.</p>
              </div>

              <div className="text-xs text-slate-400 space-y-4 leading-relaxed">
                <p>
                  Internet security is approaching a systemic transition. Standard authentication frameworks assume that users possess unique email accounts or static telephone numbers. However, with the rise of modern synthetic intelligence engines, launching infinite artificial entities costs fractions of a cent, leading to massive fraud spams.
                </p>
                <blockquote className="border-l-2 border-blue-600 pl-4 py-2 text-white italic font-serif">
                  "AAN provides adaptive authentication and trust infrastructure that helps organizations evaluate login risk and apply verification policies appropriate to each authentication attempt."
                </blockquote>
                <p>
                  To restore digital trust, systems must confirm human authenticity. But building static databases of biometric profiles results in dangerous centralizing. A breached biometric archive is permanent. 
                </p>
                <p>
                  AAN maintains an elegant alternative: <strong>minimization at rest</strong>. By proving returning uniqueness entirely on the client, and using ephemeral hashes to clear downstream challenges, AAN balances rigorous platform security against complete consumer privacy.
                </p>
              </div>
            </div>
          )}

          {/* ==================== 11. BRAND MANUAL ==================== */}
          {currentSection === 'brand' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mb-1">BRAND IDENTITY</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Active Brand Guidelines</h1>
                <p className="text-sm text-slate-400 mt-1">Design aesthetics, core typography schemes, tones, alignment assets, and future downloads.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded space-y-2.5">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold block uppercase">PRIMARY TYPOGRAPHY SYSTEM</span>
                  <div className="space-y-1 font-sans text-xs">
                    <p className="font-bold text-white">Font Family: Inter (sans-serif)</p>
                    <p className="text-slate-450 leading-relaxed">Used across all core interfaces, headers, and dashboard widgets to ensure clean, high-contrast, professional readability.</p>
                    <p className="font-mono text-[10px] text-blue-400 mt-1">Accents: JetBrains Mono (monospaced telemetry logs)</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded space-y-2.5">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold block uppercase">DESIGN VOICE AND PRINCIPLES</span>
                  <div className="space-y-1 font-sans text-xs">
                    <p className="font-bold text-white">Tone: Factual, Direct, Frictional, Restrained.</p>
                    <p className="text-slate-450 leading-relaxed">Flee from consumer marketing adjectives ("world's first", "game-changing"). Write only objective statements regarding telemetry values and cryptographic keys.</p>
                  </div>
                </div>

              </div>

              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded space-y-4">
                <span className="font-mono text-[10px] text-slate-400 font-bold block uppercase border-b border-slate-850 pb-2">Logo Use and Restrictions</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1 bg-emerald-950/10 border border-emerald-900/30 p-3 rounded">
                    <span className="font-bold text-emerald-400 block font-mono">CORRECT USE (DO)</span>
                    <span className="text-slate-400 leading-normal block">Embed inside clean, spacious margins on monochrome slate-dark backdrops. Pair with crisp blue active signals.</span>
                  </div>
                  <div className="space-y-1 bg-red-955/10 border border-red-900/30 p-3 rounded">
                    <span className="font-bold text-red-400 block font-mono">INCORRECT USE (DON'T)</span>
                    <span className="text-slate-400 leading-normal block">Avoid using bright purple, consumer gradients, neon highlights, or comic cartoon configurations.</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-850 rounded text-center text-xs text-slate-500 font-mono">
                Asset Download Portal (Planned: SVG Vector Master, Encapsulated PDF, Portable PNG)
              </div>
            </div>
          )}

          {/* ==================== 12. RESEARCH ==================== */}
          {currentSection === 'research' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">CRYPTO ARCHITECTURE</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Identity Research Center</h1>
                <p className="text-sm text-slate-400 mt-1">A collection of research abstractions on privacy-first systems, telemetry index matching, and sybil prevention.</p>
              </div>

              <div className="space-y-6">
                
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 font-bold block uppercase">PREPRINT: "Continuous Client Telemetry Heuristics vs Central Biometric Storage"</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Explores the risk mitigation efficacy of tracking rolling speed metrics, browser canvas parameters, and system behaviors compared to maintaining permanent biometric archives. Demonstrates 98% botnet suppression with zero long-term profile storage.
                  </p>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg space-y-2">
                  <span className="font-mono text-[9px] text-blue-400 font-bold block uppercase">WHITE-PAPER: "Proof Tokens: Cryptographic Claims Assertions for Downstream Systems"</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Describes how AAN signs ephemeral claim payloads using secure rotating keys, enabling downstream servers to certify unique returning human transactions without exposing underlying device attributes.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 13. ROADMAP ==================== */}
          {currentSection === 'roadmap' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mb-1">TIMELINE SCHEDULE</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Product Development Roadmap</h1>
                <p className="text-sm text-slate-400 mt-1">A transparent checklist of historical releases and future pilot engineering plans.</p>
              </div>

              {/* Graphical tree list */}
              <div className="space-y-4 pl-4 border-l border-slate-850">
                {[
                  { name: "1. Developer Playground", desc: "Interactive demo session, REST mock endpoints, secure payload configurations.", status: "Released" },
                  { name: "2. Enterprise Partner Dashboard", desc: "Key hashing tools, allowed verification checklist configuration, real logs timeline syncing.", status: "Released" },
                  { name: "3. Workspace Organization Admin", desc: "Comprehensive user suspension consoles, permanent account purging controls.", status: "Released" },
                  { name: "4. Production Telemetry Engine", desc: "Direct client hook integrations to resolve residential VPN proxy clusters.", status: "In Development" },
                  { name: "5. Swift iOS & Android Kotlin SDKs", desc: "Leverage mobile hardware Secure Enclaves for passkey signatures.", status: "Planned" },
                  { name: "6. Formal Standards Auditing", desc: "Filing and review of SOC 2 and ISO 27001 compliance standards.", status: "Planned" }
                ].map((step, sIdx) => {
                  const isReleased = step.status === "Released";
                  const isInDev = step.status === "In Development";
                  return (
                    <div key={sIdx} className="relative space-y-1">
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                        isReleased ? 'bg-emerald-500' : isInDev ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'
                      }`} />
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-bold text-white text-xs">{step.name}</span>
                        <span className={`font-mono text-[8.5px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${
                          isReleased ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' : 
                          isInDev ? 'bg-indigo-950/20 text-indigo-400 border-indigo-900/55' : 'bg-slate-950 text-slate-505 border-slate-850'
                        }`}>{step.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal max-w-xl font-sans">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 14. PRICING MATRIX ==================== */}
          {currentSection === 'pricing' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">PLAN PRESETS</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Enterprise Pricing Matrix</h1>
                <p className="text-sm text-slate-400 mt-1">Illustrative allocation plans for sandbox integration trials and pilot deployments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                      <span className="font-sans font-bold text-white text-xs">Developer Plan</span>
                      <span className="font-mono text-[10px] text-emerald-400">Free</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Designed to secure experimental projects, test REST integration scripts, and verify liveness interfaces.
                    </p>
                    <ul className="text-[10.5px] text-slate-400 font-mono space-y-1">
                      <li>• 100 verifications/month</li>
                      <li>• Standard client security score</li>
                      <li>• Sandbox dashboard access</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                      <span className="font-sans font-bold text-white text-xs">Enterprise Plan</span>
                      <span className="font-mono text-[10px] text-blue-400">Custom Pricing</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      High-throughput deployment for modern scaling platforms requiring zero uptime friction margins.
                    </p>
                    <ul className="text-[10.5px] text-slate-400 font-mono space-y-1">
                      <li>• Flexible session allowances</li>
                      <li>• Customizable verification policies</li>
                      <li>• Dedicated compliance dashboards</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                      <span className="font-sans font-bold text-white text-xs">Government Core</span>
                      <span className="font-mono text-[10px] text-indigo-400">Contact Sales</span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Sovereign air-gapped structures meeting strict regulatory identity protection frameworks.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                      <span className="font-sans font-bold text-slate-400 text-xs">Biomedical Research</span>
                      <span className="font-mono text-[10px] text-slate-500">Invitation Only</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Controlled node access targeting scholarly cryptography teams evaluating continuous signal heuristics.
                    </p>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-900 border border-slate-850 rounded text-center text-xs text-slate-500 font-mono">
                Illustrative plans compiled for MVP representation only. Actual access credentials require custom pilot clearances.
              </div>
            </div>
          )}

          {/* ==================== 15. SUPPORT PORTAL ==================== */}
          {currentSection === 'support' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">USER ASSISTANCE</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Support Portal</h1>
                <p className="text-sm text-slate-400 mt-1">Raise support inquiries, troubleshoot common API issues, and view pilot restrictions.</p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg text-xs text-slate-400 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white">Pilot Program Notice:</strong>
                  <p className="leading-relaxed">Advanced SLAs, direct Slack integrations, and standard phone support routes are restricted to closed pilot integration program participants.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2">
                
                {/* Simulated Support Request Form */}
                <form onSubmit={handleTicketSubmit} className="bg-slate-950/40 border border-slate-905 p-5 rounded-lg space-y-4">
                  <span className="font-mono text-[10px] text-blue-400 uppercase font-bold block border-b border-slate-850 pb-1.5">OPEN HELPDESK TICKET</span>
                  
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400 font-mono text-[10px]">Short Ticket Subject</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded focus:outline-none focus:border-blue-600 font-mono text-xs text-white"
                      placeholder="e.g., v1/sessions/ status returning 401"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px]">Severity Area</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-850 py-1.5 px-2 rounded focus:border-blue-600 text-xs text-slate-350"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      >
                        <option value="technical">Technical Bug</option>
                        <option value="billing">Billing inquiry</option>
                        <option value="governance">Privacy compliance</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px]">Integration Depth</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-850 py-1.5 px-2 rounded focus:border-blue-600 text-xs text-slate-350"
                        value={newTicket.depth}
                        onChange={(e) => setNewTicket({ ...newTicket, depth: e.target.value })}
                      >
                        <option value="developer">Developer Trial</option>
                        <option value="pilot">Authorized Pilot Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-sans">
                    <label className="text-slate-400 font-mono text-[10px]">Detailed description of issue</label>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-855 px-3 py-2 rounded focus:outline-none focus:border-blue-600 text-xs text-white h-24"
                      placeholder="Provide step-by-step logs, API keys setup scope, or device parameters observed."
                      value={newTicket.text}
                      onChange={(e) => setNewTicket({ ...newTicket, text: e.target.value })}
                      required
                    />
                  </div>

                  {ticketSuccess && (
                    <div className="p-2 bg-emerald-950/20 border border-emerald-990/40 text-emerald-400 text-[10px] text-center rounded">
                      Ticket logged successfully inside sandbox console queue.
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2 rounded transition"
                  >
                    Transmit Helpdesk Request &rarr;
                  </button>
                </form>

                {/* FAQ Quick Search component */}
                <div className="space-y-4">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold block border-b border-slate-850 pb-1.5">INSPECT INTEGRATION FAQS</span>
                  
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded text-xs font-sans focus:outline-none focus:border-blue-600 text-white"
                      placeholder="Search common questions..."
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { q: "Is a web camera scan mandatory for login?", a: "No. AAN uses adaptive validation. If device fingerprints, residential IP flags, and interaction tempos appear consistent, trusted users login with zero friction." },
                      { q: "Do you store high-res face files?", a: "Never. Camera frames are processed fully in client memory cache. Hashed landmark mapping signatures are compared volatilely then immediately destroyed." },
                      { q: "How do I clear mock accounts registered in sandboxes?", a: "Trigger a DELETE /verification request targeting your claim id, which wipes out all timeline logs securely." }
                    ].filter(item => item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase())).map((faq, fIdx) => (
                      <div key={fIdx} className="p-3 bg-slate-900 border border-slate-850 rounded text-slate-350 space-y-1">
                        <span className="font-sans font-bold text-white block">{faq.q}</span>
                        <p className="leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 16. CONTACT SALES ==================== */}
          {currentSection === 'contact' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">BUSINESS DIALOGUE</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Contact Sales & Partnerships</h1>
                <p className="text-sm text-slate-400 mt-1">Talk to our solutions team regarding pilot onboarding, custom SLA terms, and compliance scopes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                <div className="space-y-5 text-xs text-slate-400 font-sans leading-relaxed">
                  <div className="space-y-2">
                    <strong className="text-white text-sm font-sans block">Institutional Advisory Inquiries:</strong>
                    <p>We work closely with institutional compliance teams to outline secure integration programs. Contact Sales regarding:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-350 font-mono text-[11px]">
                      <li> Custom corporate onboarding setups (Okta/SAML)</li>
                      <li> High-volume dedicated container hosts with 99.999% SLA</li>
                      <li> Zero-knowledge verification templates for sensitive branches</li>
                      <li> Government custom deployment proposals</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded">
                    <strong>Technical Support Scope:</strong> Technical questions, integration troubleshooting, and API keys config assistance are routed to support networks inside the <strong className="text-blue-400 text-underline cursor-pointer" onClick={() => handleSectionChange('support')}>Support Portal</strong>.
                  </div>
                </div>

                {/* Sales contact form simulation */}
                <form onSubmit={handleContactSubmit} className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
                  <span className="font-mono text-[10px] text-blue-400 uppercase font-bold block border-b border-slate-800 pb-1.5">TRANSMIT INQUIRY</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono text-[10px]">Contact Name</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded focus:outline-none focus:border-blue-600 text-white font-mono text-xs"
                        placeholder="Security Officer"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono text-[10px]">Secure Email Address</label>
                      <input 
                        type="email"
                        className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded focus:outline-none focus:border-blue-600 text-white font-mono text-xs"
                        placeholder="officer@company.trust"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-400 font-mono text-[10px]">Organization & Department Name</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded focus:outline-none focus:border-blue-600 text-white font-mono text-xs"
                      placeholder="e.g., Sovereign Capital PLC"
                      value={contactForm.organization}
                      onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs font-sans">
                    <label className="text-slate-400 font-mono text-[10px]">Institutional requirements brief</label>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-855 px-3 py-2 rounded focus:outline-none focus:border-blue-600 text-xs text-white h-24"
                      placeholder="Detail estimated transaction volumes, compliance scopes, or custom SLA metrics expected."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>

                  {contactSubmitted && (
                    <div className="p-2 bg-emerald-950/20 border border-emerald-990/40 text-emerald-400 text-[10px] text-center rounded font-mono">
                      Request logged successfully. Sandbox simulation acknowledged.
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2 rounded transition"
                  >
                    Submit Advisory Request &rarr;
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* ==================== 17. TERMS & CONDITIONS ==================== */}
          {currentSection === 'terms' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">INTEGRITY MATRIX</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Terms & Conditions</h1>
                <p className="text-sm text-slate-400 mt-1">Acceptable use restrictions, API consumption constraints, rate limits, and liability boundaries.</p>
              </div>

              <div className="space-y-5 leading-relaxed text-xs text-slate-400">
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">1. Acceptance of Terms</h3>
                  <p>
                    By integrating the AAN Adaptive Trust client interfaces, RESTful endpoint APIs, or using temporary security session tokens, you agree to comply with our Acceptable Use policy and understand our database boundaries.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">2. Acceptable Use Policies</h3>
                  <p>
                    Organizations are strictly forbidden from passing raw biometric files, persistent government identifiers, or non-claim linked personal information to our public API endpoints. Partners are responsible for ensuring clear end-user consent before initiating discretionary facial liveness evaluation scripts.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">3. Rate Limit Enforcement</h3>
                  <p>
                    System nodes will throttle or temporarily suspend client spaces that exceed sandbox allocation volumes without authorization, to defend platform reliability margins.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">4. Liability Limitations</h3>
                  <p className="italic bg-slate-900 border border-slate-850 p-4 rounded text-[11px] leading-normal text-slate-350">
                    AAN supplies contextual threat assessment indicator feedback. We never promise that our framework suppresses 100% of bot operations or guarantees total digital identity safety. We decline liability for downstream platform drop-off, false positive flags, or secondary database security events outside our direct sandboxed control.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 18. RESPONSIBLE DISCLOSURE ==================== */}
          {currentSection === 'disclosure' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <span className="font-mono text-[10px] text-yellow-400 font-bold uppercase tracking-widest block mb-1">BUG BOUNTY PROGRAM</span>
                <h1 className="text-2xl font-sans font-bold text-white tracking-tight">Responsible Disclosure Policy</h1>
                <p className="text-sm text-slate-400 mt-1">Submit technical security concerns, review Safe Harbor parameters, and coordinate timelines.</p>
              </div>

              <div className="space-y-5 leading-relaxed text-xs text-slate-400 font-sans">
                
                <div className="p-4 bg-yellow-950/25 border border-yellow-800/40 text-yellow-400 rounded-lg space-y-1.5 animate-pulse">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest block"> REWARD ELIGIBILITY CRITERIA</span>
                  <p className="text-xs">We value coordinate security research. Gaps or leakage detected on sandbox environments are eligible for symbolic bounty recognition rosters.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">1. Reporting Framework</h3>
                  <p>
                    Transmit detailed step-by-step reproduction instructions, sample REST payload triggers, and affected browser environments observed to:
                  </p>
                  <p className="font-mono text-[11px] bg-slate-950 border border-slate-850 px-3 py-1 text-blue-400 rounded max-w-xs">
                    security@aan.trust
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">2. Safe Harbor Safeguards</h3>
                  <p>
                    AAN pledges never to initiate legal claims or request law enforcement audits targeting researchers who locate and report structural vulnerabilities under our coordination policies.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-white text-sm">3. Standard Disclosure Timeline</h3>
                  <p>
                    To insulate our integrated active pilot institutional partners, researchers agree to grant a rolling 90-day silent window for our security engineers to apply fixes before publishing details publically.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-850 text-[10.5px] text-slate-450 font-mono">
                  Future PGP Key Signature: [ -----BEGIN PGP PUBLIC KEY BLOCK----- ... ]
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs font-mono text-slate-500">
         2026 AAN Trust Infrastructure. Safe, decoupled proof-of-human middleware.
      </footer>

    </div>
  );
}
