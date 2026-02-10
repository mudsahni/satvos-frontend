"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  triggerParsing,
  getValidationResults,
  triggerValidation,
  reviewDocument,
  getDocumentTags,
  addDocumentTag,
  deleteDocumentTag,
} from "@/lib/api/documents";
import {
  DocumentListParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ReviewDocumentRequest,
  AddTagsRequest,
} from "@/types/document";
import { useMutationWithToast } from "./use-mutation-with-toast";

export function useDocuments(params?: DocumentListParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => getDocuments(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const items = query.state.data?.items;
      if (!items) return false;
      const hasActiveProcessing = items.some(
        (doc) =>
          doc.parsing_status === "pending" ||
          doc.parsing_status === "processing"
      );
      return hasActiveProcessing ? 3000 : false;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.parsing_status === "pending" ||
        data?.parsing_status === "processing"
      ) {
        return 2000;
      }
      return false;
    },
  });
}

export function useCreateDocument() {
  return useMutationWithToast({
    mutationFn: (data: CreateDocumentRequest) => createDocument(data),
    invalidateKeys: [["documents"], ["collections"], ["stats"], ["user"]],
    successMessage: {
      title: "Document created",
      description: "Your document has been created and is being processed.",
    },
  });
}

export function useUpdateDocument() {
  return useMutationWithToast({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      updateDocument(id, data),
    invalidateKeys: [
      ["documents"],
      (vars) => ["document", vars.id],
    ],
    successMessage: {
      title: "Document updated",
      description: "Your document has been updated successfully.",
    },
  });
}

export function useDeleteDocument() {
  return useMutationWithToast({
    mutationFn: (id: string) => deleteDocument(id),
    invalidateKeys: [["documents"], ["stats"]],
    successMessage: {
      title: "Document deleted",
      description: "Your document has been deleted successfully.",
    },
  });
}

export function useTriggerParsing() {
  return useMutationWithToast({
    mutationFn: ({
      id,
      parseMode,
    }: {
      id: string;
      parseMode?: "single" | "dual";
    }) => triggerParsing(id, parseMode),
    invalidateKeys: [(vars) => ["document", vars.id]],
    successMessage: {
      title: "Parsing started",
      description: "Your document is being parsed.",
    },
  });
}

export function useValidationResults(documentId: string) {
  return useQuery({
    queryKey: ["validation-results", documentId],
    queryFn: () => getValidationResults(documentId),
    enabled: !!documentId,
  });
}

export function useTriggerValidation() {
  return useMutationWithToast({
    mutationFn: (id: string) => triggerValidation(id),
    invalidateKeys: [
      (id) => ["document", id],
      (id) => ["validation-results", id],
      ["stats"],
    ],
    successMessage: {
      title: "Validation started",
      description: "Your document is being validated.",
    },
  });
}

export function useReviewDocument() {
  return useMutationWithToast({
    mutationFn: ({ id, data }: { id: string; data: ReviewDocumentRequest }) =>
      reviewDocument(id, data),
    invalidateKeys: [
      ["documents"],
      (vars) => ["document", vars.id],
      ["stats"],
    ],
    successMessage: (_, vars) => ({
      title:
        vars.data.status === "approved"
          ? "Document approved"
          : "Document rejected",
      description: `The document has been ${vars.data.status}.`,
    }),
  });
}

// Tags hooks
export function useDocumentTags(documentId: string) {
  return useQuery({
    queryKey: ["document-tags", documentId],
    queryFn: () => getDocumentTags(documentId),
    enabled: !!documentId,
  });
}

export function useAddDocumentTag() {
  return useMutationWithToast({
    mutationFn: ({ id, data }: { id: string; data: AddTagsRequest }) =>
      addDocumentTag(id, data),
    invalidateKeys: [
      (vars) => ["document-tags", vars.id],
      (vars) => ["document", vars.id],
    ],
    successMessage: {
      title: "Tag added",
      description: "Tag has been added to the document.",
    },
  });
}

export function useDeleteDocumentTag() {
  return useMutationWithToast({
    mutationFn: ({
      documentId,
      tagId,
    }: {
      documentId: string;
      tagId: string;
    }) => deleteDocumentTag(documentId, tagId),
    invalidateKeys: [
      (vars) => ["document-tags", vars.documentId],
      (vars) => ["document", vars.documentId],
    ],
    successMessage: {
      title: "Tag removed",
      description: "Tag has been removed from the document.",
    },
  });
}
