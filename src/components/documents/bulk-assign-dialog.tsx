"use client";

import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUsers } from "@/lib/hooks/use-users";

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (userId: string) => void;
  isProcessing?: boolean;
}

export function BulkAssignDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isProcessing,
}: BulkAssignDialogProps) {
  const [filter, setFilter] = useState("");

  const { data: usersData, isLoading } = useUsers({ limit: 100 });

  const eligibleUsers = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items.filter((u) => u.is_active);
  }, [usersData]);

  const filteredUsers = useMemo(() => {
    if (!filter) return eligibleUsers;
    const q = filter.toLowerCase();
    return eligibleUsers.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [eligibleUsers, filter]);

  const handleSelect = (userId: string) => {
    onConfirm(userId);
    setFilter("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Reviewer</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a reviewer to assign to {selectedCount} selected document
            {selectedCount !== 1 ? "s" : ""}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {eligibleUsers.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        )}

        <div className="max-h-60 overflow-y-auto -mx-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {eligibleUsers.length === 0
                ? "No users available"
                : "No users match your filter"}
            </p>
          ) : (
            <div className="space-y-0.5 px-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent transition-colors disabled:opacity-50"
                  onClick={() => handleSelect(user.id)}
                  disabled={isProcessing}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
