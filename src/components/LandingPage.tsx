import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  Fingerprint, 
  ArrowRight, 
  Loader2, 
  Cpu, 
  Sparkles, 
  Key,
  Gamepad2,
  Users,
  Wallet,
  ShoppingBag,
  GraduationCap,
  X,
  Code,
  Zap,
  AlertCircle,
  Database,
  Activity,
  Server,
  Layers,
  FileText,
  Network,
  Calculator,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import AanShieldLogo from './AanShieldLogo';
import AanSignupForm from './AanSignupForm';
import Footer from './Footer';
import { translations, Language } from '../lib/translations';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: (email?: string) => void;
}

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('aan_selected_language') as Language) || 'English';
  });

  const t = (key: string) => {
    const dict = translations[language] || translations['English'];
    return dict[key] || translations['English'][key] || key;
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as Language);
    localStorage.setItem('aan_selected_language', newLang);
  };

  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [activeSpeedStep, setActiveSpeedStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Gaming');

  // Contact Sales form states
  const [showContactOverlay, setShowContactOverlay] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactVolume, setContactVolume] = useState('10k_100k');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Interactive Pricing Calculator states
  const predefinedSteps = [1000, 5000, 10000, 25000, 50000, 75000, 100000, 250000, 500000, 750000, 1000000];
  const [calcSliderIndex, setCalcSliderIndex] = useState(4); // Default to 50,000 MAU (index 4)
  const [minContractVal, setMinContractVal] = useState(250); // Default to $250, configurable $250 to $500

  // Auto-running fast animation for Section 8 (Integration Process Speed test)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeedStep(prev => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Handle smooth scrolling for hash links on load and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Initial scroll on mount/view change
    setTimeout(handleHashChange, 200);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleContinue = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setConnectionLogs([]);
    
    const logs = [
      "Initializing secure sandbox enclave...",
      "Extracting local machine telemetry signatures...",
      "Generating ephemeral zero-knowledge keypairs...",
      "Cryptographic handshake complete. Authorization granted."
    ];

    let currentLogIndex = 0;
    
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setConnectionLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => {
          setIsConnecting(false);
          setShowAuthOverlay(false);
          const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
          if (isAuthenticated) {
            onNavigate('partner', '/dashboard');
          } else {
            onStartDemoSession();
          }
        }, 800);
      }
    }, 450);
  };

  const handleOpenAuth = () => {
    setShowAuthOverlay(true);
    setShowSignup(false);
    setIsConnecting(false);
  };

  const platformOverviews: Record<string, {
    headline: string;
    description: string;
    bullets: { title: string; text: string }[];
    integrations: string[];
    technicalDetail: string;
  }> = {
    Gaming: {
      headline: "Enforce competitive fairness and hardware integrity.",
      description: "Secure multiplayer matchmaking and high-stakes competitive leagues without compromising player privacy.",
      bullets: [
        { title: "Hardware Attestation", text: "Cryptographically verify user hardware and client binary signatures before letting players join lobbies." },
        { title: "Anti-Sybil Protections", text: "Flag automated farm networks, multi-boxing setups, and bot account clusters using privacy-safe posture telemetry." },
        { title: "Matchmaking Security", text: "Inject ZK-backed humanness assertions into existing queue systems to secure rank-tier matchmaking." }
      ],
      integrations: ["Unreal Engine SDK", "Unity Package", "C++ Native Library"],
      technicalDetail: "Attestation hashes are verified off-path via secure enclaves with less than 15ms latency."
    },
    Social: {
      headline: "Establish peer trust and clean up spam at the edge.",
      description: "Build robust, high-integrity human networks by verifying real humans without intrusive ID tracking.",
      bullets: [
        { title: "Privacy-Preserved Proof", text: "Verify that each profile corresponds to a unique living person using non-reversible biometric hashes." },
        { title: "Edge Spam Mitigation", text: "Stop bot swarms, coordinated astroturfing campaigns, and auto-generated content spam before it impacts feeds." },
        { title: "No Personal Linkage", text: "No phone numbers, emails, or government IDs are ever stored or linked to social profiles in cleartext." }
      ],
      integrations: ["REST API / Webhooks", "React Web Components", "OAuth App Gateway"],
      technicalDetail: "Leverages decentralized zero-knowledge proofs (ZKP) to attest uniqueness without data replication."
    },
    Finance: {
      headline: "Secure transaction pipelines with zero-knowledge posture compliance.",
      description: "Ensure that sensitive account actions and high-volume trades originate from secure, authorized environments.",
      bullets: [
        { title: "Isolated Secure Enclaves", text: "Perform critical risk evaluations and proof verifications inside hardware-hardened TEE environments." },
        { title: "ZK-AML / Compliance", text: "Confirm standard anti-money laundering and geographical blocklist requirements without exposing identity fields." },
        { title: "Account Takeover Shield", text: "Instantly challenge session-jacking, credential stuffing, and advanced device spoofing attempts." }
      ],
      integrations: ["gRPC Core Interface", "Backend Node SDK", "Hardware Security Module Proxy"],
      technicalDetail: "Fully certified SOC2 Type II and GDPR compliant workflow. Private data never touches cleartext servers."
    },
    Commerce: {
      headline: "Defeat release scalpers and fraud networks instantly.",
      description: "Deliver highly-demanded physical and digital drops exclusively to real, loyal human customers.",
      bullets: [
        { title: "Advanced Bot Mitigation", text: "Filter checkout scripts and scalping automation software before they can deplete limited inventory reserves." },
        { title: "Payment Fingerprint Analysis", text: "Correlate harmless device postures with transaction signals to block fraudulent credit card syndicates." },
        { title: "Frictionless Human Experience", text: "Loyal customers bypass verification steps entirely, while suspicious postures are challenged silently." }
      ],
      integrations: ["Shopify Custom Plugin", "Edge Worker Middleware", "API Route Gateway"],
      technicalDetail: "Real-time posture evaluations are processed directly inside Cloudflare Workers or Vercel Edge networks."
    },
    Education: {
      headline: "Protect assessment integrity and issue tamper-proof credentials.",
      description: "Enable modern academic verification and secure digital testing environments while respecting student privacy rights.",
      bullets: [
        { title: "Achievement Ledgers", text: "Issue persistent, tamper-proof digital degrees and certificates verified with a single click." },
        { title: "Privacy-Respecting Exams", text: "Audit local session parameters during online assessments without invasive proctor screen recording." },
        { title: "Instant Onboarding", text: "Authenticate legitimate student status to automatically grant appropriate access privileges." }
      ],
      integrations: ["LTI Standard Integration", "Verifiable Credentials API", "Student Portal Widgets"],
      technicalDetail: "Supports W3C Verifiable Credentials and Decentralized Identifier (DID) open-source standards."
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative selection:bg-[#00D632]/20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#00D632]">
              <AanShieldLogo strokeWidth={6} />
            </div>
            <span className="text-xl font-bold tracking-tight text-black">Aan</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#product" className="hover:text-black transition-colors">{t('nav_products')}</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">{t('nav_architecture')}</a>
            <a href="#privacy" className="hover:text-black transition-colors">{t('nav_privacy')}</a>
            <a href="#use-cases" className="hover:text-black transition-colors">{t('nav_use_cases')}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenAuth}
              className="px-5 py-2.5 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all active:scale-95"
            >
              {t('btn_launch_pilot')}
            </button>
          </div>
        </div>
      </header>

      {/* ================= SECTION 1: HERO SECTION ================= */}
      <section id="hero" className="min-h-[85vh] flex flex-col justify-center bg-white px-6 py-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold">{t('hero_badge')}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-black leading-[1.05] max-w-xl">
              {t('hero_title')}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-lg">
              {t('hero_desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleOpenAuth}
                className="px-8 py-4 rounded-full bg-[#00D632] hover:bg-[#00b029] text-black font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-[#00D632]/10 hover:shadow-xl hover:shadow-[#00D632]/20 transition-all active:scale-[0.98]"
              >
                <span>{t('btn_launch_pilot')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button 
                onClick={() => setShowContactOverlay(true)}
                className="px-8 py-4 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold text-sm inline-flex items-center justify-center transition-all active:scale-[0.98]"
              >
                {t('btn_contact_sales')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Elegant high-contrast interface display */}
            <div className="w-full max-w-sm bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative">
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border border-slate-200/60 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">AAN NODE LIVE</span>
              </div>

              <div className="space-y-6 pt-4 text-left">
                <div className="w-14 h-14 bg-[#00D632]/10 rounded-2xl flex items-center justify-center text-[#00D632]">
                  <Fingerprint className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold block">Attestation Verdict</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-black tracking-tight">Verified Human</h3>
                    <CheckCircle2 className="w-5 h-5 text-[#00D632] fill-[#00D632]/10 animate-scale-up" />
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>HUMANITY CONFIDENCE</span>
                    <span className="text-slate-900 font-bold">99.8%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00D632] h-full rounded-full w-[99.8%] transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between items-center text-slate-500 pt-1">
                    <span>UNIQUENESS SCORE</span>
                    <span className="text-slate-900 font-bold">HIGH ASSURANCE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: THE CORE PROBLEM ================= */}
      <section id="problem" className="bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/5 rounded-full border border-rose-500/10">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-mono tracking-wider text-rose-500 uppercase font-bold">The Friction vs Security Dilemma</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            Traditional identity tools are broken.
          </h2>

          <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl mx-auto">
            Traditional verification methods demand intrusive government IDs or force legitimate users through frustrating, repetitive CAPTCHA tests. This friction drives away customers, while automated botnets and advanced emulators slip through anyway.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 space-y-3">
              <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">The High-Friction Fail</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Forcing users to upload passports or scan faces during basic signups destroys onboarding conversion. Legit humans abandon the funnel, while professional bad actors purchase synthetic profiles on darknets.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 space-y-3">
              <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">The Passive Telemetry Void</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Standard Web Application Firewalls (WAFs) only review network layer metrics. They miss advanced client-side browser manipulations, custom headless botnets, and coordinated account-creation farms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: THREE-PRODUCT OVERVIEW ================= */}
      <section id="product" className="bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Modular Trust Engine</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight">
              One network. Three core products.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              Designed as independent, composable modules to secure any enterprise platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product 1: Human Assurance */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-[#00D632]/5 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] group-hover:bg-[#00D632]/10 transition-colors">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">1. Human Assurance</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Determines whether an account or interaction is backed by a real, unique, and returning human. Delivers privacy-preserving, biometric-safe proof tokens without raw data retention.
                </p>
              </div>
              <div className="border-t border-slate-200/60 pt-4 text-[10px] font-mono text-slate-400 uppercase font-bold space-y-1.5">
                <div className="flex justify-between"><span>Human confidence</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Uniqueness score</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Signed assurance proofs</span><span className="text-slate-900">Output</span></div>
              </div>
            </div>

            {/* Product 2: Trust Intelligence */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-sky-500/[0.03] border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-500 group-hover:bg-sky-500/[0.08] transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">2. Trust Intelligence</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Analyzes browser telemetry, hardware posture, session histories, and platform signals. Instantly flags emulators, coordinates, anti-detection browsers, and bot networks.
                </p>
              </div>
              <div className="border-t border-slate-200/60 pt-4 text-[10px] font-mono text-slate-400 uppercase font-bold space-y-1.5">
                <div className="flex justify-between"><span>Real-time Risk scoring</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Behavior indicators</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Coordinated farm alerts</span><span className="text-slate-900">Output</span></div>
              </div>
            </div>

            {/* Product 3: Integration Infrastructure */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500/[0.08] transition-colors">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">3. Integration Infrastructure</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Developer-first SDKs, REST APIs, instant webhooks, and secure logging nodes. Fully compatible with any existing tech stack, authentication, or identity provider.
                </p>
              </div>
              <div className="border-t border-slate-200/60 pt-4 text-[10px] font-mono text-slate-400 uppercase font-bold space-y-1.5">
                <div className="flex justify-between"><span>Edge-native APIs</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Signed webhooks</span><span className="text-slate-900">Output</span></div>
                <div className="flex justify-between"><span>Interactive sandbox</span><span className="text-slate-900">Output</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: HOW AAN WORKS ================= */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Architecture Pipeline</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black leading-tight">
              Passive verification, decentralized trust.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              AAN operates transparently behind the scenes without interrupting your client sessions.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 relative overflow-hidden">
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#00D632]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Step 1 */}
            <div className="space-y-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">01</div>
              <h3 className="text-base font-bold text-slate-900">Passive Posture Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Our lightweight client SDK collects secure, mathematical browser characteristics and behavioral signals on-the-fly during standard interactions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">02</div>
              <h3 className="text-base font-bold text-slate-900">Secure Posture Evaluation</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Signals are sent directly to the localized AAN secure enclave. The Trust Engine evaluates behavioral anomalies, hardware matches, and policy overrides.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3.5 relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">03</div>
              <h3 className="text-base font-bold text-slate-900">Signed Verdict Handoff</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                The node signs a secure JWT verdict and dispatches real-time webhooks. Your backend immediately allows access, routes to review, or flags the session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: SIGNAL AND DECISION FLOW ================= */}
      <section id="flow" className="bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Closed Loop attestation</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black">
              Humanness validation without identity risk.
            </h2>
            <p className="text-base text-slate-500 font-light">
              AAN does not replace your authentication or login databases. We supply the verified signals so you can make absolute policy decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200/50 p-8 rounded-[2.5rem] relative">
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[9px] font-mono text-[#00D632] font-bold uppercase tracking-wider block bg-[#00D632]/5 border border-[#00D632]/10 px-3 py-1 rounded-full w-max">
                Input-to-Verdict Pipeline
              </span>
              <h3 className="text-2xl font-bold text-slate-950 tracking-tight">How signals translate into decisions</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                The platform ingests multi-layered behavioral telemetry, WebGL context records, and CPU postures. It evaluates them against active partner policies to issue a final trust decision.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: "Approved", desc: "No bot signals detected. Verified human continuity confirmed." },
                  { title: "Review", desc: "Slight device mismatch or minor velocity anomalies. Triggers MFA / Capcha." },
                  { title: "Denied", desc: "Confirmed WebGL emulator spoofing or massive multi-account syndicates." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D632] mt-1.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound Telemetry Signals Graphic */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Signals Ingested</span>
                <span className="text-[9px] font-mono text-slate-400">REST API / SDK Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-left">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold">CLIENT SIGNALS</span>
                  <p className="text-xs font-bold text-slate-900">Device Posture Fingerprints</p>
                  <p className="text-[10px] text-slate-400 font-light">Resolves browser hardware configurations safely.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-left">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold">BEHAVIOR SIGNALS</span>
                  <p className="text-xs font-bold text-slate-900">Humanity Continuity</p>
                  <p className="text-[10px] text-slate-400 font-light">Analyzes pattern consistency without tracing histories.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-left">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold">IDENTITY SIGNALS</span>
                  <p className="text-xs font-bold text-slate-900">Cryptographic Proof Hashes</p>
                  <p className="text-[10px] text-slate-400 font-light">Hashed phone and email records to verify returning users.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-left">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold">INTEGRITY SIGNALS</span>
                  <p className="text-xs font-bold text-slate-900">Network Proxy Diagnostics</p>
                  <p className="text-[10px] text-slate-400 font-light">Identifies VPN farms, data-center proxies, and hosts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: PRIVACY AND DATA BOUNDARIES ================= */}
      <section id="privacy" className="bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Zero-Knowledge Boundaries</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight">
              Privacy first. By design.
            </h2>
            
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-lg">
              We never store cleartext identifiers, user passwords, or raw biometrics. Security and privacy are mathematically guaranteed.
            </p>

            <div className="space-y-6 pt-2">
              {[
                { label: "No passwords stored", desc: "AAN is not a database of user credentials. We store zero raw personal identifiers." },
                { label: "Anonymized Hash Verification", desc: "User phone records, emails, or hardware keys are immediately salted and hashed on-device." },
                { label: "No Cross-Site tracking", desc: "Zero persistent browser cookies, trackers, or marketing trackers are utilized. Absolute workspace isolation." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D632]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 h-64 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs flex items-center justify-center relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#00D632]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="w-24 h-24 bg-[#00D632]/5 border border-[#00D632]/10 rounded-3xl flex items-center justify-center text-[#00D632] shadow-inner">
                <Lock className="w-10 h-10 stroke-[1.5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: PLATFORM USE CASES ================= */}
      <section id="use-cases" className="bg-white px-6 py-24">
        <div className="max-w-6xl mx-auto w-full text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Ecosystems Secured</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-tight">
              Built for every platform.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-light">
              Select any industry below to see how AAN integrates zero-knowledge trust assertions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Gaming", icon: Gamepad2 },
              { label: "Social", icon: Users },
              { label: "Finance", icon: Wallet },
              { label: "Commerce", icon: ShoppingBag },
              { label: "Education", icon: GraduationCap }
            ].map((platform, idx) => {
              const IconComp = platform.icon;
              const isSelected = selectedPlatform === platform.label;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPlatform(platform.label)}
                  className={`p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center space-y-4 transition-all duration-300 shadow-xs border text-center cursor-pointer ${
                    isSelected 
                      ? "bg-slate-50/50 border-[#00D632]/40 ring-1 ring-[#00D632]/10" 
                      : "bg-white border-slate-100 hover:bg-slate-50/50 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? "bg-[#00D632]/5 border-[#00D632]/30 text-[#00D632]" 
                      : "bg-slate-50 border-slate-150 text-slate-700 hover:text-[#00D632]"
                  }`}>
                    <IconComp className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className={`text-xs font-bold transition-colors ${isSelected ? "text-[#00D632]" : "text-slate-800"}`}>
                    {platform.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Platform Detail Card */}
          <div className="max-w-4xl mx-auto mt-8">
            <AnimatePresence mode="wait">
              {(() => {
                const data = platformOverviews[selectedPlatform] || platformOverviews.Gaming;

                return (
                  <motion.div
                    key={selectedPlatform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200/50 text-left space-y-8 shadow-xs relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D632]/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#00D632] uppercase bg-[#00D632]/5 px-2.5 py-1 rounded-full border border-[#00D632]/10 inline-block">
                        {selectedPlatform} Integration Profile
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
                        {data.headline}
                      </h3>
                      <p className="text-slate-500 text-sm font-light">
                        {data.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/60">
                      {data.bullets.map((bullet, idx) => (
                        <div key={idx} className="space-y-2 bg-white/50 border border-slate-200/40 p-5 rounded-2xl">
                          <div className="flex items-center gap-2 text-[#00D632]">
                            <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                            <h4 className="text-xs font-bold text-black uppercase tracking-wider">{bullet.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-light">{bullet.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Supported Integration Points</span>
                        <div className="flex flex-wrap gap-2">
                          {data.integrations.map((item, idx) => (
                            <span key={idx} className="text-[10px] font-mono font-medium text-slate-600 bg-white border border-slate-150 px-2.5 py-1 rounded-md">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="sm:text-right max-w-xs space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Ecosystem Specification</span>
                        <p className="text-[10px] font-mono text-slate-500 leading-normal">{data.technicalDetail}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: INTEGRATION PROCESS & CODE ================= */}
      <section id="integration" className="bg-slate-50 px-6 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Simple Implementation</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
              Ready in under ten lines of code.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-md">
              AAN is built to plug into any modern framework with a single, simple lightweight client-side SDK and clean API endpoints.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center text-[#00D632]">✓</div>
                <span className="text-slate-700 font-medium">Lightweight SDK &lt; 1KB bundled size</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center text-[#00D632]">✓</div>
                <span className="text-slate-700 font-medium">Zero replacement of existing auth / login mechanisms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00D632]/10 flex items-center justify-center text-[#00D632]">✓</div>
                <span className="text-slate-700 font-medium">Real-time passive telemetry checking in under 45ms</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Elegant high-fidelity code display */}
            <div className="w-full max-w-md bg-black rounded-3xl p-6 shadow-xl relative overflow-hidden text-left border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-medium">verify_humanness.ts</span>
              </div>
              <div className="space-y-4 font-mono text-[11px] leading-relaxed text-slate-300">
                <div className="text-slate-500">// 1. Import the lightweight client SDK</div>
                <div>
                  <span className="text-purple-400">import</span> {`{ AanClient }`} <span className="text-purple-400">from</span> <span className="text-emerald-400">"@aan/sdk"</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">aan</span> = <span className="text-purple-400">new</span> <span className="text-amber-400">AanClient</span>({`{ apiKey: "aan_live_..." }`});
                </div>

                <div className="text-slate-500 pt-2">// 2. Query instant passive trust posture</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">verdict</span> = <span className="text-purple-400">await</span> <span className="text-blue-400">aan</span>.<span className="text-amber-400">evaluate</span>({`{`}
                  <div className="pl-4">
                    <span className="text-slate-400">sessionId:</span> <span className="text-emerald-400">"vss_session_91a0f"</span>
                  </div>
                  {`});`}
                </div>

                <div className="border-t border-slate-800 pt-3 mt-2 text-slate-400">
                  <span className="text-slate-500">// 3. Returns immutable trust payload</span>
                  <div className="text-emerald-400">{`{`}</div>
                  <div className="pl-4 text-emerald-400">
                    <div>"human": <span className="text-white">true</span>,</div>
                    <div>"confidence": <span className="text-white">0.99</span>,</div>
                    <div>"status": <span className="text-white">"APPROVED"</span></div>
                  </div>
                  <div className="text-emerald-400">{`}`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: PILOT CALL TO ACTION ================= */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#00D632] uppercase font-bold">Start Monitoring Today</span>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-950 leading-tight">
              Secure your platform.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-xl mx-auto">
              Ready to verify unique human traffic, eliminate automated botnets, and streamline user onboarding? Let's build.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button 
              onClick={handleOpenAuth}
              className="px-8 py-4 rounded-full bg-black hover:bg-slate-800 text-white font-semibold text-sm transition-all active:scale-[0.98]"
            >
              Launch Pilot
            </button>
            <button 
              onClick={() => setShowContactOverlay(true)}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-semibold text-sm transition-all active:scale-[0.98]"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9.5: PRICING SECTION ================= */}
      <section id="pricing-plans-section" className="bg-slate-50 px-6 py-24 border-t border-b border-slate-100 text-left">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 uppercase font-bold">{t('nav_pricing')}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950">
              {t('pricing_title')}
            </h2>
            <p className="text-slate-500 font-light leading-relaxed max-w-2xl mx-auto text-xs md:text-sm">
              {t('pricing_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left side: Interactive Calculator */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('pricing_interactive_calculator')}</h3>
                  <p className="text-[11px] text-slate-400 font-light">Calculate your customized plan dynamically</p>
                </div>
              </div>

              {/* Slider for Active Users */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-semibold text-slate-700">{t('pricing_active_users_label')}</label>
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    {predefinedSteps[calcSliderIndex].toLocaleString()} <span className="text-xs text-slate-400 font-medium">MAU</span>
                  </span>
                </div>
                
                <input 
                  type="range"
                  min="0"
                  max={predefinedSteps.length - 1}
                  value={calcSliderIndex}
                  onChange={(e) => setCalcSliderIndex(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1k</span>
                  <span>50k</span>
                  <span>100k</span>
                  <span>500k</span>
                  <span>1M</span>
                </div>
              </div>

              {/* Configurable Minimum Contract Selector */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800">{t('pricing_min_contract_label')}</label>
                    <p className="text-[11px] text-slate-400 font-light leading-normal max-w-md">
                      {t('pricing_min_contract_desc')}
                    </p>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-xl self-start sm:self-auto flex-shrink-0">
                    {[250, 350, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMinContractVal(val)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-tight transition-all ${
                          minContractVal === val 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ${val}/mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculation Output Box */}
              <div className="border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 bg-gradient-to-br from-white to-slate-50/40">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t('pricing_estimated_cost')}</div>
                  <p className="text-[11px] text-slate-500 font-light leading-relaxed max-w-sm">
                    Based on {predefinedSteps[calcSliderIndex].toLocaleString()} active users at <span className="font-semibold text-slate-700">$0.05 / MAU</span>. 
                    {predefinedSteps[calcSliderIndex] * 0.05 < minContractVal && (
                      <span className="text-emerald-600 block sm:inline font-medium mt-1 sm:mt-0 sm:ml-1">
                        (Minimum contract floor of ${minContractVal}/mo applied)
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-center sm:text-right flex-shrink-0">
                  <span className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight font-mono">
                    ${Math.max(minContractVal, predefinedSteps[calcSliderIndex] * 0.05).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium block">/ month</span>
                </div>
              </div>

              {/* Enterprise CTA inside calculator */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-slate-100/80 gap-4 text-xs text-slate-500">
                <span className="font-light text-center sm:text-left">
                  {t('pricing_volume_discounts')}
                </span>
                <button
                  onClick={() => setShowContactOverlay(true)}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  {t('pricing_contact_sales')}
                </button>
              </div>
            </div>

            {/* Right side: Standard Pricing Benchmarks */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{t('pricing_examples_title')}</h4>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-xl">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[9px] border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t('pricing_table_header_users')}</th>
                        <th className="px-4 py-3 font-semibold text-right">{t('pricing_table_header_cost')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {[
                        { users: 1000, cost: 50 },
                        { users: 10000, cost: 500 },
                        { users: 50000, cost: 2500 },
                        { users: 100000, cost: 5000 },
                        { users: 500000, cost: 25000 },
                        { users: 1000000, cost: 50000 },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {row.users.toLocaleString()} <span className="text-[10px] text-slate-400 font-light font-sans">MAU</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            ${row.cost.toLocaleString()} <span className="text-[10px] text-slate-400 font-light font-sans">/mo</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-4 text-xs text-slate-500 leading-relaxed font-light">
                  <p>
                    {t('pricing_sold_to_platforms')}
                  </p>
                  <p>
                    All plans include full zero-knowledge proof verification, high-performance webhooks, and unlimited developer integration support.
                  </p>
                </div>
              </div>

              {/* Informative Callout */}
              <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-2xl p-6 flex gap-3.5 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-800">No session-based limits</h5>
                  <p className="font-light leading-relaxed">
                    Unlike legacy systems, AAN is sold to platforms and organizations, and pricing scales automatically based on your active platform users, not individual verification handshakes. Pay strictly for actual active tenants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 10: PROFESSIONAL FOOTER ================= */}
      <Footer 
        onNavigate={onNavigate} 
        onLanguageChange={handleLanguageChange}
        currentLanguage={language}
      />

      {/* ================= SECURE GATE OVERLAY / HANDSHAKE MODAL ================= */}
      <AnimatePresence>
        {showAuthOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isConnecting) setShowAuthOverlay(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              {!isConnecting && (
                <button 
                  onClick={() => setShowAuthOverlay(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {isConnecting ? (
                // Connection Handshake Logger block
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632]">
                      <Loader2 className="w-8 h-8 animate-spin stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black">Verifying Environment</h3>
                      <p className="text-xs text-slate-400 font-light mt-1">Completing zero-knowledge browser check...</p>
                    </div>
                  </div>

                  <div className="bg-black text-[#00D632] font-mono text-[10px] leading-relaxed p-5 rounded-2xl border border-slate-800 space-y-2 h-44 overflow-y-auto text-left">
                    {connectionLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="opacity-60">▸</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="w-1.5 h-3 bg-[#00D632] inline-block animate-pulse ml-0.5" />
                  </div>
                </div>
              ) : showSignup ? (
                // Sign Up form
                <AanSignupForm 
                  onBack={() => setShowSignup(false)} 
                  onSuccess={(email) => {
                    setShowAuthOverlay(false);
                    onStartDemoSession(email);
                  }}
                />
              ) : (
                // Gate Select
                <div className="space-y-8 py-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                     <div className="w-14 h-14 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] p-3">
                      <AanShieldLogo strokeWidth={5} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-black">Establish Secure Connection</h3>
                    <p className="text-xs text-slate-500 font-light max-w-xs">
                      Establish human-identity integrity and access the interactive developer workspace.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleContinue}
                      className="w-full py-4 rounded-2xl bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                      <Shield className="w-4 h-4 text-[#00D632] stroke-[2.5]" />
                      <span>Continue with Aan Guest Sandbox</span>
                    </button>

                    <button 
                      onClick={() => setShowSignup(true)}
                      className="w-full py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>Register / Sign In Organization</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-150 pt-5 flex gap-3 text-left">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-150 text-[#00D632] shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-black font-bold uppercase tracking-wider">Secure Cryptography</h4>
                      <p className="text-[9.5px] text-slate-400 font-light mt-0.5 leading-relaxed">
                        AAN uses advanced client-side telemetry. Raw passwords, names, or biometrics are never collected or stored.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DEDICATED CONTACT SALES PILOT MODAL ================= */}
      <AnimatePresence>
        {showContactOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowContactOverlay(false);
                setContactSuccess(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left animate-[fadeIn_0.25s_ease-out]"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowContactOverlay(false);
                  setContactSuccess(false);
                }}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {contactSuccess ? (
                <div className="space-y-6 py-4 text-center">
                  <div className="w-16 h-16 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] mx-auto">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black">Pilot Request Received</h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
                      Our system integration engineers have provisioned a staging slot for your organization. We will contact you at <span className="font-semibold text-slate-900">{contactEmail}</span> to finalize credentials.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setShowContactOverlay(false);
                        setContactSuccess(false);
                        handleOpenAuth();
                      }}
                      className="w-full py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <span>Explore with Guest Sandbox</span>
                      <ArrowRight className="w-4 h-4 text-[#00D632]" />
                    </button>
                  </div>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!contactEmail.trim()) {
                      alert("Please enter a valid email address.");
                      return;
                    }
                    setContactSuccess(true);
                  }}
                  className="space-y-6 py-2"
                >
                  <div className="space-y-2 text-center pb-2">
                    <div className="w-14 h-14 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] p-3 mx-auto">
                      <Sparkles className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-black">Contact AAN Enterprise Sales</h3>
                    <p className="text-xs text-slate-500 font-light max-w-xs mx-auto">
                      Initiate custom zero-knowledge attestation pilot programs tailored to your infrastructure scale.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                        Corporate Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-xs text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                        Estimated Monthly Verifications
                      </label>
                      <select
                        value={contactVolume}
                        onChange={(e) => setContactVolume(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-2xl px-3.5 py-3 text-xs text-slate-900"
                      >
                        <option value="10k_100k">10,000 to 100,000 / mo</option>
                        <option value="100k_1m">100,000 to 1,000,000 / mo</option>
                        <option value="1m_plus">Over 1,000,000 / mo</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                        Custom Posture Constraints / Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your anti-abuse or user verification goals..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-xs text-slate-900 resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                  >
                    <span>Submit Pilot Request</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
