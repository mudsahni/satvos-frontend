"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Home,
  Search,
  Upload,
  Users,
  Settings,
  AlertTriangle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: "page" | "collection" | "document";
  title: string;
  description?: string;
  icon: typeof Home;
  href: string;
}

const quickNavItems: SearchResult[] = [
  {
    id: "dashboard",
    type: "page",
    title: "Dashboard",
    description: "Overview and stats",
    icon: Home,
    href: "/",
  },
  {
    id: "collections",
    type: "page",
    title: "Collections",
    description: "Manage document collections",
    icon: FolderOpen,
    href: "/collections",
  },
  {
    id: "documents",
    type: "page",
    title: "Documents",
    description: "View all documents",
    icon: FileText,
    href: "/documents",
  },
  {
    id: "needs-attention",
    type: "page",
    title: "Needs Attention",
    description: "Documents needing attention",
    icon: AlertTriangle,
    href: "/exceptions",
  },
  {
    id: "upload",
    type: "page",
    title: "Upload",
    description: "Upload new documents",
    icon: Upload,
    href: "/upload",
  },
  {
    id: "team",
    type: "page",
    title: "Team",
    description: "Manage team members",
    icon: Users,
    href: "/users",
  },
  {
    id: "settings",
    type: "page",
    title: "Settings",
    description: "App settings",
    icon: Settings,
    href: "/settings",
  },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredResults = React.useMemo(() => {
    if (!search.trim()) {
      return quickNavItems;
    }
    const query = search.toLowerCase();
    return quickNavItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          router.push(filteredResults[selectedIndex].href);
          onOpenChange(false);
          setSearch("");
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        setSearch("");
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search or jump to..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {search ? "Results" : "Quick Navigation"}
              </div>
              {filteredResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    selectedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <result.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.type === "page" && "Page"}
                    {result.type === "collection" && "Collection"}
                    {result.type === "document" && "Document"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">up</span>
            </kbd>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">down</span>
            </kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              enter
            </kbd>
            <span>to select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
