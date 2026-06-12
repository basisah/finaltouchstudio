import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./DateRangePickerModal.module.css";
import { getItemAvailability } from "../../api/items.api";
import {
  toDateKey,
  getDayAvailability,
  getMaxRentableInRange,
  canRentQuantity,
  cartEntriesToBookings,
  mergeBookings,
  startOfToday,
  isPastDay,
} from "../../utils/rentalAvailability";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getDaysArray(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ id: `empty-${i}`, type: "empty" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ id: `${year}-${month}-${d}`, type: "day", date: new Date(year, month, d) });
  }
  return days;
}

export default function DateRangePickerModal({ item, cart = [], onClose, onConfirm }) {
  const today = startOfToday();
  const [currentDate, setCurrentDate] = useState(today);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({ totalStock: 0, isRentable: false, bookings: [] });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getItemAvailability(item.id)
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch((err) => {
        console.error("Failed to load availability:", err);
        if (!cancelled) {
          setAvailability({
            totalStock: item.unit_count ?? 1,
            isRentable: Boolean(item.isAvailable),
            bookings: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, item.unit_count, item.isAvailable]);

  const cartBookings = useMemo(
    () => cartEntriesToBookings(cart, item.id),
    [cart, item.id]
  );

  const allBookings = useMemo(
    () => mergeBookings(availability.bookings || [], cartBookings),
    [availability.bookings, cartBookings]
  );

  const totalStock = availability.totalStock ?? 0;
  const canRentBase = availability.isRentable && totalStock > 0;

  const effectiveReturn = returnDate || pickupDate;
  const maxForRange = useMemo(() => {
    if (!pickupDate || !effectiveReturn) return 0;
    return getMaxRentableInRange(allBookings, pickupDate, effectiveReturn, totalStock);
  }, [allBookings, pickupDate, effectiveReturn, totalStock]);

  useEffect(() => {
    if (quantity > maxForRange && maxForRange > 0) {
      setQuantity(maxForRange);
    } else if (maxForRange === 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [maxForRange, quantity]);

  const isClosedDay = useCallback((dateObj) => dateObj.getDay() === 0, []);

  const isDaySelectable = useCallback(
    (dateObj) => {
      if (isPastDay(dateObj) || isClosedDay(dateObj) || !canRentBase) return false;
      const day = getDayAvailability(allBookings, toDateKey(dateObj), totalStock);
      return day.status !== "unavailable";
    },
    [allBookings, totalStock, canRentBase, isClosedDay]
  );

  const handleDateClick = (dateObj) => {
    if (!isDaySelectable(dateObj)) return;

    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(dateObj);
      setReturnDate(null);
      setQuantity(1);
      return;
    }

    if (dateObj < pickupDate) {
      if (!isDaySelectable(dateObj)) return;
      setPickupDate(dateObj);
      setReturnDate(null);
      setQuantity(1);
      return;
    }

    const max = getMaxRentableInRange(allBookings, pickupDate, dateObj, totalStock);
    if (max <= 0) return;

    setReturnDate(dateObj);
    setQuantity((q) => Math.min(q, max));
  };

  const handleMouseEnter = (dateObj) => {
    if (pickupDate && !returnDate) setHoverDate(dateObj);
  };

  const formatRange = () => {
    if (!pickupDate && !returnDate) return "YYYY.MM.DD ~ YYYY.MM.DD";
    const formatSingle = (d) => {
      if (!d) return "";
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    };
    if (pickupDate && !returnDate) return `${formatSingle(pickupDate)} ~ ${formatSingle(pickupDate)}`;
    return `${formatSingle(pickupDate)} ~ ${formatSingle(returnDate)}`;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysList = getDaysArray(currentDate.getFullYear(), currentDate.getMonth());
  const todayKey = toDateKey(today);

  const rangeValid =
    pickupDate &&
    canRentQuantity(allBookings, pickupDate, effectiveReturn, quantity, totalStock);

  const stockMessage = (() => {
    if (loading) return "Loading availability…";
    if (!canRentBase) return "This item is currently unavailable";
    if (!pickupDate) return `${totalStock} units in inventory — select dates to see availability`;
    if (maxForRange <= 0) return "Fully booked for the selected dates";
    return `Up to ${maxForRange} unit${maxForRange === 1 ? "" : "s"} available for your dates`;
  })();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.displayCard}>
          <div className={styles.displayTitle}>Selected Dates</div>
          <div className={styles.inputWrapper}>
            <span className={pickupDate ? styles.rangeActiveText : styles.rangePlaceholderText}>
              {formatRange()}
            </span>
            <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthSelector}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <div className={styles.navPill}>
              <button type="button" className={styles.navPillBtn} onClick={prevMonth}>‹</button>
              <span className={styles.navPillDivider}>|</span>
              <button type="button" className={styles.navPillBtn} onClick={nextMonth}>›</button>
            </div>
          </div>

          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendAvailable}`} /> Available
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendPartial}`} /> Limited
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendUnavailable}`} /> Full
            </span>
          </div>

          <div className={styles.weekdaysRow}>
            {WEEKDAYS.map((w) => (
              <span key={w} className={styles.weekdayItem}>{w}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {daysList.map((itemObj) => {
              if (itemObj.type === "empty") {
                return <div key={itemObj.id} className={styles.dayEmpty} />;
              }

              const { date } = itemObj;
              const d = date.getDate();
              const dateKey = toDateKey(date);
              const isPast = isPastDay(date);
              const isClosed = isClosedDay(date);
              const dayAvail = getDayAvailability(allBookings, dateKey, totalStock);
              const isToday = dateKey === todayKey;

              const isStart = pickupDate && pickupDate.getTime() === date.getTime();
              const isEnd = returnDate && returnDate.getTime() === date.getTime();

              let isInRange = false;
              if (pickupDate && returnDate) {
                isInRange = date > pickupDate && date < returnDate;
              } else if (pickupDate && hoverDate) {
                isInRange =
                  (date > pickupDate && date <= hoverDate) ||
                  (date >= hoverDate && date < pickupDate);
              }

              let dayClass = styles.day;
              if (isPast || isClosed) dayClass += ` ${styles.dayClosed}`;
              else if (dayAvail.status === "unavailable") dayClass += ` ${styles.dayUnavailable}`;
              else if (dayAvail.status === "partial") dayClass += ` ${styles.dayPartial}`;
              else dayClass += ` ${styles.dayAvailable}`;

              if (isStart) dayClass += ` ${styles.dayStart}`;
              if (isEnd) dayClass += ` ${styles.dayEnd}`;
              if (isInRange) dayClass += ` ${styles.dayInRange}`;
              if (isToday) dayClass += ` ${styles.dayToday}`;

              const selectable = isDaySelectable(date);

              return (
                <div
                  key={itemObj.id}
                  className={dayClass}
                  onClick={() => selectable && handleDateClick(date)}
                  onMouseEnter={() => selectable && handleMouseEnter(date)}
                  title={
                    isPast || isClosed
                      ? "Unavailable"
                      : `${dayAvail.remaining} of ${totalStock} available`
                  }
                >
                  <div className={styles.dayContent}>{d}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.divider} />

          <div className={styles.footerPanel}>
            <div className={styles.footerHeader}>
              <span className={styles.itemName}>{item.title || item.name}</span>
              <div className={styles.quantityControl}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!rangeValid || quantity <= 1}
                >
                  -
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.min(maxForRange, quantity + 1))}
                  disabled={!rangeValid || quantity >= maxForRange}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.stockLabel}>{stockMessage}</div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={!rangeValid || loading}
                onClick={() =>
                  onConfirm({
                    pickupDate,
                    returnDate: returnDate || pickupDate,
                    quantity,
                    item,
                  })
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
