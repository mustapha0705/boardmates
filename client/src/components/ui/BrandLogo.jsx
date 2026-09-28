/** Boardmates mark and wordmark from the approved export. */
export default function BrandLogo({ size = 30, showWordmark = true, tagline, className = "" }) {
  const classes = ["bm-brand", className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="bm-brand__mark" style={{ width: size, height: size }} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {showWordmark ? (
        <span className="bm-brand__text">
          <span className="bm-brand__name">Boardmates</span>
          {tagline ? <span className="bm-brand__tagline">{tagline}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
