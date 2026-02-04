"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  collections: "Collections",
  documents: "Documents",
  upload: "Upload",
  users: "Users",
  settings: "Settings",
  new: "New",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav className="flex items-center gap-1 text-sm">
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment;

        // Check if segment is a UUID (for dynamic routes)
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            segment
          );

        return (
          <Fragment key={href}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium truncate max-w-[200px]">
                {isUUID ? "Details" : label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {isUUID ? "Details" : label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
