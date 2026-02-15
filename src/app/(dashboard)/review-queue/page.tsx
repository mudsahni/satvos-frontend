"use client";

import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/documents/status-badge";
import { BulkActionsBar } from "@/components/documents/bulk-actions-bar";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { UserName } from "@/components/ui/user-name";
import { useReviewQueue, useReviewDocument } from "@/lib/hooks/use-documents";
import { useBulkActions } from "@/lib/hooks/use-bulk-actions";
import { useCollections } from "@/lib/hooks/use-collections";
import { formatRelativeTime } from "@/lib/utils/format";

const DEFAULT_PAGE_SIZE = 20;

export default function ReviewQueuePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const {
    selectedIds,
    setSelectedIds,
    selectedSet,
    isBulkProcessing,
    clearSelection,
    createBulkHandler,
  } = useBulkActions({ resetDeps: [debouncedSearch, page] });

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useReviewQueue({
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  const { data: collectionsData } = useCollections({ limit: 100 });
  const collectionsMap = useMemo(
    () => new Map((collectionsData?.items || []).map((c) => [c.id, c.name])),
    [collectionsData]
  );

  const reviewDocument = useReviewDocument();

  const documents = useMemo(() => {
    const items = data?.items || [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((doc) => doc.name.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  const allSelected = documents.length > 0 && selectedIds.length === documents.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < documents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      setSelectedIds(documents.map((d) => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = useMemo(
    () => createBulkHandler((docId) =>
      reviewDocument.mutateAsync({ id: docId, data: { status: "approved" } })
    ),
    [createBulkHandler, reviewDocument]
  );

  const handleBulkReject = useMemo(
    () => createBulkHandler((docId) =>
      reviewDocument.mutateAsync({ id: docId, data: { status: "rejected" } })
    ),
    [createBulkHandler, reviewDocument]
  );

  const total = search ? documents.length : (data?.total ?? 0);
  const totalPages = search
    ? Math.max(1, Math.ceil(total / pageSize))
    : (data?.total_pages ?? 1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground">
          Documents assigned to you for review
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load review queue"
          message="We couldn't load your review queue. Please try again."
          onRetry={() => refetch()}
        />
      ) : documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Queue is empty</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
              {search
                ? "No documents in your review queue match your search."
                : "No documents are currently assigned to you for review."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedIds.length > 0 && (
            <BulkActionsBar
              selectedIds={selectedIds}
              onDeselect={clearSelection}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
              isProcessing={isBulkProcessing}
            />
          )}

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all documents"
                  disabled={isBulkProcessing}
                />
                <CardTitle className="text-base font-medium">
                  {total} document{total !== 1 ? "s" : ""} to review
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {documents.map((doc) => {
                const collectionName = doc.collection_id
                  ? collectionsMap.get(doc.collection_id)
                  : null;
                const isSelected = selectedSet.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(doc.id)}
                      aria-label={`Select ${doc.name}`}
                      disabled={isBulkProcessing}
                    />
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {doc.assigned_at && (
                              <span>Assigned {formatRelativeTime(doc.assigned_at)}</span>
                            )}
                            {doc.assigned_by && (
                              <>
                                <span>&middot;</span>
                                <span>
                                  by <span className="text-foreground"><UserName id={doc.assigned_by} /></span>
                                </span>
                              </>
                            )}
                            {collectionName && (
                              <>
                                <span>&middot;</span>
                                <span className="truncate">{collectionName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge
                            status={doc.validation_status}
                            type="validation"
                            showType
                          />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </CardContent>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              className="px-4 pb-4"
            />
          </Card>
        </>
      )}
    </div>
  );
}
