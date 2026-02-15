"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { clearAuthCookie } from "@/lib/utils/cookies";

interface TopNavProps {
  onSearchClick?: () => void;
}

export function TopNav({ onSearchClick }: TopNavProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, tenantSlug } = useAuthStore();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    clearAuthCookie();
    router.push("/");
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-background px-4 shadow-[0_1px_0_0_hsl(var(--border))]">
      {/* Left section: Sidebar trigger */}
      <div className="flex items-center">
        <SidebarTrigger className="-ml-1" />
      </div>

      {/* Center section: Search */}
      <div className="flex-1 max-w-lg mx-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground h-10 px-4 bg-muted/60 rounded-lg border-0 hover:bg-muted"
          onClick={onSearchClick}
        >
          <Search />
          <span className="hidden sm:inline-block">Search documents...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded-md bg-background border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Cmd</span>K
          </kbd>
        </Button>
      </div>

      {/* Right section: Workspace, Theme toggle, User */}
      <div className="flex items-center gap-2">
        {/* Workspace badge */}
        {tenantSlug && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate capitalize">{tenantSlug.replace(/-/g, " ")}</span>
          </div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 leading-none">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm">{user?.full_name || "User"}</p>
                  {user?.role && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex items-center">
                <Settings />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
