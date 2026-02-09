"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  ImageIcon,
  AlertCircle,
  ExternalLink,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".tif"];

function isImageFile(fileName: string | undefined): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface DocumentViewerProps {
  url: string | undefined;
  isLoading: boolean;
  fileName?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Image Viewer                                                       */
/* ------------------------------------------------------------------ */

function ImageViewer({
  url,
  fileName,
  className,
}: {
  url: string;
  fileName?: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (error) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-error-bg flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Failed to load image</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                There was an error loading the image. Please try again.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setError(false)}>
                <RotateCw />
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink />
                Open in new tab
              </Button>
            </div>
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
          <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {fileName || "Image Preview"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            disabled={zoom <= 0.25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground min-w-[3rem] text-center transition-colors"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            disabled={zoom >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            title="Rotate"
            aria-label="Rotate image"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={fileName || "Document image"}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onError={() => setError(true)}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PDF Viewer (existing logic)                                        */
/* ------------------------------------------------------------------ */

function PDFContent({
  url,
  fileName,
  className,
}: {
  url: string;
  fileName?: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

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
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getViewerUrl = () => {
    if (useGoogleViewer) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const viewerUrl = getViewerUrl();

  if (error) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-error-bg flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Failed to load PDF</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                There was an error loading the document. Please try again or use
                an alternative viewer.
              </p>
            </div>
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTryGoogleViewer}
                >
                  Try Google Docs Viewer
                </Button>
              )}
            </div>
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
            onClick={handleOpenInNewTab}
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRetry}
            title="Reload"
            aria-label="Reload document"
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
            src={viewerUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="PDF Document"
            onError={() => setError(true)}
          />
        ) : (
          <object
            key={viewerKey}
            data={viewerUrl}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryGoogleViewer}
                  >
                    Use Google Docs Viewer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                  >
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

/* ------------------------------------------------------------------ */
/*  Main DocumentViewer — dispatches to PDF or Image                   */
/* ------------------------------------------------------------------ */

export function DocumentViewer({
  url,
  isLoading,
  fileName,
  className,
}: DocumentViewerProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
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

  if (!url) {
    return (
      <div className={cn("flex flex-col h-full bg-background/50", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-error-bg flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No document available</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                The document file is not available for viewing.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isImageFile(fileName)) {
    return (
      <ImageViewer url={url} fileName={fileName} className={className} />
    );
  }

  return (
    <PDFContent url={url} fileName={fileName} className={className} />
  );
}

// Re-export for backwards compatibility
export { DocumentViewer as PDFViewer };

// Export helper for testing
export { isImageFile };
