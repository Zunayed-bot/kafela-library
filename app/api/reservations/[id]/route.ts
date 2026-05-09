import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const { id } = params;
  const { action } = await request.json();

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return apiError("রিজার্ভেশন পাওয়া যায়নি।", 404);

  if (session.role !== "ADMIN" && reservation.userId !== session.userId) {
    return apiError("অনুমোদন নেই।", 403);
  }

  if (action === "cancel") {
    if (reservation.status !== "PENDING") {
      return apiError("শুধু অপেক্ষমাণ রিজার্ভেশন বাতিল করা যায়।", 409);
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return apiResponse(null, "রিজার্ভেশন বাতিল করা হয়েছে।");
  }

  return apiError("অজানা কার্যক্রম।", 400);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  await prisma.reservation.delete({ where: { id: params.id } });
  return apiResponse(null, "মুছে ফেলা হয়েছে।");
}
