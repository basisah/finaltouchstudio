import styles from "./HeroSection.module.css";

export default function HeroTitle() {
  return (
    <div className={styles.titleBlock}>
      {/* Great Vibes script eyebrow */}
      <span className={styles.eyebrow}>The Art of Celebration</span>

      {/* H1 — exactly 2 lines */}
      <h1 className={styles.headline}>
        Every Moment Deserves<br />
        <em className={styles.headlineItalic}>a Final Touch</em>
      </h1>
    </div>
  );
}
