"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/files";
import { createDocument } from "@/lib/api/documents";
import { UploadProgress, FileRecord } from "@/types/file";
import { ParseMode } from "@/lib/constants";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

const UPLOAD_CONCURRENCY = 3;

export interface FileToUpload {
  id: string;
  file: File;
  selected: boolean;
  documentName: string;
}

export interface UploadOptions {
  parseMode?: ParseMode;
  collectionId: string;
}

export function useUpload() {
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);

  // Store context for retryFile to reuse
  const fileMapRef = useRef<Map<string, FileToUpload>>(new Map());
  const optionsRef = useRef<UploadOptions | null>(null);

  const updateUpload = useCallback(
    (fileId: string, update: Partial<UploadProgress>) => {
      setUploads((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, { ...existing, ...update });
        }
        return newMap;
      });
    },
    []
  );

  /** Upload a single file and create its document. Returns a result object. */
  const uploadSingleFile = useCallback(
    async (
      fileToUpload: FileToUpload,
      collectionId: string,
      parseMode: ParseMode
    ): Promise<{ fileId: string; documentId?: string; error?: string }> => {
      const { id: fileId, file, documentName } = fileToUpload;

      try {
        // Update status to uploading
        updateUpload(fileId, { status: "uploading", error: undefined });

        // Upload file
        const fileRecord = await uploadFile(file, collectionId, (progress) => {
          updateUpload(fileId, { progress });
        });

        updateUpload(fileId, {
          status: "uploaded",
          progress: 100,
          fileRecord: fileRecord as FileRecord,
        });

        // Create document
        updateUpload(fileId, { status: "creating_document" });

        try {
          const document = await createDocument({
            file_id: fileRecord.id,
            collection_id: collectionId,
            name: documentName || file.name.replace(/\.[^/.]+$/, ""),
            document_type: "invoice",
            parse_mode: parseMode,
          });

          updateUpload(fileId, {
            status: "completed",
            documentId: document.id,
          });
          return { fileId, documentId: document.id };
        } catch (docError) {
          updateUpload(fileId, {
            status: "error",
            error: getErrorMessage(docError),
          });
          return {
            fileId,
            error: `Document creation failed: ${getErrorMessage(docError)}`,
          };
        }
      } catch (error) {
        updateUpload(fileId, {
          status: "error",
          error: getErrorMessage(error),
        });
        return { fileId, error: getErrorMessage(error) };
      }
    },
    [updateUpload]
  );

  /** Invalidate caches after uploads finish. */
  const invalidateCaches = useCallback(
    (collectionId: string) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { collection_id: collectionId }],
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection", collectionId],
      });
    },
    [queryClient]
  );

  const uploadFiles = useCallback(
    async (filesToUpload: FileToUpload[], options: UploadOptions) => {
      const { parseMode = "single", collectionId } = options;
      const selectedFiles = filesToUpload.filter((f) => f.selected);

      if (selectedFiles.length === 0 || !collectionId) {
        return [];
      }

      // Store context for retryFile
      optionsRef.current = options;
      const newFileMap = new Map<string, FileToUpload>();
      selectedFiles.forEach((f) => newFileMap.set(f.id, f));
      fileMapRef.current = newFileMap;

      setIsUploading(true);

      // Initialize upload progress for selected files
      const initialUploads = new Map<string, UploadProgress>();
      selectedFiles.forEach((f) => {
        initialUploads.set(f.id, {
          file: f.file,
          progress: 0,
          status: "pending",
        });
      });
      setUploads(initialUploads);

      const results: {
        fileId: string;
        documentId?: string;
        error?: string;
      }[] = [];

      // Process files in parallel batches of UPLOAD_CONCURRENCY
      for (let i = 0; i < selectedFiles.length; i += UPLOAD_CONCURRENCY) {
        const batch = selectedFiles.slice(i, i + UPLOAD_CONCURRENCY);

        const batchResults = await Promise.allSettled(
          batch.map((fileToUpload) =>
            uploadSingleFile(fileToUpload, collectionId, parseMode)
          )
        );

        for (const settled of batchResults) {
          if (settled.status === "fulfilled") {
            results.push(settled.value);
          } else {
            // This shouldn't happen since uploadSingleFile catches all errors,
            // but handle it defensively
            results.push({ fileId: "unknown", error: String(settled.reason) });
          }
        }
      }

      setIsUploading(false);

      // Invalidate relevant caches so collection/document pages show fresh data
      invalidateCaches(collectionId);

      // Show summary toast
      const successful = results.filter((r) => !r.error).length;
      const failed = results.filter((r) => r.error).length;

      if (successful > 0 && failed === 0) {
        toast({
          title: "Upload complete",
          description: `${successful} file(s) uploaded successfully.`,
        });
      } else if (failed > 0) {
        toast({
          variant: "destructive",
          title: "Upload completed with errors",
          description: `${successful} succeeded, ${failed} failed.`,
        });
      }

      return results;
    },
    [uploadSingleFile, invalidateCaches]
  );

  const retryFile = useCallback(
    async (fileId: string) => {
      const fileToUpload = fileMapRef.current.get(fileId);
      const options = optionsRef.current;

      if (!fileToUpload || !options) {
        return;
      }

      const { parseMode = "single", collectionId } = options;

      // Reset the file status to pending before retrying
      updateUpload(fileId, {
        status: "pending",
        progress: 0,
        error: undefined,
        fileRecord: undefined,
        documentId: undefined,
      });

      const result = await uploadSingleFile(
        fileToUpload,
        collectionId,
        parseMode
      );

      // Invalidate caches after retry
      invalidateCaches(collectionId);

      if (!result.error) {
        toast({
          title: "Retry successful",
          description: `File uploaded successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Retry failed",
          description: result.error,
        });
      }

      return result;
    },
    [updateUpload, uploadSingleFile, invalidateCaches]
  );

  const removeUpload = useCallback((fileId: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }, []);

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  const overallProgress = useMemo(() => {
    const total = uploads.size;
    if (total === 0) return 0;
    let settled = 0;
    uploads.forEach((upload) => {
      if (upload.status === "completed" || upload.status === "error") {
        settled++;
      }
    });
    return Math.round((settled / total) * 100);
  }, [uploads]);

  return {
    uploads: Array.from(uploads.entries()),
    isUploading,
    uploadFiles,
    removeUpload,
    clearUploads,
    retryFile,
    overallProgress,
  };
}
