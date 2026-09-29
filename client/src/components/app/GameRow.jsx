import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import StatusPill from "../ui/StatusPill.jsx";

/**
 * Compact game row from the export's Home, Profile and My games lists.
 * Callers pass pre-formatted text; the row never invents values.
 */
export default function GameRow({ status, statusLabel, title, meta, aside, isPrivate = false, to, actionLabel }) {
  return (
    <Card className="bm-row">
      <StatusPill status={status} label={statusLabel} />
      <span className="bm-row__main">
        <span className="bm-row__title">{title}</span>
        {meta ? <span className="bm-row__meta">{meta}</span> : null}
      </span>
      {isPrivate ? <StatusPill status="private" /> : null}
      {aside ? <span className="bm-row__aside">{aside}</span> : null}
      <Button as={Link} to={to} variant="secondary" size="sm">
        {actionLabel}
      </Button>
    </Card>
  );
}
