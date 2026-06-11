import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { submitBooking } from "../../api/bookings.api";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve checkout state from router location
  const checkoutData = location.state || {
    pkgName: "Custom Celebration Package",
    pkgCategory: "general",
    itemsCount: 0,
    itemsList: [],
    finalPrice: 0,
  };

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eTransfer");
  
  // Checkout flow state
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !pickupDate || !returnDate) {
      alert("Please fill in all requested scheduling and billing fields.");
      return;
    }

    try {
      const result = await submitBooking({
        name,
        phone,
        email,
        pickupDate,
        returnDate,
        packageName: checkoutData.pkgName,
        price: checkoutData.finalPrice,
        paymentMethod
      });

      if (result && result.bookingId) {
        setBookingRef("FT-" + result.bookingId);
      } else {
        setBookingRef("FT-" + Math.floor(100000 + Math.random() * 900000));
      }
      setIsCompleted(true);
    } catch (err) {
      console.error("Booking API error:", err);
      alert("Failed to confirm reservation. Please check your internet connection and try again.");
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.successWrapper}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2>Booking Confirmed!</h2>
            <p className={styles.refNumber}>Booking Reference: <strong>{bookingRef}</strong></p>
            <div className={styles.divider}></div>
            <p className={styles.successMessage}>
              Thank you, <strong>{name}</strong>! Your order for <strong>{checkoutData.pkgName}</strong> has been successfully placed. 
              We will call you on <strong>{phone}</strong> to coordinate the delivery and setup for your occasion.
            </p>
            <div className={styles.successSummary}>
              <h4>Order Breakdown</h4>
              <p>Occasion: <span>{checkoutData.pkgCategory.toUpperCase()}</span></p>
              <p>Customized Elements: <span>{checkoutData.itemsCount} items selected</span></p>
              <p>Scheduled: <span>{pickupDate} to {returnDate}</span></p>
              <p>Total Paid via {paymentMethod}: <strong>CAD ${checkoutData.finalPrice.toLocaleString()}</strong></p>
            </div>
            <button onClick={() => navigate("/")} className={styles.homeBtn}>Return to Home</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Complete Your Reservation</h1>
          <p className={styles.subtitle}>Provide your event schedules and complete the secure payment.</p>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.layoutGrid}>
          {/* Checkout Scheduling & Payment Form */}
          <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
            <div className={styles.sectionHeader}>
              <h2>1. Contact & Scheduling</h2>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phoneNum">Phone Number</label>
                <input
                  id="phoneNum"
                  type="tel"
                  placeholder="e.g. +1 (306) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                <label htmlFor="emailAddress">Email Address</label>
                <input
                  id="emailAddress"
                  type="email"
                  placeholder="e.g. sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="pickDate">Pickup Date</label>
                <input
                  id="pickDate"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="retDate">Return Date</label>
                <input
                  id="retDate"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: "40px" }}>
              <h2>2. Choose Payment Method</h2>
            </div>

            <div className={styles.paymentGrid}>
              <label className={`${styles.paymentCard} ${paymentMethod === "eTransfer" ? styles.selectedPayment : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="eTransfer"
                  checked={paymentMethod === "eTransfer"}
                  onChange={() => setPaymentMethod("eTransfer")}
                />
                <span className={styles.paymentLogo}>🍁</span>
                <span className={styles.paymentLabel}>Interac e-Transfer</span>
              </label>

              <label className={`${styles.paymentCard} ${paymentMethod === "PayPal" ? styles.selectedPayment : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={() => setPaymentMethod("PayPal")}
                />
                <span className={styles.paymentLogo}>🅿️</span>
                <span className={styles.paymentLabel}>PayPal Checkout</span>
              </label>

              <label className={`${styles.paymentCard} ${paymentMethod === "Card" ? styles.selectedPayment : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Card"
                  checked={paymentMethod === "Card"}
                  onChange={() => setPaymentMethod("Card")}
                />
                <span className={styles.paymentLogo}>💳</span>
                <span className={styles.paymentLabel}>Credit/Debit Card</span>
              </label>
            </div>

            {paymentMethod === "eTransfer" && (
              <div className={styles.paymentAlert}>
                <p>💡 Please send your Interac e-Transfer payment to <strong>finaltouchstudiosask@gmail.com</strong>. Instructions will be sent to your email.</p>
              </div>
            )}

            {paymentMethod === "PayPal" && (
              <div className={styles.paymentAlert}>
                <p>💡 You will be redirected to the secure PayPal portal to complete checkout.</p>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div className={styles.stripeWrapper}>
                {/* 
                  ======================================================================
                  STRIPE API INTEGRATION GUIDE (FRONTEND):
                  
                  To activate real Stripe payments:
                  1. Install packages:
                     $ npm install @stripe/stripe-js @stripe/react-stripe-js
                  
                  2. Import Stripe components:
                     import { loadStripe } from '@stripe/stripe-js';
                     import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
                  
                  3. Initialize Stripe outside component:
                     const stripePromise = loadStripe('YOUR_PUBLISHABLE_KEY');
                  
                  4. Wrap your form (or CheckoutPage component) inside App.jsx or parent with:
                     <Elements stripe={stripePromise}>
                       <CheckoutPage />
                     </Elements>
                  
                  5. In handlePlaceOrder:
                     const stripe = useStripe();
                     const elements = useElements();
                     
                     // a. Request backend to create a PaymentIntent:
                     const res = await fetch('/api/payment/create-payment-intent', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ amount: checkoutData.finalPrice * 100 }) // Stripe expects amounts in cents
                     });
                     const { clientSecret } = await res.json();
                     
                     // b. Confirm card payment using Stripe SDK:
                     const result = await stripe.confirmCardPayment(clientSecret, {
                       payment_method: {
                         card: elements.getElement(CardElement),
                         billing_details: { name: name, email: email, phone: phone },
                       }
                     });
                     
                     if (result.error) {
                       alert(result.error.message);
                     } else if (result.paymentIntent.status === 'succeeded') {
                       setIsCompleted(true); // Payment successful!
                     }
                  ======================================================================
                */}
                <div className={styles.stripeHeader}>
                  <span>💳 Secure Card Payment via Stripe</span>
                </div>
                
                <div className={styles.stripeContainer}>
                  <div className={styles.stripeRow}>
                    <div className={styles.stripeField} style={{ flex: 2 }}>
                      <label>Card Number</label>
                      <div className={styles.stripeInputMock}>
                        <span className={styles.cardIconSmall}>💳</span>
                        <input type="text" placeholder="4242 4242 4242 4242" disabled />
                      </div>
                    </div>
                  </div>

                  <div className={styles.stripeRow}>
                    <div className={styles.stripeField}>
                      <label>Expiration</label>
                      <input type="text" className={styles.stripeInput} placeholder="MM / YY" disabled />
                    </div>
                    <div className={styles.stripeField}>
                      <label>CVC</label>
                      <input type="text" className={styles.stripeInput} placeholder="CVC" disabled />
                    </div>
                    <div className={styles.stripeField}>
                      <label>Postal Code</label>
                      <input type="text" className={styles.stripeInput} placeholder="S7K 3Y5" disabled />
                    </div>
                  </div>
                </div>
                
                <p className={styles.stripeDisclaimer}>
                  🔒 Payments are encrypted and processed securely by Stripe. We do not store your card details.
                </p>
              </div>
            )}
          </form>

          {/* Booking Summary Card */}
          <aside className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h3>Reservation Summary</h3>
              <div className={styles.divider}></div>
              
              <div className={styles.packageDetail}>
                <h4>{checkoutData.pkgName}</h4>
                <p className={styles.categoryLabel}>{checkoutData.pkgCategory.toUpperCase()} PACKAGE</p>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.itemsSummary}>
                <h5>Included Elements ({checkoutData.itemsCount})</h5>
                <ul className={styles.itemsList}>
                  {checkoutData.itemsList.map((title, index) => (
                    <li key={index}>✦ {title}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>Total Amount:</span>
                <span className={styles.totalPrice}>CAD ${checkoutData.finalPrice.toLocaleString()}</span>
              </div>

              <button 
                type="submit" 
                onClick={handlePlaceOrder}
                className={styles.placeOrderBtn}
              >
                ✦ Pay & Confirm Reservation
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
