import { NextResponse } from "next/server";
import { getAppSettings, updateAppSettings } from "@/lib/app-settings";
import { requireAdminSession } from "@/lib/admin-auth";
import { getStorageIntegrationStatus, isS3Configured } from "@/lib/storage";
import { getSesIntegrationStatus, isSesConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await getAppSettings();
    const storage = getStorageIntegrationStatus();
    const ses = getSesIntegrationStatus();

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

    await updateAppSettings(updates, auth.session.user.id);
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
