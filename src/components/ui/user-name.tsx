"use client";

import { useUser } from "@/lib/hooks/use-users";

interface UserNameProps {
  id: string;
  fallback?: string;
}

/** Resolves a user ID to their full name. Shows a brief skeleton while loading, falls back to the raw ID on error. */
export function UserName({ id, fallback }: UserNameProps) {
  const { data: user, isLoading } = useUser(id);

  if (isLoading) {
    return <span className="inline-block h-3 w-16 animate-pulse rounded bg-muted" />;
  }

  return <>{user?.full_name || fallback || id}</>;
}
