import React, { useState } from "react";
import { 
  Building, Sliders, Key, Globe, Shield, Webhook, CheckCircle2, 
  Terminal, Sparkles, AlertTriangle, ArrowRight, ArrowLeft, Copy, Check, GraduationCap
} from "lucide-react";
import { isAcademyEnabled } from '../academyConfig';

interface IntegrationWizardTabProps {
  onNavigateToAcademy: (lessonId: string) => void;
  onRefreshDashboard: () => void;
}

export default function IntegrationWizardTab({ onNavigateToAcademy, onRefreshDashboard }: IntegrationWizardTabProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState("FinTech Safehouse Ltd");
  const [projectName, setProjectName] = useState("Alpha Secure Signups");
  const [apiKey, setApiKey] = useState("");
  const [domains, setDomains] = useState("api.fintechsafehouse.com, localhost:3000");
  const [loginPolicy, setLoginPolicy] = useState("high_risk_mfa");
  const [webhookUrl, setWebhookUrl] = useState("https://api.fintechsafehouse.com/v1/auth/aan-status");
  const [testSessionId, setTestSessionId] = useState("vss_sb_test_55a2c");
  const [testProofToken, setTestProofToken] = useState("");
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const stepsList = [
    { num: 1, title: "Create Organization", desc: "Corporate identity profiling", academy: "organizations" },
    { num: 2, title: "Create Project", desc: "Tenant namespace partition", academy: "projects" },
    { num: 3, title: "Generate API Key", desc: "Unique hash authorization identifier", academy: "api_keys" },
    { num: 4, title: "Allowed Domains", desc: "Configure CORS origin limits", academy: "projects" },
    { num: 5, title: "Login Policy", desc: "Active risk enforcement policy", academy: "login_policies" },
    { num: 6, title: "Configure Webhooks", desc: "Establish async delivery route", academy: "webhook_system" },
    { num: 7, title: "Test Verification", desc: "Initiate sandbox telemetry session", academy: "sandbox_engine" },
    { num: 8, title: "Validate Proof Token", desc: "Verify cryptographic certificate signature", academy: "proof_tokens" },
    { num: 9, title: "Complete Integration", desc: "Deploy trust infrastructure confidently", academy: "intro" }
  ];

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateKey = () => {
    const randomHash = "poh_live_key_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString().slice(-4);
    setApiKey(randomHash);
    handleNextStep();
  };

  const handleTestSessionRequest = () => {
    const demoProof = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({
      org_id: "org_fintech_wizard",
      project_id: "proj_wizard_alpha",
      partner_user_id: "external_usr_beta_0",
      human_status: "verified",
      uniqueness_status: "unique",
      risk_score: 8,
      issued_at: new Date().toISOString()
    })) + ".sIGNATURE_mOCK_vALIDATION";
    setTestProofToken(demoProof);
    handleNextStep();
  };

  const verifyProofTokenSim = () => {
    setIsVerifyingProof(true);
    setTimeout(() => {
      setIsVerifyingProof(false);
      setVerificationResult({
        valid: true,
        claims: {
          organization_id: "org_fintech_wizard",
          project_id: "proj_wizard_alpha",
          partner_user_id: "external_usr_beta_0",
          human_status: "verified",
          uniqueness_status: "unique",
          risk_level: "low",
          risk_score: 8,
          timestamp: new Date().toISOString()
        }
      });
      // Save certification state locally
      localStorage.setItem("aan_integration_certified", "true");
      onRefreshDashboard();
    }, 1200);
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const activeStepDetails = stepsList.find(s => s.num === currentStep)!;

  return (
    <div className="space-y-6 text-slate-300 antialiased font-sans">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-extrabold bg-blue-950/80 px-2.5 py-0.5 border border-blue-900/30 rounded">
            Interactive Onboarding
          </span>
          <h2 className="text-xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin-slow" />
            AAN Integration Wizard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Configure, authenticate, test, and register your trust infrastructure step-by-step. Completing this sandbox wizard qualifies your app for official platform verification certifications.
          </p>
        </div>
        
        {isAcademyEnabled() && (
          <button
            onClick={() => onNavigateToAcademy(activeStepDetails?.academy || "intro")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-blue-900/40 text-[10px] uppercase font-bold font-mono transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Explain Step in Academy
          </button>
        )}
      </div>

      {/* Progress Track Header */}
      <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-4">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-2 uppercase font-black">
          <span>Integration Progress</span>
          <span className="text-blue-400">{Math.round((completedSteps.length / 9) * 100)}% Complete</span>
        </div>
        
        {/* Horizontal Progress bar */}
        <div className="grid grid-cols-9 gap-1.5">
          {stepsList.map(s => {
            const isCompleted = completedSteps.includes(s.num);
            const isCurrent = currentStep === s.num;
            return (
              <div 
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                title={`Step ${s.num}: ${s.title}`}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  isCurrent 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-950" 
                    : isCompleted 
                    ? "bg-emerald-500" 
                    : "bg-slate-800 hover:bg-slate-755"
                }`}
              />
            );
          })}
        </div>

        {/* Steps description tabs */}
        <div className="flex md:grid md:grid-cols-9 gap-1.5 overflow-x-auto mt-4 pt-4 border-t border-slate-900/40 scrollbar-none text-left">
          {stepsList.map(s => {
            const isCompleted = completedSteps.includes(s.num);
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`shrink-0 text-[10px] font-mono py-1 px-2 rounded border focus:outline-none cursor-pointer text-left ${
                  isCurrent 
                    ? "bg-blue-600/10 border-blue-800 text-blue-400" 
                    : isCompleted 
                    ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
                    : "bg-slate-950/45 border-slate-900 text-slate-500 hover:text-slate-400"
                }`}
              >
                <div className="font-extrabold text-[9px] uppercase">Step 0{s.num}</div>
                <div className="truncate text-[10px] font-bold mt-0.5 max-w-[90px]">{s.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Workshop Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Step configuration panel (Left, 7 columns) */}
        <div className="lg:col-span-8 bg-slate-900/35 border border-slate-900 rounded-xl p-6 min-h-[420px] flex flex-col justify-between text-left space-y-6">
          
          <div className="space-y-6">
            <div className="border-b border-slate-900pb-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-500 font-bold">STEP {currentStep} OF 9</span>
                {completedSteps.includes(currentStep) && (
                  <span className="text-[8px] font-mono uppercase bg-emerald-950 text-emerald-400 px-1 border border-emerald-900/30 font-bold rounded">Step Complete</span>
                )}
              </div>
              <h3 className="text-lg font-mono font-extrabold text-white">{activeStepDetails.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeStepDetails.desc}</p>
            </div>

            {/* Step 1 Content: Create Organization */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your company name profile to register an enterprise tenant unit in AAN's persistent directory. Each organization functions under restricted security boundaries.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Organization Name string</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Acme fintech Corp"
                  />
                </div>
                <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-lg flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-500 leading-normal font-sans">
                    AAN utilizes zero-biometric data storage architectures. Creating this tenant space generates separate key vaults for signing verification status tokens later.
                  </span>
                </div>
              </div>
            )}

            {/* Step 2 Content: Create Project */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Establish a testing project partition context. Projects allow you to segregate client configurations, custom login policies, and analytics.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Project Alias Handle</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Master Signup Flow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-left">
                    <span className="text-[9px] font-mono font-bold text-blue-400 block mb-1">STAGING / SANDBOX</span>
                    <span className="text-[10px] text-slate-400">Isolated environment for integration validations and telemetry replays safely.</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-left">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mb-1">PRODUCTION</span>
                    <span className="text-[10px] text-slate-500">Live system requiring high cryptographic standards and verified auth keys.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Content: Generate API Key */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate your project secret verification credential. This key proxies requests from your backend securely.
                </p>
                {apiKey ? (
                  <div className="space-y-3">
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between font-mono text-xs">
                      <span className="text-emerald-400 select-all break-all">{apiKey}</span>
                      <button
                        onClick={() => copyCodeToClipboard(apiKey)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold font-mono text-[10px] border border-slate-800 p-1 rounded"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-900/30 p-3.5 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <span className="text-[10px] text-amber-300 font-mono leading-relaxed">
                        CRITICAL SAFETY: Always secure API keys on your backend servers. Never place AAN keys into React client components or expose them on the browser console.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <button
                      onClick={handleGenerateKey}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all"
                    >
                      Generate Cryptographic Key Hash
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 Content: Allowed Domains */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Define Allowed Web Domains (CORS). Onboarding camera panels check these configurations dynamically before opening capturing interfaces to prevent frame hijacking.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Domains whitelist (comma separated)</label>
                  <input
                    type="text"
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. app.com, localhost:3000"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Incoming telemetry logs check request origin headers strictly against this list. Entries like <code className="text-slate-400">localhost</code> are safe for local staging.
                </p>
              </div>
            )}

            {/* Step 5 Content: Login Policy */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose your humanness trust enforcement protocol for authentication and logins of returning users.
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-900 rounded-lg cursor-pointer hover:border-slate-800">
                    <input
                      type="radio"
                      name="policy"
                      value="monitor_only"
                      checked={loginPolicy === "monitor_only"}
                      onChange={() => setLoginPolicy("monitor_only")}
                      className="mt-1 cursor-pointer"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-mono font-bold text-slate-300 block">Monitor Only (Silent Observation)</span>
                      <span className="text-[11px] text-slate-500 block mt-1">Evaluates risk profiles and signals, but never enforces re-verifications. Perfect for audit reviews and planning.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-900 rounded-lg cursor-pointer hover:border-slate-800">
                    <input
                      type="radio"
                      name="policy"
                      value="high_risk_mfa"
                      checked={loginPolicy === "high_risk_mfa"}
                      onChange={() => setLoginPolicy("high_risk_mfa")}
                      className="mt-1 cursor-pointer"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-mono font-bold text-blue-400 block">Trigger Re-Verification on Elevated Risk (Recommended)</span>
                      <span className="text-[11px] text-slate-500 block mt-1">Instantly requests secure facial checks if the risk engine detects strange devices, rapid registrations, or duplicate templates.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-900 rounded-lg cursor-pointer hover:border-slate-800">
                    <input
                      type="radio"
                      name="policy"
                      value="strict_mfa"
                      checked={loginPolicy === "strict_mfa"}
                      onChange={() => setLoginPolicy("strict_mfa")}
                      className="mt-1 cursor-pointer"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-mono font-bold text-rose-400 block">Strict Proof-Of-Human (Zero Trust)</span>
                      <span className="text-[11px] text-slate-500 block mt-1">Requires an active validated humanness proof on every system login attempt regardless of device profiles.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 6 Content: Configure Webhooks */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure the URL endpoint where AAN's webhooks gateway will deliver real-time notifications when users pass scans.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Webhook Listener URL string</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 text-left">
                  <span>Included Events whitelisted:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-emerald-400">aan.verification.completed</span>
                    <span className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-rose-400">aan.verification.failed</span>
                    <span className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-blue-400">aan.removal.approved</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7 Content: Test Verification */}
            {currentStep === 7 && (
              <div className="space-y-4 animate-fadeIn text-left">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate standard client-side verification telemetry check. This triggers facial template compilation checks to returns proof of humanness tokens.
                </p>
                {testProofToken ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-black bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Issued Token</span>
                      <span className="text-[10px] font-mono text-slate-400">Successfully generated proof JWT certificate!</span>
                    </div>
                    <div className="bg-slate-950 font-mono text-[10px] p-3 border border-slate-800 rounded-lg text-slate-400 select-all break-all h-20 overflow-y-auto">
                      {testProofToken}
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <button
                      onClick={handleTestSessionRequest}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Terminal className="w-4 h-4" />
                      Simulate Verification Telemetry Loop
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 8 Content: Validate Proof Token */}
            {currentStep === 8 && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Perform secure cryptographic token check. Send the proof JWT token received on your frontend back to AAN API to confirm signature credibility.
                </p>
                {verificationResult ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg flex items-center gap-2 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-bold">SUCCESSFULLY CERTIFIED! Signature matches perfectly.</span>
                    </div>
                    
                    <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden font-mono text-[10px]">
                      <div className="bg-slate-900 px-3 py-1 text-slate-500">DECODED VERDICTS CLAIMS</div>
                      <pre className="p-3 text-blue-300 overflow-x-auto">
                        {JSON.stringify(verificationResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-950 font-mono text-[10px] p-3 border border-slate-850 rounded-lg text-slate-400 break-all truncate">
                      {testProofToken || "Generate JWT token in Step 7 first!"}
                    </div>
                    <button
                      onClick={verifyProofTokenSim}
                      disabled={!testProofToken || isVerifyingProof}
                      className={`px-5 py-2.5 font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all ${
                        !testProofToken 
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-900" 
                          : isVerifyingProof 
                          ? "bg-blue-950 text-blue-400 border border-blue-900/30 font-bold animate-pulse" 
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {isVerifyingProof ? "Cryptographic evaluation running..." : "Submit Token for Cryptographic Validation"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 9 Content: Complete Integration */}
            {currentStep === 9 && (
              <div className="space-y-4 animate-fadeIn text-center max-w-xl mx-auto py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/30 animate-pulse">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-base font-mono font-extrabold text-white">Project Fully Verified & Certified</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                    Congratulations! You have successfully registered your company tenant space, compiled API keys, established domain firewalls, and validated cryptographic proofs against the Sandbox system.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 text-left space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Company Organization:</span>
                    <span className="text-white font-bold">{orgName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Project Endpoint namespace:</span>
                    <span className="text-white font-bold">{projectName}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">Certification Standard:</span>
                    <span className="text-blue-400 font-extrabold">AAN MVP SECURE-01</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-900/50 mt-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                currentStep === 1 
                  ? "bg-slate-900/40 border-slate-900/30 text-slate-500 cursor-not-allowed" 
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 cursor-pointer"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-[10px] font-mono text-slate-500">
              Completed {completedSteps.length} of 9 Actions
            </div>

            {currentStep < 9 ? (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-950/50 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
              >
                Proceed
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded">
                 Integration Complete
              </span>
            )}
          </div>

        </div>

        {/* Wizard diagnostics helpful sidebar (Right, 4 columns) */}
        <div className="lg:col-span-4 space-y-4 text-left">
          
          <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               Development Tip
            </h4>
            <p className="text-xs text-slate-400 leading-normal font-sans">
              Always preserve privacy metrics. AAN designed verification responses to share status and signatures without exposing client faces or hardware identifiers directly.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 space-y-3.5">
            <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               Configuration Registry
            </h4>
            
            <div className="space-y-3 font-mono text-[10px] select-all">
              <div className="border-b border-slate-900 pb-2">
                <span className="text-slate-500 block">Organization:</span>
                <span className="text-white font-semibold">{orgName || "(Unconfigured)"}</span>
              </div>
              <div className="border-b border-slate-900 pb-2">
                <span className="text-slate-500 block">Project Blueprint:</span>
                <span className="text-white font-semibold">{projectName || "(Unconfigured)"}</span>
              </div>
              <div className="border-b border-slate-900 pb-2">
                <span className="text-slate-500 block">Active Domains Whitelist:</span>
                <span className="text-white font-semibold">{domains || "(Unconfigured)"}</span>
              </div>
              <div className="border-b border-slate-900 pb-2">
                <span className="text-slate-500 block">Login Policy Model:</span>
                <span className="text-white font-semibold uppercase">{loginPolicy}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Issued Test Token:</span>
                <span className="text-slate-400 text-[8px] truncate block max-w-[200px]" title={testProofToken}>
                  {testProofToken ? testProofToken.slice(0, 30) + "..." : "(No Token issued yet)"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
