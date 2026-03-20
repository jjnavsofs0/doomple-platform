"use client";

import * as React from "react";
import { attemptChunkReload, isChunkLoadError } from "@/lib/chunk-recovery";

type ClientErrorPayload = {
  title: string;
  message: string;
  severity: "ERROR" | "CRITICAL";
  source: "CLIENT" | "RENDER";
  route?: string;
  area?: string;
  stack?: string | null;
  metadata?: Record<string, unknown>;
};

const sentFingerprints = new Set<string>();

function isIgnorableClientNoise(message: string) {
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

async function sendClientError(payload: ClientErrorPayload) {
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

export function ErrorMonitor() {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const isChunkError = isChunkLoadError(event.error || event.message);
      const message =
        event.error instanceof Error
          ? event.error.message
          : event.message || "Client runtime error";

      if (isIgnorableClientNoise(message)) {
        return;
      }

      void sendClientError({
        title: isChunkError ? "Chunk asset failed to load" : event.message || "Client runtime error",
        message,
        severity: isChunkError ? "CRITICAL" : "ERROR",
        source: "CLIENT",
        route: window.location.pathname,
        area: isChunkError ? "chunk-load" : "window.onerror",
        stack: event.error instanceof Error ? event.error.stack || null : null,
        metadata: {
          filename: event.filename || null,
          line: event.lineno || null,
          column: event.colno || null,
          userAgent: navigator.userAgent,
        },
      });

      if (isChunkError) {
        attemptChunkReload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isChunkError = isChunkLoadError(reason);
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled client promise rejection";

      if (isIgnorableClientNoise(message)) {
        return;
      }

      void sendClientError({
        title: isChunkError ? "Chunk asset failed to load" : "Unhandled client promise rejection",
        message,
        severity: isChunkError ? "CRITICAL" : "ERROR",
        source: "CLIENT",
        route: window.location.pathname,
        area: isChunkError ? "chunk-load" : "window.unhandledrejection",
        stack: reason instanceof Error ? reason.stack || null : null,
        metadata: {
          userAgent: navigator.userAgent,
        },
      });

      if (isChunkError) {
        attemptChunkReload();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
