import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, getOpenAIChatModel } from "@/lib/openai";
import { broadcastAdminRefresh } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const LEAD_FIELDS = [
  "fullName",
  "email",
  "phone",
  "companyName",
  "category",
  "priority",
  "budgetRange",
  "requirementsSummary",
  "location",
  "country",
  "timeline",
  "source",
] as const;

const VALID_CATEGORIES = [
  "SERVICE_INQUIRY",
  "SOLUTION_INQUIRY",
  "UEP_INQUIRY",
  "SAAS_TOOLKIT_INQUIRY",
  "WORKFORCE_INQUIRY",
  "SUPPORT_INQUIRY",
  "PARTNERSHIP_INQUIRY",
];

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const MAX_ROWS = 500;

function heuristicMapping(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const col of columns) {
    const lower = col.toLowerCase().trim();
    if (lower.includes("email")) {
      mapping[col] = "email";
    } else if (lower.includes("full") && lower.includes("name")) {
      mapping[col] = "fullName";
    } else if (lower === "name" || lower.includes("contact name")) {
      mapping[col] = "fullName";
    } else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel")) {
      mapping[col] = "phone";
    } else if (lower.includes("company") || lower.includes("organisation") || lower.includes("organization")) {
      mapping[col] = "companyName";
    } else if (lower.includes("message") || lower.includes("requirement") || lower.includes("description") || lower.includes("comments")) {
      mapping[col] = "requirementsSummary";
    } else if (lower.includes("budget")) {
      mapping[col] = "budgetRange";
    } else if (lower.includes("location") || lower.includes("city")) {
      mapping[col] = "location";
    } else if (lower.includes("country")) {
      mapping[col] = "country";
    } else if (lower.includes("source")) {
      mapping[col] = "source";
    } else if (lower.includes("category") || lower.includes("inquiry type")) {
      mapping[col] = "category";
    } else if (lower.includes("priority")) {
      mapping[col] = "priority";
    } else if (lower.includes("timeline")) {
      mapping[col] = "timeline";
    }
  }
  return mapping;
}

async function aiMapColumns(
  columns: string[],
  sampleRow: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const client = getOpenAIClient();
    const model = getOpenAIChatModel();

    const columnList = columns
      .map((col) => `- "${col}": sample value "${sampleRow[col] ?? ""}"`)
      .join("\n");

    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a data mapping assistant. Map CSV column names to lead fields.
Available lead fields: fullName, email, phone, companyName, category, priority, budgetRange, requirementsSummary, location, country, timeline, source.
Return a JSON object where keys are the original CSV column names and values are the matching lead field names.
If a column doesn't match any lead field, omit it from the output.
Only use valid lead field names listed above.`,
        },
        {
          role: "user",
          content: `Map these CSV columns to lead fields:\n${columnList}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return heuristicMapping(columns);
    }

    const parsed = JSON.parse(content) as Record<string, string>;

    // Validate that mapped values are valid lead fields
    const validFields = new Set(LEAD_FIELDS);
    const validated: Record<string, string> = {};
    for (const [col, field] of Object.entries(parsed)) {
      if (validFields.has(field as typeof LEAD_FIELDS[number])) {
        validated[col] = field;
      }
    }

    return validated;
  } catch {
    return heuristicMapping(columns);
  }
}

