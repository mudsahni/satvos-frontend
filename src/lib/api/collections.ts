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
  return mapCollectionPermission({ ...collection, current_user_permission });
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
// Backend returns `permission` field; frontend uses `permission_level`.
// Backend doesn't embed a `user` object; frontend resolves via UserName.
interface RawCollectionPermission {
  id: string;
  collection_id: string;
  tenant_id?: string;
  user_id: string;
  permission: PermissionLevel;
  granted_by?: string;
  created_at: string;
}

function mapPermissionEntry(raw: RawCollectionPermission): CollectionPermission {
  return {
    id: raw.id,
    collection_id: raw.collection_id,
    user_id: raw.user_id,
    permission_level: raw.permission,
    created_at: raw.created_at,
    updated_at: raw.created_at,
  };
}

export async function getCollectionPermissions(
  collectionId: string
): Promise<CollectionPermission[]> {
  const response = await apiClient.get<ApiResponse<RawCollectionPermission[]>>(
    `/collections/${collectionId}/permissions`
  );
  return response.data.data.map(mapPermissionEntry);
}

export async function addCollectionPermission(
  collectionId: string,
  data: AddPermissionRequest
): Promise<CollectionPermission> {
  const response = await apiClient.post<ApiResponse<RawCollectionPermission>>(
    `/collections/${collectionId}/permissions`,
    { user_id: data.user_id, permission: data.permission_level }
  );
  return mapPermissionEntry(response.data.data);
}

export async function updateCollectionPermission(
  collectionId: string,
  userId: string,
  data: UpdatePermissionRequest
): Promise<CollectionPermission> {
  const response = await apiClient.put<ApiResponse<RawCollectionPermission>>(
    `/collections/${collectionId}/permissions/${userId}`,
    { permission: data.permission_level }
  );
  return mapPermissionEntry(response.data.data);
}

export async function deleteCollectionPermission(
  collectionId: string,
  userId: string
): Promise<void> {
  await apiClient.delete(
    `/collections/${collectionId}/permissions/${userId}`
  );
}

// CSV Export
export async function exportCollectionCsv(
  collectionId: string,
  collectionName?: string
): Promise<void> {
  const response = await apiClient.get(
    `/collections/${collectionId}/export/csv`,
    { responseType: "blob" }
  );

  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  try {
    a.href = url;
    a.download = `${collectionName || collectionId}.csv`;
    document.body.appendChild(a);
    a.click();
  } finally {
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
