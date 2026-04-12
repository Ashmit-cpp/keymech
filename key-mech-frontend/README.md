# Key Mech — Frontend

Web storefront and admin dashboard for **Key Mech**, built with React and Vite. It talks to the NestJS API in [`../key-mech-backend`](../key-mech-backend); run that service locally (or point `VITE_API_URL` at a deployed API) while developing this app.

## Requirements

- **Node.js** — a current LTS version compatible with Vite 7 and this project
- **pnpm** — this package declares `packageManager: pnpm@10.33.0`; use pnpm for installs and scripts

## Getting started

From the repository root:

```bash
cd key-mech-frontend
pnpm install
cp .env.example .env
```

Edit `.env` and set **`VITE_API_URL`** to your API origin (no trailing slash required; the client normalizes it). The example defaults to `http://localhost:3007` when the backend listens there.

Start the dev server:

```bash
pnpm dev
```

## Environment variables

| Variable        | Description                                      |
|-----------------|--------------------------------------------------|
| `VITE_API_URL`  | Base URL for REST calls (Orval + `customFetch`) |

The API client attaches a `Bearer` token when present in `localStorage` under the `auth-storage` key (Zustand persist).

## Scripts

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `pnpm dev`            | Vite dev server with HMR                         |
| `pnpm build`          | Typecheck (`tsc -b`) then production build       |
| `pnpm preview`        | Serve the production build locally               |
| `pnpm lint`           | ESLint                                           |
| `pnpm gen:api`        | Regenerate Orval client from OpenAPI             |
| `pnpm gen:api:watch`  | Same as `gen:api`, watch mode                    |

## API client (Orval)

OpenAPI lives at [`../packages/api-schema/openapi.json`](../packages/api-schema/openapi.json). [`orval.config.js`](orval.config.js) reads that path relative to **this** app directory, so you need the **full monorepo** layout: `key-mech-frontend` and `packages` as siblings under the repo root.

After the schema changes, run `pnpm gen:api` (or `pnpm gen:api:watch`). Generated hooks and types are written to [`src/api/generated.ts`](src/api/generated.ts). HTTP calls go through [`src/lib/custom-fetch.ts`](src/lib/custom-fetch.ts) (`customFetch` mutator).

## Project structure (overview)

| Path                 | Role                                                |
|----------------------|-----------------------------------------------------|
| `src/lib/`           | Router, utilities, `customFetch`                    |
| `src/pages/`         | Route screens: public, `account/`, `admin/`, `auth/` |
| `src/layouts/`       | Root, account, admin, auth shells                   |
| `src/components/`    | Shared UI; `ui/` holds Radix-style primitives      |
| `src/stores/`        | Zustand stores (e.g. auth, cart, wishlist)         |
| `src/contexts/`      | React context (e.g. auth)                          |
| `src/api/generated.ts` | Orval-generated TanStack Query client            |

Path alias: `@/` → `src/` (see [`vite.config.ts`](vite.config.ts)).

## Routing overview

Routes are defined in [`src/lib/routes.tsx`](src/lib/routes.tsx).

- **Public** — `/`, `/about`, `/contact`, `/blog`, `/blog/:slug`, `/products`, `/products/:id`, category routes (`/category/:category`, `/keyboards`, `/switches`, `/keycaps`, `/accessories`)
- **Commerce** — `/cart`, `/wishlist`; **`/checkout`** and **`/order-confirmation/:orderId`** are wrapped in `ProtectedRoute`
- **Account** — `/account` (dashboard), `/account/orders`, `/account/orders/:orderId`, `/account/profile`, `/account/addresses`, `/account/settings`
- **Admin** — `/admin` and nested routes (products create/edit, orders, users, inventory, analytics, settings) behind `AdminRoute`
- **Auth (fullscreen)** — `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password/:token`
- **Errors** — `/unauthorized`, app-level 404 via `errorElement` / catch-all

## Deployment

Production builds are static assets from Vite (`pnpm build`, output under `dist/`). [`vercel.json`](vercel.json) rewrites all paths to `index.html` so client-side routing works on Vercel.

Set **`VITE_API_URL`** in the hosting environment to your production API origin, and ensure the backend allows this frontend origin (CORS) if the API is on another domain.

## Troubleshooting

- **Requests go to the wrong host or fail immediately** — Check `VITE_API_URL` in `.env`; restart the dev server after changing env files.
- **CORS errors in the browser** — Backend must permit your frontend origin; fix CORS on the API, not by disabling browser security.
- **401 on protected routes** — Sign in again; token may be missing or expired in persisted auth storage.
