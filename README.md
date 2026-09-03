# 🌾 AgriBridge AI

> **An AI-powered commerce agent that helps Indian farmers make better selling decisions and complete transactions.**

Built for the **Razorpay Buildathon — Track 5 (Open Track)**.

---

## 🎯 Problem Statement

Indian farmers lose 15-25% of potential income due to:
- **Information asymmetry** — Farmers don't know who's buying at the best prices
- **Price opacity** — No transparent way to compare buyers in real-time
- **Transaction friction** — Payments are slow, unreliable, and hard to track
- **Decision complexity** — Choosing between multiple buyers with different terms is overwhelming

## 💡 Solution

AgriBridge AI is a **commerce agent** (not a chatbot) that:
1. **Matches** farmers with verified buyers using a deterministic scoring algorithm
2. **Compares** offers side-by-side with revenue projections
3. **Recommends** the best buyer with transparent AI reasoning
4. **Processes** secure payments via Razorpay Payment Links (Test Mode)
5. **Communicates** in Hindi/Hinglish for real accessibility

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Recharts |
| Backend | Next.js API Routes, Prisma ORM |
| Database | SQLite (development) / PostgreSQL (production) |
| Payments | Razorpay Payment Links API (Test Mode) |
| AI | Deterministic matching engine + intent-based fallback |
| UI Components | Radix UI + shadcn/ui |

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up database and seed demo data
npm run db:reset

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Try Demo"**.

### Optional: Razorpay Test Mode

To enable real Razorpay payment links, create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_your_key_here"
RAZORPAY_KEY_SECRET="your_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

Without Razorpay credentials, the app runs in **demo mode** with simulated payment flows.

## 🧑‍🌾 Demo Walkthrough

The app comes pre-seeded with a demo farmer:

- **Farmer:** Ramesh Kumar, Sehore, Madhya Pradesh
- **Farm:** 5 acres
- **Active Listing:** 80 quintals Wheat (Sharbati, Grade A) at ₹2,300/qtl minimum
- **Buyers:** 8 verified buyers across MP with 11 active offers

### Demo Flow

1. **Landing → Dashboard** — See your farm metrics and AI opportunity score
2. **Buyer Marketplace** — Browse 8 buyers, click "Run AI Match" to score them
3. **AI Agent Chat** — Ask "sabse best buyer kaun hai?" or "compare buyers"
4. **Orders** — Accept a recommendation → order is created automatically
5. **Payment** — Create Razorpay payment link (demo mode or real test mode)
6. **Analytics** — View revenue charts and transaction history

## 🧠 AI Matching Algorithm

The deterministic matching engine scores buyers on 6 weighted factors:

| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Price | 40% | How close to or above farmer's minimum price |
| Quantity | 20% | Whether buyer can absorb the full quantity |
| Quality | 15% | Grade compatibility (A, A/B, etc.) |
| Payment Speed | 10% | Hours until payment (24h > 48h > 72h) |
| Distance | 10% | Proximity based on district-level estimation |
| Deadline | 5% | Whether delivery fits the selling window |

## 💳 Razorpay Integration

- **Payment Links API** — Creates payment links for each order
- **Webhook Verification** — HMAC-SHA256 signature validation
- **Idempotent** — Duplicate payments are safely handled
- **Demo Fallback** — Works without API keys for hackathon demos

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app routes
│   │   ├── dashboard/  # Farm metrics + AI recommendations
│   │   ├── produce/    # Manage crop listings
│   │   ├── buyers/     # Buyer marketplace + comparison
│   │   ├── agent/      # AI chat interface (Hindi/English)
│   │   ├── orders/     # Order management + tracking
│   │   ├── transactions/# Payment history
│   │   ├── analytics/  # Revenue charts (Recharts)
│   │   ├── activity/   # AI decision transparency log
│   │   └── profile/    # Farmer profile
│   ├── api/            # 13 API routes
│   └── page.tsx        # Landing page
├── components/
│   ├── ui/             # 13 shadcn/ui components
│   └── layout/         # Sidebar, Header, AppLayout
├── lib/
│   ├── matching.ts     # Buyer scoring algorithm
│   ├── financial.ts    # Integer arithmetic (paise-safe)
│   ├── validation.ts   # Zod schemas
│   ├── prisma.ts       # Singleton Prisma client
│   └── utils.ts        # Utility functions
prisma/
├── schema.prisma       # 14 models
└── seed.ts             # Demo data (Ramesh Kumar)
```

## 📊 Key Metrics

- **14 database models** with proper relations
- **13 API routes** with validation and error handling
- **12 frontend pages** with loading/error/empty states
- **6-factor matching algorithm** with transparent scoring
- **Hindi/Hinglish AI** with 10+ intent types
- **Full Razorpay integration** with webhook support

---

Built with ❤️ for Indian farmers.
