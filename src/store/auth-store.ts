import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, TokenPair } from "@/types/auth";

const AUTH_STORAGE_KEY = "satvos-auth";
const SESSION_MARKER_KEY = "satvos-session-active";

/**
 * Always use localStorage so auth state is shared across tabs.
 * Falls back to a no-op store during SSR.
 */
function getBackingStorage(): Storage {
  if (typeof window === "undefined") {
    return {
      length: 0,
      clear: () => {},
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
    };
  }
  return localStorage;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  rememberMe: boolean;
  login: (tokens: TokenPair, user: User | null, tenantSlug: string, rememberMe?: boolean) => void;
  logout: () => void;
  setTokens: (tokens: Partial<TokenPair>) => void;
  setUser: (user: User) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenantSlug: null,
      isAuthenticated: false,
      isHydrated: false,
      rememberMe: false,

      login: (tokens, user, tenantSlug, rememberMe = false) => {
        if (typeof window !== "undefined") {
          if (!rememberMe) {
            // Set a session marker so we can detect browser-close on next visit.
            // sessionStorage is scoped to the tab lifetime but new tabs opened
            // via link/ctrl-click inherit it, so all tabs in the session see it.
            sessionStorage.setItem(SESSION_MARKER_KEY, "true");
          } else {
            sessionStorage.removeItem(SESSION_MARKER_KEY);
          }
        }

        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user,
          tenantSlug,
          isAuthenticated: true,
          rememberMe,
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          sessionStorage.removeItem(SESSION_MARKER_KEY);
        }

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenantSlug: null,
          isAuthenticated: false,
          rememberMe: false,
        });
      },

      setTokens: (tokens) =>
        set((state) => ({
          accessToken: tokens.access_token ?? state.accessToken,
          refreshToken: tokens.refresh_token ?? state.refreshToken,
        })),

      setUser: (user) =>
        set({
          user,
        }),

      setHydrated: (hydrated) =>
        set({
          isHydrated: hydrated,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => getBackingStorage()),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        tenantSlug: state.tenantSlug,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store hydration error:", error);
        }

        // If the user logged in without "Remember me", we placed a session
        // marker in sessionStorage. When the browser is fully closed and
        // reopened, sessionStorage is empty — the marker is gone — so we
        // know the session has ended and should clear auth data.
        if (
          typeof window !== "undefined" &&
          state?.isAuthenticated &&
          !state.rememberMe &&
          !sessionStorage.getItem(SESSION_MARKER_KEY)
        ) {
          // Session expired (browser was closed). Clear persisted data.
          localStorage.removeItem(AUTH_STORAGE_KEY);
          useAuthStore.setState({
            accessToken: null,
            refreshToken: null,
            user: null,
            tenantSlug: null,
            isAuthenticated: false,
            rememberMe: false,
            isHydrated: true,
          });
          return;
        }

        // Always set hydrated to true, even on error.
        // If state is undefined (corrupt storage), fall back to direct setState.
        if (state) {
          state.setHydrated(true);
        } else {
          useAuthStore.setState({ isHydrated: true });
        }
      },
    }
  )
);

// Selector for getting auth state outside of React components
export const getAuthState = () => useAuthStore.getState();
