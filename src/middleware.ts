import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"];
const CLIENT_ROLES = ["CLIENT"];

// ─── RBAC: which roles can access which admin route prefixes ─────────────────
// If a path is NOT listed here, ALL admin roles can access it.
const ROLE_RESTRICTED_ROUTES: { prefix: string; allowedRoles: string[] }[] = [
  // Users management — Super Admin only
  { prefix: "/admin/users",    allowedRoles: ["SUPER_ADMIN"] },
  { prefix: "/admin/errors", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  // Settings — Super Admin + Admin
  { prefix: "/admin/settings", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  // Payments — Super Admin, Admin, Finance
  { prefix: "/admin/payments", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  // Invoices — Super Admin, Admin, Finance, Project Manager
  { prefix: "/admin/invoices", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE", "PROJECT_MANAGER"] },
  // Quotations — Super Admin, Admin, Sales, Finance
  { prefix: "/admin/quotations", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES", "FINANCE"] },
  // Projects — Super Admin, Admin, Project Manager, Sales
  { prefix: "/admin/projects", allowedRoles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES"] },
  // Clients — Super Admin, Admin, Sales, Project Manager, Finance
  { prefix: "/admin/clients",  allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"] },
  // Leads (CRM) — Super Admin, Admin, Sales
  { prefix: "/admin/leads",    allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES"] },
  // Dashboard sub-sections
  { prefix: "/admin/dashboard/billing",  allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  { prefix: "/admin/dashboard/sales",    allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES"] },
  { prefix: "/admin/dashboard/projects", allowedRoles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"] },
];
// ─────────────────────────────────────────────────────────────────────────────

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/solutions",
  "/contact",
  "/pricing",
  "/blog",
  "/careers",
];

// API routes that are publicly accessible
const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/cookie-consent",
  "/api/error-logs",
  "/api/contact",
  "/api/razorpay/webhook",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Check if API route is publicly accessible
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (token.role as string) || "";
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Granular RBAC: check if this specific route has restrictions
    const restriction = ROLE_RESTRICTED_ROUTES.find((r) =>
      pathname.startsWith(r.prefix)
    );
    if (restriction && !restriction.allowedRoles.includes(userRole)) {
      // Redirect to admin dashboard with a 403-like experience
      return NextResponse.redirect(new URL("/admin/dashboard?error=forbidden", request.url));
    }

    return NextResponse.next();
  }

  // Protect portal routes
  if (pathname.startsWith("/portal")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (token.role as string) || "";
    if (!CLIENT_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Protect other API routes (except public ones handled above)
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
