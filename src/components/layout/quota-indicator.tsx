"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuotaIndicatorProps {
  used: number;
  limit: number;
  className?: string;
}

export function QuotaIndicator({ used, limit, className }: QuotaIndicatorProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const atLimit = used >= limit;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", atLimit ? "text-destructive" : "text-muted-foreground")}>
          {atLimit ? "Limit reached" : `${used}/${limit} documents`}
        </span>
        <Link
          href="/#pricing"
          className="text-primary hover:underline text-[11px] font-medium"
        >
          Upgrade
        </Link>
      </div>
      <Progress
        value={percentage}
        className={cn("h-1.5", atLimit && "[&>div]:bg-destructive")}
      />
      <p className="text-[11px] text-muted-foreground">
        Free tier &middot; resets monthly
      </p>
    </div>
  );
}
