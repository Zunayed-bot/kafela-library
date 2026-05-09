import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash("admin123456", 12);
    await prisma.user.create({
      data: {
        name: "System Admin",
        studentId: "ADMIN001",
        phone: "01700000000",
        role: "ADMIN",
        password: hash,
        isActivated: true,
        status: "ACTIVE",
        activatedAt: new Date(),
        membershipTier: "PLATINUM",
        borrowLimit: 10,
      },
    });
    console.log("Admin user created: ADMIN001 / admin123456");
  } else {
    console.log("Admin user already exists.");
  }

  // Sample books
  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    await prisma.book.createMany({
      data: [
        {
          title: "Ar-Raheeq Al-Makhtum",
          titleBangla: "আর-রাহীকুল মাখতুম",
          author: "Safi-ur-Rahman Al-Mubarakpuri",
          authorBangla: "সফিউর রহমান মোবারকপুরী",
          category: "সিরাত",
          language: "বাংলা",
          totalCopies: 5,
          availableCopies: 5,
          shelfNumber: "A-01",
          status: "AVAILABLE",
        },
        {
          title: "Riyadhus Saliheen",
          titleBangla: "রিয়াদুস সালেহীন",
          author: "Imam An-Nawawi",
          authorBangla: "ইমাম নববী",
          category: "হাদিস",
          language: "বাংলা",
          totalCopies: 3,
          availableCopies: 3,
          shelfNumber: "B-02",
          status: "AVAILABLE",
        },
        {
          title: "Tafsir Ibn Kathir",
          titleBangla: "তাফসির ইবনে কাসীর",
          author: "Ibn Kathir",
          authorBangla: "ইবনে কাসীর",
          category: "তাফসির",
          language: "বাংলা",
          totalCopies: 4,
          availableCopies: 4,
          shelfNumber: "C-01",
          status: "AVAILABLE",
        },
        {
          title: "Fiqhus Sunnah",
          titleBangla: "ফিকহুস সুন্নাহ",
          author: "Sayyid Sabiq",
          authorBangla: "সাইয়্যেদ সাবেক",
          category: "ফিকহ ও আইন",
          language: "বাংলা",
          totalCopies: 2,
          availableCopies: 2,
          shelfNumber: "D-03",
          status: "AVAILABLE",
        },
        {
          title: "Ihya Ulum al-Din",
          titleBangla: "ইহইয়া উলুমিদ্দীন",
          author: "Al-Ghazali",
          authorBangla: "ইমাম গাজ্জালী",
          category: "ইসলামি সাহিত্য",
          language: "বাংলা",
          totalCopies: 3,
          availableCopies: 3,
          shelfNumber: "A-05",
          status: "AVAILABLE",
        },
      ],
    });
    console.log("Sample books seeded.");
  } else {
    console.log(`${bookCount} books already exist — skipping.`);
  }

  // System settings
  const settingKeys = [
    { key: "libraryName", value: "কাফেলা গ্রন্থাগার", description: "Library display name" },
    { key: "maxBorrowDays", value: "14", description: "Default borrow period in days" },
    { key: "maxRenewals", value: "2", description: "Maximum renewals per borrowing" },
    { key: "defaultBorrowLimit", value: "3", description: "Default books a user can borrow" },
  ];
  for (const s of settingKeys) {
    await prisma.systemSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("System settings upserted.");

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
