import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production-32chars"
);

async function signActivationToken(userId: string): Promise<string> {
  return new SignJWT({ userId, purpose: "activate" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);
}

async function verifyActivationToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "activate" || !payload.userId) return null;
    return payload.userId as string;
  } catch {
    return null;
  }
}

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
        where: { studentId, phone: phone.trim() },
        select: { id: true, name: true, status: true, isActivated: true },
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

      const activationToken = await signActivationToken(user.id);
      return apiResponse({ activationToken, name: user.name }, "পরিচয় নিশ্চিত হয়েছে।");
    }

    if (step === "setPassword") {
      const { activationToken, password } = body;
      if (!activationToken || !password) {
        return apiError("তথ্য অসম্পূর্ণ।", 400);
      }

      if (password.length < 8) {
        return apiError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);
      }

      const userId = await verifyActivationToken(activationToken);
      if (!userId) {
        return apiError("যাচাইয়ের মেয়াদ শেষ। আবার শুরু করুন।", 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActivated: true, status: true },
      });

      if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি।", 404);
      if (user.isActivated) return apiError("অ্যাকাউন্ট ইতিমধ্যে সক্রিয় আছে।", 409);

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

      try {
        await prisma.auditLog.create({
          data: { action: "ACCOUNT_ACTIVATED", entity: "User", entityId: userId, userId },
        });
      } catch { /* non-fatal */ }

      return apiResponse(null, "অ্যাকাউন্ট সফলভাবে সক্রিয় হয়েছে।");
    }

    return apiError("অবৈধ অনুরোধ।", 400);
  } catch (err) {
    console.error("[ACTIVATE]", err);
    return apiError("সার্ভার ত্রুটি।", 500);
  }
}
