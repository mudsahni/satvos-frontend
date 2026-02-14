"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  FileText,
  FileStack,
  Upload,
  Users,
  Settings,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { QuotaIndicator } from "@/components/layout/quota-indicator";
import { useAuthStore } from "@/store/auth-store";
import { Role, isFreeUser } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems: Array<{
  label: string;
  href: string;
  icon: typeof Home;
  roles: Role[];
}> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Collections",
    href: "/collections",
    icon: FolderOpen,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Needs Attention",
    href: "/exceptions",
    icon: AlertTriangle,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Review Queue",
    href: "/review-queue",
    icon: ClipboardCheck,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
];

const settingsItems: Array<{
  label: string;
  href: string;
  icon: typeof Home;
  roles: Role[];
}> = [
  {
    label: "Team",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "manager", "member", "viewer"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const filteredSettingsItems = settingsItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Satvos"
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link href="/dashboard">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileStack className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground">Satvos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {filteredNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200 rounded-lg",
                        isActive
                          ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="transition-colors" />
                        <span className="font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarSeparator className="mb-2" />
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {filteredSettingsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200 rounded-lg",
                        isActive
                          ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="transition-colors" />
                        <span className="font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && isFreeUser(user.role) && (
        <SidebarFooter className="p-3">
          <QuotaIndicator
            used={user.documents_used_this_period ?? 0}
            limit={user.monthly_document_limit ?? 5}
          />
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
