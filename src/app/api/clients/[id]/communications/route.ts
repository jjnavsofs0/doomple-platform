import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const communications = await prisma.clientCommunication.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: communications.map((entry) => ({
        ...entry,
        date: entry.createdAt.toISOString(),
        notes: entry.content,
      })),
    });
  } catch (error) {
    console.error("Get client communications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client communications" },
      { status: 500 }
    );
  }
}
