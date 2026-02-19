import {
  updateTenantSchema,
  createServiceAccountSchema,
  grantServiceAccountPermissionSchema,
} from "../validation";

describe("updateTenantSchema", () => {
  it("accepts any combination of optional fields", () => {
    expect(updateTenantSchema.safeParse({}).success).toBe(true);
    expect(updateTenantSchema.safeParse({ name: "Acme Corp" }).success).toBe(true);
    expect(updateTenantSchema.safeParse({ slug: "acme-corp" }).success).toBe(true);
    expect(updateTenantSchema.safeParse({ is_active: false }).success).toBe(true);
    expect(
      updateTenantSchema.safeParse({ name: "Acme Corp", slug: "acme-corp", is_active: true })
        .success,
    ).toBe(true);
  });

  it("rejects empty name when provided", () => {
    const result = updateTenantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("enforces name max length of 255", () => {
    expect(updateTenantSchema.safeParse({ name: "x".repeat(255) }).success).toBe(true);
    expect(updateTenantSchema.safeParse({ name: "x".repeat(256) }).success).toBe(false);
  });

  it.each([
    ["uppercase letters", "AcmeCorp"],
    ["spaces", "acme corp"],
    ["underscores", "acme_corp"],
    ["leading hyphen", "-acme"],
    ["trailing hyphen", "acme-"],
    ["consecutive hyphens", "acme--corp"],
  ])("rejects slug with %s", (_label, slug) => {
    expect(updateTenantSchema.safeParse({ slug }).success).toBe(false);
  });

  it.each(["acme", "acme123", "acme-123-corp"])(
    "accepts valid slug %s",
    (slug) => {
      expect(updateTenantSchema.safeParse({ slug }).success).toBe(true);
    },
  );

  it("rejects non-boolean is_active", () => {
    expect(updateTenantSchema.safeParse({ is_active: "yes" }).success).toBe(false);
  });
});

describe("createServiceAccountSchema", () => {
  it("validates with valid field combinations", () => {
    expect(createServiceAccountSchema.safeParse({ name: "CI Bot" }).success).toBe(true);
    expect(
      createServiceAccountSchema.safeParse({ name: "CI Bot", description: "For CI/CD" }).success,
    ).toBe(true);
    expect(
      createServiceAccountSchema.safeParse({
        name: "CI Bot",
        description: "For CI/CD",
        expires_at: "2027-01-01T00:00:00Z",
      }).success,
    ).toBe(true);
  });

  it("rejects missing or empty name", () => {
    const missing = createServiceAccountSchema.safeParse({});
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.flatten().fieldErrors.name).toBeDefined();
    }
    expect(createServiceAccountSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("enforces name max length of 255", () => {
    expect(createServiceAccountSchema.safeParse({ name: "x".repeat(255) }).success).toBe(true);
    expect(createServiceAccountSchema.safeParse({ name: "x".repeat(256) }).success).toBe(false);
  });

  it("enforces description max length of 1000", () => {
    const base = { name: "CI Bot" };
    expect(
      createServiceAccountSchema.safeParse({ ...base, description: "x".repeat(1000) }).success,
    ).toBe(true);
    expect(
      createServiceAccountSchema.safeParse({ ...base, description: "x".repeat(1001) }).success,
    ).toBe(false);
  });

  it("accepts empty optional strings", () => {
    expect(
      createServiceAccountSchema.safeParse({ name: "CI Bot", description: "" }).success,
    ).toBe(true);
    expect(
      createServiceAccountSchema.safeParse({ name: "CI Bot", expires_at: "" }).success,
    ).toBe(true);
  });
});

describe("grantServiceAccountPermissionSchema", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";

  it.each(["owner", "editor", "viewer"])(
    "accepts permission level '%s'",
    (permission) => {
      expect(
        grantServiceAccountPermissionSchema.safeParse({ collection_id: validUUID, permission })
          .success,
      ).toBe(true);
    },
  );

  it("rejects invalid permission level", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({
      collection_id: validUUID,
      permission: "admin",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.permission).toBeDefined();
    }
  });

  it("rejects invalid or missing collection_id", () => {
    const withInvalid = grantServiceAccountPermissionSchema.safeParse({
      collection_id: "not-a-uuid",
      permission: "editor",
    });
    expect(withInvalid.success).toBe(false);
    if (!withInvalid.success) {
      expect(withInvalid.error.flatten().fieldErrors.collection_id).toBeDefined();
    }

    expect(
      grantServiceAccountPermissionSchema.safeParse({ permission: "editor" }).success,
    ).toBe(false);
    expect(
      grantServiceAccountPermissionSchema.safeParse({ collection_id: "", permission: "editor" })
        .success,
    ).toBe(false);
  });

  it("rejects missing permission", () => {
    expect(
      grantServiceAccountPermissionSchema.safeParse({ collection_id: validUUID }).success,
    ).toBe(false);
  });

  it("rejects empty object with multiple errors", () => {
    const result = grantServiceAccountPermissionSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
