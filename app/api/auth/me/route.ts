import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, studentId: true, phone: true, email: true,
      department: true, session: true, profilePicture: true, role: true,
      status: true, membershipTier: true, borrowLimit: true, isActivated: true,
      activatedAt: true, createdAt: true,
      _count: {
        select: {
          borrowings: true,
          reservations: { where: { status: "PENDING" } },
        },
      },
    },
  });

  if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);

  const activeBorrowings = await prisma.borrowing.count({
    where: { userId: session.userId, status: { in: ["ACTIVE", "OVERDUE"] } },
  });

  return apiResponse({ ...user, activeBorrowings });
}
