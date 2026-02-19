"use client";

import { useState, useMemo, Suspense } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter,
  Search,
  Ban,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocuments } from "@/lib/api/documents";
import { fetchAllPaginated } from "@/lib/utils/fetch-all-paginated";
import { useCollections } from "@/lib/hooks/use-collections";
import { useStats } from "@/lib/hooks/use-stats";
import { formatRelativeTime, formatDateTime } from "@/lib/utils/format";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/documents/status-badge";
import { cn } from "@/lib/utils";
import { UserName } from "@/components/ui/user-name";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { AttentionFilter, matchesFilter } from "@/lib/utils/needs-attention";

const VALID_FILTERS: AttentionFilter[] = ["all", "invalid", "warning", "pending_review", "failed"];
const DEFAULT_PAGE_SIZE = 20;

function NeedsAttentionContent() {
  const searchParams = useSearchParams();
  const initialFilter = VALID_FILTERS.includes(searchParams.get("filter") as AttentionFilter)
    ? (searchParams.get("filter") as AttentionFilter)
    : "all";

  const [filterStatus, setFilterStatus] = useState<AttentionFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Stats from API for accurate counts
  const { data: stats, isLoading: statsLoading } = useStats();

  // Fetch ALL documents by paginating through every page, then filter client-side.
  // The API doesn't support status filter params, so this is the only way to get
  // a complete filtered list. For ~200 docs this is just 2 API calls.
  const {
    data: allDocuments,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["documents", "needs-attention"],
    queryFn: () =>
      fetchAllPaginated(({ limit, offset }) => getDocuments({ limit, offset })),
  });

  // Collections for displaying collection names
  const { data: collectionsData } = useCollections({ limit: 100 });
  const collectionsMap = useMemo(
    () => new Map((collectionsData?.items || []).map((c) => [c.id, c.name])),
    [collectionsData]
  );

  // Filter documents client-side
  const documents = useMemo(() => {
    if (!allDocuments) return [];

    let docs = allDocuments.filter((doc) => matchesFilter(doc, filterStatus));

    // Apply search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      docs = docs.filter((doc) => doc.name.toLowerCase().includes(q));
    }

    // Sort newest first
    docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return docs;
  }, [allDocuments, filterStatus, debouncedSearch]);

  // Pagination
  const totalDocuments = documents.length;
  const totalPages = Math.ceil(totalDocuments / pageSize);
  const paginatedDocuments = documents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Stats from API
  const invalidCount = stats?.validation_invalid ?? 0;
  const warningCount = stats?.validation_warning ?? 0;
  const pendingReviewCount = stats?.review_pending ?? 0;
  const failedCount = stats?.parsing_failed ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Needs Attention</h1>
        <p className="text-muted-foreground">
          Documents requiring validation review, approval, or intervention
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filterStatus === "invalid" && "ring-2 ring-error"
          )}
          onClick={() => { setFilterStatus(filterStatus === "invalid" ? "all" : "invalid"); setPage(1); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10">
              <XCircle className="h-5 w-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validation Errors</p>
              {statsLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className="text-xl font-bold">{invalidCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filterStatus === "warning" && "ring-2 ring-warning"
          )}
          onClick={() => { setFilterStatus(filterStatus === "warning" ? "all" : "warning"); setPage(1); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              {statsLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className="text-xl font-bold">{warningCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filterStatus === "pending_review" && "ring-2 ring-primary"
          )}
          onClick={() => {
            setFilterStatus(filterStatus === "pending_review" ? "all" : "pending_review");
            setPage(1);
          }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              {statsLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className="text-xl font-bold">{pendingReviewCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            filterStatus === "failed" && "ring-2 ring-error"
          )}
          onClick={() => { setFilterStatus(filterStatus === "failed" ? "all" : "failed"); setPage(1); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Ban className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed Parsing</p>
              {statsLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className="text-xl font-bold">{failedCount}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <Select
          value={filterStatus}
          onValueChange={(value) => { setFilterStatus(value as AttentionFilter); setPage(1); }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="invalid">Validation Errors</SelectItem>
            <SelectItem value="warning">Warnings</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="failed">Failed Parsing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents list */}
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
          title="Failed to load documents"
          message="We couldn't load the documents. Please try again."
          onRetry={() => refetch()}
        />
      ) : documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
              {filterStatus === "all"
                ? "No documents need your attention right now."
                : "No documents match the selected filter."}
            </p>
            {filterStatus !== "all" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setFilterStatus("all"); setPage(1); }}
              >
                Clear filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base font-medium">
              {totalDocuments} document{totalDocuments !== 1 ? "s" : ""}{" "}
              need attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {paginatedDocuments.map((doc) => {
              const collectionName = doc.collection_id
                ? collectionsMap.get(doc.collection_id)
                : null;
              return (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        doc.parsing_status === "failed" && "bg-muted",
                        doc.parsing_status !== "failed" && doc.validation_status === "invalid" && "bg-error/10",
                        doc.parsing_status !== "failed" && doc.validation_status === "warning" && "bg-warning/10",
                        doc.parsing_status !== "failed" &&
                          doc.validation_status !== "invalid" &&
                          doc.validation_status !== "warning" &&
                          "bg-primary/10"
                      )}
                    >
                      {doc.parsing_status === "failed" ? (
                        <Ban className="h-5 w-5 text-muted-foreground" />
                      ) : doc.validation_status === "invalid" ? (
                        <XCircle className="h-5 w-5 text-error" />
                      ) : doc.validation_status === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">{formatRelativeTime(doc.created_at)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{formatDateTime(doc.created_at)}</TooltipContent>
                        </Tooltip>
                        <span>&middot;</span>
                        <span className="text-foreground"><UserName id={doc.created_by} /></span>
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
                      {doc.parsing_status === "failed" ? (
                        <StatusBadge
                          status={doc.parsing_status}
                          type="parsing"
                          showType
                        />
                      ) : (
                        <>
                          <StatusBadge
                            status={doc.validation_status}
                            type="validation"
                            showType
                          />
                          {doc.review_status === "pending" && doc.parsing_status === "completed" && (
                            <StatusBadge
                              status={doc.review_status}
                              type="review"
                              showType
                            />
                          )}
                        </>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalDocuments}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            className="px-4 pb-4"
          />
        </Card>
      )}
    </div>
  );
}

export default function NeedsAttentionPage() {
  return (
    <Suspense>
      <NeedsAttentionContent />
    </Suspense>
  );
}
