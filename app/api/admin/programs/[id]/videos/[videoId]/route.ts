import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function PUT(request: NextRequest, { params }: { params: { id: string; videoId: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    const body = await request.json();
    const { title, thumbnail, videoUrl, order } = body;

    const video = await prisma.programVideo.update({
      where: { id: params.videoId },
      data: { title, thumbnail, videoUrl, order },
    });

    return apiResponse(video, "আপডেট হয়েছে।");
  } catch (err) {
    console.error("[PROGRAM VIDEO PUT]", err);
    return apiError("আপডেট ব্যর্থ।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; videoId: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 403);

  try {
    await prisma.programVideo.delete({ where: { id: params.videoId } });
    return apiResponse(null, "মুছে ফেলা হয়েছে।");
  } catch (err) {
    console.error("[PROGRAM VIDEO DELETE]", err);
    return apiError("মুছতে ব্যর্থ।", 500);
  }
}
