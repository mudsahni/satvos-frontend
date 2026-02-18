import {
  updateTenantSchema,
  createServiceAccountSchema,
  grantServiceAccountPermissionSchema,
} from "../validation";

describe("updateTenantSchema", () => {
  it("validates with name only", () => {
    const result = updateTenantSchema.safeParse({ name: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  it("validates with slug only", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme-corp" });
    expect(result.success).toBe(true);
  });

  it("validates with is_active only", () => {
    const result = updateTenantSchema.safeParse({ is_active: false });
    expect(result.success).toBe(true);
  });

  it("validates with all fields", () => {
    const result = updateTenantSchema.safeParse({
      name: "Acme Corp",
      slug: "acme-corp",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateTenantSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty name when provided", () => {
    const result = updateTenantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
    }
  });

  it("rejects name over 255 characters", () => {
    const result = updateTenantSchema.safeParse({ name: "x".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 255 characters", () => {
    const result = updateTenantSchema.safeParse({ name: "x".repeat(255) });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    const result = updateTenantSchema.safeParse({ slug: "AcmeCorp" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.slug).toBeDefined();
    }
  });

  it("rejects slug with spaces", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme corp" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with underscores", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme_corp" });
    expect(result.success).toBe(false);
  });

  it("rejects slug starting with a hyphen", () => {
    const result = updateTenantSchema.safeParse({ slug: "-acme" });
    expect(result.success).toBe(false);
  });

  it("rejects slug ending with a hyphen", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme-" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with consecutive hyphens", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme--corp" });
    expect(result.success).toBe(false);
  });

  it("accepts slug with numbers", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme123" });
    expect(result.success).toBe(true);
  });

  it("accepts slug with numbers and hyphens", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme-123-corp" });
    expect(result.success).toBe(true);
  });

  it("accepts single-word slug", () => {
    const result = updateTenantSchema.safeParse({ slug: "acme" });
    expect(result.success).toBe(true);
  });

  it("rejects is_active as a non-boolean", () => {
    const result = updateTenantSchema.safeParse({ is_active: "yes" });
    expect(result.success).toBe(false);
  });
});

describe("createServiceAccountSchema", () => {
  it("validates with name only (minimum required)", () => {
    const result = createServiceAccountSchema.safeParse({ name: "CI Bot" });
    expect(result.success).toBe(true);
  });

  it("validates with name and description", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      description: "Used for CI/CD pipeline",
    });
    expect(result.success).toBe(true);
  });

  it("validates with all fields", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      description: "Used for CI/CD pipeline",
      expires_at: "2027-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createServiceAccountSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
    }
  });

  it("rejects empty name", () => {
    const result = createServiceAccountSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 255 characters", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "x".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects description over 1000 characters", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      description: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts description at exactly 1000 characters", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      description: "x".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty description", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      description: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty expires_at", () => {
    const result = createServiceAccountSchema.safeParse({
      name: "CI Bot",
      expires_at: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("grantServiceAccountPermissionSchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it("validates with valid collection_id and permission", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "editor",
    });
    expect(result.success).toBe(true);
  });

  it("accepts permission 'owner'", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "owner",
    });
    expect(result.success).toBe(true);
  });

  it("accepts permission 'editor'", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "editor",
    });
    expect(result.success).toBe(true);
  });

  it("accepts permission 'viewer'", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "viewer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid permission level", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "admin",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.permission).toBeDefined();
    }
  });

  it("rejects missing permission", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for collection_id", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: "not-a-uuid",
      permission: "editor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.collection_id).toBeDefined();
    }
  });

  it("rejects missing collection_id", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      permission: "editor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty collection_id", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: "",
      permission: "editor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
