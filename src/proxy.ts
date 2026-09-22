import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DashboardSessionService } from "@/infrastructure/auth/DashboardSessionService";

const sessionService = new DashboardSessionService();

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(DashboardSessionService.cookieName)?.value;
  if (!sessionService.verify(token)) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
