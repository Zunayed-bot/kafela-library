import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  await prisma.borrowing.updateMany({
    where: { status: "ACTIVE", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalBooks, totalUsers, activeUsers, pendingUsers,
    issuedBooks, overdueBooks, reservations,
    returnedToday, issuedToday,
    recentBorrowings,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "USER", status: "PENDING" } }),
    prisma.borrowing.count({ where: { status: "ACTIVE" } }),
    prisma.borrowing.count({ where: { status: "OVERDUE" } }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.borrowing.count({
      where: { status: "RETURNED", returnedDate: { gte: today, lt: tomorrow } },
    }),
    prisma.borrowing.count({
      where: { issuedDate: { gte: today, lt: tomorrow } },
    }),
    prisma.borrowing.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, studentId: true, profilePicture: true } },
        book: { select: { title: true, author: true, coverImage: true } },
      },
    }),
  ]);

  const availableBooks = await prisma.book.aggregate({
    _sum: { availableCopies: true },
  });

  const categoryStats = await prisma.book.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 8,
  });

  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return prisma.borrowing.count({
        where: { issuedDate: { gte: start, lte: end } },
      }).then((count) => ({
        month: start.toLocaleString("default", { month: "short" }),
        count,
      }));
    })
  );

  return apiResponse({
    totalBooks,
    totalUsers,
    activeUsers,
    pendingUsers,
    issuedBooks,
    overdueBooks,
    reservations,
    returnedToday,
    issuedToday,
    availableBooks: availableBooks._sum.availableCopies || 0,
    recentBorrowings,
    categoryStats,
    monthlyData: monthlyData.reverse(),
  });
}
