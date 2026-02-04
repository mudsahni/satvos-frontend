"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ValidationResult, getValidationSummary } from "@/types/validation";
import { cn } from "@/lib/utils";

interface ValidationPanelProps {
  documentId: string;
  validationResults: ValidationResult[];
  onRevalidate: () => void;
  isRevalidating: boolean;
}

type FilterType = "all" | "passed" | "warnings" | "errors";

function ValidationResultCard({ result }: { result: ValidationResult }) {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg",
        result.passed
          ? "border-success-border bg-success-bg"
          : result.severity === "error"
          ? "border-error-border bg-error-bg"
          : "border-warning-border bg-warning-bg"
      )}
    >
      <div className="flex items-start gap-3">
        {result.passed ? (
          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
        ) : result.severity === "error" ? (
          <XCircle className="h-5 w-5 text-error mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium capitalize">
              {result.rule_type}: {result.rule_name}
            </span>
            {result.reconciliation_critical && (
              <Badge variant="outline" className="text-xs">
                Reconciliation Critical
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Field: <code className="bg-muted px-1 rounded">{result.field_path}</code>
          </p>
          <p className="text-sm mt-2">{result.message}</p>
          {!result.passed && (
            <div className="mt-2 text-sm">
              {result.expected_value && (
                <p>
                  <span className="text-muted-foreground">Expected:</span>{" "}
                  <code className="bg-muted px-1 rounded">
                    {result.expected_value}
                  </code>
                </p>
              )}
              {result.actual_value && (
                <p>
                  <span className="text-muted-foreground">Actual:</span>{" "}
                  <code className="bg-muted px-1 rounded">
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

export function ValidationPanel(props: ValidationPanelProps) {
  const { validationResults, onRevalidate, isRevalidating } = props;
  const [filter, setFilter] = useState<FilterType>("all");

  const summary = getValidationSummary(validationResults);

  const filteredResults = validationResults.filter((result) => {
    switch (filter) {
      case "passed":
        return result.passed;
      case "warnings":
        return !result.passed && result.severity === "warning";
      case "errors":
        return !result.passed && result.severity === "error";
      default:
        return true;
    }
  });

  if (validationResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 font-medium">No validation results</p>
            <p className="text-sm text-muted-foreground">
              Run validation to check this document
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={onRevalidate}
              disabled={isRevalidating}
            >
              {isRevalidating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Validation Summary</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{summary.total}</p>
              <p className="text-sm text-muted-foreground">Total Rules</p>
            </div>
            <div className="text-center p-4 bg-success-bg rounded-lg">
              <p className="text-3xl font-bold text-success">{summary.passed}</p>
              <p className="text-sm text-success">Passed</p>
            </div>
            <div className="text-center p-4 bg-warning-bg rounded-lg">
              <p className="text-3xl font-bold text-warning">
                {summary.warnings}
              </p>
              <p className="text-sm text-warning">Warnings</p>
            </div>
            <div className="text-center p-4 bg-error-bg rounded-lg">
              <p className="text-3xl font-bold text-error">{summary.errors}</p>
              <p className="text-sm text-error">Errors</p>
            </div>
          </div>

          {/* Reconciliation Status */}
          {summary.reconciliation_critical_total > 0 && (
            <div
              className={cn(
                "mt-4 p-4 rounded-lg",
                summary.reconciliation_critical_passed ===
                  summary.reconciliation_critical_total
                  ? "bg-success-bg border border-success-border"
                  : "bg-warning-bg border border-warning-border"
              )}
            >
              <div className="flex items-center gap-2">
                {summary.reconciliation_critical_passed ===
                summary.reconciliation_critical_total ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
                <span className="font-medium">Reconciliation Status</span>
              </div>
              <p className="text-sm mt-1">
                {summary.reconciliation_critical_passed}/
                {summary.reconciliation_critical_total} reconciliation-critical
                rules passed.
                {summary.reconciliation_critical_passed ===
                  summary.reconciliation_critical_total && (
                  <span className="ml-1 text-success">
                    Ready for GSTR-2A/2B matching.
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Validation Results</CardTitle>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all">All ({summary.total})</TabsTrigger>
                <TabsTrigger value="passed">
                  Passed ({summary.passed})
                </TabsTrigger>
                <TabsTrigger value="warnings">
                  Warnings ({summary.warnings})
                </TabsTrigger>
                <TabsTrigger value="errors">Errors ({summary.errors})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No results match the selected filter.
                </p>
              ) : (
                filteredResults.map((result, index) => (
                  <ValidationResultCard key={`${result.rule_id}-${result.field_path}-${index}`} result={result} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
