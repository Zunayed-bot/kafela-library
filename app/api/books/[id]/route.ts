import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const book = await prisma.book.findUnique({
    where: { id: params.id },
  });

  if (!book) return apiError("বই পাওয়া যায়নি।", 404);

  const activeBorrowings = await prisma.borrowing.count({
    where: { bookId: params.id, status: { in: ["ACTIVE", "OVERDUE"] } },
  });

  const queueCount = await prisma.reservation.count({
    where: { bookId: params.id, status: "PENDING" },
  });

  return apiResponse({ ...book, activeBorrowings, queueCount });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  try {
    const body = await request.json();
    const {
      title, titleBangla, author, authorBangla, publisher, publishedYear,
      isbn, category, description, coverImage, totalCopies, shelfNumber,
      price, language, status,
    } = body;

    const existing = await prisma.book.findUnique({
      where: { id: params.id },
      select: { totalCopies: true, availableCopies: true },
    });

    if (!existing) return apiError("বই পাওয়া যায়নি।", 404);

    const newTotal = totalCopies ? parseInt(totalCopies) : existing.totalCopies;
    const diff = newTotal - existing.totalCopies;
    const newAvailable = Math.max(0, existing.availableCopies + diff);

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        title, titleBangla, author, authorBangla, publisher,
        publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
        isbn, category, description, coverImage,
        totalCopies: newTotal, availableCopies: newAvailable,
        shelfNumber, price: price ? parseFloat(price) : undefined,
        language,
        status: newAvailable === 0 ? "ALL_ISSUED" : status || "AVAILABLE",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "BOOK_UPDATED",
        entity: "Book",
        entityId: params.id,
        adminId: session.userId,
        details: JSON.stringify({ title, author }),
      },
    });

    return apiResponse(book, "বই আপডেট করা হয়েছে।");
  } catch (err) {
    console.error("[BOOK PUT]", err);
    return apiError("আপডেট ব্যর্থ হয়েছে।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  const activeBorrowings = await prisma.borrowing.count({
    where: { bookId: params.id, status: { in: ["ACTIVE", "OVERDUE"] } },
  });

  if (activeBorrowings > 0) {
    return apiError("এই বই বর্তমানে ধার দেওয়া আছে। মুছতে পারবেন না।", 409);
  }

  const book = await prisma.book.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!book) return apiError("বই পাওয়া যায়নি।", 404);

  await prisma.book.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      action: "BOOK_DELETED",
      entity: "Book",
      entityId: params.id,
      adminId: session.userId,
      details: JSON.stringify({ title: book.title }),
    },
  });

  return apiResponse(null, "বই সফলভাবে মুছে ফেলা হয়েছে।");
}
