import { vi, describe, it, expect, beforeEach } from "vitest";
import { getCollections, getCollection, exportCollectionCsv } from "@/lib/api/collections";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);

describe("collections API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCollections — current_user_permission mapping", () => {
    it("maps current_user_permission to user_permission on each item", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [
            { id: "col-1", name: "A", current_user_permission: "owner" },
            { id: "col-2", name: "B", current_user_permission: "editor" },
            { id: "col-3", name: "C", current_user_permission: "viewer" },
          ],
          meta: { total: 3, offset: 0, limit: 20 },
        },
      });

      const result = await getCollections();

      expect(result.items[0].user_permission).toBe("owner");
      expect(result.items[1].user_permission).toBe("editor");
      expect(result.items[2].user_permission).toBe("viewer");
    });

    it("preserves existing user_permission when current_user_permission is absent", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [
            { id: "col-1", name: "A", user_permission: "editor" },
          ],
          meta: { total: 1, offset: 0, limit: 20 },
        },
      });

      const result = await getCollections();

      expect(result.items[0].user_permission).toBe("editor");
    });

    it("prefers existing user_permission over current_user_permission", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [
            { id: "col-1", name: "A", user_permission: "owner", current_user_permission: "viewer" },
          ],
          meta: { total: 1, offset: 0, limit: 20 },
        },
      });

      const result = await getCollections();

      expect(result.items[0].user_permission).toBe("owner");
    });
  });

  describe("getCollection — current_user_permission mapping", () => {
    it("maps top-level current_user_permission to collection user_permission", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            collection: { id: "col-1", name: "Test Collection" },
            current_user_permission: "editor",
          },
        },
      });

      const result = await getCollection("col-1");

      expect(result.user_permission).toBe("editor");
      expect(result.name).toBe("Test Collection");
    });

    it("preserves collection.user_permission when already present", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            collection: { id: "col-1", name: "Test", user_permission: "owner" },
          },
        },
      });

      const result = await getCollection("col-1");

      expect(result.user_permission).toBe("owner");
    });

    it("prefers collection.user_permission over top-level current_user_permission", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            collection: { id: "col-1", name: "Test", user_permission: "owner" },
            current_user_permission: "viewer",
          },
        },
      });

      const result = await getCollection("col-1");

      expect(result.user_permission).toBe("owner");
    });
  });

  describe("exportCollectionCsv", () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    const mockClick = vi.fn();
    const mockRemove = vi.fn();

    beforeEach(() => {
      createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: mockClick,
        remove: mockRemove,
      } as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
      createObjectURLSpy = vi.fn().mockReturnValue("blob:http://localhost/fake");
      revokeObjectURLSpy = vi.fn();
      window.URL.createObjectURL = createObjectURLSpy;
      window.URL.revokeObjectURL = revokeObjectURLSpy;
    });

    afterEach(() => {
      createElementSpy.mockRestore();
    });

    it("calls the export endpoint with responseType blob", async () => {
      mockGet.mockResolvedValue({ data: "csv,content" });

      await exportCollectionCsv("col-1", "My Collection");

      expect(mockGet).toHaveBeenCalledWith("/collections/col-1/export/csv", {
        responseType: "blob",
      });
    });

    it("triggers a download with the collection name as filename", async () => {
      mockGet.mockResolvedValue({ data: "csv,content" });

      await exportCollectionCsv("col-1", "Q4 Invoices");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it("falls back to collection ID when name is not provided", async () => {
      mockGet.mockResolvedValue({ data: "csv,content" });
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
        remove: mockRemove,
      };
      createElementSpy.mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

      await exportCollectionCsv("col-abc-123");

      expect(mockAnchor.download).toBe("col-abc-123.csv");
    });
  });
});
