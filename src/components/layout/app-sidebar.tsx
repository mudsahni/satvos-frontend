"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  FileText,
  Upload,
  Users,
  Settings,
  AlertTriangle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems: Array<{
  label: string;
  href: string;
  icon: typeof Home;
  roles: Role[];
}> = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    label: "Collections",
    href: "/collections",
    icon: FolderOpen,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    label: "Exceptions",
    href: "/exceptions",
    icon: AlertTriangle,
    roles: ["admin", "manager", "member", "viewer"],
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
    roles: ["admin", "manager", "member", "viewer"],
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
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {filteredNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200 rounded-lg",
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        >
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
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        >
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

      <SidebarRail />
    </Sidebar>
  );
}
