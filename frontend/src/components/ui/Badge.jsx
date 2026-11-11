import { cx } from "./cx";
import styles from "./ui.module.css";

const TONES = {
  neutral: styles.badgeNeutral,
  accent: styles.badgeAccent,
  gold: styles.badgeGold,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
};

/** Small status pill. tone: neutral | accent | gold | success | warning | danger */
export default function Badge({ tone = "neutral", dot = false, className, children }) {
  return <span className={cx(styles.badge, TONES[tone], dot && styles.badgeDot, className)}>{children}</span>;
}
