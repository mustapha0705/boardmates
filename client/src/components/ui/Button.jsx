/**
 * Button primitive from the approved export's Controls section.
 * Renders a native button by default; pass `as={Link}` or `as="a"` for navigation.
 */
export default function Button({
  as: Component = "button",
  variant = "primary",
  size,
  block = false,
  loading = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "bm-btn",
    `bm-btn--${variant}`,
    size ? `bm-btn--${size}` : "",
    block ? "bm-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? <span className="bm-btn__spinner" aria-hidden="true" /> : null}
      {children}
    </>
  );

  if (Component === "button") {
    const { type = "button", ...buttonProps } = rest;
    return (
      <button type={type} className={classes} {...buttonProps}>
        {content}
      </button>
    );
  }

  return (
    <Component className={classes} {...rest}>
      {content}
    </Component>
  );
}
