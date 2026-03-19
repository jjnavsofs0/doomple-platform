import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const origin = url.origin;

    if (!token) {
      return NextResponse.redirect(`${origin}/login?emailChange=invalid`);
    }

    const changeRequest = await prisma.emailChangeRequest.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (
      !changeRequest ||
      changeRequest.verifiedAt ||
      changeRequest.expiresAt.getTime() < Date.now()
    ) {
      return NextResponse.redirect(`${origin}/login?emailChange=expired`);
    }

    const duplicate = await prisma.user.findUnique({
      where: { email: changeRequest.newEmail },
      select: { id: true },
    });

    if (duplicate && duplicate.id !== changeRequest.userId) {
      return NextResponse.redirect(`${origin}/login?emailChange=duplicate`);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: changeRequest.userId },
        data: {
          email: changeRequest.newEmail,
          emailVerificationStatus: "VERIFIED",
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.emailChangeRequest.update({
        where: { id: changeRequest.id },
        data: {
          verifiedAt: new Date(),
        },
      }),
      prisma.emailChangeRequest.deleteMany({
        where: {
          userId: changeRequest.userId,
          id: { not: changeRequest.id },
        },
      }),
    ]);

    return NextResponse.redirect(`${origin}/login?emailChange=verified`);
  } catch (error) {
    console.error("Verify email change error:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/login?emailChange=error`);
  }
}
