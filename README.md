# 🏋️ Gym Management System

A modern, full-stack gym management application built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Supabase**. Designed to streamline membership tracking, subscription renewals, gym operating schedules, and financial analytics.

---

## 🚀 Key Features

* **📊 Dashboard & Financial Analytics**
  * Real-time metrics for active members, estimated monthly revenue, and 12-month annual projections.
  * Instant spotlight on memberships expiring within 7 days.
  * Recent member sign-ups timeline.

* **👥 Member Directory & Management**
  * Complete CRUD capabilities for member profiles (Name, Phone, Join/Expiration dates, Payment methods).
  * Member status tracking: Active, Expiring Soon, Expired, and Banned.
  * Warning management with dated infraction logs.
  * Ban/Unban mechanism with administrative password protection.

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

* **🌐 Public Portal & Staff Login**
  * Dual-mode gateway: Member portal access and password-protected staff admin portal.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions)
* **Frontend:** [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
* **Database & Auth:** [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL)
* **Language:** TypeScript

---

## 📁 Project Structure

```text
gym-management-system/
├── app/
│   ├── actions/          # Next.js Server Actions (members, settings, subscriptions, auth, badges, retention)
│   ├── dashboard/        # Dashboard overview & analytics
│   ├── members/          # Member directory & status controls
│   ├── portal/           # Member self-service portal
│   ├── retention/        # Retention & renewal outreach hub
│   ├── settings/         # Gym branding & operating schedule configuration
│   └── subscriptions/    # Subscription plans & badge management
├── components/           # Reusable UI components & layouts
├── lib/                  # Supabase clients & system configurations
├── supabase/             # Database seed scripts & migrations
├── types/                # TypeScript interface definitions
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites

* Node.js 18.x or higher
* npm / yarn / pnpm
* A Supabase account and project

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ADMIN_PASSWORD=admin123
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
