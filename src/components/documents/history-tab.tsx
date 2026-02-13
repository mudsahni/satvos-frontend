"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  ShieldCheck,
  User,
  Clock,
  AlertCircle,
  RefreshCw,
  Pencil,
  Tag,
  Trash2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditEntry } from "@/types/audit";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { UserName } from "@/components/ui/user-name";
import { useDocumentAudit } from "@/lib/hooks/use-audit";

interface HistoryTabProps {
  documentId: string;
}

interface ActionDisplay {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  description?: string;
}

function getActionDisplay(entry: AuditEntry): ActionDisplay {
  const { action, changes } = entry;

  switch (action) {
    case "document.created":
      return {
        icon: <Upload className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Document Created",
        description: changes.document_type
          ? `Uploaded as ${changes.document_type}`
          : "Document uploaded",
      };

    case "document.parse_completed":
      return {
        icon: <FileText className="h-4 w-4" />,
        colorClass: "bg-success-bg text-success border-transparent",
        title: "Parsing Completed",
        description: changes.parser_model
          ? `Parsed with ${changes.parser_model}`
          : "Document successfully parsed",
      };

    case "document.parse_failed":
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        colorClass: "bg-error-bg text-error border-transparent",
        title: "Parsing Failed",
        description:
          typeof changes.error === "string"
            ? changes.error
            : "Failed to extract data from document",
      };

    case "document.parse_queued":
      return {
        icon: <Clock className="h-4 w-4" />,
        colorClass: "bg-warning-bg text-warning border-transparent",
        title: "Parsing Queued",
        description: changes.attempt
          ? `Attempt ${changes.attempt} — queued for retry`
          : "Queued for parsing",
      };

    case "document.retry":
      return {
        icon: <RefreshCw className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Parsing Retried",
        description: "Retry triggered",
      };

    case "document.review": {
      const isApproved = changes.status === "approved";
      return {
        icon: isApproved ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        ),
        colorClass: isApproved
          ? "bg-success-bg text-success border-transparent"
          : "bg-error-bg text-error border-transparent",
        title: isApproved ? "Document Approved" : "Document Rejected",
        description:
          typeof changes.notes === "string" ? changes.notes : undefined,
      };
    }

    case "document.edit_structured_data":
      return {
        icon: <Pencil className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Data Edited",
        description: "Invoice data manually edited",
      };

    case "document.validate":
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Validation Triggered",
      };

    case "document.validation_completed": {
      const vStatus = changes.status as string | undefined;
      if (vStatus === "valid") {
        return {
          icon: <ShieldCheck className="h-4 w-4" />,
          colorClass: "bg-success-bg text-success border-transparent",
          title: "Validation Passed",
          description: "All validation rules passed",
        };
      }
      if (vStatus === "invalid") {
        return {
          icon: <ShieldCheck className="h-4 w-4" />,
          colorClass: "bg-error-bg text-error border-transparent",
          title: "Validation Failed",
          description: "Document has validation errors",
        };
      }
      if (vStatus === "warning") {
        return {
          icon: <ShieldCheck className="h-4 w-4" />,
          colorClass: "bg-warning-bg text-warning border-transparent",
          title: "Validation Warnings",
          description: "Document has validation warnings",
        };
      }
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        colorClass: "bg-success-bg text-success border-transparent",
        title: "Validation Completed",
      };
    }

    case "document.tags_added": {
      const tags = changes.tags as Record<string, string> | undefined;
      const tagPairs = tags
        ? Object.entries(tags)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : undefined;
      return {
        icon: <Tag className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Tags Added",
        description: tagPairs,
      };
    }

    case "document.tag_deleted":
      return {
        icon: <Tag className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: "Tag Removed",
      };

    case "document.deleted":
      return {
        icon: <Trash2 className="h-4 w-4" />,
        colorClass: "bg-error-bg text-error border-transparent",
        title: "Document Deleted",
      };

    default: {
      const _exhaustive: never = action;
      return {
        icon: <Clock className="h-4 w-4" />,
        colorClass: "bg-muted text-muted-foreground border-border",
        title: (_exhaustive as string) ?? "Unknown Action",
      };
    }
  }
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 pt-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistoryTab({ documentId }: HistoryTabProps) {
  const [page, setPage] = useState(1);
  const [allEntries, setAllEntries] = useState<AuditEntry[]>([]);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } =
    useDocumentAudit(documentId, page);

  // Merge entries when new pages arrive
  const pageData = data?.data ?? [];
  const entries = (() => {
    if (!data) return allEntries;
    if (page === 1 && !hasLoadedMore) return pageData;
    if (hasLoadedMore) {
      const existingIds = new Set(allEntries.map((e) => e.id));
      const newEntries = pageData.filter((e) => !existingIds.has(e.id));
      return [...allEntries, ...newEntries];
    }
    return pageData;
  })();

  const totalEntries = data?.meta.total ?? 0;
  const hasMore = entries.length < totalEntries;

  const handleLoadMore = useCallback(() => {
    setAllEntries(entries);
    setHasLoadedMore(true);
    setPage((p) => p + 1);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Document Timeline</h3>
        <TimelineSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
          <AlertCircle className="h-8 w-8 text-error" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Failed to load history</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Something went wrong while loading the document timeline.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          <RefreshCw /> Retry
        </Button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Document activity will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Document Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-border" />

        <div className="space-y-6">
          {entries.map((entry) => {
            const display = getActionDisplay(entry);

            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                    display.colorClass
                  )}
                >
                  {display.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <span className="font-medium">{display.title}</span>
                  {display.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {display.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span title={formatDateTime(entry.created_at)}>
                      {formatRelativeTime(entry.created_at)}
                    </span>
                    {entry.user_id ? (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <UserName id={entry.user_id} />
                      </span>
                    ) : (
                      <span className="italic">System</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Clock />
            )}
            {isFetching ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
