import React, { useState } from 'react';
import styles from './DateRangePickerModal.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DateRangePickerModal({ item, onClose, onConfirm }) {
  // Default to June 2026 for the demo
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Closed days (Sundays and specific dates)
  const isClosedDay = (dateObj) => {
    if (dateObj.getDay() === 0) return true;
    if (dateObj.getMonth() === 5 && dateObj.getDate() === 6) return true;
    if (dateObj.getMonth() === 5 && dateObj.getDate() === 13) return true;
    return false;
  };

  const handleDateClick = (dateObj) => {
    if (isClosedDay(dateObj)) return;
    
    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(dateObj);
      setReturnDate(null);
    } else {
      if (dateObj < pickupDate) {
        setPickupDate(dateObj);
      } else {
        setReturnDate(dateObj);
      }
    }
  };

  const handleMouseEnter = (dateObj) => {
    if (pickupDate && !returnDate) {
      setHoverDate(dateObj);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getDaysArray = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty padding slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ id: `empty-${i}`, type: 'empty' });
    }

    // Actual calendar days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push({ id: d, type: 'day', date: dateObj });
    }

    return days;
  };

  const formatRange = () => {
    if (!pickupDate && !returnDate) return "YYYY.MM.DD ~ YYYY.MM.DD";
    
    const formatSingle = (d) => {
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };

    if (pickupDate && !returnDate) {
      return `${formatSingle(pickupDate)} ~ ${formatSingle(pickupDate)}`;
    }
    return `${formatSingle(pickupDate)} ~ ${formatSingle(returnDate)}`;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysList = getDaysArray(currentDate.getFullYear(), currentDate.getMonth());
  const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        
        {/* Selected Date Card (Top) */}
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

        {/* Calendar Card (Bottom) */}
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthSelector}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              <span className={styles.arrowIcon}>∨</span>
            </div>
            
            {/* Navigation Pill */}
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
              const isClosed = isClosedDay(date);
              const isToday = date.getFullYear() === 2026 && date.getMonth() === 5 && d === 9;

              const isStart = pickupDate && pickupDate.getTime() === date.getTime();
              const isEnd = returnDate && returnDate.getTime() === date.getTime();
              
              let isInRange = false;
              if (pickupDate && returnDate) {
                isInRange = date > pickupDate && date < returnDate;
              } else if (pickupDate && hoverDate) {
                isInRange = (date > pickupDate && date <= hoverDate) || (date >= hoverDate && date < pickupDate);
              }

              let dayClass = styles.day;
              if (isClosed) dayClass += ` ${styles.dayClosed}`;
              if (isStart) dayClass += ` ${styles.dayStart}`;
              if (isEnd) dayClass += ` ${styles.dayEnd}`;
              if (isInRange) dayClass += ` ${styles.dayInRange}`;
              if (isToday) dayClass += ` ${styles.dayToday}`;

              return (
                <div 
                  key={itemObj.id} 
                  className={dayClass}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                >
                  <div className={styles.dayContent}>{d}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.divider} />

          {/* Item details, quantity and confirm actions inside the popup card */}
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
                  onClick={() => setQuantity(Math.min(item.unit_count || 1, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.stockLabel}>
              Max available stock: {item.unit_count || 1} units
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button 
                className={styles.confirmBtn}
                disabled={!pickupDate}
                onClick={() => onConfirm({ pickupDate, returnDate: returnDate || pickupDate, quantity, item })}
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
