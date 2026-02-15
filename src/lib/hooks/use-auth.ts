"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { logout as logoutApi } from "@/lib/api/auth";
import { clearAuthCookie } from "@/lib/utils/cookies";

export function useAuth() {
  const router = useRouter();
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
      // Ignore errors
    } finally {
      queryClient.clear();
      logoutStore();
      clearAuthCookie();
      router.push("/");
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
