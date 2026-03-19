import { getToken } from "next-auth/jwt";
import { AppErrorSeverity, AppErrorSource, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getErrorMessage, recordAppError } from "@/lib/app-error-log";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_ERROR_ROLES = ["SUPER_ADMIN", "ADMIN"];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(ADMIN_ERROR_ROLES);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const severity = url.searchParams.get("severity");
    const source = url.searchParams.get("source");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");
    const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 200);

    const where: Prisma.AppErrorLogWhereInput = {
      ...(severity && Object.values(AppErrorSeverity).includes(severity as AppErrorSeverity)
        ? { severity: severity as AppErrorSeverity }
        : {}),
      ...(source && Object.values(AppErrorSource).includes(source as AppErrorSource)
        ? { source: source as AppErrorSource }
        : {}),
      ...(status === "resolved"
        ? { isResolved: true }
        : status === "open"
          ? { isResolved: false }
          : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { message: { contains: q, mode: "insensitive" as const } },
              { route: { contains: q, mode: "insensitive" as const } },
              { area: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const logs: Prisma.AppErrorLogGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
        resolvedBy: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    }>[] = await prisma.appErrorLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ isResolved: "asc" }, { lastSeenAt: "desc" }],
      take: limit,
    });

    const totals = await prisma.appErrorLog.groupBy({
      by: ["severity"],
      _count: {
        _all: true,
      },
      where: {
        isResolved: false,
      },
    });

    const openCount = await prisma.appErrorLog.count({
      where: { isResolved: false },
    });

    return NextResponse.json({
      success: true,
      data: logs.map((log) => ({
        ...log,
        actorName: log.user?.name || log.user?.email || "Unknown user",
        resolvedByName: log.resolvedBy?.name || log.resolvedBy?.email || null,
      })),
      summary: {
        openCount,
        bySeverity: totals.reduce<Record<string, number>>((accumulator, item) => {
          accumulator[item.severity] = item._count._all;
          return accumulator;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Get app error logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch app error logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const body = await request.json();
    const title = String(body.title || "").trim() || "Application error";
    const message = getErrorMessage(body.message || body.title || "Unknown application error");
    const severity =
      body.severity === "INFO" ||
      body.severity === "WARNING" ||
      body.severity === "ERROR" ||
      body.severity === "CRITICAL"
        ? body.severity
        : "ERROR";
    const source =
      body.source === "CLIENT" || body.source === "SERVER" || body.source === "RENDER"
        ? body.source
        : "CLIENT";

    const log = await recordAppError({
      title,
      message,
      severity,
      source,
      route: body.route ? String(body.route) : null,
      area: body.area ? String(body.area) : null,
      method: body.method ? String(body.method) : null,
      statusCode: typeof body.statusCode === "number" ? body.statusCode : null,
      stack: body.stack ? String(body.stack) : null,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : null,
      userId: token?.id ? String(token.id) : null,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: log.id,
      },
    });
  } catch (error) {
    console.error("Record app error log error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record application error" },
      { status: 500 }
    );
  }
}
