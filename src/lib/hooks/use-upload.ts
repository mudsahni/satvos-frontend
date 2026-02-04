"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/files";
import { createDocument } from "@/lib/api/documents";
import { UploadProgress, FileRecord } from "@/types/file";
import { ParseMode } from "@/lib/constants";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

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

  const uploadFiles = useCallback(
    async (filesToUpload: FileToUpload[], options: UploadOptions) => {
      const { parseMode = "single", collectionId } = options;
      const selectedFiles = filesToUpload.filter((f) => f.selected);

      if (selectedFiles.length === 0 || !collectionId) {
        return [];
      }

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

      // Process files sequentially for per-file progress
      for (const fileToUpload of selectedFiles) {
        const { id: fileId, file, documentName } = fileToUpload;

        try {
          // Update status to uploading
          updateUpload(fileId, { status: "uploading" });

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
            results.push({ fileId, documentId: document.id });
          } catch (docError) {
            updateUpload(fileId, {
              status: "error",
              error: getErrorMessage(docError),
            });
            results.push({
              fileId,
              error: `Document creation failed: ${getErrorMessage(docError)}`,
            });
          }
        } catch (error) {
          updateUpload(fileId, {
            status: "error",
            error: getErrorMessage(error),
          });
          results.push({ fileId, error: getErrorMessage(error) });
        }
      }

      setIsUploading(false);

      // Invalidate relevant caches so collection/document pages show fresh data
      queryClient.invalidateQueries({
        queryKey: ["documents", { collection_id: collectionId }],
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection", collectionId],
      });

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
    [updateUpload, queryClient]
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

  return {
    uploads: Array.from(uploads.entries()),
    isUploading,
    uploadFiles,
    removeUpload,
    clearUploads,
  };
}
