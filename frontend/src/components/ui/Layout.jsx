import { cx } from "./cx";
import styles from "./ui.module.css";

/** Centres content at the site width with responsive side gutters. */
export function Container({ narrow = false, as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag className={cx(styles.container, narrow && styles.containerNarrow, className)} {...rest}>
      {children}
    </Tag>
  );
}

/** A vertical page band. tone: default | alt | dark */
export function Section({ tone = "default", narrow = false, className, children, ...rest }) {
  return (
    <section
      className={cx(styles.section, tone === "alt" && styles.sectionAlt, tone === "dark" && styles.sectionDark, className)}
      {...rest}
    >
      <Container narrow={narrow}>{children}</Container>
    </section>
  );
}

/** Eyebrow + title + lead used at the top of every section. */
export function SectionHeading({ eyebrow, title, lead, center = false, as: Tag = "h2", className }) {
  return (
    <header className={cx(styles.heading, center && styles.headingCenter, className)}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <Tag className={styles.headingTitle}>{title}</Tag>
      {lead && <p className={styles.headingLead}>{lead}</p>}
    </header>
  );
}

export function Card({ padded = false, interactive = false, as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag className={cx(styles.card, padded && styles.cardPadded, interactive && styles.cardInteractive, className)} {...rest}>
      {children}
    </Tag>
  );
}
