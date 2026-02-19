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

  it.each([
    "/admin",
    "/admin/users",
    "/admin/settings",
    "/admin/service-accounts",
    "/admin/permissions",
  ])("redirects unauthenticated users from %s to /login with returnUrl", (route) => {
    middleware(createRequest(route));

    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    const redirectUrl = (NextResponse.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("returnUrl")).toBe(route);
  });

  it.each([
    "/admin",
    "/admin/users",
    "/admin/service-accounts",
  ])("allows authenticated users to access %s", (route) => {
    middleware(createRequest(route, { authenticated: true }));

    expect(NextResponse.next).toHaveBeenCalledTimes(1);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
