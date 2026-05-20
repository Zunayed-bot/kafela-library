import { NextRequest } from "next/server";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || "fallback-secret-change-in-production-32chars";
  return createHash("sha256").update(secret).digest();
}

function encryptKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
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

function generateRecoveryKey(): string {
  return randomBytes(24).toString("base64url");
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, role: true },
  });

  if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
    return apiError("অ্যাডমিন পাওয়া যায়নি।", 404);
  }

  // Return existing unused key (same key requirement)
  const existingKey = await prisma.adminRecoveryKey.findFirst({
    where: { userId: params.id, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (existingKey) {
    const plaintext = decryptKey(existingKey.keyEncrypted);
    if (!plaintext) return apiError("রিকভারি কী ডিক্রিপ্ট করা যায়নি।", 500);
    return apiResponse({ key: plaintext, isExisting: true, name: target.name });
  }

  // Generate new recovery key
  const key = generateRecoveryKey();
  const encrypted = encryptKey(key);

  await prisma.adminRecoveryKey.create({
    data: {
      userId: params.id,
      keyEncrypted: encrypted,
      createdById: session.userId,
    },
  });

  try {
    await prisma.auditLog.create({
      data: {
        action: "RECOVERY_KEY_GENERATED",
        entity: "User",
        entityId: params.id,
        adminId: session.userId,
        details: JSON.stringify({ name: target.name }),
      },
    });
  } catch { /* non-fatal */ }

  return apiResponse({ key, isExisting: false, name: target.name });
}
