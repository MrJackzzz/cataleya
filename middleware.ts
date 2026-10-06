import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const CLIENT_ROLES = ["CLIENTE", "SOCIO", "FAMILIAR"];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user?.role ? String(request.auth.user.role) : null;

  const isAdminArea = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminArea && !isAdminLogin && role !== "ADMIN") {
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAdminLogin && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/mi-cuenta" && (!role || !CLIENT_ROLES.includes(role))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", "/mi-cuenta");
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && role && CLIENT_ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/mi-cuenta", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta", "/login"],
};
