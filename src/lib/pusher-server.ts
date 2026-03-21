import Pusher from "pusher";
import { reportOperationalIssue } from "@/lib/operational-issues";

let pusherServer: Pusher | null | undefined;

export function getPusherServer() {
  if (pusherServer !== undefined) {
    return pusherServer;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    pusherServer = null;
    return pusherServer;
  }

  pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServer;
}

export function getPusherIntegrationStatus() {
  return {
    configured: Boolean(getPusherServer()),
    keyConfigured: Boolean(process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY),
    appIdConfigured: Boolean(process.env.PUSHER_APP_ID),
    secretConfigured: Boolean(process.env.PUSHER_SECRET),
    cluster: process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
  };
}

export async function triggerRealtimeEvent(
  channels: string | string[],
  eventName: string,
  payload: Record<string, unknown>
) {
  const pusher = getPusherServer();
  if (!pusher) {
    await reportOperationalIssue({
      title: "Realtime event could not be delivered",
      error: "Pusher is not configured",
      severity: "WARNING",
      area: "realtime.pusher.config",
      metadata: {
        channels,
        eventName,
      },
    });
    return false;
  }

  try {
    await pusher.trigger(channels, eventName, payload);
    return true;
  } catch (error) {
    await reportOperationalIssue({
      title: "Realtime event delivery failed",
      error,
      severity: "ERROR",
      area: "realtime.pusher.trigger",
      metadata: {
        channels,
        eventName,
      },
    });
    return false;
  }
}
