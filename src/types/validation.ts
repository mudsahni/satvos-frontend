export interface ValidationResult {
  rule_id: string;
  field_path: string;
  passed: boolean;
  message: string;
  actual_value?: string;
  expected_value?: string;
  validated_at: string;
  reconciliation_critical: boolean;
  // Legacy fields for backwards compatibility
  id?: string;
  document_id?: string;
  rule_name?: string;
  rule_type?: ValidationRuleType;
  severity?: ValidationSeverity;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export type ValidationRuleType =
  | "required"
  | "format"
  | "math"
  | "logical"
  | "cross_field"
  | "business"
  | "custom";

export type ValidationSeverity = "error" | "warning";

export interface ValidationSummary {
  total: number;
  passed: number;
  warnings: number;
  errors: number;
  reconciliation_critical_passed: number;
  reconciliation_critical_total: number;
}

export interface FieldValidationStatus {
  field_path: string;
  status: "valid" | "invalid" | "warning" | "unsure";
  messages: string[];
}

// Helper to determine severity from validation result
// In the new API, reconciliation_critical = true means it's an error-level issue
export function getValidationSeverity(result: ValidationResult): ValidationSeverity {
  if (result.severity) return result.severity;
  return result.reconciliation_critical ? "error" : "warning";
}

// Helper to extract rule type from message prefix
export function getRuleType(result: ValidationResult): ValidationRuleType {
  if (result.rule_type) return result.rule_type;

  const message = result.message.toLowerCase();
  if (message.startsWith("required:")) return "required";
  if (message.startsWith("format:")) return "format";
  if (message.startsWith("math:")) return "math";
  if (message.startsWith("logical:")) return "logical";
  if (message.startsWith("cross-field:")) return "cross_field";
  return "business";
}

export function getValidationSummary(
  results: ValidationResult[]
): ValidationSummary {
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;

  // Use reconciliation_critical to determine error vs warning
  const errors = results.filter(
    (r) => !r.passed && r.reconciliation_critical
  ).length;
  const warnings = results.filter(
    (r) => !r.passed && !r.reconciliation_critical
  ).length;

  const reconciliationCritical = results.filter((r) => r.reconciliation_critical);
  const reconciliation_critical_total = reconciliationCritical.length;
  const reconciliation_critical_passed = reconciliationCritical.filter(
    (r) => r.passed
  ).length;

  return {
    total,
    passed,
    warnings,
    errors,
    reconciliation_critical_passed,
    reconciliation_critical_total,
  };
}

export function getFieldValidationStatus(
  results: ValidationResult[],
  fieldPath: string
): FieldValidationStatus {
  const fieldResults = results.filter((r) => r.field_path === fieldPath);

  if (fieldResults.length === 0) {
    return { field_path: fieldPath, status: "unsure", messages: [] };
  }

  const hasError = fieldResults.some(
    (r) => !r.passed && r.reconciliation_critical
  );
  const hasWarning = fieldResults.some(
    (r) => !r.passed && !r.reconciliation_critical
  );

  const status = hasError ? "invalid" : hasWarning ? "warning" : "valid";
  const messages = fieldResults
    .filter((r) => !r.passed)
    .map((r) => r.message);

  return { field_path: fieldPath, status, messages };
}
