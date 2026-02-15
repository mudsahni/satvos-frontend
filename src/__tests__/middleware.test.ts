import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url: URL) => ({ type: "redirect", url })),
    rewrite: vi.fn((url: URL) => ({ type: "rewrite", url })),
  },
}));

// Helper to create a mock NextRequest
function createRequest(
  pathname: string,
  options?: { authenticated?: boolean; search?: string }
) {
  const url = new URL(
    pathname + (options?.search || ""),
    "http://localhost:3000"
  );
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) =>
        name === "satvos-auth-state" && options?.authenticated
          ? { value: "authenticated" }
          : undefined,
    },
  } as unknown as NextRequest;
}

// Import middleware after mocking next/server
import { middleware } from "@/middleware";

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear BACKEND_URL between tests
    delete process.env.BACKEND_URL;
  });

  // -------------------------------------------------------
  // API Proxy
  // -------------------------------------------------------
  describe("API proxy (/api/v1/*)", () => {
    it("rewrites /api/v1/foo to the backend URL", () => {
      const request = createRequest("/api/v1/foo");
      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledTimes(1);
      const rewrittenUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(rewrittenUrl.toString()).toBe("http://localhost:8080/api/v1/foo");
    });

    it("preserves query parameters on the proxied request", () => {
      const request = createRequest("/api/v1/foo", { search: "?bar=1&baz=2" });
      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledTimes(1);
      const rewrittenUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(rewrittenUrl.toString()).toBe(
        "http://localhost:8080/api/v1/foo?bar=1&baz=2"
      );
    });

    it("uses BACKEND_URL env var when set", () => {
      process.env.BACKEND_URL = "https://api.example.com";
      const request = createRequest("/api/v1/documents");
      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledTimes(1);
      const rewrittenUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(rewrittenUrl.toString()).toBe(
        "https://api.example.com/api/v1/documents"
      );
    });

    it("falls back to http://localhost:8080 when BACKEND_URL is not set", () => {
      delete process.env.BACKEND_URL;
      const request = createRequest("/api/v1/users");
      middleware(request);

      expect(NextResponse.rewrite).toHaveBeenCalledTimes(1);
      const rewrittenUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(rewrittenUrl.origin).toBe("http://localhost:8080");
    });
  });

  // -------------------------------------------------------
  // Protected routes
  // -------------------------------------------------------
  describe("protected routes", () => {
    it("redirects unauthenticated users to /login with returnUrl", () => {
      const request = createRequest("/dashboard");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
      const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("returnUrl")).toBe("/dashboard");
    });

    it("redirects unauthenticated users from protected sub-routes (e.g., /collections/123)", () => {
      const request = createRequest("/collections/123");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
      const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("returnUrl")).toBe(
        "/collections/123"
      );
    });

    it("allows authenticated users to access protected routes (NextResponse.next)", () => {
      const request = createRequest("/dashboard", { authenticated: true });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.rewrite).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------
  // Public routes + authenticated redirects
  // -------------------------------------------------------
  describe("public routes", () => {
    it("redirects authenticated users from /login to /dashboard", () => {
      const request = createRequest("/login", { authenticated: true });
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
      const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/dashboard");
    });

    it("redirects authenticated users from /register to /dashboard", () => {
      const request = createRequest("/register", { authenticated: true });
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
      const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/dashboard");
    });

    it("does NOT redirect authenticated users from /forgot-password", () => {
      const request = createRequest("/forgot-password", {
        authenticated: true,
      });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------
  // Non-protected, non-public routes
  // -------------------------------------------------------
  describe("unmatched routes", () => {
    it("passes through non-protected, non-public routes (e.g., /)", () => {
      const request = createRequest("/");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.rewrite).not.toHaveBeenCalled();
    });

    it("passes through non-protected routes even when authenticated", () => {
      const request = createRequest("/some-page", { authenticated: true });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.rewrite).not.toHaveBeenCalled();
    });
  });
});
