import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { nanoid } from "nanoid";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "profile";

    if (!file) return apiError("ফাইল পাওয়া যায়নি।", 400);
    if (!file.type.startsWith("image/")) {
      return apiError("শুধুমাত্র ছবি ফাইল আপলোড করা যাবে।", 400);
    }
    if (file.size > MAX_SIZE) {
      return apiError("ফাইলের সাইজ সর্বোচ্চ ১০ MB হতে পারবে।", 400);
    }

    const ext = extname(file.name) || ".jpg";
    const filename = `${nanoid(12)}${ext}`;
    const folder = type === "profile" ? "profiles" : type === "book" ? "books" : "misc";
    const uploadDir = join(process.cwd(), "public", "uploads", folder);

    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${folder}/${filename}`;

    return apiResponse({ url }, "ফাইল সফলভাবে আপলোড হয়েছে।", 201);
  } catch (err) {
    console.error("[UPLOAD]", err);
    return apiError("আপলোড ব্যর্থ হয়েছে।", 500);
  }
}
