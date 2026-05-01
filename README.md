# Hoops Rewind

A daily sports trivia game where players guess the year of historical NBA events.

https://hoopsrewind.app

## Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Backend:** Supabase (Postgres + Edge Functions)
- **Validation:** Zod
- **Tests:** Vitest + Testing Library

## Project layout

```
src/
  pages/         Play (game), Admin, FAQ, Contact, legal pages
  components/    UI components (shadcn-based)
  integrations/  Supabase client
  hooks/  lib/  data/
supabase/
  functions/admin-api/   Deno edge function for admin CRUD
  migrations/            SQL schema migrations
```

Routes: `/` (game), `/admin`, `/faq`, `/contact`, `/privacy`, `/terms`, `/cookies`.

## Getting started

Requires Node.js 18+ and npm.

```sh
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Production build                     |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | ESLint                               |
| `npm test`         | Run the Vitest suite once            |
| `npm run test:watch` | Vitest in watch mode               |

## Environment

Client (exposed in browser builds):

- `VITE_SUPABASE_URL` 
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Server-only (set as Supabase secrets, never in `.env`):

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` — gate for admin write actions
- `ALLOWED_ORIGIN` — CORS origin for the admin edge function (defaults to `*` if unset)

## Admin

`/admin` is password-protected via `x-admin-password`. The page talks to the `admin-api` edge function for events, daily challenges, and bulk imports.

## Deploy

Frontend is built with `npm run build` and deploys as a static SPA (Vercel config included). Database changes go through `supabase/migrations/`; the admin function lives under `supabase/functions/admin-api/`.
