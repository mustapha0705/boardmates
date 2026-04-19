# Boardmates API Endpoints

Base URL: `http://localhost:5000/api`

All authenticated endpoints require `Authorization: Bearer <supabase_jwt>` header.

---

## Auth

### `POST /api/auth/signup`

Create a user profile after Supabase signup.

**Body:**

```json
{
  "email": "alex@example.com",
  "displayName": "Alex Carter",
  "chessUsername": "alex_c",
  "rating": 1500
}
```

**Response `201`:**

```json
{
  "id": "a1b2c3d4-...",
  "email": "alex@example.com",
  "displayName": "Alex Carter",
  "chessUsername": "alex_c",
  "rating": 1500,
  "createdAt": "2023-06-15T10:00:00Z"
}
```

---

### `GET /api/profile`

Get the authenticated user's profile.

**Response `200`:**

```json
{
  "id": "a1b2c3d4-...",
  "email": "alex@example.com",
  "displayName": "Alex Carter",
  "chessUsername": "alex_c",
  "rating": 1500,
  "createdAt": "2023-06-15T10:00:00Z"
}
```

---

### `PATCH /api/profile`

Update the authenticated user's profile.

**Body (all fields optional):**

```json
{
  "displayName": "Alex C.",
  "chessUsername": "alex_carter",
  "rating": 1600
}
```

**Response `200`:**

```json
{
  "id": "a1b2c3d4-...",
  "email": "alex@example.com",
  "displayName": "Alex C.",
  "chessUsername": "alex_carter",
  "rating": 1600,
  "createdAt": "2023-06-15T10:00:00Z"
}
```

---

## Games

### `GET /api/games`

List games for the feed. Sorted by newest first.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | uuid | — | ID of the last game from the previous page |
| `limit` | int | 10 | Number of games to return (max 50) |
| `status` | string | — | Filter by status: `pending`, `in_review`, `completed`. Comma-separated for multiple. |

**Response `200`:**

```json
{
  "games": [
    {
      "id": "f7e6d5c4-...",
      "title": "Sicilian Najdorf Slugfest",
      "status": "pending",
      "timeControl": "10+5",
      "averageRating": 1500,
      "reviewNotes": "Focus on the middlegame transition around move 15...",
      "submittedAt": "2024-11-02T14:30:00Z",
      "claimedAt": null,
      "completedAt": null,
      "author": {
        "id": "a1b2c3d4-...",
        "displayName": "Jordan Miles"
      },
      "reviewer": null
    },
    {
      "id": "b8a9c0d1-...",
      "title": "Italian Game Masterclass",
      "status": "in_review",
      "timeControl": "10+5",
      "averageRating": 1200,
      "reviewNotes": null,
      "submittedAt": "2024-10-29T16:20:00Z",
      "claimedAt": "2024-10-30T09:00:00Z",
      "completedAt": null,
      "author": {
        "id": "e2f3g4h5-...",
        "displayName": "Morgan Lee"
      },
      "reviewer": {
        "id": "a1b2c3d4-...",
        "displayName": "Alex Carter"
      }
    }
  ],
  "nextCursor": "b8a9c0d1-...",
  "hasMore": true
}
```

---

### `GET /api/games/:id`

Get a single game with full PGN and review comments.

**Response `200`:**

```json
{
  "id": "f7e6d5c4-...",
  "title": "Sicilian Najdorf Slugfest",
  "pgn": "[Event \"Casual Game\"]\n[White \"Player1\"]\n[Black \"Player2\"]\n\n1. e4 c5 2. Nf3 d6 ...",
  "status": "completed",
  "timeControl": "10+5",
  "averageRating": 1500,
  "reviewNotes": "Focus on the middlegame transition...",
  "submittedAt": "2024-11-02T14:30:00Z",
  "claimedAt": "2024-11-03T08:00:00Z",
  "completedAt": "2024-11-04T14:00:00Z",
  "author": {
    "id": "a1b2c3d4-...",
    "displayName": "Jordan Miles"
  },
  "reviewer": {
    "id": "e2f3g4h5-...",
    "displayName": "Alex Carter"
  },
  "comments": [
    {
      "id": "c1d2e3f4-...",
      "ply": 1,
      "san": "e4",
      "comment": "The King's Pawn opening. White stakes an immediate claim in the center.",
      "createdAt": "2024-11-03T09:15:00Z",
      "updatedAt": "2024-11-03T09:15:00Z"
    },
    {
      "id": "g5h6i7j8-...",
      "ply": 3,
      "san": "Nf3",
      "comment": "Developing the knight to its most natural square.",
      "createdAt": "2024-11-03T09:18:00Z",
      "updatedAt": "2024-11-03T10:02:00Z"
    }
  ]
}
```

