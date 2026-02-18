import { Badge } from "@/components/ui/badge";
import { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

const roleStyles: Record<string, string> = {
  admin: "border-role-admin-border bg-role-admin-bg text-role-admin",
  manager: "border-role-manager-border bg-role-manager-bg text-role-manager",
  member: "border-role-member-border bg-role-member-bg text-role-member",
  viewer: "border-role-viewer-border bg-role-viewer-bg text-role-viewer",
  free: "border-role-free-border bg-role-free-bg text-role-free",
  service: "border-role-service-border bg-role-service-bg text-role-service",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
  free: "Free",
  service: "Service",
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(roleStyles[role] ?? roleStyles.viewer, className)}
    >
      {roleLabels[role] ?? role}
    </Badge>
  );
}
