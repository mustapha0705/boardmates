import { useEffect, useId, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog primitive: focus is moved in on open, kept inside while open,
 * restored on close, and Escape or a backdrop click closes it.
 * Render it conditionally; it has no internal open state.
 */
export default function Dialog({ title, lead, onClose, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  // Callers usually pass an inline handler; reading it through a ref keeps the effect
  // below mount-only, so a parent re-render never moves focus back to the first control.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const node = dialogRef.current;
    const focusablesIn = () => Array.from(node?.querySelectorAll(FOCUSABLE) ?? []);
    (focusablesIn()[0] ?? node)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusablesIn();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div
      className="bm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div className="bm-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} tabIndex={-1}>
        <h2 className="bm-dialog__title" id={titleId}>
          {title}
        </h2>
        {lead ? <p className="bm-dialog__lead">{lead}</p> : null}
        {children}
      </div>
    </div>
  );
}
