"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  AlertCircle,
  FolderUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QuotaIndicator } from "@/components/layout/quota-indicator";
import { UpgradeDialog } from "@/components/ui/upgrade-dialog";
import { useCollections, useCreateCollection } from "@/lib/hooks/use-collections";
import { useUpload, FileToUpload } from "@/lib/hooks/use-upload";
import { useAuthStore } from "@/store/auth-store";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, ParseMode, isFreeUser, canCreateCollections } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils/format";

type CollectionMode = "new" | "existing";

const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_FILE_TYPES);

function getFileTypeLabel(file: File): string {
  if (file.type === "application/pdf") return "PDF";
  if (file.type === "image/jpeg") return "JPEG";
  if (file.type === "image/png") return "PNG";
  return file.name.split(".").pop()?.toUpperCase() || "FILE";
}

export default function UploadPage() {
  return (
    <Suspense fallback={<UploadPageSkeleton />}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCollectionId = searchParams.get("collection");
  const user = useAuthStore((state) => state.user);
  const showQuota = user && isFreeUser(user.role);
  const canCreate = user ? canCreateCollections(user.role) : true;

  // Upgrade dialog state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Collection state — free users default to "existing" since they can't create collections
  const [collectionMode, setCollectionMode] = useState<CollectionMode>(
    preselectedCollectionId || !canCreate ? "existing" : "new"
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    preselectedCollectionId || ""
  );
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  // Files state
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);

  // Options
  const [parseMode, setParseMode] = useState<ParseMode>("single");

  // Hooks
  const { data: collectionsData, isLoading: collectionsLoading } =
    useCollections({ limit: 100 });
  const createCollection = useCreateCollection();
  const { uploads, isUploading, uploadFiles, clearUploads } = useUpload();

  const collections = useMemo(() => collectionsData?.items || [], [collectionsData]);

  // Sync preselected collection after collections load
  // Handles SSR hydration edge case where useSearchParams may be empty during SSR
  useEffect(() => {
    if (preselectedCollectionId && collections.length > 0) {
      const exists = collections.some((c) => c.id === preselectedCollectionId);
      if (exists) {
        setSelectedCollectionId(preselectedCollectionId);
        setCollectionMode("existing");
      }
    }
  }, [preselectedCollectionId, collections]);

  // Auto-select the personal collection for free users
  useEffect(() => {
    if (!canCreate && collections.length > 0 && !selectedCollectionId) {
      // Try to use the stored personal collection from registration
      const personalCollectionId = localStorage.getItem("satvos_personal_collection_id");
      if (personalCollectionId && collections.some((c) => c.id === personalCollectionId)) {
        setSelectedCollectionId(personalCollectionId);
      } else if (collections.length === 1) {
        // Free users typically have exactly one collection
        setSelectedCollectionId(collections[0].id);
      }
    }
  }, [canCreate, collections, selectedCollectionId]);

  // Selection helpers
  const selectedCount = useMemo(
    () => files.filter((f) => f.selected).length,
    [files]
  );
  const allSelected = files.length > 0 && selectedCount === files.length;
  const someSelected = selectedCount > 0 && selectedCount < files.length;

  const toggleSelectAll = useCallback(() => {
    const newSelected = !allSelected;
    setFiles((prev) => prev.map((f) => ({ ...f, selected: newSelected })));
  }, [allSelected]);

  const toggleFileSelected = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  }, []);

  const updateDocumentName = useCallback((id: string, name: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, documentName: name } : f))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Filter to accepted mime types (handles folder drops where some files may pass through)
      const validFiles = acceptedFiles.filter((f) =>
        ACCEPTED_MIME_TYPES.includes(f.type)
      );
      const skipped =
        acceptedFiles.length - validFiles.length + fileRejections.length;

      if (skipped > 0) {
        setSkippedCount((prev) => prev + skipped);
      }

      const newFiles: FileToUpload[] = validFiles.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        selected: true,
        documentName: f.name.replace(/\.[^/.]+$/, ""),
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    noClick: false,
  });

  const handleUpload = async () => {
    let collectionId = selectedCollectionId;

    // Create new collection if needed
    if (collectionMode === "new") {
      if (!newCollectionName.trim()) return;
      try {
        const newCollection = await createCollection.mutateAsync({
          name: newCollectionName,
          description: newCollectionDescription || undefined,
        });
        collectionId = newCollection.id;
      } catch {
        // Error toast shown by the mutation hook
        return;
      }
    }

    if (!collectionId || selectedCount === 0) return;

    const results = await uploadFiles(files, {
      collectionId,
      parseMode,
    });

    // Check for quota exceeded (429) errors
    const quotaExceeded = results.some(
      (r) => r.error && (r.error.includes("quota") || r.error.includes("limit") || r.error.includes("429"))
    );
    if (quotaExceeded && showQuota) {
      setShowUpgradeDialog(true);
      return;
    }

    // Redirect to collection page if all succeeded
    const allSucceeded = results.every((r) => !r.error);
    if (allSucceeded && results.length > 0) {
      // Small delay so the user can see the completed state
      setTimeout(() => {
        router.push(`/collections/${collectionId}`);
      }, 1000);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setSkippedCount(0);
    clearUploads();
  };

  const isFormValid =
    (collectionMode === "new" ? newCollectionName.trim().length > 0 : !!selectedCollectionId) &&
    selectedCount > 0;

  const allCompleted =
    uploads.length > 0 &&
    uploads.every(([, upload]) => upload.status === "completed");

  const hasErrors = uploads.some(([, upload]) => upload.status === "error");

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-error" />;
      case "uploading":
      case "creating_document":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quota indicator for free users */}
      {showQuota && (
        <QuotaIndicator
          used={user.documents_used_this_period ?? 0}
          limit={user.monthly_document_limit ?? 5}
          className="rounded-lg border border-border bg-card p-4"
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground">
          Create a collection and upload documents for processing
        </p>
      </div>

      {/* Collection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collection</CardTitle>
          <CardDescription>
            Choose where to store your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radio toggle for Create New / Use Existing */}
          {canCreate ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={collectionMode === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setCollectionMode("new")}
                disabled={isUploading}
              >
                Create New
              </Button>
              <Button
                type="button"
                variant={collectionMode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setCollectionMode("existing")}
                disabled={isUploading}
              >
                Use Existing
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Upload to your personal collection
            </p>
          )}

          {collectionMode === "new" ? (
            <div className="space-y-4 border rounded-xl p-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">
                  Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="collection-name"
                  placeholder="e.g., Q4 2024 Invoices"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-description">
                  Description <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="collection-description"
                  placeholder="Brief description of this collection"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  disabled={isUploading}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="collection">Collection</Label>
              {collectionsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedCollectionId}
                  onValueChange={setSelectedCollectionId}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Files</CardTitle>
          <CardDescription>
            Drag and drop files or folders to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          {!isUploading && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/40"
              }`}
            >
              <input {...getInputProps()} />
              <FolderUp className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop files or folders"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                PDF, JPG, PNG (max 50MB each)
              </p>
            </div>
          )}

          {/* Skipped files alert */}
          {skippedCount > 0 && !isUploading && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {skippedCount} file{skippedCount !== 1 ? "s" : ""} skipped
                (unsupported type or too large)
              </AlertDescription>
            </Alert>
          )}

          {/* File list (before upload) */}
          {files.length > 0 && uploads.length === 0 && (
            <div className="space-y-3">
              {/* Select all header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    // Use indeterminate-like visual via data attribute
                    data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                    onCheckedChange={toggleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({files.length} file{files.length !== 1 ? "s" : ""})
                  </Label>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
              </div>

              {/* File entries */}
              <div className="border rounded-xl divide-y">
                {files.map((f) => (
                  <div key={f.id} className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={f.selected}
                        onCheckedChange={() => toggleFileSelected(f.id)}
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getFileIcon(f.file)}
                        <span className="text-sm font-medium truncate">
                          {f.file.name}
                        </span>
                        <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                          {getFileTypeLabel(f.file)}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(f.file.size)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(f.id)}
                        aria-label="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {f.selected && (
                      <div className="pl-8">
                        <Input
                          value={f.documentName}
                          onChange={(e) =>
                            updateDocumentName(f.id, e.target.value)
                          }
                          placeholder="Document name"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploads.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Upload Progress
              </Label>
              <div className="border rounded-xl divide-y">
                {uploads.map(([fileId, upload]) => (
                  <div key={fileId} className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(upload.file)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {upload.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {upload.status === "pending" && "Waiting..."}
                            {upload.status === "uploading" &&
                              `Uploading... ${upload.progress}%`}
                            {upload.status === "uploaded" && "Uploaded"}
                            {upload.status === "creating_document" &&
                              "Creating document..."}
                            {upload.status === "completed" && "Completed"}
                            {upload.status === "error" && upload.error}
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(upload.status)}
                    </div>
                    {(upload.status === "uploading" ||
                      upload.status === "pending") && (
                      <Progress value={upload.progress} className="h-1.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options Section */}
      {files.length > 0 && uploads.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Parse Mode</Label>
              <Select
                value={parseMode}
                onValueChange={(v) => setParseMode(v as ParseMode)}
                disabled={isUploading}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single (faster)</SelectItem>
                  <SelectItem value="dual">Dual (more accurate)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Dual mode uses two AI models for higher accuracy
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 pb-6">
        {allCompleted && !hasErrors ? (
          <Button variant="outline" onClick={() => router.push("/documents")}>
            View Documents
          </Button>
        ) : hasErrors && !isUploading ? (
          <>
            <Button onClick={handleClear}>Start Over</Button>
            <Button
              variant="outline"
              onClick={() => router.push("/documents")}
            >
              View Documents
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !isFormValid}
            >
              {isUploading && (
                <Loader2 className="animate-spin" />
              )}
              {isUploading
                ? "Uploading..."
                : `Upload & Process${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
            </Button>
            {files.length > 0 && !isUploading && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </>
        )}
      </div>

      {/* Upgrade dialog for quota exceeded */}
      {showQuota && (
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          used={user.documents_used_this_period ?? 0}
          limit={user.monthly_document_limit ?? 5}
        />
      )}
    </div>
  );
}
