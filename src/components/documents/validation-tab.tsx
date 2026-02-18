"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Filter,
  ChevronRight,
  Copy,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ValidationResult,
  getValidationSummary,
  getValidationSeverity,
  getRuleType,
} from "@/types/validation";
import { cn } from "@/lib/utils";
import { DuplicateInvoiceAlert } from "@/components/documents/duplicate-invoice-alert";
import { parseDuplicateResult, getMatchTypeLabel } from "@/lib/utils/duplicate-detection";

interface ValidationTabProps {
  validationResults: ValidationResult[];
  onRevalidate?: () => void;
  isRevalidating?: boolean;
}

type FilterType = "all" | "passed" | "warnings" | "errors";

// Extract rule name from message (e.g., "Math: Grand Total" -> "Grand Total")
function getRuleName(result: ValidationResult): string {
  if (result.rule_name) return result.rule_name;

  const message = result.message;
  const colonIndex = message.indexOf(":");
  if (colonIndex !== -1 && colonIndex < 20) {
    const afterColon = message.substring(colonIndex + 1).trim();
    // Get just the first part before the next colon or the full message
    const nextColonIndex = afterColon.indexOf(":");
    if (nextColonIndex !== -1) {
      return afterColon.substring(0, nextColonIndex).trim();
    }
    // Truncate long messages
    if (afterColon.length > 50) {
      return afterColon.substring(0, 50) + "...";
    }
    return afterColon;
  }
  return message.substring(0, Math.min(50, message.length));
}

// Check if this is a duplicate invoice detection result
function isDuplicateResult(result: ValidationResult): boolean {
  return (
    !result.passed &&
    (result.rule_name?.includes("Duplicate Invoice") ||
      result.message?.includes("Duplicate Invoice"))
  );
}

