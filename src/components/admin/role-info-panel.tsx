"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <Info className="text-muted-foreground" />
          Role Hierarchy Reference
        </span>
        {isOpen ? (
          <ChevronDown className="text-muted-foreground" />
        ) : (
          <ChevronRight className="text-muted-foreground" />
        )}
      </Button>
      {isOpen && (
        <div className="border-t px-4 py-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm normal-case tracking-normal">Role</TableHead>
                <TableHead className="text-sm normal-case tracking-normal">Level</TableHead>
                <TableHead className="text-sm normal-case tracking-normal">Implicit Collection Access</TableHead>
                <TableHead className="text-sm normal-case tracking-normal">Key Capabilities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleData.map((row) => (
                <TableRow key={row.role}>
                  <TableCell className="font-medium capitalize">{row.role}</TableCell>
                  <TableCell className="text-muted-foreground">{row.level}</TableCell>
                  <TableCell className="text-muted-foreground">{row.access}</TableCell>
                  <TableCell className="text-muted-foreground">{row.capabilities}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
