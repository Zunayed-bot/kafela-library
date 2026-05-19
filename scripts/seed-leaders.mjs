import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const leaders = [
  {
    name: "মুফতী খালেদ সাইফুল্লাহ",
    role: "প্রধান উপদেষ্টা",
    description: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
    profileUrl: "https://www.facebook.com",
    order: 0,
    isActive: true,
  },
  {
    name: "মুফতী আহমাদ মাসউদ",
    role: "উপদেষ্টা ও প্রধান দিক নির্দেশক",
    description: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
    profileUrl: "https://www.facebook.com",
    order: 1,
    isActive: true,
  },
  {
    name: "মুফতী ওয়াসিফ আরাফ",
    role: "উপদেষ্টা ও তত্ত্বাবধায়ক",
    description: "সিদ্দীকে আকবার রাযি. ছাত্র কাফেলা",
    profileUrl: "https://www.facebook.com",
    order: 2,
    isActive: true,
  },
];

async function main() {
  // Clear existing leaders
  await prisma.leadership.deleteMany();
  for (const l of leaders) {
    await prisma.leadership.create({ data: l });
  }
  console.log("Seeded 3 leaders.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
