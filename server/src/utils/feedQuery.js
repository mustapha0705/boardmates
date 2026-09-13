export const FEED_STATUSES = ["pending", "in_review", "completed"];
export const FEED_DEFAULT_LIMIT = 10;
export const FEED_MAX_LIMIT = 50;

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Used for malformed, unknown, private and status-filtered-out cursors alike,
 * so the response never reveals whether a private game exists.
 */
export const INVALID_CURSOR_ERROR = Object.freeze({ field: "cursor", message: "Invalid cursor" });

/**
 * Validates `GET /api/games` query params. Express's simple query parser yields strings,
 * or arrays for repeated keys; anything other than a single valid string is rejected.
 * @returns {{ ok: true, value: { limit: number, statuses: string[] | null, cursor: string | null } }
 *   | { ok: false, errors: { field: string, message: string }[] }}
 */
export function parseFeedQuery(query = {}) {
  const { limit: rawLimit, status: rawStatus, cursor: rawCursor } = query;
  const errors = [];

  let limit = FEED_DEFAULT_LIMIT;
  if (rawLimit !== undefined) {
    if (typeof rawLimit === "string" && POSITIVE_INTEGER.test(rawLimit)) {
      limit = Math.min(Number(rawLimit), FEED_MAX_LIMIT);
    } else {
      errors.push({ field: "limit", message: "limit must be a positive integer" });
    }
  }

  let statuses = null;
  if (rawStatus !== undefined) {
    const values = typeof rawStatus === "string" ? rawStatus.split(",").map((s) => s.trim()) : [];
    if (values.length === 0 || values.some((s) => !FEED_STATUSES.includes(s))) {
      errors.push({
        field: "status",
        message: `status must be a comma-separated list of ${FEED_STATUSES.join(", ")}`,
      });
    } else {
      statuses = [...new Set(values)];
    }
  }

  let cursor = null;
  if (rawCursor !== undefined) {
    if (typeof rawCursor === "string" && UUID.test(rawCursor)) {
      cursor = rawCursor;
    } else {
      errors.push(INVALID_CURSOR_ERROR);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { limit, statuses, cursor } };
}

/** The public result set: private games are never listed, whatever their status. */
function feedFilter(statuses) {
  return statuses ? { isPrivate: false, status: { in: statuses } } : { isPrivate: false };
}

/**
 * A cursor must belong to the same public, status-filtered result set that it paginates.
 * Only `createdAt` is selected; the id tie-break uses the validated cursor UUID itself.
 */
export function buildFeedCursorLookupArgs(cursor, statuses = null) {
  return {
    where: { id: cursor, ...feedFilter(statuses) },
    select: { createdAt: true },
  };
}

/**
 * @param {{
 *   limit: number,
 *   statuses?: string[] | null,
 *   cursor?: string | null,
 *   cursorGame?: { createdAt: Date } | null,
 * }} params `cursor` is the validated UUID from the request; `cursorGame` is the cursor lookup result.
 */
export function buildFeedFindManyArgs({ limit, statuses = null, cursor = null, cursorGame = null }) {
  const where = feedFilter(statuses);

  if (cursor) {
    // Prisma ignores undefined filter values, which would silently disable pagination.
    if (!(cursorGame?.createdAt instanceof Date)) {
      throw new TypeError("cursorGame.createdAt is required when cursor is set");
    }
    // Nested under AND so pagination can never replace the privacy or status filters.
    where.AND = [
      {
        OR: [
          { createdAt: { lt: cursorGame.createdAt } },
          { createdAt: cursorGame.createdAt, id: { lt: cursor } },
        ],
      },
    ];
  }

  return {
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  };
}
