import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError, calculateDueDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const status = searchParams.get("status") || "";
  const userId = searchParams.get("userId") || "";

  const where: Record<string, unknown> = {};

  if (session.role !== "ADMIN") {
    where.userId = session.userId;
  } else if (userId) {
    where.userId = userId;
  }

  if (status) where.status = status;

  // Auto-mark overdue
  await prisma.borrowing.updateMany({
    where: { status: "ACTIVE", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  const [borrowings, total] = await Promise.all([
    prisma.borrowing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, studentId: true, profilePicture: true } },
        book: { select: { id: true, title: true, author: true, coverImage: true, shelfNumber: true } },
      },
    }),
    prisma.borrowing.count({ where }),
  ]);

  return apiResponse({ borrowings, total, pages: Math.ceil(total / limit), page, limit });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const body = await request.json();
    const { bookId, userId: requestedUserId, borrowDays } = body;

    const targetUserId = session.role === "ADMIN" && requestedUserId ? requestedUserId : session.userId;

    // Check user
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, borrowLimit: true, profilePicture: true, status: true },
    });

    if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);
    if (user.status !== "ACTIVE") return apiError("অ্যাকাউন্ট সক্রিয় নেই।", 403);

    // Profile picture check (skip for admin-issued)
    if (session.role !== "ADMIN" && !user.profilePicture) {
      return apiError("বই নিতে প্রোফাইল ছবি আপলোড করুন।", 403);
    }

    // Active borrowing count
    const activeBorrowings = await prisma.borrowing.count({
      where: { userId: targetUserId, status: { in: ["ACTIVE", "OVERDUE"] } },
    });

    if (activeBorrowings >= user.borrowLimit) {
      return apiError(`সীমা অতিক্রম। আপনি সর্বোচ্চ ${user.borrowLimit}টি বই ধার নিতে পারবেন।`, 409);
    }

    // Check book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, availableCopies: true, status: true },
    });

    if (!book) return apiError("বই পাওয়া যায়নি।", 404);
    if (book.availableCopies <= 0) {
      return apiError("বই পাওয়া যাচ্ছে না। রিজার্ভ করতে পারেন।", 409);
    }

    // Check duplicate active borrowing
    const duplicate = await prisma.borrowing.findFirst({
      where: { userId: targetUserId, bookId, status: { in: ["ACTIVE", "OVERDUE"] } },
    });
    if (duplicate) return apiError("আপনি ইতিমধ্যে এই বই ধার নিয়েছেন।", 409);

    const days = borrowDays ? parseInt(borrowDays) : 14;
    const dueDate = calculateDueDate(days);

    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          userId: targetUserId,
          bookId,
          dueDate,
          issuedById: session.userId,
          status: "ACTIVE",
        },
        include: {
          user: { select: { name: true, studentId: true } },
          book: { select: { title: true, author: true } },
        },
      }),
      prisma.book.update({
        where: { id: bookId },
        data: {
          availableCopies: { decrement: 1 },
          status: book.availableCopies - 1 === 0 ? "ALL_ISSUED" : "AVAILABLE",
        },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "BOOK_ISSUED",
        entity: "Borrowing",
        entityId: borrowing.id,
        userId: targetUserId,
        adminId: session.role === "ADMIN" ? session.userId : undefined,
        details: JSON.stringify({ bookId, title: book.title, dueDate }),
      },
    });

    return apiResponse(borrowing, "বই সফলভাবে ধার দেওয়া হয়েছে।", 201);
  } catch (err) {
    console.error("[BORROWINGS POST]", err);
    return apiError("ধার প্রক্রিয়া ব্যর্থ হয়েছে।", 500);
  }
}
