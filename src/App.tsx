import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import PartnerDashboard from './components/PartnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import TrustDocsPortal from './components/TrustDocsPortal';
import AanAcademy from './components/AanAcademy';
import TermsOfServiceView from './components/TermsOfServiceView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import SecurityView from './components/SecurityView';
import ContactView from './components/ContactView';
import AanShieldLogo from './components/AanShieldLogo';
import { Shield, Hammer, Users, HeartHandshake, FileText, Settings, Code, BookOpen, ChevronDown, ChevronUp, GraduationCap, Lock, Unlock, ArrowLeft, LogOut, Home, Activity } from 'lucide-react';
import { isAcademyEnabled } from './academyConfig';
import { isBrandEnabled } from './brandConfig';
import { motion, AnimatePresence } from 'motion/react';
import { isPrivilegedEmail, getRoleDisplay } from './lib/authorization';
import { isAuthenticated as checkAuth, getSessionEmail, getSessionOrgName, clearSecureSession, getSessionRole } from './lib/sessionManager';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [sessionIdParam, setSessionIdParam] = useState<string>("");
  const [docsSubSection, setDocsSubSection] = useState<string>("docs");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [academySelectedId, setAcademySelectedId] = useState<string>("intro");
  const [isAanAccessed, setIsAanAccessed] = useState<boolean>(() => {
    return checkAuth();
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return getSessionEmail();
  });
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [showInactivityAlert, setShowInactivityAlert] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>(() => {
    return getSessionOrgName();
  });
  const isUserAuthenticated = isAanAccessed || checkAuth();

  useEffect(() => {
    if (isUserAuthenticated) {
      setOrgName(getSessionOrgName());
    } else {
      setOrgName("");
    }
  }, [isUserAuthenticated, userEmail, currentPage]);

  // Clean SPA custom routing synchronized with standard window.history and role-based guards
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const authenticated = checkAuth();
      const email = getSessionEmail() || userEmail;
      const isAdmin = getSessionRole() === "admin";

      const validSubSections = [
        'docs', 'api-ref', 'sdks', 'changelog', 'github', 'security', 'privacy',
        'trust', 'disclosure', 'status', 'mission', 'research', 'roadmap',
        'pricing', 'support', 'terms'
      ];
      const cleanPath = path.replace('/', '');

      if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        if (!authenticated) {
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
        if (!authenticated) {
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
        if (!isAcademyEnabled()) {
          setCurrentPage('landing');
          window.history.replaceState({}, '', '/');
        } else {
          const lessonId = path.replace('/academy/', '') || "intro";
          setAcademySelectedId(lessonId);
          setCurrentPage('academy');
        }
      } else if (path === '/terms' || path === '/terms/') {
        setCurrentPage('terms');
      } else if (path === '/privacy' || path === '/privacy/') {
        setCurrentPage('privacy');
      } else if (path === '/security' || path === '/security/') {
        setCurrentPage('security');
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
  }, [userEmail, isAanAccessed]);

  // Safe navigation director with role-based destination interceptors
  const navigateTo = (page: string, customPath?: string, preferredLessonId?: string) => {
    const authenticated = checkAuth();
    const email = getSessionEmail() || userEmail;
    const isAdmin = getSessionRole() === "admin";

    let targetPage = page;
    let targetPath = customPath || "";

    if (authenticated) {
      if (targetPage === 'partner' && isAdmin) {
        targetPage = 'admin';
        targetPath = '/admin';
      } else if (targetPage === 'admin' && !isAdmin) {
        targetPage = 'partner';
        targetPath = '/dashboard';
      }
    } else {
      const publicPages = ['landing', 'terms', 'privacy', 'security', 'contact', 'trustdocs', ...(isAcademyEnabled() ? ['academy'] : [])];
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
        terms: '/terms',
        privacy: '/privacy',
        security: '/security',
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
    const authenticated = checkAuth();
    const email = getSessionEmail() || userEmail;
    const isAdmin = getSessionRole() === "admin";
    const homePage = isAdmin ? 'admin' : 'partner';
    const homePath = isAdmin ? '/admin' : '/dashboard';

    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1];
      if (prevPage === 'landing') {
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
        terms: '/terms',
        privacy: '/privacy',
        security: '/security',
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
    clearSecureSession();
    setIsAanAccessed(false);
    setUserEmail(null);
    setPageHistory([]);
    navigateTo('landing', '/');
  };

  // Cryptographically secure inactivity detection (10 minutes)
  useEffect(() => {
    if (!isUserAuthenticated) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    let timeoutId: NodeJS.Timeout;

    const handleInactivity = () => {
      console.log("[SECURITY] Inactivity limit of 10 minutes reached. Auto-logging out...");
      handleLogout();
      setShowInactivityAlert(true);
    };

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, INACTIVITY_TIMEOUT);
    };

    // Listen to standard interaction triggers
    const interactionEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'click'
    ];

    interactionEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Initialize timer on mount or auth change
    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      interactionEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isUserAuthenticated]);

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
      name: '6. Aan (Antigravity Assurance Network) Academy (/academy)',
      description: 'Structured learn module cataloging dynamic specs, SQL databases columns, schemas and REST APIs.',
      icon: GraduationCap,
      path: '/academy'
    }
  ];

  const activeItem = menuItems.find(item => item.id === currentPage) || menuItems[0];
  const showNavbar = isUserAuthenticated && currentPage !== 'landing';
  const isAdmin = getSessionRole() === "admin";
  const roleDisplay = getRoleDisplay(userEmail);
  const orgDisplay = orgName || "Default Organization";
  const orgInitial = orgDisplay ? orgDisplay.charAt(0).toUpperCase() : "";

  return (
    <div className="relative min-h-screen bg-white flex flex-col text-slate-800 selection:bg-[#00D632]/20 font-sans">
      
      {showNavbar && (
        <div className="sticky top-0 z-50 bg-white/90 border-b border-slate-100 backdrop-blur-md px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Back Button */}
            {currentPage !== 'partner' && currentPage !== 'admin' && (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-full transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {/* Platform Logo & Active Tenant / Company Details */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo(isAdmin ? 'admin' : 'partner')}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-all"
              >
                <div className="w-5 h-5 text-[#00D632]">
                  <AanShieldLogo strokeWidth={6} />
                </div>
                <span className="font-bold text-black tracking-tight text-sm">Aan</span>
              </button>

              {orgDisplay && (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  {/* Company Logo Badge: Premium dark slate rounded-lg with green initial letter */}
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-[#00D632] font-mono text-[10px] font-black flex items-center justify-center shadow-sm select-none shrink-0">
                    {orgInitial}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 leading-none tracking-tight">{orgDisplay}</span>
                    <span className="text-[9px] font-mono text-slate-400 font-semibold leading-none mt-1">
                      {isAdmin ? "Verified Node" : "Active Partner"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unified Central Tabs */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-50 border border-slate-100 p-1 rounded-full">
            {isAdmin ? (
              <button
                onClick={() => navigateTo('admin', '/admin')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${currentPage === 'admin' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black hover:bg-slate-100/50'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('partner', '/dashboard')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${currentPage === 'partner' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black hover:bg-slate-100/50'}`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Partner Portal</span>
              </button>
            )}
          </div>

          {/* Right Hand Side Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs text-black font-semibold leading-none">{userEmail || 'operator@aan.net'}</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                {roleDisplay.label}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-transparent border-none cursor-pointer transition-colors"
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
          />
        )}

        {currentPage === 'partner' && (
          <PartnerDashboard 
            onNavigate={(page) => navigateTo(page)}
            onSetVerificationSessionId={setSessionIdParam}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard 
            onNavigate={(page) => navigateTo(page)} 
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'academy' && (
          <AanAcademy 
            initialLessonId={academySelectedId || "intro"} 
            onNavigatePage={(pageId) => navigateTo(pageId)} 
          />
        )}

        {currentPage === 'trustdocs' && (
          <TrustDocsPortal 
            activeSubSection={docsSubSection}
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            hideFooter={showNavbar}
          />
        )}

        {currentPage === 'terms' && (
          <TermsOfServiceView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            hideFooter={showNavbar}
          />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicyView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            hideFooter={showNavbar}
          />
        )}

        {currentPage === 'security' && (
          <SecurityView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            hideFooter={showNavbar}
          />
        )}

        {currentPage === 'contact' && (
          <ContactView 
            onNavigate={(page, customPath) => navigateTo(page, customPath)}
            hideHeader={showNavbar}
          />
        )}
      </div>

      {showNavbar && (
        <footer className="w-full py-8 border-t border-slate-100 bg-white mt-auto z-20">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side: branding/copyright */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-light">© {new Date().getFullYear()} Aan (Antigravity Assurance Network) Inc. All rights reserved.</span>
            </div>

            {/* Right side: links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              {isAcademyEnabled() && (
                <>
                  <button 
                    onClick={() => navigateTo('academy', '/academy')} 
                    className={`hover:text-black transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 ${currentPage === 'academy' ? 'text-black font-bold' : ''}`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Aan Academy</span>
                  </button>
                  <span className="text-slate-200 font-light">|</span>
                </>
              )}
              <button 
                onClick={() => navigateTo('landing', '/#product')} 
                className="hover:text-black transition-colors cursor-pointer bg-transparent border-none"
              >
                Products
              </button>
              <span className="text-slate-200 font-light">|</span>
              <button 
                onClick={() => navigateTo('trustdocs', '/docs')} 
                className={`hover:text-black transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 ${currentPage === 'trustdocs' ? 'text-black font-bold' : ''}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Docs</span>
              </button>
              <span className="text-slate-200 font-light">|</span>
              <button 
                onClick={() => navigateTo('privacy')} 
                className={`hover:text-black transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'privacy' ? 'text-black font-bold' : ''}`}
              >
                Privacy
              </button>
              <span className="text-slate-200 font-light">|</span>
              <button 
                onClick={() => navigateTo('terms')} 
                className={`hover:text-black transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'terms' ? 'text-black font-bold' : ''}`}
              >
                Terms
              </button>
              <span className="text-slate-200 font-light">|</span>
              <button 
                onClick={() => navigateTo('contact')} 
                className={`hover:text-black transition-colors cursor-pointer bg-transparent border-none ${currentPage === 'contact' ? 'text-black font-bold' : ''}`}
              >
                Contact
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Inactivity Alert Toast */}
      <AnimatePresence>
        {showInactivityAlert && (
          <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-black text-white p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-3 text-left"
            >
              <div className="flex items-center gap-2.5 text-[#00D632]">
                <Lock className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">Inactivity Timeout</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Session Expired</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  You have been automatically signed out after 10 minutes of inactivity to safeguard your dashboard data.
                </p>
              </div>
              <button
                onClick={() => setShowInactivityAlert(false)}
                className="w-full text-center py-2.5 bg-[#00D632]/10 hover:bg-[#00D632]/20 border border-[#00D632]/20 text-[#00D632] hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                Acknowledge & Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