async function processImportRow(
  row: Record<string, string>,
  mapping: Record<string, string>,
  defaultSource: string,
  sessionUserId: string
): Promise<{ status: "created" | "reopened" | "duplicate" | "skipped" | "failed"; reason?: string }> {
  // Map row fields using the provided mapping
  const mapped: Record<string, string> = {};
  for (const [csvCol, leadField] of Object.entries(mapping)) {
    if (row[csvCol] !== undefined && row[csvCol] !== "") {
      mapped[leadField] = row[csvCol];
    }
  }

  const email = mapped.email?.trim();
  const fullName = mapped.fullName?.trim() || (email ? email.split("@")[0] : "");

  if (!email) {
    return { status: "skipped", reason: "Missing email" };
  }

  const category = VALID_CATEGORIES.includes(mapped.category?.toUpperCase() ?? "")
    ? mapped.category.toUpperCase()
    : "SERVICE_INQUIRY";

  const priority = VALID_PRIORITIES.includes(mapped.priority?.toUpperCase() ?? "")
    ? mapped.priority.toUpperCase()
    : "MEDIUM";

  const source = mapped.source?.trim() || defaultSource;

  // Idempotency: check for existing lead by email
  const existingLead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (existingLead) {
    const terminalStatuses = ["LOST", "ON_HOLD"];
    if (terminalStatuses.includes(existingLead.status)) {
      // Reopen
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          status: "NEW",
          fullName: fullName || existingLead.fullName,
          phone: mapped.phone || existingLead.phone,
          companyName: mapped.companyName || existingLead.companyName,
          requirementsSummary: mapped.requirementsSummary || existingLead.requirementsSummary,
          budgetRange: mapped.budgetRange || existingLead.budgetRange,
          source: source as any,
          priority: priority as any,
          updatedAt: new Date(),
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          type: "REOPENED",
          description: `Lead reopened via CSV import. Previous status: ${existingLead.status}.`,
          userId: sessionUserId,
        },
      });

      return { status: "reopened" };
    }

    // Active lead — attach a note
    await prisma.leadActivity.create({
      data: {
        leadId: existingLead.id,
        type: "NOTE",
        description: `Duplicate entry found in CSV import. Email: ${email}.`,
        userId: sessionUserId,
      },
    });

    return { status: "duplicate" };
  }

  // Create new lead
  const lead = await prisma.lead.create({
    data: {
      fullName,
      email,
      phone: mapped.phone || null,
      companyName: mapped.companyName || null,
      source: source as any,
      category: category as any,
      status: "NEW",
      priority: priority as any,
      budgetRange: mapped.budgetRange || null,
      requirementsSummary: mapped.requirementsSummary || null,
      location: mapped.location || null,
      country: mapped.country || null,
      timeline: mapped.timeline || null,
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "CREATED",
      description: "Lead created via CSV import",
      userId: sessionUserId,
    },
  });

  return { status: "created" };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Determine action from query param or body
    const url = new URL(request.url);
    const actionParam = url.searchParams.get("action");

    // --- MODE 1: analyze ---
    if (actionParam === "analyze" || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = (formData.get("action") as string) || actionParam || "analyze";

      if (action !== "analyze") {
        return NextResponse.json({ error: "Invalid action for multipart request" }, { status: 400 });
      }

      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const allowedExtensions = [".csv", ".xlsx", ".xls"];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Please upload a CSV or Excel file." }, { status: 400 });
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) {
        return NextResponse.json({ error: "The file appears to be empty." }, { status: 400 });
      }

      const columns = Object.keys(rows[0]);
      const sampleRows = rows.slice(0, 5);
      const preview = sampleRows.map((row) =>
        columns.reduce<Record<string, string>>((acc, col) => {
          acc[col] = String(row[col] ?? "");
          return acc;
        }, {})
      );

      const mapping = await aiMapColumns(columns, sampleRows[0] ?? {});

      return NextResponse.json({
        success: true,
        mapping,
        columns,
        preview,
        sampleRows,
        totalRows: rows.length,
        allRows: rows,
      });
    }

    // --- MODE 2: import ---
    const body = await request.json();
    const action = body.action || actionParam;

    if (action !== "import") {
      return NextResponse.json({ error: "Invalid action. Use 'analyze' or 'import'." }, { status: 400 });
    }

    const {
      rows,
      mapping,
      defaultSource = "CSV_IMPORT",
    }: {
      rows: Record<string, string>[];
      mapping: Record<string, string>;
      defaultSource?: string;
    } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for import." }, { status: 400 });
    }

    if (!mapping || typeof mapping !== "object") {
      return NextResponse.json({ error: "Column mapping is required." }, { status: 400 });
    }

    const rowsToProcess = rows.slice(0, MAX_ROWS);

    let created = 0;
    let reopened = 0;
    let duplicates = 0;
    let failed = 0;
    let skipped = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < rowsToProcess.length; i++) {
      try {
        const result = await processImportRow(
          rowsToProcess[i],
          mapping,
          defaultSource,
          session.user.id
        );

        if (result.status === "created") created++;
        else if (result.status === "reopened") reopened++;
        else if (result.status === "duplicate") duplicates++;
        else if (result.status === "skipped") skipped++;
      } catch (err) {
        failed++;
        errors.push({
          row: i + 1,
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Broadcast once after the full batch
    try {
      await broadcastAdminRefresh(["leads", "dashboard"]);
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      total: rowsToProcess.length,
      created,
      reopened,
      duplicates,
      skipped,
      failed,
      errors,
    });
  } catch (error) {
    console.error("Lead import error:", error);
    return NextResponse.json(
      { success: false, error: "Import failed. Please try again." },
      { status: 500 }
    );
  }
}
