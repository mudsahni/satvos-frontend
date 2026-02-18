import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/collections",
  "/documents",
  "/upload",
  "/users",
  "/settings",
  "/review-queue",
  "/exceptions",
  "/reports",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy /api/v1/* requests to the backend at runtime
  if (pathname.startsWith("/api/v1")) {
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:8080";
    const url = new URL(pathname + request.nextUrl.search, backendUrl);
    return NextResponse.rewrite(url);
  }

  // Check if the path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get auth state from cookie (we'll set this on login)
  const authCookie = request.cookies.get("satvos-auth-state");
  const isAuthenticated = authCookie?.value === "authenticated";

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from login/register to dashboard
  if (isPublicRoute && isAuthenticated && (pathname.startsWith("/login") || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
