import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { titleBangla: { contains: search } },
      { author: { contains: search } },
      { authorBangla: { contains: search } },
      { publisher: { contains: search } },
      { isbn: { contains: search } },
    ];
  }

  if (category) where.category = category;
  if (status) where.status = status;

  const validSortFields = ["title", "author", "createdAt", "availableCopies", "publishedYear"];
  const sortField = validSortFields.includes(sort) ? sort : "createdAt";

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortField]: order },
      select: {
        id: true, title: true, titleBangla: true, author: true, authorBangla: true,
        publisher: true, publishedYear: true, isbn: true, category: true,
        description: true, coverImage: true, totalCopies: true, availableCopies: true,
        shelfNumber: true, price: true, language: true, status: true,
        createdAt: true,
      },
    }),
    prisma.book.count({ where }),
  ]);

  const categories = await prisma.book.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return apiResponse({
    books,
    total,
    pages: Math.ceil(total / limit),
    page,
    limit,
    categories: categories.map((c) => c.category),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") return apiError("অনুমোদন নেই।", 403);

  try {
    const body = await request.json();
    const {
      title, titleBangla, author, authorBangla, publisher, publishedYear,
      isbn, category, description, coverImage, totalCopies, shelfNumber,
      price, language,
    } = body;

    if (!title || !author || !category) {
      return apiError("বইয়ের নাম, লেখক ও বিভাগ আবশ্যক।", 400);
    }

    const copies = parseInt(totalCopies) || 1;

    const book = await prisma.book.create({
      data: {
        title, titleBangla, author, authorBangla, publisher,
        publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
        isbn, category, description, coverImage,
        totalCopies: copies, availableCopies: copies,
        shelfNumber, price: price ? parseFloat(price) : undefined,
        language: language || "বাংলা",
        status: "AVAILABLE",
        addedById: session.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "BOOK_ADDED",
        entity: "Book",
        entityId: book.id,
        adminId: session.userId,
        details: JSON.stringify({ title, author }),
      },
    });

    return apiResponse(book, "বই সফলভাবে যোগ করা হয়েছে।", 201);
  } catch (err) {
    console.error("[BOOKS POST]", err);
    return apiError("বই যোগ করতে ব্যর্থ হয়েছে।", 500);
  }
}
