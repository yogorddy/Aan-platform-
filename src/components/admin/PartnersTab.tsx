import React, { useState } from 'react';
import { EnterprisePartner, initialPartners } from './AdminMockData';
import { 
  Key, Radio, Mail, RefreshCw, Check, Copy, ExternalLink, ShieldAlert, Wifi, WifiOff 
} from 'lucide-react';

interface PartnersTabProps {
  compactMode: boolean;
  role: string;
  onLogAudit: (action: string, targetType: string, targetId: string, metadata: any) => void;
}

export default function PartnersTab({ compactMode, role, onLogAudit }: PartnersTabProps) {
  const [partners, setPartners] = useState<EnterprisePartner[]>(initialPartners);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const handleCopyKey = (partnerName: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(partnerName);
    setTimeout(() => setCopiedKey(null), 1500);
    onLogAudit('partner.key_copy', 'partner_api_key', partnerName, {});
  };

  const handleRegenerateKey = (partnerName: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot rotate live API credentials.");
      return;
    }
    if (!confirm(`Are you sure you want to instantly rotate live production API key for ${partnerName}? Current client integrations will fail until they swap in the new credential.`)) return;

    const newKey = `aan_sk_live_${partnerName.toLowerCase().replace(/ /g, '_')}_` + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    setPartners(prev => prev.map(p => {
      if (p.name === partnerName) {
        return { ...p, apiKey: newKey };
      }
      return p;
    }));
    onLogAudit('partner.key_rotate', 'partner_api_key', partnerName, { rotated_by: role });
    alert(`Successfully generated new secret key for ${partnerName}: \n${newKey}\n\nCopy this credential immediately. It will not be shown again.`);
  };

  const handleToggleStatus = (partnerName: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot suspend or activate enterprise partners.");
      return;
    }
    setPartners(prev => prev.map(p => {
      if (p.name === partnerName) {
        const nextStatus = p.status === 'Active' ? 'Suspended' : 'Active';
        onLogAudit('partner.status_toggle', 'partner_app', partnerName, { previous_status: p.status, next_status: nextStatus });
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleTestWebhook = (partner: EnterprisePartner) => {
    setTestingWebhook(partner.name);
    onLogAudit('partner.webhook_test', 'partner_webhook', partner.name, { url: partner.webhookUrl });
    
    setTimeout(() => {
      setTestingWebhook(null);
      alert(`Webhook Delivery to ${partner.name} succeeded! \nURL: ${partner.webhookUrl}\nHTTP Response: 200 OK\nLatency: 45ms\nPayload: {"event":"test.ping","verified":true}`);
    }, 1200);
  };

  return (
    <div className={`space-y-6 animate-[fadeIn_0.2s_ease-out]`}>
      
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Integrating Partners & Tenant Environments</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-sans font-medium">
          Active integrations configuring node access, auditing monthly request scopes, and authenticating via sovereign key signatures.
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm animate-[fadeIn_0.25s_ease-out]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="py-3.5 px-4 font-bold">Organization Name</th>
                <th className="py-3.5 px-4 font-bold">Status & Plan</th>
                <th className="py-3.5 px-4 font-bold">API Secret Keys</th>
                <th className="py-3.5 px-4 font-bold">Webhook Posture</th>
                <th className="py-3.5 px-4 font-bold">Monthly Inbound Queries</th>
                <th className="py-3.5 px-4 font-bold">Calculated Trust</th>
                <th className="py-3.5 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {partners.map((p) => (
                <tr key={p.name} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Organization Name & Status */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {p.connectionStatus === 'Online' ? (
                        <span className="w-2 h-2 rounded-full bg-[#00C853]" title="Gateway Online" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" title="Gateway Suspended" />
                      )}
                      <div>
                        <span className="text-slate-900 block font-bold text-sm">{p.name}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Activity: {p.recentActivity}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Plan */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase block w-fit ${p.status === 'Active' ? 'bg-emerald-50 text-[#00C853] border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {p.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans block mt-1 font-medium">{p.plan}</span>
                  </td>

                  {/* API Secret Keys */}
                  <td className="py-4 px-4 font-mono">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200/50 w-fit">
                      <span className="text-slate-600 text-[10px] font-semibold">
                        {copiedKey === p.name ? p.apiKey : `${p.apiKey.substring(0, 16)}...`}
                      </span>
                      <button
                        onClick={() => handleCopyKey(p.name, p.apiKey)}
                        className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedKey === p.name ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(p.name)}
                        className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
                        title="Rotate Secret Key"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Webhook Posture */}
                  <td className="py-4 px-4 text-xs">
                    <span className={`block font-bold ${p.webhookStatus.includes('Healthy') ? 'text-[#00C853]' : p.webhookStatus.includes('Failing') ? 'text-rose-600' : 'text-slate-500'}`}>
                      {p.webhookStatus}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate max-w-[160px] mt-0.5 font-medium" title={p.webhookUrl}>
                      {p.webhookUrl}
                    </span>
                  </td>

                  {/* Monthly Queries */}
                  <td className="py-4 px-4 text-slate-700 font-bold font-mono">
                    {p.monthlyRequests}
                    <span className="text-[9px] text-slate-400 block font-medium">Across {p.projectsCount} Node(s)</span>
                  </td>

                  {/* Trust Score */}
                  <td className="py-4 px-4 text-slate-800 font-bold">
                    {p.trustScore}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleTestWebhook(p)}
                        disabled={testingWebhook === p.name}
                        className="bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm inline-flex items-center gap-1.5"
                      >
                        {testingWebhook === p.name ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3 h-3 text-emerald-600" />
                            <span>Test Webhook</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(p.name)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-all shadow-sm ${p.status === 'Active' ? 'bg-rose-50 hover:bg-rose-100/60 text-rose-600 border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100/60 text-emerald-700 border-emerald-200'}`}
                      >
                        {p.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
