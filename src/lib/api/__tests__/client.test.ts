import { AxiosError, AxiosHeaders } from "axios";
import { getErrorMessage, isApiError } from "@/lib/api/client";
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
