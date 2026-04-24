import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // 1. Protect Dashboard (Main Domain)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== "admin") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect User Profile

  // 3. Prevent Auth Pages when Logged In
  if (["/login", "/signup"].includes(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (token) {
      url.pathname = token.role === "admin" ? "/dashboard" : "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
