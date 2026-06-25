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
    { id: 'audience', title: '2. Target Audience', subtitle: 'Deep Customer Personas per Segment', icon: Users },
    { id: 'architecture', title: '3. Product Architecture', subtitle: 'Ecosystem & SDK Definitions', icon: Layers },
    { id: 'story', title: '4. Company Story', subtitle: 'Origin Narrative & Foundational Urgency', icon: Clock },
    { id: 'future', title: '5. 10-Year Roadmap', subtitle: 'The Future of Sovereign Digital Trust', icon: TrendingUp },
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
                      To establish the definitive trust consensus layer of the internet, allowing software developers to operate global platforms with safe, anonymous uniqueness safeguards.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-slate-900">
                    <span className="font-semibold text-slate-200">Brand Promise</span>
                    <span className="col-span-2 leading-relaxed text-slate-300">
                      We secure authentic human interactions at scale, guaranteeing that partner platforms receive zero user tracking vectors or stored private templates.
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
                      Traditional identity companies scan driver’s licenses, hoard SSNs, and record high-res facial scans, creating permanent security and privacy hazards. AAN changes the game. We provide a decentralized backend infrastructure that lets apps verify real, unique users through secure, locally-hashed cryptographic postures. Recipient portals get only cryptographic approvals—never raw user data.
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



          {/* CHAPTER 2: TARGET AUDIENCE PERSONAS */}
          {activeTab === 'audience' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <span className="font-mono text-xs text-blue-400">CHAPTER 02</span>
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
                    problem: 'Rapid synthetic identity creation and coordinated automated signups.',
                    goal: 'Perform quick integrity and attestation handshakes before proceeding to standard manual review steps.',
                    painPoint: 'High rates of automated spoofing rendering standard CAPTCHAs obsolete.',
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
                    motivation: 'Low friction hardware-bound attestation.'
                  },
                  {
                    segment: '5. Enterprise Software',
                    problem: 'Credential stuffing, social engineering attacks, and fake user approvals.',
                    goal: 'Add an ironclad, frictionless privacy-centric hardware-bound layer to MFA.',
                    painPoint: 'Employees resent sharing corporate credentials or central telemetry.',
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
                    painPoint: 'HIPAA requires perfect decoupling of personal indicators from clinical tables.',
                    motivation: 'ZKP credential isolation.'
                  },
                  {
                    segment: '8. EdTech Tools',
                    problem: 'AI bots taking courses, duplicate submissions, and online examination fraud.',
                    goal: 'Lock student sessions to verified physical human students.',
                    painPoint: 'Aggressive surveillance causes anxiety and prompts major regulatory pushbacks.',
                    motivation: 'Local, secure client attestation.'
                  },
                  {
                    segment: '9. Gov Contractors',
                    problem: 'Protecting secure portal entry without exposing physical identity databases to hackers.',
                    goal: 'Strict multi-signal risk metrics combining device profiles with localized cryptographic signatures.',
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
                  { name: 'AAN Verify', use: 'The high-velocity verification session flow containing device attestation signals and dynamic challenge generators.' },
                  { name: 'AAN Trust', use: 'Risk analysis, template hashes indexation matching, and multi-device correlation algorithms.' },
                  { name: 'AAN Sentinel', use: 'Anomalous bot vector trackers, spoof mitigation, and real-time attempt velocity restrictions.' },
                  { name: 'AAN Console', use: 'Secure partner portal interface displaying session histories, audit logs, and status controls.' },
                  { name: 'AAN SDK', use: 'Multi-framework client developer libraries enabling fast, low-friction hardware-bound configurations.' },
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
