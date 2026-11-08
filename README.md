# STAY IN TRACK

STAY IN TRACK helps small, independent gym owners in South Africa track member payments, so unpaid Members no longer enter for free.

## Tech Stack

- **Frontend:** React 18.3, Vite 5, React Router 6, Tailwind CSS 3.4
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (PostgreSQL, Auth, Row-Level Security)
- **Testing:** Vitest, React Testing Library, pgTAP, Playwright

## Prerequisites

- Node.js 20 LTS and npm
- Git
- Docker Desktop (for local Supabase)
- Supabase CLI

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/analystmodikwe/Stay-In-Track.git
   cd Stay-In-Track
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Start local Supabase backend:
   ```bash
   npx supabase start
   ```

5. Reset and seed database:
   ```bash
   npx supabase db reset
   npm run seed
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Type-check and build for release
- `npm run lint`: Run ESLint checks
- `npm test`: Run unit and component tests (Vitest)
- `npm run test:integration`: Run backend integration tests
- `npm run check`: Run full suite (lint, tsc, unit, db, integration)
- `npx playwright test`: Run end-to-end tests

