import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, clearAuthCookie } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return apiError("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, password: true, mustChangePassword: true },
    });

    if (!user || !user.password) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);

    if (!user.mustChangePassword) {
      // Regular password change: require old password
      if (!oldPassword) return apiError("পুরানো পাসওয়ার্ড আবশ্যক।", 400);
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return apiError("পুরানো পাসওয়ার্ড সঠিক নয়।", 401);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, mustChangePassword: false },
    });

    clearAuthCookie();

    try {
      await prisma.auditLog.create({
        data: {
          action: "PASSWORD_CHANGED",
          entity: "User",
          entityId: user.id,
          userId: user.id,
          details: JSON.stringify({ forced: user.mustChangePassword }),
        },
      });
    } catch { /* non-fatal */ }

    return apiResponse(null, "পাসওয়ার্ড পরিবর্তন সফল। নতুন পাসওয়ার্ড দিয়ে লগিন করুন।");
  } catch (err) {
    console.error("[CHANGE_PASSWORD]", err);
    return apiError("পাসওয়ার্ড পরিবর্তন ব্যর্থ।", 500);
  }
}
