import heroBg from "../../../assets/Hero_bg_white_beach.jpg";
import styles from "./HeroSection.module.css";

/**
 * HeroImage
 * Full-bleed background image with a dark gradient overlay.
 * Lives separately so it can be swapped independently of the text content.
 */
export default function HeroImage() {
  return (
    <div className={styles.imageWrapper}>
      <img
        src={heroBg}
        alt="Luxury event decoration by FinalTouch Studio"
        className={styles.image}
        loading="eager"
      />
      {/* Gradient overlay — keeps text legible */}
      <div className={styles.overlay} />
    </div>
  );
}
