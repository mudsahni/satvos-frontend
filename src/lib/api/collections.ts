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
import { PermissionLevel } from "@/lib/constants";

// Backend sends `current_user_permission`; frontend type uses `user_permission`.
// Map the field so all UI code sees `user_permission`.
function mapCollectionPermission(
  raw: Collection & { current_user_permission?: PermissionLevel }
): Collection {
  const { current_user_permission, ...rest } = raw;
  return {
    ...rest,
    user_permission: rest.user_permission ?? current_user_permission,
  };
}

export async function getCollections(
  params?: CollectionListParams
): Promise<PaginatedResponse<Collection>> {
  const response = await apiClient.get<ApiPaginatedResponse<Collection>>(
    "/collections",
    { params }
  );
  const result = transformPagination(response.data.data, response.data.meta);
  return {
    ...result,
    items: result.items.map(mapCollectionPermission),
  };
}

export async function getCollection(id: string): Promise<Collection> {
  const response = await apiClient.get<
    ApiResponse<{ collection: Collection; current_user_permission?: PermissionLevel }>
  >(`/collections/${id}`);
  const { collection, current_user_permission } = response.data.data;
  return {
    ...collection,
    user_permission: collection.user_permission ?? current_user_permission,
  };
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
