import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  FEED_DEFAULT_LIMIT,
  FEED_MAX_LIMIT,
  INVALID_CURSOR_ERROR,
  buildFeedCursorLookupArgs,
  buildFeedFindManyArgs,
  parseFeedQuery,
} from "../src/utils/feedQuery.js";

// These tests check the Prisma arguments the feed builds. They do not run queries,
// so they cannot prove database pagination behaviour on their own.

const CURSOR_ID = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";
const OTHER_ID = "00000000-0000-4000-8000-000000000000";
const CURSOR_CREATED_AT = new Date("2026-05-10T12:00:00.000Z");
// Exactly the shape selected by buildFeedCursorLookupArgs: no id.
const CURSOR_GAME = { createdAt: CURSOR_CREATED_AT };
const ORDER_BY = [{ createdAt: "desc" }, { id: "desc" }];
const CURSOR_CONDITION = {
  OR: [
    { createdAt: { lt: CURSOR_CREATED_AT } },
    { createdAt: CURSOR_CREATED_AT, id: { lt: CURSOR_ID } },
  ],
};

function rejectedFields(query) {
  const result = parseFeedQuery(query);
  assert.equal(result.ok, false, `expected rejection for ${JSON.stringify(query)}`);
  return result.errors.map((e) => e.field);
}

describe("parseFeedQuery", () => {
  test("applies defaults when no params are given", () => {
    assert.deepEqual(parseFeedQuery({}), {
      ok: true,
      value: { limit: FEED_DEFAULT_LIMIT, statuses: null, cursor: null },
    });
  });

  test("accepts positive integer limits and caps values above the maximum", () => {
    const cases = [
      ["1", 1],
      ["25", 25],
      [String(FEED_MAX_LIMIT), FEED_MAX_LIMIT],
      [String(FEED_MAX_LIMIT + 1), FEED_MAX_LIMIT],
      ["100000000000000000000", FEED_MAX_LIMIT],
    ];
    for (const [raw, expected] of cases) {
      assert.equal(parseFeedQuery({ limit: raw }).value.limit, expected, `limit=${raw}`);
    }
  });

  test("rejects malformed, non-integer and non-positive limits", () => {
    for (const raw of ["", "0", "-1", "10.5", "1e2", "abc", "10abc", " 10", "010", ["10", "20"]]) {
      assert.deepEqual(rejectedFields({ limit: raw }), ["limit"], `limit=${JSON.stringify(raw)}`);
    }
  });

  test("accepts valid statuses, trimming whitespace and removing duplicates", () => {
    assert.deepEqual(parseFeedQuery({ status: "pending" }).value.statuses, ["pending"]);
    assert.deepEqual(parseFeedQuery({ status: " in_review , completed " }).value.statuses, [
      "in_review",
      "completed",
    ]);
    assert.deepEqual(parseFeedQuery({ status: "pending,in_review,completed,pending" }).value.statuses, [
      "pending",
      "in_review",
      "completed",
    ]);
  });

  test("rejects the status param when any comma-separated entry is empty or unknown", () => {
    const invalid = ["", "pending,", ",pending", "pending,,completed", "Pending", "archived", "pending,archived", ["pending", "completed"]];
    for (const raw of invalid) {
      assert.deepEqual(rejectedFields({ status: raw }), ["status"], `status=${JSON.stringify(raw)}`);
    }
  });

  test("accepts UUID cursors", () => {
    assert.equal(parseFeedQuery({ cursor: CURSOR_ID }).value.cursor, CURSOR_ID);
    assert.equal(parseFeedQuery({ cursor: CURSOR_ID.toUpperCase() }).value.cursor, CURSOR_ID.toUpperCase());
  });

  test("rejects malformed cursors with the same generic error used for unresolvable cursors", () => {
    const invalid = ["", "abc", CURSOR_ID.replaceAll("-", ""), `{${CURSOR_ID}}`, `${CURSOR_ID}0`, [CURSOR_ID, CURSOR_ID]];
    for (const raw of invalid) {
      const result = parseFeedQuery({ cursor: raw });
      assert.equal(result.ok, false, `cursor=${JSON.stringify(raw)}`);
      assert.deepEqual(result.errors, [INVALID_CURSOR_ERROR]);
    }
  });

  test("reports every invalid param in one response", () => {
    assert.deepEqual(rejectedFields({ limit: "0", status: "archived", cursor: "abc" }), ["limit", "status", "cursor"]);
  });
});

