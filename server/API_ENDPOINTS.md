# Boardmates API Endpoints

Base URL: `http://localhost:5000/api`

All authenticated endpoints require:

`Authorization: Bearer <supabase_jwt>`

---

## Auth / Profile

### `POST /api/auth/signup`

Creates or updates the local `users` profile row for the authenticated Supabase user.

> Signup requires a chess username and platform. `displayName` is set to the username.

**Body**

```json
{
  "chessUsername": "magnus_c",
  "chessPlatform": "chess_com"
}
```

Accepted platform values:

- `chess_com`
- `lichess`

Also accepted aliases in payload parsing:

- `chess_platform`
- `chess_username`

**Response `201` / `200`**

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "displayName": "magnus_c",
  "chessUsername": "magnus_c",
  "chessPlatform": "chess_com",
  "createdAt": "2026-04-25T00:00:00.000Z"
}
```

### `GET /api/profile`

Get the authenticated user profile.

### `PATCH /api/profile`

Update profile fields.

**Body (all optional, at least one required)**

```json
{
  "displayName": "new_name",
  "chessUsername": "new_handle",
  "chessPlatform": "lichess"
}
```

Notes:

- `chessUsername` must be at least 2 chars.
- Updating `chessUsername` also sets `displayName = chessUsername`.

---

## Games

### `GET /api/games`

Paginated feed list.

Query params:

- `cursor` (uuid)
- `limit` (default `10`, max `50`)
- `status` (`pending,in_review,completed`, comma-separated)

**Response shape**

```json
{
  "games": [],
  "nextCursor": "uuid-or-null",
  "hasMore": true
}
```

### `GET /api/games/:id`

Returns full game details including:

- `pgn`
- `comments`
- `analysisTree` (when present)

### `POST /api/games`

Create new game (auth required).

**Body**

```json
{
  "title": "Optional custom title",
  "pgn": "1. e4 c5 ...",
  "timeControl": "10+5",
  "averageRating": 1700,
  "reviewNotes": "Please focus on move 18."
}
```

Rules:

- `pgn` required
- `timeControl` required
- `title` optional
- resolved title logic:
  1. custom `title` if provided
  2. detected opening from PGN
  3. fallback `Game · <timeControl>`

### `PATCH /api/games/:id`

Update game metadata (author only, `pending` status only).

### `DELETE /api/games/:id`

Delete game (author only, `pending` status only).

---

## Review Workflow

### `POST /api/games/:id/claim`

Claim pending game for review.

### `POST /api/games/:id/complete`

Complete review (assigned reviewer only).

Optional body:

```json
{
  "analysisTree": {
    "fen": "...",
    "san": null,
    "ply": 0,
    "comment": "",
    "children": []
  }
}
```

### `POST /api/games/:id/unclaim`

Unclaim game back to `pending` (assigned reviewer only).

### `PATCH /api/games/:id/review-analysis`

Persist in-review analysis draft (assigned reviewer only, `in_review` only).

**Body**

```json
{
  "analysisTree": {
    "fen": "...",
    "san": null,
    "ply": 0,
    "comment": "",
    "children": []
  }
}
```

Notes:

- `analysisTree` can be object or JSON string payload.
- Must be an object containing `fen`.
- Stored in DB as minified JSON string in `games.analysis_tree` (Text).

---

## Review Comments

### `GET /api/games/:id/comments`

List all comments for a game, ordered by `ply`.

### `PUT /api/games/:id/comments`

Upsert comment for move key `(gameId, ply, san)` (assigned reviewer only, while `in_review`).

**Body**

```json
{
  "ply": 12,
  "san": "Nf3",
  "comment": "Good practical choice.",
  "analysisTree": {
    "fen": "...",
    "children": []
  }
}
```

Notes:

- Empty comment (`""` or whitespace) deletes comment for that move key.
- If valid `analysisTree` is supplied, draft tree is persisted together with comment action.
- Response includes `game` snapshot (with `pgn`, `comments`, `analysisTree`).

---

## Profile Activity

### `GET /api/profile/stats`

Returns:

```json
{
  "submitted": 0,
  "reviewed": 0,
  "inProgress": 0
}
```

### `GET /api/profile/games`

Paginated games authored by current user.

Query:

- `cursor`
- `limit` (max `50`)

### `GET /api/profile/reviews`

Paginated reviews assigned to current user.

Query:

- `cursor`
- `limit` (max `50`)
- `status` (`in_review`, `completed`, or both comma-separated)

---

## Common Error Shape

```json
{
  "message": "Human-readable error",
  "errors": []
}
```

Status codes:

- `400` validation / malformed payload
- `401` missing or invalid auth token
- `403` forbidden
- `404` not found
- `409` state conflict
- `500` server error
