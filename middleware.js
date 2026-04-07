import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 🔓 Public routes (no auth needed)
  const publicRoutes = ["/login", "/register", "/"];

  // 🔐 Protected routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = publicRoutes.includes(pathname);

  // 🚫 No token → block protected routes
  if (!token && (isDashboardRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ If logged in → prevent going to login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔥 Decode token (no verify for speed)
  if (token) {
    try {
      const decoded = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      // 🚫 Not admin → block admin routes
      if (isAdminRoute && decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

    } catch (err) {
      // ❌ Invalid token → force logout
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};