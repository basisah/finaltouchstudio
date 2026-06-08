import { useRef } from "react";
import { OCCASIONS } from "../../../constants/categories";
import styles from "./OccasionsCarousel.module.css";

const CARD_COLORS = [
  "#542141", /* aubergine */
  "#9F507C", /* mauve */
  "#34162A", /* deep plum */
  "#6B3E5A", /* muted purple */
  "#B8729A", /* light mauve */
  "#7B4163", /* berry */
];

export default function OccasionsCarousel() {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section id="occasions" className={styles.section} aria-label="Occasions carousel">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Curated Collections</p>
          <h2 className={styles.heading}>Shop by Occasion</h2>
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={() => scroll(-1)} aria-label="Previous">‹</button>
          <button className={styles.arrow} onClick={() => scroll(1)}  aria-label="Next">›</button>
        </div>
      </div>

      <div className={styles.trackWrapper}>
        <div className={styles.track} ref={trackRef}>
          {OCCASIONS.map((occ, i) => (
            <button key={occ.id} className={styles.card} style={{ "--card-color": CARD_COLORS[i % CARD_COLORS.length] }}>
              <span className={styles.cardEmoji}>{occ.emoji}</span>
              <span className={styles.cardLabel}>{occ.label}</span>
              <span className={styles.cardArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
