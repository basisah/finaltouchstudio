import { DELIVERY_FEE, TAX_RATE } from "../constants/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Rental length in days, counting both the pickup and the return day. */
export function rentalDays(pickupDate, returnDate) {
  const start = toDay(pickupDate);
  const end = toDay(returnDate) || start;
  if (!start) return 1;
  return Math.max(1, Math.round(Math.abs(end - start) / DAY_MS) + 1);
}

/** Day rate × quantity × rental days for one cart line. */
export function lineTotal(line) {
  const rate = Number(line.item?.price) || 0;
  return rate * (line.quantity || 1) * rentalDays(line.pickupDate, line.returnDate);
}

/** Subtotal, delivery, tax and grand total for the whole cart. */
export function cartTotals(cart, fulfilment = "pickup") {
  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const delivery = fulfilment === "delivery" && cart.length > 0 ? DELIVERY_FEE : 0;
  const tax = (subtotal + delivery) * TAX_RATE;
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}

/** YYYY-MM-DD in local time (the API stores plain dates). */
export function toDateKey(value) {
  const date = toDay(value) || toDay(new Date());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
