"use client";

import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import { ErrorMonitor } from "@/components/system/error-monitor";
import { ToastProvider, Toaster } from "@/components/ui/toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
      <ErrorMonitor />
      <Toaster />
      <CookieConsentBanner />
    </ToastProvider>
  );
}
