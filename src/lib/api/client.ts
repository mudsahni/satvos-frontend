import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/constants";
import { getAuthState, useAuthStore } from "@/store/auth-store";
import { ApiResponse } from "@/types/api";

// Renew the middleware auth cookie (called on login and token refresh)
function renewAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "satvos-auth-state=authenticated; path=/; max-age=86400";
  }
}

// Clear the middleware auth cookie and redirect to login with context
function handleSessionExpired() {
  if (typeof document !== "undefined") {
    document.cookie = "satvos-auth-state=; path=/; max-age=0";
  }
  if (typeof window !== "undefined") {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?session_expired=true&returnUrl=${returnUrl}`;
  }
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = getAuthState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Network error (no response) while a refresh is in progress — queue for retry
    // Handles ECONNRESET/timeout when the server closes the connection after 401
    if (!error.response && isRefreshing && !originalRequest._retry) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          originalRequest._retry = true;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh for public auth endpoints — they use their own
    // authentication mechanisms (credentials, reset tokens, etc.),
    // not Bearer tokens, so a 401 here is a real error, not a stale token.
    const publicAuthPaths = [
      "/auth/login",
      "/auth/refresh",
      "/auth/register",
      "/auth/verify-email",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    if (publicAuthPaths.some((path) => originalRequest.url?.includes(path))) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue request while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, logout, setTokens } = useAuthStore.getState();

    if (!refreshToken) {
      isRefreshing = false;
      logout();
      handleSessionExpired();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { timeout: 15000 }
      );

      const { access_token, refresh_token } = response.data.data;

      setTokens({
        access_token,
        refresh_token,
      });

      // Renew the middleware cookie so it stays in sync with tokens
      renewAuthCookie();

      processQueue(null, access_token);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      logout();
      handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    if (axiosError.response?.data?.error?.message) {
      return axiosError.response.data.error.message;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// Helper to check if error is a specific API error code
export function isApiError(error: unknown, code: string): boolean {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.error?.code === code;
  }
  return false;
}

// Check if an error is a 403 EMAIL_NOT_VERIFIED response
export function isEmailNotVerifiedError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      axiosError.response?.status === 403 &&
      axiosError.response?.data?.error?.code === "EMAIL_NOT_VERIFIED"
    );
  }
  return false;
}

export { renewAuthCookie };
export default apiClient;
