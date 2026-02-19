"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { useAuthStore } from "@/store/auth-store";
import { GlobalSearch } from "@/components/search/global-search";
import { needsEmailVerification } from "@/lib/constants";
import { getUser } from "@/lib/api/users";
import { clearAuthCookie } from "@/lib/utils/cookies";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const setUser = useAuthStore((s) => s.setUser);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const showVerificationBanner =
    !bannerDismissed && user && needsEmailVerification(user);

  // Check verification status immediately on mount, then poll every 30s
  useEffect(() => {
    if (!showVerificationBanner || !user) return;

    async function checkVerification() {
      try {
        const fresh = await getUser(user!.id);
        if (fresh.email_verified) {
          setUser(fresh);
        }
      } catch {
        // Silently ignore — non-critical
      }
    }

    checkVerification();

    const interval = setInterval(checkVerification, 30000);
    return () => clearInterval(interval);
  }, [showVerificationBanner, user, setUser]);

  const handleDismissBanner = useCallback(() => setBannerDismissed(true), []);

  // When the user becomes unauthenticated (logout or session expiry),
  // clear the middleware cookie so the next page navigation redirects.
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      clearAuthCookie();
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show loading state while hydrating or while redirect to login is in progress
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopNav onSearchClick={() => setSearchOpen(true)} />
          {showVerificationBanner && (
            <EmailVerificationBanner
              email={user.email}
              onDismiss={handleDismissBanner}
            />
          )}
          <SidebarInset className="flex-1 flex flex-col">
            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-muted/50 p-4 md:p-6 lg:p-8">{children}</main>
            <AppFooter />
          </SidebarInset>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
