export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Backend pagination meta format
export interface PaginationMeta {
  total: number;
  offset: number;
  limit: number;
}

// Frontend normalized pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Backend returns data as array directly with meta for pagination
export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface ListParams {
  offset?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
}

// Helper to transform backend pagination to frontend format
export function transformPagination<T>(
  data: T[],
  meta?: PaginationMeta
): PaginatedResponse<T> {
  const total = meta?.total ?? data.length;
  const offset = meta?.offset ?? 0;
  const limit = meta?.limit ?? 20;
  const page = Math.floor(offset / limit) + 1;
  const total_pages = Math.ceil(total / limit);

  return {
    items: data,
    total,
    page,
    page_size: limit,
    total_pages,
  };
}
