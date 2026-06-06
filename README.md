# TransitDesk

Fleet operations dashboard for shuttle dispatchers. Schedule services, assign drivers and vehicles, track status transitions, and manage the supporting entities (drivers, vehicles, guides, users).

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Zod, Axios
- **Backend:** Express 5, TypeScript, Prisma 7, Zod validation, JWT auth, bcrypt
- **Database:** PostgreSQL
- **Tests:** Vitest + Testing Library (unit), Playwright (E2E)

## Project structure

```
TransitDesk/
├── src/          Frontend (Vite + React)
├── server/       Backend (Express + Prisma)
└── e2e/          Playwright tests
```

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally
- npm

### 1. Install dependencies

```bash
npm install
npm install --prefix server
```

### 2. Create the databases

```sql
CREATE DATABASE transitdesk;
CREATE DATABASE transitdesk_test;
```

### 3. Configure environment

Create `server/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/transitdesk?schema=public"
JWT_SECRET="change-me-in-production"
```

Create `server/.env.test`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/transitdesk_test"
JWT_SECRET="test-secret"
PORT=3002
```

Create `.env` in the project root:

```
VITE_API_URL=http://localhost:3001/api
```

### 4. Apply migrations and seed

```bash
cd server
npx prisma migrate deploy
npm run seed        # creates the admin account only
cd ..
```

To start with sample fleet and service data instead, run `npm run seed:demo`
in `server/` (it replaces existing data with a demo dataset).

### 5. Run

```bash
npm run dev:all          # Starts frontend (5173) and backend (3001) together
```

Open `http://localhost:5173`.

## Demo credentials

```
username: admin
password: admin123
```

## Tests

### Unit tests (Vitest)

```bash
npm test
```

### E2E tests (Playwright)

E2E tests use the isolated `transitdesk_test` database and start their own servers. Make sure no other server is running on port 3002.

```bash
npx playwright install   # First time only
npx playwright test
```

## Deployment

The public demo runs on free tiers: the frontend on Vercel, the backend on
Render (`render.yaml`), and PostgreSQL on Neon. The Render free service sleeps
after inactivity, so the first request can take ~30 seconds to wake.

Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (the frontend URL).
Frontend env var: `VITE_API_URL` (the backend URL plus `/api`). After the first
deploy, run `npm run seed:demo` once to load the sample data.

## Useful scripts

```bash
npm run dev:all                      # Frontend + backend together
npm run dev                          # Frontend only
npm run dev --prefix server          # Backend only
npm run build                        # Type-check + production build
npm run lint                         # ESLint
npm test                             # Unit tests
npx playwright test                  # E2E tests
npx playwright test --ui             # E2E in interactive UI mode
```
