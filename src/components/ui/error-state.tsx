"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
        <AlertCircle className="h-8 w-8 text-error" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw />
          Try again
        </Button>
      )}
    </div>
  );
}

export function InlineErrorState({
  message = "Failed to load data.",
  onRetry,
  className,
}: Omit<ErrorStateProps, "title">) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-error-border bg-error-bg p-3",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-error" />
      <p className="text-sm text-error flex-1">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
