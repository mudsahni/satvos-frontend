"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Document } from "@/types/document";
import { useReviewDocument } from "@/lib/hooks/use-documents";
import { formatDate } from "@/lib/utils/format";

interface ReviewActionsProps {
  document: Document;
}

export function ReviewActions({ document }: ReviewActionsProps) {
  const [notes, setNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(
    null
  );

  const reviewDocument = useReviewDocument();

  const handleReview = async () => {
    if (!confirmAction) return;

    await reviewDocument.mutateAsync({
      id: document.id,
      data: {
        status: confirmAction,
        notes: notes || undefined,
      },
    });

    setConfirmAction(null);
    setNotes("");
  };

  // Already reviewed
  if (document.review_status !== "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {document.review_status === "approved" ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <XCircle className="h-6 w-6 text-error" />
            )}
            <div>
              <p className="font-medium capitalize">{document.review_status}</p>
              {document.reviewed_at && (
                <p className="text-sm text-muted-foreground">
                  Reviewed on {formatDate(document.reviewed_at)}
                </p>
              )}
            </div>
          </div>
          {document.reviewer_notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <Label className="text-muted-foreground">Review Notes</Label>
              <p className="mt-1">{document.reviewer_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Review Document</CardTitle>
          <CardDescription>
            Approve or reject this document after reviewing the parsed data and
            validation results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmAction("approved")}
              className="border-success-border bg-success-bg text-success hover:bg-success/15 hover:text-success"
            >
              <CheckCircle />
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmAction("rejected")}
              className="border-warning-border bg-warning-bg text-warning hover:bg-warning/15 hover:text-warning"
            >
              <XCircle />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approved"
                ? "Approve Document"
                : "Reject Document"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approved"
                ? "Are you sure you want to approve this document? This indicates the document has been reviewed and verified."
                : "Are you sure you want to reject this document? You may want to add a note explaining the reason."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              className={
                confirmAction === "approved"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {reviewDocument.isPending && (
                <Loader2 className="animate-spin" />
              )}
              {confirmAction === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
