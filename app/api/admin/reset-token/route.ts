import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError, generateOTP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  try {
    const { userId } = await request.json();
    if (!userId) return apiError("ব্যবহারকারী আইডি আবশ্যক।", 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, studentId: true },
    });
    if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    const token = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId, token, expiresAt, createdById: session.userId },
    });

    await prisma.auditLog.create({
      data: {
        action: "RESET_TOKEN_GENERATED",
        entity: "PasswordResetToken",
        userId,
        adminId: session.userId,
        details: JSON.stringify({ studentId: user.studentId }),
      },
    });

    return apiResponse({ token, expiresAt, userName: user.name }, "রিসেট টোকেন তৈরি হয়েছে।");
  } catch (err) {
    console.error("[RESET TOKEN]", err);
    return apiError("টোকেন তৈরি ব্যর্থ হয়েছে।", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) return apiError("টোকেন ও নতুন পাসওয়ার্ড আবশ্যক।", 400);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!resetToken) return apiError("টোকেন বৈধ নয়।", 400);
    if (resetToken.used) return apiError("টোকেন ইতিমধ্যে ব্যবহার করা হয়েছে।", 400);
    if (resetToken.expiresAt < new Date()) return apiError("টোকেনের মেয়াদ শেষ।", 400);

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: resetToken.userId,
        userId: resetToken.userId,
      },
    });

    return apiResponse(null, "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে।");
  } catch (err) {
    console.error("[RESET TOKEN PUT]", err);
    return apiError("পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।", 500);
  }
}
