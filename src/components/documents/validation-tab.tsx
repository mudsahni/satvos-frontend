"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ValidationResult,
  getValidationSummary,
  getValidationSeverity,
  getRuleType,
} from "@/types/validation";
import { cn } from "@/lib/utils";

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

function ValidationResultCard({ result }: { result: ValidationResult }) {
  const severity = getValidationSeverity(result);
  const ruleType = getRuleType(result);
  const ruleName = getRuleName(result);

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all",
        result.passed
          ? "border-transparent bg-success-bg"
          : severity === "error"
          ? "border-transparent bg-error-bg"
          : "border-transparent bg-warning-bg"
      )}
    >
      <div className="flex items-start gap-3">
        {result.passed ? (
          <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
        ) : severity === "error" ? (
          <XCircle className="h-5 w-5 text-error mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{ruleName}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {ruleType.replace("_", "-")}
            </Badge>
            {result.reconciliation_critical && (
              <Badge variant="secondary" className="text-xs">
                Recon Critical
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Field: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{result.field_path}</code>
          </p>
          <p className="text-sm mt-2">{result.message}</p>
          {!result.passed && (result.expected_value || result.actual_value) && (
            <div className="mt-3 text-sm space-y-1 p-2 bg-background/50 rounded">
              {result.expected_value && (
                <p className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">Expected:</span>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs break-all">
                    {result.expected_value}
                  </code>
                </p>
              )}
              {result.actual_value && (
                <p className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">Actual:</span>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs break-all">
                    {result.actual_value}
                  </code>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "all" && "ring-2 ring-primary"
          )}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{summary.total}</p>
            <p className="text-sm text-muted-foreground">Total Rules</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "passed" && "ring-2 ring-success"
          )}
          onClick={() => setFilter("passed")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">{summary.passed}</p>
            <p className="text-sm text-success">Passed</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "warnings" && "ring-2 ring-warning"
          )}
          onClick={() => setFilter("warnings")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">{summary.warnings}</p>
            <p className="text-sm text-warning">Warnings</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-all",
            filter === "errors" && "ring-2 ring-error"
          )}
          onClick={() => setFilter("errors")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-error">{summary.errors}</p>
            <p className="text-sm text-error">Errors</p>
          </CardContent>
        </Card>
      </div>

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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Re-validate
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
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
