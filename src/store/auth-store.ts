import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, TokenPair } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (tokens: TokenPair, user: User | null, tenantSlug: string) => void;
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

      login: (tokens, user, tenantSlug) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user,
          tenantSlug,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenantSlug: null,
          isAuthenticated: false,
        }),

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
      name: "satvos-auth",
      storage: createJSONStorage(() => {
        // Safe sessionStorage access for SSR
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return sessionStorage;
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        tenantSlug: state.tenantSlug,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store hydration error:", error);
        }
        // Always set hydrated to true, even on error
        state?.setHydrated(true);
      },
    }
  )
);

// Selector for getting auth state outside of React components
export const getAuthState = () => useAuthStore.getState();
