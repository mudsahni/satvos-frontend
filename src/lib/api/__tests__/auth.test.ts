import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  login,
  refreshToken,
  logout,
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "@/lib/api/auth";

vi.mock("@/lib/api/client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from "@/lib/api/client";

const mockPost = vi.mocked(apiClient.post);
const mockGet = vi.mocked(apiClient.get);

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

  describe("register", () => {
    it("calls POST /auth/register with registration data", async () => {
      const registerResponse = {
        user: { id: "u1", full_name: "Test User", email: "test@example.com" },
        collection: { id: "c1", name: "Personal" },
        access_token: "tok",
        refresh_token: "ref",
      };

      mockPost.mockResolvedValue({ data: { data: registerResponse } });

      const result = await register({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
      });

      expect(mockPost).toHaveBeenCalledWith("/auth/register", {
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
      });
      expect(result).toEqual(registerResponse);
    });

    it("unwraps the nested data response", async () => {
      const registerResponse = {
        user: { id: "u2", full_name: "Jane Doe", email: "jane@example.com" },
        access_token: "at-abc",
        refresh_token: "rt-xyz",
      };

      mockPost.mockResolvedValue({ data: { data: registerResponse } });

      const result = await register({
        email: "jane@example.com",
        password: "securepass",
        full_name: "Jane Doe",
      });

      expect(result.user).toEqual({
        id: "u2",
        full_name: "Jane Doe",
        email: "jane@example.com",
      });
      expect(result.access_token).toBe("at-abc");
      expect(result.refresh_token).toBe("rt-xyz");
    });

    it("propagates API errors", async () => {
      mockPost.mockRejectedValue(new Error("Email already exists"));

      await expect(
        register({
          email: "taken@example.com",
          password: "password123",
          full_name: "Dupe User",
        })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("verifyEmail", () => {
    it("calls GET /auth/verify-email with token param", async () => {
      mockGet.mockResolvedValue({
        data: { data: { message: "email verified successfully" } },
      });

      const result = await verifyEmail("jwt-token-123");

      expect(mockGet).toHaveBeenCalledWith("/auth/verify-email", {
        params: { token: "jwt-token-123" },
      });
      expect(result.message).toBe("email verified successfully");
    });

    it("propagates errors on invalid token", async () => {
      mockGet.mockRejectedValue(new Error("unauthorized"));

      await expect(verifyEmail("bad-token")).rejects.toThrow("unauthorized");
    });
  });

  describe("resendVerification", () => {
    it("calls POST /auth/resend-verification", async () => {
      mockPost.mockResolvedValue({
        data: { data: { message: "verification email sent" } },
      });

      const result = await resendVerification();

      expect(mockPost).toHaveBeenCalledWith("/auth/resend-verification");
      expect(result.message).toBe("verification email sent");
    });
  });

  describe("forgotPassword", () => {
    it("calls POST /auth/forgot-password with tenant_slug and email", async () => {
      mockPost.mockResolvedValue({
        data: {
          data: {
            message:
              "if an account with that email exists, a password reset link has been sent",
          },
        },
      });

      const result = await forgotPassword({
        tenant_slug: "satvos",
        email: "user@test.com",
      });

      expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", {
        tenant_slug: "satvos",
        email: "user@test.com",
      });
      expect(result.message).toContain("password reset link");
    });

    it("always returns 200 — does not throw for unknown emails", async () => {
      mockPost.mockResolvedValue({
        data: {
          data: {
            message:
              "if an account with that email exists, a password reset link has been sent",
          },
        },
      });

      const result = await forgotPassword({
        tenant_slug: "satvos",
        email: "nonexistent@test.com",
      });

      expect(result.message).toBeDefined();
    });
  });

  describe("resetPassword", () => {
    it("calls POST /auth/reset-password with token and new_password", async () => {
      mockPost.mockResolvedValue({
        data: {
          data: { message: "password has been reset successfully" },
        },
      });

      const result = await resetPassword({
        token: "reset-jwt-token",
        new_password: "newpassword123",
      });

      expect(mockPost).toHaveBeenCalledWith("/auth/reset-password", {
        token: "reset-jwt-token",
        new_password: "newpassword123",
      });
      expect(result.message).toBe("password has been reset successfully");
    });

    it("propagates errors on invalid/expired token", async () => {
      mockPost.mockRejectedValue(new Error("Token expired"));

      await expect(
        resetPassword({
          token: "expired-token",
          new_password: "newpassword123",
        })
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
