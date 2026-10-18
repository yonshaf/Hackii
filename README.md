# EventScout — AI-Powered Technical Event Discovery Platform

> **Discover your next opportunity.** Aggregating hackathons, technical workshops, developer conferences, and coding competitions with live web extraction.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TinyFish API](https://img.shields.io/badge/TinyFish-Agent%20API-teal?style=flat)](https://tinyfish.ai/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-14%2F14%20Passing-success?style=flat)](#testing)

---

## ⚡ Overview

**EventScout** is a full-stack, production-quality technical event discovery platform built for developers, students, researchers, and engineers. It continuously discovers, normalizes, deduplicates, and ranks technical opportunities from organizer portals, university schedule boards, and tech communities across the web.

The application follows the design tokens, typography, 8px rhythm, pill geometry, flat 0px product cards, and editorial layouts specified in [`design.md`](./design.md).

---

## 🚀 Key Features

### 1. Autonomous Web Extraction with TinyFish
- **Live Goal-Directed Web Agents**: Deploys TinyFish agents (`POST https://agent.tinyfish.ai/v1/automation/run`) to navigate complex websites, parse dynamic JavaScript schedules, and extract structured metadata.
- **Search Engine Discovery**: Queries `https://api.search.tinyfish.ai` for targeted search expressions (`site:`, recency window, location filters).
- **Graceful Fallbacks & Quota Bounding**: Safe concurrency limits and in-memory caching prevent duplicate runs on identical queries.

### 2. Transparent Multi-Factor Relevance Scoring (0–100%)
- **Deterministic Heuristics**: No opaque black-box ML. Scores events using:
  - **Technical tag matches** (+25%)
  - **Favored category** (+15%)
  - **Mode compatibility** (+10%)
  - **City proximity** (+10%)
  - **Budget alignment** (+10%)
  - **Registration deadline urgency** (+10%)
- **Explainable Match Reasons**: Every card displays badges explaining why the opportunity was recommended (e.g. *"Matches your technical interests (React, AI)"*).

### 3. Normalization, Deduplication & Active Filtering
- **Strict Verification Standards**: Normalizes dates into UTC ISO-8601 strings. Unknown participation fees are treated as unknown (`null`), never assumed free.
- **Fingerprint Deduplication**: Merges multi-source postings by title, organizer, and dates, keeping the richest record.
- **Auto-Exclusion**: Filters out events that have already ended or whose cutoffs passed.

### 4. Direct Registration & Provenance Preservation
- **Verified Link Verification**: Provides direct registration links (`rel="noopener noreferrer"`). If a direct form is unavailable, it provides the organizer source with transparent notice.
- **Real-Time Site Verification**: Users can trigger a live check to verify dates and deadlines directly against the organizer's live domain.

### 5. Deadline Reminders & Change Audit Tracking
- **Configurable Cutoff Alerts**: Schedule reminders **7 days**, **3 days**, or **1 day** before registration closes.
- **Change Audit Logs**: Detects changes between crawls (dates, fees, deadlines, venues, links).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, API Route Handlers) |
| **Language** | TypeScript (Strict mode enabled, zero `any` shortcuts in core types) |
| **Styling** | Tailwind CSS with design.md tokens (ink `#111111`, soft-cloud `#f5f5f5`, Bebas Neue display typography) |
| **Icons** | Lucide React |
| **Web Agents & Extraction** | TinyFish Search API & TinyFish Automation Run API |
| **Database & Auth** | Supabase (PostgreSQL with Row Level Security, GIN indexes) |
| **Validation** | Zod runtime schema validation |
| **Testing** | Node.js native test runner (`node --test`) |

---

## 📁 Project Structure

