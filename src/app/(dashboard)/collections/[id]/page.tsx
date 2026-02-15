"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { FolderOpen, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionHeader } from "@/components/collections/collection-header";
import {
  CollectionFilters,
  ValidationStatusFilter,
  ReviewStatusFilter,
} from "@/components/collections/collection-filters";
import { DocumentsTable } from "@/components/documents/documents-table";
import { BulkActionsBar } from "@/components/documents/bulk-actions-bar";
import { BulkAssignDialog } from "@/components/documents/bulk-assign-dialog";
import { useQuery } from "@tanstack/react-query";
import { useCollection, useExportCollectionCsv } from "@/lib/hooks/use-collections";
import {
  useReviewDocument,
  useDeleteDocument,
  useAssignDocument,
} from "@/lib/hooks/use-documents";
import { getDocuments } from "@/lib/api/documents";
import { fetchAllPaginated } from "@/lib/utils/fetch-all-paginated";
import { toast } from "@/lib/hooks/use-toast";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = use(params);

  // Filter state
  const [search, setSearch] = useState("");
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatusFilter>("all");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sort state
  type SortField = "name" | "created_at" | "validation_status" | "review_status";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const { data: collection, isPending: collectionLoading } = useCollection(id);
  const {
    data: documents = [],
    isLoading: documentsLoading,
  } = useQuery({
    queryKey: ["documents", "collection-all", id],
    queryFn: () =>
      fetchAllPaginated(({ limit, offset }) =>
        getDocuments({ limit, offset, collection_id: id })
      ),
    refetchInterval: (query) => {
      const items = query.state.data;
      if (!items) return false;
      const hasActiveProcessing = items.some(
        (doc) =>
          doc.parsing_status === "pending" ||
          doc.parsing_status === "processing"
      );
      return hasActiveProcessing ? 3000 : false;
    },
  });

  const reviewDocument = useReviewDocument();
  const deleteDocument = useDeleteDocument();
  const assignDocument = useAssignDocument();
  const exportCsv = useExportCollectionCsv();
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const handleBulkApprove = async (ids: string[]) => {
    setIsBulkProcessing(true);
    let succeeded = 0;
    let failed = 0;
    try {
      const results = await Promise.allSettled(
        ids.map((docId) =>
          reviewDocument.mutateAsync({ id: docId, data: { status: "approved" } })
        )
      );
      succeeded = results.filter((r) => r.status === "fulfilled").length;
      failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded > 0) setSelectedIds([]);
    } finally {
      setIsBulkProcessing(false);
    }
    return { succeeded, failed };
  };

  const handleBulkReject = async (ids: string[]) => {
    setIsBulkProcessing(true);
    let succeeded = 0;
    let failed = 0;
    try {
      const results = await Promise.allSettled(
        ids.map((docId) =>
          reviewDocument.mutateAsync({ id: docId, data: { status: "rejected" } })
        )
      );
      succeeded = results.filter((r) => r.status === "fulfilled").length;
      failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded > 0) setSelectedIds([]);
    } finally {
      setIsBulkProcessing(false);
    }
    return { succeeded, failed };
  };

  const handleBulkDelete = async (ids: string[]) => {
    setIsBulkProcessing(true);
    let succeeded = 0;
    let failed = 0;
    try {
      const results = await Promise.allSettled(
        ids.map((docId) => deleteDocument.mutateAsync(docId))
      );
      succeeded = results.filter((r) => r.status === "fulfilled").length;
      failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded > 0) setSelectedIds([]);
    } finally {
      setIsBulkProcessing(false);
    }
    return { succeeded, failed };
  };

  const handleBulkAssign = async (userId: string) => {
    setIsBulkProcessing(true);
    setShowAssignDialog(false);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((docId) =>
          assignDocument.mutateAsync({
            id: docId,
            data: { assignee_id: userId },
          })
        )
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (succeeded > 0) setSelectedIds([]);
      toast({
        title: failed === 0 ? "Reviewer assigned" : "Some assignments failed",
        description:
          failed === 0
            ? `All ${succeeded} document${succeeded !== 1 ? "s" : ""} assigned successfully.`
            : `${succeeded} assigned, ${failed} failed.`,
        variant: failed > 0 ? "destructive" : undefined,
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  // Filter documents based on filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(searchLower);
        const matchesVendor = doc.parsed_data?.seller?.name?.value
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesName && !matchesVendor) return false;
      }

      // Validation status filter
      if (validationStatus !== "all" && doc.validation_status !== validationStatus) {
        return false;
      }

      // Review status filter
      return !(reviewStatus !== "all" && doc.review_status !== reviewStatus);


    });
  }, [documents, search, validationStatus, reviewStatus]);

  // Sort filtered documents
  const sortedDocuments = useMemo(() => {
    if (!sortField) return filteredDocuments;

    return [...filteredDocuments].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "validation_status":
          cmp = (a.validation_status || "").localeCompare(b.validation_status || "");
          break;
        case "review_status":
          cmp = (a.review_status || "").localeCompare(b.review_status || "");
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [filteredDocuments, sortField, sortOrder]);

  // Paginate sorted documents
  const totalPages = Math.ceil(sortedDocuments.length / pageSize);
  const paginatedDocuments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedDocuments.slice(start, start + pageSize);
  }, [sortedDocuments, page, pageSize]);

  // Compute review status counts for selected documents
  const reviewStatusCounts = useMemo(() => {
    if (selectedIds.length === 0) return undefined;
    const counts = { approved: 0, rejected: 0, pending: 0 };
    const docMap = new Map(documents.map((d) => [d.id, d]));
    for (const docId of selectedIds) {
      const doc = docMap.get(docId);
      if (doc?.review_status === "approved") counts.approved++;
      else if (doc?.review_status === "rejected") counts.rejected++;
      else counts.pending++;
    }
    return counts;
  }, [selectedIds, documents]);

  // "Select all across pages" logic
  const pageFullySelected =
    paginatedDocuments.length > 0 &&
    paginatedDocuments.every((d) => selectedIds.includes(d.id));
  const allFilteredIds = useMemo(
    () => sortedDocuments.map((d) => d.id),
    [sortedDocuments]
  );
  const allFilteredSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.length === selectedIds.length &&
    allFilteredIds.every((id) => selectedIds.includes(id));
  const showSelectAllBanner =
    pageFullySelected &&
    sortedDocuments.length > paginatedDocuments.length;


  if (collectionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Collection not found</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
          The collection you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/collections">Back to Collections</Link>
        </Button>
      </div>
    );
  }

  // Backend provides effective permission — editors and owners can upload/manage
  const collectionPermission = collection?.user_permission;
  const canManage =
    collectionPermission === "owner" || collectionPermission === "editor";

  return (
    <div className="space-y-6">
      {/* Header */}
      <CollectionHeader
        collection={collection}
        isLoading={collectionLoading}
        canUpload={canManage}
        documentCount={documents.length}
        onExportCsv={() => exportCsv.mutate({ id, name: collection?.name })}
        isExportingCsv={exportCsv.isPending}
      />

      {/* Filters */}
      <CollectionFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        validationStatus={validationStatus}
        onValidationStatusChange={(v) => { setValidationStatus(v); setPage(1); }}
        reviewStatus={reviewStatus}
        onReviewStatusChange={(v) => { setReviewStatus(v); setPage(1); }}
        totalFiltered={filteredDocuments.length}
        total={documents.length}
      />

      {/* Bulk Actions — only for editors/owners */}
      {canManage && selectedIds.length > 0 && (
        <BulkActionsBar
          selectedIds={selectedIds}
          onDeselect={() => setSelectedIds([])}
          onApprove={handleBulkApprove}
          onReject={handleBulkReject}
          onDelete={handleBulkDelete}
          onAssign={() => setShowAssignDialog(true)}
          isProcessing={isBulkProcessing}
          reviewStatusCounts={reviewStatusCounts}
        />
      )}

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        selectedCount={selectedIds.length}
        onConfirm={handleBulkAssign}
        isProcessing={isBulkProcessing}
      />

      {/* Documents table */}
      <Card>
        <CardContent className="pt-6">
          {documentsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No documents</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
                This collection doesn&apos;t have any documents yet. Upload
                your first document to get started.
              </p>
              {canManage && (
                <Button asChild className="mt-4">
                  <Link href={`/upload?collection=${id}`}>
                    <Upload />
                    Upload Documents
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {canManage && showSelectAllBanner && (
                <div className="flex items-center justify-center gap-1 rounded-md bg-muted/50 py-2 text-sm text-muted-foreground">
                  {allFilteredSelected ? (
                    <>
                      All {allFilteredIds.length} documents selected.
                      <button
                        className="font-medium text-primary hover:underline"
                        onClick={() => setSelectedIds([])}
                      >
                        Clear selection
                      </button>
                    </>
                  ) : (
                    <>
                      All {paginatedDocuments.length} on this page selected.
                      <button
                        className="font-medium text-primary hover:underline"
                        onClick={() => setSelectedIds(allFilteredIds)}
                      >
                        Select all {allFilteredIds.length} documents
                      </button>
                    </>
                  )}
                </div>
              )}
              <DocumentsTable
                documents={paginatedDocuments}
                selectedIds={canManage ? selectedIds : []}
                onSelectionChange={canManage ? setSelectedIds : undefined}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                total={sortedDocuments.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
