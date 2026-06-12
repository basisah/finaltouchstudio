import { useNavigate } from "react-router-dom";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";
import styles from "./OccasionsCarousel.module.css";

// Category icons
import birthdayIcon from "../../../assets/Icons/birthday-cake.png";
import marriageIcon from "../../../assets/Icons/wedding-couple.png";
import bridalIcon from "../../../assets/Icons/bridal-shower.png";
import babyIcon from "../../../assets/Icons/baby.png";
import managerIcon from "../../../assets/Icons/manager.png";

const categoryIcons = {
  birthday: birthdayIcon,
  marriage: marriageIcon,
  holud: bridalIcon,
  baby: babyIcon,
  global: managerIcon,
};

// Category accent colors matching inventory
const categoryColors = {
  birthday: { accent: "#E879A0", bg: "rgba(232, 121, 160, 0.08)", border: "rgba(232, 121, 160, 0.20)" },
  marriage: { accent: "#C084FC", bg: "rgba(192, 132, 252, 0.08)", border: "rgba(192, 132, 252, 0.20)" },
  holud:    { accent: "#FBBF24", bg: "rgba(251, 191, 36, 0.08)",  border: "rgba(251, 191, 36, 0.20)"  },
  baby:     { accent: "#818CF8", bg: "rgba(129, 140, 248, 0.08)", border: "rgba(129, 140, 248, 0.20)" },
  global:   { accent: "#BD7893", bg: "rgba(189, 120, 147, 0.08)", border: "rgba(189, 120, 147, 0.20)" },
};

export default function OccasionsCarousel() {
  const navigate = useNavigate();

  return (
    <section className={styles.section} id="catalog">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Catalog</h2>
          <p className={styles.sectionSub}>
            Browse by product type — pick an occasion collection to see items
          </p>
        </div>

        {INVENTORY_CATEGORIES.map((category) => {
          const colors = categoryColors[category.id] || categoryColors.global;
          const icon = categoryIcons[category.id];

          return (
            <div
              key={category.id}
              className={styles.categoryBlock}
              style={{ "--category-color": colors.accent }}
            >
              <div className={styles.categoryHeader}>
                {icon ? (
                  <img src={icon} alt="" className={styles.catIcon} />
                ) : (
                  <span className={styles.catIconEmoji}>{category.emoji || "✨"}</span>
                )}
                <h3
                  className={styles.categoryTitle}
                  style={{ color: colors.accent }}
                >
                  {category.label}
                </h3>
                <button
                  type="button"
                  className={styles.viewAllBtn}
                  style={{ color: colors.accent, borderColor: colors.border }}
                  onClick={() => navigate(`/items?category=${category.id}`)}
                >
                  View All →
                </button>
              </div>

              <div className={styles.gridContainer}>
                {category.subcategories?.map((subcat) => (
                  <div
                    key={subcat.id}
                    className={styles.gridItem}
                    onClick={() => navigate(`/items?category=${category.id}&subcategory=${subcat.id}`)}
                  >
                    <div className={styles.circleCard}>
                      <span className={styles.subcatEmoji}>{subcat.emoji}</span>
                    </div>
                    <div className={styles.cardLabelWrapper}>
                      <span className={styles.cardLabel}>{subcat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
