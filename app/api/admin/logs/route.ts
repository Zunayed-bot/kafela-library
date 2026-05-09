import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Number(searchParams.get("limit") || 20));
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "";

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (search) {
    where.OR = [
      { user: { name: { contains: search } } },
      { user: { studentId: { contains: search } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, studentId: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return apiResponse({ logs, total, page, totalPages: Math.ceil(total / limit) });
}
