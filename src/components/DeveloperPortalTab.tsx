import React, { useState } from "react";
import { 
  Code, Terminal, Key, ShieldCheck, Copy, Check, Download, Info, BookOpen, 
  Settings, Play, Send, RefreshCw, AlertTriangle, HelpCircle, Activity, ExternalLink, GraduationCap
} from "lucide-react";
import { isAcademyEnabled } from '../academyConfig';

interface DeveloperPortalTabProps {
  onNavigateToAcademy: (lessonId: string) => void;
}

export default function DeveloperPortalTab({ onNavigateToAcademy }: DeveloperPortalTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sdkLanguage, setSdkLanguage] = useState<"javascript" | "typescript" | "node" | "python" | "java" | "go" | "php" | "csharp" | "ruby">("typescript");
  const [portalSection, setPortalSection] = useState<"quickstart" | "explorer" | "sdks" | "webhooks" | "changelog">("quickstart");

  // API Explorer dynamic request testing state
  const [explorerEndpoint, setExplorerEndpoint] = useState<"verify-session" | "verify-proof-token" | "device-risk">("verify-session");
  const [explorerApiKey, setExplorerApiKey] = useState("poh_key_sandbox_secret_99");
  const [explorerUserId, setExplorerUserId] = useState("user_example_99");
  const [explorerEmailHash, setExplorerEmailHash] = useState("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
  const [explorerToken, setExplorerToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiJvcmdfZW50ZXJwcmlzZV85OTkiLCJwcm9qZWN0X2lkIjoicHJval9zZWN1cml0eV83NzciLCJwYXJ0bmVyX3VzZXJfaWQiOiJ1c2VyX2V4YW1wbGVfOTkiLCJzZXNzaW9uX2lkIjoidnNzX2E5YjFjMmQzZTRmNSIsInZlcmlmaWNhdGlvbl9zdGF0dXMiOiJwYXNzZWQiLCJ1bmlxdWVuZXNzX3N0YXR1cyI6InVuaXF1ZSIsInJpc2tfbGV2ZWwiOiJsb3ciLCJpc3N1ZWRfYXQiOiIyMDI2LTA2LTIxVDIyOjQxOjQwWiIsImV4cGlyZXNfYXQiOiIyMDI2LTA3LTIxVDIyOjQxOjQwWiJ9.MockSignatureCheckingDone");
  const [isRequesting, setIsRequesting] = useState(false);
  const [explorerResponse, setExplorerResponse] = useState<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sdkSpecs: Record<string, { label: string; install: string; init: string; request: string; validate: string }> = {
    typescript: {
      label: "TypeScript SDK",
      install: "npm install @aan-api/sdk-typescript",
      init: `import { AanClient } from "@aan-api/sdk-typescript";

// Initialize AAN sandboxed client
const aan = new AanClient({
  apiKey: process.env.AAN_API_KEY || "poh_key_sandbox_secret",
  endpoint: "https://sandbox-api.aan.trust/v1"
});`,
      request: `// Creating a new verification trust evaluation session
const session = await aan.sessions.verify({
  partner_user_id: "user_example_99",
  email_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  device_fingerprint: "device_laptop_win_1092e"
});

console.log(\`Verdict: \${session.verification_status}. Risk score: \${session.risk_score}%\`);
if (session.recommended_action === "require_reverification") {
  // Redirect visitor to verification scanning flow URL
  console.log(\`Redirect to check: \${session.verification_url}\`);
}`,
      validate: `// Decrypting and validating a cryptographically signed proof token
try {
  const proof = await aan.proofs.validate({
    proof_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."
  });
  
  if (proof.valid) {
    console.log("Verification status confirmed safely:", proof.claims.verification_status);
  }
} catch (error) {
  console.error("Cryptographic sign validation failed:", error.message);
}`
    },
    javascript: {
      label: "JavaScript SDK (Web)",
      install: "npm install @aan-api/sdk-javascript",
      init: `import { AanWebClient } from "@aan-api/sdk-javascript";

// Set client configurations securely
const aan = new AanWebClient({
  apiKey: "poh_key_sandbox_public_only",
  environment: "sandbox"
});`,
      request: `// Initiates user scan flow within your native client iframe or popups
aan.onboarding.startSession({
  sessionId: "vss_a9b1c2d3e4f5",
  onSuccess: (result) => {
    console.log("Verification finished! Signed payload proof:", result.proof_token);
  },
  onFailure: (err) => {
    console.error("User scanning exited:", err.reason);
  }
});`,
      validate: `// Proof checks MUST be executed on your backend server keys.
// Never validate tokens directly in public browsers!`
    },
    node: {
      label: "Node.js Server SDK",
      install: "npm install @aan-api/sdk-node",
      init: `const { AanClient } = require("@aan-api/sdk-node");

const aan = new AanClient({
  apiKey: process.env.AAN_SECRET_KEY,
  environment: "sandbox"
});`,
      request: `// Create a verification request securely
aan.sessions.verify({
  partner_user_id: "internal_id_user_123",
  email_hash: "sha256_0a92f8bbf149d"
}).then(session => {
  console.log("Action path:", session.recommended_action);
});`,
      validate: `// Decode cryptographic signature matching
aan.proofs.validate("eyJhbGciOiJIUzI1...")
  .then(res => console.log("Signature active status:", res.valid));`
    },
    python: {
      label: "Python SDK (Pip)",
      install: "pip install aan-trust-sdk",
      init: `from aan_trust import AanClient
import os

aan = AanClient(
    api_key=os.environ.get("AAN_API_KEY", "poh_key_sandbox_secret"),
    sandbox=True
)`,
       request: `# Create verification request stream
session = aan.sessions.verify(
    partner_user_id="user_example_99",
    email_hash="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
)

print(f"Verdict: {session.verification_status}. Score: {session.risk_score}")`,
      validate: `# Validate signed proof signature
proof = aan.proofs.validate(proof_token="eyJhbGciOiJIUz...")
if proof.is_valid:
    print("User authenticated confidently!")`
    },
    java: {
      label: "Java Integration Maven",
      install: `<dependency>
  <groupId>trust.aan</groupId>
  <artifactId>aan-sdk-java</artifactId>
  <version>1.2.0</version>
</dependency>`,
      init: `import trust.aan.sdk.AanClient;

AanClient aan = new AanClient(
    System.getenv("AAN_API_KEY"), 
    true // Use isolated Sandbox environment
);`,
      request: `import trust.aan.sdk.models.SessionVerification;

SessionVerification session = aan.sessions().verify(
    "user_example_99", 
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
);

System.out.println("Enforcement suggested: " + session.getRecommendedAction());`,
      validate: `boolean isValid = aan.proofs().validate("eyJhbGciOiJIU...");`
    },
    go: {
      label: "Go SDK",
      install: "go get github.com/aan-api/sdk-go",
      init: `package main

import (
	"github.com/aan-api/sdk-go/aan"
	"os"
)

func main() {
	client := aan.NewClient(os.Getenv("AAN_API_KEY"), aan.WithSandbox())
}`,
      request: `// Verify incoming signups risk index
session, err := client.Sessions.Verify(ctx, aan.VerifyParams{
	PartnerUserID: "user_example_99",
	EmailHash:     "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
})`,
      validate: `// Validate cryptographically signed claims
valid, claims, err := client.Proofs.Validate("eyJhbG...")`
    },
    php: {
      label: "PHP Composer Library",
      install: "composer require aan-api/sdk-php",
      init: `<?php
use AanApi\\Sdk\\AanClient;

$aan = new AanClient([
    'api_key' => getenv('AAN_API_KEY'),
    'sandbox' => true
]);`,
      request: `$session = $aan->sessions->verify([
    'partner_user_id' => 'user_example_99',
    'email_hash' => 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
]);

echo "Recommended protocol: " . $session->recommended_action;`,
      validate: `$proof = $aan->proofs->validate("eyJhbGciOiJIUz...");
if ($proof->valid) {
    echo "Privacy-preserving user status verified.";
}`
    },
    csharp: {
      label: "C# NuGet Integration",
      install: "dotnet add package Aan.Trust.Sdk",
      init: `using Aan.Trust.Sdk;

var aan = new AanClient(new AanConfig {
    ApiKey = Environment.GetEnvironmentVariable("AAN_API_KEY"),
    UseSandbox = true
});`,
      request: `var session = await aan.Sessions.VerifyAsync(new VerifyRequest {
    PartnerUserId = "user_example_99",
    EmailHash = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
});`,
      validate: `var validStatus = await aan.Proofs.ValidateAsync("eyJhbGciOi...");`
    },
    ruby: {
      label: "Ruby Gem Integration",
      install: "gem install aan_trust_sdk",
      init: `require 'aan_trust_sdk'

aan = AanTrustSdk::Client.new(
  api_key: ENV['AAN_API_KEY'],
  sandbox: true
)`,
      request: `session = aan.sessions.verify(
  partner_user_id: "user_example_99",
  email_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
)`,
      validate: `is_valid = aan.proofs.validate("eyJhbGciOiJIUzI1...")`
    }
  };

  const executeExplorerSim = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      let resData = {};
      if (explorerEndpoint === "verify-session") {
        resData = {
          human_status: "verified",
          uniqueness_status: "unique",
          risk_level: "low",
          risk_score: 12,
          proof_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({
            partner_user_id: explorerUserId,
            status: "passed",
            risk_score: 12,
            certified: true
          })) + ".sIGNATURE_vALIDATION_KEY",
          recommended_action: "allow",
          session_id: "vss_sb_rec_190a2a",
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      } else if (explorerEndpoint === "verify-proof-token") {
        resData = {
          valid: true,
          algorithm: "HS256",
          claims: {
            organization_id: "org_enterprise_999",
            project_id: "proj_security_777",
            partner_user_id: explorerUserId,
            session_id: "vss_a9b1c2d3e4f5",
            human_status: "verified",
            uniqueness_status: "unique",
            risk_level: "low",
            issued_at: new Date().toISOString()
          }
        };
      } else {
        resData = {
          device_trusted: true,
          fingerprint_id: "sandbox_fingerprint_win10_chrome",
          active_sessions_on_this_device: 1,
          simulated_risk_alerts: [],
          recommended_action: "allow_with_mfa_evaluation"
        };
      }
      setExplorerResponse(resData);
    }, 1100);
  };

  return (
    <div className="space-y-6 text-slate-300 antialiased font-sans text-left">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1b1e28] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-extrabold bg-[#111319] px-2.5 py-0.5 border border-[#1b1e28] rounded">
            SANDBOX STAGING ENVIRONMENT ACTIVE
          </span>
          <h2 className="text-xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400 animate-pulse" />
            Developer Portal & Integration Hub
          </h2>
          <p className="text-xs text-[#78819a] max-w-2xl leading-relaxed">
            Fully offline, zero-production sandbox references. Connect via SDK libraries, query API Explorer, trigger mock event webhooks, and evaluate cryptographic proofs.
          </p>
        </div>
        
        {isAcademyEnabled() && (
          <button
            onClick={() => onNavigateToAcademy("developer_sdk")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-955/40 hover:bg-[#111319] text-blue-400 hover:text-blue-300 border border-[#1b1e28] text-[10px] uppercase font-bold font-mono transition-all cursor-pointer shrink-0"
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            AAN Academy Docs
          </button>
        )}
      </div>

      {/* Internal Portal Menu Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-[#1b1e28] pb-1 scrollbar-none font-mono text-[11px] font-bold uppercase">
        <button
          onClick={() => setPortalSection("quickstart")}
          className={`px-4 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0 ${
            portalSection === "quickstart" 
              ? "border-blue-500 text-blue-400 bg-[#111319]" 
              : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0d0e12]"
          }`}
        >
          Quick Start & Reference
        </button>
        <button
          onClick={() => setPortalSection("explorer")}
          className={`px-4 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0 ${
            portalSection === "explorer" 
              ? "border-blue-500 text-blue-400 bg-[#111319]" 
              : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0d0e12]"
          }`}
        >
          Interactive API Explorer
        </button>
        <button
          onClick={() => setPortalSection("sdks")}
          className={`px-4 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0 ${
            portalSection === "sdks" 
              ? "border-blue-500 text-blue-400 bg-[#111319]" 
              : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0d0e12]"
          }`}
        >
          Official SDK Libraries ({Object.keys(sdkSpecs).length})
        </button>
        <button
          onClick={() => setPortalSection("webhooks")}
          className={`px-4 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0 ${
            portalSection === "webhooks" 
              ? "border-blue-500 text-blue-400 bg-[#111319]" 
              : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0d0e12]"
          }`}
        >
          Webhooks Gateway Specs
        </button>
        <button
          onClick={() => setPortalSection("changelog")}
          className={`px-4 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0 ${
            portalSection === "changelog" 
              ? "border-blue-500 text-blue-400 bg-[#111319]" 
              : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0d0e12]"
          }`}
        >
          Version History & Status
        </button>
      </div>

      {/* PORTAL SECTION 1: QUICKSTART, RATE LIMITS, ERROR CODES & FAQ */}
      {portalSection === "quickstart" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* Main quick start guide */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-xs font-black uppercase text-blue-404 tracking-wider">Authentication Protocol</h3>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                Every API call to AAN servers must include the custom header <code className="text-white font-mono bg-[#0d0e12] px-1.5 py-0.5 rounded border border-[#1b1e28]">x-api-key</code> containing your secure hash. Authorization is handled at the edge with <span className="text-white underline font-medium">HMAC verification</span>.
              </p>
              
              <div className="bg-[#0d0e12] border border-[#1b1e28] rounded p-3 font-mono text-[11px] text-emerald-404">
                <span>Header standard format:</span>
                <pre className="mt-1.5 text-[#78819a]">
{`x-api-key: poh_key_sandbox_b73ae84abdf34
Content-Type: application/json`}
                </pre>
              </div>
            </div>

            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-3.5">
              <h3 className="font-mono text-xs font-black uppercase text-blue-404 tracking-wider">Rate Limit Policy Intervals</h3>
              <p className="text-xs text-[#78819a] leading-normal font-sans">
                AAN employs strict IP and Organization-level rate filters to prevent denial-of-service attempts and duplicate account validation abuse:
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0d0e12] border border-[#1b1e28] p-2.5 rounded">
                  <span className="text-[9px] font-mono text-[#78819a] block">SANDBOX</span>
                  <span className="text-xs font-mono font-bold text-slate-300 block mt-0.5">180 Reqs/Min</span>
                  <span className="text-[8px] text-[#78819a]">Soft throttling</span>
                </div>
                <div className="bg-[#0d0e12] border border-[#1b1e28] p-2.5 rounded">
                  <span className="text-[9px] font-mono text-[#78819a] block">STAGING</span>
                  <span className="text-xs font-mono font-bold text-blue-400 block mt-0.5">600 Reqs/Min</span>
                  <span className="text-[8px] text-[#78819a]">Secure limits</span>
                </div>
                <div className="bg-[#0d0e12] border border-[#1b1e28] p-2.5 rounded">
                  <span className="text-[9px] font-mono text-[#78819a] block">PRODUCTION</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">3,000+ Reqs/Min</span>
                  <span className="text-[8px] text-[#78819a]">Custom dedicated tier</span>
                </div>
              </div>
              <p className="text-[9px] text-[#78819a] font-mono">
                Exceeding triggers HTTP Standard code <span className="text-rose-400">429 (Too Many Requests)</span> with headers detailing retry estimates.
              </p>
            </div>

            {/* Error codes dictionary */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-3">
              <h3 className="font-mono text-xs font-black uppercase text-[#78819a] tracking-wider">Standard API Error Codes Mapping</h3>
              
              <div className="h-44 overflow-y-auto border border-[#1b1e28] rounded p-2.5 bg-[#0d0e12] space-y-2 text-[10px] font-mono scrollbar-thin">
                <div className="flex justify-between border-b border-[#1b1e28]/60 pb-1.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">400_BAD_PAYLOAD</span>
                  <span className="text-[#78819a] flex-1">Missing partner_user_id unique keys or malformed structures.</span>
                </div>
                <div className="flex justify-between border-b border-[#1b1e28]/60 pb-1.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">401_SEC_REVOKED</span>
                  <span className="text-[#78819a] flex-1">API Key missing, inactive, revoked, or failing scope requirements.</span>
                </div>
                <div className="flex justify-between border-b border-[#1b1e28]/60 pb-1.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">403_CORS_BLOCKED</span>
                  <span className="text-[#78819a] flex-1">Origin headers do not match allowed domain lists configured.</span>
                </div>
                <div className="flex justify-between border-b border-[#1b1e28]/60 pb-1.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">404_SEC_NOT_FOUND</span>
                  <span className="text-[#78819a] flex-1">Session ID or requested tenant does not exist in relational tables.</span>
                </div>
                <div className="flex justify-between border-b border-[#1b1e28]/60 pb-1.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">409_DUPLICATE_ID</span>
                  <span className="text-[#78819a] flex-1">Signatures represent a previously registered and authenticated unique identity.</span>
                </div>
                <div className="flex justify-between pb-0.5 gap-2">
                  <span className="text-rose-400 font-extrabold w-24">503_SRV_OFFLINE</span>
                  <span className="text-[#78819a] flex-1">Mock trust provider stream timeouts or temporary outages.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar FAQs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3 text-xs leading-relaxed">
              <h4 className="font-mono text-[10px] font-black uppercase text-[#78819a] tracking-wider">Frequently Asked Questions</h4>
              
              <div className="space-y-3 font-sans">
                <div className="border-b border-[#1b1e28] pb-2.5">
                  <span className="font-mono font-bold text-slate-300 block text-[11px]">Does AAN store personal assets?</span>
                  <span className="text-[#78819a] mt-1 block">No. Raw hardware credentials compile locally into mathematical hashes before being destroyed forever.</span>
                </div>
                <div className="border-b border-[#1b1e28] pb-2.5">
                  <span className="font-mono font-bold text-slate-300 block text-[11px]">Can we build a custom app UI?</span>
                  <span className="text-[#78819a] mt-1 block">Yes. Utilize official Javascript SDK endpoints inside iframes, or style with standard brand manuals.</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-300 block text-[11px]">What is the typical SLA response?</span>
                  <span className="text-[#78819a] mt-1 block">Edge pipelines evaluate risk structures in under 45ms. Interactive posture checks take under 1 second.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PORTAL SECTION 2: INTERACTIVE API EXPLORER */}
      {portalSection === "explorer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn items-start">
          
          {/* Controls column (5 cols) */}
          <div className="lg:col-span-5 bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4 text-left">
            <h3 className="font-mono text-xs font-black uppercase text-blue-404 tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-400" />
              API Shell Play Parameters
            </h3>

            {/* Select Endpoint */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-mono text-[#78819a] uppercase font-black">Target Endpoint</label>
              <select
                value={explorerEndpoint}
                onChange={(e) => setExplorerEndpoint(e.target.value as any)}
                className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none"
              >
                <option value="verify-session">POST /api/v1/verify-session</option>
                <option value="verify-proof-token">POST /api/v1/verify-proof-token</option>
                <option value="device-risk">GET /api/v1/device-risk-score</option>
              </select>
            </div>

            {/* Secret key input */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-mono text-[#78819a] uppercase font-black">Custom Header Authorization</label>
              <input
                type="text"
                value={explorerApiKey}
                onChange={(e) => setExplorerApiKey(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none placeholder-slate-651"
                placeholder="x-api-key standard key"
              />
            </div>

            {/* Payload values */}
            {explorerEndpoint === "verify-session" && (
              <>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-mono text-[#78819a] uppercase font-black">Partner User Identifier</label>
                  <input
                    type="text"
                    value={explorerUserId}
                    onChange={(e) => setExplorerUserId(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-mono text-[#78819a] uppercase font-black">Privacy Hash (Email Hash)</label>
                  <input
                    type="text"
                    value={explorerEmailHash}
                    onChange={(e) => setExplorerEmailHash(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </>
            )}

            {explorerEndpoint === "verify-proof-token" && (
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-[#78819a] uppercase font-black">Proof JWT string</label>
                <textarea
                  value={explorerToken}
                  onChange={(e) => setExplorerToken(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-300 focus:outline-none break-all"
                />
              </div>
            )}

            {explorerEndpoint === "device-risk" && (
              <div className="p-3 bg-[#0d0e12] border border-[#1b1e28] rounded-lg text-xs leading-normal font-sans">
                <span className="text-[9px] font-mono text-blue-400 font-extrabold uppercase">AUTO EVAL</span>
                <span className="text-[#78819a] mt-1 block">Simulates device profiling parameters evaluation such as browser plugins, canvas models, and screen coordinates.</span>
              </div>
            )}

            <button
              onClick={executeExplorerSim}
              disabled={isRequesting}
              className="w-full py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-white" />
              {isRequesting ? "Executing Pipeline..." : "Send Sandbox Request"}
            </button>
          </div>

          {/* Code outputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Request CURL display */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden text-left">
              <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28]/60 flex justify-between items-center font-mono text-[9px] text-[#78819a] font-bold">
                <span>COMPILED CURL SHELL SCHEME</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST https://sandbox-api.aan.trust/v1/${explorerEndpoint === "verify-session" ? "verify-session" : explorerEndpoint === "verify-proof-token" ? "verify-proof-token" : "device-risk-score"}`, "curl")}
                  className="hover:text-white flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  {copiedCode === "curl" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              
              <pre className="p-4 font-mono text-[10px] text-slate-350 overflow-x-auto whitespace-pre">
{`curl -X POST https://sandbox-api.aan.trust/v1/${explorerEndpoint === "verify-session" ? "verify-session" : explorerEndpoint === "verify-proof-token" ? "verify-proof-token" : "device-risk-score"} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${explorerApiKey || "YOUR_KEY"}" \\
${explorerEndpoint === "verify-session" ? `  -d '{
    "partner_user_id": "${explorerUserId}",
    "email_hash": "${explorerEmailHash.slice(0, 20)}..."
  }'` : explorerEndpoint === "verify-proof-token" ? `  -d '{
    "proof_token": "${explorerToken.slice(0, 25)}..."
  }'` : `  -d '{
    "device_fingerprint": "sandbox_fp_abc"
  }'`}`}
              </pre>
            </div>

            {/* Response Area */}
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl overflow-hidden text-left">
              <div className="bg-[#0d0e12] px-4 py-2 border-b border-[#1b1e28]/60 font-mono text-[9px] text-[#78819a] font-bold">
                <span>SANDBOX RESPONSE JSON SCHEMAS</span>
              </div>
              
              <div className="p-4 bg-[#0d0e12] min-h-[160px] flex flex-col justify-between font-mono text-[10px]">
                {isRequesting ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mb-1.5" />
                    <span>Cryptographic handshake running...</span>
                  </div>
                ) : explorerResponse ? (
                  <pre className="text-emerald-400 overflow-x-auto">
                    {JSON.stringify(explorerResponse, null, 2)}
                  </pre>
                ) : (
                  <span className="text-slate-400 block py-6 text-center">
                    (Await parameter launch. Hit Send Sandbox Request to parse)
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* PORTAL SECTION 3: OFFICIAL SDK LIBRARIES */}
      {portalSection === "sdks" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Lang Selectors */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 font-mono text-[10px] font-bold">
            {(Object.keys(sdkSpecs) as Array<keyof typeof sdkSpecs>).map((lang) => (
              <button
                key={lang}
                onClick={() => setSdkLanguage(lang)}
                className={`py-2 px-1 rounded border transition-all cursor-pointer capitalize text-center ${
                  sdkLanguage === lang 
                    ? "bg-blue-600 border-blue-500 text-white shadow" 
                    : "bg-[#111319] border border-[#1b1e28] text-[#78819a] hover:text-slate-200"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Active selection */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1b1e28] pb-3">
              <div>
                <h4 className="text-sm font-mono font-extrabold text-white capitalize">{sdkLanguage} Client Setup Guide</h4>
                <p className="text-[11px] text-[#78819a] font-sans">Official library distributions compiled from verified OpenAPI specs.</p>
              </div>
              <button
                onClick={() => alert(`Beginning download stream for: library_poh_sdk_${sdkLanguage}.tar.gz`)}
                className="px-3 py-1.5 bg-blue-955 text-blue-404 hover:bg-blue-900 hover:text-blue-300 border border-[#1b1e28] font-mono text-[10px] font-black uppercase rounded flex items-center gap-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download package
              </button>
            </div>

            {/* SDK Code grids */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start text-left">
              
              {/* Left Install & Init */}
              <div className="space-y-5">
                {/* 1. Installation */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-[#78819a] uppercase tracking-wider block">1. CLI Installation</span>
                  <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg p-3 font-mono text-[11px] text-emerald-400 flex justify-between items-center group">
                    <pre className="overflow-x-auto truncate max-w-[85%]">{sdkSpecs[sdkLanguage].install}</pre>
                    <button
                      onClick={() => copyToClipboard(sdkSpecs[sdkLanguage].install, "inst")}
                      className="text-slate-500 hover:text-white cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedCode === "inst" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. Authentication / Init */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-[#78819a] uppercase tracking-wider block">2. Security Initialization</span>
                  <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg p-3.5 font-mono text-[10px] text-slate-300 relative group">
                    <button
                      onClick={() => copyToClipboard(sdkSpecs[sdkLanguage].init, "init")}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200 cursor-pointer text-xs"
                    >
                      {copiedCode === "init" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="overflow-x-auto whitespace-pre">{sdkSpecs[sdkLanguage].init}</pre>
                  </div>
                </div>
              </div>

              {/* Right Request & Token Verify */}
              <div className="space-y-5">
                {/* 3. Verification Request */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-[#78819a] uppercase block">3. Creation of verify session request</span>
                  <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg p-3.5 font-mono text-[10px] text-blue-300 relative group">
                    <button
                      onClick={() => copyToClipboard(sdkSpecs[sdkLanguage].request, "req")}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200 cursor-pointer text-xs"
                    >
                      {copiedCode === "req" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="overflow-x-auto whitespace-pre">{sdkSpecs[sdkLanguage].request}</pre>
                  </div>
                </div>

                {/* 4. Validate proofs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-[#78819a] uppercase block font-black">4. Cryptographic Proof token Check</span>
                  <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg p-3.5 font-mono text-[10px] text-emerald-300 relative group">
                    <button
                      onClick={() => copyToClipboard(sdkSpecs[sdkLanguage].validate, "val")}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                    >
                      {copiedCode === "val" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="overflow-x-auto whitespace-pre">{sdkSpecs[sdkLanguage].validate}</pre>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PORTAL SECTION 4: WEBHOOK EVENTS MANUAL */}
      {portalSection === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn items-start">
          
          {/* Detailed Specs (8 cols) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4">
              <h3 className="font-mono text-xs font-black uppercase text-blue-404 tracking-wider">Payload signature validation guide</h3>
              <p className="text-xs text-[#78819a] leading-relaxed font-sans">
                AAN signs every outgoing webhook POST bundle using your cryptographic webhook secret. Secure systems check the header <code className="text-white bg-[#0d0e12] px-1 border border-[#1b1e28] p-0.5 rounded">x-aan-signature</code> with HMAC-SHA256 protocol.
              </p>
              
              <div className="bg-[#0d0e12] border border-[#1b1e28] rounded p-4 font-mono text-[10px]">
                <div className="text-[9px] text-[#78819a] uppercase font-black border-b border-[#1b1e28] pb-2 mb-2">Node.js Webhook integrity Checker</div>
                <pre className="text-blue-300 overflow-x-auto">
{`const crypto = require("crypto");

app.post("/v1/auth/aan-status", (req, res) => {
  const signature = req.headers["x-aan-signature"];
  const secret = process.env.AAN_WHSEC_SECRET; //whsec_...
  
  // Calculate cryptographic hash matching
  const calculated = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
    
  if (signature === calculated) {
    console.log("Integrity match! Safe to trust payload.");
    res.status(200).send("Verified");
  } else {
    res.status(403).send("Signature verification failed ");
  }
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* Webhook events whitelists (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3.5 text-xs text-left">
              <h4 className="font-mono text-[10px] font-black uppercase text-[#78819a] tracking-wider">Available Event Triggers</h4>
              
              <div className="space-y-3 font-mono text-[9px]">
                <div className="p-2.5 bg-[#0d0e12] rounded border border-[#1b1e28]">
                  <span className="text-emerald-400 font-extrabold block">aan.verification.completed</span>
                  <span className="text-slate-500 block mt-1">Fires instantly when user trust signature successfully matches privacy thresholds.</span>
                </div>
                <div className="p-2.5 bg-[#0d0e12] rounded border border-[#1b1e28]">
                  <span className="text-rose-400 font-extrabold block">aan.verification.failed</span>
                  <span className="text-slate-500 block mt-1">Fires if validation fails multiple times due to signature timeouts or structural anomalies.</span>
                </div>
                <div className="p-2.5 bg-[#0d0e12] rounded border border-[#1b1e28]">
                  <span className="text-purple-400 font-extrabold block">aan.removal.approved</span>
                  <span className="text-slate-500 block mt-1">Fires when user deletes credentials securely in self-serve claiming panel.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PORTAL SECTION 5: VERSION HISTORY & PLATFORM STATUS */}
      {portalSection === "changelog" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn items-start">
          
          {/* Version logs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-5">
              <h3 className="font-mono text-xs font-black uppercase text-blue-440 tracking-wider">Release Version History</h3>
              
              <div className="space-y-4">
                <div className="border-l-2 border-emerald-500 pl-4 space-y-1 text-left">
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase">v1.2.4 (Latest Stable Release - Active)</span>
                  <span className="text-xs font-mono font-bold text-white block">Proof validator upgrades</span>
                  <span className="text-xs text-[#78819a] block font-normal font-sans leading-normal">
                    Implemented cryptographic JWT certificate checks utilizing public/private signing keys. Upgraded rate filtering protocols to protect against automated duplicate account creation scripts.
                  </span>
                </div>

                <div className="border-l-2 border-[#1b1e28] pl-4 space-y-1 text-left">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">v1.1.9 (Archived Release - Deprecated)</span>
                  <span className="text-xs font-mono font-bold text-white block">Improved device fingerprint scopes</span>
                  <span className="text-xs text-[#78819a] block font-normal font-sans leading-normal">
                    Added browser device fingerprint consistency checks to improve liveness evaluation precision.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform status indicator (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3.5 text-xs text-left">
              <h4 className="font-mono text-[10px] font-black uppercase text-[#78819a] tracking-wider">Live System Status Monitor</h4>
              
              <div className="space-y-3 font-mono text-[9px]">
                <div className="flex justify-between border-b border-[#1b1e28] pb-1.5">
                  <span className="text-[#78819a]">API Gateway Response:</span>
                  <span className="text-emerald-404 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    99.98% / ONLINE
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1b1e28] pb-1.5">
                  <span className="text-[#78819a]">Webhooks gateway dispatch:</span>
                  <span className="text-emerald-404 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    99.94% / OPERATIONAL
                  </span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-[#78819a]">Sandbox simulation core:</span>
                  <span className="text-amber-400 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    100.00% / SANDBOX
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
