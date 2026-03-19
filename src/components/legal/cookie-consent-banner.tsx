"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COOKIE_CONSENT_COOKIE, COOKIE_POLICY_VERSION } from "@/lib/privacy";

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const saved = getCookieValue(COOKIE_CONSENT_COOKIE);
    if (!saved || !saved.startsWith(`${COOKIE_POLICY_VERSION}:`)) {
      setVisible(true);
    }
  }, []);

  const handleDecision = async (decision: "ACCEPT_ALL" | "ESSENTIAL_ONLY") => {
    try {
      setSaving(true);
      const response = await fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          source: "banner",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save cookie preferences");
      }

      setVisible(false);
    } catch (error) {
      console.error("Cookie consent save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Card className="overflow-hidden rounded-[28px] border-[#CCE1F1] bg-[linear-gradient(135deg,#F8FCFF_0%,#FFFFFF_50%,#EFF8FF_100%)] shadow-[0_18px_48px_rgba(4,32,66,0.16)]">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CDE7E4] bg-[#EFFFFB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F8A7C]">
                <ShieldCheck className="h-4 w-4" />
                GDPR Cookie Notice
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#042042]">
                We use essential cookies and, with your choice, analytics and marketing cookies.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52637A]">
                Your consent is recorded against GDPR policy version{" "}
                <span className="font-semibold text-[#042042]">{COOKIE_POLICY_VERSION}</span>. You
                can continue with essential cookies only, or accept all cookies for measurement and
                campaign tracking. Read the{" "}
                <Link href="/privacy-policy" className="font-medium text-[#0B6E99] hover:text-[#084c72]">
                  privacy policy
                </Link>{" "}
                for details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-[#BFD8EC] bg-white text-[#042042] hover:bg-[#F5FAFF]"
                disabled={saving}
                onClick={() => handleDecision("ESSENTIAL_ONLY")}
              >
                Essential Only
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-[#042042] text-white hover:bg-[#07315F]"
                disabled={saving}
                onClick={() => handleDecision("ACCEPT_ALL")}
              >
                {saving ? "Saving..." : "Accept All"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
