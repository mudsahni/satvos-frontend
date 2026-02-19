import {
  hasRole,
  canUpload,
  canManageUsers,
  canCreateCollections,
  isFreeUser,
  hasQuota,
} from "../constants";

describe("hasRole", () => {
  it.each([
    ["admin", "admin"],
    ["admin", "manager"],
    ["admin", "member"],
    ["admin", "viewer"],
    ["admin", "free"],
    ["manager", "manager"],
    ["manager", "member"],
    ["manager", "viewer"],
    ["manager", "free"],
    ["member", "member"],
    ["member", "viewer"],
    ["member", "free"],
    ["viewer", "viewer"],
    ["viewer", "free"],
    ["free", "free"],
  ] as const)("%s has sufficient privilege for %s", (userRole, requiredRole) => {
    expect(hasRole(userRole, requiredRole)).toBe(true);
  });

  it.each([
    ["manager", "admin"],
    ["member", "manager"],
    ["member", "admin"],
    ["viewer", "member"],
    ["viewer", "manager"],
    ["viewer", "admin"],
    ["free", "viewer"],
    ["free", "member"],
    ["free", "manager"],
    ["free", "admin"],
  ] as const)("%s does NOT have sufficient privilege for %s", (userRole, requiredRole) => {
    expect(hasRole(userRole, requiredRole)).toBe(false);
  });
});

describe("canUpload", () => {
  it.each([
    ["admin", true],
    ["manager", true],
    ["member", true],
    ["viewer", false],
    ["free", true],
  ] as const)("%s -> %s", (role, expected) => {
    expect(canUpload(role)).toBe(expected);
  });
});

describe("canManageUsers", () => {
  it.each([
    ["admin", true],
    ["manager", false],
    ["member", false],
    ["viewer", false],
    ["free", false],
  ] as const)("%s -> %s", (role, expected) => {
    expect(canManageUsers(role)).toBe(expected);
  });
});

describe("canCreateCollections", () => {
  it.each([
    ["admin", true],
    ["manager", true],
    ["member", true],
    ["viewer", false],
    ["free", false],
  ] as const)("%s -> %s", (role, expected) => {
    expect(canCreateCollections(role)).toBe(expected);
  });
});

describe("free tier helpers", () => {
  describe("isFreeUser", () => {
    it.each([
      ["free", true],
      ["admin", false],
      ["manager", false],
      ["member", false],
      ["viewer", false],
    ] as const)("%s -> %s", (role, expected) => {
      expect(isFreeUser(role)).toBe(expected);
    });
  });

  describe("hasQuota", () => {
    it("returns true when monthly_document_limit is positive", () => {
      expect(hasQuota({ monthly_document_limit: 5 })).toBe(true);
    });

    it("returns true when monthly_document_limit is 1", () => {
      expect(hasQuota({ monthly_document_limit: 1 })).toBe(true);
    });

    it("returns false when monthly_document_limit is 0", () => {
      expect(hasQuota({ monthly_document_limit: 0 })).toBe(false);
    });

    it("returns false when monthly_document_limit is not set", () => {
      expect(hasQuota({})).toBe(false);
    });
  });
});
