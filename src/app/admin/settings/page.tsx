"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(emptySettings);
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
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
          company_profile: map.company_profile as SettingsState["company_profile"],
          invoice_preferences:
            map.invoice_preferences as SettingsState["invoice_preferences"],
          notification_settings:
            map.notification_settings as SettingsState["notification_settings"],
        });
        setIntegrations(result.integrations || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateGroup = <T extends keyof SettingsState>(
    group: T,
    field: keyof SettingsState[T],
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]:
          field === "dueDays"
            ? Number(value || 0)
            : value,
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
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      setSuccess("Settings saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <PageHeader title="Settings" description="Operational configuration" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        title="Settings"
        description="Manage company, invoice, and email defaults for the admin workspace"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">S3 Public Bucket</p>
            <Badge
              variant={integrations?.s3PublicBucketConfigured ? "success" : "outline"}
              className="mt-2"
            >
              {integrations?.s3PublicBucketConfigured ? "Configured" : "Not Configured"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Bucket: {integrations?.s3PublicBucket || "N/A"}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">S3 Private Bucket</p>
            <Badge
              variant={integrations?.s3PrivateBucketConfigured ? "success" : "outline"}
              className="mt-2"
            >
              {integrations?.s3PrivateBucketConfigured ? "Configured" : "Not Configured"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Bucket: {integrations?.s3PrivateBucket || "N/A"}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">AWS SES</p>
            <Badge variant={integrations?.sesConfigured ? "success" : "outline"} className="mt-2">
              {integrations?.sesConfigured ? "Configured" : "Not Configured"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              From: {integrations?.sesFromEmail || "N/A"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reply-To: {integrations?.sesReplyToEmail || "N/A"}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">AWS Regions</p>
            <p className="mt-2 text-sm font-medium">
              S3: {integrations?.awsRegion || "Not set"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              SES: {integrations?.sesRegion || integrations?.awsRegion || "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Company Name"
            value={settings.company_profile.companyName}
            onChange={(e) => updateGroup("company_profile", "companyName", e.target.value)}
          />
          <Input
            label="Legal Name"
            value={settings.company_profile.legalName}
            onChange={(e) => updateGroup("company_profile", "legalName", e.target.value)}
          />
          <Input
            label="Billing Email"
            value={settings.company_profile.email}
            onChange={(e) => updateGroup("company_profile", "email", e.target.value)}
          />
          <Input
            label="Phone"
            value={settings.company_profile.phone}
            onChange={(e) => updateGroup("company_profile", "phone", e.target.value)}
          />
          <Input
            label="Website"
            value={settings.company_profile.website}
            onChange={(e) => updateGroup("company_profile", "website", e.target.value)}
          />
          <Input
            label="GST Number"
            value={settings.company_profile.gstNumber}
            onChange={(e) => updateGroup("company_profile", "gstNumber", e.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Address</label>
            <textarea
              value={settings.company_profile.address}
              onChange={(e) => updateGroup("company_profile", "address", e.target.value)}
              className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Invoice Prefix"
            value={settings.invoice_preferences.prefix}
            onChange={(e) => updateGroup("invoice_preferences", "prefix", e.target.value)}
          />
          <Input
            label="Default Due Days"
            type="number"
            value={String(settings.invoice_preferences.dueDays)}
            onChange={(e) => updateGroup("invoice_preferences", "dueDays", e.target.value)}
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Payment Terms</label>
            <textarea
              value={settings.invoice_preferences.paymentTerms}
              onChange={(e) =>
                updateGroup("invoice_preferences", "paymentTerms", e.target.value)
              }
              className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Footer Note</label>
            <textarea
              value={settings.invoice_preferences.footerNote}
              onChange={(e) =>
                updateGroup("invoice_preferences", "footerNote", e.target.value)
              }
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="From Name"
            value={settings.notification_settings.fromName}
            onChange={(e) =>
              updateGroup("notification_settings", "fromName", e.target.value)
            }
          />
          <Input
            label="From Email"
            value={settings.notification_settings.fromEmail}
            onChange={(e) =>
              updateGroup("notification_settings", "fromEmail", e.target.value)
            }
          />
          <Input
            label="Reply To"
            value={settings.notification_settings.replyTo}
            onChange={(e) =>
              updateGroup("notification_settings", "replyTo", e.target.value)
            }
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
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
