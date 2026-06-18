import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import {
  formatPostalCodeInput,
  getFormatValidationMessage,
  getDeliveryStatus,
  isDeliveryAllowed,
} from "../../utils/saskatoonDelivery";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./CartCheckoutPage.module.css";

const MOCK_PRICE_PER_ITEM = 25;
const DELIVERY_FEE = 15;
const TAX_RATE = 0.08;

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function CartCheckoutPage() {
  const { cart, clearCart, fulfillmentType, postalCode } = useCart();
  const navigate = useNavigate();

  const [showShippingForm, setShowShippingForm] = useState(false);
  const [hasShippingInfo, setHasShippingInfo] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState(postalCode);
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("Canada");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  useEffect(() => {
    if (cart.length === 0 && !isCompleted) {
      navigate("/cart", { replace: true });
      return;
    }
    if (fulfillmentType === "delivery" && !isDeliveryAllowed(postalCode)) {
      navigate("/cart", { replace: true });
    }
  }, [cart.length, isCompleted, navigate, fulfillmentType, postalCode]);

  useEffect(() => {
    setShippingPostalCode(postalCode);
  }, [postalCode]);

  const subtotal = cart.reduce(
    (total, c) => total + (c.quantity || 1) * MOCK_PRICE_PER_ITEM,
    0
  );
  const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
  const tax = (subtotal + deliveryFee) * TAX_RATE;
  const totalAmount = subtotal + deliveryFee + tax;

  const deliveryStatus =
    fulfillmentType === "delivery" ? getDeliveryStatus(shippingPostalCode) : null;

  const handleSaveShipping = (e) => {
    e.preventDefault();
    if (fulfillmentType === "delivery" && !isDeliveryAllowed(shippingPostalCode)) {
      alert(
        getFormatValidationMessage(shippingPostalCode) ||
          "Delivery is not available to this postal code. Please choose Store Pickup instead."
      );
      return;
    }
    if (!firstName || !lastName || !city || !phone) {
      alert("Please fill in all requested contact fields.");
      return;
    }
    if (fulfillmentType === "delivery" && (!address || !shippingPostalCode)) {
      alert("Please fill in your delivery address and postal code.");
      return;
    }
    setHasShippingInfo(true);
    setShowShippingForm(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (fulfillmentType === "delivery" && !isDeliveryAllowed(shippingPostalCode)) {
      alert(
        getFormatValidationMessage(shippingPostalCode) ||
          "Delivery is not available to this postal code. Please choose Store Pickup instead."
      );
      return;
    }
    if (!hasShippingInfo) {
      alert("Please add your shipping information before placing the order.");
      setShowShippingForm(true);
      return;
    }

    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    if (!token) {
      alert("Please sign in or register to place your reservation order.");
      navigate("/login?redirect=/cart/checkout");
      return;
    }

    try {
      const firstCartItem = cart[0];
      const rental_date = firstCartItem?.pickupDate
        ? new Date(firstCartItem.pickupDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const event_date = firstCartItem?.returnDate
        ? new Date(firstCartItem.returnDate).toISOString().split("T")[0]
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const itemsPayload = cart.map((cartItem) => ({
        item_id: cartItem.item.id,
        quantity: cartItem.quantity || 1,
        price: MOCK_PRICE_PER_ITEM,
        pickup_date: cartItem.pickupDate
          ? new Date(cartItem.pickupDate).toISOString().split("T")[0]
          : rental_date,
        return_date: cartItem.returnDate
          ? new Date(cartItem.returnDate).toISOString().split("T")[0]
          : event_date,
      }));

      let customerEmail = `${firstName.toLowerCase()}@example.com`;
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        if (userInfo.email) customerEmail = userInfo.email;
      } catch (_) {}

      const venueAddress =
        fulfillmentType === "pickup"
          ? "Final Touch Studio — Saskatoon (pickup)"
          : `${address}, ${city}, ${shippingPostalCode}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: `${firstName} ${lastName}`,
          customer_email: customerEmail,
          customer_phone: phone,
          event_date: event_date,
          rental_date: rental_date,
          fulfillment_type: fulfillmentType,
          delivery_fee: deliveryFee,
          venue_address: venueAddress,
          special_notes: `Payment method: ${paymentMethod}`,
          total_amount: totalAmount,
          items: itemsPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Checkout failed");
      }

      const data = await res.json();
      setBookingRef(`FT-${data.orderId}`);
      setIsCompleted(true);
      clearCart();
    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.successWrapper}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2>Order Confirmed!</h2>
            <p>
              Ref: <strong>{bookingRef}</strong>
            </p>
            <p className={styles.successMessage}>
              Thank you, {firstName}! We will call you at {phone} to confirm your{" "}
              {fulfillmentType === "pickup" ? "pickup" : "delivery"} in {city || "Saskatoon"}.
            </p>
            <button type="button" onClick={() => navigate("/")} className={styles.placeOrderBtn}>
              Return to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.checkoutProgress}>
        <div className={styles.progressContainer}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>
              <CheckCircleIcon />
            </span>
            <span>Cart</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={`${styles.step} ${styles.stepActive}`}>
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
        <div className={styles.layoutGrid}>
          <div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {fulfillmentType === "pickup" ? "Contact Information" : "Shipping Information"}
                </h2>
                {hasShippingInfo && !showShippingForm && (
                  <button type="button" className={styles.editBtn} onClick={() => setShowShippingForm(true)}>
                    Edit
                  </button>
                )}
                {hasShippingInfo && showShippingForm && (
                  <button type="button" className={styles.editBtn} onClick={() => setShowShippingForm(false)}>
                    Cancel
                  </button>
                )}
              </div>

              {!hasShippingInfo && !showShippingForm && (
                <button type="button" className={styles.addShippingBtn} onClick={() => setShowShippingForm(true)}>
                  + Add {fulfillmentType === "pickup" ? "Contact" : "Shipping"} Info
                </button>
              )}

              {showShippingForm && (
                <form onSubmit={handleSaveShipping} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>First Name</label>
                    <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  {fulfillmentType === "delivery" && (
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label>Address</label>
                      <input type="text" placeholder="123 Main Street" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                  )}
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" placeholder="Saskatoon" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  {fulfillmentType === "delivery" && (
                    <div className={styles.inputGroup}>
                      <label>ZIP / Postal Code</label>
                      <input
                        type="text"
                        placeholder="S7K 3Y5"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(formatPostalCodeInput(e.target.value))}
                        maxLength={7}
                        required
                      />
                      {deliveryStatus && deliveryStatus.status !== "available" && (
                        <p className={styles.postalError}>{deliveryStatus.message}</p>
                      )}
                    </div>
                  )}
                  <div className={styles.inputGroup}>
                    <label>State / Province</label>
                    <input type="text" placeholder="SK" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Country</label>
                    <input type="text" placeholder="Canada" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (306) 555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className={styles.fullWidth}>
                    <button type="submit" className={styles.saveShippingBtn}>
                      Save {fulfillmentType === "pickup" ? "Contact" : "Shipping"} Info
                    </button>
                  </div>
                </form>
              )}

              {hasShippingInfo && !showShippingForm && (
                <div className={styles.shippingSummary}>
                  <p style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {firstName} {lastName}
                  </p>
                  {fulfillmentType === "delivery" && <p>{address}</p>}
                  <p>
                    {city}, {stateRegion} {fulfillmentType === "delivery" ? shippingPostalCode : ""}
                  </p>
                  <p>{country}</p>
                  <p style={{ marginTop: "4px" }}>Phone: {phone}</p>
                  {fulfillmentType === "pickup" && (
                    <p style={{ marginTop: "8px", color: "var(--btn-primary)" }}>
                      Pickup at Final Touch Studio, Saskatoon
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Payment Method</h2>
              </div>

              <div className={styles.paymentOptions}>
                <label className={`${styles.paymentOption} ${paymentMethod === "Card" ? styles.paymentOptionActive : ""}`}>
                  <input type="radio" name="payment" value="Card" checked={paymentMethod === "Card"} onChange={() => setPaymentMethod("Card")} />
                  <span className={styles.paymentLabel}>💳 Credit/Debit Card</span>
                </label>

                {paymentMethod === "Card" && (
                  <div className={styles.cardFields}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>CVC</label>
                      <input type="text" placeholder="123" />
                    </div>
                  </div>
                )}

                <label className={`${styles.paymentOption} ${paymentMethod === "PayPal" ? styles.paymentOptionActive : ""}`}>
                  <input type="radio" name="payment" value="PayPal" checked={paymentMethod === "PayPal"} onChange={() => setPaymentMethod("PayPal")} />
                  <span className={styles.paymentLabel} style={{ color: "#003087" }}>
                    🅿️ PayPal
                  </span>
                </label>

                <label className={`${styles.paymentOption} ${paymentMethod === "ApplePay" ? styles.paymentOptionActive : ""}`}>
                  <input type="radio" name="payment" value="ApplePay" checked={paymentMethod === "ApplePay"} onChange={() => setPaymentMethod("ApplePay")} />
                  <span className={styles.paymentLabel}> Apple Pay</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order Total</h2>

              <div className={styles.totalsBox}>
                <div className={styles.totalsRow}>
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div className={styles.totalsRow}>
                  <span>{fulfillmentType === "pickup" ? "Pickup" : "Delivery"}</span>
                  <strong>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</strong>
                </div>
                <div className={styles.totalsRow}>
                  <span>Tax</span>
                  <strong>${tax.toFixed(2)}</strong>
                </div>
                <div className={styles.divider} />
                <div className={styles.grandTotalRow}>
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button type="button" className={styles.placeOrderBtn} onClick={handlePlaceOrder}>
                Place Order
              </button>

              <button type="button" className={styles.backToCartBtn} onClick={() => navigate("/cart")}>
                ← Back to cart
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
