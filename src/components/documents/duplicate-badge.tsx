"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ChevronRight, FileText, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  parseDuplicateResult,
  getMatchTypeLabel,
  type DuplicateMatchInfo,
  type MatchType,
} from "@/lib/utils/duplicate-detection";
import { ValidationResult } from "@/types/validation";
import { cn } from "@/lib/utils";

const MATCH_TYPE_BADGE_VARIANT: Record<MatchType, "error" | "warning"> = {
  exact_irn: "error",
  strong: "error",
  weak: "warning",
};

const MATCH_TYPE_SHORT_LABEL: Record<MatchType, string> = {
  exact_irn: "Exact IRN",
  strong: "Strong",
  weak: "Weak",
};

interface DuplicateBadgeProps {
  validationResults: ValidationResult[];
  /** Compact mode for table rows — smaller badge, no icon */
  compact?: boolean;
  className?: string;
}

export function DuplicateBadge({
  validationResults,
  compact = false,
  className,
}: DuplicateBadgeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const parsed = useMemo(
    () => parseDuplicateResult(validationResults),
    [validationResults]
  );

  if (!parsed.found) {
    return null;
  }

  const isError = parsed.effectiveSeverity === "error";
  const variant = isError ? "error" : "warning";

  return (
    <>
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer shrink-0 transition-all hover:brightness-90 dark:hover:brightness-110",
          compact ? "text-[10px] px-1.5 py-0 gap-1" : "gap-1.5",
          className
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDialogOpen(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setDialogOpen(true);
          }
        }}
      >
        {!compact && <Copy className="h-3 w-3" />}
        Duplicate{parsed.matchCount > 1 ? ` (${parsed.matchCount})` : ""}
        <ChevronRight className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3", "-ml-0.5")} />
      </Badge>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isError ? (
                <XCircle className="h-5 w-5 text-error shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              )}
              {isError
                ? "Duplicate Invoice Detected"
                : "Possible Duplicate Invoice"}
            </DialogTitle>
            <DialogDescription>
              {parsed.matchCount} matching document{parsed.matchCount !== 1 ? "s" : ""} found.
              {isError
                ? " This invoice has exact or strong matches that confirm it is a duplicate."
                : " This invoice has weak matches from a different financial year."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {parsed.matches.map((match, i) => (
              <DuplicateMatchRow key={i} match={match} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DuplicateMatchRow({ match }: { match: DuplicateMatchInfo }) {
  const href = match.documentId
    ? `/documents/${match.documentId}`
    : `/documents?search=${encodeURIComponent(match.documentName)}`;

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <FileText className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={href}
            className="font-medium text-sm hover:text-primary hover:underline transition-colors"
          >
            {match.documentName}
          </Link>
          <Badge
            variant={MATCH_TYPE_BADGE_VARIANT[match.matchType]}
            className="text-[10px] px-1.5 py-0"
          >
            {MATCH_TYPE_SHORT_LABEL[match.matchType]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {getMatchTypeLabel(match.matchType)}
        </p>
        <p className="text-xs text-muted-foreground">
          Uploaded {match.uploadDate}
        </p>
      </div>
    </div>
  );
}
