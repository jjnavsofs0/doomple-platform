export const COOKIE_CONSENT_COOKIE = "doomple_cookie_consent";
export const COOKIE_VISITOR_ID_COOKIE = "doomple_visitor_id";
export const COOKIE_POLICY_VERSION =
  process.env.NEXT_PUBLIC_COOKIE_POLICY_VERSION || "2026-03-20";

export function serializeConsentValue(decision: "ACCEPT_ALL" | "ESSENTIAL_ONLY") {
  return `${COOKIE_POLICY_VERSION}:${decision}`;
}
