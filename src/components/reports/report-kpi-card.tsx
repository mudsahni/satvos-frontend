"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface ReportKpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
  loading?: boolean;
}

export function ReportKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
  loading,
}: ReportKpiCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-20 sm:w-24" />
              <Skeleton className="h-6 sm:h-7 w-24 sm:w-32" />
              {subtitle !== undefined && <Skeleton className="h-3 w-20" />}
            </div>
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className="text-lg sm:text-2xl font-semibold tracking-tight truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
