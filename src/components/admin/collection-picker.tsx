"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollections } from "@/lib/hooks/use-collections";
import { Collection, getCollectionDocumentCount } from "@/types/collection";
import { cn } from "@/lib/utils";

interface CollectionPickerProps {
  value?: string;
  onSelect: (collection: Collection) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function CollectionPicker({
  value,
  onSelect,
  excludeIds = [],
  placeholder = "Select a collection...",
}: CollectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = useCollections({ limit: 100 });

  const collections = useMemo(() => {
    const items = data?.items ?? [];
    const filtered = items.filter((c) => !excludeIds.includes(c.id));
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter((c) => c.name.toLowerCase().includes(q));
  }, [data?.items, excludeIds, search]);

  const selectedCollection = data?.items.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedCollection ? selectedCollection.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {collections.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No collections found.
            </p>
          ) : (
            collections.map((col) => (
              <button
                key={col.id}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                  value === col.id && "bg-muted"
                )}
                onClick={() => {
                  onSelect(col);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === col.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{col.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCollectionDocumentCount(col)} documents
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
