import { vi, describe, it, expect, beforeEach } from "vitest";
import { getCollections, getCollection } from "@/lib/api/collections";

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
});
