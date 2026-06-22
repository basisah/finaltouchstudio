import { memo } from "react";
import { isItemRentable } from "../../../utils/itemStock";
import { getItemIcon } from "../utils/itemIcon";
import styles from "../ItemsPage.module.css";

function InventoryItemCard({ item, categoryMap, onRent }) {
  const canRent = isItemRentable(item);
  const title = item.title || item.name || "Untitled Item";
  const categoryLabel = categoryMap?.[item.categoryId]?.label || item.categoryId;
  const hasUpload = item.image && String(item.image).startsWith("/uploads");

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemCardThumb}>
        {hasUpload ? (
          <img src={item.image} alt="" className={styles.itemCardImg} loading="lazy" decoding="async" />
        ) : item.image && !String(item.image).startsWith("/uploads") ? (
          <span className={styles.itemCardEmoji}>{item.image}</span>
        ) : (
          <span className={styles.itemCardSvg}>{getItemIcon(title)}</span>
        )}
      </div>

      <div className={styles.itemCardBody}>
        <h4 className={styles.itemCardTitle}>{title}</h4>
        <p className={styles.itemCardOccasion}>{categoryLabel}</p>

        <div className={styles.itemCardFooter}>
          <span className={styles.itemCardPrice}>
            $25<span className={styles.itemCardPriceUnit}>/day</span>
          </span>
          <button
            type="button"
            className={`${styles.rentBtn} ${!canRent ? styles.rentBtnDisabled : ""}`}
            disabled={!canRent}
            onClick={() => canRent && onRent(item)}
          >
            {canRent ? "Rent" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(InventoryItemCard);
