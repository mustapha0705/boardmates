# Boardmates Frontend (`client`)

Frontend for Boardmates: auth, feed, game submission, review UI, move tree navigation, and profile pages.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
cd client
npm install
```

## Environment Variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional (email redirect helper):
VITE_AUTH_EMAIL_REDIRECT_ORIGIN=http://localhost:5173
```

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## State Management

The app uses a layered approach:

- **Auth state:** `AuthContext` (session/profile from Supabase + API profile fetch)
- **Server state:** TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`)
- **Local UI state:** React state/hooks per page and component
- **Board/review state:** custom move-tree hooks (`useAnalysisTree`, keyboard nav hooks)

## Frontend Architecture Notes

- Route protection is handled in `App.jsx` wrappers.
- API calls are centralized in `src/services/api.js`.
- Chess UI uses `chess.js` for move legality and `chessboard.js` for rendering/interaction.
- Review pages support move tree traversal, comments, and analysis draft persistence.

## Common Dev Workflow

1. Start backend first (`server` app).
2. Run `npm run dev` in `client`.
3. Log in via email/password.
4. Use React Query cache invalidation patterns already present in pages/mutations.
