import { NextResponse } from "next/server";
import { AccountErasureRequestStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  applyErasureRequestStatus,
  createErasureRequest,
  getErasureBlockersForUser,
} from "@/lib/account-erasure";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [latestRequest, impact] = await Promise.all([
      prisma.accountErasureRequest.findFirst({
        where: { userId: params.id },
        orderBy: { createdAt: "desc" },
      }),
      getErasureBlockersForUser(params.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        latestRequest,
        impact,
      },
    });
  } catch (error) {
    console.error("Get erasure request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch erasure workflow" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const requestedReason = String(body.requestedReason || "").trim();

    const latestRequest = await prisma.accountErasureRequest.findFirst({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestRequest?.status === AccountErasureRequestStatus.ANONYMIZED) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account has already been anonymized and is now read-only.",
        },
        { status: 400 }
      );
    }

    if (!requestedReason) {
      return NextResponse.json(
        { success: false, error: "Request reason is required" },
        { status: 400 }
      );
    }

    const erasureRequest = await createErasureRequest({
      userId: params.id,
      requestedById: auth.session.user.id,
      requestedReason,
    });

    return NextResponse.json({
      success: true,
      message: "Close account request logged successfully",
      data: erasureRequest,
    });
  } catch (error) {
    console.error("Create erasure request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create erasure request",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const rawStatus = String(body.status || "").trim().toUpperCase();
    const allowedStatuses = new Set(Object.values(AccountErasureRequestStatus));

    const latestRequest = await prisma.accountErasureRequest.findFirst({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestRequest?.status === AccountErasureRequestStatus.ANONYMIZED) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account has already been anonymized and its erasure workflow is locked.",
        },
        { status: 400 }
      );
    }

    if (!allowedStatuses.has(rawStatus as AccountErasureRequestStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid erasure workflow status" },
        { status: 400 }
      );
    }

    const updated = await applyErasureRequestStatus({
      userId: params.id,
      requestId: body.requestId ? String(body.requestId) : undefined,
      actorUserId: auth.session.user.id,
      status: rawStatus as AccountErasureRequestStatus,
      retentionReason: body.retentionReason ? String(body.retentionReason) : undefined,
      internalNotes: body.internalNotes ? String(body.internalNotes) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Erasure workflow updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update erasure request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update erasure workflow",
      },
      { status: 500 }
    );
  }
}
