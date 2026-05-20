import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return apiResponse(categories);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { name, nameEn, order } = body;

    if (!name) return apiError("বিভাগের নাম আবশ্যক।", 400);

    const category = await prisma.category.create({
      data: { name, nameEn, order: order ?? 0 },
    });

    return apiResponse(category, "বিভাগ যোগ হয়েছে।", 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") return apiError("এই বিভাগ ইতিমধ্যে আছে।", 409);
    console.error("[CATEGORIES POST]", err);
    return apiError("যোগ করতে ব্যর্থ।", 500);
  }
}
