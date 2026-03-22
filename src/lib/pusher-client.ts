"use client";

import Pusher from "pusher-js";
import {
  getClientErrorMessage,
  reportClientError,
  serializeClientErrorReason,
} from "@/lib/client-error-reporting";

let client: Pusher | null = null;
let connectionMonitoringInitialized = false;
let unavailableTimer: number | null = null;
let unavailableReported = false;

const UNAVAILABLE_WARNING_DELAY_MS = 15000;
const TRANSIENT_PUSHER_ERROR_CODES = new Set([1006, 4201]);

type SerializableRecord = Record<string, unknown>;

function asRecord(value: unknown): SerializableRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as SerializableRecord;
}

function getNestedErrorCandidate(error: unknown) {
  const record = asRecord(error);
  if (!record) {
    return null;
  }

  return record.error ?? record.data ?? null;
}

function extractPusherErrorCode(error: unknown): number | null {
  const record = asRecord(error);
  if (!record) {
    return null;
  }

  const data = asRecord(record.data);
  if (typeof data?.code === "number") {
    return data.code;
  }

  if (typeof record.code === "number") {
    return record.code;
  }

  const nestedCandidate = getNestedErrorCandidate(error);
  if (nestedCandidate) {
    return extractPusherErrorCode(nestedCandidate);
  }

  return null;
}

function extractPusherErrorMessage(error: unknown): string | null {
  const record = asRecord(error);
  if (!record) {
    return null;
  }

  const data = asRecord(record.data);
  const candidates = [data?.message, record.message]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (candidates.length > 0) {
    return candidates[0];
  }

  const nestedCandidate = getNestedErrorCandidate(error);
  if (nestedCandidate) {
    return extractPusherErrorMessage(nestedCandidate);
  }

  return null;
}

function isTransientConnectionError(error: unknown) {
  const code = extractPusherErrorCode(error);
  const message = extractPusherErrorMessage(error)?.toLowerCase() || "";

  return (
    (typeof code === "number" && TRANSIENT_PUSHER_ERROR_CODES.has(code)) ||
    message.includes("pong reply not received")
  );
}

function clearUnavailableTimer() {
  if (unavailableTimer !== null) {
    window.clearTimeout(unavailableTimer);
    unavailableTimer = null;
  }
}

function scheduleUnavailableWarning(pusher: Pusher) {
  if (unavailableTimer !== null || unavailableReported) {
    return;
  }

  unavailableTimer = window.setTimeout(() => {
    unavailableTimer = null;

    if (pusher.connection.state !== "unavailable") {
      return;
    }

    unavailableReported = true;

    void reportClientError({
      title: "Realtime temporarily unavailable",
      message: "Realtime updates are reconnecting.",
      severity: "WARNING",
      source: "CLIENT",
      route: window.location.pathname,
      area: "realtime.connection",
      metadata: {
        state: pusher.connection.state,
        userAgent: navigator.userAgent,
      },
    });
  }, UNAVAILABLE_WARNING_DELAY_MS);
}

function ensureConnectionMonitoring(pusher: Pusher) {
  if (connectionMonitoringInitialized) {
    return;
  }

  connectionMonitoringInitialized = true;

  pusher.connection.bind("state_change", (states: { previous: string; current: string }) => {
    if (states.current === "connected") {
      clearUnavailableTimer();
      unavailableReported = false;
      return;
    }

    if (states.current === "unavailable") {
      scheduleUnavailableWarning(pusher);
      return;
    }

    if (states.current === "failed" || states.current === "disconnected") {
      clearUnavailableTimer();
    }
  });

  pusher.connection.bind("error", (error: unknown) => {
    if (isTransientConnectionError(error)) {
      return;
    }

    const message = getClientErrorMessage(error, "Realtime connection failed");
    void reportClientError({
      title: "Realtime connection failed",
      message,
      severity: "ERROR",
      source: "CLIENT",
      route: window.location.pathname,
      area: "realtime.connection",
      metadata: {
        state: pusher.connection.state,
        error: serializeClientErrorReason(error),
        userAgent: navigator.userAgent,
      },
    });
  });
}

export function getPusherClient() {
  if (client) {
    return client;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  client = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
  });
  ensureConnectionMonitoring(client);

  return client;
}
