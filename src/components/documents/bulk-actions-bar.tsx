"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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

type BulkAction = "approve" | "reject" | "delete";

interface BulkActionsBarProps {
  selectedCount: number;
  onDeselect: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  isProcessing?: boolean;
}

const confirmConfig: Record<
  BulkAction,
  { title: string; description: string; actionLabel: string; actionClass: string }
> = {
  approve: {
    title: "Approve Documents",
    description:
      "Are you sure you want to approve the selected documents? This will mark them as reviewed and verified.",
    actionLabel: "Approve All",
    actionClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  reject: {
    title: "Reject Documents",
    description:
      "Are you sure you want to reject the selected documents? You may want to review them individually to add notes.",
    actionLabel: "Reject All",
    actionClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  delete: {
    title: "Delete Documents",
    description:
      "Are you sure you want to delete the selected documents? This action cannot be undone.",
    actionLabel: "Delete All",
    actionClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};

export function BulkActionsBar({
  selectedCount,
  onDeselect,
  onApprove,
  onReject,
  onDelete,
  isProcessing = false,
}: BulkActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction === "approve") onApprove();
    else if (confirmAction === "reject") onReject();
    else if (confirmAction === "delete") onDelete();

    setConfirmAction(null);
  };

  const config = confirmAction ? confirmConfig[confirmAction] : null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-2.5">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselect}
          disabled={isProcessing}
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Deselect
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setConfirmAction("approve")}
            disabled={isProcessing}
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmAction("reject")}
            disabled={isProcessing}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmAction("delete")}
            disabled={isProcessing}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
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
              {config?.description}
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
