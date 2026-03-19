"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
        <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Application error</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Doomple hit a critical error.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This error has been captured for audit. Please retry once, and if it persists, review the admin Errors page.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => reset()}>Retry</Button>
            <Button variant="outline" onClick={() => window.location.assign("/")}>
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
