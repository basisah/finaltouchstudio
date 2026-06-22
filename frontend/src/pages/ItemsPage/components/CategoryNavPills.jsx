import { memo } from "react";
import styles from "../ItemsPage.module.css";

function CategoryNavPills({ categories, activeId, onSelect }) {
  if (!categories?.length) return null;

  return (
    <nav className={styles.pillsNav} aria-label="Category navigation">
      <div className={styles.pillsTrack}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.pill} ${activeId === cat.id ? styles.pillActive : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.id !== "all" && <span className={styles.pillEmoji}>{cat.emoji}</span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default memo(CategoryNavPills);
