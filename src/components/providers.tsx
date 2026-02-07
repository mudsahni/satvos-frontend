"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { getUser } from "@/lib/api/users";
import { decodeJwtPayload } from "@/types/auth";

// Component to ensure auth hydration happens and user profile is complete
function AuthHydrationGuard({ children }: { children: React.ReactNode }) {
  const { isHydrated, setHydrated, isAuthenticated, user, accessToken, setUser } =
    useAuthStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Fallback: if not hydrated after 100ms, force hydration
    // This handles edge cases where the persist middleware fails silently
    const timeout = setTimeout(() => {
      if (!isHydrated) {
        console.warn("Auth hydration timeout - forcing hydration");
        setHydrated(true);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isHydrated, setHydrated]);

  // Refresh user profile if authenticated but missing critical fields
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || fetchedRef.current) return;
    if (user?.role && user?.full_name) return; // already complete

    // Get user ID from stored user or decode from JWT
    let userId = user?.id;
    if (!userId && accessToken) {
      const payload = decodeJwtPayload(accessToken);
      userId = (payload?.user_id ?? payload?.sub) as string | undefined;
    }
    if (!userId) return;

    fetchedRef.current = true;
    getUser(userId)
      .then((fullUser) => setUser(fullUser))
      .catch(() => {
        // Silent fail — user stays with partial data
      });
  }, [isHydrated, isAuthenticated, user, accessToken, setUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes - keeps cache for back-navigation
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="satvos-theme"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthHydrationGuard>{children}</AuthHydrationGuard>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
