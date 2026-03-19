"use client";

import * as React from "react";
import {
  Building2,
  CreditCard,
  Mail,
  RefreshCcw,
  Save,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { SUPPORTED_CURRENCIES } from "@/lib/billing";
import { cn } from "@/lib/utils";

type SettingsState = {
  company_profile: {
    companyName: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    gstNumber: string;
  };
  invoice_preferences: {
    dueDays: number;
    prefix: string;
    footerNote: string;
    paymentTerms: string;
  };
  notification_settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    invoiceEmailSubject: string;
  };
  payment_gateway_settings: {
    gateways: Array<{
      key: string;
      label: string;
      enabled: boolean;
      supportedCurrencies: string[];
    }>;
  };
};

type Integrations = {
  s3Configured: boolean;
  sesConfigured: boolean;
  awsRegion: string;
  s3PublicBucket: string;
  s3PrivateBucket: string;
  s3PublicBucketConfigured: boolean;
  s3PrivateBucketConfigured: boolean;
  sesRegion: string;
  sesFromEmail: string;
  sesReplyToEmail: string;
  realtimeConfigured?: boolean;
  realtimeCluster?: string;
  realtimeAppIdConfigured?: boolean;
  realtimeKeyConfigured?: boolean;
  realtimeSecretConfigured?: boolean;
  razorpayConfigured?: boolean;
  razorpayKeyIdSet?: boolean;
  razorpaySecretSet?: boolean;
  razorpayWebhookSet?: boolean;
};

const emptySettings: SettingsState = {
  company_profile: {
    companyName: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    gstNumber: "",
  },
  invoice_preferences: {
    dueDays: 14,
    prefix: "DINV",
    footerNote: "",
    paymentTerms: "",
  },
  notification_settings: {
    fromName: "",
    fromEmail: "",
    replyTo: "",
    invoiceEmailSubject: "",
  },
  payment_gateway_settings: {
    gateways: [],
  },
};

const textareaClassName =
  "min-h-[96px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-[#1ABFAD] focus:bg-white focus:ring-2 focus:ring-[#1ABFAD]/20";

function CurrencySelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (nextValue: string[]) => void;
}) {
  const toggleCurrency = (currency: string) => {
    const current = value.includes(currency);
    onChange(
      current ? value.filter((entry) => entry !== currency) : [...value, currency]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.length > 0 ? (
          value.map((currency) => (
            <Badge
              key={currency}
              variant="success"
              className="rounded-full px-3 py-1 text-xs font-medium"
            >
              {currency}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No currencies selected yet.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUPPORTED_CURRENCIES.map((currency) => {
          const selected = value.includes(currency);
          return (
            <button
              key={currency}
              type="button"
              onClick={() => toggleCurrency(currency)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-[#1ABFAD] bg-[#1ABFAD]/10 text-[#0F766E]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              {currency}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-600">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<SettingsState>(emptySettings);
  const [integrations, setIntegrations] = React.useState<Integrations | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch settings");

      const result = await response.json();
      const map = (result.data || []).reduce(
        (acc: Record<string, unknown>, item: { key: string; value: unknown }) => {
          acc[item.key] = item.value;
          return acc;
        },
        {}
      );

      setSettings({
        company_profile:
          (map.company_profile as SettingsState["company_profile"]) ||
          emptySettings.company_profile,
        invoice_preferences:
          (map.invoice_preferences as SettingsState["invoice_preferences"]) ||
          emptySettings.invoice_preferences,
        notification_settings:
          (map.notification_settings as SettingsState["notification_settings"]) ||
          emptySettings.notification_settings,
        payment_gateway_settings:
          (map.payment_gateway_settings as SettingsState["payment_gateway_settings"]) ||
          emptySettings.payment_gateway_settings,
      });
      setIntegrations(result.integrations || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateGroup = <T extends keyof SettingsState>(
    group: T,
    field: keyof SettingsState[T],
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: field === "dueDays" ? Number(value || 0) : value,
      },
    }));
  };

  const updateGateway = (
    index: number,
    patch: Partial<SettingsState["payment_gateway_settings"]["gateways"][number]>
  ) => {
    setSettings((current) => ({
      ...current,
      payment_gateway_settings: {
        gateways: current.payment_gateway_settings.gateways.map((gateway, gatewayIndex) =>
          gatewayIndex === index ? { ...gateway, ...patch } : gateway
        ),
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            { key: "company_profile", value: settings.company_profile },
            { key: "invoice_preferences", value: settings.invoice_preferences },
            { key: "notification_settings", value: settings.notification_settings },
            { key: "payment_gateway_settings", value: settings.payment_gateway_settings },
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      toast({
        type: "success",
        title: "Settings saved",
        description: "The platform settings were updated successfully.",
      });
      await fetchSettings();
    } catch (err) {
      toast({
        type: "error",
        title: "Could not save settings",
        description:
          err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-32 rounded-[28px]" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[420px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-slate-200 text-slate-600">
              Admin settings
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Company, billing, email, and gateway defaults.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Keep the operational settings clean and predictable, without burying the important infrastructure details under dashboard-style widgets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={fetchSettings}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      {success && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <SettingsCard
            title="Company Profile"
            description="Business identity shown across invoices, documents, and default communications."
            icon={Building2}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Company Name"
                value={settings.company_profile.companyName}
                onChange={(e) => updateGroup("company_profile", "companyName", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Legal Name"
                value={settings.company_profile.legalName}
                onChange={(e) => updateGroup("company_profile", "legalName", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Billing Email"
                value={settings.company_profile.email}
                onChange={(e) => updateGroup("company_profile", "email", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Phone"
                value={settings.company_profile.phone}
                onChange={(e) => updateGroup("company_profile", "phone", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Website"
                value={settings.company_profile.website}
                onChange={(e) => updateGroup("company_profile", "website", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="GST Number"
                value={settings.company_profile.gstNumber}
                onChange={(e) => updateGroup("company_profile", "gstNumber", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-900">Address</label>
                <textarea
                  value={settings.company_profile.address}
                  onChange={(e) => updateGroup("company_profile", "address", e.target.value)}
                  className={textareaClassName}
                />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Invoice Defaults"
            description="Commercial behavior applied when finance creates invoices and sends billing documents."
            icon={ShieldCheck}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Invoice Prefix"
                value={settings.invoice_preferences.prefix}
                onChange={(e) => updateGroup("invoice_preferences", "prefix", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Default Due Days"
                type="number"
                value={String(settings.invoice_preferences.dueDays)}
                onChange={(e) => updateGroup("invoice_preferences", "dueDays", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Payment Terms
                </label>
                <textarea
                  value={settings.invoice_preferences.paymentTerms}
                  onChange={(e) =>
                    updateGroup("invoice_preferences", "paymentTerms", e.target.value)
                  }
                  className={textareaClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Footer Note
                </label>
                <textarea
                  value={settings.invoice_preferences.footerNote}
                  onChange={(e) =>
                    updateGroup("invoice_preferences", "footerNote", e.target.value)
                  }
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-[#1ABFAD] focus:bg-white focus:ring-2 focus:ring-[#1ABFAD]/20"
                />
              </div>
            </div>
          </SettingsCard>
        </div>

        <div className="space-y-6">
          <SettingsCard
            title="Infrastructure Status"
            description="See what is wired for storage, email delivery, and AWS region alignment."
            icon={ServerCog}
          >
            <div className="space-y-3">
              {[
                {
                  label: "S3 Public Bucket",
                  configured: integrations?.s3PublicBucketConfigured,
                  primary: integrations?.s3PublicBucket || "Not set",
                  secondary: "Used for public-facing assets and open files",
                },
                {
                  label: "S3 Private Bucket",
                  configured: integrations?.s3PrivateBucketConfigured,
                  primary: integrations?.s3PrivateBucket || "Not set",
                  secondary: "Used for invoices, uploads, and restricted documents",
                },
                {
                  label: "AWS SES",
                  configured: integrations?.sesConfigured,
                  primary: integrations?.sesFromEmail || "No sender configured",
                  secondary: `Reply-To: ${integrations?.sesReplyToEmail || "Not set"}`,
                },
                {
                  label: "AWS Regions",
                  configured: Boolean(integrations?.awsRegion || integrations?.sesRegion),
                  primary: `S3: ${integrations?.awsRegion || "Not set"}`,
                  secondary: `SES: ${integrations?.sesRegion || integrations?.awsRegion || "Not set"}`,
                },
                {
                  label: "Realtime Notifications",
                  configured: integrations?.realtimeConfigured,
                  primary: integrations?.realtimeCluster
                    ? `Pusher cluster: ${integrations.realtimeCluster}`
                    : "Pusher is not fully configured yet",
                  secondary: `App ID: ${integrations?.realtimeAppIdConfigured ? "set" : "missing"} · Key: ${integrations?.realtimeKeyConfigured ? "set" : "missing"} · Secret: ${integrations?.realtimeSecretConfigured ? "set" : "missing"}`,
                },
                {
                  label: "Razorpay Payments",
                  configured: integrations?.razorpayConfigured,
                  primary: integrations?.razorpayConfigured
                    ? "Razorpay is active and ready to accept payments"
                    : "Razorpay credentials not configured",
                  secondary: `Key ID: ${integrations?.razorpayKeyIdSet ? "set" : "missing"} · Secret: ${integrations?.razorpaySecretSet ? "set" : "missing"} · Webhook: ${integrations?.razorpayWebhookSet ? "set" : "missing"}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600">{item.primary}</p>
                    <p className="text-xs text-muted-foreground">{item.secondary}</p>
                  </div>
                  <Badge variant={item.configured ? "success" : "outline"}>
                    {item.configured ? "Configured" : "Needs setup"}
                  </Badge>
                </div>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title="Email Defaults"
            description="Sender metadata and subject patterns used when the system sends invoice mail."
            icon={Mail}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="From Name"
                value={settings.notification_settings.fromName}
                onChange={(e) =>
                  updateGroup("notification_settings", "fromName", e.target.value)
                }
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="From Email"
                value={settings.notification_settings.fromEmail}
                onChange={(e) =>
                  updateGroup("notification_settings", "fromEmail", e.target.value)
                }
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Reply To"
                value={settings.notification_settings.replyTo}
                onChange={(e) =>
                  updateGroup("notification_settings", "replyTo", e.target.value)
                }
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
              <Input
                label="Invoice Subject Template"
                value={settings.notification_settings.invoiceEmailSubject}
                onChange={(e) =>
                  updateGroup(
                    "notification_settings",
                    "invoiceEmailSubject",
                    e.target.value
                  )
                }
                helperText="Use {{invoiceNumber}} to include the invoice number."
                className="h-11 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Payment Gateway Currency Mapping"
            description="Enable gateways and assign exactly which currencies each one can be used with."
            icon={CreditCard}
          >
            <div className="space-y-4">
              {settings.payment_gateway_settings.gateways.map((gateway, index) => (
                <div
                  key={gateway.key}
                  className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {gateway.key}
                        </p>
                        <Input
                          label="Gateway Label"
                          value={gateway.label}
                          onChange={(e) =>
                            updateGateway(index, { label: e.target.value })
                          }
                          className="h-11 min-w-[220px] rounded-2xl border-slate-200 bg-white"
                        />
                      </div>

                      <label className="flex h-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={gateway.enabled}
                          onChange={(e) =>
                            updateGateway(index, { enabled: e.target.checked })
                          }
                        />
                        Enabled
                      </label>
                    </div>

                    <CurrencySelector
                      value={gateway.supportedCurrencies}
                      onChange={(nextValue) =>
                        updateGateway(index, { supportedCurrencies: nextValue })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
