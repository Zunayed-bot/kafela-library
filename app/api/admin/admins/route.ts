import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: {
      id: true, name: true, email: true, studentId: true,
      role: true, status: true, mustChangePassword: true, createdAt: true,
      recoveryKeys: {
        where: { used: false },
        select: { id: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiResponse(admins);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "SUPER_ADMIN") return apiError("Forbidden", 403);

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name?.trim()) return apiError("নাম আবশ্যক।", 400);
    if (!email?.trim() || !email.includes("@")) return apiError("বৈধ ইমেইল আবশ্যক।", 400);
    if (!password || password.length < 8) return apiError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।", 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError("এই ইমেইল ইতিমধ্যে ব্যবহৃত।", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const adminStudentId = `ADM-${nanoid(8)}`;

    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        studentId: adminStudentId,
        phone: `ADM-${nanoid(6)}`,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        isActivated: true,
        mustChangePassword: true,
      },
      select: {
        id: true, name: true, email: true, studentId: true, role: true,
        status: true, mustChangePassword: true, createdAt: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "ADMIN_CREATED",
          entity: "User",
          entityId: admin.id,
          adminId: session.userId,
          details: JSON.stringify({ name: admin.name, email: admin.email }),
        },
      });
    } catch { /* non-fatal */ }

    return apiResponse(admin, "অ্যাডমিন তৈরি হয়েছে।", 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") return apiError("এই তথ্য ইতিমধ্যে বিদ্যমান।", 409);
    console.error("[ADMIN CREATE]", err);
    return apiError("অ্যাডমিন তৈরি ব্যর্থ।", 500);
  }
}
