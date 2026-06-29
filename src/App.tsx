import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import VerifySessionFlow from './components/VerifySessionFlow';
import PartnerDashboard from './components/PartnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BrandBook from './components/BrandBook';
import TrustDocsPortal from './components/TrustDocsPortal';
import AANAcademy from './components/AANAcademy';
import { Shield, Hammer, Users, HeartHandshake, FileText, Settings, Code, BookOpen, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { isAcademyEnabled } from './academyConfig';
import { isBrandEnabled } from './brandConfig';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [sessionIdParam, setSessionIdParam] = useState<string>("");
  const [docsSubSection, setDocsSubSection] = useState<string>("docs");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [academySelectedId, setAcademySelectedId] = useState<string>("intro");

  // Clean SPA custom routing synchronized with standard window.history
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const validSubSections = [
        'docs', 'api-ref', 'sdks', 'changelog', 'github', 'security', 'privacy',
        'trust', 'disclosure', 'status', 'mission', 'research', 'roadmap',
        'pricing', 'support', 'contact', 'terms'
      ];
      const cleanPath = path.replace('/', '');

      if (path.startsWith('/verify/session/')) {
        const id = path.replace('/verify/session/', '');
        setSessionIdParam(id);
        setCurrentPage('verify');
      } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        setCurrentPage('partner');
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentPage('admin');
      } else if (path === '/brand' || path.startsWith('/brand/')) {
        if (isBrandEnabled()) {
          setCurrentPage('brand');
        } else {
          setCurrentPage('landing');
        }
      } else if (path === '/academy' || path.startsWith('/academy/')) {
        const lessonId = path.replace('/academy/', '') || "intro";
        setAcademySelectedId(lessonId);
        setCurrentPage('academy');
      } else if (validSubSections.includes(cleanPath)) {
        setDocsSubSection(cleanPath);
        setCurrentPage('trustdocs');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Mount check
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Safe navigation director
  const navigateTo = (page: string, customPath?: string, preferredLessonId?: string) => {
    setCurrentPage(page);
    let targetPath = "/";
    if (customPath) {
      targetPath = customPath;
    } else {
      const routes: Record<string, string> = {
        landing: '/',
        partner: '/dashboard',
        admin: '/admin',
        brand: '/brand',
        academy: '/academy/' + (preferredLessonId || academySelectedId || 'intro'),
        verify: '/verify/session/' + (sessionIdParam || "vss_session_unconfirmed_9a4")
      };
      targetPath = routes[page] || '/';
    }
    if (page === 'academy' && preferredLessonId) {
      setAcademySelectedId(preferredLessonId);
    }
    window.history.pushState({}, '', targetPath);
  };

  // Helper trigger to start a custom onboarding verification instantly from landing triggers
  const startDemoVerification = () => {
    navigateTo('verify', '/verify/session/vss_session_unconfirmed_9a4');
  };

  const menuItems = [
    {
      id: 'landing',
      name: '1. Public Landing (/)',
      description: 'Value proposition landing explaining decentralized trust & humanness verification standard.',
      icon: HeartHandshake,
      path: '/'
    },
    {
      id: 'partner',
      name: '2. Partner Portal (/dashboard)',
      description: 'Enterprise developer space to configure keys, query secure logs, and manage webhooks.',
      icon: Code,
      path: '/dashboard'
    },
    {
      id: 'verify',
      name: '3. User Scan Onboarding',
      description: 'Unique humanness validation environment employing multi-modal non-custodial telemetry.',
      icon: Users,
      path: '/verify/session/' + (sessionIdParam || 'vss_session_unconfirmed_9a4')
    },
    {
      id: 'admin',
      name: '4. Compliance Console (/admin)',
      description: 'Administrative ledger visualization, policy configuration overrides, and security outputs.',
      icon: Shield,
      path: '/admin'
    },
    {
      id: 'brand',
      name: '5. Brand Core (/brand)',
      description: 'Core corporate tokens, visual scales, layout pairs, color palettes, and typographic patterns.',
      icon: BookOpen,
      path: '/brand'
    },
    {
      id: 'academy',
      name: '6. AAN Academy (/academy)',
      description: 'Structured learn module cataloging dynamic specs, SQL databases columns, schemas and REST APIs.',
      icon: GraduationCap,
      path: '/academy'
    }
  ];

  const activeItem = menuItems.find(item => item.id === currentPage) || menuItems[0];

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col text-slate-200">
      
      {/*  AI STUDIO WORKSPACE INTERFACE SWITCHER HEADER */}
      {/* Explains roles and lets user jump straight to any part of the MVP */}
      <div className="relative z-50 bg-slate-900 border-b border-blue-900/40 text-slate-300 py-3 px-4 text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="bg-blue-950 text-blue-400 border border-blue-900/40 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">AAN Sandbox Engine</span>
            <span className="text-slate-400 hidden md:inline font-sans font-medium text-[11px]">Toggle MVP stages seamlessly to test the entire security loop.</span>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full sm:w-auto px-4 py-2 rounded text-[10px] font-mono font-bold uppercase cursor-pointer flex items-center justify-between sm:justify-start gap-2.5 border bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-[0.98] transition-all"
            aria-expanded={isMenuOpen}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Current Stage: <span className="text-blue-400 font-extrabold">{activeItem.name}</span></span>
            </div>
            {isMenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Slide-down Accordion Menu Drawer */}
      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            key="sandbox-menu-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative z-40 max-h-[60vh] sm:max-h-[75vh] md:max-h-none overflow-y-auto bg-slate-950/95 border-b border-blue-900/40 backdrop-blur-md shadow-[inset_0_16px_20px_-12px_rgba(0,0,0,0.95),inset_0_-16px_20px_-12px_rgba(0,0,0,0.95),inset_0_8px_16px_-8px_rgba(30,58,138,0.35),inset_0_-8px_16px_-8px_rgba(30,58,138,0.35)]"
          >
            <div className={`max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${
              menuItems.filter(item => 
                (item.id !== 'academy' || isAcademyEnabled()) && 
                (item.id !== 'brand' || isBrandEnabled())
              ).length
            } gap-4 animate-fadeIn`}>
              {menuItems.filter(item => 
                (item.id !== 'academy' || isAcademyEnabled()) && 
                (item.id !== 'brand' || isBrandEnabled())
              ).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id, item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-full group ${
                      isActive 
                        ? 'bg-blue-600/95 border-blue-500 text-white shadow-lg' 
                        : 'bg-slate-900/40 hover:bg-slate-900 border-slate-850/70 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-950 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-900 transition-all'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isActive && (
                        <span className="bg-white/20 text-white text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded tracking-wide">Active</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs font-mono tracking-tight mb-1">{item.name}</h4>
                      <p className={`text-[10px] leading-relaxed font-sans ${isActive ? 'text-blue-105/90' : 'text-slate-400 line-clamp-2'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render current view dynamically */}
      <div className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <LandingPage 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            onStartDemoSession={startDemoVerification} 
          />
        )}

        {currentPage === 'partner' && (
          <PartnerDashboard 
            onNavigate={(page) => navigateTo(page)}
            onSetVerificationSessionId={(id) => setSessionIdParam(id)}
          />
        )}

        {currentPage === 'verify' && (
          <VerifySessionFlow 
            sessionId={sessionIdParam || 'vss_session_unconfirmed_9a4'}
            onComplete={() => navigateTo('partner', '/dashboard')}
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard 
            onNavigate={(page) => navigateTo(page)} 
          />
        )}

        {currentPage === 'brand' && (
          <BrandBook />
        )}

        {currentPage === 'academy' && (
          <AANAcademy 
            initialLessonId={academySelectedId || "intro"} 
            onNavigatePage={(pageId) => navigateTo(pageId)} 
          />
        )}

        {currentPage === 'trustdocs' && (
          <TrustDocsPortal 
            activeSubSection={docsSubSection}
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
          />
        )}
      </div>
    </div>
  );
}
