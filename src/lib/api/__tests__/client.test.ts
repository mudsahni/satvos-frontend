import axios, { AxiosError, AxiosHeaders } from "axios";
import MockAdapter from "axios-mock-adapter";
import { getErrorMessage, isApiError, renewAuthCookie } from "@/lib/api/client";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api";

// Helper to create an AxiosError with a typed response
function createAxiosError(
  responseData?: Partial<ApiResponse<unknown>>,
  message = "Request failed"
): AxiosError<ApiResponse<unknown>> {
  const headers = new AxiosHeaders();
  const config = {
    headers,
  };

  if (responseData) {
    return new AxiosError(message, "ERR_BAD_REQUEST", config, null, {
      data: responseData as ApiResponse<unknown>,
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    });
  }

  // No response (e.g. network error)
  return new AxiosError(message, "ERR_NETWORK", config, null, undefined);
}

describe("getErrorMessage", () => {
  it("returns response.data.error.message when present", () => {
    const error = createAxiosError({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid invoice number",
      },
    });

    expect(getErrorMessage(error)).toBe("Invalid invoice number");
  });

  it("returns response.data.message when error.message is not present", () => {
    const error = createAxiosError({
      success: false,
      data: null,
      message: "Document not found",
    });

    expect(getErrorMessage(error)).toBe("Document not found");
  });

  it("returns error.message when response has no data messages", () => {
    const error = createAxiosError({
      success: false,
      data: null,
    }, "Request failed with status code 500");

    expect(getErrorMessage(error)).toBe("Request failed with status code 500");
  });

  it("returns error.message when there is no response (network error)", () => {
    const error = createAxiosError(undefined, "Network Error");

    expect(getErrorMessage(error)).toBe("Network Error");
  });

  it("returns error.message for a regular Error", () => {
    const error = new Error("Something went wrong");

    expect(getErrorMessage(error)).toBe("Something went wrong");
  });

  it("returns 'An unexpected error occurred' for unknown error types", () => {
    expect(getErrorMessage("string error")).toBe("An unexpected error occurred");
    expect(getErrorMessage(42)).toBe("An unexpected error occurred");
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
    expect(getErrorMessage({ random: "object" })).toBe("An unexpected error occurred");
  });

  it("prefers response.data.error.message over response.data.message", () => {
    const error = createAxiosError({
      success: false,
      data: null,
      message: "Generic message",
      error: {
        code: "SPECIFIC_ERROR",
        message: "Specific error message",
      },
    });

    expect(getErrorMessage(error)).toBe("Specific error message");
  });

  it("prefers response.data.message over error.message", () => {
    const error = createAxiosError(
      {
        success: false,
        data: null,
        message: "Server provided message",
      },
      "Axios default message"
    );

    expect(getErrorMessage(error)).toBe("Server provided message");
  });
});

describe("isApiError", () => {
  it("returns true when error code matches", () => {
    const error = createAxiosError({
      success: false,
      data: null,
      error: {
        code: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      },
    });

    expect(isApiError(error, "DOCUMENT_NOT_FOUND")).toBe(true);
  });

  it("returns false when error code does not match", () => {
    const error = createAxiosError({
      success: false,
      data: null,
      error: {
        code: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      },
    });

    expect(isApiError(error, "VALIDATION_ERROR")).toBe(false);
  });

  it("returns false when response has no error object", () => {
    const error = createAxiosError({
      success: false,
      data: null,
    });

    expect(isApiError(error, "ANY_CODE")).toBe(false);
  });

  it("returns false for non-axios errors", () => {
    const regularError = new Error("Something went wrong");
    expect(isApiError(regularError, "ANY_CODE")).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isApiError("string", "ANY_CODE")).toBe(false);
    expect(isApiError(42, "ANY_CODE")).toBe(false);
    expect(isApiError(null, "ANY_CODE")).toBe(false);
    expect(isApiError(undefined, "ANY_CODE")).toBe(false);
  });

  it("returns false when there is no response (network error)", () => {
    const error = createAxiosError(undefined, "Network Error");
    expect(isApiError(error, "ANY_CODE")).toBe(false);
  });
});

