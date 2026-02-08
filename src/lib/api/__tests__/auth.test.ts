import { vi, describe, it, expect, beforeEach } from "vitest";
import { login, refreshToken, logout } from "@/lib/api/auth";

vi.mock("@/lib/api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockPost = vi.mocked(apiClient.post);

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("calls POST /auth/login with credentials", async () => {
      const loginResponse = {
        access_token: "at-123",
        refresh_token: "rt-456",
        expires_at: "2025-12-31T00:00:00Z",
      };

      mockPost.mockResolvedValue({ data: { data: loginResponse } });

      const result = await login({
        tenant_slug: "acme",
        email: "user@test.com",
        password: "secret",
      });

      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        tenant_slug: "acme",
        email: "user@test.com",
        password: "secret",
      });
      expect(result).toEqual(loginResponse);
    });

    it("unwraps the nested data response", async () => {
      const loginResponse = {
        access_token: "token",
        refresh_token: "refresh",
        expires_at: "2025-12-31",
        user: { id: "u1", full_name: "Test User" },
      };

      mockPost.mockResolvedValue({ data: { data: loginResponse } });

      const result = await login({
        tenant_slug: "test",
        email: "a@b.com",
        password: "pass",
      });

      expect(result.access_token).toBe("token");
      expect(result.user).toEqual({ id: "u1", full_name: "Test User" });
    });

    it("propagates API errors", async () => {
      mockPost.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        login({ tenant_slug: "x", email: "x@x.com", password: "x" })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refreshToken", () => {
    it("calls POST /auth/refresh with refresh token", async () => {
      const refreshResponse = {
        access_token: "new-at",
        refresh_token: "new-rt",
        expires_at: "2025-12-31",
      };

      mockPost.mockResolvedValue({ data: { data: refreshResponse } });

      const result = await refreshToken({ refresh_token: "old-rt" });

      expect(mockPost).toHaveBeenCalledWith("/auth/refresh", {
        refresh_token: "old-rt",
      });
      expect(result).toEqual(refreshResponse);
    });

    it("propagates errors on invalid refresh token", async () => {
      mockPost.mockRejectedValue(new Error("Token expired"));

      await expect(
        refreshToken({ refresh_token: "expired-rt" })
      ).rejects.toThrow("Token expired");
    });
  });

  describe("logout", () => {
    it("calls POST /auth/logout", async () => {
      mockPost.mockResolvedValue({});

      await logout();

      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });

    it("swallows errors silently", async () => {
      mockPost.mockRejectedValue(new Error("Network error"));

      // Should not throw
      await expect(logout()).resolves.toBeUndefined();
    });
  });
});
