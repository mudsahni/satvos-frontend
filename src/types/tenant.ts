export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  is_active?: boolean;
}
