import { Brand } from "./Navbar";
import styles from "./AuthShell.module.css";

/**
 * Centred card used by the customer and admin sign-in screens, so both
 * share one look.
 */
export default function AuthShell({ eyebrow, title, lead, children, footer }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Brand />
        <div className={styles.card}>
          <header className={styles.header}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
          </header>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
