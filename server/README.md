# Boardmates Backend (`server`)

Express + Prisma API for Boardmates. Handles authentication-backed profile creation, game CRUD, review workflow, and comment/analysis persistence.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (Supabase/Postgres)

## Installation

```bash
cd server
npm install
```

## Environment Variables

Create `server/.env`:

```env
PORT=5000

# Prisma / DB
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional runtime controls
PRISMA_LOG_QUERIES=false
RATE_LIMIT_ENABLED=false
RATE_LIMIT_MAX=2000
```

## Database Setup

From `server/`:

```bash
npx prisma generate
npx prisma migrate dev
```

If your DB already has drift/history mismatches, reconcile migration state first (avoid forcing resets on shared/prod-like databases).

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - run once with Node

## API Documentation

Detailed endpoint reference lives in:

- [`API_ENDPOINTS.md`](./API_ENDPOINTS.md)

High-level route groups:

- `POST /api/auth/signup`
- `GET/PATCH /api/profile`
- `GET/POST/PATCH/DELETE /api/games`
- `POST /api/games/:id/claim|complete|unclaim`
- `PATCH /api/games/:id/review-analysis`
- `GET/PUT /api/games/:id/comments`
- `GET /api/profile/stats|games|reviews`

## Authentication Logic

- Client authenticates with Supabase and sends `Authorization: Bearer <jwt>`.
- `requireAuth` middleware verifies JWT via Supabase Admin SDK.
- Middleware resolves or creates a local `users` row as needed (except explicit signup route behavior).
- `requireProfile` enforces that profile-backed endpoints only run when a local user profile exists.

## Service Architecture Notes

- `src/server.js` wires middleware, rate limiting, and route groups.
- `config/db.js` initializes Prisma client and connection lifecycle.
- Controllers:
  - `authController.js` - profile signup/get/update
  - `gameController.js` - games, reviews, comments, analysis draft
  - `profileController.js` - user stats and paginated activity
