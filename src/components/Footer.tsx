import React, { useState } from 'react';
import { 
  Shield, 
  Check, 
  Globe, 
  ChevronDown, 
  ArrowUpRight
} from 'lucide-react';
import AanShieldLogo from './AanShieldLogo';
import { translations, Language } from '../lib/translations';

interface FooterProps {
  onNavigate: (page: string, customPath?: string) => void;
  onLanguageChange?: (lang: string) => void;
  currentLanguage?: string;
}

export default function Footer({ onNavigate, onLanguageChange, currentLanguage }: FooterProps) {
  const [regionDropdown, setRegionDropdown] = useState(false);
  
  const selectedRegion = currentLanguage || 'English';

  const t = (key: string) => {
    const dict = translations[selectedRegion as Language] || translations['English'];
    return dict[key] || translations['English'][key] || key;
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-12 pb-10 px-6 font-sans text-left relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* ================= ROW 1 ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          
          {/* Logo & Description */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 text-[#00D632]">
                <AanShieldLogo strokeWidth={6} />
              </div>
              <span className="text-xl font-bold tracking-tight text-black uppercase">AAN</span>
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            
            <p className="text-[11px] text-slate-400 font-normal leading-relaxed max-w-[200px]">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Navigation Links (Products and Interactive Demo links removed as requested) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <button 
              onClick={() => onNavigate('trustdocs', '/docs')}
              className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {t('nav_docs')}
            </button>
            <div className="h-3 w-px bg-slate-200" />
            <button 
              onClick={() => {
                // Smooth scroll to the landing page pricing section if on landing page, otherwise navigate
                const element = document.getElementById('pricing-plans-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('landing', '/#pricing-plans-section');
                }
              }}
              className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {t('nav_pricing')}
            </button>
            <div className="h-3 w-px bg-slate-200" />
            <button 
              onClick={() => onNavigate('contact')}
              className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {t('nav_contact')}
            </button>
          </div>

          {/* Controls: Region Selector (Social media icons removed as requested) */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            {/* Region/Language selector */}
            <div className="relative">
              <button 
                onClick={() => setRegionDropdown(!regionDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-[11px] text-slate-500 hover:text-slate-800 font-medium transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedRegion}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 transition-transform duration-200" />
              </button>

              {regionDropdown && (
                <div className="absolute bottom-full mb-1 right-0 bg-white border border-slate-100 rounded-lg overflow-hidden shadow-lg z-50 text-[11px] min-w-[120px]">
                  {['English', 'Deutsch', 'Español', 'Français'].map((region) => (
                    <button
                      key={region}
                      onClick={() => {
                        if (onLanguageChange) {
                          onLanguageChange(region);
                        }
                        setRegionDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer ${selectedRegion === region ? 'bg-slate-50 font-bold text-black' : ''}`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ================= ROW 2 ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-[11px]">
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500 font-medium">
            {/* Verified Badge */}
            <div className="flex items-center gap-1 text-slate-900 font-semibold pr-2 border-r border-slate-200">
              <Shield className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
              <span>{t('footer_verified')}</span>
              <Check className="w-3 h-3 text-blue-600 stroke-[3.5]" />
            </div>

            {/* Copyright */}
            <span>© {new Date().getFullYear()} AAN, Inc. {t('footer_rights')}</span>

            <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

            {/* Policy & Legal inline links */}
            <div className="flex flex-wrap items-center gap-x-3 text-slate-400">
              <button onClick={() => onNavigate('terms')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0">{t('footer_terms')}</button>
              <span className="text-slate-200">•</span>
              <button onClick={() => onNavigate('privacy')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0">{t('footer_privacy')}</button>
              <span className="text-slate-200">•</span>
              <button onClick={() => onNavigate('security')} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0">{t('footer_security')}</button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D632] inline-block animate-pulse" />
              <span>{t('footer_systems_ok')}</span>
            </div>

            <div className="h-3.5 w-px bg-slate-200" />

            <button 
              onClick={() => onNavigate('trustdocs', '/status')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 transition-colors"
            >
              <span>{t('footer_status_page')}</span>
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
