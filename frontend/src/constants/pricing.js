/**
 * Checkout pricing rules. These are business settings — confirm them with the
 * owner before going live.
 */

/** Flat delivery charge within Saskatoon (CAD). Studio pickup is free. */
export const DELIVERY_FEE = 15;

/** Sales tax applied to the order subtotal + delivery. */
export const TAX_RATE = 0.08;

export const PAYMENT_METHODS = [
  { id: "eTransfer", label: "Interac e-Transfer", note: "We email payment instructions once your booking is confirmed." },
  { id: "Card", label: "Credit or debit card", note: "Pay by card when you collect, or through a secure link we send you." },
  { id: "PayPal", label: "PayPal", note: "We send a PayPal invoice to your email address." },
];
