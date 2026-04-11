# TransitDesk (Shuttle Web App)

TransitDesk is a frontend-first shuttle operations dashboard built with React + TypeScript.
It helps dispatch teams manage services and core operational entities (drivers and vehicles), while backend integration is still in progress.

## MVP: What the app does

The current MVP focuses on daily service operations:

- Create, view, edit, and list shuttle services
- Move services through status transitions:
  - `scheduled -> ongoing -> completed`
  - cancellation support where allowed
- Validate service inputs (required fields, date logic, passenger constraints)
- Filter and search services
- Manage related entities used by services:
  - Drivers: list/create/edit/detail/delete with active-assignment guardrails
  - Vehicles: list/create/edit/detail/delete with active-assignment guardrails

## What has already been worked on

Project progress is tracked in sprint plans. Summary of completed work:

- Sprint 0: Foundation and setup
  - Tailwind setup, app shell, routing, design tokens
- Sprint 1: Services list and display
  - Service table/card views, status badge, filtering/search
- Sprint 2: Service create/edit workflows
  - Reusable service form, validation schema, create flow
- Sprint 3: Service detail and transitions
  - Detail page, edit mode, transition actions + confirmations
- Sprint 4: Hardening and polish
  - Loading/empty/error patterns, accessibility improvements, tests, contract docs
- Sprint 5: Entity CRUD foundation
  - Shared CRUD primitives, route scaffolding, typed APIs
- Sprint 6: Driver and Vehicle CRUD
  - Drivers and vehicles list/create/edit/detail flows
  - Delete safety guardrails for active assignments

Current status:

- Completed through Sprint 6 (including vehicle delete guardrails)
- Next planned work: Guide CRUD + full cross-entity integration and final hardening

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zod
- Vitest + Testing Library

## How to run locally

### 1) Prerequisites

- Node.js 20+ (recommended)
- npm

### 2) Install dependencies

```bash
cd TransitDesk
npm install
```

### 3) Start development server

```bash
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`).

## Useful scripts

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

## Key routes

- `/services` - services list
- `/services/new` - create service
- `/services/:id` - service detail/edit actions
- `/drivers` - driver management
- `/vehicles` - vehicle management
- `/guides` - planned/in-progress area (Sprint 7)

## Notes

- The app currently uses typed API modules with mock-backed behavior for frontend-first development.
