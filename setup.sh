#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     কাফেলা গ্রন্থাগার — Setup       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Install deps
echo "▶ Installing dependencies..."
npm install --legacy-peer-deps

# 2. Generate Prisma client
echo ""
echo "▶ Generating Prisma client..."
npx prisma generate

# 3. Push schema to SQLite
echo ""
echo "▶ Setting up database..."
npx prisma db push

# 4. Seed
echo ""
echo "▶ Seeding database..."
npm run db:seed

# 5. Done
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup complete!                                      ║"
echo "║                                                          ║"
echo "║  Admin login:                                            ║"
echo "║    Student ID : ADMIN001                                 ║"
echo "║    Password   : admin123456                              ║"
echo "║                                                          ║"
echo "║  Starting dev server at http://localhost:3000 ...        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

npm run dev
