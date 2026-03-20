import { prisma } from "@/lib/prisma";

const CACHE_TTL_MS = 5 * 60 * 1000;

const globalForProjectCompat = globalThis as typeof globalThis & {
  __doompleProjectCurrencySupportCache?: {
    checkedAt: number;
    supported: boolean;
  };
};

export function getProjectCoreSelect(includeCurrency = false) {
  return {
    id: true,
    name: true,
    category: true,
    description: true,
    scope: true,
    startDate: true,
    estimatedEndDate: true,
    priority: true,
    status: true,
    budget: true,
    billingModel: true,
    progressPercent: true,
    createdAt: true,
    updatedAt: true,
    clientId: true,
    leadId: true,
    managerId: true,
    ...(includeCurrency ? { currency: true } : {}),
  } as const;
}

export async function supportsProjectCurrencyField() {
  const cached = globalForProjectCompat.__doompleProjectCurrencySupportCache;
  const now = Date.now();

  if (cached && now - cached.checkedAt < CACHE_TTL_MS) {
    return cached.supported;
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Project'
        AND column_name = 'currency'
    `;

    const supported = rows.some((row) => row.column_name === "currency");
    globalForProjectCompat.__doompleProjectCurrencySupportCache = {
      checkedAt: now,
      supported,
    };
    return supported;
  } catch {
    globalForProjectCompat.__doompleProjectCurrencySupportCache = {
      checkedAt: now,
      supported: false,
    };
    return false;
  }
}
