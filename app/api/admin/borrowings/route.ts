import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Number(searchParams.get("limit") || 15));
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // Auto-mark overdue
  await prisma.borrowing.updateMany({
    where: { status: "ACTIVE", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { user: { name: { contains: search } } },
      { user: { studentId: { contains: search } } },
      { book: { title: { contains: search } } },
      { book: { titleBangla: { contains: search } } },
    ];
  }

  const [borrowings, total] = await Promise.all([
    prisma.borrowing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, studentId: true, profilePicture: true } },
        book: { select: { id: true, title: true, titleBangla: true, author: true, coverImage: true, shelfNumber: true } },
      },
      orderBy: { issuedDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.borrowing.count({ where }),
  ]);

  return apiResponse({ borrowings, total, page, totalPages: Math.ceil(total / limit) });
}
