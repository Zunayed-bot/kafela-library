import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { title, description, colorClass, order, isActive } = body;

    const program = await prisma.programEvent.update({
      where: { id: params.id },
      data: { title, description, colorClass, order, isActive },
    });

    return apiResponse(program, "আপডেট হয়েছে।");
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") return apiError("পাওয়া যায়নি।", 404);
    console.error("[PROGRAMS PUT]", err);
    return apiError("আপডেট ব্যর্থ।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  try {
    await prisma.programEvent.delete({ where: { id: params.id } });
    return apiResponse(null, "মুছে ফেলা হয়েছে।");
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") return apiError("পাওয়া যায়নি।", 404);
    console.error("[PROGRAMS DELETE]", err);
    return apiError("মুছতে ব্যর্থ।", 500);
  }
}
