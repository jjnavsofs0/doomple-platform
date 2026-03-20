import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { setAppErrorResolution } from "@/lib/app-error-log";

const ADMIN_ERROR_ROLES = ["SUPER_ADMIN", "ADMIN"];

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession(ADMIN_ERROR_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id } = await params;

    if (typeof body.isResolved !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isResolved boolean is required" },
        { status: 400 }
      );
    }

    const updated = await setAppErrorResolution({
      id,
      isResolved: body.isResolved,
      resolvedById: auth.session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update app error log resolution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update error resolution" },
      { status: 500 }
    );
  }
}
