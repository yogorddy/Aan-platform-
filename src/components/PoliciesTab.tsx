import React, { useState } from 'react';
import { 
  Sliders, 
  CheckCircle2, 
  Cpu, 
  Code, 
  X,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface PoliciesTabProps {
  trustRules: any;
  setTrustRules: (rules: any) => void;
  policies: any[];
  setPolicies: React.Dispatch<React.SetStateAction<any[]>>;
  savingRules: boolean;
  rulesSuccess: boolean;
  onSaveTrustRules: () => void;
}

export default function PoliciesTab({
  trustRules,
  setTrustRules,
  policies,
  setPolicies,
  savingRules,
  rulesSuccess,
  onSaveTrustRules
}: PoliciesTabProps) {
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState("");

  const handleSaveJson = () => {
    if (!editingPolicyId) return;
    try {
      // Validate JSON
      JSON.parse(editingJson);
      setPolicies(prev => prev.map(p => p.id === editingPolicyId ? { ...p, jsonRule: editingJson } : p));
      setEditingPolicyId(null);
      alert("JSON policy parameters updated. Be sure to click Save Trust Rules below to commit.");
    } catch (err) {
      alert("Invalid JSON format. Please verify braces and quotes.");
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <span>Trust Policies</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Instruct your AAN node how to automatically route trust assertions, issue manual challenges, and enforce rules.
        </p>
      </div>

      {/* Success Notifications */}
      {rulesSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Engine parameters saved successfully. Node synchronized with remote gateway.</span>
        </div>
      )}

      {/* Main Policy Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Numeric Thresholds */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Automated Score Routing</h3>
          <p className="text-[11px] text-slate-500">Instruct AAN how to automatically issue proof decisions based on telemetry risk score margins.</p>
          
          {/* Auto Approve Slider */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Auto Approve Below Risk Score</span>
              <span className="font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-bold">
                &lt; {trustRules.autoApproveBelow}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={trustRules.autoApproveBelow}
              onChange={(e) => setTrustRules({ 
                ...trustRules, 
                autoApproveBelow: parseInt(e.target.value),
                manualReviewAbove: parseInt(e.target.value) + 1
              })}
              className="w-full accent-emerald-500 bg-slate-100 h-1.5 rounded-lg"
            />
            <p className="text-[10px] text-slate-500">Sessions securing risk indices under this range bypass checks and are marked Approved instantly.</p>
          </div>

          {/* Review range information */}
          <div className="p-3.5 bg-amber-500/[0.04] border border-amber-500/15 rounded-xl space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-700">Manual Review Interval</span>
              <span className="font-mono text-amber-700 font-bold">
                {trustRules.manualReviewAbove}% to {trustRules.denyAbove - 1}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-light">
              Attestations landing in this volatile variance buffer will require manual admin oversight before granting access permissions.
            </p>
          </div>

          {/* Auto Deny Slider */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Auto Deny Above Risk Score</span>
              <span className="font-mono bg-rose-500/10 border border-rose-500/20 text-rose-700 px-2 py-0.5 rounded font-bold">
                &gt; {trustRules.denyAbove}%
              </span>
            </div>
            <input
              type="range"
              min="55"
              max="90"
              value={trustRules.denyAbove}
              onChange={(e) => setTrustRules({ ...trustRules, denyAbove: parseInt(e.target.value) })}
              className="w-full accent-rose-500 bg-slate-100 h-1.5 rounded-lg"
            />
            <p className="text-[10px] text-slate-500">Sessions capturing high botnet indicators over this limit are automatically denied tokens.</p>
          </div>
        </div>

        {/* Right Column: Actions Configurations */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Risk Policies</h3>
          <p className="text-[11px] text-slate-500">Select behavioral responses for system anomalies and security events.</p>

          {/* Duplicate Action */}
          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Duplicate Account Signature</label>
            <select
              value={trustRules.duplicateAction}
              onChange={(e) => setTrustRules({ ...trustRules, duplicateAction: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-900 cursor-pointer"
            >
              <option value="flag">Flag & Continue (Monitor Only)</option>
              <option value="block">Block Duplicate Signatures</option>
              <option value="review">Route to Manual Review Pool</option>
            </select>
          </div>

          {/* Bot Suspicion Action */}
          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Bot Suspicion Event</label>
            <select
              value={trustRules.botSuspicionAction}
              onChange={(e) => setTrustRules({ ...trustRules, botSuspicionAction: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-900 cursor-pointer"
            >
              <option value="verify">Enforce Volatile Video Proof</option>
              <option value="block_immediate">Block Immediately</option>
              <option value="captcha">Challenge with CAPTCHA Proof</option>
            </select>
          </div>

          {/* Fallback mode */}
          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Users without camera access</label>
            <select
              value={trustRules.fallbackNoCamera}
              onChange={(e) => setTrustRules({ ...trustRules, fallbackNoCamera: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-900 cursor-pointer"
            >
              <option value="allow_with_risk_penalty">Allow with Risk Penalty (+30 Score)</option>
              <option value="deny">Deny access immediately</option>
              <option value="otp_fallback">Fallback to SMS/Email OTP verification</option>
            </select>
          </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSaveTrustRules}
          disabled={savingRules}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          {savingRules ? (
            <span>Syncing parameters...</span>
          ) : (
            <>
              <span>Save Trust Rules</span>
              <Sliders className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Policies List Table */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-4">
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Active Policy Handlers</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define constraints for account associations, device matches, and velocity rules.</p>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Total Active: {policies.filter(p => p.enabled).length}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {policies.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="space-y-1 max-w-xl text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 font-semibold">{p.name}</span>
                  <span className="bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                    {p.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px] font-light">
                  <span>Threshold: <strong className="text-slate-700 font-mono font-normal">{p.threshold}</strong></span>
                  <span className="flex items-center gap-1.5">
                    Action: 
                    <select
                      value={p.recommendedAction}
                      onChange={(e) => {
                        const updatedAction = e.target.value as any;
                        setPolicies(prev => prev.map(item => item.id === p.id ? { ...item, recommendedAction: updatedAction } : item));
                      }}
                      className="bg-slate-50 border border-slate-200 focus:outline-none rounded px-2 py-0.5 text-[10px] font-mono text-emerald-700 cursor-pointer"
                    >
                      <option value="ALLOW">ALLOW</option>
                      <option value="STEP_UP">STEP_UP</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="DENY">DENY</option>
                      <option value="FLAG_ONLY">FLAG_ONLY</option>
                    </select>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => {
                    setEditingPolicyId(p.id);
                    setEditingJson(p.jsonRule);
                  }}
                  className="text-[10px] font-mono text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg"
                >
                  <Code className="w-3 h-3" />
                  <span>Edit JSON</span>
                </button>

                <button
                  onClick={() => {
                    setPolicies(prev => prev.map(item => item.id === p.id ? { ...item, enabled: !item.enabled } : item));
                  }}
                  className={`text-[10px] font-mono uppercase px-3 py-1 rounded-lg transition-all cursor-pointer font-bold border ${
                    p.enabled 
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {p.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Rule Editing Dialog Overlay */}
      {editingPolicyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditingPolicyId(null)} />
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit JSON Policy Parameters</h3>
              <button onClick={() => setEditingPolicyId(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={editingJson}
              onChange={(e) => setEditingJson(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 text-[#00D632] font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setEditingPolicyId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveJson}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Apply Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
