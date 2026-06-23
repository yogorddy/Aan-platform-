/**
 * Feature flag helper for the AAN Academy Module.
 * Decides whether the Academy is displayed in public menus, headers, footers, and dashboards.
 * 
 * Future expansion can integrate permissions, roles, or dynamic feature flag providers.
 */
export function isAcademyEnabled(): boolean {
  // 1. Check if explicitly enabled/disabled via query parameter or localStorage bypass for authorized testing
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const queryVal = urlParams.get("academy_enabled");
    if (queryVal === "true") {
      localStorage.setItem("AAN_ACADEMY_FORCE_ENABLED", "true");
      return true;
    }
    if (queryVal === "false") {
      localStorage.setItem("AAN_ACADEMY_FORCE_ENABLED", "false");
      return false;
    }
    
    const forced = localStorage.getItem("AAN_ACADEMY_FORCE_ENABLED");
    if (forced === "true") return true;
    if (forced === "false") return false;
  }

  // 2. Check compiled/runtime environment variables:
  // Precedence: VITE_ACADEMY_ENABLED > process.env.ACADEMY_ENABLED
  const viteEnv = (import.meta as any).env?.VITE_ACADEMY_ENABLED;
  if (viteEnv !== undefined) {
    return viteEnv === "true" || viteEnv === true;
  }

  const processEnv = typeof process !== "undefined" ? process.env?.ACADEMY_ENABLED : undefined;
  if (processEnv !== undefined) {
    return processEnv === "true" || processEnv === "1";
  }

  // 3. Default to disabled (hidden) when no flag is provided to focus on MVPs
  return false;
}
