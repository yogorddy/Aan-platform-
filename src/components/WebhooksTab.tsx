import React, { useState } from 'react';
import { 
  Network, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Server
} from 'lucide-react';

interface WebhooksTabProps {
  whSecret: string;
}

export default function WebhooksTab({ whSecret }: WebhooksTabProps) {
  const [webhookUrl, setWebhookUrl] = useState("https://api.acme.com/v1/callbacks/aan");
  const [copied, setCopied] = useState(false);
  
  const [deliveryLogs, setDeliveryLogs] = useState([
    { id: "msg_9c4f8d21", event: "trust_decision.approved", url: webhookUrl, status: 200, time: "18ms", attempts: 1, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: "msg_3b8a1c9e", event: "trust_decision.denied", url: webhookUrl, status: 200, time: "24ms", attempts: 1, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    { id: "msg_7f2d5e31", event: "trust_decision.review", url: webhookUrl, status: 503, time: "Timeout", attempts: 3, timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString() }
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(whSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTestWebhook = () => {
    const newLog = {
      id: "msg_test_" + Math.random().toString(36).substring(2, 8),
      event: "trust_decision.test",
      url: webhookUrl,
      status: 200,
      time: "14ms",
      attempts: 1,
      timestamp: new Date().toISOString()
    };
    setDeliveryLogs(prev => [newLog, ...prev]);
    alert("Test webhook payload dispatched successfully. Delivery log recorded below.");
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-600" />
          <span>Webhook Subscriptions</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Deliver real-time signed trust decision events directly to your server architecture using cryptographically secured payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Webhook Endpoint Settings</h3>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Endpoint URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">HMAC Secret Signing Key</label>
                <button onClick={handleCopy} className="text-[10px] font-mono text-[#00D632] hover:underline">
                  {copied ? "Copied!" : "Copy Secret"}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-[11px] text-slate-900 truncate">
                {whSecret || "whsec_sb_placeholder"}
              </div>
            </div>

            <button 
              onClick={handleTestWebhook}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              Dispatch Test Payload
            </button>
          </div>
        </div>

        {/* Delivery Logs */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Delivery Logs</h3>
          
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4 font-bold">Message ID</th>
                  <th className="py-3 px-4 font-bold">Assurance Event</th>
                  <th className="py-3 px-4 font-bold">Response</th>
                  <th className="py-3 px-4 font-bold">Latency</th>
                  <th className="py-3 px-4 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {deliveryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono text-slate-900">{log.id}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-sans font-medium">{log.event}</td>
                    <td className="py-3.5 px-4">
                      {log.status === 200 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>200 OK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>{log.status} FAIL</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{log.time}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
