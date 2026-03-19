import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { createEmailChangeRequest } from "@/lib/account-email";
import { notifyAdmins, notifyUserById } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        avatarStorageKey: true,
        avatarStorageProvider: true,
        emailVerificationStatus: true,
        emailVerifiedAt: true,
        transactionalEmailsEnabled: true,
        marketingEmailsEnabled: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        erasureRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        ...user,
        erasureStatus: user.erasureRequests[0]?.status || null,
        isDeletedAccount: user.erasureRequests[0]?.status === "ANONYMIZED",
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    // Validate required fields
    if (!email || !body.name || !body.password) {
      return NextResponse.json(
        { success: false, error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(body.password, 10);

    // Validate role
    const validRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "SALES",
      "PROJECT_MANAGER",
      "FINANCE",
      "CLIENT",
    ];
    const role = validRoles.includes(body.role) ? body.role : "SALES";

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role,
        phone: body.phone || null,
        avatar: body.avatar || null,
        emailVerificationStatus: "PENDING",
        transactionalEmailsEnabled: body.transactionalEmailsEnabled !== false,
        marketingEmailsEnabled: body.marketingEmailsEnabled !== false,
        isActive: body.isActive !== false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        avatarStorageKey: true,
        avatarStorageProvider: true,
        emailVerificationStatus: true,
        emailVerifiedAt: true,
        transactionalEmailsEnabled: true,
        marketingEmailsEnabled: true,
        isActive: true,
        createdAt: true,
      },
    });

    try {
      await createEmailChangeRequest({
        userId: user.id,
        currentEmail: user.email,
        currentName: user.name,
        newEmail: user.email,
        request,
        mode: "verify",
      });
    } catch (emailError) {
      console.warn(
        "Initial verification email for newly created user was not sent:",
        emailError instanceof Error ? emailError.message : emailError
      );
    }

    await notifyAdmins({
      title: "User created",
      message: `${user.name} was added as ${user.role.replaceAll("_", " ").toLowerCase()}.`,
      link: `/admin/users/${user.id}`,
      topics: ["dashboard", "users", "notifications"],
      metadata: {
        userId: user.id,
        role: user.role,
      },
    });

    await notifyUserById({
      userId: user.id,
      title: "Welcome to Doomple",
      message: "Your account is ready. Verify your email to start using all features.",
      link: user.role === "CLIENT" ? "/portal/profile" : "/admin/profile",
      topics: ["users", "notifications"],
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. A verification email was queued for the account address when email delivery is configured.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
