import { Collection, getCollectionDocumentCount } from "../collection";

// Factory helper to create a minimal Collection with overrides
function makeCollection(overrides: Partial<Collection> = {}): Collection {
  return {
    id: "col-1",
    tenant_id: "tenant-1",
    name: "Test Collection",
    created_by: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("getCollectionDocumentCount", () => {
  it("prefers documents_count when set", () => {
    const collection = makeCollection({
      documents_count: 10,
      document_count: 5,
      files_count: 3,
      file_count: 2,
      total_documents: 1,
    });
    expect(getCollectionDocumentCount(collection)).toBe(10);
  });

  it("falls back to document_count when documents_count is undefined", () => {
    const collection = makeCollection({
      document_count: 8,
      files_count: 3,
      file_count: 2,
      total_documents: 1,
    });
    expect(getCollectionDocumentCount(collection)).toBe(8);
  });

  it("falls back to files_count when documents_count and document_count are undefined", () => {
    const collection = makeCollection({
      files_count: 6,
      file_count: 2,
      total_documents: 1,
    });
    expect(getCollectionDocumentCount(collection)).toBe(6);
  });

  it("falls back to file_count when earlier fields are undefined", () => {
    const collection = makeCollection({
      file_count: 4,
      total_documents: 1,
    });
    expect(getCollectionDocumentCount(collection)).toBe(4);
  });

  it("falls back to total_documents when all other fields are undefined", () => {
    const collection = makeCollection({
      total_documents: 15,
    });
    expect(getCollectionDocumentCount(collection)).toBe(15);
  });

  it("returns 0 when no count fields are set", () => {
    const collection = makeCollection();
    expect(getCollectionDocumentCount(collection)).toBe(0);
  });

  it("uses documents_count even when it is 0 (nullish coalescing, not falsy)", () => {
    const collection = makeCollection({
      documents_count: 0,
      document_count: 5,
      files_count: 3,
    });
    // ?? only falls through on null/undefined, not on 0
    expect(getCollectionDocumentCount(collection)).toBe(0);
  });
});
