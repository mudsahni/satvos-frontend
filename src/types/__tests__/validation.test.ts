import {
  getValidationSeverity,
  getRuleType,
  getValidationSummary,
  getFieldValidationStatus,
  ValidationResult,
} from "../validation";

// Factory helper to create a minimal ValidationResult with overrides
function makeResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    rule_id: "rule-1",
    field_path: "invoice.total",
    passed: true,
    message: "Some validation message",
    validated_at: "2025-01-01T00:00:00Z",
    reconciliation_critical: false,
    ...overrides,
  };
}

describe("getValidationSeverity", () => {
  it("returns explicit severity when present", () => {
    const result = makeResult({ severity: "error", reconciliation_critical: false });
    expect(getValidationSeverity(result)).toBe("error");
  });

  it("returns explicit severity even when reconciliation_critical contradicts", () => {
    const result = makeResult({ severity: "warning", reconciliation_critical: true });
    expect(getValidationSeverity(result)).toBe("warning");
  });

  it('returns "error" when reconciliation_critical is true and no explicit severity', () => {
    const result = makeResult({ reconciliation_critical: true });
    expect(getValidationSeverity(result)).toBe("error");
  });

  it('returns "warning" when reconciliation_critical is false and no explicit severity', () => {
    const result = makeResult({ reconciliation_critical: false });
    expect(getValidationSeverity(result)).toBe("warning");
  });
});

describe("getRuleType", () => {
  it("returns explicit rule_type when present", () => {
    const result = makeResult({ rule_type: "math", message: "Required: field is missing" });
    expect(getRuleType(result)).toBe("math");
  });

  it('returns "required" for message starting with "Required:"', () => {
    const result = makeResult({ message: "Required: field X is missing" });
    expect(getRuleType(result)).toBe("required");
  });

  it('returns "format" for message starting with "Format:"', () => {
    const result = makeResult({ message: "Format: date is invalid" });
    expect(getRuleType(result)).toBe("format");
  });

  it('returns "math" for message starting with "Math:"', () => {
    const result = makeResult({ message: "Math: total does not add up" });
    expect(getRuleType(result)).toBe("math");
  });

  it('returns "logical" for message starting with "Logical:"', () => {
    const result = makeResult({ message: "Logical: dates are inconsistent" });
    expect(getRuleType(result)).toBe("logical");
  });

  it('returns "cross_field" for message starting with "Cross-field:"', () => {
    const result = makeResult({ message: "Cross-field: supplier mismatch" });
    expect(getRuleType(result)).toBe("cross_field");
  });

  it('returns "business" for unrecognized message prefix', () => {
    const result = makeResult({ message: "Some other validation check failed" });
    expect(getRuleType(result)).toBe("business");
  });

  it("is case-insensitive for message prefix matching", () => {
    const result = makeResult({ message: "REQUIRED: field X is missing" });
    // The implementation lowercases the message, so "REQUIRED:" becomes "required:"
    expect(getRuleType(result)).toBe("required");
  });

  it('returns "business" for empty message', () => {
    const result = makeResult({ message: "" });
    expect(getRuleType(result)).toBe("business");
  });
});

