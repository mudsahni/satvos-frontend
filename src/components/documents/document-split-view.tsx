"use client";

import { useEffect, useState } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { Loader2, FileText } from "lucide-react";
import { PDFViewer } from "./pdf-viewer";
import { InlineParsedData } from "./inline-parsed-data";
import { ParsedInvoice } from "@/types/document";
import { ValidationResult } from "@/types/validation";
import { cn } from "@/lib/utils";

interface DocumentSplitViewProps {
  fileUrl: string | undefined;
  fileLoading: boolean;
  fileName?: string;
  parsedData: ParsedInvoice | undefined;
  validationResults: ValidationResult[];
  parsingStatus: "pending" | "processing" | "completed" | "failed";
}

const STORAGE_KEY = "satvos-document-panel-sizes";

type Layout = { [panelId: string]: number };

function getStoredLayout(): Layout | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const layout = JSON.parse(stored);
      if (typeof layout === "object" && layout !== null) {
        return layout;
      }
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

function storeLayout(layout: Layout) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Ignore errors
  }
}

function ParsingPlaceholder({ status }: { status: "pending" | "processing" | "failed" | "completed" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {status === "failed" ? (
        <>
          <div className="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Parsing Failed</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            There was an error processing this document. You can retry parsing
            from the actions menu.
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {status === "pending" ? "Waiting to Parse" : "Parsing Document"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {status === "pending"
              ? "Your document is queued for processing."
              : "Extracting data from your document..."}
          </p>
        </>
      )}
    </div>
  );
}

export function DocumentSplitView({
  fileUrl,
  fileLoading,
  fileName,
  parsedData,
  validationResults,
  parsingStatus,
}: DocumentSplitViewProps) {
  const pdfPanelId = "pdf-panel";
  const dataPanelId = "data-panel";

  const [defaultLayout, setDefaultLayout] = useState<Layout | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = getStoredLayout();
    if (stored) {
      setDefaultLayout(stored);
    } else {
      setDefaultLayout({ [pdfPanelId]: 50, [dataPanelId]: 50 });
    }
  }, []);

  const handleLayoutChange = (layout: Layout) => {
    storeLayout(layout);
  };

  const showParsedData = parsingStatus === "completed" && parsedData;

  // Wait for client-side hydration to avoid layout shift
  if (!isClient || !defaultLayout) {
    return (
      <div className="h-full flex">
        <div className="flex-1 bg-card/30" />
        <div className="w-2 bg-border/50" />
        <div className="flex-1 bg-card/30" />
      </div>
    );
  }

  return (
    <PanelGroup
      orientation="horizontal"
      className="h-full"
      defaultLayout={defaultLayout}
      onLayoutChanged={handleLayoutChange}
    >
      {/* PDF Viewer Panel */}
      <Panel
        id={pdfPanelId}
        minSize={25}
        className="bg-card/30"
      >
        <PDFViewer
          url={fileUrl}
          isLoading={fileLoading}
          fileName={fileName}
          className="h-full"
        />
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-2 group relative data-[resize-handle-active]:bg-primary/50">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-border/50 hover:bg-primary/50 transition-colors",
            "cursor-col-resize"
          )}
        >
          <div className="h-8 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary-foreground/50 transition-colors" />
        </div>
      </PanelResizeHandle>

      {/* Parsed Data Panel */}
      <Panel
        id={dataPanelId}
        minSize={30}
        className="bg-card/30"
      >
        {showParsedData ? (
          <InlineParsedData
            data={parsedData}
            validationResults={validationResults}
            className="h-full"
          />
        ) : (
          <ParsingPlaceholder status={parsingStatus} />
        )}
      </Panel>
    </PanelGroup>
  );
}

// Mobile-friendly stacked version
export function DocumentStackedView({
  fileUrl,
  fileLoading,
  fileName,
  parsedData,
  validationResults,
  parsingStatus,
}: DocumentSplitViewProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "data">("data");

  const showParsedData = parsingStatus === "completed" && parsedData;

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("pdf")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "pdf"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Document
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "data"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Parsed Data
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "pdf" ? (
          <PDFViewer
            url={fileUrl}
            isLoading={fileLoading}
            fileName={fileName}
            className="h-full"
          />
        ) : showParsedData ? (
          <InlineParsedData
            data={parsedData}
            validationResults={validationResults}
            className="h-full"
          />
        ) : (
          <ParsingPlaceholder status={parsingStatus} />
        )}
      </div>
    </div>
  );
}
