import { useId, useState } from "react";

/** Form-field primitives from the approved export's authentication and submit screens. */

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FieldShell({ id, label, labelAside, hint, hintTone, children }) {
  const hintClass = hintTone ? `bm-field__hint bm-field__hint--${hintTone}` : "bm-field__hint";
  return (
    <div className="bm-field">
      {labelAside ? (
        <div className="bm-field__label-row">
          <label className="bm-field__label" htmlFor={id}>
            {label}
          </label>
          {labelAside}
        </div>
      ) : (
        <label className="bm-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      {children}
      {hint ? (
        <p className={hintClass} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ id: idProp, label, labelAside, hint, hintTone, icon, className = "", ...inputProps }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const classes = ["bm-input", icon ? "bm-input--with-icon" : "", className].filter(Boolean).join(" ");

  return (
    <FieldShell id={id} label={label} labelAside={labelAside} hint={hint} hintTone={hintTone}>
      <div className="bm-field__control">
        {icon ? <span className="bm-field__icon">{icon}</span> : null}
        <input id={id} className={classes} aria-describedby={hint ? `${id}-hint` : undefined} {...inputProps} />
      </div>
    </FieldShell>
  );
}

export function PasswordField({ id: idProp, label, labelAside, hint, hintTone, className = "", ...inputProps }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);
  const classes = ["bm-input", "bm-input--with-action", className].filter(Boolean).join(" ");

  return (
    <FieldShell id={id} label={label} labelAside={labelAside} hint={hint} hintTone={hintTone}>
      <div className="bm-field__control">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={classes}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          className="bm-field__action"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </FieldShell>
  );
}

export function SelectField({ id: idProp, label, hint, hintTone, children, className = "", ...selectProps }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const classes = ["bm-select", className].filter(Boolean).join(" ");

  return (
    <FieldShell id={id} label={label} hint={hint} hintTone={hintTone}>
      <div className="bm-field__control">
        <select id={id} className={classes} aria-describedby={hint ? `${id}-hint` : undefined} {...selectProps}>
          {children}
        </select>
        <span className="bm-field__caret">
          <CaretIcon />
        </span>
      </div>
    </FieldShell>
  );
}
