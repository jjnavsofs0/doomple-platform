# Doomple Platform

Full-stack business platform for [doomple.com](https://doomple.com) — a unified system combining a premium public website, CRM/lead management, client & project management, billing with Razorpay, and a client portal.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies
```bash
cd doomple-platform
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/doomple_dev"
NEXTAUTH_SECRET="generate-a-random-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Visit:
- **Public Website**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin
- **Client Portal**: http://localhost:3000/portal
- **Login**: http://localhost:3000/login

### Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | sneha@doomple.com | Doomple@2026 |
| Sales | sales@doomple.com | Doomple@2026 |
| Project Manager | pm@doomple.com | Doomple@2026 |
| Finance | finance@doomple.com | Doomple@2026 |

## Architecture

```
Next.js 14 (App Router)
├── Public Website    /            (16 pages)
├── Admin Portal      /admin       (21 pages)
├── Client Portal     /portal      (8 pages)
├── API Routes        /api         (21 endpoints)
├── Prisma + PostgreSQL            (25 models)
└── Razorpay Integration           (Orders + Webhooks)
```

## Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (JWT + Credentials)
- **Payments**: Razorpay
- **Validation**: Zod

## Project Structure
```
src/
├── app/
│   ├── (public)/       # Public website pages
│   ├── admin/          # Admin portal pages
│   ├── portal/         # Client portal pages
│   ├── api/            # API routes
│   └── login/          # Login page
├── components/
│   ├── ui/             # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── public/         # Public website sections
│   └── layouts/        # Layout components
├── lib/                # Utilities, auth, Razorpay, validations
├── data/               # Static data (services, solutions, industries)
├── types/              # TypeScript type definitions
└── styles/             # Global CSS
prisma/
├── schema.prisma       # Database schema (25 models)
└── seed.ts             # Seed script with demo data
```

## Key Features

### Public Website
- SEO-optimized pages for all services and solutions
- Dedicated UEP (Unified Education Platform) page
- SaaS Backend Toolkit for Startups page
- Workforce/Productivity solutions marketing page
- Contact form with service/solution selection
- Legal pages (Privacy, Terms, Refund)

### Admin Portal
- Lead management with pipeline stages
- Client management with full profiles
- Project management with milestones (UEP & Toolkit specifics)
- Quotation builder with line items
- Invoice management with Razorpay payment links
- Sales, Projects, Billing, and Management dashboards

### Client Portal
- Project visibility with milestone tracking
- Invoice viewing and Razorpay payment
- Payment history
- Document management
- Profile management

## Contact
Doomple Technologies
H. No.113 Gali No.1, VIKAS NAGAR, Gurgaon, Basai Road, Gurgaon-122001, Haryana
Sneha Sharma | +91-9211698507 | sneha@doomple.com
