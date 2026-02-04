"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "parsing" | "validation" | "review" | "reconciliation";

type Status =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "valid"
  | "warning"
  | "invalid"
  | "approved"
  | "rejected";

interface StatusBadgeProps {
  status: Status;
  type: StatusType;
  showIcon?: boolean;
  showType?: boolean;
  className?: string;
}

const typeLabels: Record<StatusType, string> = {
  parsing: "Parsing",
  validation: "Validation",
  review: "Review",
  reconciliation: "Reconciliation",
};

const statusConfig: Record<
  Status,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "processing" | "pending";
    icon: typeof Clock;
  }
> = {
  pending: {
    label: "Pending",
    variant: "pending",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    variant: "processing",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    variant: "error",
    icon: XCircle,
  },
  valid: {
    label: "Valid",
    variant: "success",
    icon: CheckCircle,
  },
  warning: {
    label: "Warning",
    variant: "warning",
    icon: AlertTriangle,
  },
  invalid: {
    label: "Invalid",
    variant: "error",
    icon: XCircle,
  },
  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    variant: "error",
    icon: XCircle,
  },
};

export function StatusBadge(props: StatusBadgeProps) {
  const { status, type, showIcon = true, showType = false, className } = props;
  const config = statusConfig[status];
  const Icon = config.icon;
  const label = showType ? `${typeLabels[type]}: ${config.label}` : config.label;

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      {showIcon && (
        <Icon
          className={cn(
            "h-3 w-3",
            status === "processing" && "animate-spin"
          )}
        />
      )}
      {label}
    </Badge>
  );
}
