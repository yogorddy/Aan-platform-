export interface AcademyLesson {
  id: string;
  title: string;
  category: 'core' | 'auth-identity' | 'security-privacy' | 'developer-api' | 'infrastructure-deployment';
  version: string;
  status: 'MVP' | 'Planned' | 'Production Ready' | 'Mock';
  relatedComponents: string[];
  overview: string;
  whyExists: string;
  plainEnglish: {
    analogy: string; // e.g., "Airport Security", "Passport"
    analogyText: string;
    simplifiedText: string;
  };
  technicalExplanation: {
    inputs: string[];
    processing: string[];
    decisionLogic: string[];
    outputs: string[];
    dependencies: string[];
    security: string[];
    dataFlow: string[];
  };
  workflow: string[];
  databaseTables: {
    name: string;
    purpose: string;
    columns: string[];
    relationships: string;
  }[];
  apiEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    purpose: string;
    auth: string;
    payload?: string;
    response?: string;
  }[];
  dashboardIntegration: {
    location: string;
    actions: string[];
    permissions: string[];
    metrics: string[];
  };
  securityModel: {
    risks: string[];
    hiddenData: string[];
    authReq: string;
    authzReq: string;
    privacy: string[];
    limitations: string[];
  };
  enterpriseValue: {
    operational: string;
    security: string;
    administrative: string;
    developer: string;
    scalability: string;
  };
  mvpLimitations: string;
  futureImprovements: {
    title: string;
    phase: 'Future Phase' | 'Enterprise' | 'Optional' | 'Research';
    desc: string;
  }[];
  glossary: {
    term: string;
    definition: string;
  }[];
  knowledgeCheck: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
  relatedLessons: string[];
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: "intro",
    title: "Introduction to AAN",
    category: "core",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["LandingPage", "AdminDashboard"],
    overview: "Privacy-preserving proof-of-human infrastructure designed to eliminate bots and reduce duplicate accounts without identity tracing.",
    whyExists: "Traditional identity checks rely on intrusive, centralized databases storing government documents. AAN solves identity verification by proving uniquely bound humanness while defending user privacy.",
    plainEnglish: {
      analogy: "Passport Stamp",
      analogyText: "Like an anonymous passport stamp at border check-ins. The officer verifies you are a human but stamps a ticket that doesn't state your name, race, or documents.",
      simplifiedText: "AAN checks whether you are a real person and whether you have already signed up, but it never stores your social numbers or personal images permanently."
    },
    technicalExplanation: {
      inputs: ["Client hardware telemetry", "Secure browser properties", "Transient signature details (hashes only)"],
      processing: ["Telemetry and posture determination", "Signature vector derivation", "Zero-Knowledge Proof (ZKP) computation"],
      decisionLogic: ["Assess verification conditions", "Calculate heuristic score metrics", "Validate transaction thresholds"],
      outputs: ["Signed Cryptographic proof token", "Normalized risk rating", "Heuristic anomaly indicators"],
      dependencies: ["WASM signature modules", "Supabase Postgres state database"],
      security: ["SHA-256 state keying", "Ephemeral signature deletion rules"],
      dataFlow: ["Client -> SDK -> Secure Middle Agent api -> Post-verification database callback"]
    },
    workflow: [
      "User session initiated",
      "Telemetry feeds local non-custodial checks",
      "Server hashes signature templates for unique comparison",
      "Cryptographic Proof Token generated",
      "Enterprise client consumes validated humanness claim"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Tracks each lifecycle verification transaction.",
        columns: ["id", "partner_app_id", "status (passed/failed/review/started)", "risk_score", "proof_token"],
        relationships: "Belongs to partner_apps"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Create and prepare a new unique user verification transaction.",
        auth: "Enterprise API Key inside Header (Bearer SHA-hashed)",
        payload: '{\n  "external_user_id": "usr_99214",\n  "redirect_url": "https://partner.com/confirm"\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "verification_url": "https://aan.identity/verify/session/vss_9a123f4b"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Main Landing Page / Administration overview console",
      actions: ["Test demo onboarding flows", "Navigate project environments"],
      permissions: ["Access for anonymous and authenticated developers"],
      metrics: ["Total onboarding completions", "Success rates", "Average risk distribution"]
    },
    securityModel: {
      risks: ["Synthetic parameter injection", "Sybil account generation attempts", "Replay of expiring proof tokens"],
      hiddenData: ["Raw client parameter feeds", "Absolute hardware coordinates", "Direct IP listings"],
      authReq: "Hashed API keys verify external caller identity",
      authzReq: "Access to specific projects strictly checked",
      privacy: ["Zero raw data persistence", "Data localization using memory segments only"],
      limitations: ["Relying strictly on client browser environments", "Cannot prevent deep emulator simulation without custom native applications"]
    },
    enterpriseValue: {
      operational: "Drastically lowers customer onboarding spam fees.",
      security: "Defends platforms from massive multi-account sybil attacks.",
      administrative: "Eases privacy audit requirements since no PII is permanently held.",
      developer: "Clean REST endpoints allow visual SDK instantiation in seconds.",
      scalability: "Stateless verification servers scale concurrently via edge architecture."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Distributed Zero Knowledge Proofs", phase: "Research", desc: "Compile client-side proofs fully inside browser sandbox." },
      { title: "Certified Hardware Attestation", phase: "Enterprise", desc: "Rely on Android Keystore / iOS Secure Enclave for integrity proofs." }
    ],
    glossary: [
      { term: "Sybil Attack", definition: "A cyber attack where an attacker creates numerous pseudonymous identities to gain disproportionate influence." },
      { term: "ZKP", definition: "Zero-Knowledge Proof. A cryptographic method where one party can prove to another that a statement is true without revealing details." }
    ],
    knowledgeCheck: [
      {
        question: "What is AAN's main design focus?",
        options: ["Store and index official government IDs", "Form an anonymous, privacy-safe humanness verify network", "Verify cryptocurrency trade blocks", "Track customer locations continuously"],
        answerIndex: 1,
        explanation: "AAN aims to build privacy-preserving proof-of-humanity verification pipelines without tracing name databases or storing photographic images permanently."
      }
    ],
    relatedLessons: ["verification_sessions", "risk_engine", "proof_tokens"]
  },
  {
    id: "organizations",
    title: "Organizations",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "The top-level multi-tenant container housing project groups, API credentials, billing integrations, and developer teams.",
    whyExists: "Enables segregation of secure namespaces. A single corporate client might hold multiple business entities or staging systems separately.",
    plainEnglish: {
      analogy: "Shopping Mall Complex",
      analogyText: "Like the main parent company that owns a shopping mall complex, holding distinct stores with distinct operations inside it.",
      simplifiedText: "An Organization is your company's master account. It holds all your apps, developers, keys, and usage details in one place."
    },
    technicalExplanation: {
      inputs: ["Corporate identity name", "Owner admin email", "Billing profile attributes"],
      processing: ["UUID structural generation", "Tenant schema spacing creation", "Default role allocation"],
      decisionLogic: ["Ensure company names are non-empty", "Set maximum organization limits based on tier settings"],
      outputs: ["Structured organization UUID identifier", "Success verification indicators"],
      dependencies: ["Next/Express backend endpoints", "Supabase authentication services"],
      security: ["Tenant-to-tenant absolute sandboxing", "Strict parent-child relational cascading rules"],
      dataFlow: ["API commands trigger tenant creation -> databases verify workspace -> console loads newly active workspace id"]
    },
    workflow: [
      "Partner registers custom organization profile",
      "Organization container is saved in Postgres schema",
      "System sets first active user as 'owner' or 'admin'",
      "Default workspace environment keys initialized",
      "Organization telemetry dashboard begins tracking sync"
    ],
    databaseTables: [
      {
        name: "organizations",
        purpose: "Primary multi-tenant workspace registry.",
        columns: ["id (Primary UUID)", "name", "slug", "created_at"],
        relationships: "Has many projects, has many users via project associations"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal diagnostics check for workspace organization alignment.",
        auth: "Admin Authentication Cookie Session",
        response: '{\n  "organizations": [\n    {\n      "id": "org_enterprise_999",\n      "name": "Omnisecure Identity Group"\n    }\n  ]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Active drop-down at top of Partner Console dashboard screen",
      actions: ["Switch workspaces", "Edit profile metadata", "Invite executive team members"],
      permissions: ["Write accessibility restricted exclusively to workspace Organization Owners"],
      metrics: ["Total verified monthly active unique users", "Combined API response times"]
    },
    securityModel: {
      risks: ["Cross-tenant data leakage", "Unauthorized profile mutations by guest developers"],
      hiddenData: ["Internal financial credit profiles", "Sensitive database integration keys"],
      authReq: "Supabase JWT authentication token",
      authzReq: "Role-Based Access Controls (RBAC) stored inside database links",
      privacy: ["All database indexes enforce compartmental tenant partition keys"],
      limitations: ["No real-time global credit checks on external financial accounts are fully automated in the local sandbox."]
    },
    enterpriseValue: {
      operational: "Unifies developer billing records under single corporate accounts.",
      security: "Isolates separate production, staging, and sandboxed systems completely.",
      administrative: "Grants HR administrators centralized permission override controls.",
      developer: "Provides standard top-down project scoping configurations.",
      scalability: "Simplifies management under unified API access control planes."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Tenant creation limits are currently sandboxed. Replace billing and HR directory synchronizations with live systems before launch.",
    futureImprovements: [
      { title: "SAML SSO Integration Integration", phase: "Enterprise", desc: "Sync organization access controls with Okta/Azure Active Directory." },
      { title: "Hierarchical Divisions", phase: "Optional", desc: "Allow parent/child nested sub-organization grouping." }
    ],
    glossary: [
      { term: "Multi-tenancy", definition: "A software architecture where a single software instance serves multiple distinct user groups (tenants)." },
      { term: "Tenant Segregation", definition: "Design structures that keep one tenant's records strictly isolated from other tenants' views." }
    ],
    knowledgeCheck: [
      {
        question: "Who can edit Organization profile details?",
        options: ["Any developer guest invitation", "Only designated Organization Owners/Admins", "Anonymous website visitors", "External API requests using temporary tokens"],
        answerIndex: 1,
        explanation: "Organization profile editing requires high-privilege Role-Based access limits (typically Owner or Administrative accounts)."
      }
    ],
    relatedLessons: ["projects", "roles_permissions", "users"]
  },
  {
    id: "projects",
    title: "Projects",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "Isolated applications or environment spaces within an organization that hold distinct API keys, unique verification configurations, and target user sets.",
    whyExists: "Separates sandbox testing, stage environment validation, and main production application traffic from each other cleanly.",
    plainEnglish: {
      analogy: "Store branches",
      analogyText: "Like having a brand name store in Chicago and another in Seattle. They are under the same company but run separated registers.",
      simplifiedText: "Projects are separate app profiles. You can have a 'Test Sandbox' project and a 'Real App' production project to play around safely."
    },
    technicalExplanation: {
      inputs: ["Organization context key", "Project title string", "Target environment type (production/sandbox)"],
      processing: ["UUID instantiation", "Default policy array creation", "Staging namespace alignment"],
      decisionLogic: ["Check organization existence", "Assign standard sandbox thresholds to new projects automatically"],
      outputs: ["Project configuration profile", "Standard default API key pairs"],
      dependencies: ["Organizations table relations", "Encryption utility tools"],
      security: ["Access validation checks before any project configuration write operations"],
      dataFlow: ["Partner console specifies project setup -> Server validates authorization -> Postgres creates linked project entry"]
    },
    workflow: [
      "Select an active Organization profile",
      "Click 'Create New Project'",
      "Choose project role (e.g. Production or Sandbox testing)",
      "Database links the new profile with tenant organization",
      "Keys and default risk thresholds are computed instantly"
    ],
    databaseTables: [
      {
        name: "projects",
        purpose: "Environment isolates where apps generate API keys.",
        columns: ["id", "organization_id", "name", "environment (sandbox/production)"],
        relationships: "Belongs to organizations, has many partner_apps"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Gather diagnostic statistics about project structures.",
        auth: "Cookie Admin Session",
        response: '{\n  "projects": [\n    {\n      "id": "proj_security_777",\n      "name": "Core Production Onboarding"\n    }\n  ]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Project selection drop-down on the main dashboard sidebar",
      actions: ["Toggle between testing and production spaces", "Delete inactive sandbox experiments"],
      permissions: ["Read by all invited developers; write restricted to Admin level and above"],
      metrics: ["Daily verification requests per active project", "Average risk score per environment"]
    },
    securityModel: {
      risks: ["Accidental test traffic routing into active production databases", "Leaked development keys mutating live parameters"],
      hiddenData: ["Complete cryptographic key strings", "Private partner user association logs"],
      authReq: "Dashboard login session token",
      authzReq: "Tenant validation matched with parent organization",
      privacy: ["Strict data compartmentalization ensures user metadata never leaks to distinct projects"],
      limitations: ["No automated cross-cloud backup syncing is established out of the box."]
    },
    enterpriseValue: {
      operational: "Accelerates release engineering pipelines by dividing testing from production completely.",
      security: "Stops developer testing scripts on sandbox keys from interacting with live production user templates.",
      administrative: "Ensures clear responsibility mapping for internal project owners.",
      developer: "Allows immediate sandbox creation without paying hosting costs.",
      scalability: "Balances API traffic distribution limits per separate project boundary."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Dynamic production tier allocation constraints are currently checked locally without automated billing integration.",
    futureImprovements: [
      { title: "Branch Merging Patterns", phase: "Optional", desc: "Allow copying configuration policies from Sandbox to Production projects dynamically with one click." }
    ],
    glossary: [
      { term: "Sandbox Mode", definition: "A fully functional testing environment isolated from production data, utilized to run experiments safely." }
    ],
    knowledgeCheck: [
      {
        question: "Can a Sandbox API Key access user records inside a Production project?",
        options: ["Yes, if both projects belong to the same organization", "No, projects are completely sandboxed internally and cannot share access keys", "Yes, if the developer has admin rank globally", "Only on select weekends"],
        answerIndex: 1,
        explanation: "Projects enforce hard structural barriers; API keys belong to one project only and cannot bridge namespace gaps."
      }
    ],
    relatedLessons: ["organizations", "api_keys", "verification_sessions"]
  },
  {
    id: "users",
    title: "Users",
    category: "auth-identity",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "The digital projection of validated real-world human accounts inside AAN, mapped anonymously to partner accounts without exposure of direct identities.",
    whyExists: "Provides a single source of truth for cross-network human identification while preventing identity surveillance.",
    plainEnglish: {
      analogy: "Gym Locker Keycard",
      analogyText: "Like receiving a gym locker keycard with an arbitrary number. They know a locker is taken, but the keycard doesn't list your name or address on it.",
      simplifiedText: "Users inside AAN are recorded entirely as anonymous unique ID numbers. The system knows they are a real unique human without knowing who they actually are."
    },
    technicalExplanation: {
      inputs: ["Salted device anchors", "Standard ephemeral signature hashes", "Partner application mapping identifiers"],
      processing: ["Salted signature comparisons", "Trust anchor evaluations", "Device binding correlations"],
      decisionLogic: ["Check for duplicate signature vector matches across the network", "Decide account status (active, review, or suspended)"],
      outputs: ["Anonymized system user keys", "Verification validity statuses"],
      dependencies: ["Verification sessions log histories", "Signature template datastores"],
      security: ["Strict hashing of external customer keys", "Automated account lock triggers upon rapid key shifting"],
      dataFlow: ["Client records system parameters -> System matches signature template hashes -> Returns status claim link to app users"]
    },
    workflow: [
      "User completes humanness flow securely",
      "System derives signature template vector hash",
      "Network verifies uniqueness status",
      "Anonymized AAN User entry created/updated",
      "Secure relationship link maps user with Partner ID"
    ],
    databaseTables: [
      {
        name: "users",
        purpose: "Saves high-level anonymized verification profile records.",
        columns: ["id", "identity_status (verified/suspended/pending)", "device_trust_score", "created_at"],
        relationships: "Has many partner_user_links, has many devices, has one signature_template"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/v1/verification-sessions/:id",
        purpose: "Fetch the completed humanness status metrics of an onboarding user.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed",\n  "decision_reason": "INTEGRITY_CONFIRMED_AND_TEMPLATES_UNIQUE",\n  "proof_token": "ptk_aa338271e1b2f90a"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard under 'Users' tab context",
      actions: ["Search user index securely", "Manually trigger compliance status suspensions"],
      permissions: ["Read and manual override access limited tightly to System Admins"],
      metrics: ["Total unique active users on platform", "Suspended threat volume percentage"]
    },
    securityModel: {
      risks: ["Sybil accounts using automated emulator scripts", "Cross-app tracing linking user profiles illegally"],
      hiddenData: ["All physical details, names, registration document scans, biological markers"],
      authReq: "Enterprise admin credentials",
      authzReq: "Must have global admin scope verification",
      privacy: ["Database utilizes custom salted values for each separate application instance", "User data is localized by default"],
      limitations: ["Relying on hardware authenticity to determine if coordinates are genuine."]
    },
    enterpriseValue: {
      operational: "Drastically simplifies compliance with dynamic privacy frameworks (GDPR, CCPA).",
      security: "Identifies recurring human fraud patterns across multiple application targets.",
      administrative: "Allows visual status adjustments without touching direct production databases.",
      developer: "Abstracts security logic away from local application databases.",
      scalability: "Maintains rapid read performances using lean, anonymized ledger tables."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Verifiable Decentralized Credentials", phase: "Research", desc: "Enable full compliance with decentralized W3C DID standard specifications." }
    ],
    glossary: [
      { term: "PII", definition: "Personally Identifiable Information. Any data that can be used directly or indirectly to identify and locate a specific individual." }
    ],
    knowledgeCheck: [
      {
        question: "Does AAN store physical user photos inside its default databases?",
        options: ["Yes, for historical court audit purposes", "No, physical details are processed ephemerally and completely discarded immediately", "Yes, encrypted with standard public passwords", "Only on select holiday campaigns"],
        answerIndex: 1,
        explanation: "AAN discards physical parameters instantly. It strictly creates and stores and matches mathematical signature vectors to protect privacy."
      }
    ],
    relatedLessons: ["organization_members", "roles_permissions", "signature_templates"]
  },
  {
    id: "organization_members",
    title: "Organization Members",
    category: "auth-identity",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "Authorized team members who have access to manage organization parameters, review telemetry outputs, create projects, and edit API keys.",
    whyExists: "Facilitates collaborative company operations. Allows multi-developer setups without credential sharing.",
    plainEnglish: {
      analogy: "Security Badges",
      analogyText: "Like issuing separate building entry badges for your programmers, managers, and accountants instead of passing a single key.",
      simplifiedText: "You can invite your developers and team members to your organization's panel as Members, assigning appropriate permissions for team cohesion."
    },
    technicalExplanation: {
      inputs: ["User email address", "Target role selection", "Invitation token identifiers"],
      processing: ["Token string computations", "Email template assembly", "Role matrix associations"],
      decisionLogic: ["Ensure the invitee doesn't already belong to the organization", "Allow only authenticated admins or owners to launch invites"],
      outputs: ["Cryptographically secure invitation link", "Member entry status flags"],
      dependencies: ["Next Auth integrations", "Postgres organization linking systems"],
      security: ["Expiring invitation links (typically 24-48 hours)", "One-time use validation token strings"],
      dataFlow: ["Admin submits team user email -> Server generates token invite -> Invitee logs in via Supabase -> Invited status changes to active"]
    },
    workflow: [
      "Admin clicks 'Invite Member' on Team portal",
      "Email invite is sent containing secure tokenized link",
      "Invited member logs in and accepts onboarding steps",
      "Member record transitions from 'pending' to 'active'",
      "Role-based console policies apply to member session instantly"
    ],
    databaseTables: [
      {
        name: "organization_members",
        purpose: "Links admin platform users to specific tenant spaces with structural roles.",
        columns: ["id", "organisation_id", "user_identity_id", "role (owner/admin/developer/viewer)"],
        relationships: "Associates organizations table with central system users index"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Fetch team structure metadata checks for project audits.",
        auth: "Workspace Cookie Session",
        response: '{\n  "organization_members": [\n    {\n      "id": "mem_01h9x",\n      "organization_id": "org_enterprise_999",\n      "email": "yogorddy@gmail.com",\n      "role": "owner"\n    }\n  ]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Partner dashboard console workspace setting panel",
      actions: ["Invite team members", "Revoke active developer keys", "Adjust team member permissions"],
      permissions: ["Write actions strictly limited to Project Owners and appointed Workspace Administrators"],
      metrics: ["Total active administrators in organization", "Pending invited seats count"]
    },
    securityModel: {
      risks: ["Phishing of team member admin credentials", "Malicious or disgruntled insider developers rotating core production keys"],
      hiddenData: ["Owner password hash strings", "Detailed active security incident notes"],
      authReq: "MFA-protected console session token",
      authzReq: "Workspace administrative role checks",
      privacy: ["Limits personal employee workspace behavior logs securely"],
      limitations: ["No integration with active directory networks exists in default sandbox code."]
    },
    enterpriseValue: {
      operational: "Permits complex workflow operations without code duplication or manual database intervention.",
      security: "Instantly lock down accounts of departed employees by revoking individual member records.",
      administrative: "Maintains comprehensive audit records of precisely which engineer executed adjustments.",
      developer: "Allows immediate sandbox developer collaboration.",
      scalability: "Scales business identity operations effortlessly across enterprise teams."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Single-sign-on (SSO) configurations are currently simulated in workspace states. Replace with real Enterprise IAM providers before production launch.",
    futureImprovements: [
      { title: "Dynamic SCIM Directory Integration", phase: "Enterprise", desc: "Automate user addition and subtraction via dynamic corporate directories." }
    ],
    glossary: [
      { term: "IAM", definition: "Identity and Access Management. Framework of policies and technologies for ensuring that the proper people have the appropriate access to technology resources." }
    ],
    knowledgeCheck: [
      {
        question: "Can an Organization Member with 'Developer' status delete billing profiles?",
        options: ["Yes, all team members carry equal power", "No, billing and delete permissions are isolated to Organization Owners/Administrators", "Only on Wednesday mornings", "Yes, if they hold the API secret key"],
        answerIndex: 1,
        explanation: "Developers carry permissions for key configuration and webhook reviews, but destructive billing or account close operations are reserved for Owners."
      }
    ],
    relatedLessons: ["organizations", "roles_permissions", "users"]
  },
  {
    id: "roles_permissions",
    title: "Roles & Permissions",
    category: "auth-identity",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard", "AdminDashboard"],
    overview: "Granular access control framework separating read, write, and override powers based on corporate tenant titles (Owner, Admin, Developer, Viewer).",
    whyExists: "Restricts low-privileged developers from editing billing pipelines, while preventing financial managers from rotating critical encryption keys.",
    plainEnglish: {
      analogy: "Hotel Keycard access levels",
      analogyText: "Like the cleaning staff getting access to standard rooms, while executive keys access mechanical areas and vaults.",
      simplifiedText: "Roles and Permissions are rules that define who can click what. Viewers can only look at charts; Developers can make API keys; Admins can override accounts."
    },
    technicalExplanation: {
      inputs: ["Active member token", "Destination action type (e.g., api_key.rotate)", "Scope target profile"],
      processing: ["Token authorization extraction", "Scope table matrix checks", "Policy evaluation routines"],
      decisionLogic: ["Match action identity against mapped role privileges inside database policy matrices", "Deny by default (Zero Trust model)"],
      outputs: ["Access Allowed/Denied indicators", "Detailed access error reasons"],
      dependencies: ["Next API middleware systems", "Supabase authentication states"],
      security: ["Strict server-side validation. Never trust client UI toggles for security enforcing."],
      dataFlow: ["Client requests an API action -> Server queries active role -> Schema evaluates policy mapping -> System permits or blocks call"]
    },
    workflow: [
      "User attempts to run administrative task",
      "System extracts session identity parameters",
      "Server queries tenant member mapping arrays",
      "Policies match request action identifier",
      "Request either proceeds or fails with 403 Forbidden"
    ],
    databaseTables: [
      {
        name: "role_policies",
        purpose: "Definitions of exactly what actions each console status is permitted to execute.",
        columns: ["id", "role_type", "action_id", "permitted_boolean"],
        relationships: "Applies filters dynamically to active workspace session structures"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal schema checks validating operational permission alignments.",
        auth: "Bearer JWT Cookie Token",
        response: '{\n  "role": "owner",\n  "scopes": ["read:metrics", "write:api_keys", "write:webhooks", "delete:project"]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Team and Settings screens inside Partner portal view",
      actions: ["Review member access scopes", "Update collaborator level settings"],
      permissions: ["Write accessibility reserved to Team Owners alone"],
      metrics: ["Count of administrator seats used", "Collaborator role distribution charts"]
    },
    securityModel: {
      risks: ["Elevation of privilege vulnerabilities", "Session token theft bypassing front-end UI limits"],
      hiddenData: ["All system credentials and policy configurations are evaluated on server to prevent front-end tampering"],
      authReq: "Valid authenticated corporate sign-on session",
      authzReq: "Server matches active role scope with API limits",
      privacy: ["Strict segregation prevents employees of company A from reviewing records of company B"],
      limitations: ["No automated cross-region directory synchronizations in local MVP testing code."]
    },
    enterpriseValue: {
      operational: "Fosters safe workspace collaboration by dividing concerns cleanly.",
      security: "Enforces principle of least privilege, minimizing security exposure surfaces.",
      administrative: "Ensures compliance with external corporate security policies (SOC2, ISO 27001).",
      developer: "Allows front-end elements to adapt visually based on user privileges.",
      scalability: "Standardizes team permission scaling across vast global operations."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Static mock array configurations are utilized for speed. Implement full Postgres database schema policies before production launch.",
    futureImprovements: [
      { title: "Custom Action Matrices", phase: "Enterprise", desc: "Allow enterprise teams to define bespoke roles with personalized API permission switches." }
    ],
    glossary: [
      { term: "RBAC", definition: "Role-Based Access Control. A method of restricting system access to authorized users based on their role in the organization." },
      { term: "Least Privilege", definition: "A security design principle where users are granted only the minimum necessary privileges to perform their jobs." }
    ],
    knowledgeCheck: [
      {
        question: "What is an AAN 'Viewer' permitted to execute?",
        options: ["Delete database entries", "Review analytics logs and charts but execute no writing operations", "Create and sign production API keys", "Invite new organizational owners"],
        answerIndex: 1,
        explanation: "Viewer profiles carry read-only access. They possess zero scope authority to add or delete parameters."
      }
    ],
    relatedLessons: ["organizations", "organization_members", "users"]
  },
  {
    id: "api_keys",
    title: "API Keys",
    category: "developer-api",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard", "AdminDashboard"],
    overview: "Cryptographic credentials generated by partners to authenticate back-end server integrations securely with AAN API pipelines.",
    whyExists: "Enables back-end automation. Third-party partner services consume verification scores programmatically without requiring human logins.",
    plainEnglish: {
      analogy: "ATM Card PIN code",
      analogyText: "Like the PIN code on your ATM card. It gives your app automated access to run verification sessions without asking your password every second.",
      simplifiedText: "API Keys are long secure password strings you generate for your application's code. They allow your servers to talk directly to AAN systems safely."
    },
    technicalExplanation: {
      inputs: ["Project identifier", "Target environment context", "Label string description"],
      processing: ["Secure cryptographically strong random token computation", "SHA-256 secure hash calculation", "Truncated key preview suffix separation"],
      decisionLogic: ["Generate keys starting with 'aan_live_' for production and 'aan_test_' for sandbox", "Store ONLY the hashed value in database to prevent plaintext leak risks"],
      outputs: ["Active plaintext API key (shown ONLY once)", "Hashed key storage object"],
      dependencies: ["Crypto utility modules", "Partner Apps database schema references"],
      security: ["Keys are strictly salted and hashed before database commits to defend against database theft leakage"],
      dataFlow: ["Partner requests key creation -> Server displays plaintext key once -> Server hashes key -> Postgres stores hashed fingerprint only"]
    },
    workflow: [
      "Select dynamic workspace project",
      "Click 'Generate API Key' with target scope description",
      "Key is computed in server running cryptographically safe utilities",
      "Plaintext key string shown to developer (strictly once)",
      "Server hashes key using SHA-256 for database storage"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Tracks individual integration profiles and stores hashed credentials.",
        columns: ["id", "project_id", "app_name", "api_key_hash", "created_at"],
        relationships: "Belongs to projects, holds many verification_sessions"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Initiate user verification session programmatically.",
        auth: "Bearer <plaintext_api_key_string> inside 'Authorization' header",
        payload: '{\n  "external_user_id": "cust_82a1"\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "verification_url": "https://aan.identity/verify/session/vss_9a123f4b"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Partner dashboard navigation side-menu under 'API Keys' tab workspace",
      actions: ["Generate live production api credentials", "Revoke compromised tokens", "Copy masked key previews"],
      permissions: ["Write actions limited strictly to Workspace owners and developers"],
      metrics: ["Total transactions served per API key", "Active keys count"]
    },
    securityModel: {
      risks: ["Hardcoding credentials in client-side javascript files", "Database read-access compromise leaking all system permissions"],
      hiddenData: ["Plaintext API credentials (never stored in database or shown after generation)"],
      authReq: "API requests require header bearer signatures",
      authzReq: "Checked project boundary validation before completing queries",
      privacy: ["Restricts API access keys to target project schemas alone"],
      limitations: ["No automatic key rotation features exist in the baseline sandbox."]
    },
    enterpriseValue: {
      operational: "Automates human verification pipelines across high volume networks scale.",
      security: "SHA-256 hashing protects secrets against physical database file thefts.",
      administrative: "Masked character indicators allow painless workspace audits of active credentials.",
      developer: "Allows immediate sandbox developer testing with straightforward headers.",
      scalability: "Leverages hashed dictionary lookups to verify credentials in sub-milliseconds."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database uses a simple hash storage. Replace with high-velocity caching systems (e.g., Redis layer) in production.",
    futureImprovements: [
      { title: "Dynamic IP Whitelisting Constraints", phase: "Enterprise", desc: "Block API requests unless originating from configured partner IP address ranges." },
      { title: "Automatic Rotations", phase: "Optional", desc: "Pre-configure automated API credential retirement schedules." }
    ],
    glossary: [
      { term: "SHA-256", definition: "A cryptographic hash function that outputs a unique, fixed-size 256-bit character string, essentially acting as an encrypted fingerprint." }
    ],
    knowledgeCheck: [
      {
        question: "How are API keys stored inside the AAN database?",
        options: ["Plaintext strings for easy recovery on requests", "Encrypted with standard reversible base-64 arrays", "Strictly hashed using one-way SHA-256 values; AAN cannot retrieve original plain key", "Sent to administrative logs directly"],
        answerIndex: 2,
        explanation: "API keys are one-way hashed before database saving, meaning even AAN databases are defenseless to recover or leak the plaintext keys."
      }
    ],
    relatedLessons: ["projects", "verification_sessions", "audit_logs"]
  },
  {
    id: "verification_sessions",
    title: "Verification Sessions",
    category: "core",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["VerifySessionFlow", "PartnerDashboard", "AdminDashboard"],
    overview: "The lifecycle database record representing a single unique human verification request initiated by a partner app and completed by a client user.",
    whyExists: "Tracks transaction sequences statefully from creation, through telemetry posture validations, onto risk evaluation, up to final token collection.",
    plainEnglish: {
      analogy: "Airport boarding pass ticket",
      analogyText: "Like your airport boarding pass ticket. It is generated at check-in (api session started), gets scanned at the gate (telemetry verification), and lets you on plane (validated).",
      simplifiedText: "A Verification Session is a secure check-in ticket. A partner website starts it, sending the user to AAN to verify they are a unique human, then returns them."
    },
    technicalExplanation: {
      inputs: ["Partner application ID link", "External user database reference ID", "Custom redirection URL parameter"],
      processing: ["Session identifier generation", "Posture telemetry validation streams", "Signature vector hash matching lookup"],
      decisionLogic: ["Evaluate posture scoring results", "Apply unique signature template comparison rules", "Set session status: passed, failed, or pending_review"],
      outputs: ["Cryptographically signed proof token", "Evaluated project risk score rating", "Status claim string"],
      dependencies: ["WASM signature modules", "Supabase Postgres state database"],
      security: ["Expiring session validity boundaries (typically 15-30 minute window limits)", "Dynamic nonce values protecting session replays"],
      dataFlow: ["Partner API starts session -> User completes telemetry flow securely -> Server evaluates -> Webhook alerts status -> User returns"]
    },
    workflow: [
      "Partner website calls POST api verification-sessions",
      "Server responds with unique ID and interactive URL link",
      "User navigates to URL and fulfills local device posture tests",
      "Risk engine re-evaluates risk metrics across the ledger",
      "Session status transitions, generating verifiable proof claim"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Stores individual verification actions, risks, and tokens.",
        columns: ["id", "partner_app_id", "external_user_id", "status", "risk_score", "result_reason", "proof_token", "created_at"],
        relationships: "Belongs to partner_apps, links with users index"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Initiate user verification session.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "external_user_id": "usr_99214"\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "verification_url": "https://aan.identity/verify/session/vss_9a123f4b"\n}'
      },
      {
        method: "GET",
        path: "/api/v1/verification-sessions/:id",
        purpose: "Retrieve current verified status and signatures.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed",\n  "risk_score": 12,\n  "proof_token": "ptk_aa338271e1b2f90a"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Active session monitoring ledger in both Partner and Admin consoles",
      actions: ["Review status", "Investigate high-risk markers", "Manually trigger override reviews"],
      permissions: ["Read by all authorized organization managers; write admin actions limited strictly to override staff"],
      metrics: ["Active sessions volume tracking", "Average session conversion success ratios", "Total bypassed review counts"]
    },
    securityModel: {
      risks: ["Session hijacking via stolen token URLs", "Re-submitting stale completed sessions using historical footage", "Intercepting redirection callback URL strings"],
      hiddenData: ["Stale signature parameter feeds, precise operating systems metadata logs"],
      authReq: "API calls backed by valid secure keys",
      authzReq: "Checked project identity validation of calling server",
      privacy: ["Session details are unlinked from external databases when expired"],
      limitations: ["Relying fully on local browser clock settings to define exact client timestamps."]
    },
    enterpriseValue: {
      operational: "Removes developer overhead by hosting scalable humanness verification screens natively.",
      security: "Defends applications against bots in real-time.",
      administrative: "Ensures clear session trails for compliance audits.",
      developer: "Abstracts posture telemetry collection into a single URL landing.",
      scalability: "Stateless verification sessions scale horizontally seamlessly."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Dynamic Custom Redirect Targets", phase: "Optional", desc: "Allow partners to specify customized redirection parameters directly within API payloads." }
    ],
    glossary: [
      { term: "Session Expire", definition: "A security design where a transaction becomes wholly invalid after a brief period of inactivity to prevent hijacking." }
    ],
    knowledgeCheck: [
      {
        question: "What happens when an initiated Verification Session expires before the user completes posture steps?",
        options: ["AAN database self-destructs", "Session transitions to 'failed' status and the user must re-initiate a session from partner site", "User is verified automatically as a guest", "Admin is forced to manually override the session"],
        answerIndex: 1,
        explanation: "Expired sessions are rendered fully invalid for security compliance. The partner must initiate a brand-new session."
      }
    ],
    relatedLessons: ["intro", "api_keys", "proof_tokens"]
  },
  {
    id: "login_policies",
    title: "Login Policies",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "Configurable rules defining minimum thresholds of device health and signature integrity required before a verification session receives approval.",
    whyExists: "Enables enterprise flexibility. Dynamic businesses can require maximum compliance in sandbox staging while loosening parameters during test events.",
    plainEnglish: {
      analogy: "Nightclub dress code manual",
      analogyText: "Like a nightclub having rules determining who gets in. For example, 'no flip-flops' or 'requires invitation cards'.",
      simplifiedText: "Login Policies are rules you configure on AAN. You can choose to automatically block users with high risk, or allow them in for a manual check."
    },
    technicalExplanation: {
      inputs: ["Target threshold setting arrays", "Project rule metadata attributes"],
      processing: ["XML/JSON schema validations", "Database overrides syncing", "Cache clear cycles"],
      decisionLogic: ["Ensure risk score parameters are in limits (Min: 0, Max: 100)", "Reject policies with negative value ranges"],
      outputs: ["Saves configuration policies", "Dynamic operational metadata arrays"],
      dependencies: ["Projects tables mapping", "Admin config endpoints"],
      security: ["Requires high level workspace privileges before adjusting active verification parameters"],
      dataFlow: ["Admin edits policies -> Server evaluates validity constraints -> Config is written to Postgres -> Enforcer consumes config live"]
    },
    workflow: [
      "Admin accesses project policy settings panel",
      "Adjusts sliders (e.g., minimum trust confidence score target)",
      "Syncs configurations to server database structures",
      "Dynamic engine reads newly saved limits instantly",
      "Subsequent sessions checked against updated rule criteria"
    ],
    databaseTables: [
      {
        name: "policy_rules",
        purpose: "Stores configurable security threshold boundaries per project integration.",
        columns: ["id", "project_id", "min_trust_score", "block_duplicate_devices", "max_risk_tolerance"],
        relationships: "Belongs to projects, informs verification_sessions scoring"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal verification checks of active platform limits.",
        auth: "Workspace Cookie Session Token",
        response: '{\n  "policies": [\n    {\n      "id": "pol_core",\n      "project_id": "proj_security_777",\n      "min_trust_score": 85,\n      "allow_emulators": false\n    }\n  ]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard 'Policies' tab workspace environment",
      actions: ["Modify risk tolerances", "Toggle emulator check flags", "Adjust webhook timeout thresholds"],
      permissions: ["Write accessibility restricted exclusively to workspace Organization Owners and Global Admins"],
      metrics: ["Target trust thresholds", "Expected false-positive statistical indicators"]
    },
    securityModel: {
      risks: ["Malicious changes allowing bots to bypass security checks", "Improper settings locking out authentic high-value users"],
      hiddenData: ["Internal testing metrics and secure validation keys"],
      authReq: "Dashboard login session token",
      authzReq: "Workspace administrative role checks",
      privacy: ["Limits metadata logging output to system parameters only"],
      limitations: ["No real-time global simulation of user bounce ratios is automated."]
    },
    enterpriseValue: {
      operational: "Empowers product safety managers to tune security without deploying code changes.",
      security: "Defends platforms from massive multi-account sybil attacks dynamically.",
      administrative: "Ensures clear accountability records of exactly which policy was updated when.",
      developer: "Allows immediate sandbox developer configuration adjustments.",
      scalability: "Enforces consistent policy checks across global API nodes."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Policy definitions are currently simulated in workspace states. Replace with real-time Postgres rule checks before production launch.",
    futureImprovements: [
      { title: "Dynamic Machine Learning Policy Tuning", phase: "Research", desc: "Automate policy thresholds adjustments based on geographic anomaly waves safely." }
    ],
    glossary: [
      { term: "Trust Score", definition: "A metric estimating the likelihood that an access attempt is genuine, unique, and legitimate rather than automated or malicious." }
    ],
    knowledgeCheck: [
      {
        question: "When are updated policy checks applied to user verifications?",
        options: ["Instantly for consecutive sessions following the save operation", "Requires restarting the entire web server", "After 24-48 business hours of processing", "Only for guest accounts"],
        answerIndex: 0,
        explanation: "Policy rules are read dynamically from database tables. Any updates immediately govern consecutive verification sessions."
      }
    ],
    relatedLessons: ["projects", "roles_permissions", "users"]
  },
  {
    id: "proof_tokens",
    title: "Proof Tokens",
    category: "core",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["VerifySessionFlow", "PartnerDashboard"],
    overview: "The high-integrity JSON Web Token (JWT) issued by AAN to represent cryptographic proof that a unique human successfully completed verification.",
    whyExists: "Ensures secure, tamper-proof verification delivery. Partners receive a verifiable token signed by AAN to finalize decisions on their servers.",
    plainEnglish: {
      analogy: "Signed Concert Ticket",
      analogyText: "Like holding an official signed concert ticket. The staff doesn't see your credit card or identification, they just scan the valid signature to let you in.",
      simplifiedText: "Proof Tokens are secure digital certificates signed by AAN. Your app scans them to instantly verify that the user passed the humanness check."
    },
    technicalExplanation: {
      inputs: ["Verified session identifier", "Calculated risk score", "Unique template hash references"],
      processing: ["JSON payload assembly", "Asymmetric cryptographic signing computation", "Bas64Url string serialization"],
      decisionLogic: ["Include expiration timestamps", "Include nonces to prevent token reuse", "Embed cryptographic signature validating payload integrity"],
      outputs: ["Cryptographic Proof Token string"],
      dependencies: ["JSONWebToken libraries", "Asymmetric private key configs"],
      security: ["Signed with private keys; validatable only with AAN public keys", "Strict short-lived expiration rules"],
      dataFlow: ["Server validates session -> Assembles payload -> Signs with private key -> Returns JWT string to client"]
    },
    workflow: [
      "User successfully fulfills trust verification tests",
      "Server constructs secure payload stating unique human properties",
      "Private HSM keys compute cryptographic signature",
      "Signed Proof Token returned to verification session record",
      "Partner backend fetches and verifies token signature before access"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Saves proof tokens in relation to their originating session transactions.",
        columns: ["id", "proof_token", "completed_at"],
        relationships: "Matches partner_apps records"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/proofs/verify",
        purpose: "Validate/verify a proof token generated by AAN systems.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "proof_token": "ptk_aa338271e1b2f90a"\n}',
        response: '{\n  "valid": true,\n  "session_id": "vss_9a123f4b",\n  "completed_at": "2026-06-22T04:51:23Z",\n  "risk_score": 12,\n  "claims": {\n    "uniqueness_status": "unique",\n    "integrity_confirmed": true\n  }\n}'
      }
    ],
    dashboardIntegration: {
      location: "Sessions ledger in Partner dashboard, showing token hash previews",
      actions: ["Copy token preview", "Initiate programmatic endpoint checks of active tokens"],
      permissions: ["Read by all invited developers", "Token validations require active API keys"],
      metrics: ["Total issued tokens", "Invalid/expired token verification attempts"]
    },
    securityModel: {
      risks: ["Token hijacking on unsafe client configurations", "Replaying stale tokens to create duplicate accounts", "Cryptographic signature forgery"],
      hiddenData: ["Never exposes biological metadata inside token payload"],
      authReq: "Bearer tokens for endpoint checks",
      authzReq: "Checked project identity validation of calling server",
      privacy: ["Token strictly contains metadata; no PII embedded"],
      limitations: ["Relying on security of partner servers to maintain signature validation code."]
    },
    enterpriseValue: {
      operational: "Simplifies decentralized verification by delivering lightweight JSON records.",
      security: "Prevents signature forgery via high-entropy asymmetric cryptography.",
      administrative: "Ensures compliance with external corporate security policies easily.",
      developer: "Standard JWT format simplifies parsing with standard open-source libraries.",
      scalability: "Verifiable offline by partner servers, minimizing network roundtrips."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Tokens are currently signed with symmetrical sandbox keys. Replace with secure HSM-backed asymmetric private keys (e.g., RSA or ECDSA) in production.",
    futureImprovements: [
      { title: "Asymmetric Elliptic Curve Proof Tokens", phase: "Research", desc: "Enable ultra-efficient cryptographic tokens using modern Ed25519 signature standards." }
    ],
    glossary: [
      { term: "JWT", definition: "JSON Web Token. An open standard for securely transmitting information between parties as a JSON object." }
    ],
    knowledgeCheck: [
      {
        question: "Can a decrypted Proof Token payload be tampered with by a client?",
        options: ["Yes, and the server will accept it anyway", "No, any tampering invalidates the cryptographic signature, causing validation to fail", "Yes, if they use premium editing software", "Only on mobile browsers"],
        answerIndex: 1,
        explanation: "Proof Tokens use cryptographic signatures. Any mutation of the body text invalidates the cryptographic seal, causing validation to fail."
      }
    ],
    relatedLessons: ["verification_sessions", "api_keys", "risk_engine"]
  },
  {
    id: "risk_engine",
    title: "Risk Engine",
    category: "security-privacy",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard", "PartnerDashboard"],
    overview: "The central intelligence system that aggregates device metrics, telemetry signals, and historic template records to calculate user risk ratings.",
    whyExists: "Automates threat assessments. Instantly flags suspicious emulator indicators, multi-account device bindings, and duplicate signature submissions.",
    plainEnglish: {
      analogy: "Airport Security Red-Flag System",
      analogyText: "Like airport security checking luggage weight, passport stamps, and behavior cues simultaneously. If too many indicators are flagged, you undergo detailed review.",
      simplifiedText: "The Risk Engine is a smart scoring program. It evaluates indicators like telemetry feedback, device setups, and sign-up speed, rating overall safety from 0 to 100."
    },
    technicalExplanation: {
      inputs: ["Signature template hashes", "Device fingerprint signatures", "Historical attempt velocities", "Telemetry consistency outputs"],
      processing: ["Risk heuristic weight calculation", "Duplicate signature checking database scans", "Emulator marker analysis"],
      decisionLogic: [
        "If posture checks fail: Score = 100 (Immediate Deny)",
        "If duplicate signature template holds: Score += 45",
        "If multi-device binding count > 3: Score += 25",
        "If rapid repeated attempt velocity matches: Score += 15"
      ],
      outputs: ["Combined numeric Risk Score (0-100)", "Structured risk reasons list"],
      dependencies: ["Device indexing tables", "Signature comparison modules"],
      security: ["Score calculations carried out inside sandboxed server memory to prevent client overrides", "Hashed risk keys"],
      dataFlow: ["Client telemetry -> Server computes heuristic weights -> Generates unified score record -> Saves transaction details"]
    },
    workflow: [
      "Verification session receives client telemetry inputs",
      "Risk calculations run through multi-layered weight checks",
      "Signature unique databases scanned for duplicate candidate vectors",
      "Scores computed and threat reasons mapped inside server structures",
      "Unified score saves to Verification Session, directing state outcomes"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Saves risk scores and threat logs in relation to transaction profiles.",
        columns: ["id", "risk_score", "risk_reasons"],
        relationships: "Links with partner_apps index"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions/:id/signature",
        purpose: "Process device signature vectors and analyze security scores.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "signature_hash": "sig_aa82912a",\n  "integrity_confidence": 98,\n  "device_fingerprint": "dev_win_chrome_104"\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed",\n  "risk_score": 12,\n  "risk_reasons": []\n}'
      }
    ],
    dashboardIntegration: {
      location: "Main graph consoles and 'Overrides' logs inside Admin & Partner dashboards",
      actions: ["View anomalies", "Analyze threat distributions", "Manually override high-risk flags"],
      permissions: ["Analysis view permissions granted to all team seats; write overrides restricted to Admins"],
      metrics: ["Average network risk index", "Monthly blocked bot attack timelines", "False positive triggers ratios"]
    },
    securityModel: {
      risks: ["Malicious agents studying scoring systems to map bypass plans", "Overly strict policies locking out authentic users"],
      hiddenData: ["Exact machine-learning weights, physical raw device coordinates"],
      authReq: "API requests authorized using verified corporate keys",
      authzReq: "Checked project boundary validation",
      privacy: ["Restricts risk telemetry logs to ephemeral memory tables where applicable"],
      limitations: ["No automated cross-cloud attack syncing is established in baseline sandbox code."]
    },
    enterpriseValue: {
      operational: "Fosters user trust by blocking fake accounts automatically and instantly.",
      security: "Minimizes sybil vulnerability risks across scaling apps.",
      administrative: "Eases compliance checkups by auto-producing structured risk trails.",
      developer: "A single score abstracts complex risk calculations beautifully.",
      scalability: "Scales dynamically supporting enterprise-grade volumes."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and biometric providers before any production use.",
    futureImprovements: [
      { title: "Dynamic Machine Learning Threat Detection", phase: "Research", desc: "Calculate risk parameters based on live global network wave patterns." }
    ],
    glossary: [
      { term: "Risk Score", definition: "A calculated rating from 0 (very safe) to 100 (highly suspicious) evaluating fraudulent indicators." },
      { term: "Heuristics", definition: "Practical, rule-based methods or calculations used to solve problems or estimate risks quickly." }
    ],
    knowledgeCheck: [
      {
        question: "What status is assigned to a session with failed integrity?",
        options: ["Passed", "Review", "Failed", "Pending"],
        answerIndex: 2,
        explanation: "Sessions with failed integrity validations are automatically set to 'Failed' (stating extremely high risk)."
      }
    ],
    relatedLessons: ["verification_sessions", "duplicate_detection", "device_trust"]
  },
  {
    id: "duplicate_detection",
    title: "Duplicate Detection",
    category: "security-privacy",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard", "VerifySessionFlow"],
    overview: "Multi-layered signature vector comparison system engineered to pinpoint whether an access attempt maps to already-registered accounts.",
    whyExists: "Prevents multi-accounting. Denies Sybil attacks where isolated users register unlimited identities to farm financial rewards.",
    plainEnglish: {
      analogy: "Gym Membership Security Key check",
      analogyText: "Like a gym scanning your membership key when you sign up. If they find your key is already linked to membership account X, they block you from creating account Y.",
      simplifiedText: "Duplicate Detection translates your signature vectors into numeric hashes. If a hash already exists in the database, the system blocks you from signing up again."
    },
    technicalExplanation: {
      inputs: ["Encrypted signature template hash", "Application boundary identifier"],
      processing: ["Signature hash mapping checks", "Distance parameter comparisons", "Duplicate event creation"],
      decisionLogic: ["Compare signature hashes across existing signature arrays", "Trigger duplicate alerts when similarity values exceed configured security standards"],
      outputs: ["Duplicate candidate flag", "Uniqueness validation indicators"],
      dependencies: ["Signature templates tables", "Risk heuristic calculations"],
      security: ["Signature mappings utilize high-security salted variables so hashes vary across separate projects to safeguard user anonymity"],
      dataFlow: ["Client creates signature template -> Server searches match indices -> Matches found? -> Flags are logged -> Score increases"]
    },
    workflow: [
      "User completes secure onboarding steps",
      "Telemetry modules compile mathematical vector hashes",
      "Server queries records to match similar signature representations",
      "If matching records are found, duplicate indices increase",
      "System logs duplicate flags, raising risk score outcomes"
    ],
    databaseTables: [
      {
        name: "signature_templates",
        purpose: "Saves anonymized mathematical signature vector indices securely.",
        columns: ["id", "user_id", "template_hash", "encrypted_vector", "created_at"],
        relationships: "Belongs to users index"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions/:id/signature",
        purpose: "Submit signature vector indicators for duplicate inspection reviews.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "signature_hash": "sig_aa82912a",\n  "integrity_confidence": 98\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed",\n  "duplicate_candidate": false\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard 'Signatures' tab environment settings",
      actions: ["View registered signature index listings", "Investigate active duplicate candidates statistics"],
      permissions: ["Write accessibility tightly restricted to Workspace Administrators alone"],
      metrics: ["Total saved signature identifiers", "Active blocked duplicate attempt counts"]
    },
    securityModel: {
      risks: ["Malicious reuse of stolen hashes to impersonate users", "Database lookup maps exposing user networks across applications"],
      hiddenData: ["Absolute system parameters", "Direct identifiers are never correlated here"],
      authReq: "API keys containing high privilege permissions",
      authzReq: "Must have valid database lookup scopes",
      privacy: ["One-way hashing secures signature template inputs, preventing reconstruction of original users"],
      limitations: ["Relying fully on network stability and browser client parameters."]
    },
    enterpriseValue: {
      operational: "Stops promotion codes, credits, or registration spam abuse completely.",
      security: "Defends applications from high-velocity Sybil identity rings.",
      administrative: "Ensures unique user validation tracking with high reliability.",
      developer: "Eliminates duplicate accounts logic from application backend, abstracting it completely.",
      scalability: "Index hashes support millions of comparisons with sub-second lookups."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Privacy-Preserving Homomorphic Matching", phase: "Research", desc: "Perform signature vector comparison while keeping the vectors fully encrypted on server databases." }
    ],
    glossary: [
      { term: "Signature Template", definition: "A mathematical representation of system traits extracted from browser readings, formatted to allow rapid computers comparison." }
    ],
    knowledgeCheck: [
      {
        question: "How does AAN prevent database compromises from leaking user faces?",
        options: ["Encrypted ZIP folder storage", "Discarding raw details instantly, holding only one-way cryptographic signature hashes", "Storing photos on administrative desktops", "Limiting logins using premium firewalls"],
        answerIndex: 1,
        explanation: "By discarding raw parameters immediately and holding only one-way cryptographic hashes, AAN renders database theft useless to reconstruct physical user identities."
      }
    ],
    relatedLessons: ["verification_sessions", "risk_engine", "signature_templates"]
  },
  {
    id: "device_trust",
    title: "Device Trust",
    category: "security-privacy",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "Hardware attestation and device fingerprinting subsystem crafted to analyze client emulator markers and flag high-risk hardware footprints.",
    whyExists: "Blocks automated scripts. Professional botters run emulators on massive cloud servers to mock authentic consumer phone setups.",
    plainEnglish: {
      analogy: "Bouncer checking ID holograms",
      analogyText: "Like a bouncer inspecting watermarks on an ID card. If the card uses printed paper instead of a physical hologram, it gets rejected as fake.",
      simplifiedText: "Device Trust inspects the user's phone or computer settings. It ensures they are using an authentic physical device rather than an emulator or a cloud script."
    },
    technicalExplanation: {
      inputs: ["Client Canvas/WebGL hashes", "Browser user agent properties", "Operating system metadata", "Hardware concurrency metrics"],
      processing: ["Device fingerprint generation lookup", "Device attempt metrics scans", "Emulator behavior assessments"],
      decisionLogic: ["Check for emulator markers (e.g. headless web browsers, impossible combinations)", "Compute device trust rating (0 - 100)"],
      outputs: ["Device Trust Score indicators", "Emulator flag attributes"],
      dependencies: ["Client telemetry JS scripts", "Postgres devices index"],
      security: ["Hash outputs include client-side nonces to protect against session replay attempts"],
      dataFlow: ["Client loads SDK -> Collects canvas/browser telemetry -> Generates fingerprint -> Matches table -> Score created"]
    },
    workflow: [
      "Verification SDK loads on client computer screen",
      "Gathers browser rendering properties (WebGL components, screen ratios)",
      "Computes custom device fingerprint hash",
      "Server checks duplicate fingerprint statistics in database structures",
      "Trust score is finalized based on emulator and multi-tenancy rules"
    ],
    databaseTables: [
      {
        name: "devices",
        purpose: "Saves calculated fingerprints to identify automated multi-accounting attempts.",
        columns: ["id", "user_id", "fingerprint", "ip_address", "trust_score", "is_emulator"],
        relationships: "Belongs to users index"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions/:id/signature",
        purpose: "Process device signature vectors and analyze security scores.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "device_fingerprint": "dev_mac_safari_9912",\n  "integrity_confidence": 98\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed",\n  "risk_score": 12,\n  "is_emulator": false\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard 'Devices' tab pane workspace",
      actions: ["Review client hardware fingerprints", "Edit emulator safety rules settings", "Inspect IP geolocations statistics"],
      permissions: ["Write accessibility restricted to workspace Administrators alone"],
      metrics: ["Total identified singular visitor devices", "Blocked automated cloud servers percentage"]
    },
    securityModel: {
      risks: ["Malicious developers crafting custom browser setups to slide by fingerprinting checks", "Falsely identifying genuine old devices as suspicious"],
      hiddenData: ["Absolute local hardware serial codes"],
      authReq: "Authenticated administrative access logs",
      authzReq: "Checked project boundary validation",
      privacy: ["One-way hashing of browser parameters prevents tracing physical identities across networks"],
      limitations: ["No automated hardware keystore verification is active in Sandbox MVP."]
    },
    enterpriseValue: {
      operational: "Filters automated scrapers and cloud farms from user flows instantly.",
      security: "Defends networks from rapid credential stuffing bot attacks.",
      administrative: "Ensures compliance checklists require original hardware inputs.",
      developer: "Allows standard JS SDK deployments to run advanced fingerprinting out-of-the-box.",
      scalability: "Stateless fingerprint computation minimizes latency impacts."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Secure Cryptographic Enclave Attestation", phase: "Enterprise", desc: "Integrate native mobile security checks verifying hardware validity via Apple App Attest / Google Integrity API." }
    ],
    glossary: [
      { term: "Device Fingerprint", definition: "A cryptographic signature derived from a client device's browser settings and rendering capabilities, uniquely mapping its environment." }
    ],
    knowledgeCheck: [
      {
        question: "Why does the Risk Engine flag headless web browsers?",
        options: ["They load images too slowly", "Headless browsers are usually automated scripts run by bots on servers, not real human users", "They are illegal to open in Europe", "Only to save network bandwidth"],
        answerIndex: 1,
        explanation: "Headless browsers carry zero physical screens. They are typically utilized by automation scripts to simulate human clicks on scalable server infrastructures."
      }
    ],
    relatedLessons: ["verification_sessions", "risk_engine", "audit_logs"]
  },
  {
    id: "verification_methods",
    title: "Verification Methods",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["VerifySessionFlow"],
    overview: "Multi-modal verification suite grouping client device trust, multi-source signature alignment, and client device attestation into one elegant user journey.",
    whyExists: "Ensures versatility. Applications can select which authentication steps are enforced based on the required trust level.",
    plainEnglish: {
      analogy: "Passport control checkpoint",
      analogyText: "Like a passport control desk having multiple scans. They check your electronic chip (device trust), scan your signature (identity), and watch your behavior (posture).",
      simplifiedText: "Verification Methods are the different tests a user has to pass. It includes submitting a quick device posture to prove they are a real, physical person."
    },
    technicalExplanation: {
      inputs: ["Signature models", "Device properties metadata", "Active posture challenge patterns"],
      processing: ["Posture determinations", "Hardware validity audits", "Signature compliance checks"],
      decisionLogic: ["Ensure posture measurements and signature alignments both pass target thresholds before approving sessions"],
      outputs: ["Verified user structures", "Detailed compliance logs"],
      dependencies: ["WASM telemetry pipelines", "Internal scoring services"],
      security: ["Signature vectors utilize high-security salted variables so hashes vary across separate projects"],
      dataFlow: ["Client runs step-by-step validations -> Telemetry streams to server -> Returns verified status indicator"]
    },
    workflow: [
      "User starts verification session",
      "Telemetry systems perform device health audits",
      "Telemetry module executes dynamic 3D posture tests",
      "Signature vector templates cross-matched on server databases",
      "If all tests approve, proof signatures generate instantly"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Main state log tracking all completed methods.",
        columns: ["id", "status", "risk_score"],
        relationships: "Associates partner apps"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions/:id/signature",
        purpose: "Validate device metrics and resolve user outcome status.",
        auth: "Bearer API Key header",
        payload: '{\n  "signature_hash": "sig_aa82912a",\n  "integrity_confidence": 98\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "passed"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Onboarding screen flows & Admin Console statistics displays",
      actions: ["Test sample user flows", "Inspect active signature template records"],
      permissions: ["Write capabilities reserved for Developers and Administrators"],
      metrics: ["Verification paths completion ratios", "Average posture score statistics"]
    },
    securityModel: {
      risks: ["Telemetry spoofing utilizing emulator frames", "Synthesized parameter injection"],
      hiddenData: ["Never exposes raw parameter feeds; all system metrics saved as mathematical templates"],
      authReq: "Hashed authorization keys",
      authzReq: "Checked project bounds during session execution",
      privacy: ["One-way signature encryption guards personal records safely"],
      limitations: ["Relying fully on client system parameters to capture valid non-biometric traits."]
    },
    enterpriseValue: {
      operational: "Delivers zero-friction user onboarding while blocking bots.",
      security: "Defends applications from high-velocity multi-accounting attacks.",
      administrative: "Ensures compliance workflows require live human interactions.",
      developer: "Abstracts hardware details, giving developers clean JS endpoints.",
      scalability: "Operates globally with sub-millisecond API response limits."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and security providers before any production use.",
    futureImprovements: [
      { title: "Dynamic Verification Step Routing", phase: "Enterprise", desc: "Require deep verification validation when transaction values exceed extreme limits automatically." }
    ],
    glossary: [
      { term: "Posture Check", definition: "A system integrity technique validating whether a posture captured on telemetry is an active physical user rather than a simulated bot." }
    ],
    knowledgeCheck: [
      {
        question: "Why are raw parameters deleted right after template generation?",
        options: ["To save server hosting space", "To prevent identity tracing and comply with strict user privacy laws", "Because physical logs render too slowly on servers", "Only on request of legal staff"],
        answerIndex: 1,
        explanation: "By discarding raw parameter material, AAN eliminates trace-surveillance hazards, complying with leading global user privacy structures."
      }
    ],
    relatedLessons: ["verification_sessions", "risk_engine", "signature_templates"]
  },
  {
    id: "sandbox_engine",
    title: "Sandbox Engine",
    category: "developer-api",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["App", "PartnerDashboard"],
    overview: "The interactive emulation framework allowing developers to simulate different security threat scenarios during evaluation without registering real devices or identities.",
    whyExists: "Speeds up development. Engineers can mock high-risk alerts, duplicates, and integrity breakdowns instantly to test their apps' exception handling.",
    plainEnglish: {
      analogy: "Flight Simulator",
      analogyText: "Like using a flight simulator to practice landing in a storm without having to physically risk a real airplane.",
      simplifiedText: "The Sandbox Engine lets you simulate different test cases, like a 'Duplicate Account' or 'Stolen Device,' so you see how your website responds."
    },
    technicalExplanation: {
      inputs: ["Selected scenario selection (e.g. 'FAILED_INTEGRITY')", "Active testing session UUID"],
      processing: ["Simulation state alterations", "Signature hashes overlaying", "Session status updates"],
      decisionLogic: ["Adjust risk ratings to predefined scenario weights", "Generate mock verification signatures matched to testing choices"],
      outputs: ["Simulated session outputs", "Simulated webhook transmissions"],
      dependencies: ["Internal databases state variables", "API route handlers"],
      security: ["Explicitly binds simulated keys with 'aan_test_' prefixes to prevent production access"],
      dataFlow: ["Developer selects threat scenario -> Server updates test session credentials -> Partner receives correct test signals"]
    },
    workflow: [
      "Developer navigates to Sandbox Session view",
      "Selects target scenario from drop-down selector (e.g., 'Device Emulator Flag')",
      "Engine injects mock device hashes into active transaction memory",
      "Partner checks status programmatically via GET api endpoint",
      "Sees expected high-risk score and specific rejection reasons"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Stores sandboxed test sessions securely in separation from production models.",
        columns: ["id", "status", "risk_score", "risk_reasons"],
        relationships: "Belongs to sandbox projects namespace"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Generate a sandboxed test session.",
        auth: "Bearer Hashed Sandbox API Key (aan_test_...)",
        payload: '{\n  "external_user_id": "test_dev_01",\n  "scenario_mode": "MOCK_DUPLICATE_SIGNATURE"\n}',
        response: '{\n  "session_id": "vss_9a123f4b",\n  "status": "review",\n  "risk_score": 85\n}'
      }
    ],
    dashboardIntegration: {
      location: "Interactive Sandbox header banner and Partner keys panel",
      actions: ["Trigger mock user registrations", "Emulate verification failures", "Test API routes"],
      permissions: ["Access granted to all developers holding valid sandbox accounts"],
      metrics: ["Simulated API completion rates", "Active mock indicators tracked"]
    },
    securityModel: {
      risks: ["Accidentally applying test scenarios to production projects", "Confusing mock validation states with live secure states"],
      hiddenData: ["Restricts active mock tools to development projects only"],
      authReq: "Valid sandbox API key verification Checks",
      authzReq: "Checked project boundary validation",
      privacy: ["Utilizes simulated data vectors; absolutely zero real user signature inputs are gathered here"],
      limitations: ["Does not emulate physical cellular reception fluctuations or extreme raw network packet loss."]
    },
    enterpriseValue: {
      operational: "Significantly decreases testing timelines from weeks to minutes.",
      security: "Allows robust end-to-end integration testing of rare security exception paths in client apps.",
      administrative: "Enables code demonstration sessions for stakeholders without using actual user data.",
      developer: "Friendly console controls let engineers focus on simple integration steps.",
      scalability: "Runs locally on light sandbox containers without cloud execution costs."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and biometric providers before any production use.",
    futureImprovements: [
      { title: "Dynamic Network Latency Emulation", phase: "Optional", desc: "Simulate poor connection speeds during development sessions to optimize video uploads." }
    ],
    glossary: [
      { term: "Telemetry Mocking", definition: "A method of passing predefined diagnostic indicators to APIs to test downstream behavior without holding real hardware." }
    ],
    knowledgeCheck: [
      {
        question: "Can a Sandbox API Key modify live production user records?",
        options: ["Yes, if they belong to the same Organization", "No, Sandbox keys strictly access development-level projects and cannot mutate production data", "Yes, if the developer has high credentials", "Only on select holidays"],
        answerIndex: 1,
        explanation: "To secure production operations, AAN enforces absolute programmatic boundaries between development sandbox credentials and active production projects."
      }
    ],
    relatedLessons: ["api_keys", "verification_sessions", "risk_engine"]
  },
  {
    id: "webhook_system",
    title: "Webhook System",
    category: "developer-api",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "The user-configurable event alert network engineered to transmit real-time JSON payloads to partner servers when verification sessions resolve.",
    whyExists: "Removes polling overhead. Partner back-ends can sleep and receive push events immediately when user verifications complete, enhancing server efficiency.",
    plainEnglish: {
      analogy: "Text message package delivery alert",
      analogyText: "Like the postal service sending a text to your phone when a package lands at your doorstep instead of you looking out the window all day.",
      simplifiedText: "Webhooks are automated messages AAN sends to your server. As soon as a user passes verification, AAN pings your app saying: 'Hey, user passed!'"
    },
    technicalExplanation: {
      inputs: ["Completed session event", "Target webhook endpoint URL", "Secret signature keys"],
      processing: ["Event payload construction", "Cryptographic HMAC signature assembly", "HTTP request dispatch execution"],
      decisionLogic: ["Only trigger webhooks when session status transitions to passed, failed, or review", "Implement automated retry algorithms upon 5xx network code responses"],
      outputs: ["Real-time HTTP POST logs", "HMAC verified header signatures"],
      dependencies: ["Axios / Fetch routing mechanisms", "Audit logging networks"],
      security: ["Payloads include HMAC signatures to allow partner verification of originating authenticity", "Timeout boundaries (typically 5 seconds max)"],
      dataFlow: ["Verification completes -> Webhook constructor maps event -> Server sends signed POST -> Partner validates signature"]
    },
    workflow: [
      "User completes active security verification checks",
      "System commits finalized session outcome to Postgres database",
      "Webhook trigger extracts partner's configured endpoint URL",
      "Constructs signed JSON payload containing proof status and risk records",
      "Dispatches HTTP POST request instantly, logging target response codes"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Saves partner's target webhook URL endpoints.",
        columns: ["id", "webhook_url", "webhook_secret_key"],
        relationships: "Belongs to workspace projects mapping"
      }
    ],
    apiEndpoints: [
      {
        method: "PUT",
        path: "/api/internal/test-snapshot",
        purpose: "Internal configuration updates for partner app parameters.",
        auth: "Workspace Cookie Session",
        payload: '{\n  "webhook_url": "https://api.partner.com/aan-callback"\n}',
        response: '{\n  "success": true,\n  "webhook_url": "https://api.partner.com/aan-callback"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Partner dashboard navigation side-menu under 'Webhooks' tab",
      actions: ["Update target callback URL parameters", "Run simulated system test payloads", "Inspect historical webhook response codes"],
      permissions: ["Write accessibility restricted to Project Owners and appointed Developers"],
      metrics: ["Success/failure ratios logs", "Average payload delivery latency statistics"]
    },
    securityModel: {
      risks: ["Malicious actors sending spoofed webhook packets to partner servers", "Man-in-the-middle sniffing of transaction records"],
      hiddenData: ["Never transmits raw signature templates; payload strictly limited to session scores and verification tokens"],
      authReq: "Configured target server validation",
      authzReq: "Checked signature matching controls on destination codes",
      privacy: ["Strict data minimization applies to JSON payload assemblies"],
      limitations: ["No integration with internal firewall bypass systems is automated."]
    },
    enterpriseValue: {
      operational: "Ensures near-instantaneous account activations for verified customers.",
      security: "Defends partner servers against imitation callbacks via HMAC signature validation.",
      administrative: "Auto-manages network retry efforts, easing technical maintenance.",
      developer: "Visual delivery logs simplify debugging of API callback functions.",
      scalability: "Horizontal thread pools distribute millions of simultaneous event payloads."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Delivery tracking parameters are currently simulated in sandbox dashboards. Replace with resilient asynchronous message queues (e.g., RabbitMQ, Celery) before real-world production.",
    futureImprovements: [
      { title: "Symmetrical Webhook Signature Secret Rotations", phase: "Enterprise", desc: "Automate webhook secret key cycles to maximize security integrity." }
    ],
    glossary: [
      { term: "HMAC", definition: "Hash-Based Message Authentication Code. A specific type of message authentication code involving a cryptographic hash function in combination with a secret key." }
    ],
    knowledgeCheck: [
      {
        question: "How can partner servers verify that a webhook message came from AAN?",
        options: ["By checking the design font of the message body", "By verifying the cryptographic HMAC signature in the request headers against their secret token", "By giving AAN their central server SSH password", "By manually calling other API servers and comparing logs"],
        answerIndex: 1,
        explanation: "Verifying the HMAC header signature using the secret key guarantees that the payload originates from AAN and remains strictly untampered."
      }
    ],
    relatedLessons: ["api_keys", "verification_sessions", "audit_logs"]
  },
  {
    id: "audit_logs",
    title: "Audit Logs",
    category: "security-privacy",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "The immutable global logging registry that records sensitive administrative mutations, API events, parameter overrides, and secure token exports.",
    whyExists: "Facilitates security accountability. Ensures SOC2 compliance by preserving a permanent trace of every critical human alteration across the system.",
    plainEnglish: {
      analogy: "Bank vault entry logbook",
      analogyText: "Like the master logbook at a bank vault. Every time a guard opens drawers, changes lock codes, or exits carrying envelopes, they must write down their name, timestamp, and purpose.",
      simplifiedText: "Audit Logs are a permanent digital diary. They record every major action taken on AAN—like when an administrator generates a new key or updates a policy."
    },
    technicalExplanation: {
      inputs: ["Actor user properties", "Action designation type", "Target resource properties", "Custom context details"],
      processing: ["UUID structural calculations", "Timestamp generation", "Log string compilation"],
      decisionLogic: ["Enforce append-only write policies; database must block all edit or delete commands on log entries"],
      outputs: ["Saves un-editable system audit records", "Dynamic console log streams"],
      dependencies: ["Postgres schemas", "Crypto hashing mechanisms"],
      security: ["Write-once schema enforcement to protect against threat covers by malicious employees"],
      dataFlow: ["Action is taken -> API finishes processing -> Appends record to audit schema -> Visual console renders event"]
    },
    workflow: [
      "Administrator updates a system setting or exports logs",
      "API processes task and secures resource modifications",
      "Audit engine maps transaction parameters instantly",
      "Append-only record is saved permanently within Postgres schema",
      "Platform monitors log rails in real-time, highlighting compliance updates"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Permanent accountability logging for all sensitive platform adjustments.",
        columns: ["id", "actor_type", "actor_id", "action", "target_type", "target_id", "metadata", "created_at"],
        relationships: "Links actors and targets across system tables"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/export-verification-audit",
        purpose: "Allows admins to export completed session logs for external audits.",
        auth: "Admin Cookie Session Session",
        response: '{\n  "label": "MVP audit snapshot",\n  "export_timestamp": "2026-06-21T21:33:42.000Z",\n  "organization_id": "org_enterprise_999",\n  "requesting_admin_user_id": "admin_super_user_one",\n  "verification_logs": []\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard 'Audits' tab option on lateral sidebar",
      actions: ["Search logs ledger by keyword", "Filter events by category or actor", "Export snapshot records securely"],
      permissions: ["View access limited tightly to Global System Admins and Compliance Officers; zero write capability allowed"],
      metrics: ["Total logs recorded", "Recent administrative action statistics", "Anomaly alerts count"]
    },
    securityModel: {
      risks: ["Malicious agents attempting to edit log histories to hide unauthorized parameter changes", "Unintended deletion of log records"],
      hiddenData: ["Owner secret passwords", "Unchanged raw signature templates"],
      authReq: "Supabase JWT session token verification",
      authzReq: "Must possess system administrator scope privilege",
      privacy: ["Log values describe administrative actions only; no user PII holds here"],
      limitations: ["Relies on server instance clock synchronization to preserve absolute event sequencing."]
    },
    enterpriseValue: {
      operational: "Reduces regulatory compliance friction, easing prep for SOC2 or ISO inspections.",
      security: "Minimizes compromise durations by giving incident response teams clear forensic timelines.",
      administrative: "Ensures comprehensive team accountability across sprawling organizations.",
      developer: "Provides structural trails simplifying complex configuration debugging.",
      scalability: "Supports horizontal partition keys to scales logs storage cost-efficiently."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database utilizes soft controls. In enterprise setups, forward logs instantly to an external WORM (Write Once, Read Many) or append-only cloud infrastructure like AWS S3 Glacier.",
    futureImprovements: [
      { title: "Cryptographic Block Chaining", phase: "Research", desc: "Hash log sequences into an active blockchain tree to mathematically prevent retrospective tampering efforts." }
    ],
    glossary: [
      { term: "Audit Logbook", definition: "A systematic, chronological digital record of activities or events that have occurred within an application system." }
    ],
    knowledgeCheck: [
      {
        question: "Can an administrator edit an audit log record to correct a typo?",
        options: ["Yes, if they hold highest administrator privileges", "No, audit logs are append-only. They are structurally immutable and cannot be updated or deleted", "Yes, on weekends under supervisor supervision", "Only if the database is in sandbox mode"],
        answerIndex: 1,
        explanation: "Audit logs are designed under strict SOC2 write-once boundaries. They remain immutable to ensure a trustworthy, un-tamperable audit trail."
      }
    ],
    relatedLessons: ["intro", "api_keys", "roles_permissions"]
  }
];

export const OTHER_LESSONS: AcademyLesson[] = [
  {
    id: "partner_dashboard",
    title: "Partner Dashboard",
    category: "developer-api",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "Unified control room console for enterprise developers, letting them monitor volumes, test payloads, manage keys, and view threat vectors.",
    whyExists: "Provides a friction-free monitoring UI. Developers require instant feedback loops to manage integration tasks seamlessly.",
    plainEnglish: {
      analogy: "Power Plant Control Panel",
      analogyText: "Like the main dials and override buttons in a power plant control room, letting you check throughput and toggle valves visually.",
      simplifiedText: "The Partner Portal is your account center. You can check how many users scanned successfully, look up errors, and change security toggles."
    },
    technicalExplanation: {
      inputs: ["User organization credentials", "Project environment IDs", "Time range boundaries"],
      processing: ["Aggregation of daily log streams", "Dynamic formatting of threat charts", "Key hashing representations"],
      decisionLogic: ["Only show live production credentials to team members with administrator level permissions", "Toggle widgets based on active tier status"],
      outputs: ["Interactive metrics charts", "Redirection callback lists"],
      dependencies: ["Recharts data vis modules", "Supabase Client libraries"],
      security: ["Sessions automatically lock after idling", "Sensitive values are masked in client responses by default"],
      dataFlow: ["Portal queries server API -> Backend aggregates DB metrics -> JSON payloads feed browser charts -> Admin interacts"]
    },
    workflow: [
      "Developer logs into AAN Partner Space",
      "System loads active project token statistics",
      "Render modules build analytics widgets dynamically",
      "Developer reviews compliance log details",
      "Actions like rotating key dispatch secure DB mutations instantly"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Saves client application profiles.",
        columns: ["id", "app_name", "webhook_url"],
        relationships: "Belongs to workspace projects"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/v1/verification-sessions",
        purpose: "Query historic session ledgers.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "sessions": []\n}'
      }
    ],
    dashboardIntegration: {
      location: "/dashboard URL path",
      actions: ["Test payload webhooks", "Rotate keys", "Inspect verification results"],
      permissions: ["Shared with all invited project members"],
      metrics: ["Total onboarding volume", "Average latency", "Threat ratios"]
    },
    securityModel: {
      risks: ["Session hijacking", "Privilege escalation by viewers"],
      hiddenData: ["Direct user identities, physical images"],
      authReq: "Supabase account authentication",
      authzReq: "Checked project tenant scopes",
      privacy: ["All database indexes enforce compartmental tenant partition keys"],
      limitations: ["Relying on target browsers to block brute-force clicks on auth flows."]
    },
    enterpriseValue: {
      operational: "Accelerates daily developer audits.",
      security: "Restricts key views based on corporate permissions.",
      administrative: "Ensures clear accountability records of key mutations.",
      developer: "Visualizes client integration telemetry.",
      scalability: "Maintains rapid read performance via cached ledger counters."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and biometric providers before any production use.",
    futureImprovements: [
      { title: "Dynamic Custom Theme Colors", phase: "Optional", desc: "Allow enterprise teams to co-brand the partner dashboard panel easily." }
    ],
    glossary: [
      { term: "Telemetry Mocking", definition: "A method of passing predefined diagnostic indicators to APIs to test downstream behavior without holding real hardware." }
    ],
    knowledgeCheck: [
      {
        question: "Who can see raw plaintext API keys inside the partner dashboard once generated?",
        options: ["All invited developers", "Nobody, keys are hashed immediately and are never retrievable after the first setup screen closes", "Only client customer service agents", "Platform support engineers"],
        answerIndex: 1,
        explanation: "API keys are one-way hashed before database saving, they can never be rendered in plaintext again once closed."
      }
    ],
    relatedLessons: ["api_keys", "webhook_system", "analytics"]
  },
  {
    id: "analytics",
    title: "Analytics",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard", "AdminDashboard"],
    overview: "Dynamic dashboard intelligence charts rendering real-time verification velocities, threat distributions, and geographic telemetry aggregates.",
    whyExists: "Enables anomaly evaluation. Security teams need to immediately spot spikes in registration attempts or clusters of high-risk scoring users.",
    plainEnglish: {
      analogy: "Weather Radar Chart",
      analogyText: "Like looking at a weather radar chart to see where storm patterns are forming before they hit your town.",
      simplifiedText: "The Analytics screens are where you see charts of your traffic. It shows pass/fail trends, bot attack spikes, and response speeds."
    },
    technicalExplanation: {
      inputs: ["Historic verification session state registers", "Risk scoring metrics", "Time-series filter boundaries"],
      processing: ["Aggregating daily transaction rates", "Grouping threat reason indicators", "Calculating average conversion metrics"],
      decisionLogic: ["Ensure charts are cached and computed efficiently on server database nodes to protect UI responsiveness", "Enforce tenant隔离 boundaries strictly on analytical counters"],
      outputs: ["Time-series graph datasets", "Risk proportion aggregates"],
      dependencies: ["Recharts visual library", "Timescaled db index profiles"],
      security: ["Database indices prevent multi-tenant data bleed in background count scripts"],
      dataFlow: ["Partner queries analytics -> DB executes group-by counts -> Server returns JSON dataset -> Recharts renders UI graphs"]
    },
    workflow: [
      "User accesses dashboard homepage",
      "Network calls database aggregate APIs with date bounds",
      "Server calculates transactional velocity averages",
      "UI maps coordinates into responsive chart layers",
      "Anomalous spikes immediately highlight with warning borders"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Originating database record used for counting volume averages.",
        columns: ["risk_score", "status", "created_at"],
        relationships: "Belongs to specific developer apps"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/v1/verification-sessions",
        purpose: "Query historic session volume checks.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "sessions": []\n}'
      }
    ],
    dashboardIntegration: {
      location: "Active Home Screen on developer portal and administrator consoles",
      actions: ["Adjust date scales", "Filter by specific projects", "Export tabular analytics datasets"],
      permissions: ["Shared with all authorized project members"],
      metrics: ["Total user onboarding volume", "Average conversion success ratios", "Bot wave counts"]
    },
    securityModel: {
      risks: ["Exposing raw system load metrics to external client tools", "Data leakage via incomplete grouping constraints"],
      hiddenData: ["Individual signature vectors or user credentials"],
      authReq: "Supabase JWT session state",
      authzReq: "Tenant-matched read scopes",
      privacy: ["Data is aggregated before retrieval, erasing specific user behavior traces"],
      limitations: ["No automated predictive machine-learning projections are active in main MVP code."]
    },
    enterpriseValue: {
      operational: "Eases operations tracking, displaying traffic peaks in real-time.",
      security: "Auto-alerts security teams about escalating automated sybil waves.",
      administrative: "Ensures reporting matches physical customer records for audits.",
      developer: "Identifies system latency or user validation drop-out patterns.",
      scalability: "Runs hyper-efficient database summaries to minimize query resource impacts."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Data charts are fed with simulated mock timelines. Replace with TimescaleDB indices or active cloud warehouse connections for production scale.",
    futureImprovements: [
      { title: "Anomaly Auto-Alerting Webhook Hooks", phase: "Optional", desc: "Dispatch warning emails or Slack webhooks when bot attack indicators break standard baselines." }
    ],
    glossary: [
      { term: "Aggregation", definition: "A database operation that bundles plural separate record metrics into grouped summaries (e.g. sum, count, average)." }
    ],
    knowledgeCheck: [
      {
        question: "Why do we group risk analytics on AAN systems?",
        options: ["To slow down database lookups", "To reveal system performance while hiding individual user actions, safeguarding privacy", "To sell customer behavior lists to advertisers", "Only because charts are pretty"],
        answerIndex: 1,
        explanation: "Aggregation balances operational reporting with strict user privacy by summarizing metrics without exposing discrete trace logs."
      }
    ],
    relatedLessons: ["partner_dashboard", "risk_engine", "webhook_system"]
  },
  {
    id: "removal_requests",
    title: "Removal Requests",
    category: "core",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "The 'Right to be Forgotten' user privacy portal allowing users or administrative systems to queue cryptographic signature templates for absolute execution deletion.",
    whyExists: "Guarantees absolute GDPR / CCPA privacy compliance. Users must possess frictionless tools to immediately delete any signature trace.",
    plainEnglish: {
      analogy: "Incinerator Bin",
      analogyText: "Like throwing a paper key envelope into a locked physical incinerator bin at the bank to guarantee it can never be retrieved or matched.",
      simplifiedText: "Removal Requests are delete buttons for identity. If you request deletion, AAN immediately and permanently wipes your signature hashes from the database."
    },
    technicalExplanation: {
      inputs: ["User unique verification hash identifiers", "Removal approval tokens"],
      processing: ["Locating target templates in database", "Absolute physical database record deletion execution", "Pruning transaction metadata references"],
      decisionLogic: ["Ensure target records correspond accurately to requests", "Validate administrative deletion approval checks before wiping values"],
      outputs: ["Deletion confirmation receipt indicators"],
      dependencies: ["Signature templates tables", "Audit logging networks"],
      security: ["Force permanent deletion instead of soft-delete; database records are completely purged"],
      dataFlow: ["User submits removal request -> Server validates token -> Erases signature templates -> Logs anonymized audit stamp"]
    },
    workflow: [
      "User accesses the privacy portal",
      "Submits verified identification code",
      "System queues signature vectors for removal processing",
      "Server executes absolute permanent delete commands across database",
      "Emits audit log certifying deletion of user template hashes"
    ],
    databaseTables: [
      {
        name: "signature_templates",
        purpose: "Saves cryptographic vectors mapped to delete.",
        columns: ["id", "user_id"],
        relationships: "Permanently purged from parent users records"
      }
    ],
    apiEndpoints: [
      {
        method: "DELETE",
        path: "/api/v1/verification-sessions/:id",
        purpose: "Wipe dynamic session vectors permanently.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "success": true,\n  "message": "Session and all associated signature templates successfully deleted."\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Dashboard under 'Compliance / Overrides' section views",
      actions: ["Trigger manual user deletions", "Inspect pending deletion queues statistics"],
      permissions: ["Write accessibility restricted tightly to System Administrators alone"],
      metrics: ["Total deleted unique users records", "Average deletion execution velocity logs"]
    },
    securityModel: {
      risks: ["Malicious agents triggering deletion of verified users to bypass sybil detection restrictions", "Incomplete database indexing leaving old data fragments active"],
      hiddenData: ["All signature metadata (deleted instantly of course)"],
      authReq: "Supabase high privilege session token",
      authzReq: "System Administrator authorization scopes",
      privacy: ["Enforces permanent hardware hard-deletes, removing data fragments from file records"],
      limitations: ["Cannot retract deletion results once executed."]
    },
    enterpriseValue: {
      operational: "Removes corporate legal risks regarding identity privacy liabilities.",
      security: "Guarantees data cleanliness by purging old unused records.",
      administrative: "Maintains clear certified deletion logs for regional regulators.",
      developer: "Simple DELETE endpoints allow immediate automated integrations in customer portals.",
      scalability: "Maintains a compact database sizing, optimizing search speeds."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database utilizes standard soft flags in sandbox code. Replace with automated database hard-deletion commands in production.",
    futureImprovements: [
      { title: "Self-Sovereign Automated Purges", phase: "Research", desc: "Allow users to sign deletion claims using physical sovereign private keys directly." }
    ],
    glossary: [
      { term: "GDPR", definition: "General Data Protection Regulation. A European Union regulation protecting personal privacy and regulating data processing." }
    ],
    knowledgeCheck: [
      {
        question: "Are removed signature templates retrievable from backups after execution?",
        options: ["Yes, using standard reconstruction recovery software", "No, AAN executes absolute physical hard-deletions which are wholly irreversible for compliance reasons", "Only with supervisor permission slips", "Only on select desktop applications"],
        answerIndex: 1,
        explanation: "To adhere to physical privacy laws, AAN executes irreversible hard deletes. Deleted signature data can never be returned."
      }
    ],
    relatedLessons: ["privacy_model", "users", "signature_templates"]
  },
  {
    id: "developer_sdk",
    title: "Developer SDK",
    category: "developer-api",
    version: "v1.2.0",
    status: "Production Ready",
    relatedComponents: ["VerifySessionFlow"],
    overview: "Front-end and back-end helper libraries allowing developers to instantiate AAN trust widgets and query sessions effortlessly in their native environments.",
    whyExists: "Reduces integration times. Developers do not want to build custom browser telemetry and device signal checks from scratch.",
    plainEnglish: {
      analogy: "Pre-Built USB Plug-and-Play Hub",
      analogyText: "Like buying a USB mouse that plugs right in and works immediately, instead of soldering individual wires to your computer motherboard.",
      simplifiedText: "The Developer SDK is a pre-built toolkit. You drop two lines of code into your website to embed AAN's beautiful trust widget instantly."
    },
    technicalExplanation: {
      inputs: ["Client mount DOM nodes", "Session configuration tokens", "Verification callback parameter functions"],
      processing: ["Client media capturing", "Integrity telemetry packaging", "WebAssembly system fingerprint alignment tracking"],
      decisionLogic: ["Only active telemetry modules when user initiates checks", "Dynamically adjust signal rates based on client device power properties"],
      outputs: ["Interactive scanning trust overlays", "Event completion hooks"],
      dependencies: ["React/Vue front-end wrappers", "WASM neural-net configurations", "Tailwind styling classes"],
      security: ["SDK restricts frame capturing strictly inside client browser sandbox contexts", "Limits script payloads to secure CDNs"],
      dataFlow: ["Host code mounts SDK -> Telemetry activates on client -> Encrypted signatures stream to APIs -> SDK alerts completion status"]
    },
    workflow: [
      "Developer imports AAN SDK library into project",
      "Calls 'AAN.initialize()' specifying target session security token",
      "SDK mounts a clean modal overlay displaying security prompts",
      "Runs automated posture integrity and local consistency tests",
      "Emits 'onSuccess(proofToken)' callback upon validation"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Verifies the application identity consuming SDK pipelines.",
        columns: ["id", "app_name"],
        relationships: "Parent environment to tracking sessions"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Initiate backend session details for SDK mounting.",
        auth: "Bearer API Key",
        payload: '{\n  "external_user_id": "usr_99214"\n}',
        response: '{\n  "session_token": "ptk_aa338271e1b2f90a"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Developer API tab settings on the main dashboard sidebar",
      actions: ["Download SDK documentation guides", "Test sample integrations in live code sandboxes", "Retrieve environment API packages"],
      permissions: ["Shared openly with all engineers"],
      metrics: ["SDK loading times per geography", "Active user terminal browser distribution trends"]
    },
    securityModel: {
      risks: ["Client-side reverse-engineering of SDK files", "Malicious code injections overriding front-end callback loops in client apps"],
      hiddenData: ["Private keys are never embedded or exposed inside client SDK scripts"],
      authReq: "Signed session tokens verifying client calls",
      authzReq: "Bounded to originating application context domains",
      privacy: ["Processes browser tracking in-memory inside client browsers directly, discarding parameters instantly"],
      limitations: ["Depends wholly on client system specs and browser capabilities."]
    },
    enterpriseValue: {
      operational: "Accelerates time-to-market for verification setups from weeks to hours.",
      security: "Standardizes front-end capture loops, reducing developer security bugs.",
      administrative: "Ensures seamless user experience across mobile and web environments.",
      developer: "Allows rapid custom UI modifications with clean developer parameters.",
      scalability: "Bundles small, optimized library frames that load in fractions of seconds worldwide."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Security telemetry flows are currently simulated inside React. Replace mock parameters with production integrity checks before deployment.",
    futureImprovements: [
      { title: "Native iOS / Android SDK Libraries", phase: "Enterprise", desc: "Build native Swift and Kotlin modules interacting with native device security frameworks." }
    ],
    glossary: [
      { term: "WASM", definition: "WebAssembly. A binary instruction format that runs in modern browsers at near-native speeds, ideal for real-time video math parsing." }
    ],
    knowledgeCheck: [
      {
        question: "Why does the AAN SDK use WebAssembly (WASM)?",
        options: ["To translate files into french", "To process complex cryptographic signing algorithms locally in the client browser at near-native speed", "To trace locations instantly via GPS", "To bypass browser security boundaries"],
        answerIndex: 1,
        explanation: "WebAssembly empowers browsers to execute complex machine-learning algorithms on video frames with high efficiency."
      }
    ],
    relatedLessons: ["partner_api", "verification_sessions", "sandbox_engine"]
  },
  {
    id: "partner_api",
    title: "Partner API",
    category: "developer-api",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard"],
    overview: "The robust RESTful developer interface providing programmatic control over session generation, verification, and database audits.",
    whyExists: "Enables core automation. Client companies require secure backend APIs to control verification programs without human interventions.",
    plainEnglish: {
      analogy: "Restaurant Drive-Through Window",
      analogyText: "Like the drive-through window at a fast-food restaurant. You speak your order, pay, and receive your bag at separate automated checkpoints.",
      simplifiedText: "The Partner API is the digital pipeline. Your servers call it with code to create sessions, read scores, and check tokens."
    },
    technicalExplanation: {
      inputs: ["Bearer SHA-256 API credentials", "JSON-encoded payload boundaries"],
      processing: ["Bearer credentials hashing validation", "Payload validity examinations", "Request rate limiting calculations"],
      decisionLogic: ["Block requests exceeding rate guidelines (e.g., 100/min per token in sandbox)", "Reject parameters containing invalid JSON schemas"],
      outputs: ["Highly structured JSON response frames", "HTTP compliance status indicators"],
      dependencies: ["Express JS routes engine", "Timescaled databases structures"],
      security: ["Enforces HTTPS-only encryption everywhere", "Hashed token audits protect against leak vectors"],
      dataFlow: ["Partner Server calls API -> Middleware validates keys -> Queries Postgres records -> Responds with JSON payload"]
    },
    workflow: [
      "Partner server dispatches POST request with secure bearer key headers",
      "API gateway middleware hashes key, matching Postgres records",
      "Rate limiter verifies client has not exceeded operational boundaries",
      "Routing engine performs requested action inside database structures",
      "Responds with predictable HTTP status code and clean JSON payload data"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Primary application profile index used for credential verification.",
        columns: ["id", "api_key_hash", "app_name"],
        relationships: "Parent directory to session records"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Initiate verified security transactions programmatically.",
        auth: "Bearer Plane JWT Identifier String",
        payload: '{\n  "external_user_id": "cust_usr_391"\n}',
        response: '{\n  "session_id": "vss_3a912",\n  "verification_url": "https://aan.identity/verify/session/vss_3a912"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Developer API setting screens on partner dashboards",
      actions: ["Review documentation routes", "Generate Sandbox keys", "Analyze log streams"],
      permissions: ["Shared openly with all organization engineers"],
      metrics: ["Total daily API calls count", "Average API response latency timescales in milliseconds"]
    },
    securityModel: {
      risks: ["API key leakage", "Insecure direct object reference (IDOR) attacks accessing unauthorized user sessions"],
      hiddenData: ["Strictly masks client passwords and sensitive database configurations"],
      authReq: "Hashed authorization token strings inside Authorization headers",
      authzReq: "Checked project boundary validation during each API execution loop",
      privacy: ["Data minimized responses return metadata only, zero PII contained"],
      limitations: ["Requires partner servers to deploy correct secure parameter handling."]
    },
    enterpriseValue: {
      operational: "Allows dynamic automated workflows linking systems seamlessly.",
      security: "Hashed keys shield backend infrastructure against data thefts.",
      administrative: "Ensures programmatic interactions are cataloged for security records.",
      developer: "Clean JSON and standard HTTP status codes simplify product implementation.",
      scalability: "Stateless architecture allows rapid vertical and horizontal API scaling."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Replace with certified identity, device, fraud, and biometric providers before any production use.",
    futureImprovements: [
      { title: "GraphQL Integration support", phase: "Enterprise", desc: "Introduce GraphQL endpoints to customize API metrics requests precisely." }
    ],
    glossary: [
      { term: "REST", definition: "Representational State Transfer. A standard architectural style for designing networked applications using simple HTTP pathways." }
    ],
    knowledgeCheck: [
      {
        question: "How does AAN API handle bad JSON payloads?",
        options: ["Saves them to system administrator desks", "Rejects them instantly with HTTP 400 Bad Request error codes, logging anomalies to audits", "Corrects the typos automatically", "Restarts the web server database"],
        answerIndex: 1,
        explanation: "Programmatic routes enforce strict JSON schema checks, rejecting invalid payloads with HTTP 400 errors to protect database sanity."
      }
    ],
    relatedLessons: ["developer_sdk", "api_keys", "verification_sessions"]
  },
  {
    id: "database_architecture",
    title: "Database Architecture",
    category: "infrastructure-deployment",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "Relational database schema engineered inside PostgreSQL to maintain strict consistency, prevent Sybil duplicates, and isolate multi-tenant structures securely.",
    whyExists: "Guarantees data integrity. Identity ledgers require absolute structural consistency, ACID compliance, and secure foreign key relationships.",
    plainEnglish: {
      analogy: "Safety Deposit Box Vault",
      analogyText: "Like a bank vault holding rows of locked deposit boxes. Each box requires a tenant key, and the cabinet rows are bolted in place to prevent mixing.",
      simplifiedText: "The Database Architecture is the blueprint defining where data lives. It ensures a 'Device' is always linked to a 'User,' and test data never mixes with live data."
    },
    technicalExplanation: {
      inputs: ["SQL database schemas definer files", "Schema structural migration triggers"],
      processing: ["SQL tables partition setup", "Foreign keys constraint mapping", "Unique indexes evaluations"],
      decisionLogic: ["Enforce unique constraints on signature template hashes to prevent duplicate accounts", "Block cascade deletes on critical audit history tables"],
      outputs: ["Active relational database models structures", "Validated write transaction receipts"],
      dependencies: ["Supabase PostgreSQL engines", "Drizzle ORM schemas"],
      security: ["Schema enforces tenant segregation indexes on all queries by default", "SSL database connection pipelines"],
      dataFlow: ["API calls database -> Postgres enforces index keys -> Operations register inside tables -> Confirms ACID consistency"]
    },
    workflow: [
      "Product system initializes database schema migrations",
      "PostgreSQL tables map relations (Users, Devices, Sessions, Audits)",
      "Unique database indices lock key parameters (e.g., signature hashes)",
      "API backend runs standard parameterized queries against schema",
      "Transaction succeeds statefully, adhering to ACID constraints"
    ],
    databaseTables: [
      {
        name: "users",
        purpose: "Saves anonymized user accounts.",
        columns: ["id", "identity_status", "created_at"],
        relationships: "Parent table containing linked signature and session profiles"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Audit dynamic database structural health records.",
        auth: "Workspace Cookie Session token",
        response: '{\n  "database_tables": ["users", "signature_templates", "devices", "audit_logs"]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Overview Ledger screens and Postgres SQL consoles",
      actions: ["Inspect active relational queries", "Monitor storage limits indexes", "Trigger database snapshots"],
      permissions: ["Access limited to Lead Administrators; zero direct console writes from SDKs"],
      metrics: ["Total database records count", "Average query completion times", "Storage sizing indexes"]
    },
    securityModel: {
      risks: ["SQL Injection attacks trying to leak user databases", "Unbounded cascading deletions erasing critical audit timelines"],
      hiddenData: ["Database host connection passwords, raw structural ports"],
      authReq: "MFA-protected database access tokens",
      authzReq: "Checked administrative tenant rights",
      privacy: ["One-way hashing secures signature template inputs, preventing reconstruction of original users"],
      limitations: ["Database nodes must operate in active-standby configurations to protect against regional drops."]
    },
    enterpriseValue: {
      operational: "Guarantees data sanity under heavy workload scales.",
      security: "SSL encryption ensures data is secure both at rest and in transit.",
      administrative: "Eases compliance certifications via standard structured audit tables.",
      developer: "Logical schemas permit straightforward querying and troubleshooting.",
      scalability: "Postgres partitioning supports scaling to millions of customer verification rows."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database operations in sandbox run simple local Postgres steps. Replace with high-availability enterprise database clustering before scaling live.",
    futureImprovements: [
      { title: "Dynamic Database Scale-to-Zero Partitioning", phase: "Enterprise", desc: "Automatically partition historic session tables by fiscal years to optimize query speeds." }
    ],
    glossary: [
      { term: "ACID", definition: "Atomicity, Consistency, Isolation, Durability. A set of properties that guarantee database transactions are processed reliably." }
    ],
    knowledgeCheck: [
      {
        question: "How does AAN secure database connections in transit?",
        options: ["Saves logs to secure public folders", "Utilizes forced SSL/TLS encryption arrays for all programmatic SQL pipelines", "Un-encrypts connection protocols to bypass firewalls", "Only does so on mobile browsers"],
        answerIndex: 1,
        explanation: "All backend programmatic SQL connections enforce mandatory SSL/TLS transit encryptions to block data sniffing hazards."
      }
    ],
    relatedLessons: ["supabase_integration", "row_level_security", "users"]
  },
  {
    id: "supabase_integration",
    title: "Supabase Integration",
    category: "infrastructure-deployment",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["App", "PartnerDashboard"],
    overview: "The cloud infrastructure integration connecting AAN's back-end with Supabase managed PostgreSQL, database authentications, and secure storage systems.",
    whyExists: "Leverages rapid managed platforms. Allows building high-integrity MVPs with enterprise-grade scaling, user auth, and real-time database capabilities.",
    plainEnglish: {
      analogy: "Coordinating Cloud Storage Provider",
      analogyText: "Like hiring a secure, professional storage warehouse company to store and secure your inventory rather than building a custom physical warehouse on your lawn.",
      simplifiedText: "Supabase Integration is the connection between AAN and our secure cloud data warehouse. It safely tracks logins, stores database rows, and runs secure checks."
    },
    technicalExplanation: {
      inputs: ["Supabase Projects Key strings", "Database URL parameters", "Client auth credentials"],
      processing: ["User authorization routing", "Query dispatch matching", "Database Row-level-security triggers"],
      decisionLogic: ["Permit or block records writes based on JWT token validation rules", "Enforce query structures strictly inside API middleware layers"],
      outputs: ["Authenticated user properties", "Postgres index query responses"],
      dependencies: ["Supabase JS Clients packages", "Next / Express app configurations"],
      security: ["Exposes only public project keys to client browsers; critical admin secrets stay securely on servers"],
      dataFlow: ["Client actions -> API server -> Supabase client -> Postgres DB tables -> API responds to browser"]
    },
    workflow: [
      "User registers or initiates developer portal login steps",
      "Next server forwards credentials to Supabase Auth API",
      "Supabase returns signed cryptographic JSON Web Tokens (JWT)",
      "Consecutive database calls include JWT headers validating caller scopes",
      "PostgreSQL acts on records inside isolated tenant namespaces"
    ],
    databaseTables: [
      {
        name: "users",
        purpose: "Tracks individual developer management workspace accounts.",
        columns: ["id", "email", "last_sign_in_at"],
        relationships: "Parent user database in Supabase auth modules"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Check Supabase project environment integrations.",
        auth: "Workspace Cookie Session",
        response: '{\n  "supabase_configured": true,\n  "project_reference": "aan-identity-prod"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Developer portal sign-in pipelines and back-end configurations",
      actions: ["Log in with team email configurations", "Log out safely", "Reset administrative passwords"],
      permissions: ["Accessible to all registered developers and system administrators"],
      metrics: ["Supabase API response time charts", "Database transaction rates"]
    },
    securityModel: {
      risks: ["Exposing highly sensitive service-role credentials to local web browsers", "Improper database permission structures allowing tenant bleeding"],
      hiddenData: ["Supabase high level Service Role Keys (SUPABASE_SERVICE_ROLE_KEY)"],
      authReq: "Supabase authenticated sessions",
      authzReq: "Checked project tenant scopes",
      privacy: ["Passwords and salts are stored using cryptographic hashes, un-viewable by administrators"],
      limitations: ["Relying on external platform security structures to safeguard server ports."]
    },
    enterpriseValue: {
      operational: "Removes developer overhead by hosting scalable managed database backbones natively.",
      security: "Minimizes credential theft risks via clean, centralized authentication modules.",
      administrative: "Ensures clear accountability records of administrative logins.",
      developer: "Allows rapid custom UI modifications with clean developer parameters.",
      scalability: "Stateless verification sessions scale horizontally seamlessly."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database operations in local MVP are simulated in local React workspace states. Connect a real active Supabase Cloud project before launch.",
    futureImprovements: [
      { title: "Supabase Decoupling Architecture", phase: "Research", desc: "Build independent custom database clustering tools to eliminate single-point dependencies." }
    ],
    glossary: [
      { term: "Supabase", definition: "An open-source Firebase alternative providing managed PostgreSQL databases, authentication, and instant API generators." }
    ],
    knowledgeCheck: [
      {
        question: "Is it safe to expose the Supabase Service Role Key (service_role) inside browser code?",
        options: ["Yes, to speed up dynamic front-end development", "No, the service role key bypasses all database security rules and must stay securely on your backend server only", "Yes, if encrypted with standard public passwords", "Only on mobile browsers"],
        answerIndex: 1,
        explanation: "The Service Role Key carries full bypass privileges across safety rules. It must stay securely hidden on your servers."
      }
    ],
    relatedLessons: ["database_architecture", "row_level_security", "users"]
  },
  {
    id: "authentication",
    title: "Authentication",
    category: "auth-identity",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["App", "PartnerDashboard"],
    overview: "The programmatic verification security layers of AAN that confirm user and partner identity credentials before granting active console session access.",
    whyExists: "Restricts access to sensitive developer tools. Verifies that individuals reading telemetry reports are authorized employee seats.",
    plainEnglish: {
      analogy: "Digital Keycard",
      analogyText: "Like sliding your personalized ID badge into the security door at the office to confirm you are an authorized employee before entering.",
      simplifiedText: "Authentication is how AAN checks who you are. Usually, it's signing in with your email and password to securely access your developer dashboard."
    },
    technicalExplanation: {
      inputs: ["Email strings", "Password character arrays", "Verification OTP codes"],
      processing: ["Password salt hash validation lookup", "JWT creation computations", "MFA validation checks"],
      decisionLogic: ["Verify hashed password strings match stored credentials inside Postgres indexes", "Lock access after 5 consecutive failed logins"],
      outputs: ["Signed session tokens", "Verified profile indicators"],
      dependencies: ["Supabase Authentication library", "Next JS middleware filters"],
      security: ["Passwords hashed withbcrypt/argon2 to protect profiles", "TLS transport encryption mandatory"],
      dataFlow: ["User submits credentials -> Server checks database -> Returns cryptographic session JWT -> Client stores token"]
    },
    workflow: [
      "User accesses developer portal login form",
      "Inputs registered email and password credentials",
      "Server hashes inputs, contrasting matches on auth tables",
      "System issues short-lived, cryptographically signed JSON Web Token (JWT)",
      "Subsequent sessions checked against JWT signatures for security access"
    ],
    databaseTables: [
      {
        name: "users",
        purpose: "Saves high-level developer account credentials.",
        columns: ["id", "email", "encrypted_password", "last_login"],
        relationships: "Parent user database in Supabase auth modules"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/internal/test-snapshot",
        purpose: "Test authenticated portal session state metrics.",
        auth: "Workspace Cookie Session Token",
        response: '{\n  "authenticated": true,\n  "user": "yogorddy@gmail.com"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Developer Portal Landing Page screen and User Profile settings",
      actions: ["Sign in using credentials", "Log out cleanly", "Modify administrative security credentials"],
      permissions: ["Accessible to all registered workspace administrators"],
      metrics: ["Login success tracking rates", "Active system administrators count"]
    },
    securityModel: {
      risks: ["Brute force keyword dictionary attacks guessing credentials", "Session hijacking using stolen token arrays"],
      hiddenData: ["Plaintext administrator passwords (never saved on databases)"],
      authReq: "Two-factor authentication codes where active",
      authzReq: "Must possess valid console administrative scopes",
      privacy: ["Anonymizes employee logs where applicable to protect personal actions"],
      limitations: ["Does not emulate physical cellular reception fluctuations or extreme raw network packet loss."]
    },
    enterpriseValue: {
      operational: "Stops external malicious actors from adjusting parameters in your account.",
      security: "Protects critical API and customer logs tables from public view.",
      administrative: "Ensures clear responsibility mapping for internal project owners.",
      developer: "Allows front-end elements to adapt visually based on user privileges.",
      scalability: "Stateless jwt keys scale vertically cleanly across APIs."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Authentication checks run in mock state. Connect a real Supabase Auth project before active deployment.",
    futureImprovements: [
      { title: "OAuth Single Sign-On Integration", phase: "Enterprise", desc: "Integrate native corporate login profiles using standard Okta/Azure Active Directory standards." }
    ],
    glossary: [
      { term: "Hashing", definition: "A cryptographic function that maps a variable string of data to a fixed-size characters array, used to secure stored passwords." }
    ],
    knowledgeCheck: [
      {
        question: "How does AAN protect stored user passwords in database partitions?",
        options: ["Saves them in plaintext inside a backup directory", "One-way hashes them, so original character strings are mathematically irreversible and secure", "By saving them in base64 layout arrays", "Only does so on mobile browsers"],
        answerIndex: 1,
        explanation: "One-way hashing guarantees that even if database records are compromised, physical plain character passwords remain wholly safe."
      }
    ],
    relatedLessons: ["authorization", "row_level_security", "users"]
  },
  {
    id: "authorization",
    title: "Authorization",
    category: "auth-identity",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["PartnerDashboard", "AdminDashboard"],
    overview: "Encompasses the server-side checks and rules that determine exactly what actions an authenticated user is permitted to perform throughout the platform.",
    whyExists: "Enforces security boundaries. Ensures a verified guest developer cannot delete active production keys or access system audit records.",
    plainEnglish: {
      analogy: "VIP Access Pass",
      analogyText: "Like showing a VIP access pass to a concert bouncer. While a standard ticket gets you inside the venue, only a VIP pass grants access backstage.",
      simplifiedText: "Authorization defines what you are allowed to click and change. It checks your account's 'rank' before completing actions on AAN."
    },
    technicalExplanation: {
      inputs: ["Client session JWT signature", "Action request definitions (e.g., delete_project)", "Target resource properties"],
      processing: ["Decodes JWT claims parameters", "Matches user role against permission tables", "Executes query validations"],
      decisionLogic: ["Reject requests immediately if user role lacks specific permission scopes", "Enforce Deny-by-Default security postures across all routes"],
      outputs: ["Access allowed or denied results", "Access denial error payloads"],
      dependencies: ["Next server-side controllers", "Roles policy mappings"],
      security: ["Policy calculations carried out inside sandboxed server memory to prevent client overrides", "SSL transport protocols"],
      dataFlow: ["Client requests resource update -> Server queries credentials role -> Resolves match -> Executes or blocks request"]
    },
    workflow: [
      "User completes authentication and clicks a restricted task",
      "Server receives request and decodes session claims",
      "Query controllers check active user rank against permission schemas",
      "If user holds appropriate scopes (e.g., Owner), task executes",
      "If disallowed, server halts processing, returning 403 Forbidden"
    ],
    databaseTables: [
      {
        name: "organization_members",
        purpose: "Saves collaborator roles mapped to respective developer teams.",
        columns: ["user_id", "organisation_id", "role"],
        relationships: "Parent relational context to team actions"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal verification checks of active platform limits.",
        auth: "Workspace Cookie Session Token",
        response: '{\n  "role": "owner",\n  "permissions": ["write:api_keys", "write:webhooks", "delete:project"]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Active workspace settings panel and admin dashboard roles controls",
      actions: ["Change developer seats ranks", "Review operational permissions matrices"],
      permissions: ["Write checks strictly limited to high-privilege Workspace Owners"],
      metrics: ["Collaborator seats used split by role classifications"]
    },
    securityModel: {
      risks: ["Client-side UI manipulation bypassing checks", "Privilege escalation attempts"],
      hiddenData: ["Internal policy validation logic keys"],
      authReq: "Supabase authenticated session",
      authzReq: "Workspace administrative role checks",
      privacy: ["Compartmentalizes administrative actions, separating client databases completely"],
      limitations: ["No integration with internal firewall bypass systems is automated."]
    },
    enterpriseValue: {
      operational: "Fosters user trust by blocking fake accounts automatically and instantly.",
      security: "Minimizes sybil vulnerability risks across scaling apps.",
      administrative: "Eases compliance checkups by auto-producing structured risk trails.",
      developer: "Allows front-end elements to adapt visually based on user privileges.",
      scalability: "Enforces consistent policy checks across global API nodes."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Static mock evaluation rules are used in sandbox files. Replace with active database policies before launch.",
    futureImprovements: [
      { title: "Bespoke Permission Schemes", phase: "Enterprise", desc: "Allow enterprise teams to define custom roles with selective visual toggles." }
    ],
    glossary: [
      { term: "RBAC", definition: "Role-Based Access Control. A method of restricting system access to authorized users based on their role in the organization." }
    ],
    knowledgeCheck: [
      {
        question: "Where should authorization rules be checked to keep them safe?",
        options: ["Strictly on your client-side React UI code", "Exclusively on your secure server-side API endpoints, ignoring client reports", "In a local text file", "On public social media forums"],
        answerIndex: 1,
        explanation: "Authorization must be verified server-side. Client-side UI files can be easily edited or bypassed by malicious actors."
      }
    ],
    relatedLessons: ["authentication", "roles_permissions", "row_level_security"]
  },
  {
    id: "privacy_model",
    title: "Privacy Model",
    category: "security-privacy",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["LandingPage", "VerifySessionFlow"],
    overview: "Formulates the secure, non-custodial privacy architecture of AAN that verifies unique human identity without ever exposing raw user traits or PII.",
    whyExists: "Prevents mass surveillance. Traditional checkers create centralized identity registries, establishing dynamic honey-pots for hackers.",
    plainEnglish: {
      analogy: "Incognito Ticket Scanner",
      analogyText: "Like taking a physical ticket, checking that the barcode is real, and letting you inside the theater without asking your name or tracking your seat.",
      simplifiedText: "AAN's Privacy Model ensures nobody can trace your internet history from your access attempt. It wipes raw logs instantly and writes only anonymous numeric hashes."
    },
    technicalExplanation: {
      inputs: ["Client session parameters", "Hardware settings vectors", "System IP identifiers"],
      processing: ["Extracts mathematical signature vectors on client", "Wipes raw posture frames in memory", "Applies high-entropy salts to hashes"],
      decisionLogic: ["Never write photos to disk", "Enforce separate database salts per project to prevent cross-app user tracking"],
      outputs: ["Anonymized validation claims", "Expired transient states"],
      dependencies: ["WASM image processors", "Crypto utilities"],
      security: ["Private keys secured inside HSM configurations", "Data minimization design principles"],
      dataFlow: ["Client posture -> Math hash generated -> Telemetry deleted -> Hashed vector saved -> Token emitted"]
    },
    workflow: [
      "User opens verification landing page screen",
      "Client initiates posture parameters sequence to run system integrity validations",
      "Local JS engines translate parameters to anonymous numeric hash arrays",
      "Complete transient parameters are entirely deleted from RAM",
      "Server saves only randomized, salted mathematical signature indexes"
    ],
    databaseTables: [
      {
        name: "signature_templates",
        purpose: "Stores math vectors securely, keeping profiles anonymous.",
        columns: ["id", "template_hash"],
        relationships: "Parent relational mappings unlinked to names"
      }
    ],
    apiEndpoints: [
      {
        method: "DELETE",
        path: "/api/v1/verification-sessions/:id",
        purpose: "Wipe user session datasets permanently.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "success": true,\n  "message": "Session and all associated signature templates successfully deleted."\n}'
      }
    ],
    dashboardIntegration: {
      location: "Consent dialog forms on scan steps & Portal compliance statistics",
      actions: ["Download technical privacy whitepapers", "Consent to local processing requirements", "Trigger manual deletions"],
      permissions: ["Shared openly with all target visitors"],
      metrics: ["Wiped visual storage capacity registries in bytes", "Average database deletion logs"]
    },
    securityModel: {
      risks: ["Hackers attempting to recreate user photos from math vectors", "Multi-app tracking trails"],
      hiddenData: ["Real names, visual face records, continuous GPS tracing coordinate logs"],
      authReq: "Explicit user consent before telemetry activation",
      authzReq: "Strict backend bounds checking",
      privacy: ["Zero raw data persistence", "Data localization using memory segments only"],
      limitations: ["Depends on user understanding consent guidelines before starting scans."]
    },
    enterpriseValue: {
      operational: "Drastically lowers customer onboarding spam fees.",
      security: "Defends platforms from massive multi-account sybil attacks.",
      administrative: "Eases privacy audit requirements since no PII is permanently held.",
      developer: "Clean REST endpoints allow visual SDK instantiation in seconds.",
      scalability: "Stateless verification servers scale concurrently via edge architecture."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Database utilizes soft controls. In enterprise setups, forward logs instantly to an external WORM (Write Once, Read Many) or append-only cloud infrastructure like AWS S3 Glacier.",
    futureImprovements: [
      { title: "Zero-Knowledge Signature Matches", phase: "Research", desc: "Run signature verifications entirely within encrypted homomorphic client sandboxes." }
    ],
    glossary: [
      { term: "Anonymization", definition: "Structuring datasets so that individual target records can never be linked back to real-world identities." }
    ],
    knowledgeCheck: [
      {
        question: "Can an AAN administrator reconstruct my physical identity from my saved database template?",
        options: ["Yes, using standard graphic editing tools", "No, templates are irreversible one-way mathematical hashes, making reconstruction impossible", "Only if the user has a high-quality browser", "Only with court-ordered search keys"],
        answerIndex: 1,
        explanation: "Signature templates are one-way vectors. They contain only numeric coordinates used for matching comparisons, and cannot be used to reconstruct human identities."
      }
    ],
    relatedLessons: ["security_model", "removal_requests", "users"]
  },
  {
    id: "security_model",
    title: "Security Model",
    category: "security-privacy",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["App", "AdminDashboard"],
    overview: "The exhaustive defense-in-depth security policies, key managements, and API limits designed to shield AAN identity services against modern cyberattacks.",
    whyExists: "Protects platform integrity. Identity services are high-value targets for attackers seeking to inject deepfakes, clone sessions, or steal user database files.",
    plainEnglish: {
      analogy: "Military Bunker Checkpoint",
      analogyText: "Like a military bunker surrounded by separate fences, guard towers, and secure locks. Passing one lock still requires verification at consecutive steps.",
      simplifiedText: "AAN's Security Model has multiple safety levels—like hashing API keys, signing certificates, and rate limiting requests, ensuring no single point of failure."
    },
    technicalExplanation: {
      inputs: ["System credentials matrices", "Encrypted data vectors", "Rate limiting configurations"],
      processing: ["HMAC signature evaluations", "SHA hashing procedures", "Active threat intelligence processing"],
      decisionLogic: ["Block requests if caller fails key audits", "Lock down project accounts if automated attack velocities spikes match anomaly standards"],
      outputs: ["Secure threat signals", "Sealed transaction objects"],
      dependencies: ["Dynamic routing firewalls", "PostgreSQL indexes"],
      security: ["All database keys are one-way hashed", "Data is encrypted in transit and at rest"],
      dataFlow: ["Client dispatches data -> API rates checked -> Key hashes matched -> SQL parameters escaped -> Output returned"]
    },
    workflow: [
      "Partner sends encrypted transaction payload to gateway paths",
      "Server checks caller quotas and parses cryptographic signatures",
      "Relational databases execute precompiled parameterized queries securely",
      "Risk engine inspects threat indicators in active sandboxed environments",
      "Detailed action records save dynamically to global immutable audit ledgers"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Permanent accountability logging for all sensitive platform adjustments.",
        columns: ["id", "action", "created_at"],
        relationships: "Links actors across system schemas"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/proofs/verify",
        purpose: "Validate/verify a proof token generated by AAN systems.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "proof_token": "ptk_aa338271e1b2f90a"\n}',
        response: '{\n  "valid": true,\n  "session_id": "vss_9a123f4b",\n  "completed_at": "2026-06-22T04:51:23Z"'
      }
    ],
    dashboardIntegration: {
      location: "Audit consoles and Overrides logs inside Admin portal overview",
      actions: ["Audit active keys", "Review threat triggers", "Rotate security secrets"],
      permissions: ["High-level actions restricted strictly to lead workspace Developers and Owners"],
      metrics: ["Active secure transaction counts", "Halted threats percentage ratios"]
    },
    securityModel: {
      risks: ["Key theft", "Replay attacks", "Insecure direct object reference (IDOR) attacks accessing unauthorized user sessions"],
      hiddenData: ["Plaintext credentials, database configurations, employee direct credentials"],
      authReq: "Mandatory system token verifications",
      authzReq: "Tenant-matched read and write scopes",
      privacy: ["One-way signature encryption guards personal records safely"],
      limitations: ["No security model guarantees complete invulnerability; we focus on minimizing risk surfaces."]
    },
    enterpriseValue: {
      operational: "Eases operations tracking, displaying traffic peaks in real-time.",
      security: "SSL encryption ensures data is secure both at rest and in transit.",
      administrative: "Eases compliance certifications via standard structured audit tables.",
      developer: "Allows front-end elements to adapt visually based on user privileges.",
      scalability: "Stateless jwt keys scale vertically cleanly across APIs."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Core security services utilize standardized express mock functions. Implement strict HSM server integrations before launching live networks.",
    futureImprovements: [
      { title: "Dynamic IP Threat Intelligence Whitelisting", phase: "Research", desc: "Sync system firewalls with active cloud threat databases dynamically." }
    ],
    glossary: [
      { term: "Defense in Depth", definition: "A security strategy employing multiple layers of control to protect data, ensuring that if one fail, others stand." }
    ],
    knowledgeCheck: [
      {
        question: "What is AAN's stance on perfect, absolute safety?",
        options: ["We guarantee absolute invulnerability across all networks", "No system is fully un-hackable; we implement strict defense-in-depth layers to minimize attack risks", "We store files in public view", "Security is only active during business hours"],
        answerIndex: 1,
        explanation: "No real-world digital architecture can guarantee perfect safety. AAN focuses on cutting down threat surfaces through layered, non-custodial structures."
      }
    ],
    relatedLessons: ["privacy_model", "row_level_security", "audit_logs"]
  },
  {
    id: "row_level_security",
    title: "Row Level Security",
    category: "infrastructure-deployment",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "PostgreSQL security matrices (RLS) defining granular permissions directly on tables, ensuring tenants can query exclusively their own rows.",
    whyExists: "Guarantees database sandboxing. Prevents multi-tenant leaks even if application-level bugs accidentally trigger wider queries.",
    plainEnglish: {
      analogy: "Safety deposit box keys",
      analogyText: "Like the bank's drawer system. While all boxes are built into the same wall, your box key physically cannot slide into or open your neighbor's drawer.",
      simplifiedText: "Row Level Security (RLS) is a rule inside the database itself. It makes sure that company A can never read or write any details belonging to company B."
    },
    technicalExplanation: {
      inputs: ["PostgreSQL table profiles", "Session role parameters", "Tenant classification keys"],
      processing: ["RLS schema audits", "Tenant constraint evaluations", "SQL parameter validation"],
      decisionLogic: ["Ensure active SQL commands dynamically append 'WHERE organization_id = active_session_org_id' in PostgreSQL memory checks", "Block root bypasses"],
      outputs: ["Strictly filtered SQL row queries", "SQL constraint rejection triggers"],
      dependencies: ["Supabase PostgreSQL engines", "Drizzle schema structures"],
      security: ["Database-level enforcement prevents application-layer code bugs from sharing datasets"],
      dataFlow: ["API sends query -> Postgres evaluates RLS constraint -> Appends tenant filters -> Returns matched records only"]
    },
    workflow: [
      "Developer logs in and requests user session statistics list",
      "API dispatches SQL query to Postgres target tables",
      "Row-Level-Security enforcer inspects active caller JWT and UUID claims",
      "Appends mandatory organization ownership checks directly within Postgres runtime",
      "Returns isolated row matching tenant ID, blocking all other customer registers"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Target table where tenant constraints are enforced.",
        columns: ["id", "partner_app_id", "organization_id"],
        relationships: "Parent organization links are checked on row queries"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Verify database table accessibility and check settings.",
        auth: "Workspace Cookie Session Token",
        response: '{\n  "rls_active": true,\n  "applied_policies": ["select_own_sessions", "insert_own_keys"]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin settings ledger and database console systems",
      actions: ["Monitor RLS rules performance", "Test row accessibility configurations"],
      permissions: ["Write checks restricted tightly to Lead DB Administrators alone"],
      metrics: ["Total active RLS policies in force", "Blocked row query exceptions count"]
    },
    securityModel: {
      risks: ["Malicious bypass of table restrictions via SQL injection checks", "Incomplete policy mappings leaving columns open"],
      hiddenData: ["Bypasses or master service keys"],
      authReq: "Supabase JWT session token verification",
      authzReq: "Checked project boundary validation",
      privacy: ["Limits database queries to explicit tenant boundaries to protect corporate confidentiality"],
      limitations: ["Relying on database engines executing RLS logic reliably under extreme query volumes."]
    },
    enterpriseValue: {
      operational: "Removes corporate legal risks regarding identity privacy liabilities.",
      security: "SSL encryption ensures data is secure both at rest and in transit.",
      administrative: "Ensures programmatic interactions are cataloged for security records.",
      developer: "Clean JSON and standard HTTP status codes simplify product implementation.",
      scalability: "Postgres partitioning supports scaling to millions of customer verification rows."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Local sandbox simulated in memory. Real-world RLS must be activated on remote Supabase consoles via SQL code directives.",
    futureImprovements: [
      { title: "Dynamic Field Level Encryption", phase: "Enterprise", desc: "Integrate specialized database columns that encrypt individual sensitive attributes." }
    ],
    glossary: [
      { term: "RLS", definition: "Row Level Security. A database feature that controls access to rows in a database table based on the user executing a query." }
    ],
    knowledgeCheck: [
      {
        question: "Where is Row Level Security (RLS) enforced?",
        options: ["In client React styling classes", "In the database engine itself, acting as a final line of defense against data bleeding", "On local employee desktop computers", "Inside public CDNs"],
        answerIndex: 1,
        explanation: "RLS operates within the database itself, ensuring data segregation remains functional even if application-layer code breaks."
      }
    ],
    relatedLessons: ["database_architecture", "supabase_integration", "security_model"]
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    category: "infrastructure-deployment",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["App"],
    overview: "The cloud execution architecture housing AAN nodes, container environments, caching networks, and multi-region database replication plans.",
    whyExists: "Guarantees system availability. Multi-tenant identity networks require extremely high uptime, resilient failovers, and geographic edge execution.",
    plainEnglish: {
      analogy: "Electrical Grid system",
      analogyText: "Like the power grid with multiple substations, backup generators, and distribution networks keeping the lights on in a storm.",
      simplifiedText: "The Infrastructure is the physical network of servers running AAN in the cloud. It ensures the system stays fast and active worldwide 24/7."
    },
    technicalExplanation: {
      inputs: ["Docker core container images", "Kubernetes cluster specifications", "CDN cache parameters"],
      processing: ["Dynamic container autoscaling", "Edge SSL termination execution", "Database query routing optimization"],
      decisionLogic: ["Autoscale API nodes when CPU use exceeds 70% bounds", "Reroute client traffic automatically if primary regions go offline"],
      outputs: ["Active cloud service nodes clusters", "System response metrics"],
      dependencies: ["GCP / AWS Cloud environments", "Docker image networks"],
      security: ["Isolated system VPCs", "DDoS mitigation systems protecting gateways"],
      dataFlow: ["Client sends packet -> Hits CDN edge -> Passes to Cloud Run nodes -> Contacts secure databases -> Returns"]
    },
    workflow: [
      "Developer pushes code modifications to master repository",
      "Automated triggers construct secure Docker container visual packages",
      "Infrastructure engines deploy packages across cloud orchestration sets",
      "Load balancers divide and direct incoming visitor sessions",
      "Database clusters sync records statefully across global zones"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Logs deployment events and operational changes.",
        columns: ["id", "action", "created_at"],
        relationships: "Independent logging schema"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/v1/verification-sessions",
        purpose: "Verify API baseline reachability.",
        auth: "Bearer Hashed Partner API Key",
        response: '{\n  "sessions": []\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Status ledger and external systems dashboards",
      actions: ["Inspect active load indices", "Review global region response statistics", "Trigger emergency failovers"],
      permissions: ["Access limited to Lead Site Reliability Engineers (SRE)"],
      metrics: ["Global system uptime percentage index", "Server CPU load distributions"]
    },
    securityModel: {
      risks: ["Targeted Distributed Denial of Service (DDoS) attempts flooding server nodes", "Server compromise exposing code configurations"],
      hiddenData: ["Cloud service accounts passwords, private VPC ports addresses"],
      authReq: "Multi-factor authenticated admin keys",
      authzReq: "Checked administrative tenant rights",
      privacy: ["Limits log metrics to system load indices, keeping personal actions hidden"],
      limitations: ["No cloud network is completely immune to global fiber-cable drops."]
    },
    enterpriseValue: {
      operational: "Drives maximum uptime guarantees (99.99%) for corporate users.",
      security: "Isolates application servers within secure firewalled private clouds.",
      administrative: "Ensures billing and usages scales with dynamic demand structures.",
      developer: "Allows immediate cloud runs without local hardware maintenance.",
      scalability: "Balances API traffic distribution limits per separate project boundary."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Code runs on sandbox containers. Real setups utilize Kubernetes clusters and multi-region database replications in the cloud.",
    futureImprovements: [
      { title: "Dynamic Cloud Region Expansion", phase: "Enterprise", desc: "Automate system deployment to local regional nodes matching local privacy regulations." }
    ],
    glossary: [
      { term: "Load Balancer", definition: "A system dividing incoming network traffic across multiple server nodes to prevent overload and ensure uptime." }
    ],
    knowledgeCheck: [
      {
        question: "How does AAN keep APIs active if a cloud node goes offline?",
        options: ["Saves them to backup flash drives", "Active load balancers automatically route incoming sessions to healthy parallel nodes", "By manual server restarts in their office", "Only does so on mobile browsers"],
        answerIndex: 1,
        explanation: "Load balancers coupled with redundant containers automatically detect failures, rerouting active sessions in sub-seconds to secure uptime."
      }
    ],
    relatedLessons: ["deployment", "monitoring", "security_model"]
  },
  {
    id: "deployment",
    title: "Deployment",
    category: "infrastructure-deployment",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["App"],
    overview: "The programmatic CI/CD pipelines and deployment processes designed to deploy AAN updates to cloud networks with zero down-time.",
    whyExists: "Ensures safe agile improvements. Development teams need to ship fixes, database tables, and features without locking users out.",
    plainEnglish: {
      analogy: "Mid-flight plane repairs",
      analogyText: "Like replacing empty seats or fixing electronics on a flying commercial airplane without having to land the plane or disrupt travelers.",
      simplifiedText: "Deployment refers to how fresh code updates go live on the cloud. AAN uses automated systems to roll updates out slowly without crashing active sessions."
    },
    technicalExplanation: {
      inputs: ["Source code updates", "Pipeline environment keys", "Docker base images"],
      processing: ["Automated unit and integration checks", "Container optimizations", "Canary deployment routing overrides"],
      decisionLogic: ["Halt deployment immediately if pipeline test suites fail", "Roll back changes automatically if system error ratios spike inside canary units"],
      outputs: ["Live running application clusters", "Completed pipeline results logs"],
      dependencies: ["GitHub Actions environments", "Docker Registry repositories"],
      security: ["Keys are stored securely in build configurations; never saved in source code files", "Vulnerability scans verify container sanity before push"],
      dataFlow: ["Dev pushes code -> Checks run -> Docker image builds -> Canary runs checks -> Traffic shifts wholly API"]
    },
    workflow: [
      "Developer triggers code push to main development branch",
      "CI/CD tests run, checking and validating syntax structures",
      "Docker creates secure optimized container release assets",
      "Canary system deploys changes to 5% of global server nodes",
      "If operational metrics approve, traffic shifts wholly to fresh updates"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Logs deployment actions and build indices.",
        columns: ["id", "action", "metadata"],
        relationships: "System logs"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal verification checks of active platform versions.",
        auth: "Workspace Cookie Session Token",
        response: '{\n  "version": "v1.1.0",\n  "status": "stable"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin logs ledger and system status displays",
      actions: ["Trigger manual pipelines", "Review historical build reports", "Initiate emergency rollbacks"],
      permissions: ["Write checks restricted tightly to lead Site Reliability Engineers (SRE)"],
      metrics: ["Build completion rate histories", "Deployment speed trends"]
    },
    securityModel: {
      risks: ["Malicious code insertions during build scripts", "Credential leaks within CI/CD automation profiles"],
      hiddenData: ["Private deployment keys, source code credentials keys"],
      authReq: "Signed cryptographic deploy tokens",
      authzReq: "Checked project boundary validation",
      privacy: ["Limits code scans to application files; zero user records logs"],
      limitations: ["Depends on security configurations of primary code repository providers."]
    },
    enterpriseValue: {
      operational: "Maintains uninterrupted humanness verification checks for customers.",
      security: "Pre-deployment checks automatically verify container integrity.",
      administrative: "Ensures regulatory compliance with SOC2 change management rules.",
      developer: "Allows rapid, hands-off releases, freeing engineering focus.",
      scalability: "Stateless container deployments support seamless capacity expansions."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Deployment steps are simulated in Sandbox local components. Real setups utilize GitHub Actions and Cloud Run pipelines.",
    futureImprovements: [
      { title: "Dynamic Automated Rollback Triggers", phase: "Research", desc: "Sync system monitoring and roll back canary builds instantly if error ratios exceed 1%." }
    ],
    glossary: [
      { term: "Canary Deployment", definition: "A deployment strategy where updates are rolled out to a small subset of servers to verify safety before global release." }
    ],
    knowledgeCheck: [
      {
        question: "What is the benefit of a Canary Deployment?",
        options: ["Makes the website load in yellow themes", "Allows verifying update safety on a tiny fraction of live users, reducing risks if bugs exist", "To save cloud hosting money", "It verifies users hold passport cards"],
        answerIndex: 1,
        explanation: "Canary deployments minimize operational risk by validating updates under a small portion of live traffic before broad rollout."
      }
    ],
    relatedLessons: ["infrastructure", "monitoring", "incident_response"]
  },
  {
    id: "monitoring",
    title: "Monitoring",
    category: "infrastructure-deployment",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["AdminDashboard"],
    overview: "Real-time diagnostic network measuring server operations, endpoint latency, database load, and transactional success rates.",
    whyExists: "Ensures operational sanity. Systems engineers must detect system anomalies, network degradations, or failed database lookups immediately.",
    plainEnglish: {
      analogy: "Intensive Care Heart Monitor",
      analogyText: "Like a bedside heart monitor in a hospital room, reporting heart-rate peaks and alerting nurses instantly if signals dip dangerously.",
      simplifiedText: "Monitoring is AAN's internal watchman. It constantly checks that pages load quickly and alerts engineers if server systems slow down."
    },
    technicalExplanation: {
      inputs: ["API route timings", "Error log occurrences", "System memory usage metrics", "Postgres active connection rates"],
      processing: ["Timestream metric compilation", "Aggregating error frequencies", "Alert threshold evaluation"],
      decisionLogic: ["Dispatch high-priority warning signals if API error rates break 3% guidelines in a sliding 5-min window", "Autoscale cache if hits dip"],
      outputs: ["Real-time system graphs", "Emergency alert notifications"],
      dependencies: ["Grafana / Prometheus systems", "Audit logger datasets"],
      security: ["Maintains secure logging buffers; avoids writing sensitive keys or user variables to log files"],
      dataFlow: ["API calls trigger metrics -> Collection agent registers timing -> Evaluates rule tables -> Alerts dispatch if broken"]
    },
    workflow: [
      "Client triggers standard verification endpoint search",
      "API timing agent logs processing duration in memory",
      "Monitoring system compiles timeseries aggregates dynamically",
      "If query timings exceed configured standards (e.g., >800ms), warning triggers",
      "Alarms alert system maintenance teams instantly via corporate networks"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Provides programmatic traces used for error diagnostics.",
        columns: ["id", "action", "created_at"],
        relationships: "Parent logs schema"
      }
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/internal/test-snapshot",
        purpose: "Internal metrics snapshots checks for health audits.",
        auth: "Workspace Session JWT",
        response: '{\n  "system_health": "excellent",\n  "api_durations_ms": 115,\n  "db_connections": 14\n}'
      }
    ],
    dashboardIntegration: {
      location: "Admin Status ledger maps and cloud maintenance consoles",
      actions: ["Toggle alarm systems thresholds", "Review hourly error clusters", "Inquire database structures metrics"],
      permissions: ["Shared openly with active support engineers and site operators"],
      metrics: ["Average API response times", "Active visitor counts", "Error distribution percentages"]
    },
    securityModel: {
      risks: ["Exposing highly detailed network system mappings to external callers", "Logging user passwords accidentally"],
      hiddenData: ["Raw user database attributes are excluded from logs entirely"],
      authReq: "Mandatory SRE login profiles",
      authzReq: "Checked project boundary validation",
      privacy: ["Limits metrics collection to overall server timing statistics, protecting user secrets"],
      limitations: ["Cannot predict hardware failures before they occur in deep cloud racks."]
    },
    enterpriseValue: {
      operational: "Identifies performance bottlenecks before they bottleneck client apps.",
      security: "Auto-detects high-velocity credential scraping or DDoS patterns.",
      administrative: "Confirms Service Level Agreements (SLA) with verifiable timeline records.",
      developer: "Makes debugging easy via structural timing trails.",
      scalability: "Runs lightweight tracing agents to prevent resource hogging."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Dashboard displays simulated static system graphs. Replace with live Prometheus metric collections or cloud logging hooks in production.",
    futureImprovements: [
      { title: "AI-Powered Anomaly Forecasts", phase: "Research", desc: "Deploy system filters to forecast and prevent server drops before they hit critical stages." }
    ],
    glossary: [
      { term: "Canary", definition: "A diagnostic script or device checking baseline platform access paths continuously to detect drops." }
    ],
    knowledgeCheck: [
      {
        question: "Why does AAN exclude private keys from system log files?",
        options: ["To save visual print space", "To prevent credential leakage, securing database systems from file sniffs", "Because logs cannot format long strings", "Only on select desktop applications"],
        answerIndex: 1,
        explanation: "Excluding private keys from system logging files shields secret keys from leaks even if diagnostic systems are compromised."
      }
    ],
    relatedLessons: ["deployment", "infrastructure", "incident_response"]
  },
  {
    id: "incident_response",
    title: "Incident Response",
    category: "infrastructure-deployment",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["App", "AdminDashboard"],
    overview: "The organizational and technological workflow processes activated during suspected platform compromises, database drops, or security anomalies.",
    whyExists: "Ensures disaster limits. Development teams need defined blueprints to seal breaches, roll back overrides, and notify compliance officers rapidly.",
    plainEnglish: {
      analogy: "Fire Drill Procedure",
      analogyText: "Like a building fire drill. Everyone knows exactly which exits to use, where to gather, and how to seal doors to protect life and property.",
      simplifiedText: "Incident Response is the fire drill. If something breaks or a hacker tries an attack, AAN has automated buttons to lock down keys and slide backup servers online."
    },
    technicalExplanation: {
      inputs: ["System breach alarms", "Security anomaly triggers", "Manual administrative overrides"],
      processing: ["Isolating affected tenant nodes", "Revoking compromised key credentials", "Spinning up clean parallel database clusters"],
      decisionLogic: ["Lock down organization keys automatically if brute-force attempts exceed limits", "Activate failover servers if primary DB connections drop"],
      outputs: ["System lockdown signals", "Disaster recovery indicators"],
      dependencies: ["VPC firewalls configurations", "Audit logging networks"],
      security: ["All dynamic security updates are logged instantly for forensic analyses", "Strict backup routines"],
      dataFlow: ["Alarms trigger lockouts -> Firewall closes ports -> Backups spin online -> Admins resolve -> Operations resume"]
    },
    workflow: [
      "Breach alarm registers suspicious administrative login steps",
      "System logs indicators and locks affected user accounts immediately",
      "SRE team initiates coordinated isolation procedures",
      "Compromised credentials and keys are revoked permanently across systems",
      "Platform restores sane database configurations using secure automatic hourly backups"
    ],
    databaseTables: [
      {
        name: "audit_logs",
        purpose: "Saves high-level forensic action timelines for security audits.",
        columns: ["id", "action", "created_at"],
        relationships: "Parent audit schema"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/proofs/verify",
        purpose: "Verify API baseline reachability.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "proof_token": "ptk_aa338271e1b2f90a"\n}',
        response: '{\n  "valid": true,\n  "session_id": "vss_9a123f4b",\n  "completed_at": "2026-06-22T04:51:23Z"'
      }
    ],
    dashboardIntegration: {
      location: "Admin settings ledger under Compliance / Audit logging pages",
      actions: ["Trigger regional shutdowns", "Initiate global credential rollbacks", "Revert system overrides"],
      permissions: ["Write checks strictly restricted to Lead System Administrators"],
      metrics: ["Mean time to resolution (MTTR) trends", "Total anomalies logged"]
    },
    securityModel: {
      risks: ["Hackers attempting to mutate active override profiles", "Unintended shutdowns during false alarms"],
      hiddenData: ["Cloud service accounts passwords, private VPC ports addresses"],
      authReq: "Mandatory system token verifications",
      authzReq: "Checked project boundary validation",
      privacy: ["One-way signature encryption guards personal records safely"],
      limitations: ["Disaster recoveries can cause minor data rollback gaps (usually under 1 hour)."]
    },
    enterpriseValue: {
      operational: "Minimizes financial and operational losses during security events.",
      security: "Shields enterprise customer accounts against system-wide bleeds.",
      administrative: "Ensures compliance checklists satisfy SOC2 regulatory requirements.",
      developer: "Allows rapid custom UI modifications with clean developer parameters.",
      scalability: "Global server grids prevent regional drops from affecting entire platforms."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Incident simulations run under soft code toggles. Production deployments integrate automated PagerDuty / Cloudflare triggers.",
    futureImprovements: [
      { title: "Dynamic Automated Key Rolling Engines", phase: "Research", desc: "Roll key credentials and update configurations instantly across all clusters during alerts." }
    ],
    glossary: [
      { term: "Disaster Recovery", definition: "The procedures and policies defined to restore system functionality and datasets after a database drop or server compromise." }
    ],
    knowledgeCheck: [
      {
        question: "What is AAN's immediate step during a suspected credential compromise?",
        options: ["Saves keys inside public folders", "Instantly revokes the compromised credential dynamically, halting all associated API access", "Changes the application background theme", "Deletes all database history tables"],
        answerIndex: 1,
        explanation: "Revoking the compromised key instantly seals the system, stopping malicious transactions while protecting parallel infrastructures."
      }
    ],
    relatedLessons: ["monitoring", "security_model", "audit_logs"]
  },
  {
    id: "verification_profiles",
    title: "Verification Profiles",
    category: "core",
    version: "v1.2.0",
    status: "Production Ready",
    relatedComponents: ["VerificationProfilesTab", "PartnerDashboard"],
    overview: "Configurable Verification Profiles empower organizations to govern which authentication and risk parameters are enabled in their workflow. We support basic, standard, high-security, custom, and dedicated industry profiles.",
    whyExists: "Enables organizations to dynamically adapt their security posture based on privacy mandates, target user expectations, and dynamic threat landscapes without rewriting any integration code.",
    plainEnglish: {
      analogy: "Security Gates at an Exhibition",
      analogyText: "Like of establishing different entrances. A VIP lounge entrance requires scanned tickets (higher security), whereas a public expo hall entrance only requires general wristbands.",
      simplifiedText: "A Verification Profile is a prepackaged group of verification rules. You can select higher security for registration endpoints, and a simpler profile for basic newsletter signs."
    },
    technicalExplanation: {
      inputs: ["Organization identifier UUID", "Target app ID mapping", "Configured signal checklist mapping"],
      processing: ["Evaluate selected signal rulesets", "Validate signature compliance mapping", "Align score factors to enabled signals"],
      decisionLogic: ["Only process actively enabled variables in the selected profiles context", "Disregard disabled or empty parameters as null without throwing validation errors"],
      outputs: ["Assigned profile configuration block", "Enforced database rule associations"],
      dependencies: ["Supabase Projects model relations", "Partner API endpoint validators"],
      security: ["Hashed verification profiles are verified server-side", "Changes are captured statefully in central immutable enterprise audit trails"],
      dataFlow: ["Admin edits profile configuration -> Saved in database schemas -> API intercepts verification queries and extracts only profiles parameters"]
    },
    workflow: [
      "Select profile inside the enterprise dashboard",
      "Assign profile to active development project IDs",
      "Verify signals expected for each verification transaction",
      "Deploy rule changes statefully across API endpoints"
    ],
    databaseTables: [
      {
        name: "verification_profiles",
        purpose: "Saves standard or custom verification rulesets.",
        columns: ["id (UUID)", "name", "description", "slug", "signals_json", "assigned_projects_ids", "created_at"],
        relationships: "Belongs to organizations, has many projects"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Initiate session obeying the configured signals validation schema.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "external_user_id": "cust_2812",\n  "verification_profile": "high_security"\n}',
        response: '{\n  "session_id": "vss_88214a",\n  "verification_url": "https://aan.trust/verify/session/vss_88214a"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Partner dashboard left side panel under 'Verification Profiles' section",
      actions: ["Create custom profile configurations", "Duplicate preconfigured templates", "Enable/disable signal parameters"],
      permissions: ["Write checks restricted exclusively to admin-level organization users"],
      metrics: ["Total verifications processed per profile", "Active profile distribution across microservices"]
    },
    securityModel: {
      risks: ["Unauthorized alterations modifying user verification limits", "Mismatched validation headers when modifying active profiles"],
      hiddenData: ["Raw organizational private parameters"],
      authReq: "Mandatory workspace auth cookie session",
      authzReq: "Checked project and administrator privileges validation",
      privacy: ["Limits collection strictly to variables configured within the assigned profile context", "Data minimizations default to enabled"],
      limitations: ["Relying fully on partner app to transmit correct external identifiers."]
    },
    enterpriseValue: {
      operational: "Eases global regulatory audits by declaring precise collection matrices.",
      security: "Hardens endpoints by requesting deeper identifiers only when dealing with high-risk pathways.",
      administrative: "Allows visual configuration of security policies without engaging development cycles.",
      developer: "Abstracts backend validation rules completely from local codebases.",
      scalability: "Facilitates multi-app scaling under unified verification schemas."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Configurations are saved statefully in local sandbox memory. Production builds store customized JSON configurations in Supabase.",
    futureImprovements: [
      { title: "Dynamic Profile Rotation", phase: "Research", desc: "Automate profile rotations if anomalous login rates surge globally." }
    ],
    glossary: [
      { term: "Signal Minimization", definition: "A privacy design practice where only the absolute minimum evidence parameters are collected to fulfill a transaction." }
    ],
    knowledgeCheck: [
      {
        question: "How do Verification Profiles improve user privacy?",
        options: ["By encrypting password sheets", "By allowing enterprises to turn off unnecessary data signals, preventing over-collection", "By sending tracking logs to credit bureaus", "They do not affect privacy"],
        answerIndex: 1,
        explanation: "By disabling unnecessary signals, organizations ensure they never request or store sensitive customer attributes."
      }
    ],
    relatedLessons: ["verification_signals", "signal_configuration", "privacy_model"]
  },
  {
    id: "verification_signals",
    title: "Verification Signals",
    category: "core",
    version: "v1.2.0",
    status: "Production Ready",
    relatedComponents: ["VerificationProfilesTab", "PartnerDashboard"],
    overview: "Verification signals are atomic evidence building blocks (Email, Phone, Device Identifier, IP Address, etc.) evaluated by AAN's Risk Engine.",
    whyExists: "AAN remains signal-driven, not data-hungry. Collecting identifiers as modular signals ensures full auditability and strict compliance with the zero-trust paradigm.",
    plainEnglish: {
      analogy: "Security Checklist",
      analogyText: "Like looking at separate markers—wrist watch, uniform style, badge, and voice—to verify an employee, rather than demanding their entire passport.",
      simplifiedText: "Signals are individual facts you send to check someone (like their email hash). AAN checks if those facts look safe, without needing to know actual secrets."
    },
    technicalExplanation: {
      inputs: ["Salted hashes", "Browser user-agent lists", "Transient connection addresses"],
      processing: ["Evaluate metadata integrity", "Match cached duplication template indexes", "Identify proxy indicators"],
      decisionLogic: ["Compare each active signal metric against custom system threat score definitions", "Calculate accumulated percentage score based on active flags"],
      outputs: ["Dynamic telemetry scores", "Anomaly flag structures"],
      dependencies: ["Risk decision models", "Cryptographic fingerprinting modules"],
      security: ["Keys and email indices are salted and SHA-hushed server-side", "Raw values are immediately expunged from memory pools"],
      dataFlow: ["Client browser posts metadata -> Server evaluates signals -> Generates trust verdict scores -> Returns signed proof claim"]
    },
    workflow: [
      "User starts onboarding pipeline",
      "Client SDK extracts active browser or device metadata",
      "Hashed variables are compiled into signal collections",
      "AAN evaluates signals statefully and returns decision token"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Caches context properties during validation sequences.",
        columns: ["id", "device_fingerprint_hash", "ip_address_truncated", "browser_agents_list"],
        relationships: "Parent session history"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions/:id/signature",
        purpose: "Send active device and template metadata for assessment.",
        auth: "Bearer Hashed Partner API Key",
        payload: '{\n  "device_fingerprint_hash": "sha256_df_8a21",\n  "platform": "Android OS"\n}',
        response: '{\n  "status": "completed",\n  "risk_score": 5\n}'
      }
    ],
    dashboardIntegration: {
      location: "Interactive request builder inside details page of profiles",
      actions: ["Toggle active verification signals", "Review signals privacy statements"],
      permissions: ["Developer and Administrator roles write authorizations"],
      metrics: ["Anomalous signal rates", "Unique signal match distributions"]
    },
    securityModel: {
      risks: ["Malicious signal spoofing via emulator scripts", "Interception of browser agent headers"],
      hiddenData: ["Raw unmodified personal user parameters"],
      authReq: "Valid secured credentials",
      authzReq: "Tenant match validations",
      privacy: ["Utilizes hashes wherever practical", "No tracking across unrelated organizational boundaries"],
      limitations: ["Browser parameters can be manipulated by advanced headless scripts."]
    },
    enterpriseValue: {
      operational: "Accelerates analysis times utilizing lightweight network requests.",
      security: "Defends platforms from massive sybil attempts prior to costly template comparisons.",
      administrative: "Satisfies compliance standards (such as GDPR) through selective collections.",
      developer: "Standardizes properties under simple JSON dictionary structures.",
      scalability: "Scales easily with minor memory overheads."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Static properties are utilized. Real implementations employ certified browser fingerprinting and device attestations.",
    futureImprovements: [
      { title: "Passkey & WebAuthn Signals", phase: "Enterprise", desc: "Integrate hardware-bound cryptographic signatures as key verification signals." }
    ],
    glossary: [
      { term: "Device Fingerprint", definition: "A unique identifier derived from client hardware, operating system, and browser configurations." }
    ],
    knowledgeCheck: [
      {
        question: "Why does AAN enforce hashed values for Email and Phone signals?",
        options: ["To slow down integration networks", "To prove uniqueness while preventing the storage of readable personal data", "Because databases cannot store text strings", "To track user location data"],
        answerIndex: 1,
        explanation: "Hashed representations confirm duplicate records dynamically while completely shielding readable user contact profiles from leaks."
      }
    ],
    relatedLessons: ["verification_profiles", "privacy_model"]
  },
  {
    id: "signal_configuration",
    title: "Signal Configuration",
    category: "security-privacy",
    version: "v1.0.0",
    status: "Production Ready",
    relatedComponents: ["VerificationProfilesTab", "PartnerDashboard"],
    overview: "Signal Configuration details how administrators bind required, optional, or ignored attributes to their customized verification pipelines.",
    whyExists: "Ensures flexibility. If a customer has a broken browser, or cannot supply a phone hash, the API dynamically ignores the missing fields without breaking the login tunnel.",
    plainEnglish: {
      analogy: "Form Customization",
      analogyText: "Like of modifying an application form. You can declare 'Phone Number' optional, so users who do not have one can still file forms safely.",
      simplifiedText: "Signal Configuration lets you declare which facts are strictly required, which ones are optional, and which ones AAN should completely ignore."
    },
    technicalExplanation: {
      inputs: ["Required signals checklist parameters", "Ignored signals definitions mapping"],
      processing: ["Evaluate requirements compliance", "Sanitize fields payload dictionary"],
      decisionLogic: ["Ensure all fields labeled as 'Required' are validly populated", "Suppress missing field errors for fields labeled 'Optional' or 'Disabled'"],
      outputs: ["Validated JSON request object", "Sanitized transaction schema"],
      dependencies: ["API payload sanitizers", "Database verification profile caches"],
      security: ["Strict server-side structural checking", "Unauthorized keys are deleted during preprocessing"],
      dataFlow: ["Client submits payload -> Configuration router verifies required fields -> Ignored fields are dropped from validation loops"]
    },
    workflow: [
      "Define requirements inside the Active Verification Profile",
      "Backend parses the submitted payload variables against active rules",
      "Risk engine runs heuristics on validly active variables",
      "Process flows seamlessly if requirements are satisfied"
    ],
    databaseTables: [
      {
        name: "verification_sessions",
        purpose: "Retains status and parameter flags during active evaluation.",
        columns: ["id", "validation_failures_json", "ignored_fields_list"],
        relationships: "Session history database"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Validate payload inputs against profile signal rules.",
        auth: "Bearer Hashed Partner API credentials",
        payload: '{\n  "external_user_id": "cust_122a",\n  "email_hash": "sha256_hash_value"\n}',
        response: '{\n  "session_id": "vss_821a3",\n  "ignored_fields": ["phone_hash", "device_fingerprint"]\n}'
      }
    ],
    dashboardIntegration: {
      location: "Interactive profile card settings panel",
      actions: ["Toggle required vs optional status", "Read signals enterprise guidance summary"],
      permissions: ["Organization Admin write authorizations"],
      metrics: ["Missing signal rate alerts", "Schema validation failure trends"]
    },
    securityModel: {
      risks: ["Missing crucial verification signals, leading to undetected malicious synthetic bots", "Malformed schemas bypassing filters"],
      hiddenData: ["Raw metadata payload fields are removed from logs entirely"],
      authReq: "MFA-validated dashboard session",
      authzReq: "Checked project and administrator boundaries",
      privacy: ["Limits system analysis to signals defined as enabled", "Completely excludes irrelevant parameters"],
      limitations: ["No automatic repair of corrupted client identifiers."]
    },
    enterpriseValue: {
      operational: "Eases global user onboarding by reducing transaction failure counts.",
      security: "Defends applications by enabling mandatory parameters on sensitive pipelines.",
      administrative: "Gives administrators control over active inputs without code change requests.",
      developer: "Ensures clear error reports on missing required fields.",
      scalability: "Processes payload variables dynamically, saving server capacity."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Schema checks are simulated. Production builds utilize formal JSON schema validation tools (such as Ajv).",
    futureImprovements: [
      { title: "Dynamic Fallback Rules", phase: "Optional", desc: "Enable automatic elevation of device fingerprint checks if phone signals are missing." }
    ],
    glossary: [
      { term: "Ignored Signal", definition: "A payload parameter that is automatically discarded by the API and excluded from risk evaluations." }
    ],
    knowledgeCheck: [
      {
        question: "What happens if a partner application submits a disabled signal parameter to the API?",
        options: ["The request immediately errors out with 400 Bad Request", "The API silently ignores and skips the parameter, processing only the enabled signals", "The user account is locked instantly", "The API rotates the corporate secret"],
        answerIndex: 1,
        explanation: "To guarantee high flexibility and prevent coding errors, disabled signals are silently ignored by AAN API gateways."
      }
    ],
    relatedLessons: ["verification_profiles", "verification_signals"]
  },

  {
    id: "request_builder",
    title: "Verification Request Builder",
    category: "developer-api",
    version: "v1.1.0",
    status: "Production Ready",
    relatedComponents: ["VerificationProfilesTab", "PartnerDashboard"],
    overview: "The Verification Request Builder is an interactive developer tool housed within the Partner Dashboard, letting programmers visually configure and test live signal-based request structures.",
    whyExists: "Eliminates documentation guesswork. Developers can instantly select custom options, preview payload bodies in real-time, copy code blocks, and test payloads statefully inside the API sandbox.",
    plainEnglish: {
      analogy: "Menu Creator Tool",
      analogyText: "Like building a catering order form. You toggle checkboxes for drinks, meals, and desserts, and see the exact price total and item list change instantly.",
      simplifiedText: "The Request Builder is a playground editor where developer teams can check click configurations and automatically receive ready-to-write backend code snippets."
    },
    technicalExplanation: {
      inputs: ["Active profile signal checklist", "Custom query values"],
      processing: ["Compile JSON payload configurations dynamically", "Translate options into curl command structures", "Integrate active API key variables"],
      decisionLogic: ["Assess which toggled signals are mandatory vs optional", "Render visual recommendations based on enterprise tier properties"],
      outputs: ["Dynamic JSON code preview block", "Testable sandbox execution models"],
      dependencies: ["Partner Dashboard UI modules", "Sandbox Tab playground structures"],
      security: ["Masks private secrets inside code previews", "Strict local variable isolation"],
      dataFlow: ["Developer toggles signal indicators -> Code block renders instantly -> Option to dispatch directly to the sandbox gateway controller"]
    },
    workflow: [
      "Navigate to the Verification Profiles panel on the Partner Portal",
      "Use the checkboxes to configure active signal rulesets",
      "Preview the dynamic payload structures and curl request models",
      "Execute stateful test dispatches directly into the sandbox ledger"
    ],
    databaseTables: [
      {
        name: "partner_apps",
        purpose: "Stores active project configuration metrics.",
        columns: ["id", "active_profile_json"],
        relationships: "Parent app environment"
      }
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/verification-sessions",
        purpose: "Dispatch payload check verifying configuration parameters.",
        auth: "Bearer Partner access credential in client header",
        payload: '{\n  "external_user_id": "cust_3321",\n  "email_hash": "sha256_hash"\n}',
        response: '{\n  "session_id": "vss_sb_1092a"\n}'
      }
    ],
    dashboardIntegration: {
      location: "Verification profiles details drawer and sidebar sections",
      actions: ["Toggle active verification signals", "Copy custom code snippets", "Simulate playground executions"],
      permissions: ["Developer and Administrator roles write authorizations"],
      metrics: ["Verification success rate predictions", "Average payload delivery benchmarks"]
    },
    securityModel: {
      risks: ["Exposing live production secret keys in code snippet exports", "Copying invalid JSON structures to production backends"],
      hiddenData: ["Actual secure salt strings, full system endpoint locations"],
      authReq: "Mandatory corporate session authentication",
      authzReq: "Checked project and administrator boundaries",
      privacy: ["Utilizes simulated mock user records within playground environments", "Raw values are shielded"],
      limitations: ["No integration with client IDEs; code blocks require copy-pasting."]
    },
    enterpriseValue: {
      operational: "Accelerates integration cycles from days to minutes.",
      security: "Mitigates security risks by ensuring developer teams employ hashed properties by default.",
      administrative: "Permits executive administrators to align security requirements with corporate scopes.",
      developer: "Solves developer onboarding friction via intuitive visual playrooms.",
      scalability: "Enables effortless copy-pasting of standardized configurations."
    },
    mvpLimitations: "MOCK IMPLEMENTATION — Previews are compiled locally. High-scale deployments import dynamic configurations from remote schemas.",
    futureImprovements: [
      { title: "Direct SDK Sync", phase: "Future Phase", desc: "Allow partner SDKs to pull active configurations from AAN registries dynamically on load." }
    ],
    glossary: [
      { term: "Payload", definition: "The central core data portion of an API request transmission, typically formatted inside balanced JSON tags." }
    ],
    knowledgeCheck: [
      {
        question: "How does the Verification Request Builder accelerate integrations?",
        options: ["By writing code automatically on the user's computer", "By compiling real-time dynamic code clips and let developers test them statefully", "By bypassing authentication steps", "By sending updates over email"],
        answerIndex: 1,
        explanation: "By translating physical selections into dynamic curl codes, developers get exact, Copy-Pasteable blueprints they can test inside sandboxes instantly."
      }
    ],
    relatedLessons: ["verification_profiles", "verification_signals", "signal_configuration"]
  }
];

export function getCompleteLessonsList(): AcademyLesson[] {
  return [...ACADEMY_LESSONS, ...OTHER_LESSONS];
}

export function findLessonById(id: string): AcademyLesson | undefined {
  return getCompleteLessonsList().find(lesson => lesson.id === id);
}

