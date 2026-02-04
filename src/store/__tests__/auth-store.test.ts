import { useAuthStore, getAuthState } from "../auth-store";
import type { User, TokenPair } from "@/types/auth";

// Sample test data
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
  expires_in: 3600,
  token_type: "Bearer",
};

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  tenantSlug: null,
  isAuthenticated: false,
  isHydrated: false,
};

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState(initialState);
  });

  describe("initial state", () => {
    it("has all values set to null/false", () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.tenantSlug).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(false);
    });
  });

  describe("login", () => {
    it("sets tokens, user, tenantSlug, and isAuthenticated to true", () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser, "test-tenant");

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("access-token-123");
      expect(state.refreshToken).toBe("refresh-token-456");
      expect(state.user).toEqual(mockUser);
      expect(state.tenantSlug).toBe("test-tenant");
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("logout", () => {
    it("clears everything back to initial state", () => {
      // First login to set some state
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      // Verify state is set
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Logout
      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.tenantSlug).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("setTokens", () => {
    it("updates both tokens when both are provided", () => {
      const { setTokens } = useAuthStore.getState();

      setTokens({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("new-access-token");
      expect(state.refreshToken).toBe("new-refresh-token");
    });

    it("updates only access_token and keeps existing refresh_token (partial update)", () => {
      // Set initial tokens via login
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      const { setTokens } = useAuthStore.getState();
      setTokens({ access_token: "updated-access-token" });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("updated-access-token");
      expect(state.refreshToken).toBe("refresh-token-456"); // unchanged
    });

    it("updates only refresh_token and keeps existing access_token (partial update)", () => {
      // Set initial tokens via login
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      const { setTokens } = useAuthStore.getState();
      setTokens({ refresh_token: "updated-refresh-token" });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("access-token-123"); // unchanged
      expect(state.refreshToken).toBe("updated-refresh-token");
    });

    it("keeps existing values when called with empty object", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      const { setTokens } = useAuthStore.getState();
      setTokens({});

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe("access-token-123");
      expect(state.refreshToken).toBe("refresh-token-456");
    });
  });

  describe("setUser", () => {
    it("updates the user", () => {
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it("replaces the existing user with a new one", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      const updatedUser: User = {
        ...mockUser,
        full_name: "Updated Name",
        email: "updated@example.com",
      };

      const { setUser } = useAuthStore.getState();
      setUser(updatedUser);

      const state = useAuthStore.getState();
      expect(state.user?.full_name).toBe("Updated Name");
      expect(state.user?.email).toBe("updated@example.com");
    });
  });

  describe("setHydrated", () => {
    it("sets isHydrated to true", () => {
      const { setHydrated } = useAuthStore.getState();
      setHydrated(true);

      expect(useAuthStore.getState().isHydrated).toBe(true);
    });

    it("sets isHydrated to false", () => {
      // First set to true
      useAuthStore.getState().setHydrated(true);
      expect(useAuthStore.getState().isHydrated).toBe(true);

      // Then set back to false
      useAuthStore.getState().setHydrated(false);
      expect(useAuthStore.getState().isHydrated).toBe(false);
    });
  });

  describe("getAuthState", () => {
    it("returns the current state snapshot", () => {
      const state = getAuthState();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("reflects state changes after login", () => {
      const { login } = useAuthStore.getState();
      login(mockTokens, mockUser, "test-tenant");

      const state = getAuthState();
      expect(state.accessToken).toBe("access-token-123");
      expect(state.refreshToken).toBe("refresh-token-456");
      expect(state.user).toEqual(mockUser);
      expect(state.tenantSlug).toBe("test-tenant");
      expect(state.isAuthenticated).toBe(true);
    });

    it("returns the same reference as useAuthStore.getState()", () => {
      const stateViaHelper = getAuthState();
      const stateViaDirect = useAuthStore.getState();
      expect(stateViaHelper).toBe(stateViaDirect);
    });
  });
});
