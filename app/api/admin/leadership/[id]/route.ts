import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { name, role, description, photo, email, phone, facebookUrl, youtubeUrl, order, isActive } = body;

    const leader = await prisma.leadership.update({
      where: { id: params.id },
      data: { name, role, description, photo, email, phone, facebookUrl, youtubeUrl, order, isActive },
    });

    return apiResponse(leader, "আপডেট হয়েছে।");
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") return apiError("পাওয়া যায়নি।", 404);
    console.error("[LEADERSHIP PUT]", err);
    return apiError("আপডেট ব্যর্থ।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  try {
    await prisma.leadership.delete({ where: { id: params.id } });
    return apiResponse(null, "মুছে ফেলা হয়েছে।");
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") return apiError("পাওয়া যায়নি।", 404);
    console.error("[LEADERSHIP DELETE]", err);
    return apiError("মুছতে ব্যর্থ।", 500);
  }
}
