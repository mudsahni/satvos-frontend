import type { User } from "./user";
import type { Collection } from "./collection";
export type { User };

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

export interface LoginRequest {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
  user?: User;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

/**
 * Decode a JWT payload without verifying the signature.
 * Used to extract user_id from the access token after login.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

/**
 * The unwrapped data from POST /auth/register.
 * The backend may return tokens flat (like login) or nested in a `tokens` object.
 * The register-form handles both formats defensively.
 */
export interface RegisterResponseData {
  user: User;
  collection?: Collection;
  // Flat token format (same as LoginResponse)
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  // Nested token format
  tokens?: TokenPair;
}

export interface ForgotPasswordRequest {
  tenant_slug: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface SocialLoginRequest {
  provider: "google";
  id_token: string;
}

export interface SocialLoginResponse {
  user: User;
  collection: Collection | null;
  tokens: TokenPair;
  is_new_user: boolean;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
}
