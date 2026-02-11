"use client";

import { useEffect, useState, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { useAuthStore } from "@/store/auth-store";
import { GlobalSearch } from "@/components/search/global-search";
import { needsEmailVerification } from "@/lib/constants";
import { getUser } from "@/lib/api/users";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      // Clear stale middleware cookie so the server-side redirect kicks in
      // on the next page navigation. Actual routing is handled by the
      // component that triggered the logout (e.g. handleLogout in TopNav)
      // or by handleSessionExpired in the API client.
      document.cookie = "satvos-auth-state=; path=/; max-age=0";
    }
  }, [isAuthenticated, isHydrated]);

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

  // Show loading state while hydrating or redirecting to login
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
