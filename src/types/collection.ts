import { PermissionLevel } from "@/lib/constants";
import { User } from "./auth";

export interface Collection {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Document count - handle various possible API field names
  files_count?: number;
  documents_count?: number;
  document_count?: number;
  file_count?: number;
  total_documents?: number;
  user_permission?: PermissionLevel;
}

// Helper to get document count from collection (handles various field names)
export function getCollectionDocumentCount(collection: Collection): number {
  return (
    collection.documents_count ??
    collection.document_count ??
    collection.files_count ??
    collection.file_count ??
    collection.total_documents ??
    0
  );
}

export interface CollectionPermission {
  id: string;
  collection_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

export interface AddPermissionRequest {
  user_id: string;
  permission_level: PermissionLevel;
}

export interface UpdatePermissionRequest {
  permission_level: PermissionLevel;
}

export interface CollectionListParams {
  offset?: number;
  limit?: number;
  search?: string;
  sort_by?: "name" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}
