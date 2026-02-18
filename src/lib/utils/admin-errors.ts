import axios from "axios";
import { getErrorMessage } from "@/lib/api/client";

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  DUPLICATE_EMAIL: "A user with this email already exists in this tenant.",
  DUPLICATE_SLUG: "This tenant slug is already taken.",
  NOT_FOUND: "Resource not found.",
  FORBIDDEN: "You don't have permission for this action.",
  INSUFFICIENT_ROLE: "This action requires a higher role.",
  SELF_PERMISSION_REMOVAL: "You cannot remove your own permission.",
  INVALID_PERMISSION: "Permission must be: owner, editor, or viewer.",
  SERVICE_ACCOUNT_NOT_FOUND: "Service account not found.",
  TENANT_INACTIVE: "This tenant is deactivated.",
  USER_INACTIVE: "This user account is deactivated.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
};

function extractErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.code;
  }
  return undefined;
}

/**
 * Maps backend admin error codes to user-friendly messages.
 * Falls back to the generic getErrorMessage() for unknown codes.
 */
export function getAdminErrorMessage(error: unknown): string {
  const code = extractErrorCode(error);
  if (code && ADMIN_ERROR_MESSAGES[code]) {
    return ADMIN_ERROR_MESSAGES[code];
  }
  return getErrorMessage(error);
}

/**
 * Extracts the error code from an API error response.
 */
export function getAdminErrorCode(error: unknown): string | undefined {
  return extractErrorCode(error);
}
