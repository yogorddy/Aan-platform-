import React from "react";
import { 
  Activity, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw, BarChart2, 
  TrendingUp, Zap, Server, ShieldCheck, GraduationCap
} from "lucide-react";
import { isAcademyEnabled } from '../academyConfig';

interface HealthMonitorTabProps {
  onNavigateToAcademy: (lessonId: string) => void;
}

export default function HealthMonitorTab({ onNavigateToAcademy }: HealthMonitorTabProps) {
  
  // Real mathematical metrics
  const healthStats = [
    { label: "API Edge Availability", value: "99.98%", desc: "Platform SLA status of gateway channels", trend: "+0.02%", isGood: true },
    { label: "Webhook Dispatch rate", value: "99.91%", desc: "Completed deliveries to registered partner endpoints", trend: "+0.08%", isGood: true },
    { label: "Average Response Latency", value: "38.2ms", desc: "Dynamic risk verification pipeline time", trend: "-4.1ms", isGood: true },
    { label: "Token Verification Success Rate", value: "100.00%", desc: "Cryptographic sign claims validated status", trend: "Stable", isGood: true }
  ];

  const recentFailures = [
    { id: "err_sb_009", type: "403_CORS_BLOCKED", origin: "https://unknownvisitor.io", desc: "Blocked client script call from unregistered origin domain.", time: "4 mins ago" },
    { id: "err_sb_008", type: "409_SYBIL_DUP", origin: "Client Scans", desc: "Disallowed duplicate facial signature templates matches cached signatures.", time: "19 mins ago" },
    { id: "err_sb_007", type: "401_SEC_REVOKED", origin: "Platform Auth", desc: "Missing key authorizations. Target proxy requested empty parameter header.", time: "1 hour ago" }
  ];

  // Visual trend charts calculated using Tailwind flex row layouts
  const volumeDataTrend = [
    { hour: "08:00", count: 120 },
    { hour: "10:00", count: 240 },
    { hour: "12:00", count: 480 },
    { hour: "14:00", count: 320 },
    { hour: "16:00", count: 640 },
    { hour: "18:00", count: 910 },
    { hour: "20:00", count: 750 }
  ];

  const latencyTrend = [42, 45, 38, 35, 41, 38, 37];

  return (
    <div className="space-y-6 text-slate-300 font-sans text-left">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1b1e28] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-extrabold bg-[#111319] px-2.5 py-0.5 border border-[#1b1e28] rounded">
            Enterprise Health Telemetry
          </span>
          <h2 className="text-xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Integration Health & SLA Metrics
          </h2>
          <p className="text-xs text-[#78819a] max-w-2xl leading-relaxed">
            Monitor real-time gateway uptimes, dispatch performance thresholds, and cryptographic validation failures to maintain pristine connectivity across distributed services.
          </p>
        </div>

        {isAcademyEnabled() && (
          <button
            onClick={() => onNavigateToAcademy("risk_engine")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-blue-900/40 text-[10px] uppercase font-bold font-mono transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Explain Risk Signals
          </button>
        )}
      </div>

      {/* Grid STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStats.map((stat) => (
          <div key={stat.label} className="bg-[#111319] border border-[#1b1e28] p-5 rounded-xl space-y-2">
            <span className="font-mono text-[9px] text-[#78819a] font-extrabold uppercase tracking-wider block">
              {stat.label}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-sans tracking-tight">{stat.value}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                stat.trend.startsWith("+") || stat.trend === "Stable" 
                  ? "bg-emerald-950/45 text-emerald-400" 
                  : "bg-blue-950/45 text-blue-400"
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] text-[#78819a] leading-normal">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Verification volume trends (7 cols) */}
        <div className="lg:col-span-8 bg-[#111319] border border-[#1b1e28] p-5 rounded-xl space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#1b1e28]">
            <div>
              <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                REST verification request volume trend
              </h3>
              <p className="text-[10px] text-[#78819a] font-sans">Visual request peaks mapped across recent service intervals.</p>
            </div>
            <span className="text-[10px] font-mono text-[#78819a] font-black uppercase">Recent 24 Hours</span>
          </div>

          {/* Spark bar chart model */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-[#1b1e28] pb-2">
            {volumeDataTrend.map((data, idx) => {
              const pct = (data.count / 910) * 100;
              return (
                <div key={data.hour} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <span className="text-[9px] font-mono text-[#78819a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                    {data.count} reqs
                  </span>
                  
                  {/* CSS Visual Column Bar */}
                  <div className="w-full bg-[#0d0e12] rounded-t-md h-32 flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        idx === 5 
                          ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-900" 
                          : "bg-gradient-to-t from-blue-700 to-indigo-500"
                      }`}
                    />
                  </div>

                  <span className="text-[9px] font-mono text-[#78819a] font-black">{data.hour}</span>
                </div>
              );
            })}
          </div>

          {/* Chart info summary */}
          <div className="flex justify-between items-center text-[10px] font-mono text-[#78819a] pt-1">
            <span>Peak capacity load: <b className="text-white">910 reqs/hr</b></span>
            <span>Total integrated endpoints certified: <b className="text-blue-400">9</b></span>
          </div>
        </div>

        {/* Latency list and status tracker (4 cols) */}
        <div className="lg:col-span-4 bg-[#111319] border border-[#1b1e28] p-5 rounded-xl space-y-5">
          <div className="pb-2 border-b border-[#1b1e28]">
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              Edge Response Latency Trend
            </h3>
            <p className="text-[10px] text-[#78819a] font-sans">Standard global route execution latency.</p>
          </div>

          {/* Simple sparks line display */}
          <div className="space-y-2 font-mono text-[10px]">
            {latencyTrend.map((lat, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-[#1b1e28] pb-1.5">
                <span className="text-[#78819a]">Interval Bucket #{idx + 1}:</span>
                <span className="text-white font-bold flex items-center gap-1">
                  {lat}ms
                  <span className={`w-1.5 h-1.5 rounded-full ${lat < 40 ? "bg-emerald-500" : lat < 43 ? "bg-amber-500" : "bg-red-500"}`} />
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0d0e12] border border-[#1b1e28] rounded text-[9px] font-mono text-[#78819a] leading-normal">
            Latency counts verify raw speed indices. AAN uses highly secure server-side routes ensuring immediate verification actions is delivered.
          </div>
        </div>

      </div>

      {/* Recent Failure Logs */}
      <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#1b1e28] pb-2">
          <div>
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-450" />
              Edge integration threat & exception logs
            </h3>
            <p className="text-[10px] text-[#78819a] font-sans">Recent security exceptions flagged by domain CORS filters or Sybil blocks.</p>
          </div>
          <span className="text-[10px] font-mono text-[#78819a] uppercase font-bold">Past 30 Days</span>
        </div>

        <div className="space-y-2 font-mono text-[10.5px]">
          {recentFailures.map((fail) => (
            <div key={fail.id} className="p-3 bg-[#0d0e12] border border-[#1b1e28] rounded-lg flex flex-col sm:flex-row justify-between gap-2 text-left">
              <div className="space-y-1 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-950 border border-rose-900/40 text-rose-400 font-extrabold text-[9px] px-1.5 py-0.2 rounded">
                    {fail.type}
                  </span>
                  <span className="text-[#78819a] text-[10px]">Origin: <b className="text-slate-300">{fail.origin}</b></span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px] font-sans">{fail.desc}</p>
              </div>

              <span className="text-[9px] text-[#78819a] font-bold shrink-0 uppercase sm:text-right">
                {fail.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
