import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/activate"];
const userRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(
    (r) => pathname === r || pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.startsWith("/uploads")
  );

  const session = await getSessionFromRequest(request);

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!session || session.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (session && (pathname === "/login" || pathname === "/activate")) {
    if (session.role === "ADMIN") {
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
