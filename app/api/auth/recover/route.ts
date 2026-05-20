import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createDecipheriv, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || "fallback-secret-change-in-production-32chars";
  return createHash("sha256").update(secret).digest();
}

function decryptKey(stored: string): string | null {
  try {
    const key = getEncryptionKey();
    const [ivHex, encHex] = stored.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encHex, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, recoveryKey, newPassword } = body;

    if (!email || !recoveryKey || !newPassword) {
      return apiError("সকল ক্ষেত্র পূরণ করুন।", 400);
    }

    if (newPassword.length < 8) {
      return apiError("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, role: true, name: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return apiError("অ্যাকাউন্ট পাওয়া যায়নি।", 404);
    }

    const activeKey = await prisma.adminRecoveryKey.findFirst({
      where: { userId: user.id, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!activeKey) {
      return apiError("কোনো সক্রিয় রিকভারি কী পাওয়া যায়নি। সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।", 404);
    }

    const storedPlaintext = decryptKey(activeKey.keyEncrypted);
    if (!storedPlaintext || storedPlaintext !== recoveryKey.trim()) {
      return apiError("রিকভারি কী সঠিক নয়।", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, mustChangePassword: false },
      }),
      prisma.adminRecoveryKey.update({
        where: { id: activeKey.id },
        data: { used: true, usedAt: new Date() },
      }),
    ]);

    try {
      await prisma.auditLog.create({
        data: {
          action: "ACCOUNT_RECOVERED",
          entity: "User",
          entityId: user.id,
          details: JSON.stringify({ name: user.name }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });
    } catch { /* non-fatal */ }

    return apiResponse(null, "অ্যাকাউন্ট পুনরুদ্ধার সফল। নতুন পাসওয়ার্ড দিয়ে লগিন করুন।");
  } catch (err) {
    console.error("[RECOVER]", err);
    return apiError("অ্যাকাউন্ট পুনরুদ্ধার ব্যর্থ।", 500);
  }
}
