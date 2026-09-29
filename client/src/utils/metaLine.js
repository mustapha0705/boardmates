/** Joins the non-empty parts of a meta line with a middle dot. */
export function metaLine(...parts) {
  return parts.filter((part) => part !== null && part !== undefined && part !== "").join(" · ");
}
