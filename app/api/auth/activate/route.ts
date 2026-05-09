import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step } = body;

    if (step === "verify") {
      const { studentId, phone } = body;
      if (!studentId || !phone) {
        return apiError("ছাত্র আইডি ও ফোন নম্বর আবশ্যক।", 400);
      }

      const user = await prisma.user.findFirst({
        where: {
          studentId,
          phone: phone.trim(),
        },
        select: { id: true, name: true, status: true, isActivated: true, studentId: true },
      });

      if (!user) {
        return apiError("ছাত্র আইডি বা ফোন নম্বর মিলছে না। অ্যাডমিনের সাথে যোগাযোগ করুন।", 404);
      }

      if (user.isActivated) {
        return apiError("এই অ্যাকাউন্ট ইতিমধ্যে সক্রিয় আছে। লগিন করুন।", 409);
      }

      if (user.status === "SUSPENDED") {
        return apiError("আপনার অ্যাকাউন্ট স্থগিত আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।", 403);
      }

      return apiResponse({ userId: user.id, name: user.name }, "পরিচয় নিশ্চিত হয়েছে।");
    }

    if (step === "setPassword") {
      const { userId, password } = body;
      if (!userId || !password) {
        return apiError("তথ্য অসম্পূর্ণ।", 400);
      }

      if (password.length < 8) {
        return apiError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActivated: true, status: true },
      });

      if (!user) {
        return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);
      }

      if (user.isActivated) {
        return apiError("অ্যাকাউন্ট ইতিমধ্যে সক্রিয় আছে।", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          isActivated: true,
          activatedAt: new Date(),
          status: "ACTIVE",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "ACCOUNT_ACTIVATED",
          entity: "User",
          entityId: userId,
          userId,
        },
      });

      return apiResponse(null, "অ্যাকাউন্ট সফলভাবে সক্রিয় হয়েছে।");
    }

    return apiError("অবৈধ অনুরোধ।", 400);
  } catch (err) {
    console.error("[ACTIVATE]", err);
    return apiError("সার্ভার ত্রুটি।", 500);
  }
}
