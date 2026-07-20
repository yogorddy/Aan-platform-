import React, { useState } from 'react';
import { 
  Activity, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle,
  Cpu,
  Network
} from 'lucide-react';
import TrustGraphTab from './TrustGraphTab';

interface TrustIntelligenceTabProps {
  events: any[];
}

export default function TrustIntelligenceTab({ events }: TrustIntelligenceTabProps) {
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);

  // Derive risk indicators
  const totalAttempts = events.length;
  const highRiskSessions = events.filter(e => e.risk_score >= 70).length;
  const averageRisk = totalAttempts > 0 
    ? Math.round(events.reduce((sum, e) => sum + e.risk_score, 0) / totalAttempts) 
    : 15;

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Trust Intelligence Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Perform passive behavioral analysis, emulator diagnostics, and coordinate detection across multiple session variables.
          </p>
        </div>

        <button
          onClick={() => setShowNetworkGraph(!showNetworkGraph)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
            showNetworkGraph 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "bg-sky-500/10 border-sky-500/20 text-sky-700 hover:bg-sky-500/15"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>{showNetworkGraph ? "Hide Network Graph" : "View Trust Relationship Graph"}</span>
        </button>
      </div>

      {showNetworkGraph ? (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono tracking-widest text-sky-700 uppercase font-bold">Experimental Capability Module</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Trust Graph & Sybil Swarm Analyzer</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Correlate ephemeral device signatures, shared IP networks, and browser canvases to map coordinated sybil farms and multi-account bot patterns.
            </p>
          </div>
          <TrustGraphTab />
        </div>
      ) : (
        <>
          {/* Main Risk Diagnostics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Average Session Risk</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">{averageRisk}%</span>
                <p className="text-[11px] text-slate-400 font-light">Overall risk level computed across passive assessments.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${averageRisk}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Bot Farm Signatures</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">{highRiskSessions} detected</span>
                <p className="text-[11px] text-slate-400 font-light">Active emulators or bot patterns flagged at the entry perimeter.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${totalAttempts > 0 ? (highRiskSessions / totalAttempts) * 100 : 0}%` }} className="bg-rose-500 h-full rounded-full" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Integrity Level</span>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-slate-950">99.2%</span>
                <p className="text-[11px] text-slate-400 font-light">Device and browser fingerprint consistency across authentic requests.</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[99.2%]" />
              </div>
            </div>
          </div>

          {/* Behavioral Anomaly indicators logs */}
          <div className="space-y-3 text-left">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Passive Risk Anomaly Indicators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-950">
                  <span className="font-bold text-xs">Device Fingerprint Cloaking</span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Diagnostic</span>
                </div>
                <p className="text-xs text-slate-500 font-light leading-normal">
                  Identifies canvas noise, WebGL context spoofing, and user-agent manipulation patterns commonly used by headless automation frameworks.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-950">
                  <span className="font-bold text-xs">Credential stuffing velocity</span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Diagnostic</span>
                </div>
                <p className="text-xs text-slate-500 font-light leading-normal">
                  Monitors account-linking request clusters to flag credentials sprayed from a single localized browser context or virtual proxy network.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
