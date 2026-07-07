import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import VerifySessionFlow from './components/VerifySessionFlow';
import PartnerDashboard from './components/PartnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import TrustDocsPortal from './components/TrustDocsPortal';
import AANAcademy from './components/AANAcademy';
import TermsOfServiceView from './components/TermsOfServiceView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import ContactView from './components/ContactView';
import AANShieldLogo from './components/AANShieldLogo';
import { Shield, Hammer, Users, HeartHandshake, FileText, Settings, Code, BookOpen, ChevronDown, ChevronUp, GraduationCap, Lock, Unlock, ArrowLeft, LogOut, Home, Activity } from 'lucide-react';
import { isAcademyEnabled } from './academyConfig';
import { isBrandEnabled } from './brandConfig';
import { motion, AnimatePresence } from 'motion/react';
import { isPrivilegedEmail, getRoleDisplay } from './lib/authorization';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [sessionIdParam, setSessionIdParam] = useState<string>("");
  const [docsSubSection, setDocsSubSection] = useState<string>("docs");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [academySelectedId, setAcademySelectedId] = useState<string>("intro");
  const [isAanAccessed, setIsAanAccessed] = useState<boolean>(() => {
    return localStorage.getItem('aan_authenticated') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('aan_user_email');
  });
  const [pageHistory, setPageHistory] = useState<string[]>([]);

  // Clean SPA custom routing synchronized with standard window.history and role-based guards
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
      const email = localStorage.getItem('aan_user_email') || userEmail;
      const isAdmin = isPrivilegedEmail(email);

      const validSubSections = [
        'docs', 'api-ref', 'sdks', 'changelog', 'github', 'security', 'privacy',
        'trust', 'disclosure', 'status', 'mission', 'research', 'roadmap',
        'pricing', 'support', 'terms'
      ];
      const cleanPath = path.replace('/', '');

      if (path.startsWith('/verify/session/')) {
        const id = path.replace('/verify/session/', '');
        setSessionIdParam(id);
        setCurrentPage('verify');
      } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        if (!isAuthenticated) {
          setCurrentPage('landing');
          window.history.replaceState({}, '', '/');
        } else if (isAdmin) {
          // Admin users are auto-redirected to the Admin Console
          setCurrentPage('admin');
          window.history.replaceState({}, '', '/admin');
        } else {
          setCurrentPage('partner');
        }
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        if (!isAuthenticated) {
          setCurrentPage('landing');
          window.history.replaceState({}, '', '/');
        } else if (!isAdmin) {
          // Non-privileged users are forbidden from accessing admin routes
          setCurrentPage('partner');
          window.history.replaceState({}, '', '/dashboard');
        } else {
          setCurrentPage('admin');
        }
      } else if (path === '/contact' || path === '/contact/') {
        setCurrentPage('contact');
      } else if (path === '/brand' || path.startsWith('/brand/') || path === '/docs' || path.startsWith('/docs/')) {
        const sub = path.replace('/', '').split('/')[0] || 'docs';
        setDocsSubSection(sub);
        setCurrentPage('trustdocs');
      } else if (path === '/academy' || path.startsWith('/academy/')) {
        const lessonId = path.replace('/academy/', '') || "intro";
        setAcademySelectedId(lessonId);
        setCurrentPage('academy');
      } else if (path === '/terms' || path === '/terms/') {
        setCurrentPage('terms');
      } else if (path === '/privacy' || path === '/privacy/') {
        setCurrentPage('privacy');
      } else if (validSubSections.includes(cleanPath)) {
        setDocsSubSection(cleanPath);
        setCurrentPage('trustdocs');
      } else {
        if (isAuthenticated) {
          if (isAdmin) {
            setCurrentPage('admin');
            window.history.replaceState({}, '', '/admin');
          } else {
            setCurrentPage('partner');
            window.history.replaceState({}, '', '/dashboard');
          }
        } else {
          setCurrentPage('landing');
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Mount check
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [userEmail, isAanAccessed]);

  // Safe navigation director with role-based destination interceptors
  const navigateTo = (page: string, customPath?: string, preferredLessonId?: string) => {
    const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
    const email = localStorage.getItem('aan_user_email') || userEmail;
    const isAdmin = isPrivilegedEmail(email);

    let targetPage = page;
    let targetPath = customPath || "";

    if (isAuthenticated) {
      if (targetPage === 'landing' || targetPage === 'verify') {
        targetPage = isAdmin ? 'admin' : 'partner';
        targetPath = isAdmin ? '/admin' : '/dashboard';
      } else if (targetPage === 'partner' && isAdmin) {
        targetPage = 'admin';
        targetPath = '/admin';
      } else if (targetPage === 'admin' && !isAdmin) {
        targetPage = 'partner';
        targetPath = '/dashboard';
      }
    } else {
      const publicPages = ['landing', 'terms', 'privacy', 'contact', 'trustdocs', 'academy', 'verify'];
      if (!publicPages.includes(targetPage)) {
        targetPage = 'landing';
        targetPath = '/';
      }
    }

    if (targetPage !== currentPage) {
      setPageHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(targetPage);

    if (!targetPath) {
      const routes: Record<string, string> = {
        landing: '/',
        partner: '/dashboard',
        admin: '/admin',
        brand: '/brand',
        academy: '/academy/' + (preferredLessonId || academySelectedId || 'intro'),
        verify: '/verify/session/' + (sessionIdParam || "vss_session_unconfirmed_9a4"),
        terms: '/terms',
        privacy: '/privacy',
        contact: '/contact',
        trustdocs: '/docs'
      };
      targetPath = routes[targetPage] || '/';
    }
    if (targetPage === 'academy' && preferredLessonId) {
      setAcademySelectedId(preferredLessonId);
    }
    window.history.pushState({}, '', targetPath);
  };

  const goBack = () => {
    const isAuthenticated = localStorage.getItem('aan_authenticated') === 'true';
    const email = localStorage.getItem('aan_user_email') || userEmail;
    const isAdmin = isPrivilegedEmail(email);
    const homePage = isAdmin ? 'admin' : 'partner';
    const homePath = isAdmin ? '/admin' : '/dashboard';

    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1];
      if (prevPage === 'landing' || prevPage === 'verify') {
        navigateTo(homePage, homePath);
        return;
      }
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
      const routes: Record<string, string> = {
        landing: '/',
        partner: '/dashboard',
        admin: '/admin',
        brand: '/brand',
        academy: '/academy/' + (academySelectedId || 'intro'),
        verify: '/verify/session/' + (sessionIdParam || "vss_session_unconfirmed_9a4"),
        terms: '/terms',
        privacy: '/privacy',
        contact: '/contact',
        trustdocs: '/docs'
      };
      const targetPath = routes[prevPage] || '/';
      window.history.pushState({}, '', targetPath);
    } else {
      navigateTo(homePage, homePath);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aan_authenticated');
    localStorage.removeItem('aan_user_email');
    setIsAanAccessed(false);
    setUserEmail(null);
    setPageHistory([]);
    navigateTo('landing', '/');
  };

  // Helper trigger to start a custom onboarding verification instantly from landing triggers
  const startDemoVerification = (email?: string) => {
    if (email) {
      setUserEmail(email);
      localStorage.setItem('aan_user_email', email);
    }
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
      id: 'verify',
      name: '2. User Scan Onboarding',
      description: 'Unique humanness validation environment employing multi-modal non-custodial telemetry.',
      icon: Users,
      path: '/verify/session/' + (sessionIdParam || 'vss_session_unconfirmed_9a4')
    },
    {
      id: 'partner',
      name: '3. Partner Portal (/dashboard)',
      description: 'Enterprise developer space to configure keys, query secure logs, and manage webhooks.',
      icon: Code,
      path: '/dashboard'
    },
    {
      id: 'admin',
      name: '4. Compliance Console (/admin)',
      description: 'Administrative ledger visualization, policy configuration overrides, and security outputs.',
      icon: Shield,
      path: '/admin'
    },
    {
      id: 'trustdocs',
      name: '5. Resource Directory (/docs)',
      description: 'Technical platform documentation, API references, security standards, and trust matrix.',
      icon: FileText,
      path: '/docs'
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
  const isUserAuthenticated = isAanAccessed || localStorage.getItem('aan_authenticated') === 'true';
  const showNavbar = isUserAuthenticated && currentPage !== 'landing' && currentPage !== 'verify';
  const isAdmin = isPrivilegedEmail(userEmail);
  const roleDisplay = getRoleDisplay(userEmail);

  return (
    <div className="relative min-h-screen bg-[#050507] flex flex-col text-slate-300">
      
      {showNavbar && (
        <div className="sticky top-0 z-50 bg-[#08090c] border-b border-white/[0.06] backdrop-blur-md px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Back Button */}
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-[#00E676] bg-white/[0.02] hover:bg-[#00E676]/10 border border-white/[0.08] hover:border-[#00E676]/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Platform Logo */}
            <div className="flex items-center gap-2">
              <AANShieldLogo className="w-4 h-4" strokeWidth={10} />
              <span className="font-semibold text-white tracking-tight text-xs uppercase">AAN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#58E38A] animate-ping" />
            </div>
          </div>

          {/* Unified Central Tabs */}
          <div className="flex items-center flex-wrap gap-1 bg-black/40 border border-white/[0.04] p-1 rounded-xl">
            {isAdmin ? (
              <button
                onClick={() => navigateTo('admin', '/admin')}
                className={`flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${currentPage === 'admin' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('partner', '/dashboard')}
                className={`flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${currentPage === 'partner' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Partner Portal</span>
              </button>
            )}
          </div>

          {/* Right Hand Side Controls with User Metadata & Badging */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right font-mono">
              <span className="text-[10px] text-white font-medium leading-none">{userEmail || 'operator@aan.net'}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md mt-1 font-bold ${roleDisplay.badgeClass}`}>
                {roleDisplay.label}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-[#00E676]/5 border border-[#00E676]/15 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[10px] font-mono text-[#00E676] tracking-wider uppercase font-bold">SESSION SECURED</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-rose-400 bg-transparent border-none cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

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
            onComplete={() => {
              setIsAanAccessed(true);
              localStorage.setItem('aan_authenticated', 'true');
              navigateTo('partner', '/dashboard');
            }}
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard 
            onNavigate={(page) => navigateTo(page)} 
          />
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

        {currentPage === 'terms' && (
          <TermsOfServiceView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
          />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicyView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
          />
        )}

        {currentPage === 'contact' && (
          <ContactView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
          />
        )}
      </div>

      {showNavbar && (
        <footer className="w-full py-8 border-t border-white/[0.04] bg-[#08090c] mt-auto z-20">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side: branding/copyright */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-600">AAN TRUST INFRASTRUCTURE © 2026</span>
            </div>

            {/* Right side: links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
              <button 
                onClick={() => navigateTo('academy', '/academy')} 
                className={`hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 ${currentPage === 'academy' ? 'text-[#58E38A] font-bold' : ''}`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>AAN Academy</span>
              </button>
              <span className="text-slate-800">•</span>
              <button 
                onClick={() => navigateTo('trustdocs', '/docs')} 
                className={`hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 ${currentPage === 'trustdocs' ? 'text-[#58E38A] font-bold' : ''}`}
              >
                <FileText className="w-3 h-3" />
                <span>Resource Docs</span>
              </button>
              <span className="text-slate-800">•</span>
              <button 
                onClick={() => navigateTo('privacy')} 
                className={`hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'privacy' ? 'text-[#58E38A] font-bold' : ''}`}
              >
                Privacy Policy
              </button>
              <span className="text-slate-800">•</span>
              <button 
                onClick={() => navigateTo('terms')} 
                className={`hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'terms' ? 'text-[#58E38A] font-bold' : ''}`}
              >
                Terms of Service
              </button>
              <span className="text-slate-800">•</span>
              <button 
                onClick={() => navigateTo('contact')} 
                className={`hover:text-[#58E38A] transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'contact' ? 'text-[#58E38A] font-bold' : ''}`}
              >
                Contact
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
