import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Terminal, 
  ArrowRight, 
  RefreshCw, 
  Compass, 
  HelpCircle, 
  Fingerprint, 
  Users, 
  Lock,
  Info,
  Code,
  Sliders,
  Check,
  Copy
} from 'lucide-react';
import { motion } from 'motion/react';

interface ScenarioPreset {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  objective: string;
  signals: {
    impossibleTravel: boolean;
    credentialStuffing: boolean;
    botNetwork: boolean;
    banEvasion: boolean;
    deviceAnomaly: boolean;
    validAttestation: boolean;
  };
}

export default function TrustDecisionSimulator() {
  const [activePreset, setActivePreset] = useState<string>('takeover');
  
  // Dynamic signal values
  const [impossibleTravel, setImpossibleTravel] = useState(true);
  const [credentialStuffing, setCredentialStuffing] = useState(true);
  const [botNetwork, setBotNetwork] = useState(false);
  const [banEvasion, setBanEvasion] = useState(false);
  const [deviceAnomaly, setDeviceAnomaly] = useState(true);
  const [validAttestation, setValidAttestation] = useState(false);

  // Playground simulation loading state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const presets: ScenarioPreset[] = [
    {
      id: 'takeover',
      title: 'Stop Account Takeovers',
      icon: <Lock className="w-4 h-4 text-amber-400" />,
      description: 'Intercept compromised logins. Identifies behavioral anomalies, impossible travel velocities, and automated credential spray patterns.',
      objective: 'Core Objective 1: Prevent hijacked accounts and credential stuffing before downstream damage occurs.',
      signals: {
        impossibleTravel: true,
        credentialStuffing: true,
        botNetwork: false,
        banEvasion: false,
        deviceAnomaly: true,
        validAttestation: false
      }
    },
    {
      id: 'bots',
      title: 'Stop Bot Farms',
      icon: <Users className="w-4 h-4 text-rose-400" />,
      description: 'Filter massive automated registration spikes. Distinguish script tools from humans and identify coordinated subnet operations.',
      objective: 'Core Objective 2: Defend platforms from sybil network clusters and headless browser bot farms.',
      signals: {
        impossibleTravel: false,
        credentialStuffing: false,
        botNetwork: true,
        banEvasion: false,
        deviceAnomaly: true,
        validAttestation: false
      }
    },
    {
      id: 'evasion',
      title: 'Reduce Ban Evasion',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      description: 'Flag returning malicious actors trying to bypass moderation. Matches privacy-preserving device footprints and linking behaviors.',
      objective: 'Core Objective 3: Assign risk confidence statefully without revealing or storing sensitive identity hashes.',
      signals: {
        impossibleTravel: false,
        credentialStuffing: false,
        botNetwork: false,
        banEvasion: true,
        deviceAnomaly: true,
        validAttestation: false
      }
    },
    {
      id: 'legit',
      title: 'Legitimate Customer',
      icon: <CheckCircle2 className="w-4 h-4 text-[#00E676]" />,
      description: 'Accelerate known trusted users. Streamlines smooth logins for verified human operators on recognized hardware.',
      objective: 'Standard Operation: Validate high-integrity telemetry for normal day-to-day traffic flows.',
      signals: {
        impossibleTravel: false,
        credentialStuffing: false,
        botNetwork: false,
        banEvasion: false,
        deviceAnomaly: false,
        validAttestation: true
      }
    }
  ];

  // Apply scenario presets when switching
  useEffect(() => {
    const preset = presets.find(p => p.id === activePreset);
    if (preset) {
      setImpossibleTravel(preset.signals.impossibleTravel);
      setCredentialStuffing(preset.signals.credentialStuffing);
      setBotNetwork(preset.signals.botNetwork);
      setBanEvasion(preset.signals.banEvasion);
      setDeviceAnomaly(preset.signals.deviceAnomaly);
      setValidAttestation(preset.signals.validAttestation);
    }
  }, [activePreset]);

  // Dynamic decision engine calculation
  const calculateDecision = () => {
    let decision: 'ALLOW' | 'STEP_UP' | 'DENY' = 'ALLOW';
    let trustScore = 98;
    let riskScore = 2;
    const reasons: string[] = [];

    // Evaluate signals
    if (validAttestation) {
      trustScore += 10;
      riskScore -= 5;
    } else {
      trustScore -= 15;
    }

    if (impossibleTravel) {
      riskScore += 30;
      trustScore -= 25;
      reasons.push("Impossible travel velocity registered");
    }
    
    if (credentialStuffing) {
      riskScore += 35;
      trustScore -= 30;
      reasons.push("Credential stuffing/rapid spray pattern detected");
    }

    if (botNetwork) {
      riskScore += 45;
      trustScore -= 40;
      reasons.push("High-confidence automated behavior cluster matching headless browser");
    }

    if (banEvasion) {
      riskScore += 40;
      trustScore -= 35;
      reasons.push("Linked to previously blacklisted actor profile (privacy-preserving fingerprint)");
    }

    if (deviceAnomaly) {
      riskScore += 15;
      trustScore -= 10;
      reasons.push("Anomalous device parameter signature mismatch");
    }

    // Keep scores bound between 0 and 100
    riskScore = Math.max(0, Math.min(100, riskScore));
    trustScore = Math.max(0, Math.min(100, trustScore));

    // Determine final Decision
    if (riskScore >= 85 || botNetwork) {
      decision = 'DENY';
    } else if (riskScore >= 40 || impossibleTravel || credentialStuffing || banEvasion || deviceAnomaly) {
      decision = 'STEP_UP';
    } else {
      decision = 'ALLOW';
    }

    // Standard fallback reasons to guarantee clean user vision
    if (reasons.length === 0) {
      reasons.push("Verified returning human identity claim");
      reasons.push("Known trusted device pairing matched");
      reasons.push("Normal, low-risk behavioral timing velocity");
    }

    return { decision, trustScore, riskScore, reasons };
  };

  const { decision, trustScore, riskScore, reasons } = calculateDecision();

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const triggerEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 600);
  };

  // Generate payload string
  const jsonResponse = JSON.stringify({
    decision,
    trust_score: trustScore,
    risk_score: riskScore,
    reason: reasons
  }, null, 2);

  return (
    <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden p-6 space-y-6 text-left relative">
      
      {/* Compass Statement Header */}
      <div className="border-b border-white/[0.04] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#00E676] animate-spin-slow" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E676] font-bold uppercase">AAN CORE STRATEGY</span>
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Trust Intelligence Engine</h3>
          <p className="text-xs text-slate-500">
            AAN doesn’t sell simple verification. We provide real-time, zero-knowledge <span className="text-slate-300 font-semibold">Trust Decisions</span>.
          </p>
        </div>
        <div className="bg-[#00E676]/5 border border-[#00E676]/15 rounded-xl p-3 max-w-sm">
          <p className="text-[10px] font-mono text-[#00E676] leading-normal italic">
            "Every feature in AAN must improve the quality, speed, or confidence of a trust decision."
          </p>
        </div>
      </div>

      {/* Preset objective picker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActivePreset(preset.id);
                triggerEvaluation();
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                isActive 
                  ? 'bg-white/[0.03] border-white/20 text-white shadow-lg' 
                  : 'bg-black/20 border-white/[0.03] hover:border-white/[0.08] text-slate-400'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="p-1 rounded bg-white/[0.02] border border-white/[0.05]">
                  {preset.icon}
                </span>
                {isActive && <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full" />}
              </div>
              <span className="text-[10px] font-mono font-bold leading-tight truncate">{preset.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Objective Box */}
      <div className="bg-black/35 border border-white/[0.02] p-3.5 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">Active objective focus</span>
          <p className="text-[11px] text-slate-400 font-medium">
            {presets.find(p => p.id === activePreset)?.objective}
          </p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
            {presets.find(p => p.id === activePreset)?.description}
          </p>
        </div>
      </div>

      {/* Simulator workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-start">
        
        {/* Signal configuration sliders/checkboxes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Adjust Telemetry Signals
            </span>
            <button
              onClick={() => {
                setImpossibleTravel(false);
                setCredentialStuffing(false);
                setBotNetwork(false);
                setBanEvasion(false);
                setDeviceAnomaly(false);
                setValidAttestation(true);
                triggerEvaluation();
              }}
              className="text-[9px] font-mono text-[#00E676] hover:underline"
            >
              Reset to pristine human
            </button>
          </div>

          <div className="space-y-2.5 bg-black/20 border border-white/[0.02] p-4 rounded-xl">
            {/* Signal 1: Impossible Travel */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-white block">Impossible Travel Velocity</span>
                <span className="text-[9px] text-slate-500 block leading-tight">Same token used from non-contiguous geographical coordinates under 1 hour.</span>
              </div>
              <input 
                type="checkbox" 
                checked={impossibleTravel} 
                onChange={(e) => { setImpossibleTravel(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>

            {/* Signal 2: Credential Stuffing */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-white block">Credential stuffing / rapid spray</span>
                <span className="text-[9px] text-slate-500 block leading-tight">High density of login attempts using multiple mismatched account names.</span>
              </div>
              <input 
                type="checkbox" 
                checked={credentialStuffing} 
                onChange={(e) => { setCredentialStuffing(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>

            {/* Signal 3: Bot Network */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-white block">Coordinated bot farm activity</span>
                <span className="text-[9px] text-slate-500 block leading-tight">Automation indicators matched, headless sandbox engines running.</span>
              </div>
              <input 
                type="checkbox" 
                checked={botNetwork} 
                onChange={(e) => { setBotNetwork(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>

            {/* Signal 4: Ban Evasion */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-white block">Ban evasion footprint matched</span>
                <span className="text-[9px] text-slate-500 block leading-tight">Cross-linking devices and signals match known bad-actor hardware signatures.</span>
              </div>
              <input 
                type="checkbox" 
                checked={banEvasion} 
                onChange={(e) => { setBanEvasion(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>

            {/* Signal 5: Device Anomaly */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-white block">Anomalous Device Mismatch</span>
                <span className="text-[9px] text-slate-500 block leading-tight">Mismatch in user agent, canvas metrics, and screen resolution parameters.</span>
              </div>
              <input 
                type="checkbox" 
                checked={deviceAnomaly} 
                onChange={(e) => { setDeviceAnomaly(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>

            {/* Signal 6: Humanness Attestation */}
            <label className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-[11px] font-mono font-bold text-[#00E676] block">Signed Proof Attestation</span>
                <span className="text-[9px] text-slate-500 block leading-tight">User successfully passed active zero-knowledge posture attestation.</span>
              </div>
              <input 
                type="checkbox" 
                checked={validAttestation} 
                onChange={(e) => { setValidAttestation(e.target.checked); triggerEvaluation(); }}
                className="rounded border-white/10 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 bg-black/30"
              />
            </label>
          </div>
        </div>

        {/* Real-time trust decision response payload (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00E676]" />
              API Endpoint evaluation response
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-500 bg-white/[0.02] border border-white/[0.04] py-0.5 px-2 rounded font-extrabold uppercase">
                POST /trust/evaluate
              </span>
              <button
                onClick={() => handleCopyCode(jsonResponse)}
                className="text-[9px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-[#00E676]" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy Payload'}
              </button>
            </div>
          </div>

          <div className="bg-[#050507] border border-white/[0.05] rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Headers displaying decision */}
            <div className="bg-black/50 border-b border-white/[0.04] py-3.5 px-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">DECISION:</span>
                <span className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-md leading-none ${
                  decision === 'ALLOW' 
                    ? 'bg-emerald-500/10 text-[#00E676] border border-emerald-500/20' 
                    : decision === 'STEP_UP'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.05)] animate-pulse'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {decision}
                </span>
              </div>

              <div className="flex items-center gap-4 text-right font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 uppercase block text-[8px]">Trust score</span>
                  <span className={`text-xs font-black block ${decision === 'ALLOW' ? 'text-[#00E676]' : decision === 'STEP_UP' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {trustScore}/100
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[8px]">Risk score</span>
                  <span className="text-white text-xs font-black block">
                    {riskScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Realtime updating json stream */}
            <div className="p-5 font-mono text-[10.5px] min-h-[170px] overflow-x-auto relative">
              {isEvaluating ? (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#00E676]" />
                  <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#00E676]">AAN computing trust verdict...</span>
                </div>
              ) : null}

              <pre className={`transition-all duration-300 ${
                decision === 'ALLOW' 
                  ? 'text-emerald-400/90' 
                  : decision === 'STEP_UP'
                    ? 'text-amber-300/90'
                    : 'text-rose-400/90'
              }`}>
                {jsonResponse}
              </pre>
            </div>
          </div>

          {/* Audit: Answering Future Trust Questions */}
          <div className="bg-black/30 border border-white/[0.03] rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Evaluation Audit: Answering Future Trust Questions
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-[10px] leading-relaxed">
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Is this a real human?</span>
                <span className={`ml-auto font-bold uppercase ${validAttestation ? 'text-[#00E676]' : 'text-amber-400'}`}>
                  {validAttestation ? 'Confirmed Verified' : 'Unconfirmed'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Is this login normal?</span>
                <span className={`ml-auto font-bold uppercase ${(impossibleTravel || credentialStuffing) ? 'text-rose-400' : 'text-[#00E676]'}`}>
                  {(impossibleTravel || credentialStuffing) ? 'Anomalous Activity' : 'Normal Pattern'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Is this device trusted?</span>
                <span className={`ml-auto font-bold uppercase ${deviceAnomaly ? 'text-amber-400' : 'text-[#00E676]'}`}>
                  {deviceAnomaly ? 'Anomaly Flagged' : 'Trusted Signature'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Is this behavior unusual?</span>
                <span className={`ml-auto font-bold uppercase ${(credentialStuffing || botNetwork) ? 'text-rose-400' : 'text-[#00E676]'}`}>
                  {(credentialStuffing || botNetwork) ? 'High Suspicion' : 'Low Suspicion'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Is this account likely compromised?</span>
                <span className={`ml-auto font-bold uppercase ${(impossibleTravel && deviceAnomaly) ? 'text-rose-400' : (impossibleTravel || deviceAnomaly) ? 'text-amber-400' : 'text-[#00E676]'}`}>
                  {(impossibleTravel && deviceAnomaly) ? 'High likelihood' : (impossibleTravel || deviceAnomaly) ? 'Moderate risk' : 'Low risk'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Should this session be trusted?</span>
                <span className={`ml-auto font-bold uppercase ${decision === 'ALLOW' ? 'text-[#00E676]' : decision === 'STEP_UP' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {decision === 'ALLOW' ? 'Fully Trusted' : decision === 'STEP_UP' ? 'Challenge Required' : 'Reject Session'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Should we challenge this user?</span>
                <span className={`ml-auto font-bold uppercase ${decision === 'STEP_UP' ? 'text-amber-400' : 'text-slate-500'}`}>
                  {decision === 'STEP_UP' ? 'YES (STEP-UP)' : 'NO'}
                </span>
              </div>
              <div className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                <span className="text-slate-500 shrink-0">Q: Should we block this action?</span>
                <span className={`ml-auto font-bold uppercase ${decision === 'DENY' ? 'text-rose-400' : 'text-slate-500'}`}>
                  {decision === 'DENY' ? 'YES (AUTO-BLOCK)' : 'NO'}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-1.5 text-[9px] text-slate-500 leading-normal pt-1.5 font-sans">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Evidence and reason codes are generated statefully with cryptographic signatures, helping partners customize validation limits dynamically.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
