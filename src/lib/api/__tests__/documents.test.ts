import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  addDocumentTag,
  getDocumentTags,
  assignDocument,
  getReviewQueue,
} from "@/lib/api/documents";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

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

  describe("assignDocument", () => {
    it("calls PUT /documents/{id}/assign with assignee_id", async () => {
      const mockDoc = { id: "doc-1", assigned_to: "user-2" };
      mockPut.mockResolvedValue({ data: { data: mockDoc } });

      const result = await assignDocument("doc-1", { assignee_id: "user-2" });

      expect(mockPut).toHaveBeenCalledWith("/documents/doc-1/assign", {
        assignee_id: "user-2",
      });
      expect(result).toEqual(mockDoc);
    });

    it("calls PUT /documents/{id}/assign with null to unassign", async () => {
      const mockDoc = { id: "doc-1", assigned_to: null };
      mockPut.mockResolvedValue({ data: { data: mockDoc } });

      const result = await assignDocument("doc-1", { assignee_id: null });

      expect(mockPut).toHaveBeenCalledWith("/documents/doc-1/assign", {
        assignee_id: null,
      });
      expect(result).toEqual(mockDoc);
    });
  });

  describe("getReviewQueue", () => {
    it("calls GET /documents/review-queue with params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [],
          meta: { total: 0, offset: 0, limit: 20 },
        },
      });

      await getReviewQueue({ offset: 0, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith("/documents/review-queue", {
        params: { offset: 0, limit: 20 },
      });
    });

    it("returns transformed pagination response", async () => {
      const mockDocs = [
        { id: "doc-1", name: "Invoice 1" },
        { id: "doc-2", name: "Invoice 2" },
      ];
      mockGet.mockResolvedValue({
        data: {
          data: mockDocs,
          meta: { total: 5, offset: 0, limit: 20 },
        },
      });

      const result = await getReviewQueue({ offset: 0, limit: 20 });

      expect(result.items).toEqual(mockDocs);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(20);
    });
  });
});
