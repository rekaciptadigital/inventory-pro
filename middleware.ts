import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/lib/config/constants";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has(STORAGE_KEYS.TOKENS);
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
