import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getItemStockQuantity } from "../../utils/itemStock";
import {
  formatPostalCodeInput,
  getDeliveryStatus,
  isDeliveryAllowed,
} from "../../utils/saskatoonDelivery";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./CartPage.module.css";

const MOCK_PRICE_PER_ITEM = 25;

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function getDeliveryAvailabilityLabel(status) {
  if (!status || status.status === "empty" || status.status === "incomplete") {
    return { text: "Saskatoon postal codes only", ok: null };
  }
  if (status.status === "available") return { text: "Available", ok: true };
  return { text: "Unavailable — Saskatoon only", ok: false };
}

function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Invalid";
  }
}

function ItemImage({ item }) {
  const hasUpload = item?.image && String(item.image).startsWith("/uploads");
  if (hasUpload) {
    return <img src={item.image} alt="" className={styles.itemImage} />;
  }
  return (
    <div className={styles.itemImagePlaceholder}>
      {item?.image && !String(item.image).startsWith("/uploads") ? item.image : "✨"}
    </div>
  );
}

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    setCartItemQuantity,
    fulfillmentType,
    setFulfillmentType,
    postalCode,
    setPostalCode,
  } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (total, c) => total + (c.quantity || 1) * MOCK_PRICE_PER_ITEM,
    0
  );

  const deliveryStatus =
    fulfillmentType === "delivery" ? getDeliveryStatus(postalCode) : null;
  const deliveryAvailability = getDeliveryAvailabilityLabel(deliveryStatus);
  const deliveryVerified = isDeliveryAllowed(postalCode);
  const canCheckout =
    fulfillmentType === "pickup" ||
    (fulfillmentType === "delivery" && deliveryVerified);

  const handleSelectDelivery = () => {
    setFulfillmentType("delivery");
  };

  const handleSelectPickup = () => {
    setFulfillmentType("pickup");
  };

  const handlePostalChange = (e) => {
    setPostalCode(formatPostalCodeInput(e.target.value));
  };

  const goToCheckout = () => {
    if (cart.length === 0) return;

    if (fulfillmentType === "delivery" && !deliveryVerified) {
      alert("Please enter a valid Saskatoon postal code (e.g. S7K 3Y5), or choose Store Pickup.");
      return;
    }

    navigate("/cart/checkout");
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.checkoutProgress}>
        <div className={styles.progressContainer}>
          <div className={`${styles.step} ${styles.stepActive}`}>
            <span className={styles.stepNumber}>1</span>
            <span>Cart</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <span>Checkout</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <span>Order Complete</span>
          </div>
        </div>
        <div className={styles.secureCheckout}>
          <ShieldIcon /> Secure
        </div>
      </div>

      <main className={styles.container}>
        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <h1 className={styles.emptyTitle}>Your cart is empty</h1>
            <p className={styles.emptyText}>Browse our rental items and add them to your cart.</p>
            <button type="button" className={styles.checkoutBtn} onClick={() => navigate("/items")}>
              Browse items
            </button>
          </div>
        ) : (
          <>
            <section className={styles.fulfillmentSection} aria-label="Delivery or pickup">
              <div className={styles.fulfillmentGrid}>
                <button
                  type="button"
                  className={`${styles.fulfillmentCard} ${fulfillmentType === "delivery" ? styles.fulfillmentActive : ""}`}
                  onClick={handleSelectDelivery}
                  aria-pressed={fulfillmentType === "delivery"}
                >
                  <span className={styles.fulfillmentIcon}>🚚</span>
                  <div className={styles.fulfillmentText}>
                    <div className={styles.fulfillmentTitleRow}>
                      <span className={styles.fulfillmentTitle}>Deliver to</span>
                      {fulfillmentType === "delivery" && (
                        <input
                          id="cart-postal-code"
                          type="text"
                          className={styles.postalPill}
                          value={postalCode}
                          onChange={handlePostalChange}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="S7K 3Y5"
                          maxLength={7}
                          autoComplete="postal-code"
                          aria-label="Saskatoon postal code"
                        />
                      )}
                    </div>
                    {fulfillmentType === "delivery" && deliveryAvailability && (
                      <span
                        className={
                          deliveryAvailability.ok === true
                            ? styles.availabilityOk
                            : deliveryAvailability.ok === false
                              ? styles.availabilityError
                              : styles.availabilityMuted
                        }
                      >
                        {deliveryAvailability.text}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={`${styles.fulfillmentCard} ${fulfillmentType === "pickup" ? styles.fulfillmentActive : ""}`}
                  onClick={handleSelectPickup}
                  aria-pressed={fulfillmentType === "pickup"}
                >
                  <span className={styles.fulfillmentIcon}>🏪</span>
                  <div className={styles.fulfillmentText}>
                    <span className={styles.fulfillmentTitle}>Pick up at Final Touch Studio</span>
                    <span className={styles.availabilityOk}>Available</span>
                  </div>
                </button>
              </div>
              <p className={styles.fulfillmentNote}>
                {fulfillmentType === "delivery"
                  ? "Get it delivered within Saskatoon"
                  : "Pick up yourself in Saskatoon"}
              </p>
            </section>

            <section className={styles.topSummary}>
              <h1 className={styles.cartTotalHeading}>
                Your cart total is ${subtotal.toFixed(2)}
              </h1>
              <p className={styles.cartTotalSubtext}>
                {fulfillmentType === "pickup"
                  ? "Free studio pickup · Tax calculated at checkout"
                  : deliveryVerified
                    ? "Delivery fee calculated at checkout · Tax calculated at checkout"
                    : "Enter your postal code for delivery · Tax calculated at checkout"}
              </p>
            </section>

            <ul className={styles.itemList}>
              {cart.map((cartItem) => {
                const qty = cartItem.quantity || 1;
                const lineTotal = MOCK_PRICE_PER_ITEM * qty;
                const stock = getItemStockQuantity(cartItem.item);
                const maxQty = Math.min(stock, 10);
                const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);

                return (
                  <li key={cartItem.id} className={styles.itemRow}>
                    <ItemImage item={cartItem.item} />

                    <div className={styles.itemBody}>
                      <div className={styles.itemTopRow}>
                        <h2 className={styles.itemTitle}>{cartItem.item.title}</h2>
                        <div className={styles.itemPriceBlock}>
                          <span className={styles.itemLineTotal}>${lineTotal.toFixed(2)}</span>
                          <button
                            type="button"
                            className={styles.removeLink}
                            onClick={() => removeFromCart(cartItem.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <p className={styles.itemRentalDates}>
                        Rental: {formatDate(cartItem.pickupDate)} – {formatDate(cartItem.returnDate)}
                      </p>

                      <ul className={styles.itemMeta}>
                        <li>✉ Order today</li>
                        <li>
                          {fulfillmentType === "delivery" ? "🚚" : "🏪"}{" "}
                          {fulfillmentType === "delivery"
                            ? deliveryVerified
                              ? "Delivery available"
                              : "Enter Saskatoon postal code"
                            : "Pickup available"}
                        </li>
                        {stock <= 5 && (
                          <li className={styles.itemMetaWarn}>⚠ Only {stock} available</li>
                        )}
                      </ul>

                      <div className={styles.itemControls}>
                        <label className={styles.qtyLabel}>
                          Qty
                          <select
                            className={styles.qtySelect}
                            value={qty}
                            onChange={(e) => setCartItemQuantity(cartItem.id, e.target.value)}
                          >
                            {qtyOptions.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span className={styles.unitPrice}>
                          ${MOCK_PRICE_PER_ITEM.toFixed(2)}/piece
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={styles.divider} />

            <section className={styles.bottomSummary} aria-label="Order summary">
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery</span>
                  <span>{fulfillmentType === "pickup" ? "Free" : "At checkout"}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>At checkout</span>
                </div>
              </div>

              <div className={styles.bottomCheckoutWrap}>
                <button
                  type="button"
                  className={styles.checkoutBtn}
                  onClick={goToCheckout}
                  disabled={!canCheckout}
                >
                  Continue to checkout
                </button>
              </div>
            </section>

            <button
              type="button"
              className={styles.continueShoppingLink}
              onClick={() => navigate("/items")}
            >
              ← Continue shopping
            </button>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
