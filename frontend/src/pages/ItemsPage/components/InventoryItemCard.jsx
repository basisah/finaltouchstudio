import { memo } from "react";
import { getDisplayCategoryById, getDisplayCategoryId } from "../itemsPageCategories";
import { getItemStatus } from "../utils/itemStatus";
import { getItemIcon } from "../utils/itemIcon";
import styles from "../ItemsPage.module.css";

function InventoryItemCard({
  item,
  inCart,
  cartQuantity,
  onOpen,
  onAdd,
  onIncreaseQty,
  onDecreaseQty,
}) {
  const status = getItemStatus(item);
  const title = item.title || item.name || "Untitled Item";
  const categoryLabel =
    getDisplayCategoryById(getDisplayCategoryId(item.categoryId))?.label || item.categoryId;
  const hasUpload = item.image && String(item.image).startsWith("/uploads");

  return (
    <article
      className={`${styles.itemCard} ${inCart ? styles.itemCardInCart : ""}`}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
      role="button"
      tabIndex={0}
    >
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

        <div className={styles.itemCardMeta}>
          <span className={styles.itemCardQty}>Qty: {item.unit_count || 1}</span>
          <span className={`${styles.statusBadge} ${styles[`status${status.variant}`]}`}>
            {status.label}
          </span>
        </div>

        <div className={styles.itemCardFooter} onClick={(e) => e.stopPropagation()}>
          <span className={styles.itemCardPrice}>
            $25<span className={styles.itemCardPriceUnit}>/day</span>
          </span>
          {inCart ? (
            <div className={styles.qtyControl}>
              <button type="button" className={styles.qtyBtn} onClick={onDecreaseQty} aria-label="Decrease quantity">
                −
              </button>
              <span className={styles.qtyNum}>{cartQuantity}</span>
              <button type="button" className={styles.qtyBtn} onClick={onIncreaseQty} aria-label="Increase quantity">
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.rentBtn}
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              Rent
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(InventoryItemCard);
