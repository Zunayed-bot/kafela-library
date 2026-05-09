import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  if (session.role !== "ADMIN" && session.userId !== params.id) {
    return apiError("অনুমোদন নেই।", 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, studentId: true, phone: true, email: true,
      department: true, session: true, profilePicture: true, role: true,
      status: true, membershipTier: true, borrowLimit: true, isActivated: true,
      activatedAt: true, createdAt: true,
      borrowings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { book: { select: { title: true, author: true, coverImage: true } } },
      },
      reservations: {
        where: { status: "PENDING" },
        include: { book: { select: { title: true, author: true } } },
      },
    },
  });

  if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);
  return apiResponse(user);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const body = await request.json();

    // Admin-only fields
    if (session.role === "ADMIN") {
      const { name, studentId, phone, email, department, session: studentSession,
        borrowLimit, membershipTier, status, role } = body;

      const user = await prisma.user.update({
        where: { id: params.id },
        data: {
          name, studentId, phone, email, department,
          session: studentSession,
          borrowLimit: borrowLimit ? parseInt(borrowLimit) : undefined,
          membershipTier, status, role,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "USER_UPDATED",
          entity: "User",
          entityId: params.id,
          adminId: session.userId,
          details: JSON.stringify({ changes: Object.keys(body) }),
        },
      });

      return apiResponse(user, "ব্যবহারকারী আপডেট করা হয়েছে।");
    }

    // User can only update profile picture and password
    if (session.userId !== params.id) return apiError("অনুমোদন নেই।", 403);

    const { profilePicture, currentPassword, newPassword } = body;

    const updateData: Record<string, unknown> = {};

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    if (newPassword) {
      if (!currentPassword) return apiError("বর্তমান পাসওয়ার্ড দিতে হবে।", 400);
      const user = await prisma.user.findUnique({ where: { id: params.id }, select: { password: true } });
      if (!user?.password) return apiError("পাসওয়ার্ড পাওয়া যায়নি।", 400);
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return apiError("বর্তমান পাসওয়ার্ড সঠিক নয়।", 400);
      if (newPassword.length < 8) return apiError("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);
      updateData.password = await bcrypt.hash(newPassword, 12);

      await prisma.auditLog.create({
        data: {
          action: "PASSWORD_CHANGED",
          entity: "User",
          entityId: params.id,
          userId: session.userId,
        },
      });
    }

    if (Object.keys(updateData).length === 0) return apiError("কোনো পরিবর্তন পাওয়া যায়নি।", 400);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, profilePicture: true, studentId: true },
    });

    return apiResponse(updated, "প্রোফাইল আপডেট করা হয়েছে।");
  } catch (err) {
    console.error("[USER PUT]", err);
    return apiError("আপডেট ব্যর্থ হয়েছে।", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  const activeBorrowings = await prisma.borrowing.count({
    where: { userId: params.id, status: { in: ["ACTIVE", "OVERDUE"] } },
  });

  if (activeBorrowings > 0) {
    return apiError("এই সদস্যের ধার করা বই রয়েছে। মুছতে পারবেন না।", 409);
  }

  await prisma.user.delete({ where: { id: params.id } });

  return apiResponse(null, "সদস্য মুছে ফেলা হয়েছে।");
}
