# Seed Data and Test Accounts

This folder contains the seed script and reference information for the STAY IN TRACK sample data set (PRD Section 8.4).

## How to Seed

Ensure the local Supabase container is running, then run:

```bash
npx supabase db reset
npm run seed
```

## Test Accounts

All accounts share the password set in `SEED_TEST_PASSWORD` in your `.env` file (e.g. `TestPassword123!`):

| Role | Email | Status / Notes |
| --- | --- | --- |
| **Admin** | `sipho@ironhaven.example.com` | Gym owner of Iron Haven Gym |
| **Member** | `naledi.k@example.com` | Active member (paid until 15 Nov 2026) |
| **Member** | `thando.m@example.com` | Grace period member (paid until 26 Oct 2026) |

### Additional Members (without login accounts)

- **Johan van der Merwe** (`johan.vdm@example.com`): Active (paid until 1 Dec 2026)
- **Ayesha Patel** (`ayesha.p@example.com`): Overdue (paid until 10 Oct 2026)
