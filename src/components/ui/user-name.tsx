"use client";

import { useQuery } from "@tanstack/react-query";
import { BotMessageSquare, User } from "lucide-react";
import { getUser } from "@/lib/api/users";
import { getServiceAccount } from "@/lib/api/service-accounts";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface UserNameProps {
  id: string;
  fallback?: string;
}

/** Resolves a user or service account ID to their display name. Fires both lookups in parallel — whichever returns data first wins. */
export function UserName({ id, fallback }: UserNameProps) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
    retry: false,
  });

  const { data: serviceAccount, isLoading: saLoading } = useQuery({
    queryKey: ["service-account", id],
    queryFn: () => getServiceAccount(id),
    enabled: !!id,
    retry: false,
  });

  // Render as soon as either resolves with data — no waterfall
  if (user?.full_name) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-2.5 w-2.5 text-primary" />
        </span>
        {user.full_name}
      </span>
    );
  }

  if (serviceAccount?.name) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 cursor-default">
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-warning-bg">
              <BotMessageSquare className="h-2.5 w-2.5 text-warning" />
            </span>
            {serviceAccount.name}
          </span>
        </TooltipTrigger>
        <TooltipContent>Service account</TooltipContent>
      </Tooltip>
    );
  }

  // Still loading — show skeleton only if either could still return data
  if (userLoading || saLoading) {
    return <span className="inline-block h-3 w-16 animate-pulse rounded bg-muted" />;
  }

  // Both lookups failed (likely 403 for non-admin users) — show graceful fallback
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-2.5 w-2.5 text-muted-foreground" />
      </span>
      {fallback || "Team member"}
    </span>
  );
}
