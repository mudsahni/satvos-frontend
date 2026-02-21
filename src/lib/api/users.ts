import apiClient from "./client";
import { ApiResponse, ApiPaginatedResponse, PaginatedResponse, transformPagination } from "@/types/api";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
} from "@/types/user";

export async function getUsers(
  params?: UserListParams
): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<ApiPaginatedResponse<User>>("/users", {
    params,
  });
  return transformPagination(response.data.data, response.data.meta);
}

export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>("/users", data);
  return response.data.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function resendInvitation(id: string): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `/users/${id}/resend-invitation`
  );
  return response.data.data;
}

// Search users (for permission assignment)
export async function searchUsers(query: string): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>("/users/search", {
    params: { q: query },
  });
  return response.data.data;
}
