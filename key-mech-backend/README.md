# Key Mech — Backend

REST API for **Key Mech**: products, cart, wishlist, auth (JWT), orders, and **Razorpay** payment creation/verification. Built with **NestJS 11** and **Prisma 7** on **PostgreSQL**.

The React app in [`../key-mech-frontend`](../key-mech-frontend) consumes this API; OpenAPI for Orval lives in [`../packages/api-schema/openapi.json`](../packages/api-schema/openapi.json).

## Capabilities

| Area | Notes |
|------|--------|
| **Catalog** | Products module (public/admin-facing endpoints per routes) |
| **Commerce** | Cart, wishlist, orders; Razorpay order + verify flow |
| **Users & auth** | Registration, login, JWT (`passport-jwt`), role-aware guards |
| **Ops** | Health check, non-production Swagger UI + raw Open JSON |

Global validation: `ValidationPipe` with `whitelist` and `transform`. CORS allows the configured frontend origin with credentials.

## Stack

| Layer | Choices |
|--------|---------|
| Runtime | Node.js (ESM), NestJS 11, Express adapter |
| Data | Prisma 7, `@prisma/adapter-pg`, PostgreSQL |
| Auth | `@nestjs/jwt`, Passport JWT, bcrypt |
| Payments | Official `razorpay` SDK |
| Docs | `@nestjs/swagger`; schema export script for the monorepo |
| Tooling | TypeScript 5.7, ESLint 9, Prettier, Jest 30 (ESM) |

Prisma Client is generated into [`generated/prisma`](./generated/prisma) (see `schema.prisma`). Use `pnpm exec prisma generate` after schema changes.

## Requirements

- **Node.js** — current LTS
- **pnpm** — `packageManager` is pinned in `package.json` (e.g. `pnpm@10.33.0`)
- **PostgreSQL** — version compatible with Prisma’s PostgreSQL provider

## Getting started

From the monorepo:

```bash
cd key-mech-backend
pnpm install
cp .env.example .env
```

Edit `.env`: set **`DATABASE_URL`**, **`JWT_SECRET`**, and **Razorpay test keys**. Set **`FRONTEND_ORIGIN`** to your SPA origin (default in validation is `http://localhost:5173`). **`PORT`** defaults to `3006` if omitted.

Apply schema and generate the client:

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

Optional seed (see [`prisma/seed.ts`](./prisma/seed.ts)):

```bash
pnpm exec prisma db seed
```

Product sound tests and narrowly scoped spec corrections live in
[`prisma/product-enrichments.json`](./prisma/product-enrichments.json). The
normal seed merges that file for a fresh database. To update an existing
database without overwriting prices, inventory, images, or other catalog data:

```bash
pnpm enrich:check          # validate the local manifest
pnpm enrich:check:remote   # also verify YouTube metadata and availability
pnpm enrich:dry-run        # compare the manifest with DATABASE_URL
pnpm enrich:write          # apply only changed enrichment fields
```

The sync is idempotent and defaults to validation unless `--write` is used.

Start in watch mode:

```bash
pnpm start:dev
```

- **HTTP** — `http://localhost:<PORT>` (default port **3006**)
- **Swagger UI** — `/api` when `NODE_ENV` is not `production`
- **OpenAPI JSON** — `/openapi.json` in those same environments

Point the frontend’s `VITE_API_URL` at this same origin (including port).

## Environment variables

Validated at startup via [`src/config/env.validation.ts`](src/config/env.validation.ts).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key id (e.g. test `rzp_test_…`) |
| `RAZORPAY_SECRET` | Yes | Razorpay key secret |
| `FRONTEND_ORIGIN` | No | CORS allowlist; default `http://localhost:5173` |
| `PORT` | No | Listen port; default `3006` |
| `NODE_ENV` | No | Default `development`; when `production`, Swagger/OpenAPI routes are not mounted |

JWT expiry is configured in code (`auth` module `signOptions`), not via env.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | Nest watch mode |
| `pnpm start:debug` | Watch mode with debugger |
| `pnpm start` | Single run (no watch) |
| `pnpm start:prod` | Run compiled app (`node dist/src/main`) |
| `pnpm build` | `nest build` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm test` | Unit tests (Jest, ESM) |
| `pnpm test:watch` | Jest watch |
| `pnpm test:cov` | Coverage |
| `pnpm test:e2e` | E2E config under `test/` |
| `pnpm gen:openapi` | Write `../packages/api-schema/openapi.json` (needs bootstrappable env; see script) |

After **`pnpm gen:openapi`**, regenerate the frontend client with `pnpm gen:api` in `key-mech-frontend`.

## OpenAPI and the frontend

[`scripts/generate-openapi.ts`](scripts/generate-openapi.ts) boots Nest (with `SKIP_DATABASE_CONNECT` for the script) and writes the merged document to **`../packages/api-schema/openapi.json`**. Keep that path in sync with Orval in the frontend.

## Project layout

| Path | Role |
|------|------|
| `src/auth/` | JWT strategy, auth module |
| `src/users/` | User domain |
| `src/products/` | Catalog |
| `src/cart/` | Cart |
| `src/wishlist/` | Wishlist |
| `src/orders/` | Orders + Razorpay |
| `src/prisma/` | Prisma module / service |
| `src/config/` | Env validation |
| `src/openapi.ts` | Swagger document factory |
| `prisma/` | `schema.prisma`, migrations, seed |

## Deployment

- Build with `pnpm build` and run `pnpm start:prod` (or your process manager).
- Set production env vars, especially **`DATABASE_URL`**, **`JWT_SECRET`**, Razorpay **live** keys, **`FRONTEND_ORIGIN`**, and **`PORT`** / `NODE_ENV=production`.
- Ensure PostgreSQL is reachable and migrations are applied (`prisma migrate deploy` in CI or release step).
- CORS is locked to **`FRONTEND_ORIGIN`**; add the real SPA URL there.

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Boot fails on env | All required keys in `.env`; names match validation (`FRONTEND_ORIGIN`, not `FRONTEND_URL`) |
| CORS from browser | `FRONTEND_ORIGIN` must exactly match the SPA origin (scheme + host + port) |
| Prisma errors | `DATABASE_URL`, migrations applied, `prisma generate` run after pull |
| Payments in dev | Razorpay test keys in `.env`; dashboard in test mode |
| Swagger 404 | Only available when `NODE_ENV` ≠ `production` |
