import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./CartPage.module.css";

// SVG Icons
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Shipping Information
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [hasShippingInfo, setHasShippingInfo] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("Canada");
  const [phone, setPhone] = useState("");
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("Card");
  
  // Checkout flow state
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Totals Calculation
  const MOCK_PRICE_PER_ITEM = 25; 
  const SHIPPING_FEE = 15.00;
  
  const totalItemsCount = cart.reduce((count, c) => count + (c.quantity || 1), 0);
  const subtotal = cart.reduce((total, c) => total + (c.quantity || 1) * MOCK_PRICE_PER_ITEM, 0);
  const tax = subtotal * 0.08; 
  const totalAmount = subtotal + SHIPPING_FEE + tax;

  const handleSaveShipping = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !address || !city || !postalCode || !phone) {
      alert("Please fill in all requested shipping information fields.");
      return;
    }
    setHasShippingInfo(true);
    setShowShippingForm(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!hasShippingInfo) {
      alert("Please add your shipping information before placing the order.");
      setShowShippingForm(true);
      return;
    }

    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    if (!token) {
      alert("Please sign in or register to place your reservation order.");
      navigate("/login?redirect=/cart");
      return;
    }

    try {
      // Get items in the format the backend expects
      const itemsPayload = cart.map(cartItem => ({
        item_id: cartItem.item.categoryId ? cartItem.item.id : null,
        package_id: !cartItem.item.categoryId ? cartItem.item.id : null,
        quantity: cartItem.quantity || 1,
        price: MOCK_PRICE_PER_ITEM
      }));

      // Extract rental dates from the cart items
      const firstCartItem = cart[0];
      const rental_date = firstCartItem?.pickupDate ? new Date(firstCartItem.pickupDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const event_date = firstCartItem?.returnDate ? new Date(firstCartItem.returnDate).toISOString().split("T")[0] : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      let customerEmail = `${firstName.toLowerCase()}@example.com`;
      try {
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        if (userInfo.email) customerEmail = userInfo.email;
      } catch (_) {}

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: `${firstName} ${lastName}`,
          customer_email: customerEmail,
          customer_phone: phone,
          event_date: event_date,
          rental_date: rental_date,
          fulfillment_type: "delivery",
          delivery_fee: SHIPPING_FEE,
          venue_address: `${address}, ${city}, ${postalCode}`,
          special_notes: `Payment method: ${paymentMethod}`,
          total_amount: totalAmount,
          items: itemsPayload
        })
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "Invalid";
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', width: '100%' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', color: '#2D1A29', marginBottom: '8px' }}>Order Confirmed!</h2>
            <p style={{ color: '#6B4E66', marginBottom: '24px' }}>Ref: <strong>{bookingRef}</strong></p>
            <p style={{ color: '#4A3345', marginBottom: '24px', fontSize: '0.95rem' }}>
              Thank you, {firstName}! We will call you at {phone} to confirm delivery to {city}.
            </p>
            <button onClick={() => navigate("/")} className={styles.placeOrderBtn}>Return to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.checkoutProgress}>
        <div className={styles.progressContainer}>
          <div className={styles.step}>
            <span className={styles.stepNumber}><CheckCircleIcon /></span>
            <span>Cart</span>
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${styles.stepActive}`}>
            <span className={styles.stepNumber}>2</span>
            <span>Checkout</span>
          </div>
          <div className={styles.stepDivider}></div>
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
          
          {/* LEFT COLUMN: Items Summary */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: '16px' }}>Order Summary ({totalItemsCount} items)</h2>
              
              <div className={styles.cartItemList}>
                {cart.length === 0 ? (
                  <p style={{ color: '#6B4E66', fontSize: '0.85rem' }}>Your cart is empty.</p>
                ) : (
                  cart.map((cartItem) => (
                    <div key={cartItem.id} className={styles.cartItemCompact}>
                      <div className={styles.itemImageCompact}>✨</div>
                      <div className={styles.itemDetailsCompact}>
                        
                        <div className={styles.itemHeaderRow}>
                          <span className={styles.itemTitleCompact}>{cartItem.item.title}</span>
                          <span className={styles.itemPriceCompact}>${(MOCK_PRICE_PER_ITEM * (cartItem.quantity || 1)).toFixed(2)}</span>
                        </div>
                        
                        <div className={styles.itemDatesCompact}>
                          Dates: {formatDate(cartItem.pickupDate)} - {formatDate(cartItem.returnDate)}
                        </div>
                        
                        <div className={styles.itemControlsRow}>
                          <div className={styles.quantityControlCompact}>
                            <button type="button" className={styles.quantityBtnCompact} onClick={() => updateQuantity(cartItem.id, -1)}>−</button>
                            <span className={styles.quantityValueCompact}>{cartItem.quantity || 1}</span>
                            <button type="button" className={styles.quantityBtnCompact} onClick={() => updateQuantity(cartItem.id, 1)}>+</button>
                          </div>
                          
                          <button type="button" className={styles.removeBtnCompact} onClick={() => removeFromCart(cartItem.id)} title="Remove item">
                            <TrashIcon />
                          </button>
                        </div>
                        
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button type="button" className={styles.continueShoppingBtn} onClick={() => navigate('/items')}>
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Shipping, Payment, Totals */}
          <div>
            
            {/* Shipping Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Shipping Information</h2>
                {hasShippingInfo && !showShippingForm && (
                  <button type="button" className={styles.editBtn} onClick={() => setShowShippingForm(true)}>Edit</button>
                )}
                {hasShippingInfo && showShippingForm && (
                  <button type="button" className={styles.editBtn} onClick={() => setShowShippingForm(false)}>Cancel</button>
                )}
              </div>

              {!hasShippingInfo && !showShippingForm && (
                <button type="button" className={styles.addShippingBtn} onClick={() => setShowShippingForm(true)}>
                  + Add Shipping Info
                </button>
              )}

              {showShippingForm && (
                <form onSubmit={handleSaveShipping} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>First Name</label>
                    <input type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Address</label>
                    <input type="text" placeholder="123 Main Street" value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" placeholder="New York" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>ZIP / Postal Code</label>
                    <input type="text" placeholder="10001" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>State / Province</label>
                    <input type="text" placeholder="NY" value={stateRegion} onChange={e => setStateRegion(e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Country</label>
                    <input type="text" placeholder="United States" value={country} onChange={e => setCountry(e.target.value)} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <div className={styles.fullWidth}>
                    <button type="submit" className={styles.saveShippingBtn}>Save Shipping Info</button>
                  </div>
                </form>
              )}

              {hasShippingInfo && !showShippingForm && (
                <div className={styles.shippingSummary}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>{firstName} {lastName}</p>
                  <p>{address}</p>
                  <p>{city}, {stateRegion} {postalCode}</p>
                  <p>{country}</p>
                  <p style={{ marginTop: '4px' }}>Phone: {phone}</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
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
                  <div className={styles.formGrid} style={{ padding: '0 8px 8px 30px' }}>
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
                  <span className={styles.paymentLabel} style={{ color: '#003087' }}>🅿️ PayPal</span>
                </label>

                <label className={`${styles.paymentOption} ${paymentMethod === "ApplePay" ? styles.paymentOptionActive : ""}`}>
                  <input type="radio" name="payment" value="ApplePay" checked={paymentMethod === "ApplePay"} onChange={() => setPaymentMethod("ApplePay")} />
                  <span className={styles.paymentLabel}> Apple Pay</span>
                </label>
              </div>
            </div>

            {/* Totals & Place Order Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order Total</h2>
              
              <div className={styles.totalsBox}>
                <div className={styles.totalsRow}>
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div className={styles.totalsRow}>
                  <span>Shipping</span>
                  <strong>${SHIPPING_FEE.toFixed(2)}</strong>
                </div>
                <div className={styles.totalsRow}>
                  <span>Tax</span>
                  <strong>${tax.toFixed(2)}</strong>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.grandTotalRow}>
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="button" 
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
              >
                Place Order
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
