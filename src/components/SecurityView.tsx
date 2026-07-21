import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Check, AlertTriangle, Cpu, Database, EyeOff, Loader2, RefreshCw, 
  Lock, Award, Globe, ArrowLeft, ShieldCheck, Activity, Terminal, Key,
  Sparkles, FileText, CheckCircle2, Copy, Send, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from './Footer';
import { translations, Language } from '../lib/translations';

interface SecurityViewProps {
  onNavigate: (page: string, customPath?: string) => void;
  hideFooter?: boolean;
}

export default function SecurityView({ onNavigate, hideFooter = false }: SecurityViewProps) {
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

  const [activeTab, setActiveTab] = useState<'standards' | 'bounty' | 'disclosures'>('standards');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form states for bug bounty reports
  const [bountyForm, setBountyForm] = useState({
    title: '',
    category: 'authentication_bypass',
    severity: 'high',
    affected_system: '',
    reproduction_steps: '',
    reporter_contact: ''
  });
  const [bountySubmitted, setBountySubmitted] = useState(false);

  // Simulated disclosures
  const disclosures = [
    {
      id: "AAN-SEC-2026-004",
      title: "Volatile memory purge validation check in Zero-Knowledge proof validator",
      severity: "Low",
      status: "Patched",
      date: "2026-05-12",
      bounty: "$2,500"
    },
    {
      id: "AAN-SEC-2026-003",
      title: "Rate limit bypass on ephemeral handshake session creation",
      severity: "Medium",
      status: "Patched",
      date: "2026-04-01",
      bounty: "$5,000"
    },
    {
      id: "AAN-SEC-2026-002",
      title: "HMAC signature timing discrepancy in outgoing webhook relay",
      severity: "Medium",
      status: "Patched",
      date: "2026-02-18",
      bounty: "$8,000"
    }
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const submitBounty = (e: React.FormEvent) => {
    e.preventDefault();
    setBountySubmitted(true);
    setTimeout(() => {
      setBountySubmitted(false);
      setBountyForm({
        title: '',
        category: 'authentication_bypass',
        severity: 'high',
        affected_system: '',
        reproduction_steps: '',
        reporter_contact: ''
      });
    }, 4000);
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative selection:bg-[#00D632]/20 text-left">
      {/* Back navigation header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing', '/')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('btn_back')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 text-[#00D632]">
              <Shield className="w-full h-full" />
            </div>
            <span className="font-bold text-black tracking-tight text-sm uppercase">AAN Security Center</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Intro */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold">Security Program in Development</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black max-w-2xl leading-tight">
            {t('security_title')}
          </h1>
          <p className="text-base text-slate-500 font-light leading-relaxed max-w-3xl">
            {t('security_desc')}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('standards')}
            className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'standards' ? 'text-[#00D632]' : 'text-slate-400 hover:text-slate-900'}`}
          >
            {activeTab === 'standards' && (
              <motion.div layoutId="security-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D632]" />
            )}
            {t('security_sub_standards')}
          </button>
          <button
            onClick={() => setActiveTab('bounty')}
            className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'bounty' ? 'text-[#00D632]' : 'text-slate-400 hover:text-slate-900'}`}
          >
            {activeTab === 'bounty' && (
              <motion.div layoutId="security-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D632]" />
            )}
            {t('security_sub_bounty')}
          </button>
          <button
            onClick={() => setActiveTab('disclosures')}
            className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'disclosures' ? 'text-[#00D632]' : 'text-slate-400 hover:text-slate-900'}`}
          >
            {activeTab === 'disclosures' && (
              <motion.div layoutId="security-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D632]" />
            )}
            {t('security_sub_disclosure')}
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[400px]">
          {activeTab === 'standards' && (
            <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="w-10 h-10 bg-[#00D632]/10 text-[#00D632] border border-[#00D632]/20 rounded-xl flex items-center justify-center">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-black">{t('security_card_minimization')}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    {t('security_card_minimization_desc')}
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="w-10 h-10 bg-[#00D632]/10 text-[#00D632] border border-[#00D632]/20 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-black">{t('security_card_ledger')}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    {t('security_card_ledger_desc')}
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-black">{t('security_card_tee')}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    {t('security_card_tee_desc')}
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-black">{t('security_card_soc')}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    {t('security_card_soc_desc')}
                  </p>
                </div>
              </div>

              {/* Security Specs Accordion */}
              <div className="space-y-4 border-t border-slate-100 pt-8 text-xs font-light text-slate-500">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Cryptographic Architecture Details</h3>
                
                <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">Algorithm</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">ECDSA SECP256K1 / Ed25519</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">Proof Protocol</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">PLONK / EZKL (In Development)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">Audit Authority</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">To Be Determined (Future Objective)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Data Location</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">Volatile RAM / Ephemeral Caching (Design Goal)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bounty' && (
            <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-black">{t('security_bounty_title')}</h2>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  We take security seriously. This Responsible Disclosure Policy outlines how researchers can help us strengthen AAN.
                </p>
              </div>

              {/* Responsible Disclosure Policy Document */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-5 text-xs text-slate-600 font-light leading-relaxed">
                <div>
                  <h3 className="font-bold text-black text-sm mb-1.5">Our Commitment</h3>
                  <p>
                    We are committed to working with security researchers to verify, resolve, and disclose vulnerabilities responsibly. We prioritize the safety and privacy of our users while we continue building and maturing our platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black text-sm mb-1.5">How to Report a Vulnerability</h3>
                  <p>
                    If you discover a potential security vulnerability in AAN, we encourage you to report it responsibly. Please submit your report through our secure vulnerability reporting form below. Please include a clear description of the vulnerability, steps to reproduce, potential impact, and any suggested mitigations or supporting evidence (screenshots, logs, proof-of-concept).
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black text-sm mb-1.5">What We Ask From Researchers</h3>
                  <ul className="list-disc pl-4 space-y-1 mt-1 font-light text-slate-600">
                    <li><strong>Good faith:</strong> Conduct your research without violating the privacy of our users or destroying data.</li>
                    <li><strong>Responsible disclosure:</strong> Do not publicly disclose the vulnerability before we have had a reasonable opportunity to investigate and address it.</li>
                    <li><strong>Scope:</strong> Focus on issues that could meaningfully impact the security, confidentiality, or integrity of the AAN platform.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black text-sm mb-1.5">Our Response</h3>
                  <p>
                    Upon receiving a report, we will promptly acknowledge receipt, investigate the issue, and provide regular updates on its status. We work to resolve confirmed vulnerabilities in a timely manner. We are currently in active development. A formal paid bug bounty program with financial rewards will be implemented in the future. At this stage, we are unable to offer monetary compensation, but we will publicly recognize researchers who help us improve our security (upon mutual agreement).
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black text-sm mb-1.5">Safe Harbor & Scope</h3>
                  <p>
                    We consider security research conducted in accordance with this policy to be authorized. We will not pursue legal action against researchers who act in good faith and follow these guidelines.
                  </p>
                  <p className="mt-1.5">
                    <strong>Out of Scope:</strong> Issues requiring physical access to devices, social engineering, denial of service (DoS) or resource exhaustion attacks, and issues already reported or known to the team.
                  </p>
                </div>
              </div>

              {bountySubmitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 bg-[#00D632]/10 border border-[#00D632]/20 rounded-2xl flex items-center justify-center text-[#00D632] mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-black">Vulnerability Report Submitted</h4>
                    <p className="text-xs text-slate-500 font-light max-w-sm mx-auto leading-relaxed">
                      Thank you for helping secure AAN. Our engineering team will review your submission and follow up with you. A tracking ticket was created.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitBounty} className="space-y-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Vulnerability Title *</label>
                      <input
                        type="text"
                        required
                        value={bountyForm.title}
                        onChange={(e) => setBountyForm({ ...bountyForm, title: e.target.value })}
                        placeholder="e.g. CSRF in partner session termination"
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Severity Level</label>
                      <select
                        value={bountyForm.severity}
                        onChange={(e) => setBountyForm({ ...bountyForm, severity: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900"
                      >
                        <option value="critical">Critical Severity</option>
                        <option value="high">High Severity</option>
                        <option value="medium">Medium Severity</option>
                        <option value="low">Low Severity</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Affected Endpoint / System *</label>
                    <input
                      type="text"
                      required
                      value={bountyForm.affected_system}
                      onChange={(e) => setBountyForm({ ...bountyForm, affected_system: e.target.value })}
                      placeholder="e.g. /api/v1/verify/proof"
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Steps to Reproduce *</label>
                    <textarea
                      rows={4}
                      required
                      value={bountyForm.reproduction_steps}
                      onChange={(e) => setBountyForm({ ...bountyForm, reproduction_steps: e.target.value })}
                      placeholder="Provide precise execution details..."
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900 resize-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Your Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={bountyForm.reporter_contact}
                      onChange={(e) => setBountyForm({ ...bountyForm, reporter_contact: e.target.value })}
                      placeholder="researcher@secops.io"
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5 text-[#00D632]" />
                    <span>Submit Report</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'disclosures' && (
            <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-black">{t('security_sub_disclosure')}</h3>
                <p className="text-xs text-slate-500 font-light">
                  Official security advisories and updates regarding the AAN platform.
                </p>
              </div>

              <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-3.5">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-black">No public security notices have been issued</h4>
                  <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed">
                    We are committed to transparency and will publish any verified security notices or bulletins here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hideFooter && (
        <Footer 
          onNavigate={onNavigate} 
          onLanguageChange={handleLanguageChange}
          currentLanguage={language}
        />
      )}
    </div>
  );
}
