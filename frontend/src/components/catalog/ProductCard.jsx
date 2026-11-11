import { memo } from "react";
import { Link } from "react-router-dom";
import { isItemRentable } from "../../utils/itemStock";
import { formatPrice } from "../../utils/format";
import { Badge, MinusIcon, PlusIcon } from "../ui";
import ItemImage from "./ItemImage";
import styles from "./ProductCard.module.css";

/**
 * Catalogue card for one rentable item.
 * When the item is already in the cart (`cartLine`), the Rent button becomes
 * a quantity stepper.
 */
function ProductCard({ item, categoryLabel, cartLine, onRent, onQuantityChange }) {
  const title = item.title || item.name || "Untitled item";
  const rentable = isItemRentable(item);

  return (
    <article className={`${styles.card} ${cartLine ? styles.inCart : ""}`}>
      <Link to={`/item/${item.id}`} className={styles.media} aria-label={`View ${title}`}>
        <ItemImage
          src={item.image}
          alt={title}
          width={600}
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"
        />
        {!rentable && (
          <Badge tone="danger" className={styles.flag}>
            Unavailable
          </Badge>
        )}
        {cartLine && (
          <Badge tone="accent" className={styles.flag}>
            In cart
          </Badge>
        )}
      </Link>

      <div className={styles.body}>
        {categoryLabel && <span className={styles.category}>{categoryLabel}</span>}
        <h3 className={styles.title}>
          <Link to={`/item/${item.id}`}>{title}</Link>
        </h3>

        <div className={styles.footer}>
          <p className={styles.price}>
            {formatPrice(item.price)}
            <span className={styles.unit}> / day</span>
          </p>

          {cartLine ? (
            <div className={styles.stepper} role="group" aria-label={`Quantity of ${title}`}>
              <button type="button" onClick={() => onQuantityChange(cartLine, -1)} aria-label="Decrease quantity">
                <MinusIcon width={14} height={14} />
              </button>
              <span aria-live="polite">{cartLine.quantity || 1}</span>
              <button type="button" onClick={() => onQuantityChange(cartLine, 1)} aria-label="Increase quantity">
                <PlusIcon width={14} height={14} />
              </button>
            </div>
          ) : (
            <button type="button" className={styles.rent} disabled={!rentable} onClick={() => onRent(item)}>
              <PlusIcon width={14} height={14} />
              Rent
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);

/** Loading placeholder with the same footprint as a ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.media} ${styles.skeletonBlock}`} />
      <div className={styles.body}>
        <span className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
      </div>
    </div>
  );
}
