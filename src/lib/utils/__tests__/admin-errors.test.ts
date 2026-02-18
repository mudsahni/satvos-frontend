import { vi, describe, it, expect, beforeEach } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getAdminErrorMessage, getAdminErrorCode } from "@/lib/utils/admin-errors";

vi.mock("@/lib/api/client", () => ({
  default: {},
  getErrorMessage: vi.fn(() => "Fallback error message"),
}));

import { getErrorMessage } from "@/lib/api/client";

const mockGetErrorMessage = vi.mocked(getErrorMessage);

function makeAxiosError(code: string): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    data: { error: { code } },
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe("getAdminErrorMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetErrorMessage.mockReturnValue("Fallback error message");
  });

  it.each([
    ["DUPLICATE_EMAIL", "A user with this email already exists in this tenant."],
    ["DUPLICATE_SLUG", "This tenant slug is already taken."],
    ["NOT_FOUND", "Resource not found."],
    ["FORBIDDEN", "You don't have permission for this action."],
    ["INSUFFICIENT_ROLE", "This action requires a higher role."],
    ["SELF_PERMISSION_REMOVAL", "You cannot remove your own permission."],
    ["INVALID_PERMISSION", "Permission must be: owner, editor, or viewer."],
    ["SERVICE_ACCOUNT_NOT_FOUND", "Service account not found."],
    ["TENANT_INACTIVE", "This tenant is deactivated."],
    ["USER_INACTIVE", "This user account is deactivated."],
    ["INTERNAL_ERROR", "Something went wrong. Please try again."],
  ])("returns mapped message for %s", (code, expected) => {
    const error = makeAxiosError(code);
    expect(getAdminErrorMessage(error)).toBe(expected);
  });

  it("falls back to getErrorMessage for unknown API error codes", () => {
    const error = makeAxiosError("UNKNOWN_CODE");
    mockGetErrorMessage.mockReturnValue("Server returned an error");

    expect(getAdminErrorMessage(error)).toBe("Server returned an error");
    expect(mockGetErrorMessage).toHaveBeenCalledWith(error);
  });

  it("falls back to getErrorMessage for non-axios errors", () => {
    const error = new Error("Network failure");
    mockGetErrorMessage.mockReturnValue("Network failure");

    expect(getAdminErrorMessage(error)).toBe("Network failure");
    expect(mockGetErrorMessage).toHaveBeenCalledWith(error);
  });

  it("falls back when API error has no code", () => {
    const error = new AxiosError("fail");
    error.response = {
      data: { error: {} },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    mockGetErrorMessage.mockReturnValue("Generic error");

    expect(getAdminErrorMessage(error)).toBe("Generic error");
  });
});

describe("getAdminErrorCode", () => {
  it("extracts error code from an axios error", () => {
    expect(getAdminErrorCode(makeAxiosError("DUPLICATE_EMAIL"))).toBe("DUPLICATE_EMAIL");
    expect(getAdminErrorCode(makeAxiosError("TENANT_INACTIVE"))).toBe("TENANT_INACTIVE");
  });

  it("returns undefined for non-axios errors", () => {
    expect(getAdminErrorCode(new Error("fail"))).toBeUndefined();
    expect(getAdminErrorCode("some string")).toBeUndefined();
  });

  it("returns undefined when error has no code", () => {
    const error = new AxiosError("fail");
    error.response = {
      data: { error: {} },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    expect(getAdminErrorCode(error)).toBeUndefined();
  });

  it("returns undefined when error has no response data", () => {
    const error = new AxiosError("fail");
    expect(getAdminErrorCode(error)).toBeUndefined();
  });
});
