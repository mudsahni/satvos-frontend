"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { logout as logoutApi } from "@/lib/api/auth";
import { clearAuthCookie } from "@/lib/utils/cookies";

export function useAuth() {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    accessToken,
    refreshToken,
    tenantSlug,
    logout: logoutStore,
  } = useAuthStore();

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore errors — server session cleanup is best-effort
    } finally {
      queryClient.clear();
      logoutStore();
      clearAuthCookie();
      // Full page navigation avoids race condition with dashboard layout's
      // useEffect redirect — same pattern as handleSessionExpired in client.ts
      window.location.href = "/login";
    }
  };

  return {
    user,
    isAuthenticated,
    accessToken,
    refreshToken,
    tenantSlug,
    logout,
  };
}
