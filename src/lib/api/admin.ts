import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import { Tenant, UpdateTenantRequest } from "@/types/tenant";

export async function getTenant(): Promise<Tenant> {
  const response = await apiClient.get<ApiResponse<Tenant>>("/admin/tenant");
  return response.data.data;
}

export async function updateTenant(data: UpdateTenantRequest): Promise<Tenant> {
  const response = await apiClient.put<ApiResponse<Tenant>>(
    "/admin/tenant",
    data
  );
  return response.data.data;
}
