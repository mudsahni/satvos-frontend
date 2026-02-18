import { PermissionLevel } from "@/lib/constants";

export interface ServiceAccount {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  api_key_prefix: string;
  is_active: boolean;
  created_by: string;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceAccountRequest {
  name: string;
  description?: string;
  expires_at?: string;
}

export interface CreateServiceAccountResponse {
  service_account: ServiceAccount;
  api_key: string;
}

export interface ServiceAccountPermission {
  id: string;
  service_account_id: string;
  collection_id: string;
  tenant_id: string;
  permission: PermissionLevel;
  granted_by: string;
}

export interface GrantServiceAccountPermissionRequest {
  collection_id: string;
  permission: PermissionLevel;
}

export interface ServiceAccountListParams {
  offset?: number;
  limit?: number;
}
