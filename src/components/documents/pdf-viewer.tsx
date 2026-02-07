"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle, ExternalLink, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  url: string | undefined;
  isLoading: boolean;
  fileName?: string;
  className?: string;
}

export function PDFViewer({ url, isLoading, fileName, className }: PDFViewerProps) {
  const [error, setError] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  // Reset error state when URL changes
  useEffect(() => {
    setError(false);
    setUseGoogleViewer(false);
  }, [url]);

  const handleRetry = () => {
    setError(false);
    setViewerKey((k) => k + 1);
  };

  const handleTryGoogleViewer = () => {
    setError(false);
    setUseGoogleViewer(true);
    setViewerKey((k) => k + 1);
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Get the viewer URL - use Google Docs viewer for S3/external URLs
  const getViewerUrl = () => {
    if (!url) return null;
    if (useGoogleViewer) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const viewerUrl = getViewerUrl();

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-lg mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!url || error) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-error-bg flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {error ? "Failed to load PDF" : "No document available"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {error
                  ? "There was an error loading the document. Please try again or use an alternative viewer."
                  : "The document file is not available for viewing."}
              </p>
            </div>
            {error && url && (
              <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RotateCw />
                    Retry
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                    <ExternalLink />
                    Open in new tab
                  </Button>
                </div>
                {!useGoogleViewer && (
                  <Button variant="secondary" size="sm" onClick={handleTryGoogleViewer}>
                    Try Google Docs Viewer
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background/50", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {fileName || "Document Preview"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRetry}
            title="Reload"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 relative overflow-hidden">
        {useGoogleViewer ? (
          <iframe
            key={viewerKey}
            src={viewerUrl || ""}
            className="absolute inset-0 w-full h-full border-0"
            title="PDF Document"
            onError={() => setError(true)}
          />
        ) : (
          <object
            key={viewerKey}
            data={viewerUrl || ""}
            type="application/pdf"
            className="absolute inset-0 w-full h-full border-0"
            onError={() => setError(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <p className="text-sm text-muted-foreground">
                  Unable to display PDF directly.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleTryGoogleViewer}>
                    Use Google Docs Viewer
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                    <ExternalLink />
                    Open in new tab
                  </Button>
                </div>
              </div>
            </div>
          </object>
        )}
      </div>
    </div>
  );
}
