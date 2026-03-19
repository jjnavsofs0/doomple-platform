#!/bin/bash
# Doomple Platform - Quick Setup Script
# Run this on your local machine after cloning

set -e

echo "🚀 Doomple Platform Setup"
echo "========================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
  echo "⚠️  Please edit .env with your database URL and Razorpay keys!"
else
  echo "✅ .env already exists"
fi

echo ""
echo "🗄️  Setting up database..."
echo "Make sure PostgreSQL is running and DATABASE_URL in .env is correct."
read -p "Press Enter to continue with database setup (or Ctrl+C to set up .env first)..."

npx prisma generate
npx prisma migrate dev --name init
echo ""
echo "🌱 Seeding database with demo data..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "Run the development server:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  Public Site:    http://localhost:3000"
echo "  Admin Portal:   http://localhost:3000/admin"
echo "  Client Portal:  http://localhost:3000/portal"
echo "  Login:          http://localhost:3000/login"
echo ""
echo "Login as Super Admin:"
echo "  Email:    sneha@doomple.com"
echo "  Password: Doomple@2026"
