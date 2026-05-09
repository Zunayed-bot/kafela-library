import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError, calculateDueDate } from "@/lib/utils";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const body = await request.json();
    const { action } = body;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: params.id },
      include: { book: { select: { id: true, title: true, availableCopies: true, totalCopies: true } } },
    });

    if (!borrowing) return apiError("ধার রেকর্ড পাওয়া যায়নি।", 404);

    // Only admin or the owner can act
    if (session.role !== "ADMIN" && session.userId !== borrowing.userId) {
      return apiError("অনুমোদন নেই।", 403);
    }

    if (action === "return") {
      if (session.role !== "ADMIN") return apiError("শুধুমাত্র অ্যাডমিন বই ফেরত নিতে পারবেন।", 403);

      if (borrowing.status === "RETURNED") return apiError("বই ইতিমধ্যে ফেরত দেওয়া হয়েছে।", 409);

      const [updated] = await prisma.$transaction([
        prisma.borrowing.update({
          where: { id: params.id },
          data: {
            status: "RETURNED",
            returnedDate: new Date(),
            returnedById: session.userId,
          },
          include: {
            user: { select: { name: true, studentId: true } },
            book: { select: { title: true } },
          },
        }),
        prisma.book.update({
          where: { id: borrowing.bookId },
          data: {
            availableCopies: { increment: 1 },
            status: "AVAILABLE",
          },
        }),
      ]);

      // Check if any reservations waiting
      const nextReservation = await prisma.reservation.findFirst({
        where: { bookId: borrowing.bookId, status: "PENDING" },
        orderBy: { queuePosition: "asc" },
      });

      if (nextReservation) {
        // Notify next in queue (implement notification system here)
        await prisma.auditLog.create({
          data: {
            action: "RESERVATION_READY",
            entity: "Reservation",
            entityId: nextReservation.id,
            adminId: session.userId,
            details: JSON.stringify({ bookId: borrowing.bookId, userId: nextReservation.userId }),
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "BOOK_RETURNED",
          entity: "Borrowing",
          entityId: params.id,
          userId: borrowing.userId,
          adminId: session.userId,
          details: JSON.stringify({ bookId: borrowing.bookId, title: borrowing.book.title }),
        },
      });

      return apiResponse(updated, "বই সফলভাবে ফেরত নেওয়া হয়েছে।");
    }

    if (action === "renew") {
      if (borrowing.status === "RETURNED") return apiError("ফেরত দেওয়া বই নবায়ন করা যাবে না।", 409);
      if (borrowing.renewCount >= borrowing.maxRenewals) {
        return apiError(`নবায়ন সীমা শেষ। সর্বোচ্চ ${borrowing.maxRenewals} বার নবায়ন করা যায়।`, 409);
      }

      const newDueDate = calculateDueDate(14);

      const updated = await prisma.borrowing.update({
        where: { id: params.id },
        data: {
          dueDate: newDueDate,
          renewCount: { increment: 1 },
          status: "ACTIVE",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "BORROWING_RENEWED",
          entity: "Borrowing",
          entityId: params.id,
          userId: session.userId,
          details: JSON.stringify({ newDueDate }),
        },
      });

      return apiResponse(updated, "ধারের মেয়াদ নবায়ন হয়েছে।");
    }

    return apiError("অবৈধ কার্যক্রম।", 400);
  } catch (err) {
    console.error("[BORROWING PATCH]", err);
    return apiError("প্রক্রিয়া ব্যর্থ হয়েছে।", 500);
  }
}
