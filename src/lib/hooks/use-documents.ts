"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage } from "@/lib/api/client";

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
      // Poll every 2 seconds while parsing
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Document created",
        description: "Your document has been created and is being processed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      toast({
        title: "Document updated",
        description: "Your document has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document deleted",
        description: "Your document has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useTriggerParsing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      parseMode,
    }: {
      id: string;
      parseMode?: "single" | "dual";
    }) => triggerParsing(id, parseMode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      toast({
        title: "Parsing started",
        description: "Your document is being parsed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => triggerValidation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["validation-results", id] });
      toast({
        title: "Validation started",
        description: "Your document is being validated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewDocumentRequest }) =>
      reviewDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      toast({
        title:
          variables.data.status === "approved"
            ? "Document approved"
            : "Document rejected",
        description: `The document has been ${variables.data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddTagsRequest }) =>
      addDocumentTag(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["document-tags", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      toast({
        title: "Tag added",
        description: "Tag has been added to the document.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      tagId,
    }: {
      documentId: string;
      tagId: string;
    }) => deleteDocumentTag(documentId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["document-tags", variables.documentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["document", variables.documentId],
      });
      toast({
        title: "Tag removed",
        description: "Tag has been removed from the document.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    },
  });
}
