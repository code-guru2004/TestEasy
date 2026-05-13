import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 🔓 Public routes (no auth needed)
  const publicRoutes = ["/login", "/register", "/"];
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // 🔐 Protected routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  // If user is NOT authenticated
  if (!token) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }
    
    // Redirect protected routes to home page (or login)
    return NextResponse.redirect(new URL("/", request.url));
  }

  // User IS authenticated below this point
  
  // If authenticated user tries to access public routes, redirect to dashboard
  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔥 Decode token (no verify for speed)
  try {
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    // 🚫 Not admin → block admin routes
    if (isAdminRoute && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow access to protected routes
    return NextResponse.next();

  } catch (err) {
    // ❌ Invalid token → force logout and redirect to home
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    return response;
  }
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