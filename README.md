# KeyMech

A full-stack mechanical keyboard e-commerce platform. Browse and customize keyboards in an interactive 3D viewer, manage a cart and wishlist, and complete purchases via Razorpay.

## Monorepo structure

```
keymech/
├── key-mech-backend/   # NestJS REST API
├── key-mech-frontend/  # React + Vite SPA
└── packages/
    └── api-schema/     # Shared OpenAPI schema (generated)
```

## Tech stack

| Layer | Choices |
|-------|---------|
| Frontend | React 19, Vite, TypeScript, TanStack Query, Zustand, React Router, shadcn/ui, Three.js / R3F |
| Backend | NestJS 11, Prisma 7, PostgreSQL, Passport JWT |
| Payments | Razorpay (order creation + HMAC verification) |
| API contract | OpenAPI → Orval (typed React Query hooks) |
| Monorepo | pnpm workspaces |

## Prerequisites

- **Node.js** — current LTS
- **pnpm** `10.33.0` (pinned in `package.json`)
- **PostgreSQL** — any version supported by Prisma's PostgreSQL provider

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the backend

```bash
cd key-mech-backend
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key id (e.g. `rzp_test_…`) |
| `RAZORPAY_SECRET` | Yes | Razorpay key secret |
| `FRONTEND_ORIGIN` | No | CORS allowlist; default `http://localhost:5173` |
| `PORT` | No | Listen port; default `3006` |
| `NODE_ENV` | No | Default `development` |

### 3. Run migrations and seed

```bash
cd key-mech-backend
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma db seed   # optional sample data
```

### 4. Start development servers

In separate terminals:

```bash
# Backend (http://localhost:3006)
cd key-mech-backend && pnpm start:dev

# Frontend (http://localhost:5173)
cd key-mech-frontend && pnpm dev
```

Swagger UI is available at `http://localhost:3006/api` in non-production environments.

## Root scripts

Run from the monorepo root:

| Command | Description |
|---------|-------------|
| `pnpm lint` | Lint both packages |
| `pnpm lint:fix` | Auto-fix lint errors |
| `pnpm typecheck` | Type-check both packages |
| `pnpm test` | Run backend unit tests |
| `pnpm gen:api` | Regenerate OpenAPI schema then Orval client |

## Features

- **3D keyboard configurator** — real-time colorway and keycap preview powered by Three.js / React Three Fiber
- **Garage** — save and revisit custom keyboard builds
- **Product catalog** — filterable by category with detail pages
- **Cart & wishlist** — persistent per-user, synced with the backend
- **Checkout** — Razorpay payment flow with server-side order creation and HMAC verification
- **Auth** — JWT-based registration and login with role-aware route guards
- **Admin** — product and order management (admin role required)

## Package READMEs

- [`key-mech-backend/README.md`](key-mech-backend/README.md) — API details, environment variables, scripts, deployment
- [`key-mech-frontend/`](key-mech-frontend/) — Vite SPA, Orval codegen, Three.js setup
