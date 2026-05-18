import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalBooks, totalUsers, totalCategories, totalBorrowings] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
      prisma.category.count(),
      prisma.borrowing.count({ where: { status: "RETURNED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { totalBooks, totalUsers, totalCategories, totalBorrowings },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { totalBooks: 0, totalUsers: 0, totalCategories: 0, totalBorrowings: 0 },
    });
  }
}
