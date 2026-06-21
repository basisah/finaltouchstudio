import React, { useState, useMemo, useCallback } from 'react';
import styles from './DateRangePickerModal.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * DateRangePickerModal
 *
 * Props:
 *  - item         : { title, unit_count, ... }
 *  - onClose      : () => void
 *  - onConfirm    : ({ pickupDate, returnDate, quantity, item }) => void
 *  - bookedRanges : Array<{ rentalDate: "YYYY-MM-DD", eventDate: "YYYY-MM-DD", quantityBooked: number }>
 *
 * Inventory logic:
 *  - A date is only FULLY disabled when sum(quantityBooked overlapping that date) >= unit_count
 *  - If 1 of 3 units is booked, the date is still available (2 remain)
 *  - The quantity picker is capped to the minimum remaining across the selected range
 *  - A date range that spans ANY fully-disabled date in between is blocked
 *  - Hover preview is capped at the first fully-blocked date in that direction
 */
export default function DateRangePickerModal({ item, onClose, onConfirm, bookedRanges = [] }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const unitCount = item.unit_count || 1;

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rangeError, setRangeError] = useState(false);

  // ── Parsed ranges ──────────────────────────────────────────────────────────
  const parsedRanges = useMemo(
    () =>
      bookedRanges.map(({ rentalDate, eventDate, quantityBooked }) => ({
        start: new Date(rentalDate + 'T00:00:00'),
        end:   new Date(eventDate   + 'T00:00:00'),
        qty:   Number(quantityBooked) || 1,
      })),
    [bookedRanges]
  );

  // ── Core inventory helpers ─────────────────────────────────────────────────

  /** Total units already booked on a given date */
  const bookedQtyOnDate = useCallback(
    (dateObj) => {
      const t = dateObj.getTime();
      return parsedRanges.reduce(
        (sum, { start, end, qty }) =>
          t >= start.getTime() && t <= end.getTime() ? sum + qty : sum,
        0
      );
    },
    [parsedRanges]
  );

  /** Units still available on a given date (always >= 0) */
  const availableOnDate = useCallback(
    (dateObj) => Math.max(0, unitCount - bookedQtyOnDate(dateObj)),
    [unitCount, bookedQtyOnDate]
  );

  /** True only when EVERY unit is taken on this date */
  const isFullyBooked = useCallback(
    (dateObj) => availableOnDate(dateObj) <= 0,
    [availableOnDate]
  );

  /** True for Sundays */
  const isClosedDay = (dateObj) => dateObj.getDay() === 0;

  /** True for past dates */
  const isPastDay = (dateObj) => dateObj < today;

  /** Combined: user cannot click or pass through this date */
  const isHardBlocked = useCallback(
    (dateObj) => isPastDay(dateObj) || isClosedDay(dateObj) || isFullyBooked(dateObj),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFullyBooked]
  );

  // ── Range helpers ──────────────────────────────────────────────────────────

  /**
   * Returns true if every date from start→end (inclusive) is NOT hard-blocked.
   * Skips the startDate itself (already selected, so we trust it's valid).
   */
  const rangeIsClear = useCallback(
    (start, end) => {
      const cur = new Date(start);
      cur.setDate(cur.getDate() + 1); // skip the start day itself
      while (cur <= end) {
        if (isHardBlocked(cur)) return false;
        cur.setDate(cur.getDate() + 1);
      }
      return true;
    },
    [isHardBlocked]
  );

  /**
   * Minimum available units across every day in [start, end].
   * Used to cap the quantity picker to what's actually rentable for the whole stay.
   */
  const minAvailableInRange = useCallback(
    (start, end) => {
      let min = unitCount;
      const cur = new Date(start);
      while (cur <= end) {
        const avail = availableOnDate(cur);
        if (avail < min) min = avail;
        cur.setDate(cur.getDate() + 1);
      }
      return Math.max(0, min);
    },
    [unitCount, availableOnDate]
  );

  /**
   * Walk from `from` toward `toward` and return the last date before hitting
   * a hard-blocked date. Used to cap the hover preview.
   */
  const lastClearDate = useCallback(
    (from, toward) => {
      const step = toward >= from ? 1 : -1;
      const cur = new Date(from);
      cur.setDate(cur.getDate() + step); // skip from itself
      let last = from;
      while ((step === 1 ? cur <= toward : cur >= toward)) {
        if (isHardBlocked(cur)) return last;
        last = new Date(cur);
        cur.setDate(cur.getDate() + step);
      }
      return toward;
    },
    [isHardBlocked]
  );

  // ── Available units for selected range (shown in footer) ───────────────────
  const availableForSelection = useMemo(() => {
    if (!pickupDate) return unitCount;
    const end = returnDate || pickupDate;
    return minAvailableInRange(pickupDate, end);
  }, [pickupDate, returnDate, minAvailableInRange, unitCount]);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleDateClick = (dateObj) => {
    if (isHardBlocked(dateObj)) return;
    setRangeError(false);

    if (!pickupDate || (pickupDate && returnDate)) {
      // Start a fresh selection
      setPickupDate(dateObj);
      setReturnDate(null);
      setQuantity(1);
      return;
    }

    // We already have a pickup — now the user is setting the return
    if (dateObj.getTime() === pickupDate.getTime()) {
      // Clicked the same day → single-day booking
      setReturnDate(dateObj);
      return;
    }

    const [rangeStart, rangeEnd] =
      dateObj > pickupDate
        ? [pickupDate, dateObj]
        : [dateObj, pickupDate];

    if (!rangeIsClear(rangeStart, rangeEnd)) {
      // Blocked date sits between the two endpoints — reject with flash
      setRangeError(true);
      setTimeout(() => setRangeError(false), 1800);
      return;
    }

    if (dateObj > pickupDate) {
      setReturnDate(dateObj);
    } else {
      // Clicked before pickup → reset with new start
      setPickupDate(dateObj);
      setReturnDate(null);
    }

    // Clamp quantity to what's available in the new range
    const avail = minAvailableInRange(rangeStart, rangeEnd);
    if (quantity > avail) setQuantity(avail);
  };

  const handleMouseEnter = (dateObj) => {
    if (!pickupDate || returnDate) return;
    // Cap the hover preview at the first blocked date in this direction
    const effective = lastClearDate(pickupDate, dateObj);
    setHoverDate(effective);
  };

  // ── Calendar grid helpers ──────────────────────────────────────────────────
  const getDaysArray = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay    = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ id: `empty-${i}`, type: 'empty' });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push({ id: d, type: 'day', date: dateObj });
    }
    return days;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatRange = () => {
    if (!pickupDate) return 'YYYY.MM.DD ~ YYYY.MM.DD';
    if (!returnDate) return `${formatDate(pickupDate)} ~ ${formatDate(pickupDate)}`;
    return `${formatDate(pickupDate)} ~ ${formatDate(returnDate)}`;
  };

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysList = getDaysArray(currentDate.getFullYear(), currentDate.getMonth());
  const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // Whether the footer legend should mention full unavailability
  const hasFullDates = parsedRanges.some(r => r.qty >= unitCount);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>

        {/* Selected Date Card (Top) */}
        <div className={`${styles.displayCard} ${rangeError ? styles.displayCardError : ''}`}>
          <div className={styles.displayTitle}>
            {rangeError ? '⚠ Range blocked — unavailable date in between' : 'Selected Dates'}
          </div>
          <div className={styles.inputWrapper}>
            <span className={pickupDate ? styles.rangeActiveText : styles.rangePlaceholderText}>
              {formatRange()}
            </span>
            <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        {/* Calendar Card */}
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthSelector}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              <span className={styles.arrowIcon}>∨</span>
            </div>
            <div className={styles.navPill}>
              <button className={styles.navPillBtn} onClick={prevMonth}>‹</button>
              <span className={styles.navPillDivider}>|</span>
              <button className={styles.navPillBtn} onClick={nextMonth}>›</button>
            </div>
          </div>

          {/* Weekdays */}
          <div className={styles.weekdaysRow}>
            {WEEKDAYS.map(w => <span key={w} className={styles.weekdayItem}>{w}</span>)}
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid}>
            {daysList.map((itemObj) => {
              if (itemObj.type === 'empty') {
                return <div key={itemObj.id} className={styles.dayEmpty} />;
              }

              const { date } = itemObj;
              const d = date.getDate();

              const isClosed       = isClosedDay(date);
              const isPast         = isPastDay(date);
              const fullyBooked    = isFullyBooked(date);
              const hardBlocked    = isClosed || isPast || fullyBooked;

              const isToday = date.toDateString() === today.toDateString();
              const isStart = pickupDate && pickupDate.getTime() === date.getTime();
              const isEnd   = returnDate && returnDate.getTime() === date.getTime();

              let isInRange = false;
              if (pickupDate && returnDate) {
                isInRange = date > pickupDate && date < returnDate;
              } else if (pickupDate && hoverDate && !returnDate) {
                const lo = hoverDate < pickupDate ? hoverDate : pickupDate;
                const hi = hoverDate < pickupDate ? pickupDate : hoverDate;
                isInRange = date > lo && date < hi;
              }

              let dayClass = styles.day;
              if (isClosed || isPast)  dayClass += ` ${styles.dayClosed}`;
              if (fullyBooked)         dayClass += ` ${styles.dayBooked}`;
              if (!hardBlocked && isStart)   dayClass += ` ${styles.dayStart}`;
              if (!hardBlocked && isEnd)     dayClass += ` ${styles.dayEnd}`;
              if (!hardBlocked && isInRange) dayClass += ` ${styles.dayInRange}`;
              if (isToday && !hardBlocked)   dayClass += ` ${styles.dayToday}`;

              const tooltipText = fullyBooked
                ? 'Not available at this time'
                : isClosed ? 'Not available at this time'
                : isPast   ? 'Date has passed'
                : null;

              return (
                <div
                  key={itemObj.id}
                  className={dayClass}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  title={tooltipText || undefined}
                  aria-label={tooltipText ? `${d} - ${tooltipText}` : String(d)}
                  aria-disabled={hardBlocked ? 'true' : undefined}
                >
                  <div className={styles.dayContent}>{d}</div>

                  {/* Tooltip for fully booked dates */}
                  {fullyBooked && (
                    <span className={styles.bookedTooltip}>Not available at this time</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className={styles.calendarLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDotSelected} />
              Selected
            </span>
            {hasFullDates && (
              <span className={styles.legendItem}>
                <span className={styles.legendDotBooked} />
                Not available
              </span>
            )}
            <span className={styles.legendItem}>
              <span className={styles.legendDotClosed} />
              Closed
            </span>
          </div>

          <div className={styles.divider} />

          {/* Footer: item name + qty picker + confirm */}
          <div className={styles.footerPanel}>
            <div className={styles.footerHeader}>
              <span className={styles.itemName}>{item.title}</span>
              <div className={styles.quantityControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  disabled={quantity >= availableForSelection}
                  onClick={() => setQuantity(Math.min(availableForSelection, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Dynamic stock label — updates based on selected dates */}
            <div className={styles.stockLabel}>
              {pickupDate
                ? availableForSelection < unitCount
                  ? <><strong style={{ color: '#d97706' }}>{availableForSelection}</strong> of {unitCount} units available on selected dates</>
                  : <>All <strong>{unitCount}</strong> units available on selected dates</>
                : <>Max stock: <strong>{unitCount}</strong> unit{unitCount !== 1 ? 's' : ''}</>
              }
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                disabled={!pickupDate || availableForSelection < 1}
                onClick={() => onConfirm({
                  pickupDate,
                  returnDate: returnDate || pickupDate,
                  quantity,
                  item,
                })}
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
