const ADMIN_INVOICE_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "PROJECT_MANAGER",
  "FINANCE",
]);

export function canAccessInvoiceForPayment(
  sessionUser: { role?: string | null; email?: string | null },
  clientEmail: string
) {
  if (ADMIN_INVOICE_ROLES.has(sessionUser.role || "")) {
    return true;
  }

  if (sessionUser.role === "CLIENT" && sessionUser.email === clientEmail) {
    return true;
  }

  return false;
}
