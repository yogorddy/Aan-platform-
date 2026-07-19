import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, UserCheck, Fingerprint, EyeOff, Terminal, HeartHandshake, 
  AlertTriangle, Key, Power, ShieldAlert, Lock, Award, Globe, 
  FileSignature, Mail, Search, Printer, Link as LinkIcon, ArrowUp, 
  Clock, ArrowLeft, ChevronDown, ChevronUp, Check, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TermsOfServiceViewProps {
  onNavigate: (page: string, customPath?: string) => void;
}

interface Section {
  id: string;
  num: number;
  title: string;
  icon: React.ComponentType<any>;
  shortDesc: string;
  content: string[];
}

export default function TermsOfServiceView({ onNavigate }: TermsOfServiceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string>('section-1');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const docContainerRef = useRef<HTMLDivElement | null>(null);

  const sections: Section[] = [
    {
      id: 'section-1',
      num: 1,
      title: 'Eligibility & Legal Capability',
      icon: Scale,
      shortDesc: 'Age constraints, authority representations, and digital consent compliance.',
      content: [
        'You must be at least 13 years old (or the minimum age of digital consent in your region) to participate in AAN verification flows. If we isolate evidence of underage usage, we will suspend all active credentials.',
        'If you are integrating these APIs on behalf of an enterprise, corporate body, or public entity, you warrant that you hold the legal authority to bind that entity. In such cases, the terms "you" and "your" refer strictly to that organization.'
      ]
    },
    {
      id: 'section-2',
      num: 2,
      title: 'Developer Accounts & Credentials',
      icon: UserCheck,
      shortDesc: 'Your responsibilities regarding API key safeguarding and project access.',
      content: [
        'Access to the Partner Portal and developer API endpoints requires complete credentials and registration. You must provide truthful, current, and accurate operational parameters for your organization.',
        'You are exclusively responsible for securing your API keys, private credentials, and cryptographic tokens. Any transaction or request occurring under your credential set is deemed authorized by your organization. You must report any suspected key compromise immediately.'
      ]
    },
    {
      id: 'section-3',
      num: 3,
      title: 'Consent-First Verification Rules',
      icon: Fingerprint,
      shortDesc: 'Strict enforcement of explicit, user-initiated verification loops.',
      content: [
        'AAN is a non-custodial middleware designed to verify humanness. All verification flows must be initiated strictly with explicit, user-initiated actions. Hidden, passive, or non-consensual biometric profiling is strictly prohibited.',
        'Integrating clients must publish a transparent notice to their end-users explaining that AAN is utilized as a secure verification processor. You represent that your data practices fully comply with applicable privacy standards, including GDPR, CCPA, and regional laws.'
      ]
    },
    {
      id: 'section-4',
      num: 4,
      title: 'Intellectual Property & API Restrictions',
      icon: Terminal,
      shortDesc: 'AAN proprietary software protections, trademark guidelines, and code boundaries.',
      content: [
        'AAN grants you a limited, non-exclusive, revocable, non-transferable license to access our RESTful endpoints, SDKs, and dashboard interfaces solely to verify your platform users.',
        'You are strictly forbidden from attempting to reverse-engineer, decompile, or disassemble our proprietary telemetry algorithms. Any scraping, load testing, or adversarial manipulation of AAN production APIs will trigger an automatic security lock.'
      ]
    },
    {
      id: 'section-5',
      num: 5,
      title: 'Service Availability & Disclaimers',
      icon: ShieldAlert,
      shortDesc: 'As-Is operational model and our probabilistic risk assessment standards.',
      content: [
        'AAN SERVICES AND APIS ARE PROVIDED TO ALL INTEGRATING PARTNERS ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPLICITLY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.',
        'WE DO NOT WARRANT THAT THE ADAPTIVE TRUST LAYERS WILL SUPPRESS 100% OF MULTI-ACCOUNTING OR AUTOMATED FRAUD. ADVISORIES ARE PROBABILISTIC SECURITY RECOMMENDATIONS DERIVED IN REAL-TIME AND UTILIZED AT YOUR OWN RISK.'
      ]
    },
    {
      id: 'section-6',
      num: 6,
      title: 'Account Revocation & Termination',
      icon: Power,
      shortDesc: 'Automatic triggers for API credential revocation and integration blocks.',
      content: [
        'We reserve the absolute right to suspend or terminate your developer access, active API keys, and database synchronization immediately and without warning in the event of a security emergency.',
        'Grounds for immediate revocation include: (a) violating the Consent-First policy; (b) deliberate bypass of rate limit protections; (c) sending raw, unhashed personal datasets to verification loops; or (d) causing performance stability hazards.'
      ]
    },
    {
      id: 'section-7',
      num: 7,
      title: 'Security, Privacy & Evolution',
      icon: Shield,
      shortDesc: 'Continuous practices review, compliance audits, and direct support channels.',
      content: [
        'We continuously review and improve our security and privacy practices as AAN evolves. Independent security assessments, compliance certifications, and third-party audits will be introduced as the platform matures.',
        'For questions about privacy, data handling, or enterprise agreements, contact us at privacy@aan.org.'
      ]
    }
  ];

  // Auto-expand sections that match a search term
  useEffect(() => {
    if (searchTerm.trim() === '') return;
    const lower = searchTerm.toLowerCase();
    const newExpanded: Record<string, boolean> = {};
    sections.forEach(sec => {
      const titleMatches = sec.title.toLowerCase().includes(lower);
      const descMatches = sec.shortDesc.toLowerCase().includes(lower);
      const contentMatches = sec.content.some(text => text.toLowerCase().includes(lower));
      if (titleMatches || descMatches || contentMatches) {
        newExpanded[sec.id] = true;
      }
    });
    setExpandedSections(newExpanded);
  }, [searchTerm]);

  // Track scroll position for reading indicator and Back to Top
  useEffect(() => {
    const handleScroll = () => {
      const container = docContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrolled = window.scrollY || window.pageYOffset;
      const start = rect.top + scrolled - 200;
      const height = rect.height - window.innerHeight;

      if (scrolled > start) {
        const progress = Math.min(((scrolled - start) / height) * 100, 100);
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight current active section in sticky TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    const currentRefs = sectionsRef.current;
    Object.keys(currentRefs).forEach((key) => {
      const el = currentRefs[key];
      if (el) observer.observe(el);
    });

    return () => {
      Object.keys(currentRefs).forEach((key) => {
        const el = currentRefs[key];
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    sections.forEach(sec => {
      allExpanded[sec.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedSections({});
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setExpandedSections(prev => ({ ...prev, [id]: true }));
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const copySectionLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedSectionId(id);
      setTimeout(() => setCopiedSectionId(null), 2000);
    }).catch(err => {
      console.warn("Clipboard access blocked", err);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="bg-emerald-500/20 text-emerald-200 px-0.5 rounded font-semibold selection:bg-emerald-600 font-sans">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const sectionHasSearchMatch = (sec: Section) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    const titleMatches = sec.title.toLowerCase().includes(lower);
    const descMatches = sec.shortDesc.toLowerCase().includes(lower);
    const contentMatches = sec.content.some(text => text.toLowerCase().includes(lower));
    return titleMatches || descMatches || contentMatches;
  };

  const filteredSections = sections.filter(sec => sectionHasSearchMatch(sec));

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-600 selection:bg-emerald-500/10 selection:text-slate-900 print:bg-white print:text-black" id="aan-terms-view">
      
      {/* 1. SCROLL PROGRESS INDICATOR */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50 print:hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-75 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK BAR */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 sticky top-1 z-40 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-all font-mono font-semibold uppercase tracking-wider group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Home</span>
          </button>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>DECENTRALIZED ASSURANCE CONTRACT</span>
            <span className="text-slate-200">|</span>
            <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-600 text-[10px] font-bold">
              v2.4.0-ENTERPRISE
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <header className="py-24 px-6 md:py-32 border-b border-slate-200 bg-white print:py-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/[0.01] rounded-full blur-[160px] pointer-events-none" />
        <div className="max-w-[800px] mx-auto text-left relative z-10">
          <span className="font-mono text-xs text-emerald-600 font-bold uppercase tracking-widest block mb-4 print:hidden">
            LEGAL USAGE AGREEMENT
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-light text-slate-900 tracking-tight leading-none mb-6">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 font-sans font-light leading-relaxed mb-10 max-w-[700px] print:text-black">
            The legal guidelines governing your platform integration with the Aan Trust Infrastructure, APIs, Portal, and user-verification protocols.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200 print:border-slate-300">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Effective Date</span>
              <span className="text-sm font-sans font-medium text-slate-800 mt-1 block print:text-black">October 24, 2024</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Last Updated</span>
              <span className="text-sm font-sans font-medium text-slate-800 mt-1 block print:text-black">July 4, 2026</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Version History</span>
              <span className="text-sm font-mono text-emerald-600 mt-1 block font-bold print:text-black">v2.4.0-Enterprise</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12" ref={docContainerRef}>
        
        {/* TOC SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 print:hidden">
          <div className="sticky top-24 space-y-6 select-none">
            <div className="pb-3 border-b border-slate-200">
              <span className="font-sans font-semibold text-xs text-slate-900 uppercase tracking-widest block">AGREEMENT CLAUSES</span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Index & Navigation</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-1">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id;
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToAnchor(sec.id)}
                    className={`w-full text-left font-sans text-xs py-2 px-3 rounded transition-all flex items-center gap-2.5 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-200/50 text-slate-900 font-semibold border-l-2 border-emerald-500' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className="truncate">
                      {sec.num}. {sec.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded border border-slate-200 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>PRINT DOCUMENT</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="col-span-1 lg:col-span-9 max-w-[800px] mx-auto w-full print:max-w-none print:p-0">
          
          {/* SEARCH BAR */}
          <div className="mb-12 flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search legal elements (e.g., eligibility, accounts, California)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/50 outline-none text-xs text-slate-800 pl-9 pr-4 py-2.5 rounded-lg font-sans placeholder-slate-400 transition-colors"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400 hover:text-slate-700"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 select-none">
              <button 
                onClick={handleExpandAll}
                className="text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-md border border-slate-200 transition-all cursor-pointer"
              >
                EXPAND ALL
              </button>
              <button 
                onClick={handleCollapseAll}
                className="text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-md border border-slate-200 transition-all cursor-pointer"
              >
                COLLAPSE ALL
              </button>
            </div>
          </div>

          <div className="space-y-16 print:space-y-10">
            {filteredSections.map((sec) => {
              const isExpanded = !!expandedSections[sec.id] || searchTerm.trim() !== '';
              const Icon = sec.icon;

              return (
                <div 
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => { sectionsRef.current[sec.id] = el; }}
                  className="group pt-12 border-t border-slate-200 first:border-0 first:pt-0 print:border-slate-300 print:pt-6 animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 font-mono text-[10px] text-emerald-600 font-semibold tracking-widest uppercase">
                      <Icon className="w-3.5 h-3.5" />
                      <span>SECTION 0{sec.num}</span>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity print:hidden">
                      <button 
                        onClick={(e) => copySectionLink(e, sec.id)}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-semibold bg-slate-50 text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded border border-slate-200 cursor-pointer"
                      >
                        {copiedSectionId === sec.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">COPIED</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3 h-3 text-slate-500" />
                            <span>COPY LINK</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleSection(sec.id)}
                    className="flex items-start justify-between cursor-pointer group/hdr select-none print:cursor-default"
                  >
                    <div className="max-w-[700px]">
                      <h3 className="text-2xl sm:text-3xl font-sans font-light text-slate-900 tracking-tight leading-tight group-hover/hdr:text-emerald-600 transition-colors print:text-black">
                        {highlightText(`${sec.num}. ${sec.title}`, searchTerm)}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 font-sans font-light leading-relaxed print:text-black">
                        {highlightText(sec.shortDesc, searchTerm)}
                      </p>
                    </div>

                    <div className="p-2 text-slate-400 group-hover/hdr:text-slate-600 pt-3.5 print:hidden">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden print:!h-auto print:!opacity-100"
                      >
                        <div className="pt-6 pb-2 space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans font-light max-w-[760px] print:text-black">
                          {sec.content.map((paragraph, pIdx) => (
                             <p key={pIdx}>
                               {highlightText(paragraph, searchTerm)}
                             </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-16 px-6 mt-32 print:hidden text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <span>© 2026 Aan (Antigravity Assurance Network) Trust Infrastructure. All rights reserved.</span>
          <button 
            onClick={() => onNavigate('landing')}
            className="text-emerald-600 hover:underline font-mono"
          >
            Aan Trust Handshake Home
          </button>
        </div>
      </footer>

    </div>
  );
}
