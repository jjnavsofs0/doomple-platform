import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/realtime";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; communicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entry = await prisma.clientCommunication.findFirst({
      where: {
        id: params.communicationId,
        clientId: params.id,
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Communication entry not found" },
        { status: 404 }
      );
    }

    await prisma.clientCommunication.delete({
      where: { id: entry.id },
    });

    await notifyAdmins({
      title: "Client communication deleted",
      message: `A communication log entry was removed from ${entry.client.companyName || "a client"}.`,
      link: `/admin/clients/${params.id}`,
      topics: ["clients", "notifications"],
      metadata: {
        clientId: params.id,
        communicationId: entry.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Communication log entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete client communication error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete communication log" },
      { status: 500 }
    );
  }
}
