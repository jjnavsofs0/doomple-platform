import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createErasureRequest, getErasureBlockersForUser } from "@/lib/account-erasure";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [latestRequest, impact] = await Promise.all([
      prisma.accountErasureRequest.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      getErasureBlockersForUser(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        latestRequest,
        impact,
      },
    });
  } catch (error) {
    console.error("Get self erasure request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch account closure request" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const requestedReason = String(body.requestedReason || "").trim();

    if (!requestedReason) {
      return NextResponse.json(
        { success: false, error: "Request reason is required" },
        { status: 400 }
      );
    }

    const erasureRequest = await createErasureRequest({
      userId: session.user.id,
      requestedById: session.user.id,
      requestedReason,
    });

    return NextResponse.json({
      success: true,
      message: "Account closure request submitted successfully",
      data: erasureRequest,
    });
  } catch (error) {
    console.error("Create self erasure request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create account closure request",
      },
      { status: 500 }
    );
  }
}
