"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionHeader } from "@/components/collections/collection-header";
import {
  CollectionFilters,
  ValidationStatusFilter,
  ReviewStatusFilter,
} from "@/components/collections/collection-filters";
import { DocumentsTable } from "@/components/documents/documents-table";
import { BulkActionsBar } from "@/components/documents/bulk-actions-bar";
import { useCollection } from "@/lib/hooks/use-collections";
import {
  useDocuments,
  useReviewDocument,
  useDeleteDocument,
} from "@/lib/hooks/use-documents";
import { toast } from "@/lib/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { canUpload } from "@/lib/constants";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();

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

  const { data: collection, isPending: collectionLoading } = useCollection(id);
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({
    collection_id: id,
    limit: 100,
  });

  const reviewDocument = useReviewDocument();
  const deleteDocument = useDeleteDocument();
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const documents = useMemo(() => documentsData?.items || [], [documentsData]);

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

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
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

  const canUploadDocs = user && canUpload(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <CollectionHeader
        collection={collection}
        isLoading={collectionLoading}
        canUpload={canUploadDocs || false}
        documentCount={documents.length}
      />

      {/* Filters */}
      <CollectionFilters
        search={search}
        onSearchChange={setSearch}
        validationStatus={validationStatus}
        onValidationStatusChange={setValidationStatus}
        reviewStatus={reviewStatus}
        onReviewStatusChange={setReviewStatus}
        totalFiltered={filteredDocuments.length}
        total={documents.length}
      />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedIds={selectedIds}
          onDeselect={() => setSelectedIds([])}
          onApprove={handleBulkApprove}
          onReject={handleBulkReject}
          onDelete={handleBulkDelete}
          isProcessing={isBulkProcessing}
        />
      )}

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
              {canUploadDocs && (
                <Button asChild className="mt-4">
                  <Link href={`/upload?collection=${id}`}>
                    <Upload />
                    Upload Documents
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <DocumentsTable
              documents={sortedDocuments}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
