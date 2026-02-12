import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponseData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
  SocialLoginResponse,
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

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await apiClient.get<ApiResponse<{ message: string }>>(
    "/auth/verify-email",
    { params: { token } }
  );
  return response.data.data;
}

export async function resendVerification(): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/resend-verification"
  );
  return response.data.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forgot-password",
    data
  );
  return response.data.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    data
  );
  return response.data.data;
}

export async function socialLogin(data: SocialLoginRequest): Promise<SocialLoginResponse> {
  const response = await apiClient.post<ApiResponse<SocialLoginResponse>>(
    "/auth/social-login",
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
