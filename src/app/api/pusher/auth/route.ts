import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_GLOBAL_CHANNEL, getUserPrivateChannel } from "@/lib/realtime";
import { getPusherServer } from "@/lib/pusher-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = String(formData.get("socket_id") || "");
    const channelName = String(formData.get("channel_name") || "");

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Missing channel auth payload" }, { status: 400 });
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ error: "Pusher is not configured" }, { status: 503 });
    }

    const isAdmin = ["SUPER_ADMIN", "ADMIN", "SALES", "PROJECT_MANAGER", "FINANCE"].includes(
      session.user.role
    );

    const allowed =
      channelName === getUserPrivateChannel(session.user.id) ||
      (isAdmin && channelName === ADMIN_GLOBAL_CHANNEL);

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json(
      { error: "Failed to authorize realtime channel" },
      { status: 500 }
    );
  }
}
