export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
  FREE: "free",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
  free: 0,
};

export const PERMISSION_LEVELS = {
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type PermissionLevel =
  (typeof PERMISSION_LEVELS)[keyof typeof PERMISSION_LEVELS];

export const PARSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ParsingStatus = (typeof PARSING_STATUS)[keyof typeof PARSING_STATUS];

export const VALIDATION_STATUS = {
  PENDING: "pending",
  VALID: "valid",
  WARNING: "warning",
  INVALID: "invalid",
} as const;

export type ValidationStatus =
  (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS];

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const RECONCILIATION_STATUS = {
  PENDING: "pending",
  VALID: "valid",
  INVALID: "invalid",
} as const;

export type ReconciliationStatus =
  (typeof RECONCILIATION_STATUS)[keyof typeof RECONCILIATION_STATUS];

export const FILE_TYPES = {
  PDF: "application/pdf",
  JPEG: "image/jpeg",
  PNG: "image/png",
} as const;

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const PARSE_MODES = {
  SINGLE: "single",
  DUAL: "dual",
} as const;

export type ParseMode = (typeof PARSE_MODES)[keyof typeof PARSE_MODES];

export const VALIDATION_RULE_TYPES = {
  REQUIRED: "required",
  FORMAT: "format",
  MATH: "math",
  BUSINESS: "business",
  CROSS_FIELD: "cross_field",
} as const;

export const VALIDATION_SEVERITIES = {
  ERROR: "error",
  WARNING: "warning",
} as const;

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canUpload(role: Role): boolean {
  return role === ROLES.FREE || hasRole(role, ROLES.MEMBER);
}

export function canManageUsers(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function canCreateCollections(role: Role): boolean {
  return hasRole(role, ROLES.MEMBER);
}

export function isFreeUser(role: Role): boolean {
  return role === ROLES.FREE;
}

export function hasQuota(user: { monthly_document_limit?: number }): boolean {
  return (user.monthly_document_limit ?? 0) > 0;
}

export function needsEmailVerification(user: { role: Role; email_verified: boolean }): boolean {
  return isFreeUser(user.role) && !user.email_verified;
}
