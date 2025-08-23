import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utilities/jwt";

export async function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // Check if user has a valid token
  const isAuthenticated = tokenCookie && await verifyToken(tokenCookie.value);

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is authenticated and visiting the root path, redirect to /home
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // User is authenticated or visiting public routes, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
