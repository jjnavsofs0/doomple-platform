import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPortalClient() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role !== "CLIENT") {
    return { error: "Forbidden", status: 403 as const };
  }

  const client = await prisma.client.findUnique({
    where: { email: session.user.email || "" },
    select: {
      id: true,
      email: true,
      companyName: true,
      contactName: true,
    },
  });

  if (!client) {
    return { error: "Client account not linked", status: 404 as const };
  }

  return { client };
}
