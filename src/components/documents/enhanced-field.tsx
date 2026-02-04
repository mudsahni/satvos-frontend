"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldWithConfidence } from "@/types/document";
import { ValidationResult, getFieldValidationStatus } from "@/types/validation";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface EnhancedFieldProps {
  label: string;
  field: FieldWithConfidence<unknown> | undefined;
  fieldPath: string;
  validationResults: ValidationResult[];
  format?: "currency" | "percentage" | "text";
  className?: string;
}

function getConfidenceBadgeVariant(
  confidence: number
): "success-subtle" | "warning-subtle" | "error-subtle" {
  if (confidence >= 0.9) return "success-subtle";
  if (confidence >= 0.7) return "warning-subtle";
  return "error-subtle";
}

function ValidationIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  switch (status) {
    case "valid":
      return (
        <CheckCircle className={cn("h-4 w-4 text-success", className)} />
      );
    case "warning":
      return (
        <AlertTriangle className={cn("h-4 w-4 text-warning", className)} />
      );
    case "invalid":
      return <XCircle className={cn("h-4 w-4 text-error", className)} />;
    default:
      return (
        <HelpCircle className={cn("h-4 w-4 text-muted-foreground", className)} />
      );
  }
}

export function EnhancedField({
  label,
  field,
  fieldPath,
  validationResults,
  format = "text",
  className,
}: EnhancedFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!field) return null;

  const status = getFieldValidationStatus(validationResults, fieldPath);
  const hasIssues = status.messages.length > 0;

  let displayValue = field.value;
  if (format === "currency" && typeof field.value === "number") {
    displayValue = formatCurrency(field.value);
  } else if (format === "percentage" && typeof field.value === "number") {
    displayValue = formatPercentage(field.value);
  }

  const content = (
    <div
      className={cn(
        "group relative rounded-lg border px-4 py-3 transition-all",
        status.status === "invalid" &&
          "border-error/50 bg-error-bg/30",
        status.status === "warning" &&
          "border-warning/50 bg-warning-bg/30",
        status.status === "valid" && "border-border hover:border-border/80",
        status.status === "unsure" && "border-border/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Label row with validation icon */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <ValidationIcon status={status.status} className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {status.messages.length > 0
                  ? status.messages.join("; ")
                  : status.status === "valid"
                  ? "All validations passed"
                  : "No validation rules for this field"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Value */}
          <p className="font-medium text-foreground truncate">
            {String(displayValue)}
          </p>
        </div>

        {/* Confidence badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={getConfidenceBadgeVariant(field.confidence)}
                className="text-xs cursor-help"
              >
                {formatPercentage(field.confidence)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              Extraction confidence: {formatPercentage(field.confidence)}
            </TooltipContent>
          </Tooltip>

          {hasIssues && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );

  // If there are validation issues, wrap in collapsible
  if (hasIssues) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">{content}</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 mt-2 space-y-2 animate-fade-in">
            {status.messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "text-sm px-3 py-2 rounded-md border-l-2",
                  status.status === "invalid"
                    ? "bg-error-bg/50 border-error text-error"
                    : "bg-warning-bg/50 border-warning text-warning"
                )}
              >
                {message}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return content;
}
