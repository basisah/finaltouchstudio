/** @typedef {{ pickupDate: string, returnDate: string, quantity: number }} RentalBooking */

export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(dateKey) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function normalizeRange(pickupDate, returnDate) {
  const start = typeof pickupDate === "string" ? parseDateKey(pickupDate) : pickupDate;
  const end = typeof returnDate === "string" ? parseDateKey(returnDate) : returnDate;
  if (start > end) return { start: end, end: start };
  return { start, end };
}

export function eachDayInRange(pickupDate, returnDate) {
  const { start, end } = normalizeRange(pickupDate, returnDate);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getCommittedOnDay(bookings, dateKey) {
  const day = parseDateKey(dateKey);
  return bookings.reduce((sum, b) => {
    const { start, end } = normalizeRange(b.pickupDate, b.returnDate);
    if (day >= start && day <= end) return sum + (b.quantity || 0);
    return sum;
  }, 0);
}

export function getMaxRentableInRange(bookings, pickupDate, returnDate, totalStock) {
  if (!pickupDate || !returnDate || totalStock <= 0) return 0;
  const pickupKey = typeof pickupDate === "string" ? pickupDate : toDateKey(pickupDate);
  const returnKey = typeof returnDate === "string" ? returnDate : toDateKey(returnDate);
  const days = eachDayInRange(pickupKey, returnKey);
  if (!days.length) return 0;

  let minRemaining = totalStock;
  for (const dayKey of days) {
    const committed = getCommittedOnDay(bookings, dayKey);
    minRemaining = Math.min(minRemaining, totalStock - committed);
  }
  return Math.max(0, minRemaining);
}

export function getDayAvailability(bookings, dateKey, totalStock) {
  const committed = getCommittedOnDay(bookings, dateKey);
  const remaining = Math.max(0, totalStock - committed);
  if (remaining <= 0) return { remaining: 0, status: "unavailable" };
  if (remaining < totalStock) return { remaining, status: "partial" };
  return { remaining, status: "available" };
}

export function canRentQuantity(bookings, pickupDate, returnDate, quantity, totalStock) {
  const max = getMaxRentableInRange(bookings, pickupDate, returnDate, totalStock);
  return quantity > 0 && quantity <= max;
}

export function cartEntriesToBookings(cartEntries, itemId) {
  return cartEntries
    .filter((entry) => entry.item?.id === itemId && entry.pickupDate && entry.returnDate)
    .map((entry) => ({
      pickupDate: toDateKey(entry.pickupDate),
      returnDate: toDateKey(entry.returnDate),
      quantity: entry.quantity || 1,
    }));
}

export function mergeBookings(...lists) {
  return lists.flat().filter(Boolean);
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isPastDay(date) {
  return date < startOfToday();
}
