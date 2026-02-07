"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { AppFooter } from "@/components/layout/app-footer";
import { useAuthStore } from "@/store/auth-store";
import { GlobalSearch } from "@/components/search/global-search";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      // Clear stale middleware cookie so the server-side redirect kicks in too
      document.cookie = "satvos-auth-state=; path=/; max-age=0";
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

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
