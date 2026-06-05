import { NextResponse } from "next/server";

export function middleware(request) {

  const session = request.cookies.get("intelligrade_session");
  const { pathname } = request.nextUrl;

  // 1. If accessing login while logged in, redirect to correct layout
  if (pathname.startsWith("/login")) {
    if (session) {
      try {
        const { role } = JSON.parse(session.value);
        if (role === "STUDENT") {
          return NextResponse.redirect(new URL("/student", request.url));
        } else if (role === "LECTURER") {
          return NextResponse.redirect(new URL("/lecturer", request.url));
        }
      } catch (e) {}
    }
    return NextResponse.next();
  }

  // 2. Protect student routes
  if (pathname.startsWith("/student")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { role } = JSON.parse(session.value);
      if (role !== "STUDENT") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Protect lecturer routes
  if (pathname.startsWith("/lecturer")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { role } = JSON.parse(session.value);
      if (role !== "LECTURER") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/student/:path*", "/lecturer/:path*"],
};
