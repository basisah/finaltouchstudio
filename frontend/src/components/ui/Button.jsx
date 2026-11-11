import { Link } from "react-router-dom";
import { cx } from "./cx";
import styles from "./ui.module.css";

/**
 * Button — renders a <button>, a router <Link> (`to`) or an <a> (`href`).
 * variant: primary | secondary | ghost | gold | onDark | outlineOnDark | danger
 * size:    sm | md | lg
 */
export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  to,
  href,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}) {
  const classes = cx(styles.button, styles[variant], size !== "md" && styles[size], block && styles.block, className);
  const content = (
    <>
      {loading && <span className={styles.buttonSpinner} aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
