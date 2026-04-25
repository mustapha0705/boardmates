# Boardmates

Boardmates is a chess review platform where users submit PGNs, claim games for review, annotate move trees, and publish completed analysis.

## Screenshots / Demo

Add your visuals here:

- `docs/screenshots/feed.png` - review feed
- `docs/screenshots/review.png` - board + move tree + comments
- `docs/screenshots/profile.png` - profile stats and activity
- Optional GIF: `docs/demo/review-flow.gif`

You can render them like:

```md
![Feed](docs/screenshots/feed.png)
![Review](docs/screenshots/review.png)
```

## Tech Stack

- **Frontend:** React, Vite, React Router, TanStack Query, chess.js, chessboard.js
- **Backend:** Node.js, Express, Prisma, Supabase Auth
- **Database:** PostgreSQL (via Prisma)

## Monorepo Structure

```text
boardmates/
  client/   # React frontend
  server/   # Express + Prisma API
```

## Table of Contents

- [Frontend README](./client/README.md)
- [Backend README](./server/README.md)

## Quick Start

1. Install dependencies in both apps:
   - `cd client && npm install`
   - `cd ../server && npm install`
2. Configure environment variables (see sub-READMEs).
3. Start backend: `cd server && npm run dev`
4. Start frontend: `cd client && npm run dev`
