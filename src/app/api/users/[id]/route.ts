import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (body.email && body.email !== existingUser.email) {
      const duplicate = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    const validRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "SALES",
      "PROJECT_MANAGER",
      "FINANCE",
      "CLIENT",
    ];

    const passwordHash =
      body.password && String(body.password).trim()
        ? await hash(String(body.password), 10)
        : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existingUser.name,
        email: body.email ?? existingUser.email,
        phone: body.phone !== undefined ? body.phone : existingUser.phone,
        role: validRoles.includes(body.role) ? body.role : existingUser.role,
        isActive:
          body.isActive !== undefined ? Boolean(body.isActive) : existingUser.isActive,
        passwordHash: passwordHash ?? existingUser.passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "SUPER_ADMIN" && user.id === auth.session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own super admin account" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
