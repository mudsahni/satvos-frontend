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
    it("calls GET /admin/tenant and returns unwrapped tenant data", async () => {
      mockGet.mockResolvedValue({ data: { data: mockTenant } });

      const result = await getTenant();

      expect(mockGet).toHaveBeenCalledWith("/admin/tenant");
      expect(result).toEqual(mockTenant);
    });

    it("propagates errors from the API client", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      await expect(getTenant()).rejects.toThrow("Network error");
    });
  });

  describe("updateTenant", () => {
    it.each([
      ["name", { name: "New Name" }],
      ["slug", { slug: "new-slug" }],
      ["is_active", { is_active: false }],
    ] as const)("updates %s field", async (_field, payload) => {
      const updatedTenant = { ...mockTenant, ...payload };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant(payload);

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", payload);
      expect(result).toEqual(updatedTenant);
    });

    it("updates multiple fields at once", async () => {
      const payload = { name: "Updated Corp", slug: "updated-corp" };
      const updatedTenant = { ...mockTenant, ...payload };
      mockPut.mockResolvedValue({ data: { data: updatedTenant } });

      const result = await updateTenant(payload);

      expect(mockPut).toHaveBeenCalledWith("/admin/tenant", payload);
      expect(result).toEqual(updatedTenant);
    });

    it("propagates errors from the API client", async () => {
      mockPut.mockRejectedValue(new Error("Forbidden"));

      await expect(updateTenant({ name: "Fail" })).rejects.toThrow("Forbidden");
    });
  });
});
