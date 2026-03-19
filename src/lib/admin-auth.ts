import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "PROJECT_MANAGER",
  "FINANCE",
]);

export async function requireAdminSession(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const roleSet = allowedRoles ? new Set(allowedRoles) : ADMIN_ROLES;

  if (!roleSet.has(session.user.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { session };
}
