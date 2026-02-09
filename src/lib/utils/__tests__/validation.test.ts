import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createCollectionSchema,
  updateCollectionSchema,
  addPermissionSchema,
  createDocumentSchema,
  reviewDocumentSchema,
  getSafeRedirectUrl,
} from "../validation";

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my-company",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing tenant_slug", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty tenant_slug", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects tenant_slug with uppercase letters", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "MyCompany",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects tenant_slug with spaces", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my company",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts tenant_slug with numbers and hyphens", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "company-123",
      email: "user@example.com",
      password: "pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my-company",
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my-company",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my-company",
      email: "user@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "my-company",
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("provides appropriate error messages", () => {
    const result = loginSchema.safeParse({
      tenant_slug: "INVALID SLUG",
      email: "bad",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.tenant_slug).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

describe("createUserSchema", () => {
  it("validates correct user data", () => {
    const result = createUserSchema.safeParse({
      email: "newuser@example.com",
      full_name: "John Doe",
      password: "password123",
      role: "member",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password (less than 8 characters)", () => {
    const result = createUserSchema.safeParse({
      email: "newuser@example.com",
      full_name: "John Doe",
      password: "short",
      role: "member",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.password?.[0]).toContain("8 characters");
    }
  });

  it("rejects invalid email", () => {
    const result = createUserSchema.safeParse({
      email: "notanemail",
      full_name: "John Doe",
      password: "password123",
      role: "member",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing full_name", () => {
    const result = createUserSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty full_name", () => {
    const result = createUserSchema.safeParse({
      email: "user@example.com",
      full_name: "",
      password: "password123",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing role", () => {
    const result = createUserSchema.safeParse({
      email: "user@example.com",
      full_name: "John Doe",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = createUserSchema.safeParse({
      email: "user@example.com",
      full_name: "John Doe",
      password: "password123",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid roles", () => {
    for (const role of ["admin", "manager", "member", "viewer"]) {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        full_name: "John Doe",
        password: "password123",
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing fields entirely", () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("updateUserSchema", () => {
  it("validates partial updates (email only)", () => {
    const result = updateUserSchema.safeParse({
      email: "updated@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial updates (full_name only)", () => {
    const result = updateUserSchema.safeParse({
      full_name: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial updates (role only)", () => {
    const result = updateUserSchema.safeParse({
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial updates (is_active only)", () => {
    const result = updateUserSchema.safeParse({
      is_active: false,
    });
    expect(result.success).toBe(true);
  });

  it("allows empty password (for clearing the field)", () => {
    const result = updateUserSchema.safeParse({
      password: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows valid password of 8 or more characters", () => {
    const result = updateUserSchema.safeParse({
      password: "newpassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters (non-empty)", () => {
    const result = updateUserSchema.safeParse({
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email when provided", () => {
    const result = updateUserSchema.safeParse({
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role when provided", () => {
    const result = updateUserSchema.safeParse({
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates full update with all fields", () => {
    const result = updateUserSchema.safeParse({
      email: "new@example.com",
      full_name: "Updated Name",
      password: "longpassword",
      role: "manager",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("createCollectionSchema", () => {
  it("validates correct data", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
    });
    expect(result.success).toBe(true);
  });

  it("validates with optional description", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: "A useful description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCollectionSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createCollectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects name that is too long (over 255 characters)", () => {
    const result = createCollectionSchema.safeParse({
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at maximum length (255 characters)", () => {
    const result = createCollectionSchema.safeParse({
      name: "x".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects description that is too long (over 1000 characters)", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts description at maximum length (1000 characters)", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: "x".repeat(1000),
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCollectionSchema", () => {
  it("validates partial update with name only", () => {
    const result = updateCollectionSchema.safeParse({
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with description only", () => {
    const result = updateCollectionSchema.safeParse({
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateCollectionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty name when provided", () => {
    const result = updateCollectionSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name too long when provided", () => {
    const result = updateCollectionSchema.safeParse({
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description too long when provided", () => {
    const result = updateCollectionSchema.safeParse({
      description: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("validates full update", () => {
    const result = updateCollectionSchema.safeParse({
      name: "Updated Name",
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });
});

describe("addPermissionSchema", () => {
  it("validates correct data", () => {
    const result = addPermissionSchema.safeParse({
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      permission_level: "editor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for user_id", () => {
    const result = addPermissionSchema.safeParse({
      user_id: "not-a-uuid",
      permission_level: "editor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.user_id).toBeDefined();
    }
  });

  it("rejects missing user_id", () => {
    const result = addPermissionSchema.safeParse({
      permission_level: "editor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid permission level", () => {
    const result = addPermissionSchema.safeParse({
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      permission_level: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid permission levels", () => {
    for (const level of ["owner", "editor", "viewer"]) {
      const result = addPermissionSchema.safeParse({
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        permission_level: level,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing permission_level", () => {
    const result = addPermissionSchema.safeParse({
      user_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty string for user_id", () => {
    const result = addPermissionSchema.safeParse({
      user_id: "",
      permission_level: "editor",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDocumentSchema", () => {
  const validData = {
    file_id: "550e8400-e29b-41d4-a716-446655440000",
    collection_id: "660e8400-e29b-41d4-a716-446655440000",
    name: "Invoice-001.pdf",
  };

  it("validates correct data with default parse_mode", () => {
    const result = createDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parse_mode).toBe("single");
    }
  });

  it("validates with explicit parse_mode 'single'", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      parse_mode: "single",
    });
    expect(result.success).toBe(true);
  });

  it("validates with parse_mode 'dual'", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      parse_mode: "dual",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parse_mode).toBe("dual");
    }
  });

  it("rejects invalid file_id (not a UUID)", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      file_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid collection_id (not a UUID)", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      collection_id: "bad-id",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createDocumentSchema.safeParse({
      file_id: "550e8400-e29b-41d4-a716-446655440000",
      collection_id: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name that is too long (over 255 characters)", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid parse_mode", () => {
    const result = createDocumentSchema.safeParse({
      ...validData,
      parse_mode: "triple",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing file_id", () => {
    const result = createDocumentSchema.safeParse({
      collection_id: "660e8400-e29b-41d4-a716-446655440000",
      name: "Invoice.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing collection_id", () => {
    const result = createDocumentSchema.safeParse({
      file_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Invoice.pdf",
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewDocumentSchema", () => {
  it("validates approved status", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "approved",
    });
    expect(result.success).toBe(true);
  });

  it("validates rejected status", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "rejected",
    });
    expect(result.success).toBe(true);
  });

  it("validates with optional notes", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "approved",
      notes: "Looks good to me",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = reviewDocumentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects notes that are too long (over 1000 characters)", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "rejected",
      notes: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts notes at maximum length (1000 characters)", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "rejected",
      notes: "x".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty notes", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "approved",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts status without notes (notes is optional)", () => {
    const result = reviewDocumentSchema.safeParse({
      status: "rejected",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });
});

describe("getSafeRedirectUrl", () => {
  it("allows valid relative paths", () => {
    expect(getSafeRedirectUrl("/")).toBe("/");
    expect(getSafeRedirectUrl("/documents")).toBe("/documents");
    expect(getSafeRedirectUrl("/documents/abc-123")).toBe("/documents/abc-123");
    expect(getSafeRedirectUrl("/collections?page=2")).toBe("/collections?page=2");
    expect(getSafeRedirectUrl("/login?returnUrl=%2Fdocs")).toBe("/login?returnUrl=%2Fdocs");
  });

  it("rejects absolute URLs (open redirect)", () => {
    expect(getSafeRedirectUrl("https://evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("http://evil.com/phishing")).toBe("/dashboard");
    expect(getSafeRedirectUrl("https://evil.com/login")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("//evil.com/path")).toBe("/dashboard");
  });

  it("rejects javascript: and data: protocols", () => {
    expect(getSafeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
    expect(getSafeRedirectUrl("JAVASCRIPT:alert(1)")).toBe("/dashboard");
  });

  it("rejects backslash-based bypasses", () => {
    expect(getSafeRedirectUrl("/\\evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("\\evil.com")).toBe("/dashboard");
  });

  it("rejects paths not starting with /", () => {
    expect(getSafeRedirectUrl("evil.com")).toBe("/dashboard");
    expect(getSafeRedirectUrl("documents")).toBe("/dashboard");
    expect(getSafeRedirectUrl("")).toBe("/dashboard");
  });

  it("returns /dashboard for null input", () => {
    expect(getSafeRedirectUrl(null)).toBe("/dashboard");
  });
});
