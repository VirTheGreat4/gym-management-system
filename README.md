# 🏋️ Gym Management System

A modern, full-stack gym management application built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Supabase**. Designed to streamline membership tracking, subscription renewals, gym operating schedules, financial analytics, resilient client actions, and enterprise-grade security protections.

---

## 🚀 Key Features

* **📊 Dashboard & Financial Analytics**
  * Real-time metrics for active members, estimated monthly revenue, and 12-month annual projections.
  * Instant spotlight on memberships expiring within 7 days.
  * Recent member sign-ups timeline with real-time updates.

* **👥 Member Directory & Management**
  * Complete CRUD capabilities for member profiles (Name, Phone, Join/Expiration dates, Payment methods).
  * Member status tracking: Active, Expiring Soon, Expired, and Banned.
  * Warning management with dated infraction logs.
  * Ban/Unban mechanism with administrative authentication protection.

* **🏷️ Subscription Plans & Custom Badges**
  * Flexible plan creator supporting Standard, Student, VIP, Daily, and Custom tiers.
  * Custom member badges with optional percentage discounts.

* **Retention & Renewal Hub**
  * Automated tracking for members nearing expiration (0 to 3 days) or overdue (-1 to -3 days).
  * Integrated SMS/outreach actions for renewal reminders and win-back offers.

* **⚙️ Gym Settings & Custom Branding**
  * Custom gym branding including gym name, primary theme color, and custom logo.
  * Configurable weekly schedule (regular operating hours per day & manual open/close overrides).
  * Special closed dates calendar management.

