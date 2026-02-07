import { useAuthStore } from "../auth-store";
import type { User, TokenPair } from "@/types/auth";

const REMEMBER_ME_KEY = "satvos-remember-me";
const AUTH_STORAGE_KEY = "satvos-auth";

const mockUser: User = {
  id: "user-1",
  tenant_id: "tenant-1",
  email: "test@example.com",
  full_name: "Test User",
  role: "member",
  is_active: true,
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
    // Clear storage first so getBackingStorage returns sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // Reset store state
    useAuthStore.setState(initialState);
  });

  describe("login with rememberMe", () => {
    it("login with rememberMe=true sets localStorage flag", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", true);

      expect(localStorage.getItem(REMEMBER_ME_KEY)).toBe("true");
      expect(useAuthStore.getState().rememberMe).toBe(true);
    });

    it("login with rememberMe=false does not set localStorage flag", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant", false);

      expect(localStorage.getItem(REMEMBER_ME_KEY)).toBeNull();
      expect(useAuthStore.getState().rememberMe).toBe(false);
    });

    it("login with rememberMe=true calls removeItem on stale sessionStorage", () => {
      const removeItemSpy = vi.spyOn(
        Storage.prototype,
        "removeItem"
      );

      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      // The login method should remove the stale auth key from sessionStorage
      // (the non-remember-me storage). It also removes the remember-me key
      // from localStorage if rememberMe=false, but here rememberMe=true
      // so it removes the stale key from sessionStorage.
      const sessionStorageRemoveCalls = removeItemSpy.mock.calls.filter(
        ([key]) => key === AUTH_STORAGE_KEY
      );
      expect(sessionStorageRemoveCalls.length).toBeGreaterThanOrEqual(1);

      removeItemSpy.mockRestore();
    });

    it("login with rememberMe=false clears stale localStorage auth data", () => {
      // Simulate stale data in localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, "stale-data");

      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", false);

      // When rememberMe=false, stale storage is localStorage
      // The login method removes the auth key from localStorage.
      // Note: persist middleware may re-write to sessionStorage (the active store).
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });

    it("login defaults rememberMe to false when not provided", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant");

      expect(localStorage.getItem(REMEMBER_ME_KEY)).toBeNull();
      expect(useAuthStore.getState().rememberMe).toBe(false);
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
    it("logout clears localStorage remember-me flag", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      // Verify flag was set
      expect(localStorage.getItem(REMEMBER_ME_KEY)).toBe("true");

      const { logout } = useAuthStore.getState();
      logout();

      expect(localStorage.getItem(REMEMBER_ME_KEY)).toBeNull();
    });

    it("logout calls removeItem on both localStorage and sessionStorage for auth data", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant", true);

      const removeItemSpy = vi.spyOn(
        Storage.prototype,
        "removeItem"
      );

      const { logout } = useAuthStore.getState();
      logout();

      // logout should call removeItem for both AUTH_STORAGE_KEY and REMEMBER_ME_KEY
      const removedKeys = removeItemSpy.mock.calls.map(([key]) => key);
      expect(removedKeys).toContain(REMEMBER_ME_KEY);
      expect(removedKeys).toContain(AUTH_STORAGE_KEY);

      // Should be called at least twice for AUTH_STORAGE_KEY (localStorage + sessionStorage)
      const authKeyRemovals = removedKeys.filter(
        (key) => key === AUTH_STORAGE_KEY
      );
      expect(authKeyRemovals.length).toBeGreaterThanOrEqual(2);

      removeItemSpy.mockRestore();
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
});
