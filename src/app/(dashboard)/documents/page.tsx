"use client";

import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import Link from "next/link";
import { Search, FileText, MoreHorizontal, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useDocuments, useDeleteDocument } from "@/lib/hooks/use-documents";
import { useCollections } from "@/lib/hooks/use-collections";
import { getDocuments } from "@/lib/api/documents";
import { fetchAllPaginated } from "@/lib/utils/fetch-all-paginated";
import { formatRelativeTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/documents/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { UserName } from "@/components/ui/user-name";

const DEFAULT_PAGE_SIZE = 20;

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [parsingFilter, setParsingFilter] = useState<string>("all");
  const [validationFilter, setValidationFilter] = useState<string>("all");
  const [reviewFilter, setReviewFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: collectionsData } = useCollections({ limit: 100 });
  const collections = collectionsData?.items || [];

  const debouncedSearch = useDebouncedValue(search);

  // API doesn't support search/status filters — only collection_id, offset, limit
  const hasSearch = !!debouncedSearch;
  const collectionId = collectionFilter !== "all" ? collectionFilter : undefined;

  // Normal paginated query — used when NOT searching
  const paginatedQuery = useDocuments(
    !hasSearch
      ? {
          collection_id: collectionId,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          sort_by: "created_at",
          sort_order: "desc",
        }
      : { collection_id: collectionId, limit: 1 }
  );

  // Fetch-all query — used when searching (paginates through all API pages)
  const allDocsQuery = useQuery({
    queryKey: ["documents", "search-all", collectionId],
    queryFn: () =>
      fetchAllPaginated(
        ({ limit, offset }) =>
          getDocuments({ limit, offset, collection_id: collectionId })
      ),
    enabled: hasSearch,
  });

  const isLoading = hasSearch ? allDocsQuery.isLoading : paginatedQuery.isLoading;
  const isError = hasSearch ? allDocsQuery.isError : paginatedQuery.isError;
  const refetch = hasSearch ? allDocsQuery.refetch : paginatedQuery.refetch;

  // Client-side search + status filtering
  const filtered = useMemo(() => {
    let result = hasSearch ? (allDocsQuery.data || []) : (paginatedQuery.data?.items || []);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(q));
    }
    if (parsingFilter !== "all") {
      result = result.filter((doc) => doc.parsing_status === parsingFilter);
    }
    if (validationFilter !== "all") {
      result = result.filter((doc) => doc.validation_status === validationFilter);
    }
    if (reviewFilter !== "all") {
      result = result.filter((doc) => doc.review_status === reviewFilter);
    }
    // Sort by created_at desc to match server default (copy to avoid mutating cached data)
    result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [hasSearch, allDocsQuery.data, paginatedQuery.data, debouncedSearch, parsingFilter, validationFilter, reviewFilter]);

  // Pagination: client-side when searching, server-side otherwise
  const total = hasSearch ? filtered.length : (paginatedQuery.data?.total ?? 0);
  const totalPages = hasSearch
    ? Math.max(1, Math.ceil(total / pageSize))
    : (paginatedQuery.data?.total_pages ?? 1);
  const documents = hasSearch
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const deleteDocument = useDeleteDocument();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDocument.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCollectionFilter("all");
    setParsingFilter("all");
    setValidationFilter("all");
    setReviewFilter("all");
    setPage(1);
  };

  const hasFilters =
    search ||
    collectionFilter !== "all" ||
    parsingFilter !== "all" ||
    validationFilter !== "all" ||
    reviewFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          View and manage your processed documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={collectionFilter} onValueChange={(v) => { setCollectionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={parsingFilter} onValueChange={(v) => { setParsingFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Parsing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parsing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={validationFilter} onValueChange={(v) => { setValidationFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Validation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Validation</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reviewFilter} onValueChange={(v) => { setReviewFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Review" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2 px-6 pb-2 text-sm text-muted-foreground">
          <span>
            Showing {documents.length} of {total} document{total !== 1 ? "s" : ""}
          </span>
          {hasFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load documents"
              message="We couldn't load your documents. Please try again."
              onRetry={() => refetch()}
            />
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No documents</h3>
              <p className="text-muted-foreground">
                {hasFilters
                  ? "No documents match your filters."
                  : "Upload some documents to get started."}
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm normal-case tracking-normal">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-sm normal-case tracking-normal">Collection</TableHead>
                  <TableHead className="text-sm normal-case tracking-normal">Parsing</TableHead>
                  <TableHead className="text-sm normal-case tracking-normal">Validation</TableHead>
                  <TableHead className="text-sm normal-case tracking-normal">Review</TableHead>
                  <TableHead className="hidden lg:table-cell text-sm normal-case tracking-normal">Assigned To</TableHead>
                  <TableHead className="hidden lg:table-cell text-sm normal-case tracking-normal">Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const collection = collections.find(
                    (c) => c.id === doc.collection_id
                  );
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Link
                          href={`/documents/${doc.id}`}
                          className="font-medium hover:underline"
                        >
                          {doc.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {collection ? (
                          <Link
                            href={`/collections/${collection.id}`}
                            className="hover:underline"
                          >
                            {collection.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={doc.parsing_status}
                          type="parsing"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={doc.validation_status}
                          type="validation"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={doc.review_status} type="review" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {doc.assigned_to ? <UserName id={doc.assigned_to} /> : "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        <div>
                          <div>{formatRelativeTime(doc.created_at)}</div>
                          <div className="text-xs">
                            by <span className="text-foreground"><UserName id={doc.created_by} /></span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Document actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/documents/${doc.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(doc.id)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
