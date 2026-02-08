"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  FolderOpen,
  Home,
  Loader2,
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
import { getDocuments } from "@/lib/api/documents";
import { getCollections } from "@/lib/api/collections";
import { fetchAllPaginated } from "@/lib/utils/fetch-all-paginated";

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

  // Fetch all documents when dialog is open (cached by TanStack Query)
  const { data: allDocuments, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", "global-search"],
    queryFn: () =>
      fetchAllPaginated(({ limit, offset }) => getDocuments({ limit, offset })),
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all collections when dialog is open
  const { data: allCollections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections", "global-search"],
    queryFn: async () => {
      const result = await getCollections({ limit: 1000 });
      return result.items;
    },
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  const isSearching = !!search.trim();
  const isLoading = isSearching && (docsLoading || collectionsLoading);

  // Group results by type
  const { pages, collections, documents } = React.useMemo(() => {
    if (!isSearching) {
      return { pages: quickNavItems, collections: [], documents: [] };
    }

    const query = search.toLowerCase();

    const pages = quickNavItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );

    const collections: SearchResult[] = (allCollections || [])
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((c) => ({
        id: `collection-${c.id}`,
        type: "collection" as const,
        title: c.name,
        description: c.description || undefined,
        icon: FolderOpen,
        href: `/collections/${c.id}`,
      }));

    const documents: SearchResult[] = (allDocuments || [])
      .filter((d) => d.name.toLowerCase().includes(query))
      .slice(0, 8)
      .map((d) => ({
        id: `document-${d.id}`,
        type: "document" as const,
        title: d.name,
        icon: FileText,
        href: `/documents/${d.id}`,
      }));

    return { pages, collections, documents };
  }, [search, isSearching, allDocuments, allCollections]);

  // Flat list for keyboard navigation
  const allResults = React.useMemo(
    () => [...pages, ...collections, ...documents],
    [pages, collections, documents]
  );

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (allResults[selectedIndex]) {
          router.push(allResults[selectedIndex].href);
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

  // Track the running flat index across sections for keyboard highlight
  let flatIndex = 0;

  const renderSection = (
    label: string,
    items: SearchResult[],
    typeLabel: string
  ) => {
    if (items.length === 0) return null;
    const startIndex = flatIndex;
    flatIndex += items.length;
    return (
      <div key={label}>
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </div>
        {items.map((result, i) => {
          const idx = startIndex + i;
          return (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                selectedIndex === idx
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              <result.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">{result.title}</div>
                {result.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {result.description}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {typeLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const hasResults = allResults.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search documents, collections, or pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {isLoading && (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {!hasResults && !isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-2">
              {!isSearching ? (
                renderSection("Quick Navigation", pages, "Page")
              ) : (
                <>
                  {renderSection("Pages", pages, "Page")}
                  {renderSection("Collections", collections, "Collection")}
                  {renderSection("Documents", documents, "Document")}
                </>
              )}
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
