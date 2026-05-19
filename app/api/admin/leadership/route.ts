import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  const leaders = await prisma.leadership.findMany({
    orderBy: { order: "asc" },
  });

  return apiResponse(leaders);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { name, role, description, photo, email, phone, facebookUrl, youtubeUrl, order, isActive } = body;

    if (!name || !role) return apiError("নাম ও পদবি আবশ্যক।", 400);

    const leader = await prisma.leadership.create({
      data: { name, role, description, photo, email, phone, facebookUrl, youtubeUrl, order: order ?? 0, isActive: isActive ?? true },
    });

    return apiResponse(leader, "নেতৃত্ব যোগ হয়েছে।", 201);
  } catch (err) {
    console.error("[LEADERSHIP POST]", err);
    return apiError("যোগ করতে ব্যর্থ।", 500);
  }
}
