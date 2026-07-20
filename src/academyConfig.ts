/**
 * Feature flag helper for the AAN Academy Module.
 * Decides whether the Academy is displayed in public menus, headers, footers, and dashboards.
 * 
 * Future expansion can integrate permissions, roles, or dynamic feature flag providers.
 */
export function isAcademyEnabled(): boolean {
  // Always disabled as requested by the user
  return false;
}
