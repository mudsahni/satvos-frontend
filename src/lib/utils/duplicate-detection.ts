import { ValidationResult } from "@/types/validation";

const DUPLICATE_RULE_NAME = "Logical: Duplicate Invoice Detection";

export type EffectiveSeverity = "error" | "warning";

export type MatchType = "exact_irn" | "strong" | "weak";

export interface DuplicateMatchInfo {
  documentName: string;
  matchType: MatchType;
  uploadDate: string;
}

interface DuplicateDetectionResult {
  found: true;
  unavailable: false;
  effectiveSeverity: EffectiveSeverity;
  matchCount: number;
  message: string;
  matches: DuplicateMatchInfo[];
}

interface DuplicateUnavailableResult {
  found: false;
  unavailable: true;
  message: string;
}

interface NoDuplicateResult {
  found: false;
  unavailable: false;
}

export type DuplicateParseResult =
  | DuplicateDetectionResult
  | DuplicateUnavailableResult
  | NoDuplicateResult;

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  exact_irn: "Exact IRN match — confirmed duplicate",
  strong: "Same seller, invoice number & financial year — very likely duplicate",
  weak: "Same seller & invoice number, different financial year — possible duplicate",
};

export function getMatchTypeLabel(matchType: MatchType): string {
  return MATCH_TYPE_LABELS[matchType] ?? matchType;
}

/**
 * Check if the duplicate detection result indicates the check was unavailable.
 * This happens when the parsed data is missing seller GSTIN or invoice number.
 */
function isCheckUnavailable(result: ValidationResult): boolean {
  const msg = (result.message ?? "").toLowerCase();
  const actual = (result.actual_value ?? "").toLowerCase();
  return (
    msg.includes("check unavailable") ||
    msg.includes("check skipped") ||
    actual.includes("check unavailable") ||
    actual.includes("check skipped")
  );
}

/**
 * Find and parse the duplicate invoice detection result from validation results.
 */
export function parseDuplicateResult(
  results: ValidationResult[]
): DuplicateParseResult {
  const result = results.find(
    (r) =>
      r.rule_name === DUPLICATE_RULE_NAME ||
      r.message?.includes("Duplicate Invoice Detection")
  );

  if (!result) {
    return { found: false, unavailable: false };
  }

  // Check was skipped (missing GSTIN or invoice number) — regardless of passed flag
  if (isCheckUnavailable(result)) {
    return { found: false, unavailable: true, message: result.message };
  }

  if (result.passed) {
    return { found: false, unavailable: false };
  }

  // Actual duplicates detected — extract match details from message
  const matches = extractMatches(result.message);
  const matchCount = extractMatchCount(result.actual_value ?? "");

  // Guard: if we can't parse any matches from the message, treat as unavailable
  // rather than showing a confusing "0 matches" alert
  if (matches.length === 0 && matchCount === 0) {
    return { found: false, unavailable: true, message: result.message };
  }

  return {
    found: true,
    unavailable: false,
    effectiveSeverity: extractEffectiveSeverity(result.actual_value ?? ""),
    matchCount,
    message: result.message,
    matches,
  };
}

/**
 * Extract effective severity from actual_value.
 * Format: "2 duplicate(s) found [error]" or "1 duplicate(s) found [warning]"
 *
 * Important: The rule's `severity` field is always "warning" (registered DB severity).
 * The *effective* severity is embedded in `actual_value` and escalates to "error"
 * when any match is exact_irn or strong.
 */
function extractEffectiveSeverity(actualValue: string): EffectiveSeverity {
  const match = actualValue.match(/\[(error|warning)\]/);
  return match?.[1] === "error" ? "error" : "warning";
}

/**
 * Extract duplicate count from actual_value.
 * Format: "2 duplicate(s) found [error]"
 */
function extractMatchCount(actualValue: string): number {
  const match = actualValue.match(/^(\d+)\s+duplicate/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract individual match details from the message string.
 * Format: "Invoice-A.pdf" [exact_irn] (uploaded 2025-08-01), "Invoice-B.pdf" [weak] (uploaded 2024-03-15)
 */
function extractMatches(message: string): DuplicateMatchInfo[] {
  const pattern =
    /"([^"]+)"\s+\[(exact_irn|strong|weak)\]\s+\(uploaded\s+(\d{4}-\d{2}-\d{2})\)/g;
  const matches: DuplicateMatchInfo[] = [];
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(message)) !== null) {
    matches.push({
      documentName: m[1],
      matchType: m[2] as MatchType,
      uploadDate: m[3],
    });
  }

  return matches;
}
