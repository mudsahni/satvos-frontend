import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url: URL) => ({ type: "redirect", url })),
    rewrite: vi.fn((url: URL) => ({ type: "rewrite", url })),
  },
}));

function createRequest(
  pathname: string,
  options?: { authenticated?: boolean }
) {
  const url = new URL(pathname, "http://localhost:3000");
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

import { middleware } from "@/middleware";

describe("middleware — admin routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BACKEND_URL;
  });

  it("redirects unauthenticated users from /admin to /login with returnUrl=/admin", () => {
    const request = createRequest("/admin");
    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("returnUrl")).toBe("/admin");
  });

  it("redirects unauthenticated users from /admin/users to /login with returnUrl=/admin/users", () => {
    const request = createRequest("/admin/users");
    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("returnUrl")).toBe("/admin/users");
  });

  it("redirects unauthenticated users from /admin/settings to /login", () => {
    const request = createRequest("/admin/settings");
    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("returnUrl")).toBe("/admin/settings");
  });

  it("redirects unauthenticated users from /admin/service-accounts to /login", () => {
    const request = createRequest("/admin/service-accounts");
    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("redirects unauthenticated users from /admin/permissions to /login", () => {
    const request = createRequest("/admin/permissions");
    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("allows authenticated users to access /admin (NextResponse.next)", () => {
    const request = createRequest("/admin", { authenticated: true });
    middleware(request);

    expect(NextResponse.next).toHaveBeenCalledTimes(1);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(NextResponse.rewrite).not.toHaveBeenCalled();
  });

  it("allows authenticated users to access /admin/users (NextResponse.next)", () => {
    const request = createRequest("/admin/users", { authenticated: true });
    middleware(request);

    expect(NextResponse.next).toHaveBeenCalledTimes(1);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(NextResponse.rewrite).not.toHaveBeenCalled();
  });

  it("allows authenticated users to access /admin/service-accounts (NextResponse.next)", () => {
    const request = createRequest("/admin/service-accounts", {
      authenticated: true,
    });
    middleware(request);

    expect(NextResponse.next).toHaveBeenCalledTimes(1);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
