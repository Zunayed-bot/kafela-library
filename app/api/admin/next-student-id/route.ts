import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) return apiError("Unauthorized", 403);

  const year = new Date().getFullYear().toString().slice(-2); // e.g. "26"

  // Find all USER studentIds starting with this year prefix that match the 6-digit format
  const existing = await prisma.user.findMany({
    where: { role: "USER", studentId: { startsWith: year } },
    select: { studentId: true },
  });

  let maxSeq = 0;
  for (const { studentId } of existing) {
    if (/^\d{6}$/.test(studentId)) {
      const seq = parseInt(studentId.slice(2));
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }

  const nextId = `${year}${String(maxSeq + 1).padStart(4, "0")}`;
  return apiResponse({ studentId: nextId });
}
