import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getServiceAccounts,
  getServiceAccount,
  createServiceAccount,
  rotateServiceAccountKey,
  revokeServiceAccount,
  deleteServiceAccount,
  getServiceAccountPermissions,
  grantServiceAccountPermission,
  removeServiceAccountPermission,
} from "@/lib/api/service-accounts";

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

const mockServiceAccount = {
  id: "sa-1",
  tenant_id: "t-1",
  name: "CI Bot",
  description: "Used for CI/CD",
  api_key_prefix: "sk_test_",
  is_active: true,
  created_by: "u-1",
  last_used_at: "2024-06-01T00:00:00Z",
  expires_at: "2027-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockPermission = {
  id: "perm-1",
  service_account_id: "sa-1",
  collection_id: "col-1",
  tenant_id: "t-1",
  permission: "editor" as const,
  granted_by: "u-1",
};

describe("service-accounts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceAccounts", () => {
    it("calls GET /service-accounts with params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [mockServiceAccount],
          meta: { total: 1, offset: 0, limit: 20 },
        },
      });

      const result = await getServiceAccounts({ limit: 20, offset: 0 });

      expect(mockGet).toHaveBeenCalledWith("/service-accounts", {
        params: { limit: 20, offset: 0 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockServiceAccount);
      expect(result.total).toBe(1);
    });

    it("calls GET /service-accounts without params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [],
          meta: { total: 0, offset: 0, limit: 20 },
        },
      });

      await getServiceAccounts();

      expect(mockGet).toHaveBeenCalledWith("/service-accounts", {
        params: undefined,
      });
    });

    it("transforms pagination metadata correctly", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [mockServiceAccount, { ...mockServiceAccount, id: "sa-2" }],
          meta: { total: 5, offset: 0, limit: 2 },
        },
      });

      const result = await getServiceAccounts({ limit: 2, offset: 0 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(2);
      expect(result.total_pages).toBe(3);
    });

    it("returns correct page for offset-based pagination", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [mockServiceAccount],
          meta: { total: 5, offset: 2, limit: 2 },
        },
      });

      const result = await getServiceAccounts({ limit: 2, offset: 2 });

      expect(result.page).toBe(2);
    });
  });

  describe("getServiceAccount", () => {
    it("calls GET /service-accounts/{id}", async () => {
      mockGet.mockResolvedValue({ data: { data: mockServiceAccount } });

      const result = await getServiceAccount("sa-1");

      expect(mockGet).toHaveBeenCalledWith("/service-accounts/sa-1");
      expect(result).toEqual(mockServiceAccount);
    });

    it("propagates errors", async () => {
      mockGet.mockRejectedValue(new Error("Not found"));

      await expect(getServiceAccount("sa-invalid")).rejects.toThrow(
        "Not found"
      );
    });
  });

  describe("createServiceAccount", () => {
    it("calls POST /service-accounts with data", async () => {
      const createResponse = {
        service_account: mockServiceAccount,
        api_key: "sk_test_full_api_key_here",
      };
      mockPost.mockResolvedValue({ data: { data: createResponse } });

      const result = await createServiceAccount({
        name: "CI Bot",
        description: "Used for CI/CD",
        expires_at: "2027-01-01T00:00:00Z",
      });

      expect(mockPost).toHaveBeenCalledWith("/service-accounts", {
        name: "CI Bot",
        description: "Used for CI/CD",
        expires_at: "2027-01-01T00:00:00Z",
      });
      expect(result.service_account).toEqual(mockServiceAccount);
      expect(result.api_key).toBe("sk_test_full_api_key_here");
    });

    it("calls POST /service-accounts with name only", async () => {
      const createResponse = {
        service_account: mockServiceAccount,
        api_key: "sk_test_key",
      };
      mockPost.mockResolvedValue({ data: { data: createResponse } });

      const result = await createServiceAccount({ name: "Minimal Bot" });

      expect(mockPost).toHaveBeenCalledWith("/service-accounts", {
        name: "Minimal Bot",
      });
      expect(result.api_key).toBe("sk_test_key");
    });
  });

  describe("rotateServiceAccountKey", () => {
    it("calls POST /service-accounts/{id}/rotate-key", async () => {
      mockPost.mockResolvedValue({
        data: { data: { api_key: "sk_test_new_key" } },
      });

      const result = await rotateServiceAccountKey("sa-1");

      expect(mockPost).toHaveBeenCalledWith(
        "/service-accounts/sa-1/rotate-key"
      );
      expect(result.api_key).toBe("sk_test_new_key");
    });

    it("propagates errors", async () => {
      mockPost.mockRejectedValue(new Error("Forbidden"));

      await expect(rotateServiceAccountKey("sa-1")).rejects.toThrow(
        "Forbidden"
      );
    });
  });

  describe("revokeServiceAccount", () => {
    it("calls POST /service-accounts/{id}/revoke", async () => {
      mockPost.mockResolvedValue({});

      await revokeServiceAccount("sa-1");

      expect(mockPost).toHaveBeenCalledWith(
        "/service-accounts/sa-1/revoke"
      );
    });

    it("propagates errors", async () => {
      mockPost.mockRejectedValue(new Error("Already revoked"));

      await expect(revokeServiceAccount("sa-1")).rejects.toThrow(
        "Already revoked"
      );
    });
  });

  describe("deleteServiceAccount", () => {
    it("calls DELETE /service-accounts/{id}", async () => {
      mockDelete.mockResolvedValue({});

      await deleteServiceAccount("sa-1");

      expect(mockDelete).toHaveBeenCalledWith("/service-accounts/sa-1");
    });

    it("propagates errors", async () => {
      mockDelete.mockRejectedValue(new Error("Not found"));

      await expect(deleteServiceAccount("sa-invalid")).rejects.toThrow(
        "Not found"
      );
    });
  });

  describe("getServiceAccountPermissions", () => {
    it("calls GET /service-accounts/{id}/permissions", async () => {
      mockGet.mockResolvedValue({
        data: { data: [mockPermission] },
      });

      const result = await getServiceAccountPermissions("sa-1");

      expect(mockGet).toHaveBeenCalledWith(
        "/service-accounts/sa-1/permissions"
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPermission);
    });

    it("returns empty array when no permissions exist", async () => {
      mockGet.mockResolvedValue({ data: { data: [] } });

      const result = await getServiceAccountPermissions("sa-1");

      expect(result).toEqual([]);
    });
  });

  describe("grantServiceAccountPermission", () => {
    it("calls POST /service-accounts/{id}/permissions with data", async () => {
      mockPost.mockResolvedValue({ data: { data: mockPermission } });

      const result = await grantServiceAccountPermission("sa-1", {
        collection_id: "col-1",
        permission: "editor",
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/service-accounts/sa-1/permissions",
        {
          collection_id: "col-1",
          permission: "editor",
        }
      );
      expect(result).toEqual(mockPermission);
    });

    it("returns the created permission object", async () => {
      const ownerPermission = { ...mockPermission, permission: "owner" as const };
      mockPost.mockResolvedValue({ data: { data: ownerPermission } });

      const result = await grantServiceAccountPermission("sa-1", {
        collection_id: "col-1",
        permission: "owner",
      });

      expect(result.permission).toBe("owner");
      expect(result.collection_id).toBe("col-1");
      expect(result.service_account_id).toBe("sa-1");
    });
  });

  describe("removeServiceAccountPermission", () => {
    it("calls DELETE /service-accounts/{id}/permissions/{collectionId}", async () => {
      mockDelete.mockResolvedValue({});

      await removeServiceAccountPermission("sa-1", "col-1");

      expect(mockDelete).toHaveBeenCalledWith(
        "/service-accounts/sa-1/permissions/col-1"
      );
    });

    it("propagates errors", async () => {
      mockDelete.mockRejectedValue(new Error("Permission not found"));

      await expect(
        removeServiceAccountPermission("sa-1", "col-invalid")
      ).rejects.toThrow("Permission not found");
    });
  });
});
