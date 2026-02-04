import { StructuredInvoiceData } from "@/types/document";

/**
 * Get a nested value from an object using dot-notation path.
 * Supports array indexing, e.g. "line_items.0.description".
 */
export function getValueAtPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a nested value on an object using dot-notation path (mutates).
 * Creates intermediate objects/arrays as needed.
 * Supports array indexing, e.g. "line_items.0.description".
 */
export function setValueAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const isNextIndex = /^\d+$/.test(nextPart);

    if (current[part] === undefined || current[part] === null) {
      current[part] = isNextIndex ? [] : {};
    }

    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Apply a map of field edits to structured data, returning a new object.
 * Keys are dot-notation paths (e.g. "invoice.invoice_number", "line_items.0.description").
 * Values are strings that get coerced to the original field's type.
 */
export function applyEditsToStructuredData(
  original: StructuredInvoiceData,
  edits: Record<string, string>
): StructuredInvoiceData {
  // Deep clone
  const clone = JSON.parse(JSON.stringify(original)) as StructuredInvoiceData;

  for (const [path, stringValue] of Object.entries(edits)) {
    const originalValue = getValueAtPath(original, path);

    let coerced: unknown;
    if (typeof originalValue === "number") {
      const parsed = parseFloat(stringValue);
      coerced = isNaN(parsed) ? 0 : parsed;
    } else if (typeof originalValue === "boolean") {
      coerced = stringValue === "true";
    } else {
      // String or new field — keep as string
      coerced = stringValue;
    }

    setValueAtPath(clone as unknown as Record<string, unknown>, path, coerced);
  }

  return clone;
}
