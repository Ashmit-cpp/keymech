# Key Mech — Frontend

Customer-facing storefront and admin dashboard for **Key Mech**. The app is a Vite + React SPA that consumes the NestJS API in [`../key-mech-backend`](../key-mech-backend). For local work, run the backend (or set `VITE_API_URL` to a deployed API) before using checkout and authenticated areas.

## What’s in this app

- **Storefront** — product browsing, cart, wishlist, Razorpay-powered checkout, order confirmation
- **Account** — orders, profile, addresses, settings (JWT-backed routes)
- **Admin** — product, order, user, and related management screens behind an admin guard

## Stack

| Layer | Choices |
|--------|---------|
| UI | React 19, React Router 7, Tailwind CSS 4, Radix UI primitives, Lucide, Sonner |
| Forms & validation | React Hook Form, Zod |
| Data | TanStack Query (Orval-generated hooks), `customFetch` mutator |
| State | Zustand (auth, cart, wishlist; auth persisted) |
| Motion / 3D | Framer Motion / Motion, GSAP, React Three Fiber (where used) |
| Tooling | Vite 7, TypeScript 5.9, ESLint 9, Orval 7 |

Path alias: `@/` → `src/` (see [`vite.config.ts`](vite.config.ts)).

## Requirements

- **Node.js** — current LTS compatible with Vite 7
- **pnpm** — `packageManager` is pinned in `package.json` (e.g. `pnpm@10.33.0`); use pnpm for install and scripts

## Getting started

From the **monorepo** root (this app expects [`../packages/api-schema`](../packages/api-schema) for OpenAPI):

```bash
cd key-mech-frontend
pnpm install
cp .env.example .env
```

Set **`VITE_API_URL`** in `.env` to your API origin (trailing slashes are normalized). The example uses `http://localhost:3007` when the backend listens there.

```bash
pnpm dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for REST calls (Orval client + [`src/lib/custom-fetch.ts`](src/lib/custom-fetch.ts)) |

Authenticated requests send `Authorization: Bearer <token>` when a token exists in persisted auth storage (`localStorage` key used by the Zustand auth persist slice).

Checkout loads [Razorpay Checkout.js](https://checkout.razorpay.com/); the **key ID and order payload** come from the backend create-order endpoint, not from frontend env vars.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server with HMR |
| `pnpm build` | Typecheck (`tsc -b`) then production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | TypeScript project references check only |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with `--fix` |
| `pnpm gen:api` | Regenerate Orval client from OpenAPI |
| `pnpm gen:api:watch` | Same, watch mode |

## API client (Orval)

The schema lives at [`../packages/api-schema/openapi.json`](../packages/api-schema/openapi.json). [`orval.config.js`](orval.config.js) resolves that path relative to **this** directory, so `key-mech-frontend` and `packages` must sit as siblings under the repo root.

After backend or schema changes:

```bash
pnpm gen:api
# or during active API work:
pnpm gen:api:watch
```

Output: [`src/api/generated.ts`](src/api/generated.ts) (hooks, types, URLs). All HTTP goes through `customFetch` for base URL and auth.

## Project layout

| Path | Role |
|------|------|
| `src/lib/` | Router config, `customFetch`, shared helpers |
| `src/pages/` | Route screens: public, `account/`, `admin/`, `auth/` |
| `src/layouts/` | Root, account, admin, auth shells |
| `src/components/` | Shared UI; `ui/` for primitives |
| `src/stores/` | Zustand stores |
| `src/contexts/` | React context (e.g. auth) |
| `src/api/generated.ts` | Generated TanStack Query integration |

## Routing

Central definition: [`src/lib/routes.tsx`](src/lib/routes.tsx).

- **Public** — home, about, contact, blog, products and categories
- **Commerce** — cart, wishlist; `/checkout` and `/order-confirmation/:orderId` require a signed-in user
- **Account** — dashboard, orders, profile, addresses, settings
- **Admin** — nested admin routes behind `AdminRoute`
- **Auth** — login, register, forgot/reset password (fullscreen layouts)
- **Errors** — unauthorized and app-level 404 handling

## Deployment

`pnpm build` emits static assets under `dist/`. [`vercel.json`](vercel.json) rewrites routes to `index.html` for SPA hosting on Vercel.

Set **`VITE_API_URL`** in the host environment to the production API origin. If the API is on another domain, configure CORS on the backend for this frontend’s origin.

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Wrong host or instant fetch failures | `VITE_API_URL` in `.env`; restart Vite after env changes |
| CORS errors | Fix allowed origins on the API, not the browser |
| 401 on protected routes | Re-authenticate; token missing or expired in persisted storage |
| Stale API types | Run `pnpm gen:api` after OpenAPI updates |
