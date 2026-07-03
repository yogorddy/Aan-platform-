import crypto from "crypto";

/**
 * Hash a plain-text API key using SHA-256 before comparing it with the database
 */
export function hashApiKey(apiKey: string): string {
  if (!apiKey) return "";
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Privacy-preserving hash of a partner user ID to prevent raw ID storage
 */
export function hashPartnerUserId(userId: string): string {
  if (!userId) return "";
  return crypto.createHash("sha256").update(userId).digest("hex");
}

/**
 * Generate the client-facing verification checkout URL
 */
export function createCheckoutUrl(sessionId: string): string {
  return `/verify/session/${sessionId}`;
}

/**
 * Request body validation output
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate the incoming request body for verification session creation
 */
export function validateCreateSessionBody(body: any): ValidationResult {
  if (!body) {
    return { isValid: false, error: "Request body is missing" };
  }

  // Ensure metadata, if provided, is a valid object
  if (body.metadata !== undefined && (typeof body.metadata !== "object" || body.metadata === null)) {
    return { isValid: false, error: "Optional parameter 'metadata' must be a valid JSON object" };
  }

  // Ensure redirect_url, if provided, is a valid string
  if (body.redirect_url !== undefined && typeof body.redirect_url !== "string") {
    return { isValid: false, error: "Optional parameter 'redirect_url' must be a valid string URL" };
  }

  // Ensure partner_user_id, if provided, is a string
  if (body.partner_user_id !== undefined && typeof body.partner_user_id !== "string") {
    return { isValid: false, error: "Optional parameter 'partner_user_id' must be a valid string identifier" };
  }

  return { isValid: true };
}
