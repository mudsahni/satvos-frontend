import { describe, it, expect } from "vitest";
import {
  parseDuplicateResult,
  getMatchTypeLabel,
} from "../duplicate-detection";
import { ValidationResult } from "@/types/validation";

function makeValidationResult(
  overrides: Partial<ValidationResult>
): ValidationResult {
  return {
    rule_id: "rule-1",
    field_path: "invoice",
    passed: false,
    message: "",
    validated_at: "2025-01-01T00:00:00Z",
    reconciliation_critical: false,
    ...overrides,
  };
}

describe("parseDuplicateResult", () => {
  it("returns found: false when no duplicate rule is present", () => {
    const results = [
      makeValidationResult({
        rule_name: "Math: Grand Total",
        passed: true,
        message: "Grand total matches sum of line items",
      }),
    ];
    const parsed = parseDuplicateResult(results);
    expect(parsed.found).toBe(false);
    expect(parsed.unavailable).toBe(false);
  });

  it("returns found: false when duplicate rule passed", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: true,
        message: "no duplicate invoices found",
        actual_value: "no duplicates",
      }),
    ];
    const parsed = parseDuplicateResult(results);
    expect(parsed.found).toBe(false);
    expect(parsed.unavailable).toBe(false);
  });

  it("returns found: false for empty results", () => {
    const parsed = parseDuplicateResult([]);
    expect(parsed.found).toBe(false);
    expect(parsed.unavailable).toBe(false);
  });

  it("parses error severity with exact_irn and weak matches", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "2 duplicate(s) found [error]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-001 from seller 29ABCDE1234F1Z5 already exists in: "Invoice-A.pdf" [exact_irn] (uploaded 2025-08-01), "Invoice-B.pdf" [weak] (uploaded 2024-03-15)',
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.unavailable).toBe(false);
    expect(result.effectiveSeverity).toBe("error");
    expect(result.matchCount).toBe(2);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toEqual({
      documentName: "Invoice-A.pdf",
      matchType: "exact_irn",
      uploadDate: "2025-08-01",
    });
    expect(result.matches[1]).toEqual({
      documentName: "Invoice-B.pdf",
      matchType: "weak",
      uploadDate: "2024-03-15",
    });
  });

  it("parses warning severity with only weak matches", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "1 duplicate(s) found [warning]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-002 from seller 07XYZAB5678C1D2 already exists in: "Old-Invoice.pdf" [weak] (uploaded 2023-11-20)',
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.effectiveSeverity).toBe("warning");
    expect(result.matchCount).toBe(1);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).toEqual({
      documentName: "Old-Invoice.pdf",
      matchType: "weak",
      uploadDate: "2023-11-20",
    });
  });

  it("parses strong match type", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "1 duplicate(s) found [error]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-003 from seller 29ABCDE1234F1Z5 already exists in: "Invoice-Same-FY.pdf" [strong] (uploaded 2025-06-15)',
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.effectiveSeverity).toBe("error");
    expect(result.matches[0].matchType).toBe("strong");
  });

  it("falls back to message-based detection when rule_name is absent", () => {
    const results = [
      makeValidationResult({
        rule_name: undefined,
        passed: false,
        actual_value: "1 duplicate(s) found [warning]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-004 from seller 29ABCDE1234F1Z5 already exists in: "Dup.pdf" [weak] (uploaded 2024-01-01)',
      }),
    ];

    const result = parseDuplicateResult(results);
    expect(result.found).toBe(true);
  });

  it("defaults to warning severity when actual_value has no bracket", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "1 duplicate(s) found",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-005 from seller 29ABCDE1234F1Z5 already exists in: "Test.pdf" [weak] (uploaded 2024-06-01)',
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.effectiveSeverity).toBe("warning");
  });

  // --- "check unavailable" tests ---

  it("returns unavailable when message contains 'check unavailable'", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "duplicate check unavailable",
        message:
          "Logical: Duplicate Invoice Detection: duplicate check unavailable",
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(false);
    expect(result.unavailable).toBe(true);
    if (result.unavailable) {
      expect(result.message).toContain("check unavailable");
    }
  });

  it("returns unavailable when actual_value contains 'check unavailable'", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "check unavailable",
        message: "Logical: Duplicate Invoice Detection: some message",
      }),
    ];

    const result = parseDuplicateResult(results);
    expect(result.found).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it("returns unavailable when passed: true and message says check unavailable", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: true,
        actual_value: "check unavailable",
        message:
          "Logical: Duplicate Invoice Detection: duplicate check unavailable - missing GSTIN",
      }),
    ];

    const result = parseDuplicateResult(results);
    expect(result.found).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it("returns unavailable when message contains 'check skipped'", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: true,
        message:
          "Logical: Duplicate Invoice Detection: check skipped (empty invoice number)",
      }),
    ];

    const result = parseDuplicateResult(results);
    expect(result.found).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it("returns unavailable when passed: false but no matches can be parsed", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "",
        message: "some message with no parseable matches",
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(false);
    expect(result.unavailable).toBe(true);
    if (result.unavailable) {
      expect(result.message).toBe("some message with no parseable matches");
    }
  });
});

