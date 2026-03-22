import { createHash, createHmac } from "crypto";
import { reportOperationalIssue } from "@/lib/operational-issues";

type PusherServerConfig = {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
  host: string;
  scheme: "https" | "http";
};

let pusherConfig: PusherServerConfig | null | undefined;

function readEnvValue(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function validateChannelName(channelName: string) {
  if (!channelName || /[^A-Za-z0-9_\-=@,.;]/.test(channelName)) {
    throw new Error(`Invalid channel name: "${channelName}"`);
  }

  if (channelName.length > 200) {
    throw new Error(`Channel name too long: "${channelName}"`);
  }
}

function validateSocketId(socketId: string) {
  if (!/^\d+\.\d+$/.test(socketId)) {
    throw new Error(`Invalid socket id: "${socketId}"`);
  }
}

function signPusherString(secret: string, value: string) {
  return createHmac("sha256", secret).update(Buffer.from(value)).digest("hex");
}

function buildOrderedQuery(params: Record<string, string | number>) {
  return Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function createBodyMd5(body: string) {
  return createHash("md5").update(body, "utf8").digest("hex");
}

function getPusherConfig() {
  if (pusherConfig !== undefined) {
    return pusherConfig;
  }

  const appId = readEnvValue("PUSHER_APP_ID");
  const key = readEnvValue("PUSHER_KEY") || readEnvValue("NEXT_PUBLIC_PUSHER_KEY");
  const secret = readEnvValue("PUSHER_SECRET");
  const cluster = readEnvValue("PUSHER_CLUSTER") || readEnvValue("NEXT_PUBLIC_PUSHER_CLUSTER");

  if (!appId || !key || !secret || !cluster) {
    pusherConfig = null;
    return pusherConfig;
  }

  pusherConfig = {
    appId,
    key,
    secret,
    cluster,
    host: `api-${cluster}.pusher.com`,
    scheme: "https",
  };

  return pusherConfig;
}

export function isPusherConfigured() {
  return Boolean(getPusherConfig());
}

export function authorizePusherChannel(
  socketId: string,
  channelName: string,
  channelData?: Record<string, unknown>
) {
  const config = getPusherConfig();
  if (!config) {
    return null;
  }

  validateSocketId(socketId);
  validateChannelName(channelName);

  const signatureParts = [socketId, channelName];
  const authResponse: { auth: string; channel_data?: string } = {
    auth: "",
  };

  if (channelData) {
    const serializedChannelData = JSON.stringify(channelData);
    signatureParts.push(serializedChannelData);
    authResponse.channel_data = serializedChannelData;
  }

  authResponse.auth = `${config.key}:${signPusherString(config.secret, signatureParts.join(":"))}`;
  return authResponse;
}

export function getPusherIntegrationStatus() {
  return {
    configured: isPusherConfigured(),
    keyConfigured: Boolean(readEnvValue("PUSHER_KEY") || readEnvValue("NEXT_PUBLIC_PUSHER_KEY")),
    appIdConfigured: Boolean(readEnvValue("PUSHER_APP_ID")),
    secretConfigured: Boolean(readEnvValue("PUSHER_SECRET")),
    cluster: readEnvValue("PUSHER_CLUSTER") || readEnvValue("NEXT_PUBLIC_PUSHER_CLUSTER"),
  };
}

export async function triggerRealtimeEvent(
  channels: string | string[],
  eventName: string,
  payload: Record<string, unknown>
) {
  const config = getPusherConfig();
  if (!config) {
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

  const channelList = Array.isArray(channels) ? channels : [channels];
  if (channelList.length === 0 || channelList.length > 100) {
    throw new Error("Realtime events must target between 1 and 100 channels");
  }

  if (eventName.length === 0 || eventName.length > 200) {
    throw new Error(`Invalid realtime event name: "${eventName}"`);
  }

  channelList.forEach(validateChannelName);

  const body = JSON.stringify({
    name: eventName,
    data: typeof payload === "string" ? payload : JSON.stringify(payload),
    channels: channelList,
  });

  const path = `/apps/${config.appId}/events`;
  const unsignedQuery = buildOrderedQuery({
    auth_key: config.key,
    auth_timestamp: Math.floor(Date.now() / 1000),
    auth_version: "1.0",
    body_md5: createBodyMd5(body),
  });
  const signature = signPusherString(config.secret, ["POST", path, unsignedQuery].join("\n"));
  const url = `${config.scheme}://${config.host}${path}?${unsignedQuery}&auth_signature=${signature}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-pusher-library": "doomple-native-fetch",
      },
      body,
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        responseBody
          ? `Pusher responded with ${response.status}: ${responseBody}`
          : `Pusher responded with ${response.status}: ${response.statusText}`
      );
    }

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
