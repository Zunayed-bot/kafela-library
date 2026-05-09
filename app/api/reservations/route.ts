import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const where: Record<string, unknown> = {};
  if (session.role !== "ADMIN") where.userId = session.userId;

  const limit = Math.min(100, Number(new URL(request.url).searchParams.get("limit") || 50));

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { requestedAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, studentId: true } },
      book: { select: { id: true, title: true, titleBangla: true, author: true, authorBangla: true, coverImage: true, availableCopies: true } },
    },
  });

  return apiResponse({ reservations, total: reservations.length });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const { bookId } = await request.json();
    if (!bookId) return apiError("বইয়ের তথ্য আবশ্যক।", 400);

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, availableCopies: true },
    });

    if (!book) return apiError("বই পাওয়া যায়নি।", 404);
    if (book.availableCopies > 0) return apiError("বই এখন পাওয়া যাচ্ছে। সরাসরি ধার নিন।", 409);

    const existing = await prisma.reservation.findFirst({
      where: { userId: session.userId, bookId, status: "PENDING" },
    });
    if (existing) return apiError("আপনি ইতিমধ্যে এই বই রিজার্ভ করেছেন।", 409);

    const queueCount = await prisma.reservation.count({
      where: { bookId, status: "PENDING" },
    });

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.userId,
        bookId,
        queuePosition: queueCount + 1,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        book: { select: { title: true, author: true } },
      },
    });

    return apiResponse(reservation, `রিজার্ভেশন সফল। আপনি ${queueCount + 1} নম্বরে আছেন।`, 201);
  } catch (err) {
    console.error("[RESERVATIONS POST]", err);
    return apiError("রিজার্ভেশন ব্যর্থ হয়েছে।", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return apiError("রিজার্ভেশন আইডি আবশ্যক।", 400);

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return apiError("রিজার্ভেশন পাওয়া যায়নি।", 404);

  if (session.role !== "ADMIN" && reservation.userId !== session.userId) {
    return apiError("অনুমোদন নেই।", 403);
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  return apiResponse(null, "রিজার্ভেশন বাতিল করা হয়েছে।");
}