describe("parseDuplicateResult with metadata", () => {
  it("extracts matches from metadata.duplicates with document IDs", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "2 duplicate(s) found [error]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-001 from seller 29ABCDE1234F1Z5 already exists in: "Invoice-A.pdf" [exact_irn] (uploaded 2025-08-01), "Invoice-B.pdf" [weak] (uploaded 2024-03-15)',
        metadata: {
          duplicates: [
            {
              document_id: "550e8400-e29b-41d4-a716-446655440000",
              document_name: "Invoice-A.pdf",
              match_type: "exact_irn",
              created_at: "2025-08-01T00:00:00Z",
            },
            {
              document_id: "660e8400-e29b-41d4-a716-446655440001",
              document_name: "Invoice-B.pdf",
              match_type: "weak",
              created_at: "2024-03-15T00:00:00Z",
            },
          ],
        },
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toEqual({
      documentId: "550e8400-e29b-41d4-a716-446655440000",
      documentName: "Invoice-A.pdf",
      matchType: "exact_irn",
      uploadDate: "2025-08-01",
    });
    expect(result.matches[1]).toEqual({
      documentId: "660e8400-e29b-41d4-a716-446655440001",
      documentName: "Invoice-B.pdf",
      matchType: "weak",
      uploadDate: "2024-03-15",
    });
  });

  it("falls back to message regex when metadata is missing", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "1 duplicate(s) found [error]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-001 from seller 29ABCDE1234F1Z5 already exists in: "Invoice-A.pdf" [strong] (uploaded 2025-08-01)',
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.matches[0].documentId).toBeUndefined();
    expect(result.matches[0].documentName).toBe("Invoice-A.pdf");
  });

  it("falls back to message regex when metadata.duplicates is empty", () => {
    const results = [
      makeValidationResult({
        rule_name: "Logical: Duplicate Invoice Detection",
        passed: false,
        actual_value: "1 duplicate(s) found [warning]",
        message:
          'Logical: Duplicate Invoice Detection: invoice INV-002 from seller 07XYZAB5678C1D2 already exists in: "Old-Invoice.pdf" [weak] (uploaded 2023-11-20)',
        metadata: { duplicates: [] },
      }),
    ];

    const result = parseDuplicateResult(results);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.matches[0].documentId).toBeUndefined();
    expect(result.matches[0].documentName).toBe("Old-Invoice.pdf");
  });
});

describe("getMatchTypeLabel", () => {
  it("returns correct label for exact_irn", () => {
    expect(getMatchTypeLabel("exact_irn")).toContain("confirmed duplicate");
  });

  it("returns correct label for strong", () => {
    expect(getMatchTypeLabel("strong")).toContain("very likely duplicate");
  });

  it("returns correct label for weak", () => {
    expect(getMatchTypeLabel("weak")).toContain("possible duplicate");
  });
});
