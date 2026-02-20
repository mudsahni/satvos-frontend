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

/** Resolves a user or service account ID to their display name. Tries user lookup first, falls back to service account. */
export function UserName({ id, fallback }: UserNameProps) {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });

  const userResolved = !userLoading && !user;

  const { data: serviceAccount, isLoading: saLoading } = useQuery({
    queryKey: ["service-account", id],
    queryFn: () => getServiceAccount(id),
    enabled: !!id && userResolved,
    retry: false,
  });

  if (userLoading || (userError && saLoading)) {
    return <span className="inline-block h-3 w-16 animate-pulse rounded bg-muted" />;
  }

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

  return <>{fallback || id}</>;
}
