import { vi, describe, it, expect, beforeEach } from "vitest";
import { addDocumentTag, getDocumentTags } from "@/lib/api/documents";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe("documents API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDocumentTags", () => {
    it("calls GET /documents/{id}/tags", async () => {
      const mockTags = [
        { id: "tag-1", document_id: "doc-1", key: "vendor", value: "Acme", source: "user", created_at: "2024-01-01" },
      ];

      mockGet.mockResolvedValue({ data: { data: mockTags } });

      const result = await getDocumentTags("doc-1");

      expect(mockGet).toHaveBeenCalledWith("/documents/doc-1/tags");
      expect(result).toEqual(mockTags);
    });
  });

  describe("addDocumentTag", () => {
    it("sends correct { tags: {...} } format", async () => {
      const mockResponse = [
        { id: "tag-1", document_id: "doc-1", key: "vendor", value: "Acme", source: "user", created_at: "2024-01-01" },
      ];

      mockPost.mockResolvedValue({ data: { data: mockResponse } });

      const result = await addDocumentTag("doc-1", {
        tags: { vendor: "Acme" },
      });

      expect(mockPost).toHaveBeenCalledWith("/documents/doc-1/tags", {
        tags: { vendor: "Acme" },
      });
      expect(result).toEqual(mockResponse);
    });

    it("sends multiple tags in a single request", async () => {
      const mockResponse = [
        { id: "tag-1", document_id: "doc-1", key: "vendor", value: "Acme", source: "user", created_at: "2024-01-01" },
        { id: "tag-2", document_id: "doc-1", key: "project", value: "Q4", source: "user", created_at: "2024-01-01" },
      ];

      mockPost.mockResolvedValue({ data: { data: mockResponse } });

      const result = await addDocumentTag("doc-1", {
        tags: { vendor: "Acme", project: "Q4" },
      });

      expect(mockPost).toHaveBeenCalledWith("/documents/doc-1/tags", {
        tags: { vendor: "Acme", project: "Q4" },
      });
      expect(result).toHaveLength(2);
    });
  });
});
