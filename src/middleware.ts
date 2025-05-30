import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const notFoundPageUrl = "/notfound";
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  

  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== "admin") {
      url.pathname = notFoundPageUrl;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
