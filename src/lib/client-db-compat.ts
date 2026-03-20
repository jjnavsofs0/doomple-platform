import { prisma } from "@/lib/prisma";

const CLIENT_BANKING_COLUMNS = [
  "panNumber",
  "bankName",
  "bankAccountNumber",
  "ifscCode",
] as const;

const CACHE_TTL_MS = 5 * 60 * 1000;

const globalForClientCompat = globalThis as typeof globalThis & {
  __doompleClientBankingSupportCache?: {
    checkedAt: number;
    supported: boolean;
  };
};

export function getClientCoreSelect(includeBanking = false) {
  return {
    id: true,
    type: true,
    companyName: true,
    contactName: true,
    email: true,
    phone: true,
    billingAddress: true,
    city: true,
    state: true,
    postalCode: true,
    country: true,
    gstNumber: true,
    notes: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    ...(includeBanking
      ? {
          panNumber: true,
          bankName: true,
          bankAccountNumber: true,
          ifscCode: true,
        }
      : {}),
  } as const;
}

export async function supportsClientBankingFields() {
  const cached = globalForClientCompat.__doompleClientBankingSupportCache;
  const now = Date.now();

  if (cached && now - cached.checkedAt < CACHE_TTL_MS) {
    return cached.supported;
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Client'
        AND column_name IN ('panNumber', 'bankName', 'bankAccountNumber', 'ifscCode')
    `;

    const supported =
      CLIENT_BANKING_COLUMNS.every((column) =>
        rows.some((row) => row.column_name === column)
      );

    globalForClientCompat.__doompleClientBankingSupportCache = {
      checkedAt: now,
      supported,
    };

    return supported;
  } catch {
    globalForClientCompat.__doompleClientBankingSupportCache = {
      checkedAt: now,
      supported: false,
    };

    return false;
  }
}
