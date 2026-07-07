import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  FileCheck2, 
  Fingerprint, 
  Activity, 
  Code, 
  ExternalLink, 
  Lock, 
  RefreshCw, 
  Play, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  Terminal, 
  Check, 
  Copy, 
  Binary, 
  Sparkles, 
  Database,
  Search,
  XCircle,
  HelpCircle,
  Sliders
} from 'lucide-react';

interface ZKProofsTabProps {
  onAddEventToGlobalRegistry?: (event: any) => void;
  projName?: string;
}

interface ZKModelVersion {
  id: string;
  name: string;
  version: string;
  description: string;
  onnx_model_hash: string;
  ezkl_settings_hash: string;
  compiled_circuit_hash: string;
  proving_key_hash: string;
  verification_key_hash: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface ZKProof {
  id: string;
  trust_event_id: string;
  trust_decision_id: string;
  model_version_id: string;
  model_name: string;
  proof_hash: string;
  public_inputs_hash: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  verified_output: number;
  verification_time_ms: number;
  created_at: string;
  inputs: {
    device_trust_score: number;
    ip_risk_score: number;
    failed_login_velocity: number;
    associated_account_count: number;
    account_age_days: number;
    previous_step_up_failures: number;
    behavior_anomaly_score: number;
  };
  decision: 'ALLOW' | 'STEP_UP' | 'REVIEW' | 'DENY';
}

const DEFAULT_MODELS: ZKModelVersion[] = [
  {
    id: "mv_9a8c7b6d-31",
    name: "AAN Risk Model v0.1-sandbox",
    version: "v0.1-sandbox",
    description: "A modern ML risk scoring circuit used to prove secure decentralized decisions without exposing private data.",
    onnx_model_hash: "0x7c9a2f183bde22f183cf9d1a49be8837e3d1f88e63bdeef1a0c842183bcf3d3c",
    ezkl_settings_hash: "0xb52c1a4e9301daef31a98c71b4aef9a3de81c7e63b924cfde9a7aef113ac2f3a",
    compiled_circuit_hash: "0xfa11cc8d42cdd01a5ebf092adcf1b6a71e82b7cfdc1d7c92b2ef81977a4ee40c",
    proving_key_hash: "0x89ee184bf27aef19cfd7b2a9dcf1b374bfde26cf8d43ef17ccbd92b51faee6a7",
    verification_key_hash: "0xd92b2ef1a901ae4fcd819ac2bfdc371e62cf0a1c78e35bfde1a6f87b89ee18cf",
    status: "active",
    created_at: "2026-07-01T12:00:00Z"
  },
  {
    id: "mv_4d3e2f1a-82",
    name: "AAN Sybil Farm Identifier",
    version: "v1.2-enterprise",
    description: "Multi-factor correlation circuit proving coordinated device registration clusters while preserving structural privacy.",
    onnx_model_hash: "0x9d4a3c1e2f8b5aef012c4d8e3f9a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    ezkl_settings_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    compiled_circuit_hash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    proving_key_hash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    verification_key_hash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    status: "inactive",
    created_at: "2026-06-15T08:30:00Z"
  }
];

export default function ZKProofsTab({ onAddEventToGlobalRegistry, projName = "Default Auth Layer" }: ZKProofsTabProps) {
  const [subTab, setSubTab] = useState<'metrics' | 'models' | 'sandbox' | 'decisions' | 'docs'>('sandbox');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Local Database / State
  const [modelVersions, setModelVersions] = useState<ZKModelVersion[]>(DEFAULT_MODELS);
  const [proofs, setProofs] = useState<ZKProof[]>(() => {
    const saved = localStorage.getItem('aan_zk_proofs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Seed default proofs
    return [
      {
        id: "zkp_aan_f83b2a9e",
        trust_event_id: "evt_aan_9c4f8d21",
        trust_decision_id: "evt_aan_9c4f8d21",
        model_version_id: "mv_9a8c7b6d-31",
        model_name: "AAN Risk Model v0.1-sandbox",
        proof_hash: "0x7a8df1e51b6a71e82b7cfdc1d7c92b2ef81977a4ee40c5ebf092adcf1b6a71e8",
        public_inputs_hash: "0x3fa99bcfdc1d7c92b2ef81977a4ee40c882c1628d42cdd01a5ebf092adcf1b6a",
        status: "verified",
        verified_output: 12,
        verification_time_ms: 185,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        inputs: {
          device_trust_score: 92,
          ip_risk_score: 5,
          failed_login_velocity: 0,
          associated_account_count: 1,
          account_age_days: 360,
          previous_step_up_failures: 0,
          behavior_anomaly_score: 4
        },
        decision: "ALLOW"
      },
      {
        id: "zkp_aan_1a2c3d4e",
        trust_event_id: "evt_aan_3b8a1c9e",
        trust_decision_id: "evt_aan_3b8a1c9e",
        model_version_id: "mv_9a8c7b6d-31",
        model_name: "AAN Risk Model v0.1-sandbox",
        proof_hash: "0x9d4a3c1e2f8b5aef012c4d8e3f9a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
        public_inputs_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        status: "verified",
        verified_output: 94,
        verification_time_ms: 212,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        inputs: {
          device_trust_score: 8,
          ip_risk_score: 89,
          failed_login_velocity: 8,
          associated_account_count: 12,
          account_age_days: 1,
          previous_step_up_failures: 2,
          behavior_anomaly_score: 85
        },
        decision: "DENY"
      }
    ];
  });

  // Save proofs to localStorage
  useEffect(() => {
    localStorage.setItem('aan_zk_proofs', JSON.stringify(proofs));
  }, [proofs]);

  // Selected proof for detail modal/drawer
  const [selectedProof, setSelectedProof] = useState<ZKProof | null>(null);

  // Playground presets
  const presets = [
    {
      id: "pres_clean_user",
      name: "Legitimate Corporate Login",
      description: "Low-risk corporate worker logging in from a known hardware footprint with high device trust.",
      inputs: {
        device_trust_score: 95,
        ip_risk_score: 4,
        failed_login_velocity: 0,
        associated_account_count: 1,
        account_age_days: 420,
        previous_step_up_failures: 0,
        behavior_anomaly_score: 3
      }
    },
    {
      id: "pres_bot_spike",
      name: "Coordinated Registration Bot",
      description: "Automated headless scraper attempting registration via hosting networks with zero device trust.",
      inputs: {
        device_trust_score: 5,
        ip_risk_score: 92,
        failed_login_velocity: 15,
        associated_account_count: 35,
        account_age_days: 0,
        previous_step_up_failures: 5,
        behavior_anomaly_score: 88
      }
    },
    {
      id: "pres_evasion_match",
      name: "Suspicious Ban Evasion",
      description: "Returning bad actor attempting device-spoofing techniques. Triggers correlation limits.",
      inputs: {
        device_trust_score: 42,
        ip_risk_score: 45,
        failed_login_velocity: 2,
        associated_account_count: 8,
        account_age_days: 14,
        previous_step_up_failures: 1,
        behavior_anomaly_score: 64
      }
    },
    {
      id: "pres_new_device",
      name: "Valid New Device Checkout",
      description: "Reputable human customer logging in from a brand-new device; requires a safety evaluation.",
      inputs: {
        device_trust_score: 78,
        ip_risk_score: 18,
        failed_login_velocity: 0,
        associated_account_count: 2,
        account_age_days: 90,
        previous_step_up_failures: 0,
        behavior_anomaly_score: 22
      }
    }
  ];

  // Active inputs in Playground
  const [sandboxInputs, setSandboxInputs] = useState(presets[0].inputs);
  const [activePresetId, setActivePresetId] = useState<string>(presets[0].id);

  // Stepper State for EZKL Simulation
  const [provingStep, setProvingStep] = useState<number>(0); // 0: idle, 1: normalize, 2: inference, 3: prover, 4: verifier, 5: complete
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sandboxConsole, setSandboxConsole] = useState<string[]>([]);
  const [generatedProofId, setGeneratedProofId] = useState<string | null>(null);

  // Trigger preset change
  const handleSelectPreset = (pId: string) => {
    const found = presets.find(p => p.id === pId);
    if (found) {
      setSandboxInputs(found.inputs);
      setActivePresetId(pId);
      setProvingStep(0);
      setSandboxConsole([]);
    }
  };

  const addConsoleLine = (text: string) => {
    setSandboxConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  // Run the mock EZKL Proof flow
  const handleRunProver = () => {
    setIsProcessing(true);
    setProvingStep(1);
    setSandboxConsole([]);
    
    setTimeout(() => {
      // Step 1: Normalize & Hash
      const inputStr = JSON.stringify(sandboxInputs);
      let hashNum = 0;
      for (let i = 0; i < inputStr.length; i++) {
        hashNum = (hashNum << 5) - hashNum + inputStr.charCodeAt(i);
        hashNum |= 0;
      }
      const computedHash = "0x" + Math.abs(hashNum).toString(16).padEnd(64, 'a');
      
      addConsoleLine("Normalizing model risk telemetry features...");
      addConsoleLine(`Raw inputs compiled: ${Object.keys(sandboxInputs).length} safe mock features.`);
      addConsoleLine(`Privacy layer secured: Private identifiers isolated from proving loop.`);
      addConsoleLine(`Generating feature matrix hashes...`);
      addConsoleLine(`Public inputs payload hash generated: ${computedHash.substring(0, 24)}...`);
      
      setTimeout(() => {
        // Step 2: Model Inference
        setProvingStep(2);
        
        // Calculate a linear mock risk score
        const rawScore = Math.round(
          ( (100 - sandboxInputs.device_trust_score) * 0.25 ) + 
          ( sandboxInputs.ip_risk_score * 0.25 ) + 
          ( Math.min(sandboxInputs.failed_login_velocity * 8, 30) * 0.15 ) + 
          ( Math.min(sandboxInputs.associated_account_count * 5, 40) * 0.15 ) + 
          ( Math.max(100 - sandboxInputs.account_age_days, 0) * 0.10 ) + 
          ( sandboxInputs.previous_step_up_failures * 10 * 0.10 )
        );
        const modelRiskScore = Math.min(Math.max(rawScore, 1), 99);
        
        addConsoleLine(`Loading AAN Risk Model v0.1-sandbox Compiled Circuit...`);
        addConsoleLine(`Executing server-side model inference using ONNX backend.`);
        addConsoleLine(`Model risk score evaluation output completed.`);
        addConsoleLine(`Scoring output: ${modelRiskScore}% risk score.`);
        
        setTimeout(() => {
          // Step 3: Prover
          setProvingStep(3);
          const mockProofHash = "0x" + Math.random().toString(16).substring(2, 10).padEnd(64, 'e');
          
          addConsoleLine(`Initializing EZKL Halo2 multi-scalar multiplication prover...`);
          addConsoleLine(`Proving key hash loaded: 0x89ee184bf...faee6a7`);
          addConsoleLine(`Synthesizing circuit constraints for evaluated risk output.`);
          addConsoleLine(`Generating non-interactive zero-knowledge proof (NIZKP) token...`);
          addConsoleLine(`ZK Model Proof successfully synthesized: ${mockProofHash.substring(0, 24)}...`);
          
          setTimeout(() => {
            // Step 4: Verifier
            setProvingStep(4);
            const verifyTime = Math.floor(Math.random() * 80) + 140; // 140-220ms
            
            addConsoleLine(`Executing EZKL Halo2 cryptographic verification circuit...`);
            addConsoleLine(`Verification key hash loaded: 0xd92b2ef1a...18cf`);
            addConsoleLine(`Verifying public output matches: Verified risk output = ${modelRiskScore}%`);
            addConsoleLine(`Matching signature validation completed successfully.`);
            addConsoleLine(`Verification outcome: VALID (Proof verified in ${verifyTime}ms)`);
            
            setTimeout(() => {
              // Step 5: Complete
              setProvingStep(5);
              setIsProcessing(false);
              
              const trustEventId = "evt_aan_zk_" + Math.random().toString(36).substring(2, 10);
              const trustDecisionId = trustEventId;
              const zkProofId = "zkp_aan_" + Math.random().toString(36).substring(2, 10);
              
              // Decide decision
              let decision: 'ALLOW' | 'STEP_UP' | 'REVIEW' | 'DENY' = 'ALLOW';
              if (modelRiskScore >= 75) decision = 'DENY';
              else if (modelRiskScore >= 31) decision = 'STEP_UP';
              
              const newZKProof: ZKProof = {
                id: zkProofId,
                trust_event_id: trustEventId,
                trust_decision_id: trustDecisionId,
                model_version_id: "mv_9a8c7b6d-31",
                model_name: "AAN Risk Model v0.1-sandbox",
                proof_hash: mockProofHash,
                public_inputs_hash: computedHash,
                status: "verified",
                verified_output: modelRiskScore,
                verification_time_ms: verifyTime,
                created_at: new Date().toISOString(),
                inputs: { ...sandboxInputs },
                decision: decision
              };
              
              // Save to local proofs
              setProofs(prev => [newZKProof, ...prev]);
              setGeneratedProofId(zkProofId);
              
              addConsoleLine(`Uploading proof reference token to secure public ledger...`);
              addConsoleLine(`Linking ZK Proof: zk_proof_id = ${zkProofId}`);
              addConsoleLine(`Verification state recorded successfully. Complete.`);

              // Sync with global registry if available
              if (onAddEventToGlobalRegistry) {
                const globalEvent = {
                  id: trustEventId,
                  project: projName,
                  external_user_id: activePresetId === "pres_clean_user" ? "usr_verified_alice" :
                                    activePresetId === "pres_bot_spike" ? "usr_phantom_botnet" :
                                    activePresetId === "pres_evasion_match" ? "usr_borderline_charlie" : "usr_new_device",
                  decision: decision === 'ALLOW' ? 'approved' : decision === 'DENY' ? 'denied' : 'review',
                  risk_score: modelRiskScore,
                  reason_codes: decision === 'ALLOW' ? ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN"] : 
                                decision === 'DENY' ? ["DEVICE_SPOOF_DETECTED", "HIGH_RISK_IP", "ZK_VERIFIED"] : ["SUSPICIOUS_VELOCITY", "ZK_VERIFIED"],
                  device_signal: activePresetId === "pres_clean_user" ? "macOS Chrome 124" :
                                 activePresetId === "pres_bot_spike" ? "Headless Chrome (Linux)" :
                                 activePresetId === "pres_evasion_match" ? "Android WebView (Samsung S22)" : "iOS Safari (iPhone 15)",
                  ip_risk_signal: activePresetId === "pres_clean_user" ? "Low (0.01)" :
                                  activePresetId === "pres_bot_spike" ? "High (0.92)" :
                                  activePresetId === "pres_evasion_match" ? "Medium (0.45)" : "Low (0.18)",
                  returning_human: activePresetId === "pres_clean_user",
                  proof_token_status: "valid",
                  timestamp: new Date().toISOString(),
                  // Linked ZK fields
                  zk_proof_id: zkProofId,
                  zk_verified: true,
                  zk_model_version_id: "mv_9a8c7b6d-31",
                  model_risk_score: modelRiskScore,
                  model_output: modelRiskScore
                };
                onAddEventToGlobalRegistry(globalEvent);
              }
              
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Metrics calculations
  const totalProofs = proofs.length;
  const verifiedProofs = proofs.filter(p => p.status === 'verified').length;
  const failedProofs = proofs.filter(p => p.status === 'failed').length;
  const activeModelVersion = modelVersions.find(mv => mv.status === 'active')?.version || 'v0.1-sandbox';
  const averageVerificationTime = totalProofs > 0 
    ? Math.round(proofs.reduce((sum, p) => sum + p.verification_time_ms, 0) / totalProofs) 
    : 0;
  const decisionsWithProofsCount = totalProofs;

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[#58E38A] rounded-lg">
              <Binary className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-semibold text-white tracking-tight">ZK Proofs & Verifiable Scoring</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AAN can prove that a published risk model generated a specific risk score for a trust event, without exposing raw private inputs.
          </p>
        </div>

        {/* Local Tab Selector */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 border border-white/[0.04] p-1 rounded-xl text-[10px] font-mono">
          <button
            onClick={() => setSubTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${subTab === 'sandbox' ? 'bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            Proof Sandbox
          </button>
          <button
            onClick={() => setSubTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${subTab === 'metrics' ? 'bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            Dashboard Metrics
          </button>
          <button
            onClick={() => setSubTab('models')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${subTab === 'models' ? 'bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            Model Versions
          </button>
          <button
            onClick={() => setSubTab('decisions')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${subTab === 'decisions' ? 'bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            Decisions Ledger
          </button>
          <button
            onClick={() => setSubTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${subTab === 'docs' ? 'bg-[#58E38A]/10 text-[#58E38A] border border-[#58E38A]/20 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
          >
            ZK Workflow Docs
          </button>
        </div>
      </div>

      {/* METRICS SUB-TAB */}
      {subTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">ZK Proofs Generated</span>
                <span className="text-white text-2xl font-semibold font-mono block mt-1">{totalProofs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Secure cryptographic tokens</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/[0.03] border border-emerald-500/10 flex items-center justify-center text-[#58E38A]">
                <Cpu className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Proofs Verified</span>
                <span className="text-white text-2xl font-semibold font-mono block mt-1 text-[#58E38A]">{verifiedProofs}</span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">100% authenticity confidence</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/[0.03] border border-emerald-500/10 flex items-center justify-center text-[#58E38A]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Failed / Revoked Proofs</span>
                <span className="text-white text-2xl font-semibold font-mono block mt-1 text-rose-400">{failedProofs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Invalid computations flagged</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-500/[0.03] border border-rose-500/10 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Active Model Version</span>
                <span className="text-white text-base font-semibold font-mono block mt-1">{activeModelVersion}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Primary ONNX compiled circuit</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/[0.03] border border-blue-500/10 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Avg Verification Time</span>
                <span className="text-white text-2xl font-semibold font-mono block mt-1 text-emerald-400">{averageVerificationTime}ms</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">EZKL compiled Halo2 verifier</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#58E38A]/5 border border-[#58E38A]/10 flex items-center justify-center text-emerald-400 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Proof-Linked Decisions</span>
                <span className="text-white text-2xl font-semibold font-mono block mt-1">{decisionsWithProofsCount} events</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Trust decisions sealed with zk-proof</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/[0.03] border border-purple-500/10 flex items-center justify-center text-purple-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Metrics Explanation banner */}
          <div className="bg-[#58E38A]/5 border border-[#58E38A]/15 p-5 rounded-2xl flex gap-4 items-start text-xs text-left">
            <Info className="w-5 h-5 text-[#58E38A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-white font-semibold">How Verifiable Risk Scoring Strengthens Trust Ledger Security</h4>
              <p className="text-slate-400 leading-relaxed">
                By maintaining these zero-knowledge verification benchmarks, AAN demonstrates full structural accountability. Clients can confirm with 100% cryptographic certainty that the configured risk model ran unaltered, without receiving, parsing, or maintaining raw private identity data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODELS SUB-TAB */}
      {subTab === 'models' && (
        <div className="space-y-6">
          <div className="border-b border-white/[0.04] pb-4 text-left">
            <h3 className="text-sm font-semibold text-white">Active ZK Risk Models</h3>
            <p className="text-xs text-slate-400 mt-0.5">This model version defines the risk scoring logic used for verifiable trust decisions.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {modelVersions.map((mv) => (
              <div key={mv.id} className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl text-left space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-white font-semibold text-sm">{mv.name}</h4>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        mv.status === 'active' 
                          ? 'bg-emerald-500/10 text-[#58E38A] border border-emerald-500/20' 
                          : 'bg-black/40 text-slate-500 border border-white/[0.04]'
                      }`}>
                        {mv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">{mv.description}</p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Deployed: {new Date(mv.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Hashes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-black/30 border border-white/[0.02] p-4 rounded-xl text-[10.5px] font-mono">
                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-semibold">ONNX Model Hash (MD5/SHA256)</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="truncate">{mv.onnx_model_hash}</span>
                      <button 
                        onClick={() => handleCopy(mv.onnx_model_hash, mv.id + "_onnx")}
                        className="text-[#58E38A] hover:text-emerald-400 shrink-0 cursor-pointer"
                      >
                        {copiedText === mv.id + "_onnx" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-semibold">EZKL settings configuration Hash</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="truncate">{mv.ezkl_settings_hash}</span>
                      <button 
                        onClick={() => handleCopy(mv.ezkl_settings_hash, mv.id + "_settings")}
                        className="text-[#58E38A] hover:text-emerald-400 shrink-0 cursor-pointer"
                      >
                        {copiedText === mv.id + "_settings" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-semibold">Compiled Halo2 Circuit Hash</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="truncate">{mv.compiled_circuit_hash}</span>
                      <button 
                        onClick={() => handleCopy(mv.compiled_circuit_hash, mv.id + "_circuit")}
                        className="text-[#58E38A] hover:text-emerald-400 shrink-0 cursor-pointer"
                      >
                        {copiedText === mv.id + "_circuit" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-semibold">Proving Key Hash (pk)</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="truncate">{mv.proving_key_hash}</span>
                      <button 
                        onClick={() => handleCopy(mv.proving_key_hash, mv.id + "_pk")}
                        className="text-[#58E38A] hover:text-emerald-400 shrink-0 cursor-pointer"
                      >
                        {copiedText === mv.id + "_pk" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-semibold">Verification Key Hash (vk)</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="truncate">{mv.verification_key_hash}</span>
                      <button 
                        onClick={() => handleCopy(mv.verification_key_hash, mv.id + "_vk")}
                        className="text-[#58E38A] hover:text-emerald-400 shrink-0 cursor-pointer"
                      >
                        {copiedText === mv.id + "_vk" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROOF SANDBOX SUB-TAB */}
      {subTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
            
            {/* Left Panel: Feature Configurator */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#58E38A]" />
                <span>Risk Feature Inputs</span>
              </h3>

              {/* Preset Scenarios list */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Threat Profile Presets</span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        activePresetId === p.id 
                          ? 'bg-white/[0.03] text-white border-white/[0.08]' 
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold">{p.name}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Feature Sliders */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Normalized Features</span>
                  <span className="text-[9px] font-mono text-slate-500">Inputs scaled [0-100]</span>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  {/* Device Trust */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">device_trust_score</span>
                      <span className="text-white font-bold">{sandboxInputs.device_trust_score}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={isProcessing}
                      value={sandboxInputs.device_trust_score}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, device_trust_score: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* IP Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ip_risk_score</span>
                      <span className="text-white font-bold">{sandboxInputs.ip_risk_score}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={isProcessing}
                      value={sandboxInputs.ip_risk_score}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, ip_risk_score: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* Failed Login velocity */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">failed_login_velocity</span>
                      <span className="text-white font-bold">{sandboxInputs.failed_login_velocity} attempts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      disabled={isProcessing}
                      value={sandboxInputs.failed_login_velocity}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, failed_login_velocity: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* Coordinated accounts count */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">associated_account_count</span>
                      <span className="text-white font-bold">{sandboxInputs.associated_account_count} accounts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      disabled={isProcessing}
                      value={sandboxInputs.associated_account_count}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, associated_account_count: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* Account age days */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">account_age_days</span>
                      <span className="text-white font-bold">{sandboxInputs.account_age_days} days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      disabled={isProcessing}
                      value={sandboxInputs.account_age_days}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, account_age_days: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* Previous step up failures */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">previous_step_up_failures</span>
                      <span className="text-white font-bold">{sandboxInputs.previous_step_up_failures} times</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      disabled={isProcessing}
                      value={sandboxInputs.previous_step_up_failures}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, previous_step_up_failures: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>

                  {/* Behavior Anomaly */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">behavior_anomaly_score</span>
                      <span className="text-white font-bold">{sandboxInputs.behavior_anomaly_score}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={isProcessing}
                      value={sandboxInputs.behavior_anomaly_score}
                      onChange={(e) => {
                        setSandboxInputs({ ...sandboxInputs, behavior_anomaly_score: parseInt(e.target.value) });
                        setActivePresetId('');
                      }}
                      className="w-full accent-emerald-400 bg-black/40 h-1 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunProver}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-[#58E38A] hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs py-3 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-emerald-500/5 mt-2"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isProcessing ? "Synthesizing halo2 proof..." : "Generate & Verify ZK model proof"}</span>
                </button>
              </div>
            </div>

            {/* Right Panel: Stepper Sandbox Execution Console */}
            <div className="lg:col-span-3 space-y-4 flex flex-col h-full">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                EZKL Prover Execution Console
              </h3>

              <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Visual Steps representation */}
                <div className="grid grid-cols-5 gap-1 border-b border-white/[0.04] pb-4">
                  {[
                    { step: 1, name: "Normalize" },
                    { step: 2, name: "ONNX inference" },
                    { step: 3, name: "EZKL pk Proving" },
                    { step: 4, name: "Halo2 vk Verify" },
                    { step: 5, name: "Complete" }
                  ].map((s) => (
                    <div key={s.step} className="text-center space-y-1">
                      <div className={`h-1.5 rounded-full ${
                        provingStep >= s.step 
                          ? s.step === 5 ? 'bg-emerald-400' : 'bg-[#58E38A]' 
                          : 'bg-black/50'
                      } transition-colors duration-500`} />
                      <span className={`text-[8px] font-mono tracking-tighter uppercase block truncate ${
                        provingStep === s.step ? 'text-[#58E38A] font-bold' : 'text-slate-500'
                      }`}>{s.name}</span>
                    </div>
                  ))}
                </div>

                {/* Console Log Screen */}
                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl font-mono text-[10px] text-[#58E38A] h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
                  {sandboxConsole.length === 0 ? (
                    <div className="text-slate-600 italic h-full flex items-center justify-center text-center">
                      Configure telemetry inputs on the left, then click "Generate & Verify ZK model proof" to run the pipeline.
                    </div>
                  ) : (
                    sandboxConsole.map((line, idx) => (
                      <div key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</div>
                    ))
                  )}
                </div>

                {/* Verification result card if finished */}
                {provingStep === 5 && generatedProofId && (
                  <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-4 rounded-xl space-y-3 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs text-white font-semibold block">ZK model proof generated & verified successfully</span>
                        <span className="text-[10px] text-[#58E38A] font-mono block">Verifier: EZKL Halo2 circuit check passed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-white/[0.04] pt-2.5">
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Proof reference ID</span>
                        <span className="text-slate-300 font-bold">{generatedProofId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Verified model risk score</span>
                        <span className="text-[#58E38A] font-bold">
                          {proofs.find(p => p.id === generatedProofId)?.verified_output}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Decision issued</span>
                        <span className="text-white font-bold uppercase">
                          {proofs.find(p => p.id === generatedProofId)?.decision}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Action Linked</span>
                        <span className="text-slate-300 font-bold">Verification Events Ledger</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DECISIONS LEDGER SUB-TAB */}
      {subTab === 'decisions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h3 className="text-sm font-semibold text-white">Proof-Linked Trust Decisions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cryptographically verified risk results sealed using EZKL model proofs.</p>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Active ledger verified proofs count: {proofs.length}
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-black/10">
                    <th className="py-3 px-5 font-bold">Proof Reference ID</th>
                    <th className="py-3 px-5 font-bold">Trust Event Reference</th>
                    <th className="py-3 px-5 font-bold">ZK Verified Score</th>
                    <th className="py-3 px-5 font-bold">Proof Hash</th>
                    <th className="py-3 px-5 font-bold">Verification Time</th>
                    <th className="py-3 px-5 font-bold">Status</th>
                    <th className="py-3 px-5 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-slate-300">
                  {proofs.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedProof(p)}
                      className="hover:bg-white/[0.01] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 space-y-0.5">
                        <span className="font-mono text-white block font-semibold">{p.id}</span>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">{p.model_name}</span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-slate-400">
                        {p.trust_event_id}
                      </td>

                      <td className="py-3.5 px-5 space-y-0.5">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-white font-bold block">{p.verified_output}%</span>
                          <span className="text-[9px] text-slate-500">score</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          p.decision === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.decision === 'DENY' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {p.decision}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-slate-500">
                        <span className="truncate block max-w-[150px]">{p.proof_hash}</span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-[#58E38A] font-semibold">
                        {p.verification_time_ms}ms
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono text-slate-500 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPER DOCUMENTATION SUB-TAB */}
      {subTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl text-left space-y-6">
            <div className="border-b border-white/[0.04] pb-4">
              <h3 className="text-sm font-semibold text-white">Verifiable Risk Scoring Workflow (EZKL / ZK ML Proof Layer)</h3>
              <p className="text-xs text-slate-400 mt-1">
                AAN implements a robust cryptographic verification framework enabling verifiable machine learning scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Steps Ledger */}
              <div className="space-y-4">
                <h4 className="text-[#58E38A] font-mono uppercase text-[10px] tracking-wider font-bold">The Verifiable Trust Pipeline</h4>
                
                <div className="space-y-3 font-sans">
                  {[
                    { step: 1, title: "Export risk model to ONNX", desc: "Train your safe custom risk assessment model and export it to standardized ONNX representation." },
                    { step: 2, title: "Compile model with EZKL", desc: "Process the ONNX file with EZKL toolchain to compile into a Halo2 arithmetic constraint circuit." },
                    { step: 3, title: "Generate proving & verification keys", desc: "Run trusted setups to generate cryptographic keys (pk, vk) corresponding to compile parameters." },
                    { step: 4, title: "Run trust event through risk model", desc: "Receive safe, normalized telemetry inputs and run fast inference locally/server-side." },
                    { step: 5, title: "Generate proof", desc: "Run EZKL Halo2 prover on inputs and generated output to create the cryptographic ZK model proof." },
                    { step: 6, title: "Verify proof server-side", desc: "Check the proof ref token against public verifier verification key to confirm correct evaluation." },
                    { step: 7, title: "Attach proof to trust_decision", desc: "Seals the verifiable risk outcome with zk_proof_id, zk_verified, and model hash links." },
                    { step: 8, title: "Return signed trust decision with proof status", desc: "Issues a cryptographically signed payload that any client can inspect and independently verify." }
                  ].map((s) => (
                    <div key={s.step} className="flex gap-3.5 items-start">
                      <div className="w-5 h-5 rounded bg-[#58E38A]/10 border border-[#58E38A]/20 flex items-center justify-center font-mono text-[10px] text-[#58E38A] shrink-0 font-bold">
                        {s.step}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-white font-semibold">{s.title}</span>
                        <p className="text-slate-400 leading-normal text-[11px]">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical rationale panel */}
              <div className="space-y-4 bg-black/40 border border-white/[0.04] p-5 rounded-xl self-start h-full">
                <h4 className="text-white font-semibold">Verify Claims Code Example</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  When a client retrieves a trust decision from the AAN API gateway, it returns verified fields proving model execution validity. 
                </p>

                {/* Code Block */}
                <div className="bg-black/80 border border-white/[0.05] p-4 rounded-xl font-mono text-[10px] text-[#58E38A] overflow-x-auto space-y-1 text-left leading-relaxed">
                  <div>{"{"}</div>
                  <div className="pl-4">{"\"decision\": \"STEP_UP\","}</div>
                  <div className="pl-4">{"\"trust_score\": 42,"}</div>
                  <div className="pl-4">{"\"risk_score\": 82,"}</div>
                  <div className="pl-4">{"\"model_risk_score\": 82,"}</div>
                  <div className="pl-4">{"\"zk_verified\": true,"}</div>
                  <div className="pl-4">{"\"zk_proof\": {"}</div>
                  <div className="pl-8">{"\"status\": \"verified\","}</div>
                  <div className="pl-8">{"\"model\": \"AAN Risk Model v0.1-sandbox\","}</div>
                  <div className="pl-8">{"\"proof_hash\": \"0x7a8df1e51b6a71e82b7cfdc1d7c92b2ef8...\""}</div>
                  <div className="pl-8">{"\"public_inputs_hash\": \"0x3fa99bcfdc1d7c92b2ef81977a4ee4...\""}</div>
                  <div className="pl-4">{"}"}</div>
                  <div>{"}"}</div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg text-slate-500 italic text-[10.5px]">
                  “AAN can prove that a published risk model generated a specific risk score for a trust event, without exposing raw private inputs.”
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / POPUP MODAL (Update the Trust Decision page to show a new card: ZK Model Proof) */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0c10] border border-white/[0.08] w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl animate-[fadeIn_0.15s_ease-out] text-left">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-[#58E38A] uppercase tracking-wider font-bold">Verifiable Trust Decision Detail</span>
                <h4 className="text-white text-xs font-semibold font-mono">
                  {selectedProof.trust_event_id}
                </h4>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer bg-white/[0.02] border border-white/[0.05] py-1 px-3 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Standard Event Metadata card */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-black/20 p-3.5 rounded-xl border border-white/[0.02] font-mono">
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider">Event ID</span>
                <span className="text-white block font-semibold">{selectedProof.trust_event_id}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider">Evaluation Timestamp</span>
                <span className="text-white block">{new Date(selectedProof.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* ZK Model Proof Component Card (REQUESTED STEP 5) */}
            <div className="bg-black/40 border border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[#58E38A] rounded-lg">
                    <Binary className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider font-mono">ZK Model Proof</h4>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                  selectedProof.status === 'verified' 
                    ? 'bg-emerald-500/10 text-[#58E38A] border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  {selectedProof.status}
                </span>
              </div>

              {/* Card Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Model Name & Circuit</span>
                  <span className="text-white font-semibold">AAN Risk Model v0.1-sandbox</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Verified Risk Score Output</span>
                  <span className="text-[#58E38A] font-bold text-xs">{selectedProof.verified_output}% Risk Score</span>
                </div>

                <div className="md:col-span-2">
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Cryptographic Proof Hash</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="truncate block max-w-sm">{selectedProof.proof_hash}</span>
                    <button 
                      onClick={() => handleCopy(selectedProof.proof_hash, "detail_proof")}
                      className="text-[#58E38A] hover:text-emerald-400 cursor-pointer shrink-0"
                    >
                      {copiedText === "detail_proof" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Public Inputs payload Hash</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="truncate block max-w-sm">{selectedProof.public_inputs_hash}</span>
                    <button 
                      onClick={() => handleCopy(selectedProof.public_inputs_hash, "detail_inputs")}
                      className="text-[#58E38A] hover:text-emerald-400 cursor-pointer shrink-0"
                    >
                      {copiedText === "detail_inputs" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Verification Proving Time</span>
                  <span className="text-white">{selectedProof.verification_time_ms} ms</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-semibold">Prover Framework Verifier</span>
                  <span className="text-emerald-400 font-semibold">EZKL Halo2</span>
                </div>
              </div>

              {/* Descriptive caption */}
              <p className="text-[10px] text-slate-400 leading-normal bg-black/40 p-3 rounded-xl border border-white/[0.02]">
                “This proof verifies that the published AAN risk model produced this risk score for the trust event. Raw private inputs are not exposed.”
              </p>
            </div>

            {/* Inputs block (emphasizing they are hidden from downstream but shown in simulator sandbox) */}
            <div className="bg-black/20 border border-white/[0.04] p-4 rounded-xl space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <span>Model Input Signatures</span>
                <span className="text-[#58E38A] font-bold">RAW INPUTS HIDDEN</span>
              </div>
              <p className="text-slate-400 text-[10.5px] leading-relaxed">
                Raw client telemetry (e.g., precise hardware attributes, network addresses, mouse coordinates) was processed locally to compile range-bound feature indices, then immediately discarded.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
