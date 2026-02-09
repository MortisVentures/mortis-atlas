import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/forgot-password",
];

// API routes that don't require authentication
const publicApiRoutes = ["/api/auth", "/api/debug"];

// Auth-related paths that need rate limiting
const authRateLimitPaths = [
  "/api/auth/signin",
  "/api/auth/callback",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

// In-memory rate limiting for middleware (edge runtime compatible)
// Note: For production, use Redis-based rate limiting via API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitMap.get(key);

  // Clean up expired entries occasionally
  if (Math.random() < 0.01) {
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((v, k) => {
      if (v.resetAt < now) keysToDelete.push(k);
    });
    keysToDelete.forEach((k) => rateLimitMap.delete(k));
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return request.ip || "127.0.0.1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth endpoints (5 requests per minute per IP)
  if (authRateLimitPaths.some((path) => pathname.startsWith(path))) {
    const ip = getClientIp(request);
    const result = checkRateLimit(`auth:${ip}`, 5, 60 * 1000);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Too many authentication attempts. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Allow public routes
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user was deactivated (session marked inactive)
  if (token.isActive === false) {
    // Clear the session and redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "AccountDeactivated");
    const response = NextResponse.redirect(loginUrl);
    // Clear session cookie
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  // Rate limit API endpoints for authenticated users (100 requests per minute)
  if (pathname.startsWith("/api/") && token.id) {
    const result = checkRateLimit(`api:${token.id}`, 100, 60 * 1000);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "API rate limit exceeded. Please slow down.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Role-based route protection
  const roleRoutes: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/lp": ["LP", "ADMIN"],
  };

  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!token.role || !allowedRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Prevent LP users from accessing team-only routes
  const teamOnlyRoutes = [
    "/deals",
    "/companies",
    "/contacts",
    "/ic-memos",
    "/tasks",
    "/reports",
  ];

  if (token.role === "LP") {
    for (const route of teamOnlyRoutes) {
      if (pathname.startsWith(route)) {
        return NextResponse.redirect(new URL("/lp/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
