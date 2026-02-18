"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

function NotAuthorized() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-md">
        You don&apos;t have permission to access admin pages. Only users with
        the admin role can view this section.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (!user || user.role !== "admin") {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
