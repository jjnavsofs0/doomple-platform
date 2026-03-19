import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPANY_INFO } from "@/lib/constants";

export const DEFAULT_APP_SETTINGS = {
  company_profile: {
    group: "company",
    label: "Company Profile",
    description: "Business identity shown on invoices and outgoing mail.",
    value: {
      companyName: "Doomple Technologies",
      legalName: "Doomple Technologies",
      email: COMPANY_INFO.email,
      phone: COMPANY_INFO.phone,
      website: COMPANY_INFO.website,
      address: "",
      gstNumber: "",
    },
  },
  invoice_preferences: {
    group: "billing",
    label: "Invoice Preferences",
    description: "Defaults applied when creating and sending invoices.",
    value: {
      dueDays: 14,
      prefix: "DINV",
      footerNote: "Thank you for your business.",
      paymentTerms:
        "Payment is due within the agreed period. Please mention the invoice number in your payment reference.",
    },
  },
  notification_settings: {
    group: "communications",
    label: "Notifications",
    description: "Sender metadata used for invoice and client emails.",
    value: {
      fromName: "Doomple Billing",
      fromEmail: process.env.AWS_SES_FROM_EMAIL || COMPANY_INFO.email,
      replyTo: process.env.AWS_SES_REPLY_TO || COMPANY_INFO.email,
      invoiceEmailSubject: "Invoice {{invoiceNumber}} from Doomple",
    },
  },
  payment_gateway_settings: {
    group: "billing",
    label: "Payment Gateways",
    description: "Map enabled gateways to the currencies they can process.",
    value: {
      gateways: [
        {
          key: "RAZORPAY",
          label: "Razorpay",
          enabled: true,
          supportedCurrencies: ["INR"],
        },
        {
          key: "BANK_TRANSFER",
          label: "Bank Transfer",
          enabled: true,
          supportedCurrencies: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"],
        },
        {
          key: "MANUAL",
          label: "Manual Collection",
          enabled: true,
          supportedCurrencies: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"],
        },
      ],
    },
  },
} as const;

type AppSettingKey = keyof typeof DEFAULT_APP_SETTINGS;

export async function ensureDefaultAppSettings(userId?: string) {
  for (const [key, config] of Object.entries(DEFAULT_APP_SETTINGS)) {
    await prisma.appSetting.upsert({
      where: { key },
      update: {},
      create: {
        key,
        group: config.group,
        label: config.label,
        description: config.description,
        value: config.value,
        updatedById: userId,
      },
    });
  }
}

export async function getAppSettings() {
  await ensureDefaultAppSettings();

  const rows = await prisma.appSetting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });

  return rows.map((row) => ({
    key: row.key,
    group: row.group,
    label: row.label,
    description: row.description,
    value: row.value,
  }));
}

export async function getAppSettingValue<T>(key: AppSettingKey): Promise<T> {
  await ensureDefaultAppSettings();

  const row = await prisma.appSetting.findUnique({
    where: { key },
  });

  return (row?.value as T) ?? (DEFAULT_APP_SETTINGS[key].value as T);
}

export async function updateAppSettings(
  updates: Array<{ key: AppSettingKey; value: unknown }>,
  userId: string
) {
  await ensureDefaultAppSettings(userId);

  return Promise.all(
    updates.map(({ key, value }) =>
      prisma.appSetting.upsert({
        where: { key },
        update: {
          value: value as Prisma.InputJsonValue,
          updatedById: userId,
        },
        create: {
          key,
          group: DEFAULT_APP_SETTINGS[key].group,
          label: DEFAULT_APP_SETTINGS[key].label,
          description: DEFAULT_APP_SETTINGS[key].description,
          value: value as Prisma.InputJsonValue,
          updatedById: userId,
        },
      })
    )
  );
}
