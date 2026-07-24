/**
 * ============================================================================
 * AAN PLATFORM — CENTRALIZED ROLE-BASED ACCESS CONTROL (RBAC) LAYER
 * ============================================================================
 * This reusable authorization layer governs permission checking for internal
 * AAN Operators (the three privileged accounts) and External Partner Organizations.
 * Additional privileged accounts can be registered here in a single location.
 */

import { getSessionRole } from "./sessionManager";

// Reusable granular permission tokens
export type Permission =
  | "view_admin_dashboard"         // Access to /admin console
  | "platform_management"          // Super-admin operations
  | "organization_management"      // Global tenant and partner organization views
  | "user_management"              // View/edit all system identities and profiles
  | "api_key_management"            // Rotate or generate credential keys
  | "verification_event_management" // Access to global telemetry logs & events
  | "trust_rules_management"       // Edit auto-approve/manual-review parameters
  | "system_health"                // View VM statistics, DB status, preflight logs
  | "audit_logs"                   // Access administrative ledger
  | "internal_analytics"           // Cross-organization platform charts & metrics
  | "supabase_administration"      // Direct database state overrides & schema tools
  | "future_infrastructure_modules"; // Placeholder for scaling capabilities

// Define role types
export type UserRole = "admin" | "partner";

// High-level role definitions mapped to authorized permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_admin_dashboard",
    "platform_management",
    "organization_management",
    "user_management",
    "api_key_management",
    "verification_event_management",
    "trust_rules_management",
    "system_health",
    "audit_logs",
    "internal_analytics",
    "supabase_administration",
    "future_infrastructure_modules"
  ],
  partner: [
    "api_key_management",            // Allowed ONLY within own project scope
    "verification_event_management", // Allowed ONLY within own project scope
    "trust_rules_management"         // Allowed ONLY within own project scope
  ]
};

/**
 * Validates if the current logged-in user is an administrator based on session role.
 */
export function isPrivilegedEmail(email?: string | null | undefined): boolean {
  return getSessionRole() === "admin";
}

/**
 * Returns the resolved platform role.
 */
export function getUserRoleByEmail(email?: string | null | undefined): UserRole {
  return getSessionRole();
}

/**
 * Checks if a user is authorized to perform a specific permission.
 */
export function hasPermission(email: string | null | undefined, permission: Permission): boolean {
  const role = getSessionRole();
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Return user role display label and color configuration.
 */
export function getRoleDisplay(email?: string | null | undefined) {
  const role = getSessionRole();
  if (role === "admin") {
    return {
      label: "AAN Operator",
      badgeClass: "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20",
      description: "Internal administrative control and system ledger access."
    };
  }
  return {
    label: "External Partner",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    description: "External organization access restricted to self-owned configurations."
  };
}

