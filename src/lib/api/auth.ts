import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponseData,
} from "@/types/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    data
  );
  return response.data.data;
}

export async function refreshToken(
  data: RefreshRequest
): Promise<RefreshResponse> {
  const response = await apiClient.post<ApiResponse<RefreshResponse>>(
    "/auth/refresh",
    data
  );
  return response.data.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponseData> {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    "/auth/register",
    data
  );
  return response.data.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore errors on logout - we'll clear local state anyway
  }
}
