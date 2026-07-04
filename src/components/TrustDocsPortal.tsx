import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, AlertTriangle, Cpu, Database, EyeOff, Loader2, RefreshCw, 
  User, Key, Fingerprint, Mail, Smartphone, Eye, Camera, AppWindow,
  Sliders, Lock, Compass, MapPin, Laptop, ShieldCheck, Activity, Terminal,
  BookOpen, Code, FileText, Settings, HeartHandshake, ArrowRight, Github, 
  HelpCircle, AlertCircle, Sparkles, MessageSquare, Globe, ArrowUpRight, CheckCircle2,
  Trash2, Send, Info, Download, Palette, Grid, Target, Copy
} from 'lucide-react';
import TermsOfServiceView from './TermsOfServiceView';

interface TrustDocsPortalProps {
  activeSubSection?: string;
  onNavigate: (page: string, customPath?: string) => void;
}

export default function TrustDocsPortal({ activeSubSection = 'docs', onNavigate }: TrustDocsPortalProps) {
  // Helper to map individual sub-sections to their parent consolidated categories
  const mapSubSectionToCategory = (sub: string): string => {
    if (['docs', 'api-ref', 'sdks', 'changelog', 'github'].includes(sub)) return 'docs';
    if (['security', 'privacy', 'trust', 'disclosure', 'status'].includes(sub)) return 'security';
    if (['brand', 'mission', 'research', 'roadmap'].includes(sub)) return 'brand';
    if (['pricing', 'support', 'contact'].includes(sub)) return 'enterprise';
    if (['terms'].includes(sub)) return 'terms';
    return 'docs';
  };

  const [activeTab, setActiveTab] = useState<string>(mapSubSectionToCategory(activeSubSection));
  const [innerSubTab, setInnerSubTab] = useState<string>(activeSubSection);

  useEffect(() => {
    if (activeSubSection) {
      const parent = mapSubSectionToCategory(activeSubSection);
      setActiveTab(parent);
      // If parent is same as activeSubSection, map to default inner tabs
      if (activeSubSection === 'docs') setInnerSubTab('overview');
      else if (activeSubSection === 'security') setInnerSubTab('standards');
      else if (activeSubSection === 'brand') setInnerSubTab('sandbox');
      else if (activeSubSection === 'enterprise') setInnerSubTab('pricing');
      else setInnerSubTab(activeSubSection);
    }
  }, [activeSubSection]);

  const handleCategoryChange = (cat: string) => {
    setActiveTab(cat);
    // Set default inner sub tab for clean state
    if (cat === 'docs') setInnerSubTab('overview');
    else if (cat === 'security') setInnerSubTab('standards');
    else if (cat === 'brand') setInnerSubTab('sandbox');
    else if (cat === 'enterprise') setInnerSubTab('pricing');
    else setInnerSubTab('terms');
    
    onNavigate('trustdocs', `/${cat}`);
  };

  // Support Portal Simulation States
  const [contactForm, setContactForm] = useState({
    type: 'sales',
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({ title: '', category: 'technical', depth: 'developer', text: '' });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Bug Bounty / Security Center States
  const [bountyForm, setBountyForm] = useState({
    title: '',
    category: 'authentication_bypass',
    severity: 'high',
    affected_system: '',
    reproduction_steps: '',
    submitted_evidence: '',
    reporter_contact: ''
  });
  const [bountySubmitted, setBountySubmitted] = useState(false);
  const [submittedBounty, setSubmittedBounty] = useState<any | null>(null);
  const [submittingBounty, setSubmittingBounty] = useState(false);
  const [bountyError, setBountyError] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [bountyReportsList, setBountyReportsList] = useState<any[]>([]);

  // Brand Master Asset States
  const [logoTheme, setLogoTheme] = useState<'emerald' | 'white' | 'black'>('emerald');
  const [logoBg, setLogoBg] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [logoType, setLogoType] = useState<'parallel' | 'symmetric'>('parallel');
  const [strokeThickness, setStrokeThickness] = useState<number>(12);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  // Fetch security disclosures
  const fetchBountyReports = async () => {
    try {
      const res = await fetch('/api/internal/security-reports');
      if (res.ok) {
        const data = await res.json();
        setBountyReportsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch security reports:", err);
    }
  };

  useEffect(() => {
    fetchBountyReports();
  }, []);

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
    setTimeout(() => setTicketSuccess(false), 3500);
  };

  const handleBountySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bountyForm.title || !bountyForm.affected_system || !bountyForm.reproduction_steps || !bountyForm.reporter_contact) {
      setBountyError('Please fill out all required fields.');
      return;
    }
    setBountyError('');
    setSubmittingBounty(true);
    try {
      const res = await fetch('/api/internal/security-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bountyForm)
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedBounty(data.report);
        setBountySubmitted(true);
        setBountyForm({
          title: '',
          category: 'authentication_bypass',
          severity: 'high',
          affected_system: '',
          reproduction_steps: '',
          submitted_evidence: '',
          reporter_contact: ''
        });
        fetchBountyReports();
      } else {
        const errData = await res.json();
        setBountyError(errData.error || 'Failed to submit security report.');
      }
    } catch (err) {
      setBountyError('Network error submitting security report.');
    } finally {
      setSubmittingBounty(false);
    }
  };

  const handleLookup = () => {
    if (!lookupEmail) return;
    setIsLookingUp(true);
    setTimeout(() => {
      const matched = bountyReportsList.filter(
        r => r.reporter_contact.toLowerCase().trim() === lookupEmail.toLowerCase().trim()
      );
      setLookupResults(matched);
      setIsLookingUp(false);
    }, 600);
  };

  // Brand Asset Helper Functions
  const getSvgString = (type: 'parallel' | 'symmetric', theme: 'emerald' | 'white' | 'black', thickness: number) => {
    const strokeColor = theme === 'emerald' ? '#00E676' : theme === 'white' ? '#FFFFFF' : '#000000';
    const isParallel = type === 'parallel';
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <!-- AAN Master Logo Symbol - Geometric Monogram -->
  <g fill="none" stroke="${strokeColor}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Shape (Abstract Capital A) -->
    <path d="M 28 96 L 52 36 L 76 96" />
    
    <!-- Right Shape (The N) -->
    <!-- Main rising diagonal -->
    <path d="M 76 96 L 92 56" />
    ${isParallel 
      ? `<!-- Detached parallel rising segment -->
    <path d="M 96 46 L 104 26" />`
      : `<!-- Detached symmetrical descending segment -->
    <path d="M 94 32 L 100 47" />`
    }
  </g>
</svg>`;
  };

  const handleCopySvg = (type: 'parallel' | 'symmetric') => {
    const svgStr = getSvgString(type, logoTheme, strokeThickness);
    navigator.clipboard.writeText(svgStr);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleDownloadSVG = (type: 'parallel' | 'symmetric') => {
    const svgStr = getSvgString(type, logoTheme, strokeThickness);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aan_logo_${type}_${logoTheme}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = (type: 'parallel' | 'symmetric') => {
    const svgStr = getSvgString(type, logoTheme, strokeThickness);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (logoBg === 'dark') {
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, 512, 512);
    } else if (logoBg === 'light') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);
    }

    const img = new Image();
    const encodedSvg = btoa(unescape(encodeURIComponent(svgStr)));
    img.src = 'data:image/svg+xml;base64,' + encodedSvg;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      try {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `aan_logo_${type}_${logoTheme}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('PNG conversion failed:', err);
      }
    };
  };

  // Main high level categories
  const categories = [
    { id: "docs", label: "Core Platform & APIs", icon: BookOpen, desc: "Developer docs, REST specifications, and SDK references." },
    { id: "security", label: "Trust & Security Hub", icon: ShieldCheck, desc: "Sovereign data principles and vulnerability disclosure board." },
    { id: "brand", label: "Brand Manual & Assets", icon: Palette, desc: "Geometric systems, lockups, and interactive vector builders." },
    { id: "enterprise", label: "Enterprise Support", icon: HeartHandshake, desc: "Licensing tiers, sales pipeline, and live ticketing desks." },
    { id: "terms", label: "Terms & Privacy", icon: Lock, desc: "System service conditions and strict minimization policies." }
  ];

  if (activeTab === 'terms') {
    return (
      <TermsOfServiceView 
        onNavigate={(page, path) => {
          if (page === 'trustdocs' && path) {
            const section = path.startsWith('/') ? path.substring(1) : path;
            const parent = mapSubSectionToCategory(section);
            setActiveTab(parent);
            setInnerSubTab(section);
          } else {
            onNavigate(page, path);
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#8c919d] flex flex-col font-sans selection:bg-emerald-500/10 selection:text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[180px] pointer-events-none" />

      {/* Global breadcrumb & anchor */}
      <div className="bg-[#08090c] border-b border-white/[0.04] py-3.5 px-6 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex gap-0.5 items-end cursor-pointer group"
            >
              <span className="w-1.5 h-3.5 bg-emerald-400 rounded-sm group-hover:bg-emerald-300 transition-all" />
              <span className="w-1.5 h-4.5 bg-white rounded-sm" />
              <span className="font-sans font-semibold text-white text-xs ml-2 tracking-tight">AAN Trust & Resource Center</span>
            </div>
            <span className="text-white/20 text-xs">/</span>
            <span className="font-mono text-[9px] bg-white/[0.02] px-2 py-0.5 rounded text-emerald-400 uppercase tracking-widest border border-white/[0.05]">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-[#646e7a] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Trust Ledger Active
            </span>
            <button 
              onClick={() => onNavigate('landing')}
              className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] text-white font-medium px-2.5 py-1 rounded-lg transition-all text-[9px] uppercase tracking-wide cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 z-10">
        
        {/* LEFT COLUMN: Clean Category Selector */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-[#08090c] border border-white/[0.04] p-4 rounded-xl sticky top-6">
            <div className="mb-4 pb-3 border-b border-white/[0.04]">
              <span className="font-mono text-[9px] text-emerald-400 tracking-wider font-semibold uppercase">Resource Directory</span>
              <h2 className="text-sm font-semibold text-white tracking-tight mt-0.5">Chapters & Assets</h2>
              <p className="text-[10px] text-[#646e7a] mt-1 leading-relaxed">Select a category to view specifications, live vectors, or sandbox environments.</p>
            </div>

            <nav className="flex flex-col gap-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left font-sans text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-500/[0.03] border border-emerald-500/[0.12] text-white font-medium shadow-sm' 
                        : 'border border-transparent text-[#646e7a] hover:text-slate-300 hover:bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-[#404652] group-hover:text-slate-400'}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <ArrowRight className={`w-3 h-3 transition-transform ${isActive ? 'text-emerald-400 translate-x-0.5' : 'text-transparent group-hover:text-[#404652]'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT COLUMN: Streamlined Bento Space */}
        <main className="lg:col-span-9 bg-[#08090c]/40 border border-white/[0.04] rounded-2xl p-6 md:p-8 space-y-6">
          
          {/* ==================== 1. CORE PLATFORM & APIs ==================== */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-fade-in">
              {/* Inner Tabs for Docs */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div>
                  <span className="font-mono text-[9px] text-emerald-400 tracking-wider font-bold uppercase block">Chapter 01</span>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Core Platform & APIs</h1>
                </div>
                
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04] text-[10px] font-mono">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'api-ref', label: 'API Reference' },
                    { id: 'sdks', label: 'SDK Downloads' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setInnerSubTab(sub.id)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        innerSubTab === sub.id
                          ? 'bg-white/[0.03] text-white font-medium border border-white/[0.06]'
                          : 'text-[#646e7a] hover:text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-tab 1A: Overview */}
              {innerSubTab === 'overview' && (
                <div className="space-y-6">
                  <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl font-mono text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between items-center text-[#646e7a] pb-2 border-b border-white/[0.04] text-[10px]">
                      <span>SYSTEM ARCHITECTURE SUMMARY</span>
                      <span className="text-emerald-400 font-bold">VERSION 0.3.0</span>
                    </div>
                    <p className="leading-relaxed">
                      AAN serves as a decentralized, non-custodial humanness verification standard. It is an active decision layer that allows developers to prove client integrity instantly without permanent storage of user identifiers.
                    </p>
                  </div>

                  {/* Architecture Diagram inside a compact box */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#646e7a] uppercase font-bold block">Telemetry & Proof Sync Cycle</span>
                    <pre className="bg-black/80 border border-white/[0.03] p-4 rounded-xl font-mono text-[9.5px] text-emerald-400 overflow-x-auto leading-relaxed max-h-56 select-all scrollbar-thin">
{`   [ Client Browser ] ─────────(1. Secure Handshake Request)────────> [ Your Server ]
           │                                                                 │
    (2. Evaluates local                                            (3. Initiates Session
    ephemeral telemetry)                                            via POST /v1/session)
           │                                                                 │
           ▼                                                                 ▼
   [ Sandbox Challenge ] <─────(4. Fires if Risk Score > 35)───── [   AAN Decision API   ]
   (Liveness verification)                                         (Calculates Risk Index)
           │                                                                 │
           └───────────────────(5. Syncs Proof Token Assertion)──────────────┘`}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                      <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest block font-bold">1. LOW RISK (PASS)</span>
                      <p className="text-[10px] text-[#646e7a] leading-relaxed">Instanteless validation. Zero secondary user checkpoints required.</p>
                    </div>
                    <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                      <span className="font-mono text-[9px] text-amber-400 uppercase tracking-widest block font-bold">2. CHALLENGE STATE</span>
                      <p className="text-[10px] text-[#646e7a] leading-relaxed">Requires user to solve an enabled verification factor (Passkey, Liveness).</p>
                    </div>
                    <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                      <span className="font-mono text-[9px] text-rose-400 uppercase tracking-widest block font-bold">3. BLOCKSTATE</span>
                      <p className="text-[10px] text-[#646e7a] leading-relaxed">Automatic token revocation. Records telemetry risk hash to ledger.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 1B: API Reference */}
              {innerSubTab === 'api-ref' && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                    <span className="text-[#646e7a]">Base URI: <code className="text-white bg-black/40 px-2 py-0.5 rounded border border-white/[0.04]">https://api.aan.trust/v1</code></span>
                    <span className="text-emerald-400">Auth: Bearer SHA-256 Key</span>
                  </div>

                  {/* API endpoint list inside a compact, zero-scroll container if possible, or nicely styled accordion */}
                  <div className="space-y-3">
                    {/* Endpoint 1 */}
                    <div className="p-4 bg-black/40 border border-white/[0.03] rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">POST</span>
                        <code className="text-white text-xs font-semibold font-mono">/session</code>
                        <span className="text-[#646e7a] text-[10px] font-mono ml-auto">Establishes User Session</span>
                      </div>
                      <p className="text-[11px] text-[#646e7a]">Mints a fresh, short-lived verification token (vss_*) with defined lifetimes.</p>
                      <pre className="bg-black/60 p-2.5 rounded border border-white/[0.04] font-mono text-[9.5px] text-emerald-400/80 overflow-x-auto leading-relaxed select-all">
{`// REQUEST PAYLOAD
{ "lifetime_seconds": 600, "metadata": { "origin": "auth_frame" } }

// RESPONSE SUCCESS (200 OK)
{ "session_token": "vss_a8d7fc9d3", "expires_at": "2026-07-04T18:10:00Z" }`}
                      </pre>
                    </div>

                    {/* Endpoint 2 */}
                    <div className="p-4 bg-black/40 border border-white/[0.03] rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">POST</span>
                        <code className="text-white text-xs font-semibold font-mono">/verify</code>
                        <span className="text-[#646e7a] text-[10px] font-mono ml-auto">Checks Score</span>
                      </div>
                      <p className="text-[11px] text-[#646e7a]">Evaluates structural telemetry payload and signs a cryptographic proof claim.</p>
                      <pre className="bg-black/60 p-2.5 rounded border border-white/[0.04] font-mono text-[9.5px] text-emerald-400/80 overflow-x-auto leading-relaxed select-all">
{`// REQUEST PAYLOAD
{ "session_token": "vss_a8d7fc9d3", "client_ip": "198.51.100.4" }

// RESPONSE SUCCESS (200 OK)
{ "qualified": true, "risk_score": 12, "proof_token": "proof_sig_83f..." }`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 1C: SDK Downloads */}
              {innerSubTab === 'sdks' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#646e7a] border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-white font-mono text-[10px]">
                          <th className="py-2.5">SDK PLATFORM</th>
                          <th className="py-2.5">VERSION</th>
                          <th className="py-2.5">SIZE</th>
                          <th className="py-2.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Web SDK (Vanilla ES6)", ver: "v2.1.4", size: "12.4 KB" },
                          { name: "React Web Wrapper", ver: "v2.1.0", size: "8.2 KB" },
                          { name: "Node.js Server Helper", ver: "v1.4.1", size: "14.1 KB" }
                        ].map((sdk, idx) => (
                          <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                            <td className="py-3 text-white font-medium">{sdk.name}</td>
                            <td className="py-3 font-mono text-[#646e7a]">{sdk.ver}</td>
                            <td className="py-3 font-mono text-[#646e7a]">{sdk.size}</td>
                            <td className="py-3 text-right">
                              <button className="text-emerald-400 hover:text-emerald-300 font-mono text-[10px] font-bold uppercase cursor-pointer">
                                Download ZIP
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-white" />
                      <div>
                        <h4 className="text-white font-medium">Looking for public repositories?</h4>
                        <p className="text-[10px] text-[#646e7a] mt-0.5">Explore our open-source adapters and integrations.</p>
                      </div>
                    </div>
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-white font-mono text-[10px] font-bold uppercase transition-all"
                    >
                      <span>Visit GitHub</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 2. TRUST & SECURITY HUB ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div>
                  <span className="font-mono text-[9px] text-emerald-400 tracking-wider font-bold uppercase block">Chapter 02</span>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Trust & Security Hub</h1>
                </div>
                
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04] text-[10px] font-mono">
                  {[
                    { id: 'standards', label: 'Security Standards' },
                    { id: 'vulnerabilities', label: 'Disclosures' },
                    { id: 'submit-bounty', label: 'Submit Report' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setInnerSubTab(sub.id)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        innerSubTab === sub.id
                          ? 'bg-white/[0.03] text-white font-medium border border-white/[0.06]'
                          : 'text-[#646e7a] hover:text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {innerSubTab === 'standards' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Strict Minimization</h3>
                      <p className="text-[11px] text-[#646e7a] leading-relaxed">
                        Telemetry points collected during handshakes reside inside volatile session caches and expire completely in 10 minutes. Zero biometrics or static identity files are written.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Database className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Ephemeral Proof Ledger</h3>
                      <p className="text-[11px] text-[#646e7a] leading-relaxed">
                        Rather than tracking individual users, our network writes temporary SHA-256 state hashes. It evaluates whether a user is distinct, preventing Sybil attacks safely.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/[0.01] border border-emerald-500/[0.06] rounded-xl">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Network Trust Status
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-[10px]">
                      <div className="bg-black/30 p-2.5 rounded border border-white/[0.03]">
                        <span className="text-[#646e7a] block text-[8px] uppercase">API Latency</span>
                        <span className="text-emerald-400 font-bold mt-1 block">18ms (Avg)</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded border border-white/[0.03]">
                        <span className="text-[#646e7a] block text-[8px] uppercase">Proof Syncs</span>
                        <span className="text-emerald-400 font-bold mt-1 block">99.998% Success</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded border border-white/[0.03]">
                        <span className="text-[#646e7a] block text-[8px] uppercase">Core Audit</span>
                        <span className="text-emerald-400 font-bold mt-1 block">Pass (SOC 2 Type II)</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded border border-white/[0.03]">
                        <span className="text-[#646e7a] block text-[8px] uppercase">Active Nodes</span>
                        <span className="text-emerald-400 font-bold mt-1 block">128/128 Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {innerSubTab === 'vulnerabilities' && (
                <div className="space-y-4">
                  {/* Lookup tools */}
                  <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Researcher Report Tracking</h4>
                    <p className="text-[10px] text-[#646e7a]">If you submitted a vulnerability report, enter your contact email below to check the real-time review, triage, and payout status.</p>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={lookupEmail}
                        onChange={(e) => setLookupEmail(e.target.value)}
                        placeholder="researcher@example.com"
                        className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                      />
                      <button 
                        onClick={handleLookup}
                        disabled={isLookingUp}
                        className="bg-white text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check Status'}
                      </button>
                    </div>
                  </div>

                  {/* Lookup results */}
                  {lookupResults.length > 0 && (
                    <div className="space-y-2 bg-emerald-500/[0.02] border border-emerald-500/[0.12] p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Found Reports ({lookupResults.length})</h4>
                      {lookupResults.map((report) => (
                        <div key={report.id} className="bg-black/30 p-3 rounded-lg border border-white/[0.04] flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-emerald-400 font-bold mr-2">[{report.id}]</span>
                            <span className="text-white font-sans">{report.title}</span>
                          </div>
                          <span className="text-[#646e7a] capitalize">{report.status} (${report.bounty_amount})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Disclosure feed */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#646e7a] uppercase font-bold block">Global Bug Bounty Disclosures Feed (Anonymous)</span>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                      {bountyReportsList.length === 0 ? (
                        <div className="p-4 bg-white/[0.01] border border-white/[0.04] text-center rounded-xl text-xs text-[#646e7a] font-mono">
                          No reports submitted yet.
                        </div>
                      ) : (
                        bountyReportsList.map((rep) => {
                          const parts = rep.reporter_contact.split('@');
                          const anonEmail = parts[0].substring(0, 2) + '***@' + (parts[1] || 'domain.com');
                          return (
                            <div key={rep.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-lg font-mono text-[10px]">
                              <div className="flex items-center gap-2">
                                <span className="text-[#404652]">[{rep.id}]</span>
                                <span className="text-white truncate max-w-[200px] md:max-w-md">{rep.title}</span>
                                <span className="text-[#646e7a] hidden sm:inline">by {anonEmail}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-400 font-bold">${rep.bounty_amount}</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] uppercase">{rep.status}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {innerSubTab === 'submit-bounty' && (
                <form onSubmit={handleBountySubmit} className="space-y-4">
                  {bountySubmitted ? (
                    <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/[0.12] rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-white font-medium">Report Successfully Logged</h4>
                      <p className="text-xs text-[#646e7a]">Vulnerability ID: <code className="text-emerald-400 font-mono">{submittedBounty?.id}</code>. Our engineers will review within 24 hours.</p>
                      <button 
                        type="button"
                        onClick={() => setBountySubmitted(false)}
                        className="bg-white text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg mt-2 cursor-pointer"
                      >
                        Submit Another
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Report Title *</label>
                          <input 
                            type="text" 
                            required
                            value={bountyForm.title}
                            onChange={(e) => setBountyForm({ ...bountyForm, title: e.target.value })}
                            placeholder="SQL injection in /api/v1 endpoint"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Affected Component *</label>
                          <input 
                            type="text" 
                            required
                            value={bountyForm.affected_system}
                            onChange={(e) => setBountyForm({ ...bountyForm, affected_system: e.target.value })}
                            placeholder="/verify endpoint, sandbox-sdk, etc."
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Researcher Email *</label>
                          <input 
                            type="email" 
                            required
                            value={bountyForm.reporter_contact}
                            onChange={(e) => setBountyForm({ ...bountyForm, reporter_contact: e.target.value })}
                            placeholder="security@example.com"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Severity & Category</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={bountyForm.severity}
                              onChange={(e) => setBountyForm({ ...bountyForm, severity: e.target.value })}
                              className="bg-black border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="low">Low Severity</option>
                              <option value="medium">Medium Severity</option>
                              <option value="high">High Severity</option>
                              <option value="critical">Critical Severity</option>
                            </select>

                            <select 
                              value={bountyForm.category}
                              onChange={(e) => setBountyForm({ ...bountyForm, category: e.target.value })}
                              className="bg-black border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="authentication_bypass">Auth Bypass</option>
                              <option value="data_disclosure">Data Leak</option>
                              <option value="denial_of_service">DoS Vector</option>
                              <option value="rce">Remote Code Exec</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Reproduction Steps *</label>
                          <textarea 
                            required
                            rows={3}
                            value={bountyForm.reproduction_steps}
                            onChange={(e) => setBountyForm({ ...bountyForm, reproduction_steps: e.target.value })}
                            placeholder="1. Send custom header X-Payload to /v1/verify..."
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40 resize-none font-mono"
                          />
                        </div>

                        {bountyError && <div className="text-xs text-rose-400 font-mono">{bountyError}</div>}

                        <button 
                          type="submit"
                          disabled={submittingBounty}
                          className="w-full bg-white text-slate-950 hover:bg-slate-200 transition-all font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {submittingBounty ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'File Security Report'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* ==================== 3. BRAND MANUAL & ASSETS ==================== */}
          {activeTab === 'brand' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div>
                  <span className="font-mono text-[9px] text-emerald-400 tracking-wider font-bold uppercase block">Chapter 03</span>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Logo & Brand Assets Recreation</h1>
                </div>
                
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04] text-[10px] font-mono">
                  {[
                    { id: 'sandbox', label: 'Master Sandbox' },
                    { id: 'geometry', label: 'Geometry Spec' },
                    { id: 'favicon', label: 'Launcher Icons' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setInnerSubTab(sub.id)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        innerSubTab === sub.id
                          ? 'bg-white/[0.03] text-white font-medium border border-white/[0.06]'
                          : 'text-[#646e7a] hover:text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {innerSubTab === 'sandbox' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Visualizer Panel */}
                    <div className="md:col-span-7 flex flex-col items-center justify-center p-6 bg-black/60 border border-white/[0.04] rounded-2xl relative min-h-[220px] group overflow-hidden">
                      <div 
                        className={`absolute inset-0 transition-colors duration-300 ${
                          logoBg === 'dark' ? 'bg-[#050507]' : logoBg === 'light' ? 'bg-white' : 'bg-transparent'
                        }`}
                        style={logoBg === 'transparent' ? {
                          backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%)',
                          backgroundSize: '16px 16px',
                          backgroundColor: '#050507'
                        } : {}}
                      />
                      
                      <div className="relative z-10 flex items-center justify-center w-36 h-36">
                        <svg viewBox="0 0 128 128" className="w-full h-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                          <g 
                            fill="none" 
                            stroke={logoTheme === 'emerald' ? '#00E676' : logoTheme === 'white' ? '#FFFFFF' : '#000000'} 
                            strokeWidth={strokeThickness} 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M 28 96 L 52 36 L 76 96" />
                            <path d="M 76 96 L 92 56" />
                            {logoType === 'parallel' ? (
                              <path d="M 96 46 L 104 26" />
                            ) : (
                              <path d="M 94 32 L 100 47" />
                            )}
                          </g>
                        </svg>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-[#646e7a] z-10 bg-black/80 py-1 px-2.5 rounded border border-white/[0.04]">
                        <span>CANVAS: 128x128 PX</span>
                        <span>STROKE: {strokeThickness}PX</span>
                        <span className="uppercase">{logoType} ASCENT</span>
                      </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="p-4 bg-[#08090c] border border-white/[0.04] rounded-xl space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-[#646e7a] uppercase tracking-wider block">Geometric Slant</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setLogoType('parallel')}
                              className={`py-1.5 px-2.5 text-center rounded-lg border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                                logoType === 'parallel'
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                  : 'border-white/[0.06] text-[#646e7a] hover:text-slate-300'
                              }`}
                            >
                              Parallel Ascent
                            </button>
                            <button
                              onClick={() => setLogoType('symmetric')}
                              className={`py-1.5 px-2.5 text-center rounded-lg border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                                logoType === 'symmetric'
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                  : 'border-white/[0.06] text-[#646e7a] hover:text-slate-300'
                              }`}
                            >
                              Symmetric Cadence
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-[#646e7a] uppercase block">Color Palette</span>
                          <div className="flex gap-2 font-mono text-[10px]">
                            {[
                              { id: 'emerald', bg: 'bg-[#00E676]', text: 'Emerald' },
                              { id: 'white', bg: 'bg-white', text: 'White' },
                              { id: 'black', bg: 'bg-black border border-white/[0.1]', text: 'Black' }
                            ].map((thm) => (
                              <button
                                key={thm.id}
                                onClick={() => setLogoTheme(thm.id as any)}
                                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md border transition-all cursor-pointer ${
                                  logoTheme === thm.id
                                    ? 'bg-white/[0.03] border-white/[0.12] text-white font-semibold'
                                    : 'border-transparent text-[#646e7a] hover:text-slate-300'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${thm.bg}`} />
                                {thm.text}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-[#646e7a] uppercase block">Preview Backing</span>
                          <div className="flex gap-2 font-mono text-[10px]">
                            {[
                              { id: 'dark', label: 'Matte Dark' },
                              { id: 'transparent', label: 'Grid Transparency' }
                            ].map((bg) => (
                              <button
                                key={bg.id}
                                onClick={() => setLogoBg(bg.id as any)}
                                className={`py-1 px-2.5 rounded-md border transition-all cursor-pointer ${
                                  logoBg === bg.id
                                    ? 'bg-white/[0.03] border-white/[0.12] text-white font-semibold'
                                    : 'border-transparent text-[#646e7a] hover:text-slate-300'
                                }`}
                              >
                                {bg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#646e7a] uppercase">Stroke Width</span>
                            <span className="text-emerald-400 font-bold">{strokeThickness} px</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="18"
                            value={strokeThickness}
                            onChange={(e) => setStrokeThickness(parseInt(e.target.value))}
                            className="w-full accent-emerald-400 bg-black/80 h-1.5 rounded-lg appearance-none cursor-pointer border border-white/[0.04]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
                          <button
                            onClick={() => handleDownloadSVG(logoType)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-white text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-emerald-400" />
                            SVG Output
                          </button>
                          <button
                            onClick={() => handleDownloadPNG(logoType)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-white text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-emerald-400" />
                            PNG Output
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copyable code panel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#646e7a] uppercase font-semibold">SVG Master XML Source</span>
                      <button
                        onClick={() => handleCopySvg(logoType)}
                        className="flex items-center gap-1 text-[#646e7a] hover:text-emerald-400 cursor-pointer"
                      >
                        {copiedSvg ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            Copied Source!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy XML
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-black/80 p-3 rounded-xl border border-white/[0.04] overflow-x-auto text-[9px] font-mono text-emerald-400/80 leading-normal max-h-36 whitespace-pre scrollbar-thin select-all">
                      {getSvgString(logoType, logoTheme, strokeThickness)}
                    </div>
                  </div>
                </div>
              )}

              {innerSubTab === 'geometry' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="p-4 bg-black/60 border border-white/[0.04] rounded-2xl flex flex-col items-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(to right, #00E676 1px, transparent 1px), linear-gradient(to bottom, #00E676 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} />
                    
                    <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase self-start mb-3 border-l-2 border-emerald-500 pl-2">
                      SPECIFICATION BLUEPRINT • CONSTRAINTS
                    </span>

                    <div className="w-48 h-48 relative flex items-center justify-center p-3 bg-black/40 rounded-xl border border-white/[0.03]">
                      <svg viewBox="0 0 128 128" className="w-full h-full">
                        <g stroke="#00E676" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3">
                          <line x1="10" y1="96" x2="118" y2="96" />
                          <line x1="10" y1="36" x2="118" y2="36" />
                          <line x1="28" y1="10" x2="28" y2="118" />
                          <line x1="52" y1="10" x2="52" y2="118" />
                          <line x1="76" y1="10" x2="76" y2="118" />
                        </g>

                        <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                          <path d="M 28 96 L 52 36 L 76 96" />
                          <path d="M 76 96 L 92 56" />
                          {logoType === 'parallel' ? (
                            <path d="M 96 46 L 104 26" />
                          ) : (
                            <path d="M 94 32 L 100 47" />
                          )}
                        </g>

                        <g stroke="#ff5252" strokeWidth="1">
                          <circle cx="52" cy="36" r="2" fill="#ff5252" />
                          <circle cx="76" cy="96" r="2" fill="#ff5252" />
                          <circle cx="28" cy="96" r="2" fill="#ff5252" />
                        </g>

                        <g fill="#00E676" fontSize="5.5" fontFamily="monospace" opacity="0.9">
                          <text x="35" y="92">60°</text>
                          <text x="56" y="34">Apex (52,36)</text>
                          <text x="78" y="100">Base (76,96)</text>
                          <text x="8" y="100">Y=96</text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  <div className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/[0.04] pb-2">Geometric Guidelines</h3>
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <h4 className="text-white font-medium">1. The 60° Standard Axis</h4>
                        <p className="text-[11px] text-[#646e7a] mt-0.5 leading-relaxed">All diagonal bars align strictly to a 60-degree slant (±2.5dy slope). This maintains structural parity between the capital A and N.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">2. The Ephemeral 12px Stroke</h4>
                        <p className="text-[11px] text-[#646e7a] mt-0.5 leading-relaxed">A 12px stroke on a 128px canvas represents a precise 9.375% weight ratio, preserving optical weight and balanced negative space.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {innerSubTab === 'favicon' && (
                <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Launcher & Icon Outputs</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#050507] border border-white/[0.06] rounded-[22.5%] flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 128 128" className="w-10 h-10">
                          <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 28 96 L 52 36 L 76 96" />
                            <path d="M 76 96 L 92 56" />
                            <path d="M 96 46 L 104 26" />
                          </g>
                        </svg>
                      </div>
                      <span className="font-mono text-[9px] text-[#646e7a]">iOS Squircle (180px)</span>
                    </div>

                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#050507] border border-white/[0.06] rounded-full flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 128 128" className="w-10 h-10">
                          <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 28 96 L 52 36 L 76 96" />
                            <path d="M 76 96 L 92 56" />
                            <path d="M 96 46 L 104 26" />
                          </g>
                        </svg>
                      </div>
                      <span className="font-mono text-[9px] text-[#646e7a]">Android Circle (192px)</span>
                    </div>

                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#050507] border border-white/[0.06] rounded-lg flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 128 128" className="w-8 h-8">
                          <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 28 96 L 52 36 L 76 96" />
                            <path d="M 76 96 L 92 56" />
                            <path d="M 96 46 L 104 26" />
                          </g>
                        </svg>
                      </div>
                      <span className="font-mono text-[9px] text-[#646e7a]">Browser Tab (32px)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. ENTERPRISE & SUPPORT ==================== */}
          {activeTab === 'enterprise' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div>
                  <span className="font-mono text-[9px] text-emerald-400 tracking-wider font-bold uppercase block">Chapter 04</span>
                  <h1 className="text-xl font-semibold text-white tracking-tight">Enterprise & Support</h1>
                </div>
                
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04] text-[10px] font-mono">
                  {[
                    { id: 'pricing', label: 'Access Tiers' },
                    { id: 'support', label: 'Ticketing Desk' },
                    { id: 'contact', label: 'Contact Sales' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setInnerSubTab(sub.id)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        innerSubTab === sub.id
                          ? 'bg-white/[0.03] text-white font-medium border border-white/[0.06]'
                          : 'text-[#646e7a] hover:text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {innerSubTab === 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-4">
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Developer Sandbox</span>
                      <h3 className="text-lg font-semibold text-white mt-2">$0 <span className="text-xs text-[#646e7a] font-normal">/ non-commercial</span></h3>
                      <p className="text-[11px] text-[#646e7a] mt-1">Perfect for evaluating liveness checkpoints and checking webhook models.</p>
                    </div>
                    <ul className="text-[11px] text-[#646e7a] space-y-1.5 font-mono list-disc pl-3.5">
                      <li>100 session checks / hr</li>
                      <li>Standard support</li>
                      <li>Ephemeral sync logs</li>
                    </ul>
                  </div>

                  <div className="p-5 bg-white/[0.01] border border-emerald-500/20 rounded-2xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-emerald-400 text-slate-950 font-bold font-mono text-[8px] px-2 py-0.5 rounded uppercase">Enterprise Preferred</div>
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Sovereign Cluster</span>
                      <h3 className="text-lg font-semibold text-white mt-2">Volume Based <span className="text-xs text-[#646e7a] font-normal">/ negotiated</span></h3>
                      <p className="text-[11px] text-[#646e7a] mt-1">Dedicated decision clusters with customized SLA, WebAuthn, and liveness policies.</p>
                    </div>
                    <ul className="text-[11px] text-[#646e7a] space-y-1.5 font-mono list-disc pl-3.5">
                      <li>Sub-millisecond verification</li>
                      <li>Custom audit templates</li>
                      <li>99.99% operational SLA</li>
                    </ul>
                  </div>
                </div>
              )}

              {innerSubTab === 'support' && (
                <div className="space-y-4">
                  <form onSubmit={handleTicketSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Ticket Title *</label>
                        <input 
                          type="text" 
                          required
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                          placeholder="Cannot read verify logs on dashboard"
                          className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Depth Level</label>
                        <select 
                          value={newTicket.depth}
                          onChange={(e) => setNewTicket({ ...newTicket, depth: e.target.value })}
                          className="w-full bg-black border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="developer">Developer Integration</option>
                          <option value="sysadmin">System Administrator</option>
                          <option value="compliance">Compliance Officer</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Describe Issue *</label>
                        <textarea 
                          required
                          rows={2}
                          value={newTicket.text}
                          onChange={(e) => setNewTicket({ ...newTicket, text: e.target.value })}
                          placeholder="My Webhook keeps returning 403. How can I sync the certificate standard?"
                          className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40 resize-none font-mono"
                        />
                      </div>

                      {ticketSuccess && (
                        <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ticket simulated & queued successfully!
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full bg-white text-slate-950 hover:bg-slate-200 transition-all font-bold text-xs py-2 rounded-lg cursor-pointer"
                      >
                        Submit Support Ticket
                      </button>
                    </div>
                  </form>

                  {/* Active Simulated Tickets list */}
                  {tickets.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/[0.04]">
                      <span className="text-[9px] font-mono text-[#646e7a] uppercase font-bold">Simulated Open Queue ({tickets.length})</span>
                      <div className="space-y-1.5">
                        {tickets.map((t) => (
                          <div key={t.id} className="p-3 bg-black/30 border border-white/[0.04] rounded-lg flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="text-emerald-400 font-bold mr-2">[{t.id}]</span>
                              <span className="text-white font-sans">{t.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#646e7a] text-[10px]">{t.created}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] uppercase">{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {innerSubTab === 'contact' && (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  {contactSubmitted ? (
                    <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/[0.12] rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-white font-medium">Sales Pipeline Connected</h4>
                      <p className="text-xs text-[#646e7a]">Thank you. An AAN accounts representative will email you shortly.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Your Name *</label>
                          <input 
                            type="text" 
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Alex Mercer"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Work Email *</label>
                          <input 
                            type="email" 
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="alex@organization.com"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Organization *</label>
                          <input 
                            type="text" 
                            required
                            value={contactForm.organization}
                            onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                            placeholder="Mercer Industries"
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#646e7a]">Message *</label>
                          <input 
                            type="text" 
                            required
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="We need to verify 10,000 users/day with custom WebAuthn logic."
                            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-white text-slate-950 hover:bg-slate-200 transition-all font-bold text-xs py-2 rounded-lg cursor-pointer"
                        >
                          Request API Token Access
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

        </main>
      </div>

      <footer className="bg-[#08090c] border-t border-white/[0.04] py-6 text-center text-xs font-mono text-[#404652] z-10">
        © 2026 AAN Trust Infrastructure. Safe, decoupled proof-of-human middleware.
      </footer>

    </div>
  );
}
