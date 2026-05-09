import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, password } = body;

    if (!studentId || !password) {
      return apiError("ছাত্র আইডি ও পাসওয়ার্ড আবশ্যক।", 400);
    }

    const user = await prisma.user.findUnique({
      where: { studentId },
      select: {
        id: true, name: true, studentId: true, phone: true,
        password: true, role: true, status: true, isActivated: true,
      },
    });

    if (!user) {
      return apiError("ছাত্র আইডি বা পাসওয়ার্ড সঠিক নয়।", 401);
    }

    if (!user.isActivated || !user.password) {
      return apiError("অ্যাকাউন্ট সক্রিয় করা হয়নি। প্রথমে সক্রিয় করুন।", 403);
    }

    if (user.status === "SUSPENDED") {
      return apiError("আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।", 403);
    }

    if (user.status === "INACTIVE") {
      return apiError("আপনার অ্যাকাউন্ট নিষ্ক্রিয়। অ্যাডমিনের সাথে যোগাযোগ করুন।", 403);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return apiError("ছাত্র আইডি বা পাসওয়ার্ড সঠিক নয়।", 401);
    }

    const token = await signToken({
      userId: user.id,
      role: user.role,
      studentId: user.studentId,
      name: user.name,
    });

    setAuthCookie(token);

    await prisma.auditLog.create({
      data: {
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        details: JSON.stringify({ studentId: user.studentId }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return apiResponse(
      { role: user.role, name: user.name, studentId: user.studentId },
      "লগিন সফল।"
    );
  } catch (err) {
    console.error("[LOGIN]", err);
    return apiError("সার্ভার ত্রুটি। পরে আবার চেষ্টা করুন।", 500);
  }
}
