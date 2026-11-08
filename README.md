# STAY IN TRACK

STAY IN TRACK helps small, independent gym owners in South Africa track member payments, so unpaid Members no longer enter for free.

---

## Tech Stack

- **Frontend:** React 18.3, Vite 5, React Router 6, Tailwind CSS 3.4
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (PostgreSQL 15, Auth, Row-Level Security, Database Triggers & Stored Functions)
- **Testing:** Vitest, React Testing Library, pgTAP, Playwright, Secretlint

---

## Prerequisites

- Node.js 20 LTS or later and npm
- Git
- Docker Desktop (for local Supabase development and pgTAP testing)
- Supabase CLI (`npx supabase`)

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/analystmodikwe/Stay-In-Track.git
   cd Stay-In-Track
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   For local development with Supabase, `.env` should contain:
   ```env
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
   SEED_TEST_PASSWORD=TestPass1234!
   ```

4. **Start local Supabase backend:**
   ```bash
   npx supabase start
   ```

5. **Apply migrations and seed sample data:**
   ```bash
   npx supabase db reset
   npm run seed
   ```

6. **Start Vite development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Test Accounts (Iron Haven Gym)

All test accounts share the password set in `SEED_TEST_PASSWORD` (default: `TestPass1234!`):

| Role | Email | Status / Notes |
| --- | --- | --- |
| **Admin** | `sipho@ironhaven.example.com` | Gym Owner / Manager of Iron Haven Gym |
| **Member** | `naledi.k@example.com` | Active member (paid until 15 Nov 2026, Student Plan) |
| **Member** | `thando.m@example.com` | In Grace period (paid until 26 Oct 2026, Standard Plan) |
| **Member** | `ayesha.p@example.com` | Overdue member (pre-registered record, no auth login yet) |
| **Member** | `johan.vdm@example.com` | Active member (pre-registered record, no auth login yet) |

---

## Available Commands & Scripts

- `npm run dev`: Start Vite development server (hot reload on `http://localhost:5173`).
- `npm run build`: Type-check (`tsc -b`) and build optimized production bundle into `dist/`.
- `npm run lint`: Run ESLint across all TypeScript and React files.
- `npm test`: Run unit and component test suite (Vitest + JSDOM).
- `npm run test:integration`: Run backend integration test suite against local or test Supabase instance.
- `npx supabase test db`: Run all 12 pgTAP database test files against local PostgreSQL.
- `npm run check`: Run full verification suite (`lint` + `tsc` + `unit` + `pgTAP` + `integration`).
- `npx playwright test`: Run full End-to-End browser test suite (Mobile & Desktop Chrome).
- `npm run seed`: Run seed script (`supabase/seed/seed.ts`) to populate Iron Haven Gym sample data.
- `npx secretlint "**/*"`: Scan codebase for accidentally committed secrets, tokens, or private keys.

---

## How to Run Each Test Level

### 1. Unit & Component Tests
```bash
npm test
# With code coverage report (src/lib line coverage >= 90%):
npm test -- --coverage
```

### 2. Integration Tests
Verifies real Supabase RPC functions, RLS policies, and multi-gym isolation:
```bash
npm run test:integration
```

### 3. Database pgTAP Tests
Verifies table schemas, row-level security (T-DB-7), triggers, and constraints inside PostgreSQL:
```bash
npx supabase test db
```

### 4. End-to-End Playwright Tests
Requires local dev server running or Playwright webServer:
```bash
npm run seed
npx playwright test
```

### 5. Full Quality Gate Check
```bash
npm run check
```

---

## 5-Minute Demo Script (PRD 11.7)

Follow this sequence to demo the core flows:

1. **Flow 1 — Admin Sign-Up & Login:**
   - Go to `/sign-up`.
   - Register as Gym Admin (`Gym Name: Metro Fitness`, `Full name: Neo Khumalo`, `Email: neo@metrofit.example.com`, `Password: Password123!`).
   - Read the verification notice on `/log-in`. Confirm email in local Supabase or mail catcher.
   - Log in. Land on the empty Admin Dashboard (S5).

2. **Flow 2 — Create Plans & Add a Member:**
   - Tap **Plans** tab. Tap **Add Plan** (M2). Create "Standard" at `R350.00`.
   - Tap **Members** tab. Tap **Add Member** (M1). Add "Kagiso Rabada" (`kagiso@example.com`, select "Standard" plan).
   - Notice the status badge defaults to **Overdue** (no payment yet).

3. **Flow 3 — Record Payment & Undo:**
   - Tap on Kagiso Rabada to open Member Details (S7).
   - Tap **Record Payment** (M3). Select `1 month`, `R350.00`, `Cash`. Tap **Save payment**.
   - Kagiso's status immediately changes to green **Active** badge.
   - Tap **Undo** (M6) next to the latest payment. Confirm deletion. Status reverts to **Overdue**.

4. **Flow 4 & 5 — Search & Admin Dashboard:**
   - Log in as seed Admin (`sipho@ironhaven.example.com`).
   - Go to Members (S6). Search `"tha"`. Thando Mokoena appears with amber **Grace period** badge.
   - Go to Dashboard (S5). View 5 StatCards (Total: 4, Active: 2, Grace: 1, Overdue: 1, Revenue: R1,350.00).

5. **Flow 6 — Member Dashboard:**
   - Log out from Settings (S10).
   - Log in as Member `naledi.k@example.com`.
   - Land on My Membership (S9): Active badge, paid until 15 Nov 2026, Student plan benefits, payment history.
   - Tap Settings (S10) and toggle Payment Reminders on/off.

---

## Deployment Guide (Vercel & Hosted Supabase)

### 1. Hosted Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Note the project region (PRD 12.4: if outside South Africa, Section 11 Privacy Notice reflects the region).
3. Link and push migrations:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. Set Auth redirect URL in Supabase Dashboard to your Vercel deployment URL (`https://<your-app>.vercel.app`).

### 2. Vercel Frontend Deployment
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Set Environment Variables on Vercel:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-hosted-anon-key>`
4. Deploy! `vercel.json` provides SPA rewrites for client-side routing.