function DuplicateDetails({ result }: { result: ValidationResult }) {
  const parsed = parseDuplicateResult([result]);

  if (parsed.unavailable) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          The duplicate check could not run because the seller GSTIN or invoice
          number is missing from the parsed data.
        </p>
        <p className="text-xs text-muted-foreground">
          Ensure these fields are present and re-validate to check for duplicates.
        </p>
      </div>
    );
  }

  if (!parsed.found || parsed.matches.length === 0) {
    return <p className="text-sm text-muted-foreground">{result.message}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {result.actual_value || "Duplicate invoices found"} — matching documents:
      </p>
      <ul className="space-y-1.5">
        {parsed.matches.map((match) => (
          <li key={match.documentName} className="flex items-start gap-2 text-sm">
            <FileText className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            <div>
              <Link
                href={`/documents?search=${encodeURIComponent(match.documentName)}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {match.documentName}
              </Link>
              <Badge
                variant={match.matchType === "weak" ? "warning" : "error"}
                className="ml-2 text-[10px] px-1.5 py-0 align-middle"
              >
                {match.matchType === "exact_irn" ? "Exact IRN" : match.matchType === "strong" ? "Strong" : "Weak"}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                uploaded {match.uploadDate}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getMatchTypeLabel(match.matchType)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ValidationResultCard({ result }: { result: ValidationResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const severity = getValidationSeverity(result);
  const ruleType = getRuleType(result);
  const ruleName = getRuleName(result);
  const isDuplicate = isDuplicateResult(result);

  const hasDetails = result.message || (!result.passed && (result.expected_value || result.actual_value));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "rounded-lg border bg-card transition-all",
          result.passed
            ? "border-border/50"
            : severity === "error"
            ? "border-l-[3px] border-l-error border-y-border/50 border-r-border/50"
            : "border-l-[3px] border-l-warning border-y-border/50 border-r-border/50"
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors",
              hasDetails && "cursor-pointer hover:bg-muted/50",
              result.passed && "opacity-75"
            )}
          >
            {result.passed ? (
              <CheckCircle className="h-4 w-4 text-success shrink-0" />
            ) : severity === "error" ? (
              <XCircle className="h-4 w-4 text-error shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            )}
            <span className={cn(
              "text-sm font-medium truncate",
              result.passed && "text-muted-foreground font-normal"
            )}>
              {ruleName}
            </span>
            <Badge variant="outline" className="text-[11px] capitalize shrink-0 px-1.5 py-0">
              {ruleType.replace("_", "-")}
            </Badge>
            {isDuplicate && (
              <Badge variant="warning" className="text-[11px] shrink-0 px-1.5 py-0">
                <Copy className="h-3 w-3" />
                Duplicate
              </Badge>
            )}
            {result.reconciliation_critical && (
              <Badge variant="secondary" className="text-[11px] shrink-0 px-1.5 py-0">
                Recon Critical
              </Badge>
            )}
            <code className="ml-auto text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 hidden sm:block">
              {result.field_path}
            </code>
            {hasDetails && (
              <ChevronRight className={cn(
                "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform",
                isOpen && "rotate-90"
              )} />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 ml-7 space-y-2 border-t border-border/30 mt-0 pt-2">
            <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded sm:hidden">
              {result.field_path}
            </code>
            {isDuplicate ? (
              <DuplicateDetails result={result} />
            ) : (
              <p className="text-sm text-muted-foreground">{result.message}</p>
            )}
            {!result.passed && !isDuplicate && (result.expected_value || result.actual_value) && (
              <div className="text-sm space-y-1 font-mono">
                {result.expected_value && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">Expected</span>
                    <span className="text-xs text-success break-all">{result.expected_value}</span>
                  </div>
                )}
                {result.actual_value && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">Actual</span>
                    <span className="text-xs text-error break-all">{result.actual_value}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ValidationTab({
  validationResults,
  onRevalidate,
  isRevalidating,
}: ValidationTabProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const summary = getValidationSummary(validationResults);

  const filteredResults = validationResults.filter((result) => {
    const severity = getValidationSeverity(result);
    switch (filter) {
      case "passed":
        return result.passed;
      case "warnings":
        return !result.passed && severity === "warning";
      case "errors":
        return !result.passed && severity === "error";
      default:
        return true;
    }
  });

  // Group results by severity (errors first, then warnings, then passed)
  const sortedResults = [...filteredResults].sort((a, b) => {
    const severityA = getValidationSeverity(a);
    const severityB = getValidationSeverity(b);

    if (!a.passed && severityA === "error") return -1;
    if (!b.passed && severityB === "error") return 1;
    if (!a.passed && severityA === "warning") return -1;
    if (!b.passed && severityB === "warning") return 1;
    return 0;
  });

  if (validationResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShieldCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No validation results</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
          Run validation to check this document against business rules.
        </p>
        {onRevalidate && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onRevalidate}
            disabled={isRevalidating}
          >
            {isRevalidating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Run Validation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => setFilter("all")}
        >
          <CardContent className="px-3 py-2.5 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total Rules</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "passed" && "ring-2 ring-success"
          )}
          onClick={() => setFilter("passed")}
        >
          <CardContent className="px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-success">{summary.passed}</p>
            <p className="text-xs text-success">Passed</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "warnings" && "ring-2 ring-warning"
          )}
          onClick={() => setFilter("warnings")}
        >
          <CardContent className="px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-warning">{summary.warnings}</p>
            <p className="text-xs text-warning">Warnings</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "errors" && "ring-2 ring-error"
          )}
          onClick={() => setFilter("errors")}
        >
          <CardContent className="px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-error">{summary.errors}</p>
            <p className="text-xs text-error">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate invoice alert — shown prominently before other results */}
      <DuplicateInvoiceAlert validationResults={validationResults} />

      {/* Reconciliation status */}
      {summary.reconciliation_critical_total > 0 && (
        <Card
          className={cn(
            summary.reconciliation_critical_passed === summary.reconciliation_critical_total
              ? "border-transparent bg-success-bg"
              : "border-transparent bg-error-bg"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {summary.reconciliation_critical_passed === summary.reconciliation_critical_total ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-error" />
              )}
              <span className="font-medium">Reconciliation Status</span>
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {summary.reconciliation_critical_passed}/{summary.reconciliation_critical_total} reconciliation-critical rules passed.
              {summary.reconciliation_critical_passed === summary.reconciliation_critical_total && (
                <span className="ml-1 text-success">Ready for GSTR-2A/2B matching.</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter and results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Showing {filteredResults.length} of {validationResults.length} rules
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onRevalidate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRevalidate}
                disabled={isRevalidating}
              >
                {isRevalidating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                Re-validate
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {sortedResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No results match the selected filter.
            </p>
          ) : (
            sortedResults.map((result, index) => (
              <ValidationResultCard key={`${result.rule_id}-${result.field_path}-${index}`} result={result} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
