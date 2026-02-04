import {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSION_LEVELS,
  PARSING_STATUS,
  VALIDATION_STATUS,
  REVIEW_STATUS,
  RECONCILIATION_STATUS,
  FILE_TYPES,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  PARSE_MODES,
  VALIDATION_RULE_TYPES,
  VALIDATION_SEVERITIES,
  hasRole,
  canUpload,
  canManageUsers,
  canCreateCollections,
} from "../constants";

describe("constant values exist and are correct", () => {
  it("ROLES has all four roles", () => {
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.MANAGER).toBe("manager");
    expect(ROLES.MEMBER).toBe("member");
    expect(ROLES.VIEWER).toBe("viewer");
  });

  it("ROLE_HIERARCHY assigns correct numeric levels", () => {
    expect(ROLE_HIERARCHY.admin).toBe(4);
    expect(ROLE_HIERARCHY.manager).toBe(3);
    expect(ROLE_HIERARCHY.member).toBe(2);
    expect(ROLE_HIERARCHY.viewer).toBe(1);
  });

  it("ROLE_HIERARCHY maintains proper ordering", () => {
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.manager);
    expect(ROLE_HIERARCHY.manager).toBeGreaterThan(ROLE_HIERARCHY.member);
    expect(ROLE_HIERARCHY.member).toBeGreaterThan(ROLE_HIERARCHY.viewer);
  });

  it("PERMISSION_LEVELS has all three levels", () => {
    expect(PERMISSION_LEVELS.OWNER).toBe("owner");
    expect(PERMISSION_LEVELS.EDITOR).toBe("editor");
    expect(PERMISSION_LEVELS.VIEWER).toBe("viewer");
  });

  it("PARSING_STATUS has all four statuses", () => {
    expect(PARSING_STATUS.PENDING).toBe("pending");
    expect(PARSING_STATUS.PROCESSING).toBe("processing");
    expect(PARSING_STATUS.COMPLETED).toBe("completed");
    expect(PARSING_STATUS.FAILED).toBe("failed");
  });

  it("VALIDATION_STATUS has all four statuses", () => {
    expect(VALIDATION_STATUS.PENDING).toBe("pending");
    expect(VALIDATION_STATUS.VALID).toBe("valid");
    expect(VALIDATION_STATUS.WARNING).toBe("warning");
    expect(VALIDATION_STATUS.INVALID).toBe("invalid");
  });

  it("REVIEW_STATUS has all three statuses", () => {
    expect(REVIEW_STATUS.PENDING).toBe("pending");
    expect(REVIEW_STATUS.APPROVED).toBe("approved");
    expect(REVIEW_STATUS.REJECTED).toBe("rejected");
  });

  it("RECONCILIATION_STATUS has all three statuses", () => {
    expect(RECONCILIATION_STATUS.PENDING).toBe("pending");
    expect(RECONCILIATION_STATUS.VALID).toBe("valid");
    expect(RECONCILIATION_STATUS.INVALID).toBe("invalid");
  });

  it("FILE_TYPES has PDF, JPEG, PNG", () => {
    expect(FILE_TYPES.PDF).toBe("application/pdf");
    expect(FILE_TYPES.JPEG).toBe("image/jpeg");
    expect(FILE_TYPES.PNG).toBe("image/png");
  });

  it("ACCEPTED_FILE_TYPES maps MIME types to extensions", () => {
    expect(ACCEPTED_FILE_TYPES["application/pdf"]).toEqual([".pdf"]);
    expect(ACCEPTED_FILE_TYPES["image/jpeg"]).toEqual([".jpg", ".jpeg"]);
    expect(ACCEPTED_FILE_TYPES["image/png"]).toEqual([".png"]);
  });

  it("MAX_FILE_SIZE is 50MB", () => {
    expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
  });

  it("PARSE_MODES has SINGLE and DUAL", () => {
    expect(PARSE_MODES.SINGLE).toBe("single");
    expect(PARSE_MODES.DUAL).toBe("dual");
  });

  it("VALIDATION_RULE_TYPES has all five types", () => {
    expect(VALIDATION_RULE_TYPES.REQUIRED).toBe("required");
    expect(VALIDATION_RULE_TYPES.FORMAT).toBe("format");
    expect(VALIDATION_RULE_TYPES.MATH).toBe("math");
    expect(VALIDATION_RULE_TYPES.BUSINESS).toBe("business");
    expect(VALIDATION_RULE_TYPES.CROSS_FIELD).toBe("cross_field");
  });

  it("VALIDATION_SEVERITIES has ERROR and WARNING", () => {
    expect(VALIDATION_SEVERITIES.ERROR).toBe("error");
    expect(VALIDATION_SEVERITIES.WARNING).toBe("warning");
  });
});

