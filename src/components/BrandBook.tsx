import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  ShieldCheck, 
  Sliders, 
  Users, 
  Layers, 
  Eye, 
  Compass, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  ArrowRight, 
  Clock, 
  Globe, 
  Info,
  ChevronRight,
  TrendingUp,
  Cpu,
  Bookmark,
  Share2
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

  const sections: BrandSection[] = [
    { id: 'foundation', title: '1. Brand Foundation', subtitle: 'Mission, Promise & Core Positionings', icon: Target },
    { id: 'values', title: '2. Brand Values', subtitle: 'Our Ten Non-Negotiable Core Beliefs', icon: ShieldCheck },
    { id: 'personality', title: '3. Brand Personality', subtitle: 'Voice, Tone & Style Matrix', icon: Bookmark },
    { id: 'audience', title: '4. Target Audience', subtitle: 'Deep Customer Personas per Segment', icon: Users },
    { id: 'visual', title: '5. Visual Identity', subtitle: 'Colors, Spacing, Grids & Atoms', icon: Sliders },
    { id: 'logo', title: '6. Logo System', subtitle: 'Symbolism & Geometry of AAN Mark', icon: Eye },
    { id: 'architecture', title: '7. Product Architecture', subtitle: 'Ecosystem & SDK Definitions', icon: Layers },
    { id: 'marketing', title: '8. Marketing Language', subtitle: 'Headlines, CTAs & Pitch Copy', icon: Compass },
    { id: 'website', title: '9. Website Architecture', subtitle: 'Blueprints for 15 Primary Pages', icon: Globe },
    { id: 'manual', title: '10. Brand Manual', subtitle: 'Logo Dos and Don\'ts & Checklists', icon: BookOpen },
    { id: 'story', title: '11. Company Story', subtitle: 'Origin Narrative & Foundational Urgency', icon: Clock },
    { id: 'positioning', title: '12. Competitive Edge', subtitle: 'Our Structural Position in Identity Tech', icon: Cpu },
    { id: 'future', title: '13. 10-Year Roadmap', subtitle: 'The Future of Sovereign Digital Trust', icon: TrendingUp },
  ];

  const handleCopyToken = (token: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Filter sections by search query
  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Brand Book Hero Banner */}
      <div className="relative border-b border-slate-900 bg-slate-950 overflow-hidden py-16 px-6">
        {/* Ambient grids and lighting */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
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
                <p className="text-slate-400 text-sm mt-1">Defining the purpose, vision, and core alignment of AAN technology.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-900/50 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Myopic Focus: The Mission</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To build highly resilient, privacy-preserving infrastructure that enables digital platforms to assert user uniqueness and trust, eliminating malicious botnets and fake entities without exposing raw identity details.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/50 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">The Long View: The Vision</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A world where trust online is earned dynamically through verifiable digital evidence rather than continuous corporate surveillance or centralized government registries.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-300 border-b border-slate-800/60 pb-2">Primary Positioning Framework</h3>
                
                <div className="space-y-4 text-xs text-slate-400">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Purpose</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      To establish the definitive trust consensus layer of the internet, allowing software developers to operate global platforms with safe, anonymous anti-sybil safeguards.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Promise</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      We secure authentic human interactions at scale, guaranteeing that partner platforms receive zero user tracking vectors or stored biometric templates.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Positioning</span>
                    <span className="col-span-2 leading-relaxed text-slate-300 font-mono">
                      "Stripe is for secure payments. Cloudflare is for network integrity. AAN is for privacy-preserving digital trust."
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">One-Sentence Pitch</span>
                    <span className="col-span-2 leading-relaxed text-slate-300 font-bold text-white">
                      AAN builds privacy-preserving digital trust infrastructure that enables platforms to verify real, unique, and returning humans while protecting user privacy.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Elevator Pitch</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      Traditional identity companies scan driver’s licenses, hoard SSNs, and record high-res facial scans, creating permanent security and privacy hazards. AAN changes the game. We provide a decentralized backend infrastructure that lets apps verify real, unique users through secure, locally-hashed biometrics. Recipient portals get only cryptographic approvals—never raw user data.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl space-y-3">
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Executive Summary for Seed Investors & Architects</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In a digital landscape overrun by multi-agent AI scripts, neural fake accounts, bot syndicates, and digital identity fraud, platforms encounter a fatal structural paradox: how to guarantee a user is an actual, unique, and trusted human without establishing a full surveillance panopticon. 
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  <b>AAN provides the escape velocity.</b> By treating identity verification as a stateless utility and returning verifiable cryptographic assertions, AAN decouples trust from surveillance. AAN does not compete with national legal documentation. We operate precisely at the API layer, giving developers tools to safeguard digital ecosystems at SOC-2, CCPA, and GDPR specifications.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 2: CORES VALUES */}
          {activeTab === 'values' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 02</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Foundational Values</h2>
                <p className="text-slate-400 text-sm mt-1">Ten absolute principles guiding our architecture, code, and communications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Privacy First',
                    desc: 'We never store high-resolution face images, names, or physical addresses. Privacy is not a design parameter; it is our foundation.',
                  },
                  {
                    title: 'Truth Through Evidence',
                    desc: 'Trust is not an assumption or a reputation metric. It is verified mathematically through persistent local hardware hashes.',
                  },
                  {
                    title: 'Security by Design',
                    desc: 'All processes are compiled using isolated, serverless worker routines, layered with dual SHA-256 and AES-256 token encryptions.',
                  },
                  {
                    title: 'User Control',
                    desc: 'No verification is executed without clear, manual user opt-in consent. The citizen retains complete ownership of keys.',
                  },
                  {
                    title: 'Absolute Transparency',
                    desc: 'Our schemas, cryptographic models, and SDKs are publicly open-source, reproducible, and verifiable.',
                  },
                  {
                    title: 'Responsible Innovation',
                    desc: 'We strictly reject sci-fi claims and cyberpunk marketing. We offer precise, humble infrastructure backed by hard facts.',
                  },
                  {
                    title: 'Long-Term Thinking',
                    desc: 'We build digital building blocks designed to remain secure, reliable, and uncompromised over decades.',
                  },
                  {
                    title: 'Open Integration',
                    desc: 'AAN integrates seamlessly with multi-language REST structures, headless frameworks, and edge API architectures.',
                  },
                  {
                    title: 'Absolute Reliability',
                    desc: 'SLA guarantees exceeding 99.999% uptime, utilizing resilient de-duplicated template nodes.',
                  },
                  {
                    title: 'Absolute Trustworthiness',
                    desc: 'By storing zero raw data, AAN is not targetable. We eliminate data leak liability for our enterprise partners.',
                  }
                ].map((val, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-xl space-y-1.5 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-md font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-sans font-bold text-sm text-slate-200">{val.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 3: PERSONALITY */}
          {activeTab === 'personality' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 03</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Brand Personality</h2>
                <p className="text-slate-400 text-sm mt-1">The tone, voice, and narrative style of AAN communications.</p>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                <h3 className="text-sm font-mono text-slate-300 mb-3 uppercase tracking-wider">AAN Tone Matrix: Who We Are</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'Calm', detail: 'Never hyper or alarmist.' },
                    { label: 'Precise', detail: 'Strict engineering accuracy.' },
                    { label: 'Intelligent', detail: 'Respects reader intellect.' },
                    { label: 'Minimalist', detail: 'Quiet, spatial clarity.' }
                  ].map((elem, i) => (
                    <div key={i} className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg">
                      <div className="font-sans font-bold text-sm text-blue-400">{elem.label}</div>
                      <div className="text-[10.5px] text-slate-500 mt-1">{elem.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-300">Writing Style Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-3.5">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> WHAT TO ENCOURAGE
                    </h4>
                    <p className="text-slate-400">
                      Speak directly and transparently about limitations. Use simple, high-impact terminology (e.g., "proof of unique human", "anonymity anchors"). Ensure your copy feels authoritative, like an established scientific protocol.
                    </p>
                    <p className="text-slate-400 italic bg-emerald-950/10 border-l border-emerald-500/50 p-2 text-[11px] text-emerald-300 rounded-r">
                      "AAN provides infrastructure to verify uniqueness. It does not store user documents or raw geometry templates."
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> WHAT TO AVOID
                    </h4>
                    <p className="text-slate-400">
                      Avoid fear-mongering copy, hype marketing slogans ("web3 paradigm shifter"), cyber-hacking terminology, dark hacker graphics, or claiming to completely halt all online fraud.
                    </p>
                    <p className="text-slate-400 italic bg-red-950/10 border-l border-red-500/50 p-2 text-[11px] text-red-300 rounded-r">
                      " THE BOTPOCALYPSE IS HERE. DEFEND YOUR SERVERS WITH THE ULTIMATE BLOCKCHAIN BIOMETRIC SECURITY SYSTEM."
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-900/20 border border-slate-855 rounded-xl space-y-2">
                <h4 className="text-xs font-mono text-slate-300 uppercase tracking-widest">AAN Narrative Archetype</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Our archetype is <b>The Architect of Record</b>. We do not yell. We do not participate in marketing warfare. Like a standard ISO verification committee or standard physical building codes, we focus purely on the immutable structural specifications.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 4: TARGET AUDIENCE PERSONAS */}
          {activeTab === 'audience' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 04</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Target Audience & Personas</h2>
                <p className="text-slate-400 text-sm mt-1">Ten highly specific client profiles targeting AAN infrastructure.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    segment: '1. SaaS Companies',
                    problem: 'Explosion of automated trial abuse, pipeline carding, and fake multi-tenant profiles.',
                    goal: 'Protect developer compute resources and database scalability without causing onboarding friction.',
                    painPoint: 'CAPTCHAs kill user signup metrics; legacy passport uploads are too heavy and expensive.',
                    motivation: 'To lock trial signups to verified unique people cleanly.'
                  },
                  {
                    segment: '2. Fintech Platforms',
                    problem: 'Rapid synthetic identity creation using deepfake face replays to open mule banking details.',
                    goal: 'Perform quick 3-dimensional liveness validations before proceeding to standard manual review steps.',
                    painPoint: 'High rates of facial mock spoofing rendering existing 2D cameras obsolete.',
                    motivation: 'Sovereign hardware-bound client credential verification.'
                  },
                  {
                    segment: '3. Online Marketplaces',
                    problem: 'Malicious listings, seller multi-account review rigging, scam farm operations.',
                    goal: 'Validate each vendor account leads back to a unique person index.',
                    painPoint: 'Forcing micro-merchants to provide complete official identification causes significant churn.',
                    motivation: 'Clean proof of unique human status.'
                  },
                  {
                    segment: '4. Gaming Platforms',
                    problem: 'Smurfing, cheat scripts, botnets farming virtual materials, complete lobby compromise.',
                    goal: 'Ensure each player is a distinct, verifiable biological operator.',
                    painPoint: 'Hard blocks on IP or device parameters affect dormitories and households incorrectly.',
                    motivation: 'Low friction hardware-bound biometric authentication.'
                  },
                  {
                    segment: '5. Enterprise Software',
                    problem: 'Credential stuffing, social engineering attacks, and fake user approvals.',
                    goal: 'Add an ironclad, frictionless privacy-centric biometric layer to MFA.',
                    painPoint: 'Employees resent sharing corporate face databases due to metadata leaks.',
                    motivation: 'Stateless, zero-knowledge human validation.'
                  },
                  {
                    segment: '6. Social Platforms',
                    problem: 'AI fake accounts spreading massive coordinated spam, bot manipulation of viral timelines.',
                    goal: 'Enable a "Verified Unique Human" filter tier for account operations.',
                    painPoint: 'Users reject sharing real passports/IDs with volatile social corporations.',
                    motivation: 'Pseudonymous anti-bot attestation token flows.'
                  },
                  {
                    segment: '7. Healthcare Tech',
                    problem: 'Spam telehealth appointment reservations and duplicate record files.',
                    goal: 'Secure unique returning human continuity without leaking clinical files.',
                    painPoint: 'HIPAA requires perfect decoupling of biological biometric indicators from clinical tables.',
                    motivation: 'ZKP biometric template isolation.'
                  },
                  {
                    segment: '8. EdTech Tools',
                    problem: 'AI bots taking courses, duplicate submissions, and online examination fraud.',
                    goal: 'Lock student sessions to verified physical human students.',
                    painPoint: 'Aggressive camera surveillance causes anxiety and prompts major regulatory pushbacks.',
                    motivation: 'Local, secure camera verification.'
                  },
                  {
                    segment: '9. Gov Contractors',
                    problem: 'Protecting secure portal entry without exposing physical biometric databases to hackers.',
                    goal: 'Strict multi-signal risk metrics combining device profiles with localized biometrics.',
                    painPoint: 'Traditional databases are constant massive targets for sovereign state hackers.',
                    motivation: 'Military-grade cryptographic proof signatures.'
                  },
                  {
                    segment: '10. General Software Developers',
                    problem: 'Complex, brittle setup processes required by old legacy identity suites.',
                    goal: 'Obtain simple JSON Web Tokens containing unambiguous proof values in 3 lines of code.',
                    painPoint: 'Integrating old identity SDKs takes weeks, is poorly of documentation, and requires sales calls.',
                    motivation: 'Pristine self-serve documentation and transparent CLI endpoints.'
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
                        <span className="text-slate-500 font-mono text-[10px] block uppercase">Buying Motivation:</span>
                        <p className="text-slate-300 mt-0.5 font-medium">{per.motivation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 5: VISUAL IDENTITY */}
          {activeTab === 'visual' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 05</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Visual Identity System</h2>
                <p className="text-slate-400 text-sm mt-1">Our meticulous, premium enterprise design palette, spacing scale, and tokens.</p>
              </div>

              {/* Color Swatches Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest bg-slate-900/40 p-2 rounded">1. Identity Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {[
                    { name: 'Core Slate Black', hex: '#020617', tailwind: 'bg-slate-950', use: 'App Background / Deep Canvas' },
                    { name: 'Sovereign White', hex: '#F8FAFC', tailwind: 'bg-slate-50 border border-slate-200', use: 'Primary Display Typography' },
                    { name: 'Sovereign Blue', hex: '#2563EB', tailwind: 'bg-blue-600', use: 'Interactive Primaries & Selections' },
                    { name: 'AAN Mint Green', hex: '#10B981', tailwind: 'bg-emerald-500', use: 'Verification Success Accents' },
                    { name: 'Anomalous Rust', hex: '#EF4444', tailwind: 'bg-red-500', use: 'High-Risk Anomaly Alerts' },
                    { name: 'Carbon Accent', hex: '#F1F5F9', tailwind: 'bg-slate-100', use: 'Clean Corporate Interface Backgrounds' },
                    { name: 'Aura Depth Blue', hex: '#1E3A8A', tailwind: 'bg-blue-900', use: 'Border Elements & Dark Gradients' },
                    { name: 'Ink Charcoal', hex: '#0F172A', tailwind: 'bg-slate-900', use: 'Form fields & Component panels' }
                  ].map((col, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex flex-col gap-3">
                      <div className={`h-12 w-full rounded-md ${col.tailwind} relative overflow-hidden flex items-end p-1.5`}>
                        <span className="text-[9px] font-mono font-bold bg-black/50 text-white px-1 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                          {col.hex}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-xs flex justify-between items-center">
                          <span>{col.name}</span>
                          <button 
                            className="text-slate-505 hover:text-slate-300"
                            onClick={() => handleCopyToken(col.name, col.hex)}
                          >
                            {copiedToken === col.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1 leading-normal">{col.use}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacing & Spacing Chart */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest bg-slate-900/40 p-2 rounded">2. Layout Spacing Scale</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400 font-mono">
                    <thead>
                      <tr className="border-b border-slate-900">
                        <th className="py-2 px-3 text-slate-200">Token</th>
                        <th className="py-2 px-3 text-slate-200">Measurement</th>
                        <th className="py-2 px-3 text-slate-200">Rhythm Use</th>
                        <th className="py-2 px-3 text-slate-200">Visual Blueprint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {[
                        { token: 'aan-space-xs', size: '4px', desc: 'Atomic component gaps, inline tags', width: 'w-1' },
                        { token: 'aan-space-sm', size: '8px', desc: 'Inner button pad, badge gaps', width: 'w-2' },
                        { token: 'aan-space-md', size: '16px', desc: 'Grid spacing, item margins', width: 'w-4' },
                        { token: 'aan-space-lg', size: '24px', desc: 'Outer card margins, title margins', width: 'w-6' },
                        { token: 'aan-space-xl', size: '48px', desc: 'General page paddings, banner caps', width: 'w-12' },
                        { token: 'aan-space-xxl', size: '96px', desc: 'Primary landing grid section spacing', width: 'w-24' },
                      ].map((sp, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/10">
                          <td className="py-2 px-3 text-slate-300 text-[11px]">{sp.token}</td>
                          <td className="py-2 px-3 text-slate-300 font-bold">{sp.size}</td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">{sp.desc}</td>
                          <td className="py-2 px-3">
                            <div className={`h-2.5 bg-blue-500 rounded ${sp.width}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest bg-slate-900/40 p-2 rounded">3. Typography Scale</h3>
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg">
                    <span className="font-mono text-[9px] text-slate-500 block mb-1">DISPLAY HEADERS (0.015em Tracking)</span>
                    <span className="font-sans font-extrabold text-3xl text-white tracking-tight leading-none block">
                      AAN Trust Infrastructure
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Inter Bold / 32px • Letter-spacing: -0.022em</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg">
                    <span className="font-mono text-[9px] text-slate-500 block mb-1">SYSTEM CODES (Mono Regular)</span>
                    <span className="font-mono text-xs text-blue-400 block whitespace-pre">
                      {`const clientClaims = await aan.verify(proofToken);`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">JetBrains Mono Regular / 12px • Line-height: 1.5</span>
                  </div>
                </div>
              </div>

              {/* Atom Tokens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <h4 className="font-mono text-[11px] text-slate-300 uppercase">Border Radius Rules</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-800 rounded-sm">
                      <span className="block font-bold">2px</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">aan-radius-sm</span>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-md">
                      <span className="block font-bold">6px</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">aan-radius-md</span>
                    </div>
                    <div className="p-2 border border-slate-800 rounded-xl">
                      <span className="block font-bold">12px</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">aan-radius-lg</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <h4 className="font-mono text-[11px] text-slate-300 uppercase">Shadow Rules</h4>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-800 shadow-sm">
                      <span className="block font-bold">Base Shadow</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">aan-shadow-sm</span>
                    </div>
                    <div className="p-2 border border-slate-800 shadow-lg shadow-blue-900/10">
                      <span className="block font-bold">Interactive</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">aan-shadow-glow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 6: LOGO SYSTEM */}
          {activeTab === 'logo' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 06</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Logo & Symbolism System</h2>
                <p className="text-slate-400 text-sm mt-1">Sovereign, structures, and symmetry. No shields, padlocks, or footprints.</p>
              </div>

              {/* Symbolic Explanation */}
              <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3.5 text-xs text-slate-400 leading-relaxed">
                <span className="font-mono text-[10px] text-blue-400 uppercase font-bold block">SYMBOLISM CORE DIRECTIVE</span>
                <p>
                  To convey digital trust without resorting to clichés (e.g., shields, padlocks, eye-scanning scopes, or fingerprints). The AAN visual signature is instead founded on mathematical symmetry and alignment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 block">Symmetric Alignment</span>
                    <span>The geometric mark represents binary data streams aligning to form a sovereign axis of trust.</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 block">Continuity & Structure</span>
                    <span>Double looping ribbon curves symbolize an unbreakable, private returned feedback loop of verification.</span>
                  </div>
                </div>
              </div>

              {/* Logo Previews */}
              <div className="space-y-6">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest bg-slate-900/40 p-2 rounded">Visual Logo Mock Variations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary & Monogram */}
                  <div className="p-6 bg-slate-950 border border-slate-855 rounded-xl flex flex-col items-center justify-center gap-4 text-center">
                    <span className="font-mono text-[9px] text-slate-500">1. PRIMARY MONOGRAM (AAN Core Axis)</span>
                    <div className="h-20 flex items-center justify-center relative">
                      <div className="flex gap-1.5 items-end">
                        <div className="w-4 h-12 bg-blue-600 rounded" />
                        <div className="w-4 h-16 bg-white rounded" />
                        <div className="w-4 h-8 bg-emerald-500 rounded" />
                      </div>
                    </div>
                    <div>
                      <span className="font-sans font-bold text-lg text-white block">AAN</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">Sovereign Axis Monogram</span>
                    </div>
                  </div>

                  {/* App Icon */}
                  <div className="p-6 bg-slate-950 border border-slate-855 rounded-xl flex flex-col items-center justify-center gap-4 text-center">
                    <span className="font-mono text-[9px] text-slate-500">2. APP LAUNCHER ICON (Symmetric Trust Matrix)</span>
                    <div className="h-20 w-20 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/5" />
                      <div className="grid grid-cols-3 gap-1">
                        <span className="h-3 w-3 bg-blue-500 rounded" />
                        <span className="h-3 w-3 bg-slate-700 rounded" />
                        <span className="h-3 w-3 bg-emerald-500 rounded" />
                        <span className="h-3 w-3 bg-slate-700 rounded" />
                        <span className="h-3 w-3 bg-white rounded" />
                        <span className="h-3 w-3 bg-slate-700 rounded" />
                        <span className="h-3 w-3 bg-emerald-500 rounded" />
                        <span className="h-3 w-3 bg-slate-700 rounded" />
                        <span className="h-3 w-3 bg-blue-500 rounded" />
                      </div>
                    </div>
                    <div>
                      <span className="font-sans font-bold text-sm text-white block">AAN Launcher System</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase">Hardware Touch Target Mock</span>
                    </div>
                  </div>

                  {/* Horizontal Corporate Logo */}
                  <div className="p-6 bg-slate-950 border border-slate-855 rounded-xl flex flex-col items-center justify-center gap-4 text-center col-span-1 md:col-span-2">
                    <span className="font-mono text-[9px] text-slate-500">3. HORIZONTAL CORPORATE BRANDMARK</span>
                    <div className="flex items-center gap-4 py-4 px-6 bg-slate-900/50 border border-slate-850 rounded-lg">
                      <div className="flex gap-1 items-end">
                        <span className="w-2.5 h-6 bg-blue-600 rounded-sm" />
                        <span className="w-2.5 h-8 bg-white rounded-sm" />
                        <span className="w-2.5 h-4 bg-emerald-500 rounded-sm" />
                      </div>
                      <div className="h-6 w-0.5 bg-slate-800" />
                      <div className="text-left">
                        <span className="font-sans font-extrabold text-lg text-white leading-none">AAN</span>
                        <span className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">Trust Infrastructure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 7: PRODUCT ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 07</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Platform Architecture & Ecosystem</h2>
                <p className="text-slate-400 text-sm mt-1">Ten modular product suites operating cleanly under the AAN corporate umbrella.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'AAN Verify', use: 'The high-velocity verification session flow containing liveness metrics and dynamic challenge generators.' },
                  { name: 'AAN Trust', use: 'Risk analysis, template hashes indexation matching, and multi-device correlation algorithms.' },
                  { name: 'AAN Sentinel', use: 'Anomalous bot vector trackers, spoof mitigation, and real-time attempt velocity restrictions.' },
                  { name: 'AAN Console', use: 'Secure partner portal interface displaying session histories, audit logs, and status controls.' },
                  { name: 'AAN SDK', use: 'Multi-framework client developer libraries enabling fast, low-friction camera configurations.' },
                  { name: 'AAN Connect', use: 'Pre-built standard single sign-on widgets, bridging OAuth attestation frameworks.' },
                  { name: 'AAN Protect', use: 'Military-grade hardware-locked key pairs generated within browser-bound sandboxes.' },
                  { name: 'AAN Proof', use: 'The cryptographic output generation mechanism producing signed, secure attestation tokens.' },
                  { name: 'AAN Gateway', use: 'The secure REST developer endpoint translating hashed keys into state validations.' },
                  { name: 'AAN Identity Graph', use: 'Anonymized, isolated relation chains linking devices and hashes safely per partner app.' }
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

          {/* CHAPTER 8: MARKETING LANGUAGE */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 08</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Marketing & Messaging Copy</h2>
                <p className="text-slate-400 text-sm mt-1">Direct verbal assets for developer interfaces, investor materials, and keynotes.</p>
              </div>

              <div className="space-y-5 text-xs text-slate-405 leading-relaxed">
                {[
                  {
                    target: '1. Primary Landing Title Marks',
                    title: 'The Digital Trust Axis.',
                    subtitle: 'Secure human proof without exposing biometric parameters or personal user coordinates.',
                    cta: 'Integrate AAN Gateway'
                  },
                  {
                    target: '2. Value Propositions (Anti-Sybil Proofs)',
                    title: 'Mitigate fraud, trial abuse, and duplicate bots completely pseudonymously.',
                    subtitle: 'Traditional identity suites require passport scans and driver license storage. AAN extracts only biological uniqueness signals, transforming them into volatile numerical hashes in memory. We do not store raw images. You receive only clean attestation approvals—never liability.',
                    cta: 'Explore Zero-Knowledge Integration'
                  },
                  {
                    target: '3. Developer Messaging Matrix',
                    title: 'Secure unique users in 3 lines of code.',
                    subtitle: 'Initialize ephemeral challenge verification links directly via client REST calls. Render highly optimized WebRTC device scanners locally on browser frames. Obtain signed, standard JSON Web Tokens containing human uniqueness confirmations.',
                    cta: 'View AAN SDK Reference'
                  },
                  {
                    target: '4. Enterprise Compliance Messaging',
                    title: 'SOC-2, GDPR, CCPA aligned by default.',
                    subtitle: 'By never holding raw biometrics, state IDs, physical names, or location coords, AAN reduces compliance liability to zero. Partner apps obtain a stateless, permanent attestation index securely.',
                    cta: 'Download Whitepaper'
                  },
                  {
                    target: '5. Security Messaging Suite',
                    title: 'Hardware-bound security keys.',
                    subtitle: 'Dual RSA-2048 signing curves linked directly to hardware devices. Prevent bot emulator scripts, remote desktop control hacks, and massive automated signup networks.',
                    cta: 'Read Trust Architecture'
                  },
                  {
                    target: '6. Seed Stage Investor Deck Hook',
                    title: 'Decoupling trust from corporate surveillance.',
                    subtitle: 'The internet is drowning in bots. AI makes synthetic profiles indistinguishable from physical people. The global economy cannot scale on old CAPTCHAs. AAN is billing itself as the absolute backend plumbing layer powering authentic human interactions.',
                    cta: 'Contact Partner Relations'
                  },
                  {
                    target: '7. Recruiting & Career Copy',
                    title: 'Join the digital trust infrastructure vanguard.',
                    subtitle: 'We reject marketing buzzwords and blockchain hypes. We are senior system engineers, cryptographers, and product designers solving the deepest operational issue of the digital age: proving biological unique status cleanly.',
                    cta: 'View Open Roles'
                  },
                  {
                    target: '8. Host Conference Keynote Callout',
                    title: 'Unbreakable trust. Complete anonymity.',
                    subtitle: 'AAN builds infrastructure that aligns platform health with human sovereignty. Because trust must be verified by mathematics, not hoarded files.',
                    cta: 'Register for Keynote Series'
                  }
                ].map((val, i) => (
                  <div key={i} className="p-5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl space-y-2 transition-all">
                    <span className="font-mono text-[9px] text-blue-400 uppercase font-bold block">{val.target}</span>
                    <h4 className="text-sm font-sans font-bold text-slate-200 mt-1 leading-snug">{val.title}</h4>
                    <p className="text-slate-400 mt-1">{val.subtitle}</p>
                    <div className="pt-2 text-blue-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1 hover:text-blue-300 pointer-events-none cursor-pointer">
                      {val.cta} <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 9: WEBSITE BLUEPRINTS */}
          {activeTab === 'website' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 09</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Enterprise Website System</h2>
                <p className="text-slate-400 text-sm mt-1">Recommended layout, core content structure, and metrics for 15 primary pages.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: '1. Home Page (/)', layout: 'Minimal elegant layout. Hero marquee displaying privacy-preserving claims. Interactive sandbox console allowing direct curl verification tests. Multi-segment ROI calculations showing sybil bot reduction stat sheets.' },
                  { name: '2. Platform Page (/platform)', layout: 'Technical architecture maps. Detailed blueprints of volatile memory frame purges and facenet-v3-gcm model operations. Diagrams detailing how client raw feeds are erased in sub-seconds.' },
                  { name: '3. Solutions Page (/solutions)', layout: 'Dynamic portal showing solutions for SaaS, FinTech, and gaming with detailed segment telemetry comparisons. Links directly to custom target industry case studies.' },
                  { name: '4. Developers Page (/developers)', layout: 'SDK commands list, sandbox playground keys, download parameters, and live console query tracking logs. Optimized code block structures in Go, Node.js, and Python.' },
                  { name: '5. Documentation Page (/docs)', layout: 'Strict step-by-step guidance on initializing verification sessions, parsing webhook signals, and handling user suspend rules. Sidebar-organized search indexes.' },
                  { name: '6. Security Portal (/security)', layout: 'SHA-256 hashing standards, RSA-2048 signature rules, memory buffer purge compliance, SOC-2 checklists, and penetration testing summaries.' },
                  { name: '7. Pricing Matrix (/pricing)', layout: 'Clear flat-tier developer rates. Free starter limits, $0.05 per human validation verification session, and volume enterprise contracts SLA matrices.' },
                  { name: '8. Customers Hub (/customers)', layout: 'Clean grid testimonials, verified success stories, bot volume reduction summaries, and platform scale stats. Case reports.' },
                  { name: '9. About Narrative (/about)', layout: 'Our mission values, timeline milestones, leadership engineering backgrounds, and digital sovereignty commitments.' },
                  { name: '10. Careers Gateway (/careers)', layout: 'Open positions in systems cryptography, backend Express, product design. Zero buzzwords, clear project deliverables, competitive salaries.' },
                  { name: '11. Blog & Insights (/blog)', layout: 'Articles on the rise of AI synthetic entities, deepfake camera injection vectors, zero-knowledge verification frameworks, and digital sovereignty.' },
                  { name: '12. Contact Hub (/contact)', layout: 'Secure contact system, volume partner custom pricing proposals, security audit file requests. SLA support channels info.' },
                  { name: '13. Live Status Page (/status)', layout: '99.999% uptime counters, response speed monitoring (global average 120ms), system status history tracking list.' },
                  { name: '14. Trust Center (/trust)', layout: 'Sovereign compliance manuals, GDPR, CCPA data logs, data disposal procedures, and certificate lists.' },
                  { name: '15. API Reference (/api-reference)', layout: 'Complete interactive endpoint testing page. Call GET/POST sessions directly inside the browser using sandbox test keys.' }
                ].map((pg, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 hover:border-slate-800 transition-all">
                    <span className="font-mono text-[10px] text-blue-400 font-bold block">{pg.name}</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{pg.layout}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 10: DO AND DONT MANUAL */}
          {activeTab === 'manual' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 10</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Brand Style Manual</h2>
                <p className="text-slate-400 text-sm mt-1">Strict, clear compliance checklists of Dos and Don'ts across all digital touchpoints.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                {/* Visual Guidelines */}
                <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="font-mono text-[11px] text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">1. Logo & Design Placements</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border-l border-emerald-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-emerald-400 font-bold font-mono"> DO:</span> Render the horizontal logomark exclusively on clean dark-slate backgrounds, leaving ample padding on all sides.
                    </div>
                    <div className="bg-red-950/20 border-l border-red-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-red-400 font-bold font-mono"> DON'T:</span> Distort or crop the ribbon monogram layers, or apply bright unapproved overlay gradients (e.g. rainbow, cyberpunk neon).
                    </div>
                  </div>
                </div>

                {/* Typography Guidelines */}
                <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="font-mono text-[11px] text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">2. Font Pairings & Tracking</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border-l border-emerald-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-emerald-400 font-bold font-mono"> DO:</span> Set headers in crisp Inter display typography, using a tracking metric of -0.015em to ensure a modern feel.
                    </div>
                    <div className="bg-red-950/20 border-l border-red-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-red-400 font-bold font-mono"> DON'T:</span> Mix decorative serif headlines, or present codebase calls and JSON schemas in non-mono fonts.
                    </div>
                  </div>
                </div>

                {/* Photography Guidelines */}
                <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="font-mono text-[11px] text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">3. Imagery & Layout Style</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border-l border-emerald-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-emerald-400 font-bold font-mono"> DO:</span> Leverage crisp, pixel-perfect modular blueprint line art or dark-toned monochromatic photos highlighting human geometry naturally.
                    </div>
                    <div className="bg-red-950/20 border-l border-red-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-red-400 font-bold font-mono"> DON'T:</span> Feature bright vector cartoon stock characters, fake futuristic glowing hacker grids, or cyberpunk overlays.
                    </div>
                  </div>
                </div>

                {/* Spacing & Scaling Guidelines */}
                <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="font-mono text-[11px] text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">4. Spacing Alignment Constraint</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border-l border-emerald-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-emerald-400 font-bold font-mono"> DO:</span> Use strict, 8-pixel grid alignments. Leave generous negative spaces to convey confidence and enterprise quality.
                    </div>
                    <div className="bg-red-950/20 border-l border-red-500/50 p-2 text-[11px] text-slate-300 rounded">
                      <span className="text-red-400 font-bold font-mono"> DON'T:</span> Crowded page layouts with unnecessary text boxes or system telemetry logs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 11: COMPANY STORY */}
          {activeTab === 'story' && (
            <div className="space-y-6 animate-fade-in text-xs text-slate-400 leading-relaxed font-sans">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 11</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Our Story & Urgency</h2>
                <p className="text-slate-400 text-sm mt-1">A story born out of privacy concerns, systems integrity, and digital sovereignty.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-200 font-medium border-b border-slate-900 pb-2 uppercase tracking-wide">The Digital Paradox</h3>
                <p>
                  In the years leading up to 2026, the internet reached a point of existential structural breakdown. With the advent of generative AI models, synthetic profiles and automated scripts became completely indistinguishable from physical biological agents. Systems were faced with a critical dilemma: either accept total bot compromise (trial leaks, ad fraud, civil syndicate spam) or demand intrusive human verification protocols that forced citizens to yield their personal documents and high-res face files.
                </p>
                <p>
                  This compromise was unacceptable. It treated human citizens as security risks, demanding that they trade sovereign privacy for digital access, creating central biometric databases that acted as targets for malicious hackers.
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

          {/* CHAPTER 12: COMPETITIVE EDGE */}
          {activeTab === 'positioning' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 12</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">Competitive Positioning</h2>
                <p className="text-slate-400 text-sm mt-1">The unique structural category of AAN within the security landscape.</p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    competitor: '1. Identity Verification Providers',
                    focus: 'Demand scans of physical passports, driver licenses, or SSN filings.',
                    aanEdge: 'AAN does not compete with legal identifications or national passports. AAN handles only human uniqueness validation at the application layer. No data hoarding, zero liability, sub-second latency.'
                  },
                  {
                    competitor: '2. Authentication Platforms (SSO)',
                    focus: 'Identify who a user is by matching login credentials to record databases.',
                    aanEdge: 'SSO platforms track names and emails, but do not prevent one human from registering 50 duplicate profiles. AAN verifies uniqueness pseudonymously, providing anti-sybil consensus.'
                  },
                  {
                    competitor: '3. Fraud Detection Suites',
                    focus: 'Heuristically track IP parameters, cookie history, and typing speed indices.',
                    aanEdge: 'Heuristics are brittle and generate high rates of false positives. AAN replaces guesswork with local hardware-bound cryptographic biometrics.'
                  },
                  {
                    competitor: '4. Cybersecurity Companies',
                    focus: 'Secure networks, servers, and prevent SQL and code injections.',
                    aanEdge: 'Cybersecurity secures infrastructure, but does not identify if authentic humans or script bots are navigating login forms. AAN provides the human consensus layer.'
                  },
                  {
                    competitor: '5. Legacy Identity Management Suite',
                    focus: 'Complex, expensive enterprise systems requiring sales calls and complex setups.',
                    aanEdge: 'AAN is integrated in minutes using self-serve endpoints, clear documentation, and transparent, developer-friendly flat fees.'
                  }
                ].map((edge, idx) => (
                  <div key={idx} className="p-5 bg-slate-950 border border-slate-855 rounded-xl space-y-2">
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{edge.competitor}</span>
                    <p className="text-xs text-slate-400 leading-normal"><b className="text-slate-300">Their focus:</b> {edge.focus}</p>
                    <div className="p-3 bg-blue-950/20 border-l-2 border-blue-500 rounded-r text-xs mt-2 text-slate-300">
                      <b className="font-mono text-blue-400 font-bold block uppercase text-[10px]">AAN Structural Edge:</b>
                      <p className="mt-1 leading-relaxed">{edge.aanEdge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 13: 10-YEAR ROADMAP */}
          {activeTab === 'future' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 13</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-1">AAN Ten-Year Product Journey</h2>
                <p className="text-slate-400 text-sm mt-1">Expanding sovereign digital trust utilities globally. Clean and structural roadmap.</p>
              </div>

              {/* Interactive Roadmap Timeline */}
              <div className="space-y-6 relative border-l border-slate-800 ml-4 pl-6 md:pl-10 text-xs">
                {[
                  {
                    phase: 'Phase 1: Seed & Uniqueness Consensus (Years 1 - 2)',
                    desc: 'Validate user uniqueness and integrate anti-sybil safeguards. Secure partnerships with major SaaS and gaming channels. Release robust, headless open-source REST SDKs.',
                    status: 'Active Launch Window',
                    color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40'
                  },
                  {
                    phase: 'Phase 2: Edge Hardware Binding Gateway (Years 3 - 4)',
                    desc: 'Leverage device-bound security modules on smart handsets to pre-authorize user sessions. Completely bypass camera setups for returning trust flows.',
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

        </main>
      </div>

      {/* Manual Brand Book Footer */}
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
