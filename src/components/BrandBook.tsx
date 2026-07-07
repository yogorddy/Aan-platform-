import React, { useState } from 'react';
import { 
  Target, 
  Users, 
  Layers, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  ArrowRight, 
  Clock, 
  Info,
  ChevronRight,
  TrendingUp,
  Share2,
  Download,
  Grid,
  Eye,
  RefreshCw,
  Palette
} from 'lucide-react';

// Definitions for the AAN Brand Identity System
interface BrandSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
}

export default function BrandBook() {
  const [activeTab, setActiveTab] = useState<string>('foundation');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Logo Sandbox States
  const [logoTheme, setLogoTheme] = useState<'emerald' | 'white' | 'black'>('emerald');
  const [logoBg, setLogoBg] = useState<'dark' | 'light' | 'transparent'>('dark');
  const logoType = 'parallel';
  const [strokeThickness, setStrokeThickness] = useState<number>(12);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<'master' | 'spacing' | 'lockups' | 'favicon'>('master');

  const sections: BrandSection[] = [
    { id: 'foundation', title: '1. Brand Foundation', subtitle: 'Mission, Promise & Core Positionings', icon: Target },
    { id: 'audience', title: '2. Target Audience', subtitle: 'Deep Customer Personas per Segment', icon: Users },
    { id: 'architecture', title: '3. Product Architecture', subtitle: 'Ecosystem & SDK Definitions', icon: Layers },
    { id: 'story', title: '4. Company Story', subtitle: 'Origin Narrative & Foundational Urgency', icon: Clock },
    { id: 'future', title: '5. 10-Year Roadmap', subtitle: 'The Future of Sovereign Digital Trust', icon: TrendingUp },
    { id: 'assets', title: '6. Logo & Brand Assets', subtitle: 'SVG Master, Lockups & Spacing Guide', icon: FileCode },
  ];

  const handleCopyToken = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getSvgString = (type: 'parallel' | 'symmetric', theme: 'emerald' | 'white' | 'black', thickness: number) => {
    const strokeColor = theme === 'emerald' ? '#00E676' : theme === 'white' ? '#FFFFFF' : '#000000';
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <!-- AAN Master Logo Symbol - Geometric Monogram -->
  <g fill="none" stroke="${strokeColor}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 28 96 L 52 36 L 68 76" />
    <path d="M 68 80 L 92 20 L 108 60" />
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

    // Draw background if not transparent
    if (logoBg === 'dark') {
      ctx.fillStyle = '#0D1117';
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

  // Filter sections by search query
  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Brand Core Hero Banner */}
      <div className="relative border-b border-slate-900 bg-[#080b11] overflow-hidden py-16 px-6">
        {/* Ambient grids and lighting */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080b11_1px,transparent_1px),linear-gradient(to_bottom,#080b11_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[150px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[100px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-widest text-blue-400 bg-blue-950/60 border border-blue-950 px-2.5 py-0.5 rounded-full uppercase font-bold">
                Identity Manual
              </span>
              <span className="text-slate-500 font-mono text-[11px]">v2.10 • RESTRICTED CIRCULATION</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white">
              AAN Brand Core
            </h1>
            <p className="text-slate-400 mt-2.5 text-sm max-w-xl leading-relaxed">
              The complete strategy, verbal positioning, visual grammar, and architectural blueprints for AAN: the digital trust infrastructure layer of the modern sovereign web.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Identity Guide..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-md focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
            <button 
              onClick={() => handleCopyToken('manual_share', 'AAN Digital Trust Brand System v2.10')}
              className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-mono font-medium border border-slate-800 px-4 py-2.5 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" /> Share System
            </button>
          </div>
        </div>
      </div>

      {/* Main Structural Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-2">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase mb-2 px-2.5">
            Chapters & Documents
          </div>
          <div className="space-y-1">
            {filteredSections.map((sec) => {
              const IconComponent = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg flex items-start gap-3.5 transition-all group ${
                    isActive 
                      ? 'bg-blue-600/10 border-l-2 border-blue-500 text-white shadow-sm' 
                      : 'bg-transparent border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <IconComponent className={`w-4.5 h-4.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <div>
                    <div className="font-sans font-semibold text-xs leading-none">
                      {sec.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {sec.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-slate-900/30 border border-slate-900 rounded-xl">
            <div className="flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-300 block">THE "AAN" VERBAL MANDATE</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  AAN is never expanded into an acronym. It stands standalone. It represents absolute digital sovereignty. Use only the clean, bold monogram variations specified in Section 6.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-slate-900/20 border border-slate-900 p-6 md:p-10 rounded-2xl relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

          {/* CHAPTER 1: FOUNDATION */}
          {activeTab === 'foundation' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 01</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Brand Foundation</h2>
                <p className="text-slate-400 text-sm mt-1">Defining the purpose, vision, and core alignment of AAN.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-900/50 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Myopic Focus: The Mission</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To enable digital interactions to begin with confidence, establishing a sovereign framework where authenticity is verified without compromising participant privacy or collecting personal data.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/50 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">The Long View: The Vision</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    An ecosystem where trust is earned dynamically through verifiable authenticity, serving as a global standard that remains neutral to specific industries and markets.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-300 border-b border-slate-800/60 pb-2">Primary Positioning Framework</h3>
                
                <div className="space-y-4 text-xs text-slate-400">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Purpose</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      To establish a neutral trust layer for the digital ecosystem, enabling communities, systems, and platforms to interact with absolute confidence.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Promise</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      We verify digital authenticity continuously and non-custodially, ensuring interactions are authentic and private by default.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Positioning</span>
                    <span className="col-span-2 leading-relaxed text-slate-300 font-mono">
                      "Stripe is for secure payments. Cloudflare is for network routing. AAN is for verifiable digital trust."
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">One-Sentence Pitch</span>
                    <span className="col-span-2 leading-relaxed text-slate-300 font-bold text-white">
                      AAN represents the sovereign standard for digital trust, allowing platforms to establish the authenticity and uniqueness of their interactions neutrally.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Elevator Pitch</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      Traditional systems demand intrusive verification, trading private details for temporary access. AAN changes the model. We provide an independent, non-custodial trust standard that verifies real, unique interactions through locally-compiled cryptographic proof. Receipient nodes get absolute confidence—never raw or sensitive profiles.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl space-y-3">
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Executive Summary</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In a digital landscape overrun by synthetic interactions and automated scripts, platforms face a fatal structural challenge: how to guarantee authenticity without resorting to intrusive surveillance. 
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  <b>AAN provides the category-defining standard.</b> By decoupling trust from surveillance, AAN serves as a timeless companion to the world's most trusted technologies. Rather than catering to a single industry vertical, AAN operates neutrally across all digital interactions to guarantee privacy, authenticity, and confidence.
                </p>
              </div>
            </div>
            )}



          {/* CHAPTER 2: TARGET AUDIENCE PERSONAS */}
          {activeTab === 'audience' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 02</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Target Audience & Personas</h2>
                <p className="text-slate-400 text-sm mt-1">Ten highly specific client profiles aligning with AAN digital trust.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    segment: '1. Cloud Platforms',
                    problem: 'Explosion of automated trial abuse and fake multi-tenant profiles.',
                    goal: 'Protect compute resources and database scalability without causing onboarding friction.',
                    painPoint: 'Intrusive friction points kill signup metrics; legacy approaches are too heavy and expensive.',
                    motivation: 'To align trial signups to real unique participants cleanly.'
                  },
                  {
                    segment: '2. Financial Systems',
                    problem: 'Rapid synthetic profile creation and coordinated automated signups.',
                    goal: 'Perform quick integrity and validation matches before proceeding.',
                    painPoint: 'High rates of automated spoofing rendering legacy defense systems obsolete.',
                    motivation: 'Sovereign hardware-bound client attestation.'
                  },
                  {
                    segment: '3. Digital Marketplaces',
                    problem: 'Malicious listings, vendor multi-account review rigging, scam farm operations.',
                    goal: 'Validate each vendor account leads back to a unique active participant.',
                    painPoint: 'Forcing micro-merchants to provide complete official identification causes significant churn.',
                    motivation: 'Clean proof of unique participant status.'
                  },
                  {
                    segment: '4. Interactive Worlds',
                    problem: 'Cheat scripts, botnets farming virtual materials, complete lobby compromise.',
                    goal: 'Ensure each player is a distinct, genuine operator.',
                    painPoint: 'Hard blocks on IP or device parameters affect dormitories and households incorrectly.',
                    motivation: 'Low friction hardware-bound confirmation.'
                  },
                  {
                    segment: '5. Collaborative Environments',
                    problem: 'Credential stuffing, social engineering attacks, and fake approvals.',
                    goal: 'Add an ironclad, frictionless privacy-centric layer to access.',
                    painPoint: 'Employees resent sharing credentials or central telemetry.',
                    motivation: 'Stateless, zero-knowledge validation.'
                  },
                  {
                    segment: '6. Shared Spaces',
                    problem: 'Coordinated spam campaigns, automated manipulation of viral timelines.',
                    goal: 'Enable a "Verified Unique" filter tier for operations.',
                    painPoint: 'Users reject sharing real passports/IDs with volatile corporations.',
                    motivation: 'Pseudonymous attestation token flows.'
                  },
                  {
                    segment: '7. Health Systems',
                    problem: 'Spam appointment reservations and duplicate record files.',
                    goal: 'Secure unique returning continuity without leaking personal profiles.',
                    painPoint: 'Regulatory guidelines require perfect decoupling of personal indicators.',
                    motivation: 'Credential isolation.'
                  },
                  {
                    segment: '8. Academic Platforms',
                    problem: 'AI bots taking courses, duplicate submissions, and evaluation fraud.',
                    goal: 'Confirm student sessions correspond to verified physical students.',
                    painPoint: 'Aggressive surveillance causes anxiety and prompts major regulatory pushbacks.',
                    motivation: 'Local, secure client attestation.'
                  },
                  {
                    segment: '9. Public Institutions',
                    problem: 'Protecting secure portal entry without exposing physical databases to hackers.',
                    goal: 'Strict multi-signal risk metrics combining device profiles with localized signatures.',
                    painPoint: 'Traditional databases are constant massive targets for sovereign state threats.',
                    motivation: 'Cryptographic proof signatures.'
                  },
                  {
                    segment: '10. Digital Creators',
                    problem: 'Complex, brittle setup processes required by old legacy identity suites.',
                    goal: 'Obtain simple JSON tokens containing unambiguous proof values in 3 lines of code.',
                    painPoint: 'Integrating old SDKs takes weeks, is poorly documented, and requires sales calls.',
                    motivation: 'Pristine self-serve documentation and transparent endpoints.'
                  }
                ].map((per, idx) => (
                  <div key={idx} className="p-5 bg-slate-900/30 border border-slate-850 hover:border-blue-900/30 rounded-xl space-y-3 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 py-1 px-3 text-[10px] font-mono text-slate-500 bg-slate-900 rounded-bl border-l border-b border-slate-800">
                      PROFILE {idx + 1}
                    </div>
                    <h3 className="font-sans font-bold text-sm text-slate-200">{per.segment}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] block uppercase">Problem:</span>
                        <p className="text-slate-400 mt-0.5">{per.problem}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] block uppercase">Goal:</span>
                        <p className="text-slate-400 mt-0.5">{per.goal}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] block uppercase">Pain Point:</span>
                        <p className="text-slate-400 mt-0.5">{per.painPoint}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] block uppercase">Motivation:</span>
                        <p className="text-slate-300 mt-0.5 font-medium">{per.motivation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* CHAPTER 3: PRODUCT ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 03</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Platform Architecture & Ecosystem</h2>
                <p className="text-slate-400 text-sm mt-1">Ten modular product suites operating cleanly under the AAN corporate umbrella.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'AAN Verify', use: 'The session standard validating authenticity and user uniqueness gracefully.' },
                  { name: 'AAN Trust', use: 'A non-custodial coordination framework that establishes returning status with zero personal data leakage.' },
                  { name: 'AAN Sentinel', use: 'Protective patterns that shield digital ecosystems from coordinated synthetic interaction storms.' },
                  { name: 'AAN Console', use: 'The neutral interface displaying session summaries, system configurations, and trust statuses.' },
                  { name: 'AAN SDK', use: 'Universal client libraries enabling seamless and rapid integration of the AAN trust standard.' },
                  { name: 'AAN Connect', use: 'Pre-built widgets that offer secure entry options across decentralized spaces.' },
                  { name: 'AAN Protect', use: 'Hardware-secured cryptographic postures generated locally to safeguard user privacy.' },
                  { name: 'AAN Proof', use: 'The signature generation mechanism delivering reliable, verifiable trust tokens.' },
                  { name: 'AAN Gateway', use: 'The secure endpoint translating compiled credentials into standard confidence values.' },
                  { name: 'AAN Identity Graph', use: 'Anonymized relationship hashes mapping trust nodes cleanly without tracking users.' }
                ].map((prod, i) => (
                  <div key={i} className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl flex items-start gap-4">
                    <div className="h-8 w-8 bg-blue-950/60 rounded-lg flex items-center justify-center text-blue-400 font-mono text-[10px] font-bold flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-sans font-bold text-sm text-slate-200">{prod.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{prod.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}





          {/* CHAPTER 4: COMPANY STORY */}
          {activeTab === 'story' && (
            <div className="space-y-6 animate-fade-in text-xs text-slate-400 leading-relaxed font-sans">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 04</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Our Story & Urgency</h2>
                <p className="text-slate-400 text-sm mt-1">A story born out of privacy concerns, systems integrity, and digital sovereignty.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-200 font-medium border-b border-slate-900 pb-2 uppercase tracking-wide">The Digital Paradox</h3>
                <p>
                  In the years leading up to 2026, the internet reached a point of existential structural breakdown. With the advent of generative AI models, synthetic profiles and automated scripts became completely indistinguishable from physical biological agents. Systems were faced with a critical dilemma: either accept total bot compromise (trial leaks, ad fraud, civil syndicate spam) or demand intrusive human verification protocols that forced citizens to yield their personal documents and high-res face files.
                </p>
                <p>
                  This compromise was unacceptable. It treated human citizens as security risks, demanding that they trade sovereign privacy for digital access, creating centralized database targets for malicious hackers.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-200 font-medium border-b border-slate-900 pb-2 uppercase tracking-wide">Origin of AAN</h3>
                <p>
                  AAN was founded by a coalition of systems researchers, cryptography engineers, and privacy lawyers who realized that platform trust and user privacy do not have to be a zero-sum game. The solution was simple: verify biological uniqueness using local system checks, transform the result immediately into a highly abstract cryptographic proof, and purge the raw source data in milliseconds.
                </p>
                <p>
                  The name AAN was chosen to represent an immutable core axis of trust—a quiet, sovereign standard. We do not define ourselves with acronyms. We operate standalone, establishing the secure internet trust tier.
                </p>
              </div>

              <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3">
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">The Five Unshakable Foundation Beliefs of AAN</span>
                <ul className="space-y-2 text-slate-300">
                  <li><b>1. Trust must be verifiable:</b> Reputation metrics or marketing promises do not stop AI script networks. Trust must be validated mathematically.</li>
                  <li><b>2. Privacy is a human right:</b> No human should ever have to store their personal, biological face geometry in a centralized server to verify identity.</li>
                  <li><b>3. Stateless simplicity:</b> Good infrastructure operates like a pipe. AAN processes verify, approve, and purge raw files immediately.</li>
                  <li><b>4. Standard integration:</b> Developers must be able to configure anti-bot safeguards cleanly in 3 lines of code.</li>
                  <li><b>5. Sovereign persistence:</b> We design systems to remain uncompromised, standard-aligned, and secure for decades.</li>
                </ul>
              </div>
            </div>
          )}



          {/* CHAPTER 5: 10-YEAR ROADMAP */}
          {activeTab === 'future' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 05</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">AAN Ten-Year Product Journey</h2>
                <p className="text-slate-400 text-sm mt-1">Expanding sovereign digital trust utilities globally. Clean and structural roadmap.</p>
              </div>

              {/* Interactive Roadmap Timeline */}
              <div className="space-y-6 relative border-l border-slate-800 ml-4 pl-6 md:pl-10 text-xs">
                {[
                  {
                    phase: 'Phase 1: Seed & Uniqueness Consensus (Years 1 - 2)',
                    desc: 'Validate user uniqueness and integrate uniqueness safeguards. Secure partnerships with major SaaS and gaming channels. Release robust, headless developer client integration SDKs.',
                    status: 'Active Launch Window',
                    color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40'
                  },
                  {
                    phase: 'Phase 2: Edge Hardware Binding Gateway (Years 3 - 4)',
                    desc: 'Leverage device-bound security modules on smart handsets to pre-authorize user sessions. Completely secure returning trust flows.',
                    status: 'R&D Phase',
                    color: 'text-blue-400 border-blue-500 bg-blue-950/40'
                  },
                  {
                    phase: 'Phase 3: Decentralized Trust Consensus Protocol (Years 5 - 6)',
                    desc: 'Empower citizens to verify unique biological accounts across decentralized web frameworks. Remove external server checks entirely.',
                    status: 'Conceptualization',
                    color: 'text-purple-400 border-purple-500 bg-purple-950/40'
                  },
                  {
                    phase: 'Phase 4: Sovereign Physical Access Keys (Years 7 - 8)',
                    desc: 'Expand attestation mechanisms to physical access locks. Securing physical workspaces, events, and resources pseudonymously.',
                    status: 'Vision Alignment',
                    color: 'text-slate-500 border-slate-800 bg-slate-900/40'
                  },
                  {
                    phase: 'Phase 5: Self-Sovereign Identity Ecosystem (Years 9 - 10)',
                    desc: 'Establish AAN as a native, permanent trust tier of the global internet structure. Secured by math, controlled entirely by citizens.',
                    status: 'Ultimate Alignment',
                    color: 'text-slate-500 border-slate-800 bg-slate-900/40'
                  }
                ].map((rm, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Bullet marker */}
                    <span className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 bg-slate-950 border-2 rounded-full border-blue-500" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h4 className="font-sans font-bold text-sm text-slate-200">{rm.phase}</h4>
                      <span className={`inline-block py-0.5 px-2.5 rounded-full text-[9px] font-mono font-bold uppercase border ${rm.color}`}>
                        {rm.status}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-2xl">{rm.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 6: LOGO & BRAND ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-8 animate-fade-in text-slate-300">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wide block">CHAPTER 06</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Logo & Brand Assets Recreation</h2>
                <p className="text-slate-400 text-sm mt-1">Interactive vector recreation studio. Zero reinterpretations, 100% geometric compliance.</p>
              </div>

              {/* Sub-navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
                {[
                  { id: 'master', label: 'SVG Master Sandbox', icon: Palette },
                  { id: 'spacing', label: 'Geometry & Spacing Guide', icon: Grid },
                  { id: 'lockups', label: 'Typography & Lockups', icon: Target },
                  { id: 'favicon', label: 'Favicon & App Icon Formats', icon: Eye }
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSubTab(st.id as any)}
                      className={`flex items-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-medium font-mono transition-all duration-200 ${
                        subTab === st.id
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/20'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* SECTION A: MASTER SANDBOX */}
              {subTab === 'master' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Visualizer Panel */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 bg-slate-950/60 border border-slate-850 rounded-2xl relative group overflow-hidden">
                      {/* Grid background when transparent */}
                      <div 
                        className={`absolute inset-0 transition-colors duration-300 ${
                          logoBg === 'dark' ? 'bg-[#0D1117]' : logoBg === 'light' ? 'bg-white' : 'bg-transparent'
                        }`}
                        style={logoBg === 'transparent' ? {
                          backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                          backgroundColor: '#090d14'
                        } : {}}
                      />
                      
                      <div className="relative z-10 p-6 flex items-center justify-center min-h-[220px]">
                        <svg 
                          viewBox="0 0 128 128" 
                          className="w-48 h-48 drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300"
                        >
                          <g 
                            fill="none" 
                            stroke={logoTheme === 'emerald' ? '#00E676' : logoTheme === 'white' ? '#FFFFFF' : '#000000'} 
                            strokeWidth={strokeThickness} 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M 28 96 L 52 36 L 68 76" />
                            <path d="M 68 80 L 92 20 L 108 60" />
                          </g>
                        </svg>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-500 z-10 bg-slate-950/80 backdrop-blur-sm py-1.5 px-3 rounded-md border border-slate-900">
                        <span>CANVAS: 128 x 128 PX</span>
                        <span>STROKE: {strokeThickness}PX</span>
                        <span className="uppercase">{logoType}</span>
                      </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-2xl space-y-5">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-850">
                          <Palette className="w-3.5 h-3.5 text-emerald-400" />
                          Vector Parameters
                        </h3>

                        {/* Logo Variant Toggle (Hardlocked to Parallel Ascent) */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Geometry Slant Type</span>
                          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                            <div>
                              <div className="font-sans font-bold text-sm text-[#00E676]">Parallel Ascent</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Official Unified Monogram</div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-[#00E676] rounded text-[9px] font-mono font-semibold uppercase border border-emerald-500/20">Active Brand</span>
                          </div>
                        </div>

                        {/* Stroke Color Theme */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Symbol Accent (Stroke)</span>
                          <div className="flex gap-2">
                            {[
                              { id: 'emerald', label: 'Emerald (#00E676)', colorBg: 'bg-[#00E676]' },
                              { id: 'white', label: 'Pure White', colorBg: 'bg-white' },
                              { id: 'black', label: 'Pure Black', colorBg: 'bg-black border border-slate-700' }
                            ].map((thm) => (
                              <button
                                key={thm.id}
                                onClick={() => setLogoTheme(thm.id as any)}
                                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md border text-xs font-mono transition-all ${
                                  logoTheme === thm.id
                                    ? 'bg-slate-900 border-slate-700 text-slate-100 font-semibold'
                                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/20'
                                }`}
                              >
                                <span className={`w-2.5 h-2.5 rounded-full ${thm.colorBg}`} />
                                {thm.id === 'emerald' ? 'Emerald' : thm.id === 'white' ? 'White' : 'Black'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Canvas Background Style */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Preview Canvas BG</span>
                          <div className="flex gap-2">
                            {[
                              { id: 'dark', label: 'Dark Matte' },
                              { id: 'light', label: 'Light Matte' },
                              { id: 'transparent', label: 'Transparent' }
                            ].map((bg) => (
                              <button
                                key={bg.id}
                                onClick={() => setLogoBg(bg.id as any)}
                                className={`py-1.5 px-3 rounded-md border text-xs font-mono transition-all ${
                                  logoBg === bg.id
                                    ? 'bg-slate-900 border-slate-700 text-slate-100 font-semibold'
                                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/20'
                                }`}
                              >
                                {bg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stroke Thickness Control */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-slate-400 uppercase tracking-wider">Uniform Stroke Width</span>
                            <span className="text-emerald-400 font-bold">{strokeThickness} px</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="18"
                            value={strokeThickness}
                            onChange={(e) => setStrokeThickness(parseInt(e.target.value))}
                            className="w-full accent-emerald-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-900"
                          />
                          <div className="flex justify-between text-[9px] font-mono text-slate-500">
                            <span>8px (Fine)</span>
                            <span>12px (Default)</span>
                            <span>18px (Bold)</span>
                          </div>
                        </div>

                        {/* Export Actions */}
                        <div className="space-y-2 pt-2 border-t border-slate-850">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Production Asset Export</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDownloadSVG(logoType)}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all text-xs font-mono font-bold uppercase"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-400" />
                              Export SVG
                            </button>
                            <button
                              onClick={() => handleDownloadPNG(logoType)}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all text-xs font-mono font-bold uppercase"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" />
                              Export PNG
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copyable SVG Block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">SVG Master Code XML</span>
                      <button
                        onClick={() => handleCopySvg(logoType)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 font-mono py-1 px-2.5 rounded hover:bg-slate-900 transition-colors"
                      >
                        {copiedSvg ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            Copied Code!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy XML Code
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto text-[11px] font-mono text-slate-300 leading-normal max-h-48 whitespace-pre scrollbar-thin">
                      {getSvgString(logoType, logoTheme, strokeThickness)}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: GEOMETRY & SPACING GUIDE */}
              {subTab === 'spacing' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Blueprint Panel */}
                  <div className="lg:col-span-6 p-6 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col items-center relative overflow-hidden">
                    {/* Architectural Blueprint grid lines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} />
                    
                    <h3 className="font-mono text-[10px] text-blue-400 font-bold tracking-widest uppercase mb-4 self-start border-l-2 border-blue-500 pl-2">
                      SPECIFICATION BLUEPRINT • GEOMETRY CONSTRAINTS
                    </h3>

                    {/* SVG Blueprint Draw */}
                    <div className="w-64 h-64 relative flex items-center justify-center p-4 bg-slate-900/30 rounded-xl border border-slate-850/60 z-10">
                      <svg viewBox="0 0 128 128" className="w-full h-full">
                        {/* Blueprint construction grid */}
                        <g stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4">
                          {/* Baselines */}
                          <line x1="10" y1="96" x2="118" y2="96" />
                          <line x1="10" y1="80" x2="118" y2="80" />
                          <line x1="10" y1="76" x2="118" y2="76" />
                          <line x1="10" y1="60" x2="118" y2="60" />
                          <line x1="10" y1="36" x2="118" y2="36" />
                          <line x1="10" y1="20" x2="118" y2="20" />
                          
                          {/* Verticals for spacing */}
                          <line x1="28" y1="10" x2="28" y2="118" />
                          <line x1="52" y1="10" x2="52" y2="118" />
                          <line x1="68" y1="10" x2="68" y2="118" />
                          <line x1="92" y1="10" x2="92" y2="118" />
                          <line x1="108" y1="10" x2="108" y2="118" />
                        </g>

                        {/* Real Symbol in Blueprint Style */}
                        <g fill="none" stroke="#60a5fa" strokeWidth={strokeThickness} strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                          <path d="M 28 96 L 52 36 L 68 76" />
                          <path d="M 68 80 L 92 20 L 108 60" />
                        </g>

                        {/* Blue annotation lines & text */}
                        <g stroke="#f43f5e" strokeWidth="0.8">
                          {/* Angle indicator arc at Left base */}
                          <path d="M 38 96 A 10 10 0 0 0 35 88" fill="none" />
                          {/* Apex coordinate markers */}
                          <circle cx="52" cy="36" r="2" fill="#f43f5e" />
                          <circle cx="92" cy="20" r="2" fill="#f43f5e" />
                          <circle cx="28" cy="96" r="2" fill="#f43f5e" />
                          <circle cx="68" cy="80" r="2" fill="#f43f5e" />
                          <circle cx="68" cy="76" r="2" fill="#f43f5e" />
                          <circle cx="108" cy="60" r="2" fill="#f43f5e" />
                        </g>

                        {/* Labels (Small Text) */}
                        <g fill="#93c5fd" fontSize="5" fontFamily="monospace">
                          <text x="36" y="92">60°</text>
                          <text x="56" y="34">Apex 1 (52,36)</text>
                          <text x="80" y="16">Apex 2 (92,20)</text>
                          <text x="12" y="102">Base 1 (28,96)</text>
                          <text x="44" y="86">Base 2 (68,80)</text>
                          <text x="96" y="66">End 2 (108,60)</text>
                          
                          {/* Baseline labels */}
                          <text x="2" y="97" fill="#f43f5e" fontSize="4">Y=96</text>
                          <text x="2" y="37" fill="#f43f5e" fontSize="4">Y=36</text>
                          <text x="2" y="21" fill="#f43f5e" fontSize="4">Y=20</text>
                        </g>
                      </svg>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 mt-4 uppercase">
                      Interactive Engineering Blueprint Overlay (Y-Asymmetrical Offset)
                    </span>
                  </div>

                  {/* Spacing Explanations */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-4">
                      <h4 className="font-sans font-bold text-sm text-white border-b border-slate-850 pb-2 uppercase tracking-wide">
                        Geometric System Rules
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 h-fit">01</span>
                          <div>
                            <h5 className="font-sans font-bold text-xs text-slate-200">The 60° Angle Axis</h5>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              All diagonal bars align strictly to a 60-degree slant (slope value of exactly ±2.5dy). This creates a perfect vertical balance and allows the letterforms A and N to nestle together seamlessly.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 h-fit">02</span>
                          <div>
                            <h5 className="font-sans font-bold text-xs text-slate-200">9.375% Stroke Ratio</h5>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              The stroke thickness of 12px relative to the 128px bounding box represents a precise 9.375% ratio. Altering this value breaks the delicate balance of negative space inside the capital "A".
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 h-fit">03</span>
                          <div>
                            <h5 className="font-sans font-bold text-xs text-slate-200">Visual Tension Gap</h5>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              The detached segment's start at (96, 46) leaves an exact 10.7px gap from the top of the main diagonal bar at (92, 56). This gap is designed to reflect the visual width of the stroke itself, maintaining consistent optical density.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 h-fit">04</span>
                          <div>
                            <h5 className="font-sans font-bold text-xs text-slate-200">Astructural Minimalism</h5>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              The horizontal crossbar is completely omitted from the "A", and the left-most stem is omitted from the "N". These omissions make the monogram feel lightweight, sleek, and invisible.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: TYPOGRAPHY & LOCKUPS */}
              {subTab === 'lockups' && (
                <div className="space-y-6">
                  {/* Typographic rules summary */}
                  <div className="p-5 bg-slate-900/30 border border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-slate-100 uppercase tracking-wide">Brand Typography Lockup</h4>
                      <p className="text-slate-400 mt-1 leading-relaxed">
                        When combining the symbol with the AAN brand name, always preserve the exact geometric lockup structures. The symbol stands as a monolith of trust, accompanied by clean modern sans-serif typography.
                      </p>
                    </div>
                    <div className="space-y-2 font-mono text-slate-400 text-[11px] bg-slate-950/80 p-3.5 rounded-lg border border-slate-900">
                      <div><b className="text-slate-200">PRIMARY FONT:</b> Space Grotesk / Inter (Bold)</div>
                      <div><b className="text-slate-200">SUBTITLE FONT:</b> JetBrains Mono (Light, Uppercase)</div>
                      <div><b className="text-slate-200">TRACKING:</b> Title: tracking-wide, Sub: tracking-[0.25em]</div>
                    </div>
                  </div>

                  {/* Interactive Lockup Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Vertical Lockup */}
                    <div className="p-8 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block self-start">Vertical Lockup (Default)</span>
                      
                      <div className="py-6 flex flex-col items-center">
                        <svg viewBox="0 0 128 128" className="w-24 h-24 drop-shadow-md">
                          <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 28 96 L 52 36 L 68 76" />
                            <path d="M 68 80 L 92 20 L 108 60" />
                          </g>
                        </svg>
                        
                        <h3 className="text-3xl font-extrabold font-sans text-white tracking-wide mt-3">AAN</h3>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.25em] mt-1 font-light">TRUST INFRASTRUCTURE</p>
                      </div>
                    </div>

                    {/* Horizontal Lockup */}
                    <div className="p-8 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-4">
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block self-start">Horizontal Lockup (Navbars)</span>
                      
                      <div className="py-10 flex items-center gap-4">
                        <svg viewBox="0 0 128 128" className="w-16 h-16 drop-shadow-md">
                          <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 28 96 L 52 36 L 68 76" />
                            <path d="M 68 80 L 92 20 L 108 60" />
                          </g>
                        </svg>
                        
                        <div>
                          <h3 className="text-2xl font-extrabold font-sans text-white tracking-wide leading-none">AAN</h3>
                          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.25em] mt-1.5 font-light">TRUST INFRASTRUCTURE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D: FAVICON & APP ICON */}
              {subTab === 'favicon' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* App icon templates */}
                  <div className="lg:col-span-7 p-6 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-6 text-xs">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-850">
                      System Launcher Icons
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {/* iOS Squircle */}
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#0D1117] border border-slate-800 rounded-[22.5%] flex items-center justify-center shadow-lg shadow-black/40">
                          <svg viewBox="0 0 128 128" className="w-12 h-12">
                            <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M 28 96 L 52 36 L 68 76" />
                              <path d="M 68 80 L 92 20 L 108 60" />
                            </g>
                          </svg>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 block">iOS Squircle</span>
                      </div>

                      {/* Android Adaptive Circle */}
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#0D1117] border border-slate-800 rounded-full flex items-center justify-center shadow-lg shadow-black/40">
                          <svg viewBox="0 0 128 128" className="w-12 h-12">
                            <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M 28 96 L 52 36 L 68 76" />
                              <path d="M 68 80 L 92 20 L 108 60" />
                            </g>
                          </svg>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 block">Android Circle</span>
                      </div>

                      {/* macOS Rounded Rect */}
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#0D1117] border border-slate-850 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40 relative">
                          <div className="absolute inset-1.5 border border-white/[0.04] rounded-xl" />
                          <svg viewBox="0 0 128 128" className="w-10 h-10 z-10">
                            <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M 28 96 L 52 36 L 68 76" />
                              <path d="M 68 80 L 92 20 L 108 60" />
                            </g>
                          </svg>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 block">macOS App Icon</span>
                      </div>
                    </div>
                  </div>

                  {/* Favicon scales */}
                  <div className="lg:col-span-5 p-6 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-6">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-850">
                      Favicon Resolution Clarity
                    </h4>

                    <div className="flex flex-col gap-4">
                      {[16, 32, 48].map((size) => (
                        <div key={size} className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-xs">
                          <span className="font-mono text-[10px] text-slate-400 w-12">{size}x{size} px</span>
                          <div className="bg-[#0D1117] p-2 rounded border border-slate-800 flex items-center justify-center shadow-sm">
                            <svg viewBox="0 0 128 128" style={{ width: `${size}px`, height: `${size}px` }}>
                              <g fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M 28 96 L 52 36 L 68 76" />
                                <path d="M 68 80 L 92 20 L 108 60" />
                              </g>
                            </svg>
                          </div>
                          <span className="text-slate-500 font-sans text-[11px] leading-normal">
                            {size === 16 ? 'Browser address bar clarity.' : size === 32 ? 'Standard browser tab size.' : 'High-density desktop shortcut.'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Manual Brand Core Footer */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950/90 text-center text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="font-mono text-[10px] text-slate-300 font-bold uppercase block">AAN SOVEREIGN IDENTITY CO.</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block"> 2026 AAN. Decoupling digital trust from corporate tracking.</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            ALL INTELLECTUAL PROPERTY REGISTERED • SOC2 READY
          </div>
        </div>
      </footer>

    </div>
  );
}
