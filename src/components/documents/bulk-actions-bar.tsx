"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Trash2,
  X,
  AlertTriangle,
  UserPlus,
  Download,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BulkAction = "approve" | "reject" | "delete" | "assign";

interface BulkActionResult {
  succeeded: number;
  failed: number;
}

interface ReviewStatusCounts {
  approved: number;
  rejected: number;
  pending: number;
}

interface BulkActionsBarProps {
  selectedIds: string[];
  onDeselect: () => void;
  onApprove?: (ids: string[]) => Promise<BulkActionResult>;
  onReject?: (ids: string[]) => Promise<BulkActionResult>;
  onDelete?: (ids: string[]) => Promise<BulkActionResult>;
  onAssign?: () => void;
  onDownloadSelected?: (ids: string[]) => void;
  isDownloading?: boolean;
  isProcessing?: boolean;
  reviewStatusCounts?: ReviewStatusCounts;
}

interface ResultsBanner {
  action: BulkAction;
  succeeded: number;
  failed: number;
}

const confirmConfig: Record<
  "approve" | "reject" | "delete",
  {
    title: string;
    description: string;
    actionLabel: string;
    actionClass: string;
  }
> = {
  approve: {
    title: "Approve Documents",
    description:
      "Are you sure you want to approve the selected documents? This will mark them as reviewed and verified.",
    actionLabel: "Approve All",
    actionClass: "bg-success text-success-foreground hover:bg-success/90",
  },
  reject: {
    title: "Reject Documents",
    description:
      "Are you sure you want to reject the selected documents? You may want to review them individually to add notes.",
    actionLabel: "Reject All",
    actionClass:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  delete: {
    title: "Delete Documents",
    description:
      "Are you sure you want to delete the selected documents? This action cannot be undone.",
    actionLabel: "Delete All",
    actionClass:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};

const actionLabels: Record<BulkAction, string> = {
  approve: "approved",
  reject: "rejected",
  delete: "deleted",
  assign: "assigned",
};

function getConfirmDescription(
  action: "approve" | "reject" | "delete",
  counts?: ReviewStatusCounts
): string {
  // Delete action or no counts — use the static description
  if (action === "delete" || !counts) {
    return confirmConfig[action].description;
  }

  const total = counts.approved + counts.rejected + counts.pending;
  const allPending = counts.approved === 0 && counts.rejected === 0;

  // All pending — keep simple message
  if (allPending) {
    return confirmConfig[action].description;
  }

  const parts: string[] = [];
  if (counts.approved > 0) {
    parts.push(`${counts.approved} already approved`);
  }
  if (counts.rejected > 0) {
    parts.push(`${counts.rejected} currently rejected`);
  }
  if (counts.pending > 0) {
    parts.push(`${counts.pending} pending review`);
  }

  const targetLabel = action === "approve" ? "approved" : "rejected";
  return `Of the ${total} selected document${total !== 1 ? "s" : ""}, ${parts.join(" and ")}. All ${total} will be marked as ${targetLabel}.`;
}

function getResultMessage(results: ResultsBanner): string {
  const total = results.succeeded + results.failed;
  const label = actionLabels[results.action];

  if (results.failed === 0) {
    return total === 1
      ? `1 document ${label} successfully`
      : `All ${total} documents ${label} successfully`;
  }

  if (results.succeeded === 0) {
    return total === 1
      ? `1 document failed to be ${label}`
      : `All ${total} documents failed to be ${label}`;
  }

  return `${results.succeeded} of ${total} documents ${label} successfully, ${results.failed} failed`;
}

export function BulkActionsBar({
  selectedIds,
  onDeselect,
  onApprove,
  onReject,
  onDelete,
  onAssign,
  onDownloadSelected,
  isDownloading = false,
  isProcessing = false,
  reviewStatusCounts,
}: BulkActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | "delete" | null
  >(null);
  const [results, setResults] = useState<ResultsBanner | null>(null);

  const dismissResults = useCallback(() => setResults(null), []);

  // Auto-clear results after 5 seconds
  useEffect(() => {
    if (!results) return;

    const timer = setTimeout(dismissResults, 5000);
    return () => clearTimeout(timer);
  }, [results, dismissResults]);

  const handleConfirm = async () => {
    if (!confirmAction) return;

    const action = confirmAction;
    setConfirmAction(null);

    let result: BulkActionResult;
    if (action === "approve" && onApprove) {
      result = await onApprove(selectedIds);
    } else if (action === "reject" && onReject) {
      result = await onReject(selectedIds);
    } else if (action === "delete" && onDelete) {
      result = await onDelete(selectedIds);
    } else {
      return;
    }

    setResults({
      action,
      succeeded: result.succeeded,
      failed: result.failed,
    });
  };

  const config = confirmAction ? confirmConfig[confirmAction] : null;
  const selectedCount = selectedIds.length;

  return (
    <>
      <div className="space-y-2">
        {/* Results banner */}
        {results && (
          <div
            role="status"
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              results.failed > 0
                ? "border-warning-border bg-warning-bg text-warning"
                : "border-success-border bg-success-bg text-success"
            )}
          >
            {results.failed > 0 ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="flex-1">{getResultMessage(results)}</span>
            <button
              type="button"
              onClick={dismissResults}
              className="shrink-0 rounded-md p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Dismiss results"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl border bg-muted/30 px-3 sm:px-4 py-2.5">
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedCount} selected
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselect}
            disabled={isProcessing}
          >
            <X />
            <span className="hidden sm:inline">Deselect</span>
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {onDownloadSelected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadSelected(selectedIds)}
                disabled={isProcessing || isDownloading}
              >
                {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                Download
              </Button>
            )}
            {onAssign && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAssign}
                disabled={isProcessing}
              >
                <UserPlus />
                Assign
              </Button>
            )}
            {onApprove && (
              <Button
                size="sm"
                variant="outline"
                className="border-success-border bg-success-bg text-success hover:bg-success/15 hover:text-success"
                onClick={() => setConfirmAction("approve")}
                disabled={isProcessing}
              >
                <CheckCircle />
                Approve
              </Button>
            )}
            {onReject && (
              <Button
                size="sm"
                variant="outline"
                className="border-warning-border bg-warning-bg text-warning hover:bg-warning/15 hover:text-warning"
                onClick={() => setConfirmAction("reject")}
                disabled={isProcessing}
              >
                <XCircle />
                Reject
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/15 hover:text-destructive"
                onClick={() => setConfirmAction("delete")}
                disabled={isProcessing}
              >
                <Trash2 />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction ? getConfirmDescription(confirmAction, reviewStatusCounts) : config?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={config?.actionClass}
            >
              {config?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export type { BulkActionResult };
