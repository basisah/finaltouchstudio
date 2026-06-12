import { memo, useState, useCallback } from "react";
import InventoryItemCard from "./InventoryItemCard";
import styles from "../ItemsPage.module.css";

function InventoryCategorySection({
  category,
  items,
  categoryMap,
  onRentItem,
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleRentFirst = useCallback(() => {
    setExpanded(true);
    if (items[0]) onRentItem(items[0]);
  }, [items, onRentItem]);

  if (!items.length) return null;

  return (
    <section
      id={`category-section-${category.id}`}
      className={styles.categorySection}
      style={{ "--section-accent": category.color || category.accent || "#BD7893" }}
    >
      <header className={styles.categorySectionHeader}>
        <button
          type="button"
          className={styles.categoryCollapseBtn}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className={`${styles.collapseIcon} ${expanded ? styles.collapseIconOpen : ""}`}>
            ▼
          </span>
          <div className={styles.categoryHeaderText}>
            <h2 className={styles.categorySectionTitle}>
              <span className={styles.categorySectionEmoji}>{category.emoji}</span>
              {category.label}
            </h2>
            <p className={styles.categorySectionCount}>
              {items.length} {items.length === 1 ? "Item" : "Items"} Available
            </p>
          </div>
        </button>

        <div className={styles.categoryHeaderActions}>
          <button
            type="button"
            className={styles.categoryActionBtn}
            onClick={() => setExpanded(true)}
          >
            View All
          </button>
          <button
            type="button"
            className={`${styles.categoryActionBtn} ${styles.categoryActionBtnPrimary}`}
            onClick={handleRentFirst}
          >
            Rent Item
          </button>
        </div>
      </header>

      <div className={styles.categoryDivider} />

      {category.description && (
        <p className={styles.categoryDescription}>{category.description}</p>
      )}

      {expanded && (
        <div className={styles.categoryBody}>
          <div className={styles.itemGrid}>
            {items.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                categoryMap={categoryMap}
                onRent={onRentItem}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(InventoryCategorySection);
