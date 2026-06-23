import { AcademyLesson } from "./academyData";

// Define the 10 core roles
export type AcademyRole =
  | "Guest"
  | "Developer"
  | "Partner Administrator"
  | "Organization Administrator"
  | "Support"
  | "Security Analyst"
  | "Internal Engineer"
  | "Product Manager"
  | "Executive"
  | "Super Administrator";

// Define the clear visibility metadata levels
export type AcademyVisibility =
  | "Public"
  | "Developer"
  | "Partner"
  | "Organization"
  | "Support"
  | "Security"
  | "Internal"
  | "Executive"
  | "Super Admin";

export interface CustomRoleDefinition {
  name: string;
  isCustom: boolean;
  allowedLessonIds: string[]; // List of specific lesson IDs they can see
  description: string;
}

// 1. Static maps of lesson IDs to their visibility levels
export const LESSON_VISIBILITY_MAP: Record<string, AcademyVisibility> = {
  // Public Visibility Lessons (Guest accessible)
  intro: "Public",
  developer_sdk: "Public",
  partner_api: "Public",
  privacy_model: "Public",
  verification_methods: "Public",

  // Developer Lessons (Integration aspects)
  api_keys: "Developer",
  sandbox_engine: "Developer",
  webhook_system: "Developer",
  authentication: "Developer",
  authorization: "Developer",
  partner_dashboard: "Developer",
  verification_signals: "Developer",
  request_builder: "Developer",

  // Partner Lessons (Dashboard core tracking)
  organizations: "Partner",
  projects: "Partner",
  verification_sessions: "Partner",
  analytics: "Partner",
  verification_profiles: "Partner",

  // Organization Lessons (Management controls)
  organization_members: "Organization",
  roles_permissions: "Organization",
  removal_requests: "Organization",
  signal_configuration: "Organization",

  // Support Lessons (Help guides, Incident diagnostics)
  monitoring: "Support",
  incident_response: "Support",

  // Security Lessons (Audit reviews, Policy checks)
  audit_logs: "Security",
  login_policies: "Security",
  security_model: "Security",

  // Internal Lessons (Strict engineering infrastructure & math mechanics)
  database_architecture: "Internal",
  supabase_integration: "Internal",
  row_level_security: "Internal",
  infrastructure: "Internal",
  deployment: "Internal",
  risk_engine: "Internal",
  duplicate_detection: "Internal",
  device_trust: "Internal",
};

// 2. Default Access Rules mapping Roles to Visibility categories
export const ROLE_VISIBILITY_RULES: Record<AcademyRole, AcademyVisibility[]> = {
  Guest: ["Public"],
  Developer: ["Public", "Developer"],
  "Partner Administrator": ["Public", "Developer", "Partner", "Support"],
  "Organization Administrator": ["Public", "Developer", "Partner", "Organization", "Support", "Executive"],
  Support: ["Public", "Partner", "Support"],
  "Security Analyst": ["Public", "Developer", "Partner", "Support", "Security"],
  "Internal Engineer": [
    "Public",
    "Developer",
    "Partner",
    "Organization",
    "Support",
    "Security",
    "Internal",
  ],
  "Product Manager": [
    "Public",
    "Developer",
    "Partner",
    "Organization",
    "Support",
    "Security",
    "Executive",
  ],
  Executive: ["Public", "Partner", "Support", "Executive"],
  "Super Administrator": [
    "Public",
    "Developer",
    "Partner",
    "Organization",
    "Support",
    "Security",
    "Internal",
    "Executive",
    "Super Admin",
  ],
};

// 3. Database-driven dynamic permissions simulator for Custom Roles
export function getStoredCustomRoles(): Record<string, CustomRoleDefinition> {
  try {
    const data = localStorage.getItem("aan_academy_custom_roles");
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load custom roles from localStorage", e);
  }
  return {};
}

export function saveStoredCustomRoles(roles: Record<string, CustomRoleDefinition>) {
  try {
    localStorage.setItem("aan_academy_custom_roles", JSON.stringify(roles));
  } catch (e) {
    console.error("Failed to save custom roles to localStorage", e);
  }
}

// 4. Combined check evaluating if a given role has visibility over a lesson ID
export function canRoleAccessLesson(
  role: string,
  lessonId: string,
  customRoles?: Record<string, CustomRoleDefinition>
): boolean {
  // Check custom roles database first
  const activeCustomRoles = customRoles || getStoredCustomRoles();
  if (activeCustomRoles[role]) {
    return activeCustomRoles[role].allowedLessonIds.includes(lessonId);
  }

  // Fallback to static enterprise roles
  const knownRole = role as AcademyRole;
  if (!ROLE_VISIBILITY_RULES[knownRole]) {
    // If unknown role, default to Guest level (Public only)
    const requiredVis = LESSON_VISIBILITY_MAP[lessonId] || "Super Admin";
    return requiredVis === "Public";
  }

  // Standard RBAC check
  const allowedCategories = ROLE_VISIBILITY_RULES[knownRole];
  const requiredVis = LESSON_VISIBILITY_MAP[lessonId] || "Super Admin";
  return allowedCategories.includes(requiredVis);
}

// 5. Help labels explaining what roles are authorized to read which categories
export const ROLE_DESCRIPTION_MAP: Record<AcademyRole, string> = {
  Guest: "External visitors and perspective auditors. Only reads standard public guides.",
  Developer: "Backend/frontend integration programmers. Can configure API, SDKs, and sandbox systems.",
  "Partner Administrator": "Supervises standard workspace projects, metrics, and API keys.",
  "Organization Administrator": "Unrestricted administrative control over workspace teams, permissions, and policy configurations.",
  Support: "Client satisfaction SREs. Reviews diagnostics, error codes, and incident reports.",
  "Security Analyst": "Compliance, security, and threat model auditor. Enforces logging controls and verifies threat scoring policies.",
  "Internal Engineer": "Core platform devs. Direct access to databases, mathematical risk engines, orchestration, and infrastructure.",
  "Product Manager": "Defines specifications, enterprise roadmap timelines, and business feature metrics.",
  Executive: "Enjoys general strategic, analytics, and high-level reports oversight.",
  "Super Administrator": "Complete root-level control across all enterprise domains. Total unrestricted visibility.",
};
