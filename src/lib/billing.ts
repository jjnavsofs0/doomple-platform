import { getAppSettingValue } from "@/lib/app-settings";

export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "AUD",
  "CAD",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type PaymentGatewayKey = "RAZORPAY" | "BANK_TRANSFER" | "MANUAL";

export type PaymentGatewaySettings = {
  gateways: Array<{
    key: PaymentGatewayKey;
    label: string;
    enabled: boolean;
    supportedCurrencies: string[];
  }>;
};

export const DEFAULT_PAYMENT_GATEWAY_SETTINGS: PaymentGatewaySettings = {
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
      supportedCurrencies: [...SUPPORTED_CURRENCIES],
    },
    {
      key: "MANUAL",
      label: "Manual Collection",
      enabled: true,
      supportedCurrencies: [...SUPPORTED_CURRENCIES],
    },
  ],
};

export function normalizeCurrency(currency?: string | null): string {
  const nextCurrency = String(currency || "INR").toUpperCase();
  return SUPPORTED_CURRENCIES.includes(nextCurrency as SupportedCurrency)
    ? nextCurrency
    : "INR";
}

export function getCurrencyOptions() {
  return SUPPORTED_CURRENCIES.map((currency) => ({
    value: currency,
    label: currency,
  }));
}

export async function getPaymentGatewaySettings(): Promise<PaymentGatewaySettings> {
  const settings = await getAppSettingValue<PaymentGatewaySettings>("payment_gateway_settings");
  return settings?.gateways?.length ? settings : DEFAULT_PAYMENT_GATEWAY_SETTINGS;
}

export async function getEnabledPaymentGatewaysForCurrency(currency?: string | null) {
  const normalizedCurrency = normalizeCurrency(currency);
  const settings = await getPaymentGatewaySettings();
  return settings.gateways.filter(
    (gateway) =>
      gateway.enabled &&
      gateway.supportedCurrencies.map((entry) => normalizeCurrency(entry)).includes(normalizedCurrency)
  );
}

export async function isGatewaySupportedForCurrency(
  gatewayKey: PaymentGatewayKey,
  currency?: string | null
) {
  const gateways = await getEnabledPaymentGatewaysForCurrency(currency);
  return gateways.some((gateway) => gateway.key === gatewayKey);
}
