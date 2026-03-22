"use client";

import * as React from "react";
import { attemptChunkReload, isChunkLoadError } from "@/lib/chunk-recovery";
import {
  getClientErrorMessage,
  isIgnorableClientNoise,
  reportClientError,
  serializeClientErrorReason,
} from "@/lib/client-error-reporting";

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

      void reportClientError({
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
      const message = getClientErrorMessage(reason, "Unhandled client promise rejection");

      if (isIgnorableClientNoise(message)) {
        return;
      }

      void reportClientError({
        title: isChunkError ? "Chunk asset failed to load" : "Unhandled client promise rejection",
        message,
        severity: isChunkError ? "CRITICAL" : "ERROR",
        source: "CLIENT",
        route: window.location.pathname,
        area: isChunkError ? "chunk-load" : "window.unhandledrejection",
        stack: reason instanceof Error ? reason.stack || null : null,
        metadata: {
          userAgent: navigator.userAgent,
          reason: serializeClientErrorReason(reason),
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