describe("buildFeedCursorLookupArgs", () => {
  test("resolves only publicly listed games and selects only createdAt", () => {
    assert.deepEqual(buildFeedCursorLookupArgs(CURSOR_ID), {
      where: { id: CURSOR_ID, isPrivate: false },
      select: { createdAt: true },
    });
  });

  test("requires the cursor game to be in the same status-filtered result set as the page", () => {
    assert.deepEqual(buildFeedCursorLookupArgs(CURSOR_ID, ["pending", "in_review"]), {
      where: { id: CURSOR_ID, isPrivate: false, status: { in: ["pending", "in_review"] } },
      select: { createdAt: true },
    });
  });
});

describe("buildFeedFindManyArgs", () => {
  test("first page excludes private games and fetches one extra row to detect more pages", () => {
    assert.deepEqual(buildFeedFindManyArgs({ limit: FEED_DEFAULT_LIMIT }), {
      where: { isPrivate: false },
      orderBy: ORDER_BY,
      take: FEED_DEFAULT_LIMIT + 1,
    });
  });

  test("status filter is added alongside the privacy filter", () => {
    assert.deepEqual(buildFeedFindManyArgs({ limit: 10, statuses: ["pending", "completed"] }), {
      where: { isPrivate: false, status: { in: ["pending", "completed"] } },
      orderBy: ORDER_BY,
      take: 11,
    });
  });

  test("completed games do not bypass the privacy filter", () => {
    const { where } = buildFeedFindManyArgs({ limit: 10, statuses: ["completed"] });
    assert.equal(where.isPrivate, false);
    assert.equal("OR" in where, false);
  });

  test("cursor page keeps the privacy filter instead of replacing it", () => {
    assert.deepEqual(buildFeedFindManyArgs({ limit: 10, cursor: CURSOR_ID, cursorGame: CURSOR_GAME }), {
      where: { isPrivate: false, AND: [CURSOR_CONDITION] },
      orderBy: ORDER_BY,
      take: 11,
    });
  });

  test("cursor page keeps both the privacy and status filters", () => {
    assert.deepEqual(
      buildFeedFindManyArgs({
        limit: FEED_MAX_LIMIT,
        statuses: ["in_review"],
        cursor: CURSOR_ID,
        cursorGame: CURSOR_GAME,
      }),
      {
        where: { isPrivate: false, status: { in: ["in_review"] }, AND: [CURSOR_CONDITION] },
        orderBy: ORDER_BY,
        take: FEED_MAX_LIMIT + 1,
      },
    );
  });

  test("id tie-break uses the validated cursor UUID, never an id from the lookup result", () => {
    const { where } = buildFeedFindManyArgs({ limit: 10, cursor: CURSOR_ID, cursorGame: CURSOR_GAME });
    assert.deepEqual(where.AND[0].OR[1], { createdAt: CURSOR_CREATED_AT, id: { lt: CURSOR_ID } });

    const withStrayId = buildFeedFindManyArgs({
      limit: 10,
      cursor: CURSOR_ID,
      cursorGame: { ...CURSOR_GAME, id: OTHER_ID },
    });
    assert.deepEqual(withStrayId.where.AND[0].OR[1].id, { lt: CURSOR_ID });
  });

  test("throws when a cursor is given without the lookup result's createdAt", () => {
    assert.throws(() => buildFeedFindManyArgs({ limit: 10, cursor: CURSOR_ID }), TypeError);
    assert.throws(() => buildFeedFindManyArgs({ limit: 10, cursor: CURSOR_ID, cursorGame: {} }), TypeError);
  });
});
