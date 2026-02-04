import apiClient from "./client";
import { ApiResponse, ApiPaginatedResponse, PaginatedResponse, transformPagination } from "@/types/api";
import {
  Collection,
  CollectionPermission,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddPermissionRequest,
  UpdatePermissionRequest,
  CollectionListParams,
} from "@/types/collection";

export async function getCollections(
  params?: CollectionListParams
): Promise<PaginatedResponse<Collection>> {
  const response = await apiClient.get<ApiPaginatedResponse<Collection>>(
    "/collections",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getCollection(id: string): Promise<Collection> {
  const response = await apiClient.get<ApiResponse<Collection>>(
    `/collections/${id}`
  );
  return response.data.data;
}

export async function createCollection(
  data: CreateCollectionRequest
): Promise<Collection> {
  const response = await apiClient.post<ApiResponse<Collection>>(
    "/collections",
    data
  );
  return response.data.data;
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionRequest
): Promise<Collection> {
  const response = await apiClient.put<ApiResponse<Collection>>(
    `/collections/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteCollection(id: string): Promise<void> {
  await apiClient.delete(`/collections/${id}`);
}

// Permissions
export async function getCollectionPermissions(
  collectionId: string
): Promise<CollectionPermission[]> {
  const response = await apiClient.get<ApiResponse<CollectionPermission[]>>(
    `/collections/${collectionId}/permissions`
  );
  return response.data.data;
}

export async function addCollectionPermission(
  collectionId: string,
  data: AddPermissionRequest
): Promise<CollectionPermission> {
  const response = await apiClient.post<ApiResponse<CollectionPermission>>(
    `/collections/${collectionId}/permissions`,
    data
  );
  return response.data.data;
}

export async function updateCollectionPermission(
  collectionId: string,
  permissionId: string,
  data: UpdatePermissionRequest
): Promise<CollectionPermission> {
  const response = await apiClient.put<ApiResponse<CollectionPermission>>(
    `/collections/${collectionId}/permissions/${permissionId}`,
    data
  );
  return response.data.data;
}

export async function deleteCollectionPermission(
  collectionId: string,
  permissionId: string
): Promise<void> {
  await apiClient.delete(
    `/collections/${collectionId}/permissions/${permissionId}`
  );
}