describe("hasRole", () => {
  it("admin has admin role", () => {
    expect(hasRole("admin", "admin")).toBe(true);
  });

  it("admin has manager role", () => {
    expect(hasRole("admin", "manager")).toBe(true);
  });

  it("admin has member role", () => {
    expect(hasRole("admin", "member")).toBe(true);
  });

  it("admin has viewer role", () => {
    expect(hasRole("admin", "viewer")).toBe(true);
  });

  it("manager has manager role", () => {
    expect(hasRole("manager", "manager")).toBe(true);
  });

  it("manager has member role", () => {
    expect(hasRole("manager", "member")).toBe(true);
  });

  it("manager has viewer role", () => {
    expect(hasRole("manager", "viewer")).toBe(true);
  });

  it("manager does NOT have admin role", () => {
    expect(hasRole("manager", "admin")).toBe(false);
  });

  it("member has member role", () => {
    expect(hasRole("member", "member")).toBe(true);
  });

  it("member has viewer role", () => {
    expect(hasRole("member", "viewer")).toBe(true);
  });

  it("member does NOT have manager role", () => {
    expect(hasRole("member", "manager")).toBe(false);
  });

  it("member does NOT have admin role", () => {
    expect(hasRole("member", "admin")).toBe(false);
  });

  it("viewer has viewer role", () => {
    expect(hasRole("viewer", "viewer")).toBe(true);
  });

  it("viewer does NOT have member role", () => {
    expect(hasRole("viewer", "member")).toBe(false);
  });

  it("viewer does NOT have manager role", () => {
    expect(hasRole("viewer", "manager")).toBe(false);
  });

  it("viewer does NOT have admin role", () => {
    expect(hasRole("viewer", "admin")).toBe(false);
  });
});

describe("canUpload", () => {
  it("admin can upload", () => {
    expect(canUpload("admin")).toBe(true);
  });

  it("manager can upload", () => {
    expect(canUpload("manager")).toBe(true);
  });

  it("member can upload", () => {
    expect(canUpload("member")).toBe(true);
  });

  it("viewer cannot upload", () => {
    expect(canUpload("viewer")).toBe(false);
  });
});

describe("canManageUsers", () => {
  it("admin can manage users", () => {
    expect(canManageUsers("admin")).toBe(true);
  });

  it("manager cannot manage users", () => {
    expect(canManageUsers("manager")).toBe(false);
  });

  it("member cannot manage users", () => {
    expect(canManageUsers("member")).toBe(false);
  });

  it("viewer cannot manage users", () => {
    expect(canManageUsers("viewer")).toBe(false);
  });
});

describe("canCreateCollections", () => {
  it("admin can create collections", () => {
    expect(canCreateCollections("admin")).toBe(true);
  });

  it("manager can create collections", () => {
    expect(canCreateCollections("manager")).toBe(true);
  });

  it("member can create collections", () => {
    expect(canCreateCollections("member")).toBe(true);
  });

  it("viewer cannot create collections", () => {
    expect(canCreateCollections("viewer")).toBe(false);
  });
});
