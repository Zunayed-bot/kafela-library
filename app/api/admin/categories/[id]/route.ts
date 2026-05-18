import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { name, nameEn, order } = body;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, nameEn, order },
    });

    return apiResponse(category, "আপডেট হয়েছে।");
  } catch (err) {
    console.error("[CATEGORIES PUT]", err);
    return apiError("আপডেট ব্যর্থ।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return apiResponse(null, "মুছে ফেলা হয়েছে।");
  } catch (err) {
    console.error("[CATEGORIES DELETE]", err);
    return apiError("মুছতে ব্যর্থ।", 500);
  }
}
