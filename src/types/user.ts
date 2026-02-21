import { Role } from "@/lib/constants";

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at: string | null;
  auth_provider?: "email" | "google" | "api_key";
  created_at: string;
  updated_at: string;
  monthly_document_limit?: number;
  documents_used_this_period?: number;
  current_period_start?: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password?: string;
  role: Role;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  password?: string;
  role?: Role;
  is_active?: boolean;
}

export interface UserListParams {
  offset?: number;
  limit?: number;
  search?: string;
  role?: Role;
  is_active?: boolean;
  sort_by?: "email" | "full_name" | "created_at";
  sort_order?: "asc" | "desc";
}
