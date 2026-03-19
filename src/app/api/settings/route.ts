import { NextResponse } from "next/server";
import { getAppSettings, updateAppSettings } from "@/lib/app-settings";
import { requireAdminSession } from "@/lib/admin-auth";
import { getStorageIntegrationStatus, isS3Configured } from "@/lib/storage";
import { getSesIntegrationStatus, isSesConfigured } from "@/lib/email";
import { SUPPORTED_CURRENCIES, normalizeCurrency } from "@/lib/billing";
import { getPusherIntegrationStatus } from "@/lib/pusher-server";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

function sanitizeSettingUpdate(key: string, value: unknown) {
  if (key !== "payment_gateway_settings" || !value || typeof value !== "object") {
    return value;
  }

  const settings = value as {
    gateways?: Array<{
      key?: string;
      label?: string;
      enabled?: boolean;
      supportedCurrencies?: string[];
    }>;
  };

  return {
    gateways: Array.isArray(settings.gateways)
      ? settings.gateways.map((gateway) => ({
          key: String(gateway.key || ""),
          label: String(gateway.label || gateway.key || ""),
          enabled: Boolean(gateway.enabled),
          supportedCurrencies: Array.from(
            new Set(
              (Array.isArray(gateway.supportedCurrencies) ? gateway.supportedCurrencies : [])
                .map((currency) => normalizeCurrency(currency))
                .filter((currency) => SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number]))
            )
          ),
        }))
      : [],
  };
}

export async function GET() {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await getAppSettings();
    const storage = getStorageIntegrationStatus();
    const ses = getSesIntegrationStatus();
    const pusher = getPusherIntegrationStatus();

    return NextResponse.json({
      success: true,
      data: settings,
      integrations: {
        s3Configured: isS3Configured(),
        sesConfigured: isSesConfigured(),
        awsRegion: storage.region,
        s3PublicBucket: storage.publicBucket,
        s3PrivateBucket: storage.privateBucket,
        s3PublicBucketConfigured: storage.publicBucketConfigured,
        s3PrivateBucketConfigured: storage.privateBucketConfigured,
        sesRegion: ses.region,
        sesFromEmail: ses.fromEmail,
        sesReplyToEmail: ses.replyToEmail,
        realtimeConfigured: pusher.configured,
        realtimeCluster: pusher.cluster,
        realtimeAppIdConfigured: pusher.appIdConfigured,
        realtimeKeyConfigured: pusher.keyConfigured,
        realtimeSecretConfigured: pusher.secretConfigured,
        razorpayConfigured: isRazorpayConfigured(),
        razorpayKeyIdSet: Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("REPLACE_ME")),
        razorpaySecretSet: Boolean(process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes("REPLACE_ME")),
        razorpayWebhookSet: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET.length > 0),
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const updates = Array.isArray(body.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No settings updates provided" },
        { status: 400 }
      );
    }

    await updateAppSettings(
      updates.map((update: { key: string; value: unknown }) => ({
        key: update.key,
        value: sanitizeSettingUpdate(update.key, update.value),
      })),
      auth.session.user.id
    );
    const settings = await getAppSettings();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
