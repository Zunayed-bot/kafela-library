import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leaders = await prisma.leadership.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: leaders });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
