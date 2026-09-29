/**
 * Filter chips from the export's "My games" screen. Each chip is a toggle button;
 * exactly one is pressed. `options` is [{ id, label }].
 */
export default function FilterChips({ options, value, onChange, label }) {
  return (
    <div className="bm-chips" role="group" aria-label={label}>
      {options.map((option) => {
        const pressed = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={`bm-chip ${pressed ? "is-active" : ""}`}
            aria-pressed={pressed}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
