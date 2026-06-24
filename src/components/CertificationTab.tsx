import React, { useState } from "react";
import { 
  ShieldCheck, ArrowUpRight, CheckCircle2, AlertTriangle, Play, HelpCircle, 
  Terminal, Award, Layers, HelpCircle as HelpIcon, ClipboardList, RefreshCw, GraduationCap
} from "lucide-react";
import { isAcademyEnabled } from '../academyConfig';

interface CertificationTabProps {
  onNavigateToAcademy: (lessonId: string) => void;
}

export default function CertificationTab({ onNavigateToAcademy }: CertificationTabProps) {
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<any[] | null>(null);
  const [certified, setCertified] = useState(false);
  const [activeMigrationTab, setActiveMigrationTab] = useState<"plan" | "checklist" | "rollout">("plan");

  const startCertificationTests = () => {
    setChecking(true);
    setCheckResults(null);
    
    setTimeout(() => {
      const results = [
        { id: "api", name: "REST API Gateway Routing Check", verdict: true, detail: "Secure handshake with sandbox-api.aan.trust established." },
        { id: "cors", name: "Domain CORS Origin whitelist Check", verdict: true, detail: "Localhost and client origins registered correctly in CORS tables." },
        { id: "webhook", name: "Webhook Dispatch Routing Check", verdict: true, detail: "Deliveries confirmed to target listener URL." },
        { id: "mfa", name: "Login Policy Override configuration", verdict: true, detail: "Active enforcement policy aligned to recommended security mode." },
        { id: "proof", name: "Cryptographic Proof Token Signature validation", verdict: true, detail: "Token decoding and public key validation successfully passed." },
        { id: "auth", name: "API Key Vault Authorization Check", verdict: true, detail: "API key credentials matched and approved safely." }
      ];
      setChecking(false);
      setCheckResults(results);
      setCertified(true);
      localStorage.setItem("aan_integration_certified", "true");
    }, 1500);
  };

  const resetCertificationState = () => {
    setCheckResults(null);
    setCertified(false);
    localStorage.removeItem("aan_integration_certified");
  };

  return (
    <div className="space-y-6 text-slate-300 font-sans text-left">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1b1e28] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-extrabold bg-[#111319] px-2.5 py-0.5 border border-[#1b1e28] rounded">
            Protocol Certifications
          </span>
          <h2 className="text-xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-450 animate-pulse" />
            Integration Certification & Migration Assistant
          </h2>
          <p className="text-xs text-[#78819a] max-w-2xl leading-relaxed">
            Validate all aspects of your integration automatically. Certify the connection settings, configure policy boundaries, and map transition schedules safely.
          </p>
        </div>

        {isAcademyEnabled() && (
          <button
            onClick={() => onNavigateToAcademy("projects")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-blue-900/40 text-[10px] uppercase font-bold font-mono transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Explain Certification
          </button>
        )}
      </div>

      {/* Two-Column Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Certification Validation Checklist (7 columns) */}
        <div className="lg:col-span-7 bg-[#111319] border border-[#1b1e28] p-6 rounded-xl space-y-6">
          
          <div className="space-y-1 text-left">
            <h3 className="font-mono text-xs font-black uppercase text-blue-400 tracking-wider">
              1. Automated integration checking gateway
            </h3>
            <p className="text-xs text-[#78819a]">
              Run visual sequence audits to confirm CORS origins, webhook deliveries, and proof token checks.
            </p>
          </div>

          {checking ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-404 space-y-3 font-mono text-[11px]">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span>Initiating protocol sequence validations...</span>
            </div>
          ) : checkResults ? (
            <div className="space-y-4 text-left font-mono">
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {checkResults.map((res) => (
                  <div key={res.id} className="p-3 bg-[#0d0e12] border border-[#1b1e28] rounded-lg flex items-start gap-2.5">
                    {res.verdict ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs text-white font-bold block">{res.name}</span>
                      <span className="text-[10px] text-[#78819a] block leading-normal mt-0.5">{res.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              {certified && (
                <div className="bg-emerald-950/20 border-2 border-emerald-500/40 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-450 shrink-0 shadow-lg shadow-emerald-950/30">
                    <Award className="w-6 h-6 animate-spin-slow text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">AAN Integration Certified</h4>
                    <p className="text-[11px] text-[#78819a] leading-normal font-sans mt-0.5">
                      Your current configurations comply perfectly with sandbox-v2 specifications. This verified seal confirms protocol completeness.
                    </p>
                    <span className="text-[9px] text-[#78819a] leading-none block font-mono mt-1.5 uppercase font-bold">
                       LEGAL DISCLAIMER: Certifies protocol compliance only; does not imply legal identity compliance.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 text-left pt-2">
                <button
                  onClick={resetCertificationState}
                  className="px-3.5 py-2 bg-[#0d0e12] hover:bg-[#111319] border border-[#1b1e28] text-slate-300 font-mono text-xs rounded-lg cursor-pointer"
                >
                  Clear Checks
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#0d0e12] border border-[#1b1e28] flex items-center justify-center text-slate-500 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400">Prerequisites Ready for validation</h4>
                <p className="text-xs text-slate-500 font-sans leading-normal mt-1.5">
                  Confirm your allowed domains CORS list, establish active webhook listener endpoints, and hit check to compile your compliance report.
                </p>
              </div>
              <button
                onClick={startCertificationTests}
                className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-650 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
              >
                Launch Protocol Validation checks
              </button>
            </div>
          )}

        </div>

        {/* Right Migration Assistant tabs (5 columns) */}
        <div className="lg:col-span-5 bg-[#111319] border border-[#1b1e28] p-5 rounded-xl space-y-4">
          
          <div className="pb-1 border-b border-[#1b1e28] text-left">
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              2. Migration Assistant Panel
            </h3>
            <p className="text-[10px] text-[#78819a] font-sans">Guidelines for migrating seamlessly from legacy auth systems.</p>
          </div>

          <div className="flex overflow-x-auto gap-0.5 border-b border-[#1b1e28]/60 pb-1 scrollbar-none font-mono text-[9px] font-bold uppercase text-left">
            <button
              onClick={() => setActiveMigrationTab("plan")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeMigrationTab === "plan" ? "bg-blue-600/10 text-blue-400 border border-blue-900/40" : "text-[#78819a] hover:text-slate-300"
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setActiveMigrationTab("checklist")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeMigrationTab === "checklist" ? "bg-blue-600/10 text-blue-400 border border-blue-900/40" : "text-[#78819a] hover:text-slate-300"
              }`}
            >
              Checklist
            </button>
            <button
              onClick={() => setActiveMigrationTab("rollout")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeMigrationTab === "rollout" ? "bg-blue-600/10 text-blue-400 border border-blue-900/40" : "text-[#78819a] hover:text-slate-300"
              }`}
            >
              Rollout Guide
            </button>
          </div>

          {/* Migration Content */}
          {activeMigrationTab === "plan" && (
            <div className="space-y-3.5 text-xs text-left leading-relaxed animate-fadeIn">
              <p className="text-[#78819a] text-[11px]">
                AAN operates as a decentralized, privacy-preserving trust standard layer. It doesn't replace legacy database directories; it augments them to block duplicated robots.
              </p>
              
              <div className="space-y-2 font-mono text-[10px]">
                <div className="p-2.5 bg-[#0d0e12] rounded border border-[#1b1e28]">
                  <span className="text-blue-400 font-extrabold block">Phase 1: Silent Discovery</span>
                  <p className="text-slate-500 mt-0.5">Integrate <code className="text-[#78819a] font-bold">monitor_only</code> policies to silently evaluate registration patterns without blocking standard signup loops.</p>
                </div>
                <div className="p-2.5 bg-[#0d0e12] rounded border border-[#1b1e28]">
                  <span className="text-blue-400 font-extrabold block">Phase 2: Shadow Verification</span>
                  <p className="text-slate-500 mt-0.5">Prompt users suspected of high risk levels (score &gt; 75%) to complete non-custodial humanness onboarding scans.</p>
                </div>
              </div>
            </div>
          )}

          {activeMigrationTab === "checklist" && (
            <div className="space-y-3 text-[11.5px] text-left leading-relaxed animate-fadeIn font-sans">
              <span className="font-mono text-[9px] text-[#78819a] font-black uppercase">Migration compliance checklist</span>
              
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 text-[#78819a]">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <span className="leading-tight">Verify DNS configurations support CORS callbacks safely.</span>
                </label>
                <label className="flex items-start gap-2.5 text-[#78819a]">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <span className="leading-tight">Bind API key validations inside backend servers securely.</span>
                </label>
                <label className="flex items-start gap-2.5 text-[#78819a]">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="leading-tight">Establish fallback routes if third-party trust services drop.</span>
                </label>
                <label className="flex items-start gap-2.5 text-[#78819a]">
                  <input type="checkbox" className="mt-0.5" />
                  <span className="leading-tight">Add test keys into rollback environments.</span>
                </label>
              </div>
            </div>
          )}

          {activeMigrationTab === "rollout" && (
            <div className="space-y-3 text-xs text-left leading-relaxed animate-fadeIn">
              <span className="font-mono text-[9px] text-[#78819a] font-black uppercase">Rollback & recommended schedule</span>
              <p className="text-slate-450 text-[11px]">
                To guarantee zero disruption for active customers, we recommend a <b className="text-white">canary rollout schedule</b>:
              </p>
              
              <div className="bg-[#0d0e12] p-3 rounded-lg border border-[#1b1e28] font-mono text-[10px] space-y-1.5 text-[#78819a]">
                <div>• Day 1: Route 1% of signups through shadow checks.</div>
                <div>• Day 3: Scale validation to 10% of signups.</div>
                <div>• Day 7: Enable automated redirects for anomalous IP routes.</div>
                <div>• Day 14: Implement production zero-trust policy overrides.</div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
