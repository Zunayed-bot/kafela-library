import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const tier = searchParams.get("tier") || "";

  const where: Record<string, unknown> = { role: "USER" };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { studentId: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  if (status) where.status = status;
  if (tier) where.membershipTier = tier;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, studentId: true, phone: true, email: true,
        department: true, session: true, profilePicture: true, role: true,
        status: true, membershipTier: true, borrowLimit: true, isActivated: true,
        createdAt: true,
        _count: { select: { borrowings: true, reservations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return apiResponse({ users, total, pages: Math.ceil(total / limit), page, limit });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  try {
    const body = await request.json();
    const { name, studentId, phone, email, department, session: studentSession, borrowLimit, membershipTier } = body;

    if (!name || !studentId || !phone) {
      return apiError("নাম, ছাত্র আইডি ও ফোন নম্বর আবশ্যক।", 400);
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ studentId }, { phone }] },
    });

    if (existing) {
      if (existing.studentId === studentId) return apiError("এই ছাত্র আইডি ইতিমধ্যে নিবন্ধিত।", 409);
      return apiError("এই ফোন নম্বর ইতিমধ্যে ব্যবহার করা হচ্ছে।", 409);
    }

    const user = await prisma.user.create({
      data: {
        name, studentId, phone: phone.trim(),
        email: email || undefined,
        department, session: studentSession,
        borrowLimit: borrowLimit ? parseInt(borrowLimit) : 3,
        membershipTier: membershipTier || "GOLDEN",
        status: "PENDING",
        role: "USER",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        adminId: session.userId,
        details: JSON.stringify({ name, studentId }),
      },
    });

    return apiResponse(user, "শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে।", 201);
  } catch (err) {
    console.error("[USERS POST]", err);
    return apiError("নিবন্ধন ব্যর্থ হয়েছে।", 500);
  }
}
