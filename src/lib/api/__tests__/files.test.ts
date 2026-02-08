import { vi, describe, it, expect, beforeEach } from "vitest";
import { getFiles, getFile, uploadFile, deleteFile, getFileDownloadUrl } from "@/lib/api/files";

vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockDelete = vi.mocked(apiClient.delete);

const mockFile = {
  id: "f-1",
  name: "invoice.pdf",
  size: 1024,
  content_type: "application/pdf",
  created_at: "2024-01-01",
};

describe("files API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFiles", () => {
    it("calls GET /files with params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [mockFile],
          meta: { total: 1, offset: 0, limit: 20 },
        },
      });

      const result = await getFiles({ limit: 20, offset: 0 });

      expect(mockGet).toHaveBeenCalledWith("/files", {
        params: { limit: 20, offset: 0 },
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe("getFile", () => {
    it("calls GET /files/{id}", async () => {
      const fileWithUrl = { ...mockFile, download_url: "https://s3.example.com/file" };
      mockGet.mockResolvedValue({ data: { data: fileWithUrl } });

      const result = await getFile("f-1");

      expect(mockGet).toHaveBeenCalledWith("/files/f-1");
      expect(result.download_url).toBe("https://s3.example.com/file");
    });
  });

  describe("uploadFile", () => {
    it("sends FormData with file and collection_id", async () => {
      const mockResponse = { id: "f-2", document_id: "d-1" };
      mockPost.mockResolvedValue({ data: { data: mockResponse } });

      const file = new File(["content"], "test.pdf", { type: "application/pdf" });

      const result = await uploadFile(file, "col-1");

      expect(mockPost).toHaveBeenCalledWith(
        "/files/upload",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300000,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("includes onUploadProgress when callback provided", async () => {
      mockPost.mockResolvedValue({ data: { data: { id: "f-2" } } });

      const onProgress = vi.fn();
      const file = new File(["content"], "test.pdf");

      await uploadFile(file, "col-1", onProgress);

      const callArgs = mockPost.mock.calls[0];
      const config = callArgs[2] as Record<string, unknown>;
      expect(config.onUploadProgress).toBeDefined();
    });

    it("calls progress callback with percentage", async () => {
      mockPost.mockImplementation(async (_url, _data, config) => {
        // Simulate progress event
        const onUploadProgress = (config as Record<string, unknown>)?.onUploadProgress as ((e: { loaded: number; total: number }) => void) | undefined;
        if (onUploadProgress) {
          onUploadProgress({ loaded: 50, total: 100 });
        }
        return { data: { data: { id: "f-2" } } };
      });

      const onProgress = vi.fn();
      const file = new File(["content"], "test.pdf");

      await uploadFile(file, "col-1", onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });
  });

  describe("deleteFile", () => {
    it("calls DELETE /files/{id}", async () => {
      mockDelete.mockResolvedValue({});

      await deleteFile("f-1");

      expect(mockDelete).toHaveBeenCalledWith("/files/f-1");
    });
  });

  describe("getFileDownloadUrl", () => {
    it("returns the download_url from file data", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: { ...mockFile, download_url: "https://cdn.example.com/file.pdf" },
        },
      });

      const url = await getFileDownloadUrl("f-1");

      expect(mockGet).toHaveBeenCalledWith("/files/f-1");
      expect(url).toBe("https://cdn.example.com/file.pdf");
    });
  });
});
