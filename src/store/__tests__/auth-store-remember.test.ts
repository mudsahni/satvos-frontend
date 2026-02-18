import { useAuthStore } from "../auth-store";
import type { User, TokenPair } from "@/types/auth";

const AUTH_STORAGE_KEY = "satvos-auth";
const SESSION_MARKER_KEY = "satvos-session-active";

const mockUser: User = {
  id: "user-1",
  tenant_id: "tenant-1",
  email: "test@example.com",
  full_name: "Test User",
  role: "member",
  is_active: true,
  email_verified: true,
  email_verified_at: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockTokens: TokenPair = {
  access_token: "access-token-123",
  refresh_token: "refresh-token-456",
  expires_at: "2025-12-31T23:59:59Z",
};

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  tenantSlug: null,
  isAuthenticated: false,
  isHydrated: false,
  rememberMe: false,
};

describe("useAuthStore remember me", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState(initialState);
  });

  describe("login with rememberMe", () => {
    it("login with rememberMe=false sets session marker in sessionStorage", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", false);

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBe("true");
      expect(useAuthStore.getState().rememberMe).toBe(false);
    });

    it("login with rememberMe=true removes session marker", () => {
      // Pre-set a session marker
      sessionStorage.setItem(SESSION_MARKER_KEY, "true");

      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBeNull();
      expect(useAuthStore.getState().rememberMe).toBe(true);
    });

    it("login defaults rememberMe to false when not provided", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant");

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBe("true");
      expect(useAuthStore.getState().rememberMe).toBe(false);
    });

    it("login always stores auth data in localStorage", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", false);

      // Auth data should be in localStorage regardless of rememberMe
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.accessToken).toBe("access-token-123");
    });

    it("login with rememberMe=true also stores in localStorage", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", true);

      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.isAuthenticated).toBe(true);
    });

    it("login with rememberMe=true sets isAuthenticated to true", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe("access-token-123");
      expect(state.refreshToken).toBe("refresh-token-456");
      expect(state.user).toEqual(mockUser);
      expect(state.tenantSlug).toBe("test-tenant");
    });
  });

  describe("logout clears storage", () => {
    it("logout removes session marker from sessionStorage", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", false);

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBe("true");

      const { logout } = useAuthStore.getState();
      logout();

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBeNull();
    });

    it("logout clears auth data in localStorage", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      const { logout } = useAuthStore.getState();
      logout();

      // Zustand persist middleware re-writes the (now empty) state, so
      // localStorage won't be null — but the stored data is logged-out.
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.isAuthenticated).toBe(false);
        expect(parsed.state.accessToken).toBeNull();
      }
    });

    it("logout resets rememberMe state to false", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      expect(useAuthStore.getState().rememberMe).toBe(true);

      const { logout } = useAuthStore.getState();
      logout();

      expect(useAuthStore.getState().rememberMe).toBe(false);
    });

    it("logout clears all auth state", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.tenantSlug).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.rememberMe).toBe(false);
    });
  });

  describe("session marker and rehydration", () => {
    it("session marker is absent after browser restart simulation (sessionStorage cleared)", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", false);

      // Verify marker was set
      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBe("true");

      // Simulate browser restart: sessionStorage is cleared
      sessionStorage.clear();

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBeNull();
    });

    it("session marker persists within the same session", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", false);

      // Within the same session, marker should persist
      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBe("true");
    });

    it("rememberMe=true does not set session marker", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      expect(sessionStorage.getItem(SESSION_MARKER_KEY)).toBeNull();
    });
  });
});
