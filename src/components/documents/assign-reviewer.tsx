"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserName } from "@/components/ui/user-name";
import { useUsers } from "@/lib/hooks/use-users";
import { useAssignDocument } from "@/lib/hooks/use-documents";

interface AssignReviewerProps {
  documentId: string;
  assignedTo: string | null;
  disabled?: boolean;
}

export function AssignReviewer({
  documentId,
  assignedTo,
  disabled,
}: AssignReviewerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 100 });
  const assignDocument = useAssignDocument();

  // Show all active tenant users — backend validates editor+ on assign
  const eligibleUsers = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items.filter((u) => u.is_active);
  }, [usersData]);

  // Filter by search text
  const filteredUsers = useMemo(() => {
    if (!filter) return eligibleUsers;
    const q = filter.toLowerCase();
    return eligibleUsers.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [eligibleUsers, filter]);

  const handleAssign = (userId: string) => {
    assignDocument.mutate(
      { id: documentId, data: { assignee_id: userId } },
      {
        onSuccess: () => {
          setOpen(false);
          setFilter("");
        },
      }
    );
  };

  const handleUnassign = () => {
    assignDocument.mutate({
      id: documentId,
      data: { assignee_id: null },
    });
  };

  if (assignedTo) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Assigned to</span>
        <span className="font-medium">
          <UserName id={assignedTo} />
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleUnassign}
          disabled={disabled || assignDocument.isPending}
          aria-label="Unassign reviewer"
        >
          {assignDocument.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <X />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || assignDocument.isPending}
        >
          {assignDocument.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <UserPlus />
          )}
          Assign
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        {eligibleUsers.length > 5 && (
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-8 text-sm"
              autoFocus
            />
          </div>
        )}
        <div className="max-h-48 overflow-y-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              {eligibleUsers.length === 0
                ? "No users available"
                : "No users match your filter"}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                  onClick={() => handleAssign(user.id)}
                  disabled={assignDocument.isPending}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
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
      </PopoverContent>
    </Popover>
  );
}
