import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  const videos = await prisma.programVideo.findMany({
    where: { programId: params.id },
    orderBy: { order: "asc" },
  });

  return apiResponse(videos);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { title, thumbnail, videoUrl, order } = body;

    if (!videoUrl) return apiError("ভিডিও লিংক আবশ্যক।", 400);

    const count = await prisma.programVideo.count({ where: { programId: params.id } });

    const video = await prisma.programVideo.create({
      data: { programId: params.id, title, thumbnail, videoUrl, order: order ?? count },
    });

    return apiResponse(video, "ভিডিও যোগ হয়েছে।", 201);
  } catch (err) {
    console.error("[PROGRAM VIDEOS POST]", err);
    return apiError("যোগ করতে ব্যর্থ।", 500);
  }
}