describe("response interceptor", () => {
  let mock: MockAdapter;
  let axiosPostSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    // Mock axios.post used by the refresh call (it uses raw axios, not apiClient)
    axiosPostSpy = vi.spyOn(axios, "post");
    // Reset auth store
    useAuthStore.setState({
      accessToken: "expired-token",
      refreshToken: "valid-refresh-token",
      user: null,
      isAuthenticated: true,
    });
    // Clear cookies
    document.cookie = "satvos-auth-state=; path=/; max-age=0";
  });

  afterEach(() => {
    mock.restore();
    axiosPostSpy.mockRestore();
  });

  it("retries a 401 request after successful token refresh", async () => {
    // First call returns 401, retry returns success
    mock
      .onGet("/documents/1")
      .replyOnce(401)
      .onGet("/documents/1")
      .replyOnce(200, { success: true, data: { id: "1" } });

    axiosPostSpy.mockResolvedValueOnce({
      data: {
        data: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
        },
      },
    });

    const response = await apiClient.get("/documents/1");
    expect(response.data).toEqual({ success: true, data: { id: "1" } });
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
  });

  it("queues concurrent 401 requests and retries them after refresh", async () => {
    // Both calls return 401 initially, then succeed
    mock
      .onGet("/documents/1")
      .replyOnce(401)
      .onGet("/documents/1")
      .replyOnce(200, { success: true, data: { id: "1" } });
    mock
      .onGet("/documents/2")
      .replyOnce(401)
      .onGet("/documents/2")
      .replyOnce(200, { success: true, data: { id: "2" } });

    // Delay the refresh so the second request arrives while refreshing
    axiosPostSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  data: {
                    access_token: "new-access-token",
                    refresh_token: "new-refresh-token",
                  },
                },
              }),
            50
          )
        )
    );

    const [res1, res2] = await Promise.all([
      apiClient.get("/documents/1"),
      apiClient.get("/documents/2"),
    ]);

    expect(res1.data).toEqual({ success: true, data: { id: "1" } });
    expect(res2.data).toEqual({ success: true, data: { id: "2" } });
    // Only one refresh call should have been made
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
  });

  it("queues network errors during active refresh and retries them", async () => {
    // Request A: returns 401 → triggers refresh
    // Request B: network error (ECONNRESET) while refresh is in progress → should be queued
    mock
      .onGet("/documents/1")
      .replyOnce(401)
      .onGet("/documents/1")
      .replyOnce(200, { success: true, data: { id: "1" } });
    mock
      .onGet("/documents/2")
      .networkErrorOnce()
      .onGet("/documents/2")
      .replyOnce(200, { success: true, data: { id: "2" } });

    axiosPostSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  data: {
                    access_token: "new-access-token",
                    refresh_token: "new-refresh-token",
                  },
                },
              }),
            50
          )
        )
    );

    const [res1, res2] = await Promise.all([
      apiClient.get("/documents/1"),
      apiClient.get("/documents/2"),
    ]);

    expect(res1.data).toEqual({ success: true, data: { id: "1" } });
    expect(res2.data).toEqual({ success: true, data: { id: "2" } });
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
  });

  it("does not queue network errors when no refresh is in progress", async () => {
    mock.onGet("/documents/1").networkError();

    await expect(apiClient.get("/documents/1")).rejects.toThrow();
    expect(axiosPostSpy).not.toHaveBeenCalled();
  });

  it("rejects queued network errors when refresh fails", async () => {
    mock
      .onGet("/documents/1")
      .replyOnce(401)
      .onGet("/documents/2")
      .networkErrorOnce();

    axiosPostSpy.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Refresh failed")), 50)
        )
    );

    const results = await Promise.allSettled([
      apiClient.get("/documents/1"),
      apiClient.get("/documents/2"),
    ]);

    expect(results[0].status).toBe("rejected");
    expect(results[1].status).toBe("rejected");
  });
});

describe("renewAuthCookie", () => {
  beforeEach(() => {
    // Reset document.cookie
    document.cookie = "satvos-auth-state=; path=/; max-age=0";
  });

  it("sets the satvos-auth-state cookie to authenticated", () => {
    renewAuthCookie();
    expect(document.cookie).toContain("satvos-auth-state=authenticated");
  });

  it("can be called multiple times without error", () => {
    renewAuthCookie();
    renewAuthCookie();
    expect(document.cookie).toContain("satvos-auth-state=authenticated");
  });
});
