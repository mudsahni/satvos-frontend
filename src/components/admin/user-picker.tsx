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
import { useUsers } from "@/lib/hooks/use-users";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserPickerProps {
  value?: string;
  onSelect: (user: User) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function UserPicker({
  value,
  onSelect,
  excludeIds = [],
  placeholder = "Select a user...",
}: UserPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = useUsers({ limit: 100 });

  const users = useMemo(() => {
    const items = data?.items ?? [];
    const filtered = items.filter((u) => !excludeIds.includes(u.id));
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [data?.items, excludeIds, search]);

  const selectedUser = data?.items.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedUser
            ? `${selectedUser.full_name} (${selectedUser.email})`
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {users.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                  value === user.id && "bg-muted"
                )}
                onClick={() => {
                  onSelect(user);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === user.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{user.full_name}</p>
                  <p className="truncate text-muted-foreground">
                    {user.email}
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
