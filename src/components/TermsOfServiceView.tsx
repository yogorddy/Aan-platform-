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
      title: 'Who May Use AAN',
      icon: Scale,
      shortDesc: 'Age boundaries, representational authority, and legal usage eligibility.',
      content: [
        'You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction) to use our decentralized services. If we learn that you are under the minimum age, we will immediately suspend your identity claim or active session credentials.',
        'If you are accepting these Terms of Service on behalf of an enterprise, company, corporation, government agency, or other legal entity, you represent and warrant that you possess full authorized legal power to do so and have the capability to bind such entity to these Terms. In such cases, the terms "you" and "your" will refer strictly to that organization.'
      ]
    },
    {
      id: 'section-2',
      num: 2,
      title: 'Accounts',
      icon: UserCheck,
      shortDesc: 'Account registration, API credentials, and client security responsibilities.',
      content: [
        'To access the AAN Trust Infrastructure, Developer Dashboard, or operational metrics, you must complete our partner registration process and set up secure credentials. You agree to provide accurate, truthful, current, and complete details, and maintain their accuracy for the lifetime of your organization\'s space.',
        'You are exclusively responsible for safeguarding your account access credentials, private API keys, cryptographic secrets, and temporary session tokens. Any activity or transaction occurring under your account is deemed authorized by your organization. You must notify our trust team immediately upon isolating any credential leak or unauthorized access.'
      ]
    },
    {
      id: 'section-3',
      num: 3,
      title: 'Verification Services',
      icon: Fingerprint,
      shortDesc: 'Cryptographic proof hashes, consent-first verification, and humanness standards.',
      content: [
        'AAN provides automated digital middleware services to assess unique human status, evaluate contextual device telemetry, and verify identity claims without the permanent central collection of private documents.',
        'All verification flows must be initiated strictly with explicit, conscious, and affirmative end-user actions. AAN evaluates risk indices dynamically, and produces signed verification assertion hashes or cryptographic proof metadata. Raw physical files, unhashed passwords, or static government registers are excluded from centralized database logging, guaranteeing privacy-by-design.'
      ]
    },
    {
      id: 'section-4',
      num: 4,
      title: 'Privacy',
      icon: EyeOff,
      shortDesc: 'Our data minimization directives, zero-knowledge processing, and policy reference.',
      content: [
        'We respect and guard client privacy as a fundamental standard. Our gathering, processing, and transient parsing of metadata or security telemetry indicators is comprehensively outlined in our core Privacy Policy.',
        'By integrating the AAN platform, you agree to our data minimization guidelines. We enforce zero-knowledge and local-first computing architectures where feasible, ensuring that telemetry is processed and validated as close to the user\'s local hardware node as technically possible.'
      ]
    },
    {
      id: 'section-5',
      num: 5,
      title: 'Developer Platform & API',
      icon: Terminal,
      shortDesc: 'API licenses, consumption scopes, rate-limiting rules, and prohibited actions.',
      content: [
        'AAN grants you a limited, non-exclusive, non-sublicensable, non-transferable, revocable license to access our RESTful endpoints, SDK packages, and dashboard user interfaces solely to verify your platform users.',
        'You are strictly forbidden from attempting to reverse-engineer, decompile, or disassemble our proprietary telemetry algorithms, or attempting to discover the underlying mathematical structures of our humanness score models. Any automated scraping, stress-testing, or adversarial fuzzing of AAN production APIs will trigger an instant security lockdown.'
      ]
    },
    {
      id: 'section-6',
      num: 6,
      title: 'Partner Responsibilities',
      icon: HeartHandshake,
      shortDesc: 'Legal compliance for integrating clients, GDPR guidelines, and user consent.',
      content: [
        'Organizations integrating the AAN trust widget are classified as independent data controllers or co-processors. You must secure clear, legally compliant consent from your platform visitors before invoking AAN verification scripts or location checks.',
        'You represent and warrant that your data practices fully comply with applicable privacy standards, including GDPR, CCPA, and regional digital trust regulations. You must publish an accurate privacy notice to your end-users explaining that AAN is utilized as a secure verification processor.'
      ]
    },
    {
      id: 'section-7',
      num: 7,
      title: 'Acceptable Use',
      icon: AlertTriangle,
      shortDesc: 'Severe payload restrictions, forbidden raw identity ingestion, and model integrity.',
      content: [
        'Our public API endpoints are fortified systems. Partners are strictly prohibited from feeding raw, unhashed government documents, physical passport photos, social security numbers, or non-claim linked personal credentials into standard operational telemetry fields.',
        'You must not use AAN to build secondary biometric tracking registries, facilitate shadow user tracking, harvest device-fingerprint lists, or craft adversarial agents aimed at simulating fake human interaction patterns.'
      ]
    },
    {
      id: 'section-8',
      num: 8,
      title: 'Intellectual Property',
      icon: Key,
      shortDesc: 'AAN proprietary systems, logo guidelines, and patent declarations.',
      content: [
        'The AAN logo, Adaptive Trust middleware designs, telemetry risk-scoring models, cryptographic protocol software, database structures, and global dashboard interfaces are the sole intellectual property of AAN and its direct licensors.',
        'These Terms of Service do not transfer any intellectual ownership rights, patented technologies, or proprietary model parameters to your organization. Any feedback, ideas, or suggestions you submit to us regarding AAN can be integrated into our systems without any licensing fee, attribution, or restriction.'
      ]
    },
    {
      id: 'section-9',
      num: 9,
      title: 'Suspension & Termination',
      icon: Power,
      shortDesc: 'Automatic triggers for account suspension and termination of API keys.',
      content: [
        'We reserve the right, in our sole discretion, to suspend or permanently terminate your developer access, active API keys, and database sync structures immediately and without prior warning if we isolate behavior representing a security hazard.',
        'Grounds for immediate termination include: (a) structural breaches of our Acceptable Use policy; (b) deliberate evasion of rate limits; (c) passing raw personal datasets; or (d) platform stability hazards caused by erroneous integration loops. You may terminate your association at any time by deleting your keys and ceasing all API queries.'
      ]
    },
    {
      id: 'section-10',
      num: 10,
      title: 'Disclaimers',
      icon: ShieldAlert,
      shortDesc: '"As-Is" operational delivery, zero-guarantees for total threat suppression.',
      content: [
        'AAN TRUST INFRASTRUCTURE AND ASSOCIATED APIS ARE PROVIDED TO ALL INTEGRATING PARTNERS ON AN "AS IS" AND "AS AVAILABLE" STRUCTURAL BASIS. WE EXPLICITLY DISCLAIM ANY AND ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, AND NON-INFRINGEMENT.',
        'WE DO NOT WARRANT OR GUARANTEE THAT THE ADAPTIVE TRUST PROTOCOLS WILL SUPPRESS 100% OF DISTRIBUTED BOTNET ATTACKS, SYBIL VECTORS, OR SOPHISTICATED GENERATIVE FRAUD. CONTEXTUAL ASSESSMENT FEEDBACK IS PROBABILISTIC, AND RETRIEVED AT YOUR OWN RISK.'
      ]
    },
    {
      id: 'section-11',
      num: 11,
      title: 'Limitation of Liability',
      icon: Lock,
      shortDesc: 'Strict liability boundaries and waiver of consequential damages.',
      content: [
        'TO THE MAXIMUM LIMIT ALLOWED UNDER APPLICABLE STATUTES, IN NO EVENT SHALL AAN, ITS ENGINEERING TEAM, OR DIRECT DIRECTORS BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, EXEMPLARY, OR SPECIAL DAMAGES, OR LOSS OF BUSINESS PROFITS, REVENUES, DATA, OR TRUST ASSETS.',
        'THIS DISMISSAL APPLIES WHETHER THE DAMAGE ARISES FROM INTEGRATION DROP-OFFS, FALSE POSITIVE ASSURANCES, TEMPORARY THROTTLING SUSPENSIONS, OR DATA BREACHES ON EXTERNAL PARTNER SERVERS OUTSIDE OUR IMMEDIATE SANDBOX CONTROL.'
      ]
    },
    {
      id: 'section-12',
      num: 12,
      title: 'Indemnification',
      icon: Award,
      shortDesc: 'Obligation to defend AAN against third-party claims or integration violations.',
      content: [
        'You agree to defend, indemnify, and hold harmless AAN and its directors, staff, and contractors from and against any third-party claims, legal actions, damages, settlement losses, liabilities, or defense expenses (including standard legal fees) originating from your organization\'s use of AAN.',
        'This includes claims related to: (a) your violation of these Terms; (b) failure to secure compliant end-user consent; or (c) passing unlawful telemetry payloads through your registered API clients.'
      ]
    },
    {
      id: 'section-13',
      num: 13,
      title: 'Governing Law',
      icon: Globe,
      shortDesc: 'Jurisdiction of legal disputes and San Francisco court assignments.',
      content: [
        'These Terms of Service and any contractual disputes or claims arising out of or related to our platform shall be governed by, analyzed, and construed under the laws of the State of California, disregarding conflicts of law principles.',
        'Any legal suit, action, arbitration, or proceeding originating from these Terms must be filed exclusively in the federal or state courts located in the City and County of San Francisco, California. Both parties consent to personal jurisdiction in these courts.'
      ]
    },
    {
      id: 'section-14',
      num: 14,
      title: 'Changes to These Terms',
      icon: FileSignature,
      shortDesc: '30-day notice for material revisions and version update rules.',
      content: [
        'AAN actively refines its trust systems and reserves the right to revise or update these Terms of Service as our architecture evolves. We will always post updated terms with a modified revision date on this legal portal.',
        'For material changes that restrict your developer privileges or increase organizational responsibilities, we will notify you at least 30 days prior to the update taking effect. Continuing to call our APIs or request session proofs after changes become active represents full legal agreement to the modified terms.'
      ]
    },
    {
      id: 'section-15',
      num: 15,
      title: 'Contact',
      icon: Mail,
      shortDesc: 'Corporate address, legal email contacts, and response timelines.',
      content: [
        'If you have compliance questions, regulatory audits, custom SLA queries, or wish to report a potential policy issue, please reach out to our legal and trust operations committee.',
        'Email contact: legal@aan.org | Physical correspondence: AAN Trust Infrastructure, Attn: Legal and Trust Operations, 548 Market St, San Francisco, CA 94104. We make every effort to review and answer standard enterprise requests within 3 business days.'
      ]
    }
  ];

  // Auto-expand sections that match a search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // By default, only section-1 could be open, or everything collapsed
      return;
    }
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

  // IntersectionObserver to highlight the current active section in sticky TOC
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
        rootMargin: '-20% 0px -60% 0px', // focused in top-middle of the viewport
        threshold: 0,
      }
    );

    // Track active sections
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

  // Expand / Collapse all handlers
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

  // Toggle single accordion
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Smooth scroll to an anchor link
  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Toggle accordion open to make sure it is readable
      setExpandedSections(prev => ({ ...prev, [id]: true }));
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update browser URL hash quietly
      window.history.pushState(null, '', `#${id}`);
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  // Copy link to a specific section and show brief confirmation tooltip
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

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Helper function to highlight text that matches the search term
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="bg-blue-500/30 text-blue-200 px-0.5 rounded font-semibold selection:bg-blue-600 font-sans">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Check if a section contains search hits
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
    <div className="relative min-h-screen bg-[#0d0e12] text-[#e3e5eb] selection:bg-blue-600 selection:text-white print:bg-white print:text-black">
      
      {/* 1. SCROLL PROGRESS INDICATOR (Fixed top) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#161922] z-50 print:hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-75 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK TO TRUST DOCS BAR */}
      <div className="border-b border-[#1b1e28] bg-[#111319]/80 backdrop-blur px-6 py-4 sticky top-1 z-40 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => onNavigate('trustdocs', 'docs')}
            className="flex items-center gap-2 text-xs text-[#78819a] hover:text-white transition-all font-mono font-bold uppercase tracking-wider group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Trust Center</span>
          </button>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>PLATFORM SECURITY CLAUSE</span>
            <span className="text-[#1b1e28]">|</span>
            <span className="bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded text-blue-400 text-[10px] font-bold">
              v2.4.0-ENTERPRISE
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <header className="py-24 px-6 md:py-32 border-b border-[#171a23] bg-[#0d0e12] print:py-10">
        <div className="max-w-[800px] mx-auto text-left">
          
          {/* Tagline */}
          <span className="font-mono text-xs text-blue-400 font-black uppercase tracking-widest block mb-4 print:hidden animate-pulse">
            DECENTRALIZED ASSURANCE CONTRACT
          </span>

          {/* Large Typography heading (72px desktop / 40px mobile) */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black text-white tracking-tight leading-none mb-6">
            Terms of Service
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#78819a] font-sans font-light leading-relaxed mb-10 max-w-[700px] print:text-black">
            The agreement governing your use of the AAN Trust Infrastructure, Developer Platform, APIs, Dashboard, and Verification Services.
          </p>

          {/* Version Metadata block */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-[#171a23] print:border-slate-300">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Effective Date</span>
              <span className="text-sm font-sans font-medium text-slate-300 mt-1 block print:text-black">October 24, 2024</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Last Updated</span>
              <span className="text-sm font-sans font-medium text-slate-300 mt-1 block print:text-black">July 4, 2026</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Version History</span>
              <span className="text-sm font-mono text-blue-400 mt-1 block font-bold print:text-black">v2.4.0-Enterprise</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12" ref={docContainerRef}>

        {/* 3. STICKY TABLE OF CONTENTS (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 print:hidden">
          <div className="sticky top-24 space-y-6 select-none">
            <div className="pb-3 border-b border-[#171a23]">
              <span className="font-sans font-black text-xs text-white uppercase tracking-widest block">TABLE OF CONTENTS</span>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Navigate sections & anchor locations</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id;
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToAnchor(sec.id)}
                    className={`w-full text-left font-sans text-xs py-2 px-3 rounded transition-all flex items-center gap-2.5 cursor-pointer ${
                      isActive 
                        ? 'bg-[#171a23] text-white font-bold border-l-2 border-blue-500' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#111319]/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="truncate">
                      {sec.num}. {sec.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sticky Actions in sidebar */}
            <div className="pt-4 border-t border-[#171a23] flex flex-col gap-2.5">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 text-xs font-mono font-bold bg-[#111319] hover:bg-[#171a23] text-slate-300 py-2 px-3 rounded border border-[#1b1e28] transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>PRINT DOCUMENT</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 4. MAIN CONTENT AREA (Centered 800px max width container) */}
        <main className="col-span-1 lg:col-span-9 max-w-[800px] mx-auto w-full select-text print:max-w-none print:p-0">

          {/* MOBILE TOC DROPDOWN (Shown on mobile/tablet instead of sticky sidebar) */}
          <div className="block lg:hidden mb-8 print:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-[#111319] border border-[#1b1e28] rounded-lg text-slate-200 text-xs font-mono font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>SECTIONS INDEX ({activeSection.replace('section-', '')}/15)</span>
              </div>
              {mobileMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-2 bg-[#111319] border border-[#1b1e28] rounded-lg overflow-hidden absolute left-6 right-6 z-30 shadow-2xl max-h-[50vh] overflow-y-auto"
                >
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToAnchor(sec.id)}
                      className="w-full text-left px-4 py-3 border-b border-[#171a23] hover:bg-[#171a23] text-xs font-sans text-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>{sec.num}. {sec.title}</span>
                      {activeSection === sec.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. "BEFORE YOU READ" LEGAL SUMMARY CARD */}
          <section className="mb-16 print:mb-8" id="before-you-read">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl print:border-slate-300 print:bg-white print:text-black">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 print:hidden" />
              
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-sans font-bold text-white uppercase tracking-wider print:text-black">
                  Before You Read
                </h2>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-6 print:text-black">
                AAN provides enterprise trust software. This executive digest offers a non-binding summary of our fundamental terms in less than 30 seconds. This does not replace reading the fully binding legal text below.
              </p>

              <ul className="space-y-4 font-sans text-sm text-[#ccd0db] print:text-black">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Data Ownership</strong>: You retain full ownership, title, and responsibility over your information and custom telemetry profiles.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Consent Requirement</strong>: Verification actions occur strictly with user-initiated actions and authorization.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Privacy Boundaries</strong>: AAN never holds, matches, or shares raw user identity documents or unhashed dossiers with external partners.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Signed Assurances</strong>: Partners receive signed cryptographic verification receipts — not the underlying private attributes of the user.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Lawful Integration</strong>: Integrating developers must act legally, responsibly, and prevent API credential exposure.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Throttling Rules</strong>: Misuse of sandbox allocations, scraping, or bypass attempts results in immediate API access termination.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 text-xs font-mono font-bold print:border-slate-300">
                    ✓
                  </span>
                  <div>
                    <strong className="text-white font-medium print:text-black">Liability Limits</strong>: Risk assessment indicators are probabilistic and provided on an "As-Is" basis with strictly capped liability.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 6. SEARCH BAR & SYSTEM CONTROLS */}
          <div className="mb-12 flex flex-col sm:flex-row items-center gap-4 bg-[#111319] p-4 rounded-xl border border-[#1b1e28] print:hidden">
            
            {/* Interactive Search inside legal document */}
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search legal sections (e.g. rate limit, privacy, consent)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#1b1e28] focus:border-blue-500/50 outline-none text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-lg font-sans placeholder-slate-600 transition-colors"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Fast accordion controls */}
            <div className="flex items-center gap-2 shrink-0 select-none">
              <button 
                onClick={handleExpandAll}
                className="text-[11px] font-mono font-bold text-slate-400 hover:text-white bg-[#0d0e12] hover:bg-slate-950 px-3 py-2 rounded-md border border-[#1b1e28] transition-all cursor-pointer"
              >
                EXPAND ALL
              </button>
              <button 
                onClick={handleCollapseAll}
                className="text-[11px] font-mono font-bold text-slate-400 hover:text-white bg-[#0d0e12] hover:bg-slate-950 px-3 py-2 rounded-md border border-[#1b1e28] transition-all cursor-pointer"
              >
                COLLAPSE ALL
              </button>
            </div>
          </div>

          {/* SEARCH STATUS FEEDBACK */}
          {searchTerm && (
            <div className="mb-8 font-sans text-xs text-slate-400 flex items-center justify-between print:hidden">
              <span>Found <strong className="text-blue-400">{filteredSections.length}</strong> matching sections for query "{searchTerm}"</span>
              <button onClick={() => setSearchTerm('')} className="text-blue-400 font-bold hover:underline">
                Show All Sections
              </button>
            </div>
          )}

          {/* 7. DETAILED COMPLIANCE CLAUSES ACCORDION */}
          <div className="space-y-16 print:space-y-10">
            {filteredSections.map((sec, idx) => {
              const isExpanded = !!expandedSections[sec.id];
              const Icon = sec.icon;
              const hasHighlight = searchTerm.trim() !== '';

              return (
                <div 
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => { sectionsRef.current[sec.id] = el; }}
                  className="group pt-12 border-t border-[#171a23] first:border-0 first:pt-0 print:border-slate-300 print:pt-6"
                >
                  {/* Anchor copy action, small hover trigger */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 font-mono text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                      <Icon className="w-3.5 h-3.5" />
                      <span>SECTION 0{sec.num}</span>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity print:hidden">
                      <button 
                        onClick={(e) => copySectionLink(e, sec.id)}
                        className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[#111319] text-slate-400 hover:text-white px-2.5 py-1 rounded border border-[#1b1e28] cursor-pointer"
                        title="Copy direct section anchor URL to clipboard"
                      >
                        {copiedSectionId === sec.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">COPIED</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3 h-3 text-slate-500" />
                            <span>COPY ANCHOR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Header click to toggle accordion inside body content */}
                  <div 
                    onClick={() => toggleSection(sec.id)}
                    className="flex items-start justify-between cursor-pointer group/hdr select-none print:cursor-default"
                  >
                    <div className="max-w-[700px]">
                      {/* Section Title (40px desktop) */}
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-white tracking-tight leading-tight group-hover/hdr:text-blue-400 transition-colors print:text-black">
                        {highlightText(`${sec.num}. ${sec.title}`, searchTerm)}
                      </h3>
                      <p className="text-base text-slate-400 mt-2 font-sans font-light leading-relaxed print:text-black">
                        {highlightText(sec.shortDesc, searchTerm)}
                      </p>
                    </div>

                    <div className="p-2 text-slate-500 group-hover/hdr:text-slate-300 pt-3.5 print:hidden">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden print:!h-auto print:!opacity-100"
                      >
                        <div className="pt-6 pb-2 space-y-5 text-base md:text-[18px] text-slate-300 leading-relaxed font-sans font-light max-w-[760px] print:text-black print:leading-normal">
                          {sec.content.map((paragraph, pIdx) => (
                            <p key={pIdx}>
                              {highlightText(paragraph, searchTerm)}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Static representation in print so that all text outputs even if collapsed on UI */}
                  <div className="hidden print:block pt-4 space-y-4 text-base text-black font-sans">
                    {sec.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="py-16 text-center border-t border-[#171a23] print:hidden">
                <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-bounce" />
                <h4 className="text-base font-sans font-bold text-white mb-2">No Matching Legal Clauses Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  No sections match your current filters. Clear your search or type another term (like 'Acceptable', 'API', 'Limit', or 'Law').
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-xs font-mono font-bold text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 px-4 py-2 rounded-md border border-blue-900/30 transition-all cursor-pointer"
                >
                  RESET SEARCH FIELD
                </button>
              </div>
            )}
          </div>

          {/* 8. HISTORICAL VERSION DIRECTORY */}
          <section className="mt-24 pt-12 border-t border-[#171a23] print:border-slate-300 print:mt-10" id="version-history">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-blue-400" />
              <h4 className="text-base font-sans font-bold text-white uppercase tracking-wider print:text-black">
                Platform Revision Index
              </h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6 print:text-black">
              AAN maintains version logs representing evolutionary updates to our API rate guidelines, security policies, and privacy structures.
            </p>

            <div className="space-y-4 font-mono text-[11px] print:text-black">
              
              <div className="p-4 bg-[#111319] border border-[#1b1e28] rounded-lg flex flex-col sm:flex-row justify-between gap-4 print:border-slate-300 print:bg-white print:text-black">
                <div>
                  <span className="text-white font-bold block print:text-black">Version 2.4.0 (Enterprise Suite Release)</span>
                  <p className="text-slate-400 text-[10px] mt-1 leading-normal print:text-black">
                    Aligned Acceptable Use controls to strictly prohibit unhashed government registration checks on standard sandbox nodes.
                  </p>
                </div>
                <div className="text-slate-500 text-right sm:text-right text-[10px] shrink-0 font-bold">
                  <span>July 4, 2026 (ACTIVE)</span>
                </div>
              </div>

              <div className="p-4 bg-[#111319]/40 border border-[#171a23] rounded-lg flex flex-col sm:flex-row justify-between gap-4 print:border-slate-300">
                <div>
                  <span className="text-slate-300 block">Version 2.3.0 (Operational Expansion Release)</span>
                  <p className="text-slate-500 text-[10px] mt-1 leading-normal">
                    Upgraded throttling limits for integration endpoints and refined disclosure guidelines under Safe Harbor standards.
                  </p>
                </div>
                <div className="text-slate-600 text-right sm:text-right text-[10px] shrink-0">
                  <span>October 24, 2024</span>
                </div>
              </div>

              <div className="p-4 bg-[#111319]/40 border border-[#171a23] rounded-lg flex flex-col sm:flex-row justify-between gap-4 print:border-slate-300">
                <div>
                  <span className="text-slate-300 block">Version 2.2.0 (Local Sandbox Tuning)</span>
                  <p className="text-slate-500 text-[10px] mt-1 leading-normal">
                    Adjusted dynamic local session triggers and updated cryptographic minimizer models.
                  </p>
                </div>
                <div className="text-slate-600 text-right sm:text-right text-[10px] shrink-0">
                  <span>January 15, 2024</span>
                </div>
              </div>

              <div className="p-4 bg-[#111319]/40 border border-[#171a23] rounded-lg flex flex-col sm:flex-row justify-between gap-4 print:border-slate-300">
                <div>
                  <span className="text-slate-300 block">Version 2.1.0 (Initial Framework Inception)</span>
                  <p className="text-slate-500 text-[10px] mt-1 leading-normal">
                    Inaugural publication of decentralized assurance guidelines and partner integration standards.
                  </p>
                </div>
                <div className="text-slate-600 text-right sm:text-right text-[10px] shrink-0">
                  <span>August 12, 2023</span>
                </div>
              </div>

            </div>
          </section>

        </main>
      </div>

      {/* 9. ENTERPRISE LEGAL FOOTER */}
      <footer className="border-t border-[#171a23] bg-[#0d0e12] py-16 px-6 mt-32 print:hidden select-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-10 flex-wrap">
            
            {/* Left corner identity */}
            <div className="space-y-3">
              <div 
                onClick={() => onNavigate('landing')}
                className="flex gap-0.5 items-end cursor-pointer group"
              >
                <span className="w-1.5 h-4 bg-blue-600 rounded-sm group-hover:bg-blue-500 transition-all" />
                <span className="w-1.5 h-5 bg-white rounded-sm" />
                <span className="font-sans font-black text-white text-xs ml-2 tracking-tight">AAN Trust Standard</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans max-w-xs leading-relaxed">
                Critical digital trust infrastructure. We design privacy-first authentication systems to protect humanness and secure organizations.
              </p>
            </div>

            {/* Right side navigation grids */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest block">Legal</span>
                <div className="flex flex-col gap-2 text-xs font-sans text-slate-400">
                  <button onClick={() => onNavigate('trustdocs', 'terms')} className="text-left hover:text-white cursor-pointer">Terms</button>
                  <button onClick={() => onNavigate('trustdocs', 'privacy')} className="text-left hover:text-white cursor-pointer">Privacy</button>
                  <button onClick={() => onNavigate('trustdocs', 'security')} className="text-left hover:text-white cursor-pointer">Security</button>
                  <button onClick={() => onNavigate('trustdocs', 'trust')} className="text-left hover:text-white cursor-pointer">Cookies</button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest block">Developers</span>
                <div className="flex flex-col gap-2 text-xs font-sans text-slate-400">
                  <button onClick={() => onNavigate('trustdocs', 'docs')} className="text-left hover:text-white cursor-pointer">Documentation</button>
                  <button onClick={() => onNavigate('trustdocs', 'api-ref')} className="text-left hover:text-white cursor-pointer">API Reference</button>
                  <button onClick={() => onNavigate('trustdocs', 'sdks')} className="text-left hover:text-white cursor-pointer">SDK Downloads</button>
                  <button onClick={() => onNavigate('trustdocs', 'status')} className="text-left hover:text-white cursor-pointer">Status</button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest block">Company</span>
                <div className="flex flex-col gap-2 text-xs font-sans text-slate-400">
                  <button onClick={() => onNavigate('trustdocs', 'mission')} className="text-left hover:text-white cursor-pointer">Mission</button>
                  <button onClick={() => onNavigate('trustdocs', 'research')} className="text-left hover:text-white cursor-pointer">Research</button>
                  <button onClick={() => onNavigate('trustdocs', 'roadmap')} className="text-left hover:text-white cursor-pointer">Roadmap</button>
                  <button onClick={() => onNavigate('trustdocs', 'disclosure')} className="text-left hover:text-white cursor-pointer">Disclosure</button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest block">Support</span>
                <div className="flex flex-col gap-2 text-xs font-sans text-slate-400">
                  <button onClick={() => onNavigate('trustdocs', 'support')} className="text-left hover:text-white cursor-pointer">Support Center</button>
                  <button onClick={() => onNavigate('trustdocs', 'contact')} className="text-left hover:text-white cursor-pointer">Contact Sales</button>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#171a23] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-600">
            <span>Copyright © 2026 AAN Trust Infrastructure Inc. All rights reserved.</span>
            <span className="text-slate-500">DECENTRALIZED ASSURANCE ARCHITECTURE</span>
          </div>
        </div>
      </footer>

      {/* 10. FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all cursor-pointer z-40 print:hidden"
            title="Scroll back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
