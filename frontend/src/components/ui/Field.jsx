import { useId } from "react";
import { cx } from "./cx";
import styles from "./ui.module.css";

/**
 * Labelled form control. Renders an <input> by default, or a <textarea> /
 * <select> via `as`. Label, hint and error are wired up for screen readers.
 */
export default function Field({ label, hint, error, as: Tag = "input", className, id, children, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <Tag
        id={fieldId}
        className={cx(styles.input, error && styles.inputInvalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </Tag>
      {error ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${fieldId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}

/** Inline status message. tone: success | error | info */
export function Alert({ tone = "info", children, className }) {
  const toneClass = { success: styles.alertSuccess, error: styles.alertError, info: styles.alertInfo }[tone];
  return (
    <div className={cx(styles.alert, toneClass, className)} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
