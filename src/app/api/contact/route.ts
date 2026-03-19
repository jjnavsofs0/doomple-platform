import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = contactFormSchema.parse(body);

    // Create contact submission
    const contact = await prisma.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
        status: "new",
      },
    });

    // Optionally auto-create a lead
    if (body.autoCreateLead === true) {
      const leadCategory = body.category || "SERVICE_INQUIRY";
      const leadSource = body.source || "WEBSITE";

      await prisma.lead.create({
        data: {
          fullName: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          source: leadSource,
          category: leadCategory,
          status: "NEW",
          priority: "MEDIUM",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Contact submission created successfully",
        data: contact,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create contact submission" },
      { status: 500 }
    );
  }
}
