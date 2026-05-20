import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionFromRequest } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function detectImageExtFromBuffer(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "webp";
  if (buf.length > 11 && buf.slice(4, 8).toString("ascii") === "ftyp") return "heic";
  return null;
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return apiError("অনুমোদন নেই।", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const typeParam = (formData.get("type") as string) || "profile";

    if (!file) return apiError("ফাইল পাওয়া যায়নি।", 400);
    if (!file.type.startsWith("image/")) return apiError("শুধুমাত্র ছবি ফাইল আপলোড করা যাবে।", 400);
    if (file.size > MAX_SIZE) return apiError("ফাইলের সাইজ সর্বোচ্চ ৫ MB হতে পারবে।", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!detectImageExtFromBuffer(buffer)) return apiError("ফাইলটি বৈধ ছবি নয়।", 400);

    const folder = typeParam === "profile" ? "kafela/profiles" : typeParam === "book" ? "kafela/books" : "kafela/misc";

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return apiResponse({ url: result.secure_url }, "ফাইল সফলভাবে আপলোড হয়েছে।", 201);
  } catch (err) {
    console.error("[UPLOAD]", err);
    return apiError("আপলোড ব্যর্থ হয়েছে।", 500);
  }
}
