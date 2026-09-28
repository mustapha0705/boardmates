import { createElement } from "react";

/**
 * Card/panel primitive. Pass `as={Link}` (with `interactive`) for clickable cards.
 * Uses createElement so the `as` prop is a normal reference for linting.
 */
export default function Card({
  as = "div",
  variant,
  interactive = false,
  accent = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "bm-card",
    variant ? `bm-card--${variant}` : "",
    interactive ? "bm-card--interactive" : "",
    accent ? "bm-card--accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return createElement(as, { className: classes, ...rest }, children);
}
