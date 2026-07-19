import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, UserCheck, Fingerprint, EyeOff, Terminal, HeartHandshake, 
  AlertTriangle, Key, Power, ShieldAlert, Lock, Award, Globe, 
  FileSignature, Mail, Search, Printer, Link as LinkIcon, ArrowUp, 
  Clock, ArrowLeft, ChevronDown, ChevronUp, Check, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyPolicyViewProps {
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

export default function PrivacyPolicyView({ onNavigate }: PrivacyPolicyViewProps) {
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
      title: 'Data Minimization Mandate',
      icon: Shield,
      shortDesc: 'Aan (Antigravity Assurance Network) operates on a strict zero-knowledge, local-first data processing mandate.',
      content: [
        'Aan (Antigravity Assurance Network) is engineered on a fundamental principle of data minimization. We do not store biometric data, physical government documents, or unhashed personal identifiable information (PII) on central servers.',
        'Our verification loops process security and integrity parameters in volatile, short-lived memory (RAM) and generate one-way cryptographic proof vectors. Once the verification session is confirmed, the temporary raw inputs are permanently purged from RAM, leaving only a state-level mathematical assertion.'
      ]
    },
    {
      id: 'section-2',
      num: 2,
      title: 'Telemetry Processed',
      icon: Terminal,
      shortDesc: 'The non-custodial metadata, device signatures, and network attributes we analyze.',
      content: [
        'To detect multi-accounting, emulators, and coordinated automated botnets, Aan (Antigravity Assurance Network) processes device-level security metadata. This includes public hardware signature keys, non-personal device configuration indices, and localized browser environmental variables.',
        'We do not employ cross-site marketing trackers, third-party advertising cookies, or behavioral surveillance engines. All network telemetry analyzed is processed under a strict defensive context to enforce security rules and verify unique humanness.'
      ]
    },
    {
      id: 'section-3',
      num: 3,
      title: 'Zero-Biometrics Guarantee',
      icon: Fingerprint,
      shortDesc: 'How signature templates and validation checks bypass central biological databases.',
      content: [
        'Aan (Antigravity Assurance Network) completely replaces legacy biometric databases with modern cryptographic signature Net templates. When a user completes a verification gesture, we calculate a multi-dimensional, localized vector hash that describes the uniqueness of the action without recording physical facial features or voice signatures.',
        'Because the resulting templates are irreversible one-way cryptographic hashes, they cannot be reconstructed back into physical representations. This guarantees that even in the event of an external network compromise, user physical identities remain totally secure and uncompromised.'
      ]
    },
    {
      id: 'section-4',
      num: 4,
      title: 'Data Retention & Purges',
      icon: Clock,
      shortDesc: 'Our automated memory purge timelines and persistent logs constraints.',
      content: [
        'All active gesture-capture inputs exist exclusively in transient server memory for the duration of the verification flow, with a hard timeout of ten (10) minutes.',
        'The resulting signed verification assertion (proof token) remains valid for thirty (30) days to prevent repetitive verification fatigue. System logs containing high-level security event counters, blocked bypass attempts, and anonymized audit indexes are retained in secure, encrypted archives for compliance tracing before automated deletion.'
      ]
    },
    {
      id: 'section-5',
      num: 5,
      title: 'Third-Party Data Sale Restrictions',
      icon: EyeOff,
      shortDesc: 'Absolute prohibition on sharing, marketing, or commercializing client metadata.',
      content: [
        'We do not sell, rent, lease, or commercialize any verified user hashes or security telemetry. The cryptographic proofs issued by Aan (Antigravity Assurance Network) are shared exclusively with the registered partner application that initiated the verification hand-shake.',
        'Our service model is entirely funded through enterprise licensing and consumption fees, ensuring that our core incentives are aligned with protecting user privacy rather than monetizing user data.'
      ]
    },
    {
      id: 'section-6',
      num: 6,
      title: 'GDPR & CCPA Rights',
      icon: Globe,
      shortDesc: 'Providing clear right-to-be-forgotten and user-initiated deletion mechanisms.',
      content: [
        'Aan (Antigravity Assurance Network) provides comprehensive support for CCPA and GDPR compliance. Any individual verified through Aan possesses the absolute right to query, lock, or request the immediate purge of their cryptographic signature links.',
        'Integrators and partner organizations can initiate automated compliance deletion loops directly via the Partner Portal or by calling our RESTful erasure endpoints. Upon receipt, all historical hashes linked to the specified external ID are permanently scrubbed from the platform ledger.'
      ]
    },
    {
      id: 'section-7',
      num: 7,
      title: 'Contact & Compliance Auditing',
      icon: Mail,
      shortDesc: 'Our physical address, compliance channel, and independent audit schedules.',
      content: [
        'To ensure our zero-knowledge models remain robust, Aan (Antigravity Assurance Network) undergoes recurring independent security, SOC2 Type II, and privacy-compliance audits by certified external agencies.',
        'If you have specific regulatory compliance questions, require a formal Data Processing Agreement (DPA), or want to contact our Data Protection Officer (DPO), please reach out to us at: privacy@aan.org, or write to: Aan (Antigravity Assurance Network) Trust Infrastructure, Attn: Privacy Operations, 548 Market St, San Francisco, CA 94104.'
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
    <div className="relative min-h-screen bg-slate-50 text-slate-600 selection:bg-emerald-500/10 selection:text-slate-900 print:bg-white print:text-black" id="aan-privacy-view">
      
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
            <span>ZERO-KNOWLEDGE PRIVACY POLICY</span>
            <span className="text-slate-200">|</span>
            <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-600 text-[10px] font-bold">
              v2.4.0-COMPLIANT
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <header className="py-24 px-6 md:py-32 border-b border-slate-200 bg-white print:py-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/[0.01] rounded-full blur-[160px] pointer-events-none" />
        <div className="max-w-[800px] mx-auto text-left relative z-10">
          <span className="font-mono text-xs text-emerald-600 font-bold uppercase tracking-widest block mb-4 print:hidden">
            DECENTRALIZED PRIVACY CHARTER
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-light text-slate-900 tracking-tight leading-none mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 font-sans font-light leading-relaxed mb-10 max-w-[700px] print:text-black">
            Our unwavering commitment to extreme data minimization, zero biometric warehousing, and local-first cryptographic validation.
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
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Audit Status</span>
              <span className="text-sm font-mono text-emerald-600 mt-1 block font-bold print:text-black">SOC-2 TYPE II</span>
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
              <span className="font-sans font-semibold text-xs text-slate-900 uppercase tracking-widest block">POLICY SECTIONS</span>
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
                <span>PRINT CHARTER</span>
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
                placeholder="Search privacy elements (e.g., zero-knowledge, biometrics, logs)..."
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
          <span>© 2026 Aan (Antigravity Assurance Network) Trust Infrastructure. All claims cryptographic and non-custodial.</span>
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
