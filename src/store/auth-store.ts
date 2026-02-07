import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, TokenPair } from "@/types/auth";

const REMEMBER_ME_KEY = "satvos-remember-me";
const AUTH_STORAGE_KEY = "satvos-auth";

/**
 * Check whether the user previously selected "Remember me".
 * Safe to call during SSR (returns false).
 */
function isRememberMeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

/**
 * Return the appropriate backing storage based on the remember-me flag.
 * Falls back to a no-op store during SSR.
 */
function getBackingStorage(): Storage {
  if (typeof window === "undefined") {
    // SSR no-op storage
    return {
      length: 0,
      clear: () => {},
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
    };
  }
  return isRememberMeEnabled() ? localStorage : sessionStorage;
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
          if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, "true");
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
          }

          // When switching storage mode, clear the old storage so stale data
          // doesn't linger in the storage we are moving away from.
          const staleStorage = rememberMe ? sessionStorage : localStorage;
          staleStorage.removeItem(AUTH_STORAGE_KEY);
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
          // Clear remember-me flag and auth data from both storages
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