* **🛡️ Security, Resilience & Anti-Abuse System**
  * **Resilient Click Handling & Failure Recovery:**
    * Client-side debouncing and throttling (`lib/async-utils.ts`, `hooks/useResilientAction.ts`).
    * `ResilientButton` component with loading spinners, retry count badges, disabled state during flight, and automated exponential backoff retries.
  * **Admin Inactivity Auto-Logout Security Guard:**
    * Global inactivity monitor (`components/AdminInactivityGuard.tsx`) tracking user activity (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`).
    * Enforces a 30-minute inactivity limit for authenticated administrators, purging session cookies and redirecting to login with notification toast/banner.
  * **Vercel & Edge Rate Limiting & Bot Protections:**
    * Upstash Redis sliding window rate limiter (`lib/rate-limit.ts`) with in-memory fallback.
    * Cloudflare Turnstile token verification & honeypot field traps (`lib/bot-detection.ts`, `components/BotProtection.tsx`).
    * Public request validation middleware (`lib/request-validation.ts`) and malicious bot user-agent filtering in `proxy.ts`.
  * **Strict Member Privacy Controls in Portal Search:**
    * Disables browser auto-complete (`autoComplete="off"`, `autoCorrect="off"`, `spellCheck={false}`).
    * Enforces a minimum 2-character threshold for predictive search suggestions; suppresses initial dropdown recommendations when empty or focused without input.
    * Matches contextually on partial strings without exposing full member directory lists to public visitors.
  * **Dynamic Onboarding Tutorial & Viewport-Clamped Callouts:**
    * Integrated continuous positioning system (`components/AppTutorial.tsx`) combining `ResizeObserver`, `MutationObserver`, and high-frequency layout monitoring.
    * Dynamically re-calculates target highlight frames and instructional chat bubbles when asynchronous database content loads or layout shifts occur.
    * Features automatic auto-scroll to keep active step targets centered, and strict viewport clamping/collision detection so popovers and directional carets never overflow or render off-screen on mobile or desktop viewports.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions, Middleware Proxy)
* **Frontend:** [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
* **Database & Auth:** [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL)
* **Rate Limiting & Security:** [Upstash Redis](https://upstash.com), [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
* **Language:** TypeScript

---

## 📁 Project Structure

```text
gym-management-system/
├── app/
│   ├── actions/          # Next.js Server Actions (members, settings, subscriptions, auth, badges, retention)
│   ├── dashboard/        # Dashboard overview & analytics
│   ├── members/          # Member directory & status controls
│   ├── portal/           # Member self-service portal (with privacy-controlled search)
│   ├── retention/        # Retention & renewal outreach hub
│   ├── settings/         # Gym branding & operating schedule configuration
│   └── subscriptions/    # Subscription plans & badge management
├── components/           # Reusable UI components (ResilientButton, AdminInactivityGuard, BotProtection, etc.)
├── hooks/                # React custom hooks (useResilientAction)
├── lib/                  # Utilities, rate-limiting, bot detection, async helpers, Supabase clients
│   ├── async-utils.ts    # Debounce, throttle, and exponential backoff retry helpers
│   ├── bot-detection.ts  # Bot UA checks, honeypot traps, and Turnstile validation
│   ├── rate-limit.ts     # Upstash Redis sliding window rate limiter with in-memory fallback
│   └── request-validation.ts # Public API request validator
├── proxy.ts              # Security headers, rate limiting, and bot filter middleware
├── supabase/             # Database seed scripts & schema migrations
├── types/                # TypeScript interface definitions
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites

* Node.js 18.x or higher
* npm / yarn / pnpm
* A Supabase account and project
* (Optional) Upstash Redis database for production edge rate-limiting
* (Optional) Cloudflare Turnstile site key & secret key for CAPTCHA-free bot protection

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Admin Authentication
ADMIN_PASSWORD=admin123

# Rate Limiting (Upstash Redis - optional, falls back to in-memory sliding window)
UPSTASH_REDIS_REST_URL=https://your-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Bot Protection (Cloudflare Turnstile - optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

### 3. Database Setup & Seeding

Execute the seed script in your Supabase SQL Editor to populate initial demo gym tenants and member cohorts:

```bash
# Script location:
supabase/seed.sql
```

### 4. Install Dependencies & Run Locally

```bash
# Install package dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Architecture Overview

### Resilient Action Execution Architecture
Client actions execute through `useResilientAction` hook wrapped around `executeWithRetry`:
* **Debouncing & Throttling:** Prevents duplicate form submissions or multi-click race conditions.
* **Exponential Backoff:** Retries failed server calls with configurable delay multiplier and max retries.
* **Visual States:** `ResilientButton` renders an explicit spinner and remaining retry indicator while active, disabling inputs during execution.

### Admin Inactivity Guard
* Listens to user interactions across the application layout (`components/AdminInactivityGuard.tsx`).
* Resets activity timestamp on any mouse, keypress, click, scroll, or touch event.
* After 30 minutes without interaction, automatically calls `logoutAdmin()`, purges session cookies, and redirects the user to `/` with an inactivity notification parameter.

### Rate Limiting & Bot Defense
* `proxy.ts` inspects incoming user agents for known web scrapers, security scanners, and automated bots.
* `lib/rate-limit.ts` tracks request rates per IP address over a sliding window. In serverless environments, it uses Upstash Redis REST API, falling back gracefully to local sliding window memory when unconfigured.
* `lib/bot-detection.ts` checks honeypot field inputs and verifies Cloudflare Turnstile tokens for sensitive form submissions.

### Privacy-Preserving Member Search
* Portal member lookup (`app/portal/page.tsx`) explicitly obscures full directory contents.
* Requires at least 2 characters before rendering matches.
* Search matches against trimmed name queries without displaying unselected member details or exposing all directory records at once.

---

## 🧹 Database Maintenance & Fresh Reset

To clean or reset your Supabase database:

* **Clean All Data (Keep Schema):**
  ```sql
  TRUNCATE TABLE members, subscription_plans, custom_badges, gym_settings, gyms RESTART IDENTITY CASCADE;
  ```

* **Complete Database Reset (Local CLI):**
  ```bash
  npx supabase db reset
  ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
