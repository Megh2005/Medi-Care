import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
  });

  const currentUrl = req.nextUrl;

  if (
    !token &&
    (currentUrl.pathname.startsWith("/prescription") ||
      currentUrl.pathname.startsWith("/profile") ||
      currentUrl.pathname.startsWith("/diet-coach") ||
      currentUrl.pathname.startsWith("/doctor-search") ||
      currentUrl.pathname.startsWith("/doctors"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/prescription/:path*",
    "/profile/:path*",
    "/diet-coach/:path*",
    "/doctor-search/:path*",
    "/doctors/:path*",
  ],
};
