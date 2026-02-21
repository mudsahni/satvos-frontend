import {
  loginSchema,
  freeLoginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUserSchema,
  updateUserSchema,
  createCollectionSchema,
  updateCollectionSchema,
  addPermissionSchema,
  createDocumentSchema,
  reviewDocumentSchema,
  getSafeRedirectUrl,
} from "../validation";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

/** Omit a key from an object (avoids unused-var lint errors from destructuring). */
function omit<T extends Record<string, unknown>>(obj: T, key: keyof T): Omit<T, typeof key> {
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000";

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

describe("loginSchema", () => {
  const valid = {
    tenant_slug: "my-company",
    email: "user@example.com",
    password: "secret123",
  };

  it("validates correct login data", () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["uppercase letters", "MyCompany"],
    ["spaces", "my company"],
  ])("rejects tenant_slug with %s", (_label, slug) => {
    const data = slug === undefined ? { email: valid.email, password: valid.password } : { ...valid, tenant_slug: slug };
    expect(loginSchema.safeParse(data).success).toBe(false);
  });

  it("accepts tenant_slug with numbers and hyphens", () => {
    expect(loginSchema.safeParse({ ...valid, tenant_slug: "company-123" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(loginSchema.safeParse({ tenant_slug: valid.tenant_slug, password: valid.password }).success).toBe(false);
  });

  it("rejects missing password", () => {
    expect(loginSchema.safeParse({ tenant_slug: valid.tenant_slug, email: valid.email }).success).toBe(false);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });

  it("provides field-level error messages for all invalid fields", () => {
    const result = loginSchema.safeParse({ tenant_slug: "INVALID SLUG", email: "bad", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.tenant_slug).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// freeLoginSchema
// ---------------------------------------------------------------------------

describe("freeLoginSchema", () => {
  const valid = { email: "user@example.com", password: "secret123" };

  it("validates correct free login data", () => {
    expect(freeLoginSchema.safeParse(valid).success).toBe(true);
  });

  it("does not include tenant_slug in parsed output", () => {
    const result = freeLoginSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("tenant_slug");
    }
  });

  it("rejects invalid email", () => {
    expect(freeLoginSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(freeLoginSchema.safeParse({ password: valid.password }).success).toBe(false);
  });

  it("rejects missing or empty password", () => {
    expect(freeLoginSchema.safeParse({ email: valid.email }).success).toBe(false);
    expect(freeLoginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// registerSchema — primary schema for password validation rules
// ---------------------------------------------------------------------------

describe("registerSchema", () => {
  const valid = {
    full_name: "Test User",
    email: "test@example.com",
    password: "password123",
    confirm_password: "password123",
  };

  it("validates correct registration data", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty full_name", () => {
    const result = registerSchema.safeParse({ ...valid, full_name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.full_name).toBeDefined();
    }
  });

  it("rejects missing full_name", () => {
    expect(registerSchema.safeParse(omit(valid, "full_name")).success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects missing email", () => {
    expect(registerSchema.safeParse(omit(valid, "email")).success).toBe(false);
  });

  // Password validation rules — tested here once, shared by resetPasswordSchema and createUserSchema
  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short", confirm_password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password?.[0]).toContain("8 characters");
    }
  });

  it("accepts password at exactly 8 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "12345678", confirm_password: "12345678" }).success).toBe(true);
  });

  it("rejects missing password", () => {
    expect(registerSchema.safeParse(omit(valid, "password")).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirm_password: "different456" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirm_password?.[0]).toContain("do not match");
    }
  });
});

// ---------------------------------------------------------------------------
// forgotPasswordSchema
// ---------------------------------------------------------------------------

describe("forgotPasswordSchema", () => {
  it("validates correct email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects invalid email with message", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toContain("Invalid email");
    }
  });

  it("rejects empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resetPasswordSchema — only schema-specific behavior (password confirm with
// new_password field name), since min-8 rule is covered by registerSchema
// ---------------------------------------------------------------------------

describe("resetPasswordSchema", () => {
  const valid = { new_password: "password123", confirm_password: "password123" };

  it("validates correct data", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirm_password: "different456" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirm_password?.[0]).toContain("do not match");
    }
  });

  it("rejects missing new_password", () => {
    expect(resetPasswordSchema.safeParse({ confirm_password: "password123" }).success).toBe(false);
  });

  it("rejects missing confirm_password", () => {
    expect(resetPasswordSchema.safeParse({ new_password: "password123" }).success).toBe(false);
  });

  it("rejects empty passwords", () => {
    expect(resetPasswordSchema.safeParse({ new_password: "", confirm_password: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createUserSchema — only schema-specific behavior (role enum), since
// password min-8 and email validation are covered by registerSchema
// ---------------------------------------------------------------------------

describe("createUserSchema", () => {
  const valid = {
    email: "newuser@example.com",
    full_name: "John Doe",
    role: "member",
  };

  it("validates correct user data", () => {
    expect(createUserSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing or empty full_name", () => {
    expect(createUserSchema.safeParse({ ...valid, full_name: "" }).success).toBe(false);
    expect(createUserSchema.safeParse(omit(valid, "full_name")).success).toBe(false);
  });

  it("rejects missing role", () => {
    expect(createUserSchema.safeParse(omit(valid, "role")).success).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(createUserSchema.safeParse({ ...valid, role: "superadmin" }).success).toBe(false);
  });

  it.each(["admin", "manager", "member", "viewer"])("accepts role '%s'", (role) => {
    expect(createUserSchema.safeParse({ ...valid, role }).success).toBe(true);
  });

  it("rejects empty object (requires all fields)", () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});

// ---------------------------------------------------------------------------
// updateUserSchema
// ---------------------------------------------------------------------------

describe("updateUserSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });

  it.each([
    ["email only", { email: "updated@example.com" }],
    ["full_name only", { full_name: "Jane Doe" }],
    ["role only", { role: "admin" }],
    ["is_active only", { is_active: false }],
    ["all fields", { email: "new@example.com", full_name: "Updated Name", role: "manager", is_active: true }],
  ])("validates partial update with %s", (_label, data) => {
    expect(updateUserSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid email when provided", () => {
    expect(updateUserSchema.safeParse({ email: "not-valid" }).success).toBe(false);
  });

  it("rejects invalid role when provided", () => {
    expect(updateUserSchema.safeParse({ role: "superadmin" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCollectionSchema
// ---------------------------------------------------------------------------

describe("createCollectionSchema", () => {
  it("validates correct data", () => {
    expect(createCollectionSchema.safeParse({ name: "My Collection" }).success).toBe(true);
  });

  it("validates with optional description", () => {
    expect(createCollectionSchema.safeParse({ name: "My Collection", description: "A useful description" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createCollectionSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(createCollectionSchema.safeParse({}).success).toBe(false);
  });

  it.each([
    ["name at 255 chars", { name: "x".repeat(255) }, true],
    ["name over 255 chars", { name: "x".repeat(256) }, false],
    ["description at 1000 chars", { name: "OK", description: "x".repeat(1000) }, true],
    ["description over 1000 chars", { name: "OK", description: "x".repeat(1001) }, false],
  ])("boundary: %s", (_label, data, expected) => {
    expect(createCollectionSchema.safeParse(data).success).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// updateCollectionSchema
// ---------------------------------------------------------------------------

describe("updateCollectionSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateCollectionSchema.safeParse({}).success).toBe(true);
  });

  it("validates full update", () => {
    expect(updateCollectionSchema.safeParse({ name: "Updated Name", description: "Updated description" }).success).toBe(true);
  });

  it.each([
    ["name only", { name: "Updated Name" }],
    ["description only", { description: "Updated description" }],
  ])("validates partial update with %s", (_label, data) => {
    expect(updateCollectionSchema.safeParse(data).success).toBe(true);
  });

  it("rejects empty name when provided", () => {
    expect(updateCollectionSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects name too long when provided", () => {
    expect(updateCollectionSchema.safeParse({ name: "x".repeat(256) }).success).toBe(false);
  });

  it("rejects description too long when provided", () => {
    expect(updateCollectionSchema.safeParse({ description: "x".repeat(1001) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addPermissionSchema
// ---------------------------------------------------------------------------

describe("addPermissionSchema", () => {
  const valid = { user_id: VALID_UUID, permission_level: "editor" };

  it("validates correct data", () => {
    expect(addPermissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid UUID for user_id", () => {
    const result = addPermissionSchema.safeParse({ ...valid, user_id: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.user_id).toBeDefined();
    }
  });

  it("rejects empty string for user_id", () => {
    expect(addPermissionSchema.safeParse({ ...valid, user_id: "" }).success).toBe(false);
  });

  it("rejects missing user_id", () => {
    expect(addPermissionSchema.safeParse({ permission_level: "editor" }).success).toBe(false);
  });

  it("rejects invalid permission level", () => {
    expect(addPermissionSchema.safeParse({ ...valid, permission_level: "admin" }).success).toBe(false);
  });

  it("rejects missing permission_level", () => {
    expect(addPermissionSchema.safeParse({ user_id: VALID_UUID }).success).toBe(false);
  });

  it.each(["owner", "editor", "viewer"])("accepts permission level '%s'", (level) => {
    expect(addPermissionSchema.safeParse({ user_id: VALID_UUID, permission_level: level }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createDocumentSchema
// ---------------------------------------------------------------------------

describe("createDocumentSchema", () => {
  const valid = {
    file_id: VALID_UUID,
    collection_id: VALID_UUID_2,
    name: "Invoice-001.pdf",
  };

  it("validates correct data with default parse_mode", () => {
    const result = createDocumentSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parse_mode).toBe("single");
    }
  });

  it.each(["single", "dual"] as const)("validates with parse_mode '%s'", (mode) => {
    const result = createDocumentSchema.safeParse({ ...valid, parse_mode: mode });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parse_mode).toBe(mode);
    }
  });

  it("rejects invalid parse_mode", () => {
    expect(createDocumentSchema.safeParse({ ...valid, parse_mode: "triple" }).success).toBe(false);
  });

  it.each([
    ["file_id", { ...{ collection_id: VALID_UUID_2, name: "Invoice.pdf" } }],
    ["collection_id", { ...{ file_id: VALID_UUID, name: "Invoice.pdf" } }],
    ["name", { ...{ file_id: VALID_UUID, collection_id: VALID_UUID_2 } }],
  ])("rejects missing %s", (_field, data) => {
    expect(createDocumentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid UUIDs", () => {
    expect(createDocumentSchema.safeParse({ ...valid, file_id: "not-a-uuid" }).success).toBe(false);
    expect(createDocumentSchema.safeParse({ ...valid, collection_id: "bad-id" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createDocumentSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    expect(createDocumentSchema.safeParse({ ...valid, name: "x".repeat(256) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reviewDocumentSchema
// ---------------------------------------------------------------------------

describe("reviewDocumentSchema", () => {
  it("validates approved status", () => {
    expect(reviewDocumentSchema.safeParse({ status: "approved" }).success).toBe(true);
  });

  it("validates rejected status", () => {
    expect(reviewDocumentSchema.safeParse({ status: "rejected" }).success).toBe(true);
  });

  it("validates with optional notes", () => {
    expect(reviewDocumentSchema.safeParse({ status: "approved", notes: "Looks good to me" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(reviewDocumentSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(reviewDocumentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts empty notes and status without notes", () => {
    expect(reviewDocumentSchema.safeParse({ status: "approved", notes: "" }).success).toBe(true);
    const result = reviewDocumentSchema.safeParse({ status: "rejected" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it.each([
    ["notes at 1000 chars", { status: "rejected", notes: "x".repeat(1000) }, true],
    ["notes over 1000 chars", { status: "rejected", notes: "x".repeat(1001) }, false],
  ])("boundary: %s", (_label, data, expected) => {
    expect(reviewDocumentSchema.safeParse(data).success).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getSafeRedirectUrl
// ---------------------------------------------------------------------------

describe("getSafeRedirectUrl", () => {
  it.each([
    ["/", "/"],
    ["/documents", "/documents"],
    ["/documents/abc-123", "/documents/abc-123"],
    ["/collections?page=2", "/collections?page=2"],
    ["/login?returnUrl=%2Fdocs", "/login?returnUrl=%2Fdocs"],
  ])("allows valid relative path: %s", (input, expected) => {
    expect(getSafeRedirectUrl(input)).toBe(expected);
  });

  it.each([
    ["absolute URL", "https://evil.com"],
    ["absolute URL with path", "http://evil.com/phishing"],
    ["protocol-relative URL", "//evil.com"],
    ["protocol-relative with path", "//evil.com/path"],
    ["javascript: protocol", "javascript:alert(1)"],
    ["JAVASCRIPT: protocol (case)", "JAVASCRIPT:alert(1)"],
    ["data: protocol", "data:text/html,<script>alert(1)</script>"],
    ["backslash in path", "/\\evil.com"],
    ["backslash prefix", "\\evil.com"],
    ["no leading slash", "evil.com"],
    ["relative path (no /)", "documents"],
    ["empty string", ""],
  ])("rejects unsafe input: %s", (_label, input) => {
    expect(getSafeRedirectUrl(input)).toBe("/dashboard");
  });

  it("returns /dashboard for null input", () => {
    expect(getSafeRedirectUrl(null)).toBe("/dashboard");
  });
});
