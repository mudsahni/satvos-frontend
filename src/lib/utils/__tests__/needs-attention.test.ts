import { describe, it, expect } from "vitest";
import { needsAttention, matchesFilter } from "@/lib/utils/needs-attention";
import { Document } from "@/types/document";

/** Helper to create a partial document with sensible defaults */
function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: "doc-1",
    tenant_id: "t-1",
    collection_id: "col-1",
    file_id: "f-1",
    name: "Test Invoice",
    parsing_status: "completed",
    validation_status: "valid",
    review_status: "approved",
    reconciliation_status: "valid",
    parse_mode: "single",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("needsAttention", () => {
  it("returns true for validation_status invalid", () => {
    expect(needsAttention(makeDoc({ validation_status: "invalid" }))).toBe(true);
  });

  it("returns true for validation_status warning", () => {
    expect(needsAttention(makeDoc({ validation_status: "warning" }))).toBe(true);
  });

  it("returns true for pending review when parsing completed", () => {
    expect(
      needsAttention(makeDoc({ parsing_status: "completed", review_status: "pending" }))
    ).toBe(true);
  });

  it("returns false for pending review when parsing not completed", () => {
    expect(
      needsAttention(makeDoc({ parsing_status: "processing", review_status: "pending" }))
    ).toBe(false);
  });

  it("returns true for failed parsing", () => {
    expect(needsAttention(makeDoc({ parsing_status: "failed" }))).toBe(true);
  });

  it("returns false for a fully valid and approved document", () => {
    expect(
      needsAttention(
        makeDoc({
          validation_status: "valid",
          review_status: "approved",
          parsing_status: "completed",
        })
      )
    ).toBe(false);
  });
});

describe("matchesFilter", () => {
  const invalidDoc = makeDoc({ validation_status: "invalid" });
  const warningDoc = makeDoc({ validation_status: "warning" });
  const pendingReviewDoc = makeDoc({ parsing_status: "completed", review_status: "pending" });
  const failedDoc = makeDoc({ parsing_status: "failed" });
  const healthyDoc = makeDoc({
    validation_status: "valid",
    review_status: "approved",
    parsing_status: "completed",
  });

  describe("filter: all", () => {
    it("includes all documents that need attention", () => {
      expect(matchesFilter(invalidDoc, "all")).toBe(true);
      expect(matchesFilter(warningDoc, "all")).toBe(true);
      expect(matchesFilter(pendingReviewDoc, "all")).toBe(true);
      expect(matchesFilter(failedDoc, "all")).toBe(true);
    });

    it("excludes healthy documents", () => {
      expect(matchesFilter(healthyDoc, "all")).toBe(false);
    });
  });

  describe("filter: invalid", () => {
    it("includes only invalid validation docs", () => {
      expect(matchesFilter(invalidDoc, "invalid")).toBe(true);
      expect(matchesFilter(warningDoc, "invalid")).toBe(false);
      expect(matchesFilter(pendingReviewDoc, "invalid")).toBe(false);
      expect(matchesFilter(failedDoc, "invalid")).toBe(false);
    });
  });

  describe("filter: warning", () => {
    it("includes only warning validation docs", () => {
      expect(matchesFilter(warningDoc, "warning")).toBe(true);
      expect(matchesFilter(invalidDoc, "warning")).toBe(false);
      expect(matchesFilter(pendingReviewDoc, "warning")).toBe(false);
    });
  });

  describe("filter: pending_review", () => {
    it("includes only parsed docs pending review", () => {
      expect(matchesFilter(pendingReviewDoc, "pending_review")).toBe(true);
      expect(matchesFilter(invalidDoc, "pending_review")).toBe(false);
    });

    it("excludes docs still parsing even if review is pending", () => {
      const stillParsing = makeDoc({ parsing_status: "processing", review_status: "pending" });
      expect(matchesFilter(stillParsing, "pending_review")).toBe(false);
    });
  });

  describe("filter: failed", () => {
    it("includes only failed parsing docs", () => {
      expect(matchesFilter(failedDoc, "failed")).toBe(true);
      expect(matchesFilter(invalidDoc, "failed")).toBe(false);
      expect(matchesFilter(pendingReviewDoc, "failed")).toBe(false);
    });
  });
});
