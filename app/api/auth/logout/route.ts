import { NextRequest } from "next/server";
import { clearAuthCookie, getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (session) {
    await prisma.auditLog.create({
      data: {
        action: "LOGOUT",
        entity: "User",
        entityId: session.userId,
        userId: session.userId,
      },
    });
  }
  clearAuthCookie();
  return apiResponse(null, "লগআউট সফল।");
}
