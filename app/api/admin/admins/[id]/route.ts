import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  if (params.id === session.userId) return apiError("নিজের অ্যাকাউন্ট মুছতে পারবেন না।", 400);

  try {
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true, name: true },
    });

    if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
      return apiError("অ্যাডমিন পাওয়া যায়নি।", 404);
    }

    await prisma.user.delete({ where: { id: params.id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: "ADMIN_DELETED",
          entity: "User",
          entityId: params.id,
          adminId: session.userId,
          details: JSON.stringify({ name: target.name }),
        },
      });
    } catch { /* non-fatal */ }

    return apiResponse(null, "অ্যাডমিন মুছে ফেলা হয়েছে।");
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") return apiError("অ্যাডমিন পাওয়া যায়নি।", 404);
    console.error("[ADMIN DELETE]", err);
    return apiError("মুছতে ব্যর্থ।", 500);
  }
}
