import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/activate", "/recover"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    publicRoutes.some((r) => pathname === r) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads");

  const session = await getSessionFromRequest(request);

  if (!isPublic && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Force password change: block all protected routes until password is changed
  if (
    session?.mustChangePassword &&
    !pathname.startsWith("/change-password") &&
    !pathname.startsWith("/api/auth/change-password") &&
    !pathname.startsWith("/api/auth/logout") &&
    !isPublic
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "পাসওয়ার্ড পরিবর্তন আবশ্যক।" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // Admin routes — allow ADMIN or SUPER_ADMIN
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Super-admin-only routes
    if (pathname.startsWith("/admin/admins") || pathname.startsWith("/api/admin/admins")) {
      if (session.role !== "SUPER_ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  // Redirect already-logged-in users away from auth pages
  if (session && (pathname === "/login" || pathname === "/activate" || pathname === "/recover")) {
    if (session.mustChangePassword) {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }
    if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|uploads|fonts).*)",
  ],
};
