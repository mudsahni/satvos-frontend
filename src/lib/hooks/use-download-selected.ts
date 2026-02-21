"use client";

import { useState, useCallback } from "react";
import { downloadSelectedDocumentsZip } from "@/lib/utils/zip-export";
import { toast } from "@/lib/hooks/use-toast";

interface UseDownloadSelectedOptions {
  /** Lookup map from document ID to document data. Must include `file_id`. */
  docMap: Map<string, { id: string; name: string; file_id: string }>;
  /** Filename for the resulting ZIP (without extension). */
  zipFilename?: string;
}

export function useDownloadSelected({ docMap, zipFilename = "selected-documents" }: UseDownloadSelectedOptions) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSelected = useCallback(async (ids: string[]) => {
    const docs = ids
      .map((docId) => docMap.get(docId))
      .filter((d): d is NonNullable<typeof d> => !!d?.file_id)
      .map((d) => ({ id: d.id, name: d.name, file_id: d.file_id }));

    if (docs.length === 0) {
      toast({ title: "No downloadable files", description: "Selected documents have no files attached.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadSelectedDocumentsZip({ documents: docs, zipFilename });
      toast({ title: "Download complete", description: `${docs.length} file${docs.length !== 1 ? "s" : ""} downloaded as ZIP.` });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }, [docMap, zipFilename]);

  return { downloadSelected, isDownloading };
}
