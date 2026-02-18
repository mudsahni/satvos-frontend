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
  LayoutDashboard,
  Building2,
  Key,
  Shield,
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

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  roles: Role[];
};

const primaryItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
];

const documentItems: NavItem[] = [
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
];

const insightItems: NavItem[] = [
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "manager", "member", "viewer", "free"],
  },
];

const adminItems: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    label: "Tenant Settings",
    href: "/admin/settings",
    icon: Building2,
    roles: ["admin"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Service Accounts",
    href: "/admin/service-accounts",
    icon: Key,
    roles: ["admin"],
  },
  {
    label: "Permissions",
    href: "/admin/permissions",
    icon: Shield,
    roles: ["admin"],
  },
];

const settingsItems: NavItem[] = [
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

function filterByRole(items: NavItem[], role?: Role) {
  if (!role) return [];
  return items.filter((item) => item.roles.includes(role));
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = user?.role;
  const filteredPrimary = filterByRole(primaryItems, role);
  const filteredDocuments = filterByRole(documentItems, role);
  const filteredInsights = filterByRole(insightItems, role);
  const filteredAdmin = filterByRole(adminItems, role);
  const filteredSettings = filterByRole(settingsItems, role);

  function renderItems(items: NavItem[]) {
    return items.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
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
    });
  }

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
        {/* Primary: Dashboard + Upload */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderItems(filteredPrimary)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Documents group */}
        {filteredDocuments.length > 0 && (
          <SidebarGroup>
            <SidebarSeparator className="mb-2" />
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
              Documents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {renderItems(filteredDocuments)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Insights group */}
        {filteredInsights.length > 0 && (
          <SidebarGroup>
            <SidebarSeparator className="mb-2" />
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
              Insights
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {renderItems(filteredInsights)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin group — visible only to admins */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarSeparator className="mb-2" />
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {renderItems(filteredAdmin)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings group — pushed to bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarSeparator className="mb-2" />
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderItems(filteredSettings)}
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
