/**
 * ============================================================================
 * AAN PLATFORM — SECURE ENCODED SESSION MANAGER MODULE
 * ============================================================================
 * This helper isolates session and authentication states, encoding data and
 * replacing any direct localStorage 'aan_authenticated' or 'aan_user_email' keys.
 */

export interface UserSession {
  email: string;
  role: "admin" | "partner";
  orgName: string;
  authenticatedAt: number;
}

const SECURE_SESSION_KEY = "_aan_secured_payload_v1";

export function getSecureSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SECURE_SESSION_KEY);
    if (!raw) return null;
    
    // Simple Base64 decode to obscure the values and avoid raw text leakage
    const jsonStr = atob(raw);
    const session = JSON.parse(jsonStr) as UserSession;
    
    // Session is valid for 24 hours
    const age = Date.now() - session.authenticatedAt;
    if (age > 24 * 60 * 60 * 1000) {
      clearSecureSession();
      return null;
    }
    
    return session;
  } catch (err) {
    console.warn("[SESSION MANAGER] Error parsing secure session:", err);
    return null;
  }
}

export function setSecureSession(email: string, role: "admin" | "partner", orgName: string): void {
  try {
    const session: UserSession = {
      email: email.trim(),
      role,
      orgName: orgName || "",
      authenticatedAt: Date.now()
    };
    
    const jsonStr = JSON.stringify(session);
    const raw = btoa(jsonStr);
    localStorage.setItem(SECURE_SESSION_KEY, raw);
  } catch (err) {
    console.error("[SESSION MANAGER] Error setting secure session:", err);
  }
}

export function clearSecureSession(): void {
  localStorage.removeItem(SECURE_SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getSecureSession() !== null;
}

export function getSessionEmail(): string | null {
  const session = getSecureSession();
  return session ? session.email : null;
}

export function getSessionRole(): "admin" | "partner" {
  const session = getSecureSession();
  return session ? session.role : "partner";
}

export function getSessionOrgName(): string {
  const session = getSecureSession();
  return session ? session.orgName : "";
}
