/**
 * Feature flag helper for the Brand Core Module / BrandBook.
 * Decides whether the Brand Book is displayed in menus, headers, footers, and dashboards.
 */
export function isBrandEnabled(): boolean {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const queryVal = urlParams.get("brand_enabled");
    if (queryVal === "true") {
      localStorage.setItem("AAN_BRAND_FORCE_ENABLED", "true");
      return true;
    }
    if (queryVal === "false") {
      localStorage.setItem("AAN_BRAND_FORCE_ENABLED", "false");
      return false;
    }
    
    const forced = localStorage.getItem("AAN_BRAND_FORCE_ENABLED");
    if (forced === "true") return true;
    if (forced === "false") return false;
  }

  const viteEnv = (import.meta as any).env?.VITE_BRAND_ENABLED;
  if (viteEnv !== undefined) {
    return viteEnv === "true" || viteEnv === true;
  }

  const processEnv = typeof process !== "undefined" ? process.env?.BRAND_ENABLED : undefined;
  if (processEnv !== undefined) {
    return processEnv === "true" || processEnv === "1";
  }

  // Default to disabled (hidden) just like academy
  return false;
}
