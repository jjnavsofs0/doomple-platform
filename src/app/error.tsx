"use client";

import * as React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attemptChunkReload, isChunkLoadError } from "@/lib/chunk-recovery";

async function logRenderError(error: Error) {
  try {
    await fetch("/api/error-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Application render error",
        message: error.message || "A render error occurred.",
        severity: "CRITICAL",
        source: "RENDER",
        route: typeof window !== "undefined" ? window.location.pathname : "/",
        area: "app-error-boundary",
        stack: error.stack || null,
        metadata: {
          digest: (error as Error & { digest?: string }).digest || null,
        },
      }),
      keepalive: true,
    });
  } catch {
    // Avoid secondary failures inside the error boundary.
  }
}

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError = isChunkLoadError(error);
  const [autoRecovering, setAutoRecovering] = React.useState(false);

  React.useEffect(() => {
    void logRenderError(error);
  }, [error]);

  React.useEffect(() => {
    if (!isChunkError) {
      return;
    }

    const didReload = attemptChunkReload();
    if (didReload) {
      setAutoRecovering(true);
    }
  }, [isChunkError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <Card className="w-full max-w-xl rounded-[28px] border border-red-100 bg-white p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
                {isChunkError ? "App update detected" : "Something went wrong"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {isChunkError ? "We’re refreshing the app." : "We logged this error for review."}
              </h1>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {isChunkError
                ? "A fresh deploy changed one of the app bundles. Doomple is trying a clean reload so you land on the latest version."
                : "The page hit an unexpected problem. You can retry now, and the issue is already available in the admin error log for audit and follow-up."}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => {
                  if (isChunkError) {
                    window.location.reload();
                    return;
                  }

                  reset();
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isChunkError ? "Reload app" : "Try again"}
              </Button>
              <Button variant="outline" onClick={() => window.location.assign("/")}>
                Go home
              </Button>
            </div>
            {autoRecovering ? (
              <p className="text-xs font-medium text-slate-500">Refreshing now...</p>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