describe("getValidationSummary", () => {
  it("returns zeros for an empty array", () => {
    const summary = getValidationSummary([]);
    expect(summary).toEqual({
      total: 0,
      passed: 0,
      warnings: 0,
      errors: 0,
      reconciliation_critical_passed: 0,
      reconciliation_critical_total: 0,
    });
  });

  it("counts all passed results correctly", () => {
    const results = [
      makeResult({ passed: true, reconciliation_critical: false }),
      makeResult({ passed: true, reconciliation_critical: true }),
      makeResult({ passed: true, reconciliation_critical: false }),
    ];
    const summary = getValidationSummary(results);
    expect(summary).toEqual({
      total: 3,
      passed: 3,
      warnings: 0,
      errors: 0,
      reconciliation_critical_passed: 1,
      reconciliation_critical_total: 1,
    });
  });

  it("counts a mix of passed, failed critical, and failed non-critical", () => {
    const results = [
      makeResult({ passed: true, reconciliation_critical: false }),
      makeResult({ passed: false, reconciliation_critical: true }), // error
      makeResult({ passed: false, reconciliation_critical: false }), // warning
      makeResult({ passed: true, reconciliation_critical: true }),
      makeResult({ passed: false, reconciliation_critical: true }), // error
    ];
    const summary = getValidationSummary(results);
    expect(summary).toEqual({
      total: 5,
      passed: 2,
      warnings: 1,
      errors: 2,
      reconciliation_critical_passed: 1,
      reconciliation_critical_total: 3,
    });
  });

  it("correctly counts reconciliation_critical results", () => {
    const results = [
      makeResult({ passed: true, reconciliation_critical: true }),
      makeResult({ passed: true, reconciliation_critical: true }),
      makeResult({ passed: false, reconciliation_critical: true }),
    ];
    const summary = getValidationSummary(results);
    expect(summary.reconciliation_critical_total).toBe(3);
    expect(summary.reconciliation_critical_passed).toBe(2);
    expect(summary.errors).toBe(1);
    expect(summary.warnings).toBe(0);
  });

  it("counts only non-critical failures as warnings", () => {
    const results = [
      makeResult({ passed: false, reconciliation_critical: false }),
      makeResult({ passed: false, reconciliation_critical: false }),
    ];
    const summary = getValidationSummary(results);
    expect(summary.warnings).toBe(2);
    expect(summary.errors).toBe(0);
  });
});

describe("getFieldValidationStatus", () => {
  it('returns "unsure" when no results match the field path', () => {
    const results = [makeResult({ field_path: "invoice.other_field" })];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status).toEqual({
      field_path: "invoice.total",
      status: "unsure",
      messages: [],
    });
  });

  it('returns "unsure" with empty messages when results array is empty', () => {
    const status = getFieldValidationStatus([], "invoice.total");
    expect(status).toEqual({
      field_path: "invoice.total",
      status: "unsure",
      messages: [],
    });
  });

  it('returns "valid" when all matching results passed', () => {
    const results = [
      makeResult({ field_path: "invoice.total", passed: true }),
      makeResult({ field_path: "invoice.total", passed: true }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status).toEqual({
      field_path: "invoice.total",
      status: "valid",
      messages: [],
    });
  });

  it('returns "invalid" when a failed result is reconciliation_critical', () => {
    const results = [
      makeResult({
        field_path: "invoice.total",
        passed: false,
        reconciliation_critical: true,
        message: "Critical error found",
      }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status).toEqual({
      field_path: "invoice.total",
      status: "invalid",
      messages: ["Critical error found"],
    });
  });

  it('returns "warning" when a failed result is not reconciliation_critical', () => {
    const results = [
      makeResult({
        field_path: "invoice.total",
        passed: false,
        reconciliation_critical: false,
        message: "Minor issue detected",
      }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status).toEqual({
      field_path: "invoice.total",
      status: "warning",
      messages: ["Minor issue detected"],
    });
  });

  it('returns "invalid" when mixed results have both error and warning (error wins)', () => {
    const results = [
      makeResult({
        field_path: "invoice.total",
        passed: true,
      }),
      makeResult({
        field_path: "invoice.total",
        passed: false,
        reconciliation_critical: false,
        message: "Warning message",
      }),
      makeResult({
        field_path: "invoice.total",
        passed: false,
        reconciliation_critical: true,
        message: "Error message",
      }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status.status).toBe("invalid");
    expect(status.messages).toEqual(["Warning message", "Error message"]);
  });

  it("includes only failed result messages, not passed ones", () => {
    const results = [
      makeResult({
        field_path: "invoice.total",
        passed: true,
        message: "Passed check",
      }),
      makeResult({
        field_path: "invoice.total",
        passed: false,
        reconciliation_critical: false,
        message: "Failed check",
      }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status.messages).toEqual(["Failed check"]);
    expect(status.messages).not.toContain("Passed check");
  });

  it("ignores results for other fields", () => {
    const results = [
      makeResult({
        field_path: "invoice.total",
        passed: true,
      }),
      makeResult({
        field_path: "invoice.subtotal",
        passed: false,
        reconciliation_critical: true,
        message: "Subtotal error",
      }),
    ];
    const status = getFieldValidationStatus(results, "invoice.total");
    expect(status.status).toBe("valid");
    expect(status.messages).toEqual([]);
  });
});
