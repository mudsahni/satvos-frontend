"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Tag,
  Plus,
  X,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  useDocument,
  useReviewDocument,
  useTriggerParsing,
  useTriggerValidation,
  useAddDocumentTag,
  useDeleteDocumentTag,
} from "@/lib/hooks/use-documents";
import { useFileUrl } from "@/lib/hooks/use-files";
import { StatusBadge } from "@/components/documents/status-badge";
import { PDFViewer } from "@/components/documents/pdf-viewer";
import { DocumentTabs } from "@/components/documents/document-tabs";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const isMobile = useIsMobile();

  const { data: document, isLoading } = useDocument(id);
  const { data: fileUrl, isLoading: fileLoading } = useFileUrl(document?.file_id);

  const triggerParsing = useTriggerParsing();
  const triggerValidation = useTriggerValidation();
  const reviewDocument = useReviewDocument();
  const addTag = useAddDocumentTag();
  const deleteTag = useDeleteDocumentTag();

  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    if (!document || document.parsing_status !== "completed" || document.review_status !== "pending") {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setConfirmAction("approve");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setConfirmAction("reject");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="flex-1 flex">
          <Skeleton className="flex-1" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Document not found</h3>
          <p className="text-muted-foreground">
            The document you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/documents">Back to Documents</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddTag = async () => {
    if (!newTagKey.trim() || !newTagValue.trim()) return;

    await addTag.mutateAsync({
      id: document.id,
      data: { key: newTagKey, value: newTagValue },
    });

    setNewTagKey("");
    setNewTagValue("");
    setShowAddTagDialog(false);
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag.mutateAsync({ documentId: document.id, tagId });
  };

  const handleReparse = async () => {
    await triggerParsing.mutateAsync({ id: document.id });
  };

  const handleRevalidate = async () => {
    await triggerValidation.mutateAsync(document.id);
  };

  const handleReview = async () => {
    if (!confirmAction) return;

    await reviewDocument.mutateAsync({
      id: document.id,
      data: {
        action: confirmAction,
        notes: reviewNotes || undefined,
      },
    });

    setConfirmAction(null);
    setReviewNotes("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 md:-m-6">
      {/* Compact Header */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{document.name}</h1>
            {document.collection_id && (
              <Link
                href={`/collections/${document.collection_id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                View Collection
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={document.parsing_status} type="parsing" />
          <StatusBadge status={document.validation_status} type="validation" />
          <StatusBadge status={document.review_status} type="review" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleReparse}
                disabled={triggerParsing.isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {triggerParsing.isPending ? "Re-parsing..." : "Re-parse Document"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRevalidate}
                disabled={triggerValidation.isPending || document.parsing_status !== "completed"}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {triggerValidation.isPending ? "Validating..." : "Re-validate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content - Split View */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile: Stacked tabs view
          <DocumentTabs
            document={document}
            validationResults={document.validation_results || []}
            parsingStatus={document.parsing_status}
            onRevalidate={handleRevalidate}
            isRevalidating={triggerValidation.isPending}
          />
        ) : (
          // Desktop: Split view with PDF and tabs
          <PanelGroup orientation="horizontal" className="h-full">
            {/* PDF Viewer Panel */}
            <Panel id="pdf-panel" minSize={25} defaultSize={50} className="bg-muted/30">
              <PDFViewer
                url={fileUrl}
                isLoading={fileLoading}
                fileName={document.name}
                className="h-full"
              />
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-2 group relative data-[resize-handle-active]:bg-primary/50">
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-border hover:bg-primary/30 transition-colors",
                  "cursor-col-resize"
                )}
              >
                <div className="h-8 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
              </div>
            </PanelResizeHandle>

            {/* Tabs Panel */}
            <Panel id="data-panel" minSize={30} defaultSize={50}>
              <DocumentTabs
                document={document}
                validationResults={document.validation_results || []}
                parsingStatus={document.parsing_status}
                onRevalidate={handleRevalidate}
                isRevalidating={triggerValidation.isPending}
              />
            </Panel>
          </PanelGroup>
        )}
      </div>

      {/* Compact Footer */}
      <footer className="flex items-center justify-between px-4 lg:px-6 py-3 border-t bg-background">
        {/* Tags */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin">
          {document.tags && document.tags.length > 0 ? (
            document.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1.5 shrink-0"
              >
                <Tag className="h-3 w-3" />
                <span className="font-medium">{tag.key}:</span>
                <span className="font-normal">{tag.value}</span>
                {tag.source === "user" && (
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No tags</span>
          )}

          <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tag</DialogTitle>
                <DialogDescription>
                  Add a custom tag to this document for organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-key">Key</Label>
                  <Input
                    id="tag-key"
                    placeholder="e.g., vendor, project"
                    value={newTagKey}
                    onChange={(e) => setNewTagKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-value">Value</Label>
                  <Input
                    id="tag-value"
                    placeholder="e.g., Acme Corp, Q4 2024"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddTag}
                  disabled={
                    !newTagKey.trim() ||
                    !newTagValue.trim() ||
                    addTag.isPending
                  }
                >
                  {addTag.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Review Actions */}
        {document.parsing_status === "completed" && (
          <div className="flex items-center gap-2 shrink-0">
            {document.review_status === "pending" ? (
              <>
                <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                  Press A to approve, R to reject
                </span>
                <Button
                  onClick={() => setConfirmAction("approve")}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmAction("reject")}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : (
              <Badge
                variant={document.review_status === "approved" ? "success" : "error"}
                className="py-1.5"
              >
                {document.review_status === "approved" ? (
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                )}
                {document.review_status === "approved" ? "Approved" : "Rejected"}
              </Badge>
            )}
          </div>
        )}
      </footer>

      {/* Review Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve" ? "Approve Document" : "Reject Document"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve"
                ? "Are you sure you want to approve this document? This indicates the document has been reviewed and verified."
                : "Are you sure you want to reject this document? You may want to add a note explaining the reason."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="review-notes">Notes (optional)</Label>
            <Textarea
              id="review-notes"
              placeholder="Add any notes about this review..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              className={cn(
                confirmAction === "approve"
                  ? "bg-success hover:bg-success/90 text-success-foreground"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {reviewDocument.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
