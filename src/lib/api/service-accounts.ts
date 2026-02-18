import apiClient from "./client";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginatedResponse,
  transformPagination,
} from "@/types/api";
import {
  ServiceAccount,
  CreateServiceAccountRequest,
  CreateServiceAccountResponse,
  ServiceAccountPermission,
  GrantServiceAccountPermissionRequest,
  ServiceAccountListParams,
} from "@/types/service-account";

export async function getServiceAccounts(
  params?: ServiceAccountListParams
): Promise<PaginatedResponse<ServiceAccount>> {
  const response = await apiClient.get<ApiPaginatedResponse<ServiceAccount>>(
    "/service-accounts",
    { params }
  );
  return transformPagination(response.data.data, response.data.meta);
}

export async function getServiceAccount(id: string): Promise<ServiceAccount> {
  const response = await apiClient.get<ApiResponse<ServiceAccount>>(
    `/service-accounts/${id}`
  );
  return response.data.data;
}

export async function createServiceAccount(
  data: CreateServiceAccountRequest
): Promise<CreateServiceAccountResponse> {
  const response = await apiClient.post<
    ApiResponse<CreateServiceAccountResponse>
  >("/service-accounts", data);
  return response.data.data;
}

export async function rotateServiceAccountKey(
  id: string
): Promise<{ api_key: string }> {
  const response = await apiClient.post<ApiResponse<{ api_key: string }>>(
    `/service-accounts/${id}/rotate-key`
  );
  return response.data.data;
}

export async function revokeServiceAccount(id: string): Promise<void> {
  await apiClient.post(`/service-accounts/${id}/revoke`);
}

export async function deleteServiceAccount(id: string): Promise<void> {
  await apiClient.delete(`/service-accounts/${id}`);
}

export async function getServiceAccountPermissions(
  id: string
): Promise<ServiceAccountPermission[]> {
  const response = await apiClient.get<ApiResponse<ServiceAccountPermission[]>>(
    `/service-accounts/${id}/permissions`
  );
  return response.data.data;
}

export async function grantServiceAccountPermission(
  id: string,
  data: GrantServiceAccountPermissionRequest
): Promise<ServiceAccountPermission> {
  const response = await apiClient.post<ApiResponse<ServiceAccountPermission>>(
    `/service-accounts/${id}/permissions`,
    data
  );
  return response.data.data;
}

export async function removeServiceAccountPermission(
  id: string,
  collectionId: string
): Promise<void> {
  await apiClient.delete(
    `/service-accounts/${id}/permissions/${collectionId}`
  );
}
