import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastAdminRefresh } from "@/lib/realtime";

export const dynamic = "force-dynamic";

// Google Ads column_id → lead field name
function mapGoogleColumnId(columnId: string): string | null {
  switch (columnId.toUpperCase()) {
    case "FULL_NAME":
      return "fullName";
    case "EMAIL":
      return "email";
    case "PHONE_NUMBER":
      return "phone";
    case "COMPANY_NAME":
      return "companyName";
    case "CITY":
      return "location";
    case "COUNTRY":
      return "country";
    case "MESSAGE":
      return "requirementsSummary";
    case "JOB_TITLE":
      return null; // skip
    default:
      return null;
  }
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
          description: `Lead reopened via Google Ads webhook. Previous status: ${existingLead.status}.`,
        },
      });

      return "reopened";
    }

    await prisma.leadActivity.create({
      data: {
        leadId: existingLead.id,
        type: "NOTE",
        description: `Duplicate inquiry received via Google Ads.${requirementsSummary ? ` Message: ${requirementsSummary}` : ""}`,
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
      description: "Lead created via Google Ads webhook",
    },
  });

  return "created";
}

// POST — receive lead from Google Ads
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify webhook key if configured
    const webhookKey = process.env.GOOGLE_LEADS_WEBHOOK_KEY;
    if (webhookKey && body.google_key !== webhookKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userColumnData: Array<{ column_id: string; string_value?: string }> =
      body.user_column_data ?? [];

    const leadFields: Record<string, string> = {};
    const unmappedFields: string[] = [];

    for (const col of userColumnData) {
      const mappedField = mapGoogleColumnId(col.column_id);
      const value = col.string_value?.trim() ?? "";
      if (!value) continue;

      if (mappedField) {
        leadFields[mappedField] = value;
      } else if (mappedField !== null) {
        // null means explicitly skipped (e.g. JOB_TITLE)
        unmappedFields.push(`${col.column_id}: ${value}`);
      }
    }

    const email = leadFields.email?.trim();
    const fullName = leadFields.fullName?.trim() || (email ? email.split("@")[0] : "Google Lead");

    if (!email) {
      console.warn("Google Ads webhook: no email in payload, skipping.");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Append unmapped fields to requirementsSummary if any
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
      source: "GOOGLE_ADS",
    });

    // Broadcast refresh
    try {
      await broadcastAdminRefresh(["leads", "dashboard"]);
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Google Ads webhook error:", error);
    // Return 200 so Google does not keep retrying on transient errors
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
