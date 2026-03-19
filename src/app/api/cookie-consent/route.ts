import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_POLICY_VERSION,
  COOKIE_VISITOR_ID_COOKIE,
  serializeConsentValue,
} from "@/lib/privacy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const decision =
      body.decision === "ESSENTIAL_ONLY" ? "ESSENTIAL_ONLY" : "ACCEPT_ALL";

    const cookieStore = cookies();
    const visitorId = cookieStore.get(COOKIE_VISITOR_ID_COOKIE)?.value || randomUUID();
    const headerStore = headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
    const userAgent = headerStore.get("user-agent");

    // Try to persist consent to DB, but don't fail if table doesn't exist yet
    try {
      await prisma.cookieConsentRecord.create({
        data: {
          visitorId,
          userId: session?.user?.id || null,
          policyVersion: COOKIE_POLICY_VERSION,
          decision,
          source: String(body.source || "banner"),
          preferences: {
            essential: true,
            analytics: decision === "ACCEPT_ALL",
            marketing: decision === "ACCEPT_ALL",
          },
          ipAddress,
          userAgent,
        },
      });
    } catch (dbErr) {
      // Non-fatal: cookies will still be set even if DB write fails
      console.warn("Cookie consent DB write skipped (migration pending?):", (dbErr as Error).message);
    }

    const response = NextResponse.json({
      success: true,
      data: {
        policyVersion: COOKIE_POLICY_VERSION,
        decision,
      },
    });

    response.cookies.set(COOKIE_VISITOR_ID_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    response.cookies.set(COOKIE_CONSENT_COOKIE, serializeConsentValue(decision), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Cookie consent error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save cookie consent" },
      { status: 500 }
    );
  }
}