**Response `404`:**

```json
{
  "message": "Game not found"
}
```

---

### `POST /api/games`

Submit a new game for review. Requires authentication.

**Body:**

```json
{
  "title": "Sicilian Najdorf Slugfest",
  "pgn": "1. e4 c5 2. Nf3 d6 ...",
  "timeControl": "10+5",
  "averageRating": 1500,
  "reviewNotes": "I'm unsure about the middle-game transition around move 15..."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Game title |
| `pgn` | string | yes | PGN text |
| `timeControl` | string | yes | "10+5", "5+3", "30m", "1+0", "1d" |
| `averageRating` | int | no | Defaults to null |
| `reviewNotes` | string | no | What parts should be reviewed |

**Response `201`:**

```json
{
  "id": "f7e6d5c4-...",
  "title": "Sicilian Najdorf Slugfest",
  "pgn": "1. e4 c5 2. Nf3 d6 ...",
  "status": "pending",
  "timeControl": "10+5",
  "averageRating": 1500,
  "reviewNotes": "I'm unsure about the middle-game transition around move 15...",
  "submittedAt": "2024-11-02T14:30:00Z",
  "claimedAt": null,
  "completedAt": null,
  "author": {
    "id": "a1b2c3d4-...",
    "displayName": "Alex Carter"
  },
  "reviewer": null
}
```

**Response `400`:**

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "pgn", "message": "PGN is required" }
  ]
}
```

---

### `PATCH /api/games/:id`

Update game metadata. Author only. Only allowed while game is `pending`.

**Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "reviewNotes": "Actually, focus on the endgame instead"
}
```

**Response `200`:** Same shape as `GET /api/games/:id` (without comments).

**Response `403`:**

```json
{
  "message": "Only the author can edit this game"
}
```

---

### `DELETE /api/games/:id`

Delete a game. Author only. Only allowed while game is `pending`.

**Response `204`:** No body.

**Response `403`:**

```json
{
  "message": "Only the author can delete this game"
}
```

**Response `409`:**

```json
{
  "message": "Cannot delete a game that is in review or completed"
}
```

---

## Review Workflow

### `POST /api/games/:id/claim`

Claim a pending game for review. Sets status to `in_review`. Requires authentication. Fails if the game is already claimed or if the author tries to review their own game.

**Body:** None.

**Response `200`:**

```json
{
  "id": "f7e6d5c4-...",
  "title": "Sicilian Najdorf Slugfest",
  "status": "in_review",
  "timeControl": "10+5",
  "averageRating": 1500,
  "reviewNotes": "Focus on the middlegame...",
  "submittedAt": "2024-11-02T14:30:00Z",
  "claimedAt": "2024-11-03T08:00:00Z",
  "completedAt": null,
  "author": {
    "id": "a1b2c3d4-...",
    "displayName": "Jordan Miles"
  },
  "reviewer": {
    "id": "e2f3g4h5-...",
    "displayName": "Alex Carter"
  }
}
```

**Response `409`:**

```json
{
  "message": "Game is already being reviewed"
}
```

**Response `403`:**

```json
{
  "message": "You cannot review your own game"
}
```

---

### `POST /api/games/:id/complete`

Mark a review as done. Only the assigned reviewer can call this. Sets status to `completed`.

**Body:** None.

**Response `200`:**

```json
{
  "id": "f7e6d5c4-...",
  "title": "Sicilian Najdorf Slugfest",
  "status": "completed",
  "timeControl": "10+5",
  "averageRating": 1500,
  "reviewNotes": "Focus on the middlegame...",
  "submittedAt": "2024-11-02T14:30:00Z",
  "claimedAt": "2024-11-03T08:00:00Z",
  "completedAt": "2024-11-04T14:00:00Z",
  "author": {
    "id": "a1b2c3d4-...",
    "displayName": "Jordan Miles"
  },
  "reviewer": {
    "id": "e2f3g4h5-...",
    "displayName": "Alex Carter"
  }
}
```

**Response `403`:**

```json
{
  "message": "Only the assigned reviewer can complete this review"
}
```

**Response `409`:**

```json
{
  "message": "Game is not in review"
}
```

---

### `POST /api/games/:id/unclaim`

Release a claimed game back to pending. Only the assigned reviewer can call this.

**Body:** None.

**Response `200`:**

```json
{
  "id": "f7e6d5c4-...",
  "status": "pending",
  "reviewer": null,
  "claimedAt": null
}
```

**Response `403`:**

```json
{
  "message": "Only the assigned reviewer can unclaim this game"
}
```

---

## Review Comments

### `GET /api/games/:id/comments`

Get all comments for a game. Also included in `GET /api/games/:id`.

**Response `200`:**

```json
{
  "comments": [
    {
      "id": "c1d2e3f4-...",
      "ply": 1,
      "san": "e4",
      "comment": "The King's Pawn opening.",
      "createdAt": "2024-11-03T09:15:00Z",
      "updatedAt": "2024-11-03T09:15:00Z"
    },
    {
      "id": "g5h6i7j8-...",
      "ply": 3,
      "san": "Nf3",
      "comment": "Natural development.",
      "createdAt": "2024-11-03T09:18:00Z",
      "updatedAt": "2024-11-03T10:02:00Z"
    }
  ]
}
```

---

### `PUT /api/games/:id/comments`

Create or update a comment on a specific move. Only the assigned reviewer can call this while the game is `in_review`. Upserts by `game_id` + `ply` + `san`. Sending an empty `comment` string deletes the comment.

**Body:**

```json
{
  "ply": 1,
  "san": "e4",
  "comment": "The King's Pawn opening. White stakes an immediate claim in the center."
}
```

**Response `200` (created/updated):**

```json
{
  "id": "c1d2e3f4-...",
  "ply": 1,
  "san": "e4",
  "comment": "The King's Pawn opening. White stakes an immediate claim in the center.",
  "createdAt": "2024-11-03T09:15:00Z",
  "updatedAt": "2024-11-03T11:30:00Z"
}
```

**Response `200` (deleted — empty comment):**

```json
{
  "deleted": true,
  "ply": 1,
  "san": "e4"
}
```

**Response `403`:**

```json
{
  "message": "Only the assigned reviewer can add comments"
}
```

---

## Profile

### `GET /api/profile/stats`

Get the authenticated user's activity stats.

**Response `200`:**

```json
{
  "submitted": 12,
  "reviewed": 8,
  "inProgress": 3
}
```

---

### `GET /api/profile/games`

Get games submitted by the authenticated user.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | uuid | — | Pagination cursor |
| `limit` | int | 10 | Max 50 |

**Response `200`:**

```json
{
  "games": [
    {
      "id": "f7e6d5c4-...",
      "title": "King's Indian Attack",
      "status": "pending",
      "timeControl": "30m",
      "averageRating": 1200,
      "submittedAt": "2024-10-31T18:45:00Z",
      "reviewer": null
    }
  ],
  "nextCursor": "f7e6d5c4-...",
  "hasMore": false
}
```

---

### `GET /api/profile/reviews`

Get games reviewed by (or currently being reviewed by) the authenticated user.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | uuid | — | Pagination cursor |
| `limit` | int | 10 | Max 50 |
| `status` | string | — | `in_review` or `completed` |

**Response `200`:**

```json
{
  "games": [
    {
      "id": "b8a9c0d1-...",
      "title": "Italian Game Masterclass",
      "status": "in_review",
      "timeControl": "10+5",
      "submittedAt": "2024-10-29T16:20:00Z",
      "claimedAt": "2024-10-30T09:00:00Z",
      "author": {
        "id": "e2f3g4h5-...",
        "displayName": "Morgan Lee"
      }
    }
  ],
  "nextCursor": "b8a9c0d1-...",
  "hasMore": false
}
```

---

## Error Responses

All errors follow this shape:

```json
{
  "message": "Human-readable error description",
  "errors": []
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error (bad body/params) |
| `401` | Missing or invalid auth token |
| `403` | Authenticated but not authorized for this action |
| `404` | Resource not found |
| `409` | Conflict (e.g. game already claimed, can't delete reviewed game) |
| `500` | Internal server error |

---

## Database Tables (Prisma)

```
┌──────────────────┐       ┌──────────────────────┐
│      users       │       │        games          │
├──────────────────┤       ├──────────────────────-┤
│ id          (PK) │◄──┐   │ id             (PK)   │
│ email            │   ├───│ author_id      (FK)   │
│ display_name     │   └───│ reviewer_id    (FK?)  │
│ chess_username?  │       │ title                 │
│ rating?          │       │ pgn                   │
│ created_at       │       │ status (enum)         │
└──────────────────┘       │ time_control          │
                           │ average_rating?       │
                           │ review_notes?         │
                           │ created_at            │
                           │ claimed_at?           │
                           │ completed_at?         │
                           └───────────┬───────────┘
                                       │
                           ┌───────────┴───────────┐
                           │   review_comments     │
                           ├───────────────────────┤
                           │ id             (PK)   │
                           │ game_id        (FK)   │
                           │ reviewer_id    (FK)   │
                           │ ply                   │
                           │ san?                  │
                           │ comment               │
                           │ created_at            │
                           │ updated_at            │
                           └───────────────────────┘
```
