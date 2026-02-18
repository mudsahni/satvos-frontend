"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, XCircle, FileText, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

interface DuplicateInvoiceAlertProps {
  validationResults: ValidationResult[];
  className?: string;
}

export function DuplicateInvoiceAlert({
  validationResults,
  className,
}: DuplicateInvoiceAlertProps) {
  const parsed = useMemo(
    () => parseDuplicateResult(validationResults),
    [validationResults]
  );

  // Check unavailable — show informational message
  if (parsed.unavailable) {
    return (
      <Alert variant="default" className={cn("border-border", className)}>
        <Info className="h-4 w-4" />
        <AlertTitle>Duplicate check unavailable</AlertTitle>
        <AlertDescription>
          The duplicate invoice check could not run — likely because the seller
          GSTIN or invoice number is missing from the parsed data. Ensure these
          fields are present, then re-validate.
        </AlertDescription>
      </Alert>
    );
  }

  if (!parsed.found) {
    return null;
  }

  const isError = parsed.effectiveSeverity === "error";

  return (
    <Alert
      variant={isError ? "destructive" : "warning"}
      className={cn(
        isError
          ? "border-error-border bg-error-bg text-error [&>svg]:text-error"
          : undefined,
        className
      )}
    >
      {isError ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle>
        {isError
          ? `Duplicate invoice detected (${parsed.matchCount} match${parsed.matchCount !== 1 ? "es" : ""})`
          : `Possible duplicate invoice (${parsed.matchCount} match${parsed.matchCount !== 1 ? "es" : ""})`}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1.5">
          {parsed.matches.map((match, i) => (
            <DuplicateMatchItem key={i} match={match} />
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function DuplicateMatchItem({ match }: { match: DuplicateMatchInfo }) {
  const searchUrl = `/documents?search=${encodeURIComponent(match.documentName)}`;

  return (
    <li className="flex items-start gap-2">
      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
      <div className="min-w-0">
        <Link
          href={searchUrl}
          className="font-medium underline decoration-current/30 hover:decoration-current transition-colors"
        >
          {match.documentName}
        </Link>
        <Badge
          variant={MATCH_TYPE_BADGE_VARIANT[match.matchType]}
          className="ml-2 text-[10px] px-1.5 py-0 align-middle"
        >
          {MATCH_TYPE_SHORT_LABEL[match.matchType]}
        </Badge>
        <span className="ml-2 text-xs opacity-70">
          Uploaded {match.uploadDate}
        </span>
        <p className="text-xs opacity-60 mt-0.5">
          {getMatchTypeLabel(match.matchType)}
        </p>
      </div>
    </li>
  );
}
