import { vi, describe, it, expect, beforeEach } from "vitest";
import { getUsers, getUser, createUser, updateUser, deleteUser, searchUsers } from "@/lib/api/users";

vi.mock("@/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

const mockUser = {
  id: "u-1",
  full_name: "John Doe",
  email: "john@test.com",
  role: "member",
  is_active: true,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("calls GET /users with params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [mockUser],
          meta: { total: 1, offset: 0, limit: 20 },
        },
      });

      const result = await getUsers({ limit: 20, offset: 0 });

      expect(mockGet).toHaveBeenCalledWith("/users", {
        params: { limit: 20, offset: 0 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("calls GET /users without params", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [],
          meta: { total: 0, offset: 0, limit: 20 },
        },
      });

      await getUsers();

      expect(mockGet).toHaveBeenCalledWith("/users", { params: undefined });
    });
  });

  describe("getUser", () => {
    it("calls GET /users/{id}", async () => {
      mockGet.mockResolvedValue({ data: { data: mockUser } });

      const result = await getUser("u-1");

      expect(mockGet).toHaveBeenCalledWith("/users/u-1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("createUser", () => {
    it("calls POST /users with data", async () => {
      mockPost.mockResolvedValue({ data: { data: mockUser } });

      const result = await createUser({
        email: "john@test.com",
        full_name: "John Doe",
        password: "password123",
        role: "member",
      });

      expect(mockPost).toHaveBeenCalledWith("/users", {
        email: "john@test.com",
        full_name: "John Doe",
        password: "password123",
        role: "member",
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUser", () => {
    it("calls PUT /users/{id} with data", async () => {
      const updated = { ...mockUser, full_name: "Jane Doe" };
      mockPut.mockResolvedValue({ data: { data: updated } });

      const result = await updateUser("u-1", { full_name: "Jane Doe" });

      expect(mockPut).toHaveBeenCalledWith("/users/u-1", {
        full_name: "Jane Doe",
      });
      expect(result.full_name).toBe("Jane Doe");
    });
  });

  describe("deleteUser", () => {
    it("calls DELETE /users/{id}", async () => {
      mockDelete.mockResolvedValue({});

      await deleteUser("u-1");

      expect(mockDelete).toHaveBeenCalledWith("/users/u-1");
    });
  });

  describe("searchUsers", () => {
    it("calls GET /users/search with query param", async () => {
      mockGet.mockResolvedValue({ data: { data: [mockUser] } });

      const result = await searchUsers("john");

      expect(mockGet).toHaveBeenCalledWith("/users/search", {
        params: { q: "john" },
      });
      expect(result).toEqual([mockUser]);
    });

    it("returns empty array for no matches", async () => {
      mockGet.mockResolvedValue({ data: { data: [] } });

      const result = await searchUsers("nobody");

      expect(result).toEqual([]);
    });
  });
});
