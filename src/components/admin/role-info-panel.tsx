"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleData = [
  {
    role: "admin",
    level: 4,
    access: "Owner on ALL collections",
    capabilities: "Full control, user management, tenant settings, delete anything",
  },
  {
    role: "manager",
    level: 3,
    access: "Editor on ALL collections",
    capabilities: "Upload, create/edit/validate docs, manage tags, cannot manage users",
  },
  {
    role: "member",
    level: 2,
    access: "Viewer on ALL collections",
    capabilities: "Upload, create docs (with email verified), read access",
  },
  {
    role: "viewer",
    level: 1,
    access: "None",
    capabilities: "Read-only, needs explicit collection grants to see anything",
  },
  {
    role: "free",
    level: 0,
    access: "None",
    capabilities: "Self-registered, quota-limited, only personal collection",
  },
];

export function RoleInfoPanel({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Button
        variant="ghost"
        className="w-full justify-between px-4 py-3 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Info className="h-4 w-4 text-muted-foreground" />
          Role Hierarchy Reference
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      {isOpen && (
        <div className="border-t px-4 py-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Role</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Level</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Implicit Collection Access</th>
                  <th className="pb-2 font-medium text-muted-foreground">Key Capabilities</th>
                </tr>
              </thead>
              <tbody>
                {roleData.map((row) => (
                  <tr key={row.role} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium capitalize">{row.role}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.level}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.access}</td>
                    <td className="py-2 text-muted-foreground">{row.capabilities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
