/**
 * Lifecycle status pill. Labels describe only what the current backend supports:
 * pending, in_review and completed, plus the private flag.
 */

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

const STATUS_PILLS = {
  completed: { label: "Human reviewed", tone: "approved", Icon: CheckIcon },
  in_review: { label: "Being reviewed", tone: "action", Icon: ClockIcon },
  pending: { label: "Waiting for a reviewer", tone: "waiting", Icon: ClockIcon },
  private: { label: "Private", tone: "neutral", Icon: LockIcon },
};

export default function StatusPill({ status, label: labelOverride, className = "" }) {
  const config = STATUS_PILLS[status];
  if (!config) return null;

  const { label, tone, Icon } = config;
  const classes = ["bm-pill", tone === "neutral" ? "" : `bm-pill--${tone}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="bm-pill__icon">
        <Icon />
      </span>
      {labelOverride ?? label}
    </span>
  );
}
