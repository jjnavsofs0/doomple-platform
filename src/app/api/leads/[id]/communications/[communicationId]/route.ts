import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; communicationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, communicationId } = await params;

    const existing = await prisma.leadCommunication.findFirst({
      where: { id: communicationId, leadId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Communication not found" },
        { status: 404 }
      );
    }

    await prisma.leadCommunication.delete({ where: { id: communicationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead communication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete communication" },
      { status: 500 }
    );
  }
}
