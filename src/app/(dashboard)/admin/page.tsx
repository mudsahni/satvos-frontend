"use client";

import Link from "next/link";
import {
  Users,
  FolderOpen,
  Key,
  AlertTriangle,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useStats } from "@/lib/hooks/use-stats";
import { useUsers } from "@/lib/hooks/use-users";
import { useServiceAccounts } from "@/lib/hooks/use-service-accounts";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  href: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, href, loading }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/30 hover:bg-muted/30">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-semibold">{value ?? 0}</p>
            )}
            <p className="text-sm text-muted-foreground truncate">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminOverviewPage() {
  const { data: tenant, isLoading: tenantLoading } = useTenant();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 1 });
  const { data: saData, isLoading: saLoading } = useServiceAccounts({
    limit: 1,
  });

  const loading = tenantLoading || statsLoading || usersLoading || saLoading;

  return (
    <div className="space-y-6">
      <div>
        {tenantLoading ? (
          <Skeleton className="h-8 w-48 mb-1" />
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            {tenant?.name ?? "Admin"}
          </h1>
        )}
        <p className="text-muted-foreground">
          Overview of your organization
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={usersData?.total}
          icon={<Users className="h-5 w-5" />}
          href="/admin/users"
          loading={loading}
        />
        <StatCard
          label="Total Collections"
          value={stats?.total_collections}
          icon={<FolderOpen className="h-5 w-5" />}
          href="/collections"
          loading={loading}
        />
        <StatCard
          label="Service Accounts"
          value={saData?.total}
          icon={<Key className="h-5 w-5" />}
          href="/admin/service-accounts"
          loading={loading}
        />
        <StatCard
          label="Parsing Failures"
          value={stats?.parsing_failed}
          icon={<AlertTriangle className="h-5 w-5" />}
          href="/documents"
          loading={loading}
        />
        <StatCard
          label="Pending Review"
          value={stats?.review_pending}
          icon={<ClipboardCheck className="h-5 w-5" />}
          href="/review-queue"
          loading={loading}
        />
        <StatCard
          label="Validation Issues"
          value={
            stats
              ? stats.validation_invalid + stats.validation_warning
              : undefined
          }
          icon={<AlertCircle className="h-5 w-5" />}
          href="/exceptions"
          loading={loading}
        />
      </div>
    </div>
  );
}
