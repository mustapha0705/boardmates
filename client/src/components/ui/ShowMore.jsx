import Button from "./Button.jsx";

/** "Show more" for a TanStack infinite query that pages through an existing API cursor. */
export default function ShowMore({ query, label = "Show more" }) {
  if (!query.hasNextPage) return null;
  return (
    <div className="bm-more">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => query.fetchNextPage()}
        loading={query.isFetchingNextPage}
        disabled={query.isFetchingNextPage}
      >
        {query.isFetchingNextPage ? "Loading…" : label}
      </Button>
    </div>
  );
}
