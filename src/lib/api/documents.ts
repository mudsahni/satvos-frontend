import apiClient from "./client";
import { ApiResponse, ApiPaginatedResponse, PaginatedResponse, transformPagination } from "@/types/api";
import {
  Document,
  DocumentTag,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ReviewDocumentRequest,
  AssignDocumentRequest,
  AddTagsRequest,
  DocumentListParams,
} from "@/types/document";
import { ValidationResult } from "@/types/validation";

export async function getDocuments(
  params?: DocumentListParams
): Promise<PaginatedResponse<Document>> {
  const response = await apiClient.get<ApiPaginatedResponse<Document>>(
    "/documents",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getDocument(id: string): Promise<Document> {
  const response = await apiClient.get<ApiResponse<Document>>(
    `/documents/${id}`
  );
  return response.data.data;
}

export async function createDocument(
  data: CreateDocumentRequest
): Promise<Document> {
  const response = await apiClient.post<ApiResponse<Document>>(
    "/documents",
    data
  );
  return response.data.data;
}

export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<Document> {
  const response = await apiClient.put<ApiResponse<Document>>(
    `/documents/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

// Parsing
export async function triggerParsing(
  id: string,
  parseMode?: "single" | "dual"
): Promise<Document> {
  const response = await apiClient.post<ApiResponse<Document>>(
    `/documents/${id}/retry`,
    { parse_mode: parseMode }
  );
  return response.data.data;
}

// Validation
export async function getValidationResults(
  id: string
): Promise<ValidationResult[]> {
  const response = await apiClient.get<ApiResponse<ValidationResult[]>>(
    `/documents/${id}/validation`
  );
  return response.data.data;
}

export async function triggerValidation(id: string): Promise<Document> {
  const response = await apiClient.post<ApiResponse<Document>>(
    `/documents/${id}/validate`
  );
  return response.data.data;
}

// Assignment
export async function assignDocument(
  id: string,
  data: AssignDocumentRequest
): Promise<Document> {
  const response = await apiClient.put<ApiResponse<Document>>(
    `/documents/${id}/assign`,
    data
  );
  return response.data.data;
}

// Review Queue
export async function getReviewQueue(
  params?: { offset?: number; limit?: number }
): Promise<PaginatedResponse<Document>> {
  const response = await apiClient.get<ApiPaginatedResponse<Document>>(
    "/documents/review-queue",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

// Review
export async function reviewDocument(
  id: string,
  data: ReviewDocumentRequest
): Promise<Document> {
  const response = await apiClient.put<ApiResponse<Document>>(
    `/documents/${id}/review`,
    data
  );
  return response.data.data;
}

// Tags
export async function getDocumentTags(id: string): Promise<DocumentTag[]> {
  const response = await apiClient.get<ApiResponse<DocumentTag[]>>(
    `/documents/${id}/tags`
  );
  return response.data.data;
}

export async function addDocumentTag(
  id: string,
  data: AddTagsRequest
): Promise<DocumentTag[]> {
  const response = await apiClient.post<ApiResponse<DocumentTag[]>>(
    `/documents/${id}/tags`,
    data
  );
  return response.data.data;
}

export async function deleteDocumentTag(
  documentId: string,
  tagId: string
): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/tags/${tagId}`);
}
