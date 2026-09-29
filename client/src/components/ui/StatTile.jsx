/** Stat tile from the export's dashboard. Shows an em dash until the value loads. */
export default function StatTile({ label, value, tone }) {
  const valueClass = ["bm-stat__value", tone ? `bm-stat__value--${tone}` : ""].filter(Boolean).join(" ");
  const display = Number.isFinite(value) ? value : "—";

  return (
    <div className="bm-stat">
      <span className="bm-stat__label">{label}</span>
      <span className={valueClass}>{display}</span>
    </div>
  );
}