```
├── .env.example                          # Environment variable template
├── .gitignore                            # Secret and dependency exclusion rules
├── package.json                          # Dependencies and npm scripts
├── tsconfig.json                         # TypeScript configuration
├── next.config.mjs                       # Remote image optimization rules
├── tailwind.config.ts                    # Design.md tokens & theme extension
├── design.md                             # Source-of-truth design specification
├── tests/
│   └── eventscout.test.mjs               # 14 unit tests across all 6 core modules
├── supabase/
│   └── migrations/
│       └── 20261019_eventscout_schema.sql # PostgreSQL schema with RLS, triggers & GIN indexes
└── src/
    ├── app/
    │   ├── globals.css                   # Global styling & design.md utility classes
    │   ├── layout.tsx                    # Root layout with Bebas Neue & Inter fonts
    │   ├── page.tsx                      # Landing page with campaign hero & live discovery
    │   ├── explore/page.tsx              # Main catalog with search, filters & sort
    │   ├── events/[slug]/page.tsx        # Event details view with provenance & reminders
    │   ├── saved/page.tsx                # Bookmarks watchlist & active reminders
    │   ├── preferences/page.tsx          # Match weights & preference tuning
    │   ├── dashboard/page.tsx            # Candidate personalized dispatch hub
    │   ├── auth/page.tsx                 # Authentication & guest access
    │   └── api/                          # Server-side API Route Handlers
    ├── components/
    │   ├── layout/                       # UtilityBar, Navbar, Footer
    │   ├── home/                         # HeroCampaign, CategoryTiles, LiveDiscoveryBanner
    │   └── events/                       # EventCard, EventGrid, FilterSidebar, ReminderModal
    └── lib/
        ├── types/                        # EventItem, UserPreferences, EventReminder, Zod schemas
        ├── tinyfish/                     # TinyFish client, search, and agent extraction
        ├── events/                       # Normalization, deduplication, ranking, and audit engine
        ├── supabase/                     # Supabase browser, server, and admin clients
        └── store/                        # Local session bookmark & reminder store
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.17.0+ or v20+ recommended
- **npm**: v9+

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/yonshaf/Hackii.git
cd Hackii
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# TinyFish Web Discovery & Extraction API
TINYFISH_API_KEY=your_tinyfish_api_key_here
TINYFISH_SEARCH_ENDPOINT=https://api.search.tinyfish.ai
TINYFISH_AGENT_ENDPOINT=https://agent.tinyfish.ai/v1/automation/run

# Supabase PostgreSQL & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Demo fallback mode (true by default when Supabase or TinyFish are not configured)
ENABLE_DEMO_DATA=true
```

*(Note: The application includes a rich verified catalog and guest mode, so it works fully out of the box even before API keys are added).*

### 3. Run Automated Unit Tests

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run [`supabase/migrations/20261019_eventscout_schema.sql`](./supabase/migrations/20261019_eventscout_schema.sql).
4. This script configures:
   - Tables: `events`, `profiles`, `user_preferences`, `saved_events`, `reminders`, `event_changes`, `notifications`.
   - Complete Row-Level Security (RLS) policies.
   - GIN indexes for full-text search and array filtering.
   - Unique constraints preventing duplicate event insertions.

---

## 🧪 Testing Coverage

The automated test suite in [`tests/eventscout.test.mjs`](./tests/eventscout.test.mjs) verifies:
- **Normalization**: ISO-8601 formatting, handling unknown fees (never assumed free), mode detection, category mapping.
- **Deduplication**: Fingerprint matching and merging richer event records.
- **Expired Event Exclusion**: Automatic cutoff comparison against reference dates.
- **Transparent Ranking**: Heuristic scoring formula, tag bonuses, and match explanations.
- **Change Detection**: Audit tracking on dates, registration URLs, venues, and fees.
- **Deadline Reminders**: Verification that reminders can only be scheduled for valid future deadlines.
- **TinyFish Safety**: Error handling and key protection.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub.
2. Import the repository in [vercel.com](https://vercel.com).
3. Add your environment variables in project settings.
4. Click **Deploy**.

---

## 📄 License

This project is open-source under the [MIT License](./LICENSE).
