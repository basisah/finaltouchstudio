import { cx } from "./cx";
import { SparkleIcon, CheckIcon } from "./icons";
import styles from "./ui.module.css";

/** Shimmering placeholder block; size it with width / height / radius. */
export function Skeleton({ width = "100%", height = "1em", radius, className, style }) {
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function Spinner({ className }) {
  return <span className={cx(styles.spinner, className)} role="status" aria-label="Loading" />;
}

/** Centred spinner used while a route chunk or a page's data loads. */
export function PageLoader({ label = "Loading…" }) {
  return (
    <div className={styles.pageLoader}>
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

/** Friendly placeholder for empty lists and failed loads. */
export function EmptyState({ icon, title, children, actions, className }) {
  return (
    <div className={cx(styles.empty, className)}>
      <span className={styles.emptyIcon} aria-hidden="true">
        {icon || <SparkleIcon />}
      </span>
      <h2 className={styles.emptyTitle}>{title}</h2>
      {children && <p className={styles.emptyText}>{children}</p>}
      {actions && <div className={styles.emptyActions}>{actions}</div>}
    </div>
  );
}

/** Bottom-centre confirmation; pair it with the `useToast` hook. */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <CheckIcon />
      <span>{message}</span>
    </div>
  );
}
