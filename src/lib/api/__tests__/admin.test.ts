import { vi, describe, it, expect, beforeEach } from "vitest";
import { getTenant, updateTenant } from "@/lib/api/admin";

vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);
const mockPut = vi.mocked(apiClient.put);

const mockTenant = {
  id: "t-1",
  name: "Acme Corp",
  slug: "acme-corp",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("admin API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTenant", () => {
    it("calls GET /admin/tenant and returns tenant data", async () => {
      mockGet.mockResolvedValue({ data: { data: mockTenant } });

      const result = await getTenant();

      expect(mockGet).toHaveBeenCalledWith("/admin/tenant");
      expect(result).toEqual(mockTenant);
    });

    it("returns the unwrapped tenant object", async () => {
      mockGet.mockResolvedValue({ data: { data: mockTenant } });

      const result = await getTenant();

      expect(result.id).toBe("t-1");
      expect(result.name).toBe("Acme Corp");
      expect(result.slug).toBe("acme-corp");
      expect(result.is_active).toBe(true);
    });

    it("propagates errors from the API client", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      await expect(getTenant()).rejects.toThrow("Network error");
    });
  });

  describe("updateTenant", () => {
    it("calls PUT /admin/tenant with name update", async () => {
      const updatedTenant = { ...mockTenant, name: "New Name" };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant({ name: "New Name" });

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", {
        name: "New Name",
      });
      expect(result.name).toBe("New Name");
    });

    it("calls PUT /admin/tenant with slug update", async () => {
      const updatedTenant = { ...mockTenant, slug: "new-slug" };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant({ slug: "new-slug" });

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", {
        slug: "new-slug",
      });
      expect(result.slug).toBe("new-slug");
    });

    it("calls PUT /admin/tenant with is_active update", async () => {
      const updatedTenant = { ...mockTenant, is_active: false };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant({ is_active: false });

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", {
        is_active: false,
      });
      expect(result.is_active).toBe(false);
    });

    it("calls PUT /admin/tenant with multiple fields", async () => {
      const updatedTenant = {
        ...mockTenant,
        name: "Updated Corp",
        slug: "updated-corp",
      };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant({
        name: "Updated Corp",
        slug: "updated-corp",
      });

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", {
        name: "Updated Corp",
        slug: "updated-corp",
      });
      expect(result).toEqual(updatedTenant);
    });

    it("propagates errors from the API client", async () => {
      mockPut.mockRejectedValue(new Error("Forbidden"));

      await expect(updateTenant({ name: "Fail" })).rejects.toThrow(
        "Forbidden"
      );
    });
  });
});
