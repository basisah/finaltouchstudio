import { useNavigate } from "react-router-dom";
import { DISPLAY_CATEGORIES } from "../../ItemsPage/itemsPageCategories";
import styles from "./OccasionsCarousel.module.css";

export default function OccasionsCarousel() {
  const navigate = useNavigate();
  const categories = DISPLAY_CATEGORIES.filter((c) => c.id !== "all");

  return (
    <section className={styles.section} id="catalog">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Catalog</h2>
          <p className={styles.sectionSub}>Browse our rental inventory by category</p>
        </div>

        <div className={styles.gridContainer}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={styles.gridItem}
              onClick={() => navigate(`/items?category=${category.id}`)}
            >
              <div className={styles.circleCard}>
                <span className={styles.subcatEmoji}>{category.emoji}</span>
              </div>
              <div className={styles.cardLabelWrapper}>
                <span className={styles.cardLabel}>{category.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
