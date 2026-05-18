import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  const programs = await prisma.programEvent.findMany({ orderBy: { order: "asc" } });
  return apiResponse(programs);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { title, description, videoUrl, thumbnail, colorClass, order, isActive } = body;

    if (!title) return apiError("শিরোনাম আবশ্যক।", 400);

    const program = await prisma.programEvent.create({
      data: {
        title, description, videoUrl, thumbnail,
        colorClass: colorClass || "bg-emerald-500",
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return apiResponse(program, "কার্যক্রম যোগ হয়েছে।", 201);
  } catch (err) {
    console.error("[PROGRAMS POST]", err);
    return apiError("যোগ করতে ব্যর্থ।", 500);
  }
}
