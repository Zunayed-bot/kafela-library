import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const programs = await prisma.programEvent.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        videos: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json({ success: true, data: programs });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
