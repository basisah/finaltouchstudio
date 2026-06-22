/** @typedef {{ pickupDate: string, returnDate: string, quantity: number }} RentalBooking */

function parseDateKey(dateKey) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeRange(pickupDate, returnDate) {
  const start = parseDateKey(pickupDate);
  const end = parseDateKey(returnDate);
  if (start > end) return { start: end, end: start };
  return { start, end };
}

/** Each calendar day in [pickup, return] is a rental day (inclusive). */
function eachDayInRange(pickupDate, returnDate) {
  const { start, end } = normalizeRange(pickupDate, returnDate);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function rangesOverlap(aPickup, aReturn, bPickup, bReturn) {
  const a = normalizeRange(aPickup, aReturn);
  const b = normalizeRange(bPickup, bReturn);
  return a.start <= b.end && b.start <= a.end;
}

/**
 * @param {RentalBooking[]} bookings
 * @param {string} dateKey
 */
function getCommittedOnDay(bookings, dateKey) {
  const day = parseDateKey(dateKey);
  return bookings.reduce((sum, b) => {
    const { start, end } = normalizeRange(b.pickupDate, b.returnDate);
    if (day >= start && day <= end) return sum + (b.quantity || 0);
    return sum;
  }, 0);
}

/**
 * Minimum units still free across every day in the requested range.
 * @param {RentalBooking[]} bookings
 */
function getMaxRentableInRange(bookings, pickupDate, returnDate, totalStock) {
  if (!pickupDate || !returnDate || totalStock <= 0) return 0;
  const days = eachDayInRange(pickupDate, returnDate);
  if (!days.length) return 0;

  let minRemaining = totalStock;
  for (const dayKey of days) {
    const committed = getCommittedOnDay(bookings, dayKey);
    minRemaining = Math.min(minRemaining, totalStock - committed);
  }
  return Math.max(0, minRemaining);
}

/**
 * @param {RentalBooking[]} bookings
 */
function getDayAvailability(bookings, dateKey, totalStock) {
  const committed = getCommittedOnDay(bookings, dateKey);
  const remaining = Math.max(0, totalStock - committed);
  if (remaining <= 0) return { remaining: 0, status: "unavailable" };
  if (remaining < totalStock) return { remaining, status: "partial" };
  return { remaining, status: "available" };
}

function canRentQuantity(bookings, pickupDate, returnDate, quantity, totalStock) {
  const max = getMaxRentableInRange(bookings, pickupDate, returnDate, totalStock);
  return quantity > 0 && quantity <= max;
}

module.exports = {
  toDateKey,
  parseDateKey,
  eachDayInRange,
  rangesOverlap,
  getCommittedOnDay,
  getMaxRentableInRange,
  getDayAvailability,
  canRentQuantity,
};
