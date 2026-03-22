"use client";

export type ClientErrorPayload = {
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source: "CLIENT" | "RENDER";
  route?: string;
  area?: string;
  stack?: string | null;
  metadata?: Record<string, unknown>;
};

const sentFingerprints = new Set<string>();

export function isIgnorableClientNoise(message: string) {
  return /ResizeObserver loop completed with undelivered notifications/i.test(message);
}

function buildFingerprint(payload: ClientErrorPayload) {
  return [
    payload.source,
    payload.route || "",
    payload.area || "",
    payload.title,
    payload.message.slice(0, 500),
  ].join("::");
}

export function serializeClientErrorReason(reason: unknown): unknown {
  if (reason instanceof Error) {
    return {
      name: reason.name,
      message: reason.message,
      stack: reason.stack || null,
    };
  }

  if (reason == null) {
    return null;
  }

  if (typeof reason === "string" || typeof reason === "number" || typeof reason === "boolean") {
    return reason;
  }

  if (Array.isArray(reason)) {
    return reason.map((item) => serializeClientErrorReason(item));
  }

  if (typeof reason === "object") {
    const entries = Object.entries(reason as Record<string, unknown>).slice(0, 20);
    return Object.fromEntries(entries.map(([key, value]) => [key, serializeClientErrorReason(value)]));
  }

  return String(reason);
}

export function getClientErrorMessage(reason: unknown, fallback: string) {
  if (reason instanceof Error) {
    return reason.message || fallback;
  }

  if (typeof reason === "string") {
    return reason || fallback;
  }

  if (reason && typeof reason === "object") {
    const record = reason as Record<string, unknown>;
    const candidates = [record.message, record.error, record.reason, record.statusText]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (candidates.length > 0) {
      return candidates[0];
    }

    try {
      return JSON.stringify(serializeClientErrorReason(reason));
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function reportClientError(payload: ClientErrorPayload) {
  const fingerprint = buildFingerprint(payload);
  if (sentFingerprints.has(fingerprint)) {
    return;
  }

  sentFingerprints.add(fingerprint);

  try {
    await fetch("/api/error-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ignore secondary logging failures in the browser.
  }
}
