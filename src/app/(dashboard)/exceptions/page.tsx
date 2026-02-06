"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";

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
import { useDocuments } from "@/lib/hooks/use-documents";
import { useCollections } from "@/lib/hooks/use-collections";
import { formatRelativeTime } from "@/lib/utils/format";
import { StatusBadge } from "@/components/documents/status-badge";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

type FilterStatus = "all" | "invalid" | "warning" | "pending_review";

const DEFAULT_PAGE_SIZE = 20;

export default function ExceptionsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useDocuments({
    limit: 100,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const { data: collectionsData } = useCollections({ limit: 100 });
  const collectionsMap = new Map(
    (collectionsData?.items || []).map((c) => [c.id, c.name])
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const documents = data?.items || [];

  // Filter documents needing attention
  const exceptionsDocuments = documents.filter((doc) => {
    const needsAttention =
      doc.validation_status === "invalid" ||
      doc.validation_status === "warning" ||
      (doc.parsing_status === "completed" && doc.review_status === "pending");

    if (!needsAttention) return false;

    // Apply status filter
    if (filterStatus === "invalid" && doc.validation_status !== "invalid") return false;
    if (filterStatus === "warning" && doc.validation_status !== "warning") return false;
    if (filterStatus === "pending_review" && doc.review_status !== "pending") return false;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return doc.name.toLowerCase().includes(searchLower);
    }

    return true;
  });

  // Client-side pagination
  const totalExceptions = exceptionsDocuments.length;
  const totalPages = Math.ceil(totalExceptions / pageSize);
  const paginatedExceptions = exceptionsDocuments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Stats
  const invalidCount = documents.filter((d) => d.validation_status === "invalid").length;
  const warningCount = documents.filter((d) => d.validation_status === "warning").length;
  const pendingReviewCount = documents.filter(
    (d) => d.parsing_status === "completed" && d.review_status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Exceptions</h1>
        <p className="text-muted-foreground">
          Documents requiring validation review or approval
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filterStatus === "invalid" && "ring-2 ring-error"
          )}
          onClick={() => { setFilterStatus(filterStatus === "invalid" ? "all" : "invalid"); setPage(1); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
              <XCircle className="h-5 w-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validation Errors</p>
              {isLoading ? (
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              {isLoading ? (
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className="text-xl font-bold">{pendingReviewCount}</p>
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
          onValueChange={(value) => { setFilterStatus(value as FilterStatus); setPage(1); }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exceptions</SelectItem>
            <SelectItem value="invalid">Validation Errors</SelectItem>
            <SelectItem value="warning">Warnings</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
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
      ) : exceptionsDocuments.length === 0 ? (
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
              {exceptionsDocuments.length} document{exceptionsDocuments.length !== 1 ? "s" : ""}{" "}
              need attention
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {paginatedExceptions.map((doc) => {
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
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        doc.validation_status === "invalid" && "bg-error/10",
                        doc.validation_status === "warning" && "bg-warning/10",
                        doc.validation_status !== "invalid" &&
                          doc.validation_status !== "warning" &&
                          "bg-primary/10"
                      )}
                    >
                      {doc.validation_status === "invalid" ? (
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
                        <span>{formatRelativeTime(doc.created_at)}</span>
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
                      {doc.review_status === "pending" && doc.parsing_status === "completed" && (
                        <StatusBadge
                          status={doc.review_status}
                          type="review"
                          showType
                        />
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
            total={totalExceptions}
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
