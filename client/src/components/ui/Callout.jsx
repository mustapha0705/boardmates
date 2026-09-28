/** Callout primitive for inline errors, confirmations and "planned capability" notes. */

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

function PlannedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="M3 12h2M19 12h2" />
    </svg>
  );
}

const TONE_ICONS = {
  info: InfoIcon,
  planned: PlannedIcon,
  success: CheckCircleIcon,
  warning: AlertIcon,
  error: AlertIcon,
  neutral: InfoIcon,
};

export default function Callout({ tone = "neutral", title, role, children, className = "" }) {
  const Icon = TONE_ICONS[tone] ?? InfoIcon;
  const classes = ["bm-callout", tone === "neutral" ? "" : `bm-callout--${tone}`, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role={role}>
      <span className="bm-callout__icon">
        <Icon />
      </span>
      <div>
        {title ? <p className="bm-callout__title">{title}</p> : null}
        {children ? <p className="bm-callout__body">{children}</p> : null}
      </div>
    </div>
  );
}
