import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  HelpCircle,
  Cpu,
  Key,
  Terminal,
  Server
} from 'lucide-react';

interface IntegrationsTabProps {
  pubKey: string;
  secKey: string;
  whSecret: string;
  projectId: string;
  onRotateKeys: () => void;
}

export default function IntegrationsTab({ pubKey, secKey, whSecret, projectId, onRotateKeys }: IntegrationsTabProps) {
  const [secretShown, setSecretShown] = useState(false);
  const [keysCopied, setKeysCopied] = useState<Record<string, boolean>>({});
  const [codeTab, setCodeTab] = useState<'frontend' | 'backend' | 'webhook'>('frontend');

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setKeysCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setKeysCopied(prev => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-600" />
            <span>Developer Integration Portal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access secure API credentials, cryptographic endpoints, Webhook signature headers, and multi-language SDK documentation.
          </p>
        </div>

        <button
          onClick={onRotateKeys}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Rotate API Credentials</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Credentials Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Node Cryptographic Keys</span>
            </h3>

            {/* Project ID */}
            <div className="space-y-1 text-xs">
              <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Tenant Project ID</label>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-[11px] text-slate-900 truncate">
                {projectId || "proj_sb_aan_201"}
              </div>
            </div>

            {/* Publishable Key */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Publishable Client Key</label>
                <button 
                  onClick={() => copyText(pubKey, 'pub')}
                  className="text-[10px] font-mono text-[#00D632] hover:underline"
                >
                  {keysCopied['pub'] ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-[11px] text-slate-900 truncate">
                {pubKey || "aan_pub_sb_placeholder"}
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono uppercase tracking-wider text-rose-500 block font-semibold">Secret Key</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSecretShown(!secretShown)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-900"
                  >
                    {secretShown ? "Hide" : "Show"}
                  </button>
                  <button 
                    onClick={() => copyText(secKey, 'sec')}
                    className="text-[10px] font-mono text-[#00D632] hover:underline"
                  >
                    {keysCopied['sec'] ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-[11px] text-slate-900 truncate">
                {secretShown ? secKey : "••••••••••••••••••••••••••••••••••••••••"}
              </div>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Webhook Signature HMAC Secret</label>
                <button 
                  onClick={() => copyText(whSecret, 'wh')}
                  className="text-[10px] font-mono text-[#00D632] hover:underline"
                >
                  {keysCopied['wh'] ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-[11px] text-slate-900 truncate">
                {whSecret || "whsec_sb_placeholder"}
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippets Column */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Integration SDK Guides</h3>
                
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {[
                    { key: 'frontend', label: 'Web SDK' },
                    { key: 'backend', label: 'Node API' },
                    { key: 'webhook', label: 'HMAC Verify' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCodeTab(tab.key as any)}
                      className={`px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        codeTab === tab.key 
                          ? "bg-white text-slate-950 shadow-xs" 
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Blocks */}
              <div className="bg-slate-950 rounded-2xl p-5 text-left font-mono text-[10.5px] leading-relaxed text-slate-300 border border-slate-800 overflow-x-auto">
                {codeTab === 'frontend' && (
                  <pre>
{`// Install Client Web SDK
// npm install @aan/web-sdk

import { AanClient } from "@aan/web-sdk";

const aan = new AanClient({
  publishableKey: "${pubKey || "aan_pub_sb_placeholder"}"
});

// Launch passive evaluation
const verdict = await aan.evaluate({
  sessionId: "vss_session_91a0f"
});`}
                  </pre>
                )}

                {codeTab === 'backend' && (
                  <pre>
{`// Install Server Node SDK
// npm install @aan/node-sdk

import { AanVerifier } from "@aan/node-sdk";

const verifier = new AanVerifier({
  secretKey: "${secKey || "aan_sec_sb_placeholder"}"
});

// Confirm humanness claims securely
app.post("/api/verify-human", async (req, res) => {
  const { proofToken } = req.body;
  const decision = await verifier.verify(proofToken);
  
  if (decision.status === "APPROVED") {
    // Process authentic registration...
  }
});`}
                  </pre>
                )}

                {codeTab === 'webhook' && (
                  <pre>
{`// Secure Webhook payload validation
import crypto from 'crypto';

app.post("/webhooks/aan", (req, res) => {
  const signature = req.headers["aan-signature"];
  const payload = JSON.stringify(req.body);
  
  const expectedSig = crypto
    .createHmac("sha256", "${whSecret || "whsec_sb_placeholder"}")
    .update(payload)
    .digest("hex");
    
  if (signature === expectedSig) {
    // Webhook matches! Update local user status...
  }
});`}
                  </pre>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-150 mt-6 flex gap-3 text-[10px]">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-950 font-bold">Need assistance?</span>
                <p className="text-slate-500 font-light mt-0.5 leading-normal">
                  Our integration infrastructure guarantees compatibility with auth providers like Auth0, Clerk, Supabase, Firebase, and Custom databases. Refer to docs for advanced setups.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
