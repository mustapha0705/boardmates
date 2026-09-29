import { useId, useRef } from "react";

/**
 * Segmented tabs from the export's profile screen, with the WAI-ARIA tabs pattern:
 * one tab stop, arrow keys / Home / End move between tabs, panels are labelled by their tab.
 * `tabs` is [{ id, label, count? }]; render the active panel with `TabPanel`.
 */
export function Tabs({ tabs, active, onChange, label, idBase: idBaseProp }) {
  const generated = useId();
  const idBase = idBaseProp ?? generated;
  const refs = useRef({});

  function focusTab(index) {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  }

  function handleKeyDown(event, index) {
    if (event.key === "ArrowRight") focusTab(index + 1);
    else if (event.key === "ArrowLeft") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(tabs.length - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div className="bm-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`bm-tabs__tab ${selected ? "is-active" : ""}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {Number.isFinite(tab.count) ? <span className="bm-tabs__count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idBase, id, children }) {
  return (
    <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} className="bm-tabpanel">
      {children}
    </div>
  );
}
