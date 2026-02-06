"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  useDocument,
  useDocumentTags,
  useUpdateDocument,
  useReviewDocument,
  useTriggerParsing,
  useTriggerValidation,
  useAddDocumentTag,
  useDeleteDocumentTag,
} from "@/lib/hooks/use-documents";
import { StructuredInvoiceData } from "@/types/document";
import { useFileUrl } from "@/lib/hooks/use-files";
import { useCollection } from "@/lib/hooks/use-collections";
import { useAuthStore } from "@/store/auth-store";
import { hasRole, ROLES } from "@/lib/constants";
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
  const { user } = useAuthStore();

  const { data: document, isLoading } = useDocument(id);
  const { data: tags } = useDocumentTags(id);
  const { data: fileUrl, isLoading: fileLoading } = useFileUrl(document?.file_id);
  const { data: collection, isPending: collectionPending, isError: collectionError } = useCollection(document?.collection_id ?? "");

  const triggerParsing = useTriggerParsing();
  const triggerValidation = useTriggerValidation();
  const updateDoc = useUpdateDocument();
  const reviewDocument = useReviewDocument();
  const addTag = useAddDocumentTag();
  const deleteTag = useDeleteDocumentTag();

  const [reviewNotes, setReviewNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);

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
        setConfirmAction("approved");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setConfirmAction("rejected");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
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
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
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

  // Permission check: allow edit if user is admin/manager OR has editor/owner on the collection
  const userRole = user?.role;
  const collectionPermission = collection?.user_permission;
  const canEditData =
    (userRole && hasRole(userRole, ROLES.MEMBER)) ||
    collectionPermission === "owner" ||
    collectionPermission === "editor";

  const handleAddTag = async (key: string, value: string) => {
    await addTag.mutateAsync({
      id: document.id,
      data: { tags: { [key]: value } },
    });
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

  const handleSaveEdits = async (updatedData: StructuredInvoiceData) => {
    await updateDoc.mutateAsync({
      id: document.id,
      data: { structured_data: updatedData },
    });
    // Auto re-validate after save
    await triggerValidation.mutateAsync(document.id);
  };

  const handleReview = async () => {
    if (!confirmAction) return;

    await reviewDocument.mutateAsync({
      id: document.id,
      data: {
        status: confirmAction,
        notes: reviewNotes || undefined,
      },
    });

    setConfirmAction(null);
    setReviewNotes("");
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 md:-m-6">
      {/* Header */}
      <header className="border-b bg-background">
        {/* Breadcrumb — always visible */}
        <div className="flex items-center gap-1.5 px-4 lg:px-6 pt-3 pb-1 text-xs text-muted-foreground">
          <Link
            href="/documents"
            className="hover:text-primary transition-colors"
          >
            Documents
          </Link>
          {document.collection_id && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              {collection?.name ? (
                <Link
                  href={`/collections/${document.collection_id}`}
                  className="hover:text-primary transition-colors truncate max-w-[200px]"
                >
                  {collection.name}
                </Link>
              ) : collectionPending && !collectionError ? (
                <Skeleton className="h-3.5 w-24" />
              ) : (
                <Link
                  href={`/collections/${document.collection_id}`}
                  className="hover:text-primary transition-colors truncate max-w-[200px]"
                >
                  Collection
                </Link>
              )}
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground truncate">{document.name}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{document.name}</h1>
            {/* Status badges — inline after title, hidden on small screens */}
            <div className="hidden md:flex items-center gap-1.5 ml-1">
              <StatusBadge status={document.parsing_status} type="parsing" showType />
              <StatusBadge status={document.validation_status} type="validation" showType />
              <StatusBadge status={document.review_status} type="review" showType />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Review Actions */}
            {document.parsing_status === "completed" && (
              <>
                {document.review_status === "pending" ? (
                  <>
                    <span className="text-xs text-muted-foreground mr-1 hidden lg:inline">
                      A to approve, R to reject
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setConfirmAction("approved")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmAction("rejected")}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant={document.review_status === "approved" ? "success" : "error"}
                    className="py-1"
                  >
                    {document.review_status === "approved" ? (
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {document.review_status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                )}
              </>
            )}

            {/* Actions overflow menu — icon only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {(triggerParsing.isPending || triggerValidation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleReparse}
                  disabled={triggerParsing.isPending}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", triggerParsing.isPending && "animate-spin")} />
                  {triggerParsing.isPending ? "Re-Parsing..." : "Re-Parse"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRevalidate}
                  disabled={triggerValidation.isPending || document.parsing_status !== "completed"}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", triggerValidation.isPending && "animate-spin")} />
                  {triggerValidation.isPending ? "Re-Validating..." : "Re-Validate"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            onSaveEdits={canEditData ? handleSaveEdits : undefined}
            isSaving={updateDoc.isPending}
            tags={tags}
            onAddTag={handleAddTag}
            isAddingTag={addTag.isPending}
            onDeleteTag={handleDeleteTag}
            onReparse={handleReparse}
            isReparsing={triggerParsing.isPending}
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
                onSaveEdits={canEditData ? handleSaveEdits : undefined}
                isSaving={updateDoc.isPending}
                tags={tags}
                onAddTag={handleAddTag}
                isAddingTag={addTag.isPending}
                onDeleteTag={handleDeleteTag}
                onReparse={handleReparse}
                isReparsing={triggerParsing.isPending}
              />
            </Panel>
          </PanelGroup>
        )}
      </div>

      {/* Review Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approved" ? "Approve Document" : "Reject Document"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approved"
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
                confirmAction === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {reviewDocument.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmAction === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
