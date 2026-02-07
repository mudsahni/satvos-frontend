import { Document } from "@/types/document";

export type AttentionFilter = "all" | "invalid" | "warning" | "pending_review" | "failed";

/** Returns true if this document needs attention */
export function needsAttention(doc: Document): boolean {
  return (
    doc.validation_status === "invalid" ||
    doc.validation_status === "warning" ||
    (doc.parsing_status === "completed" && doc.review_status === "pending") ||
    doc.parsing_status === "failed"
  );
}

/** Matches a document against the active filter */
export function matchesFilter(doc: Document, filter: AttentionFilter): boolean {
  switch (filter) {
    case "invalid":
      return doc.validation_status === "invalid";
    case "warning":
      return doc.validation_status === "warning";
    case "pending_review":
      return doc.parsing_status === "completed" && doc.review_status === "pending";
    case "failed":
      return doc.parsing_status === "failed";
    case "all":
      return needsAttention(doc);
  }
}
