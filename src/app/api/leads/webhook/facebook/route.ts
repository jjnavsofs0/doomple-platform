import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastAdminRefresh } from "@/lib/realtime";

export const dynamic = "force-dynamic";

// Facebook field name → lead field name
function mapFacebookField(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (lower === "full_name" || lower === "full name") return "fullName";
  if (lower === "email") return "email";
  if (lower === "phone_number" || lower === "phone") return "phone";
  if (lower === "company_name" || lower === "company") return "companyName";
  if (lower === "message" || lower === "comments") return "requirementsSummary";
  if (lower === "city") return "location";
  if (lower === "country") return "country";
  return null;
}

async function upsertLead(data: {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  requirementsSummary?: string;
  location?: string;
  country?: string;
  source: string;
}) {
  const { email, fullName, phone, companyName, requirementsSummary, location, country, source } = data;

  const existingLead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (existingLead) {
    const terminalStatuses = ["LOST", "ON_HOLD"];
    if (terminalStatuses.includes(existingLead.status)) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          status: "NEW",
          fullName: fullName || existingLead.fullName,
          phone: phone || existingLead.phone,
          companyName: companyName || existingLead.companyName,
          requirementsSummary: requirementsSummary || existingLead.requirementsSummary,
          source: source as any,
          updatedAt: new Date(),
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          type: "REOPENED",
          description: `Lead reopened via Facebook Ads webhook. Previous status: ${existingLead.status}.`,
        },
      });

      return "reopened";
    }

    await prisma.leadActivity.create({
      data: {
        leadId: existingLead.id,
        type: "NOTE",
        description: `Duplicate inquiry received via Facebook Ads.${requirementsSummary ? ` Message: ${requirementsSummary}` : ""}`,
      },
    });

    return "duplicate";
  }

  const lead = await prisma.lead.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      companyName: companyName || null,
      source: source as any,
      category: "SERVICE_INQUIRY",
      status: "NEW",
      priority: "MEDIUM",
      requirementsSummary: requirementsSummary || null,
      location: location || null,
      country: country || null,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "CREATED",
      description: "Lead created via Facebook Ads webhook",
    },
  });

  return "created";
}

// GET — Meta webhook verification
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.FACEBOOK_LEAD_WEBHOOK_TOKEN
  ) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// POST — receive lead event from Meta
export async function POST(request: Request) {
  try {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn("FACEBOOK_PAGE_ACCESS_TOKEN is not set. Skipping Facebook lead processing.");
      return new Response("OK", { status: 200 });
    }

    const body = await request.json();

    if (body.object !== "page") {
      return new Response("OK", { status: 200 });
    }

    const entries: any[] = body.entry ?? [];

    for (const entry of entries) {
      const changes: any[] = entry.changes ?? [];
      for (const change of changes) {
        if (change.field !== "leadgen") continue;

        const leadgenId = change.value?.leadgen_id;
        if (!leadgenId) continue;

        try {
          // Fetch lead data from Meta Graph API
          const metaRes = await fetch(
            `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
          );

          if (!metaRes.ok) {
            console.error(`Failed to fetch Facebook lead ${leadgenId}: ${metaRes.status}`);
            continue;
          }

          const metaData = await metaRes.json();
          const fieldData: Array<{ name: string; values: string[] }> = metaData.field_data ?? [];

          const leadFields: Record<string, string> = {};
          const unmappedFields: string[] = [];

          for (const field of fieldData) {
            const mappedField = mapFacebookField(field.name);
            const value = field.values?.[0] ?? "";
            if (mappedField) {
              leadFields[mappedField] = value;
            } else if (value) {
              unmappedFields.push(`${field.name}: ${value}`);
            }
          }

          const email = leadFields.email?.trim();
          const fullName = leadFields.fullName?.trim() || (email ? email.split("@")[0] : "Facebook Lead");

          if (!email) {
            console.warn(`Facebook lead ${leadgenId} has no email, skipping.`);
            continue;
          }

          // Append unmapped fields to requirementsSummary
          const summary = [
            leadFields.requirementsSummary,
            unmappedFields.length > 0 ? unmappedFields.join(" | ") : null,
          ]
            .filter(Boolean)
            .join(" | ");

          await upsertLead({
            fullName,
            email,
            phone: leadFields.phone,
            companyName: leadFields.companyName,
            requirementsSummary: summary || undefined,
            location: leadFields.location,
            country: leadFields.country,
            source: "FACEBOOK_ADS",
          });
        } catch (err) {
          console.error(`Error processing Facebook lead ${leadgenId}:`, err);
        }
      }
    }

    // Broadcast refresh after processing all entries
    try {
      await broadcastAdminRefresh(["leads", "dashboard"]);
    } catch {
      // Non-fatal
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Facebook webhook error:", error);
    // Always return 200 to prevent Meta from retrying
    return new Response("OK", { status: 200 });
  }
}
