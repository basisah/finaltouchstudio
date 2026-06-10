import React, { useState } from 'react';
import styles from './DateRangePickerModal.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DateRangePickerModal({ item, onClose, onConfirm }) {
  // Let's default to June and July 2026 for the demo as requested.
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  
  const [quantity, setQuantity] = useState(1);

  // Hardcode some closed days (e.g. some weekends or specific dates)
  const isClosedDay = (dateObj) => {
    // E.g., closed on Sundays (0) and some random dates
    if (dateObj.getDay() === 0) return true;
    if (dateObj.getMonth() === 5 && dateObj.getDate() === 6) return true;
    if (dateObj.getMonth() === 5 && dateObj.getDate() === 13) return true;
    return false;
  };

  const handleDateClick = (dateObj) => {
    if (isClosedDay(dateObj)) return; // Can't pick closed day as start/end
    
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

  const renderMonth = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    // Empty slots for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.dayEmpty} />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const isClosed = isClosedDay(dateObj);
      const isToday = year === 2026 && month === 5 && d === 9; // Hardcoded "today" from screenshot

      const isStart = pickupDate && pickupDate.getTime() === dateObj.getTime();
      const isEnd = returnDate && returnDate.getTime() === dateObj.getTime();
      
      let isInRange = false;
      if (pickupDate && returnDate) {
        isInRange = dateObj > pickupDate && dateObj < returnDate;
      } else if (pickupDate && hoverDate) {
        isInRange = (dateObj > pickupDate && dateObj <= hoverDate) || (dateObj >= hoverDate && dateObj < pickupDate);
      }

      let dayClass = styles.day;
      if (isClosed) dayClass += ` ${styles.dayClosed}`;
      if (isStart) dayClass += ` ${styles.dayStart}`;
      if (isEnd) dayClass += ` ${styles.dayEnd}`;
      if (isInRange) dayClass += ` ${styles.dayInRange}`;
      if (isToday) dayClass += ` ${styles.dayToday}`;

      days.push(
        <div 
          key={d} 
          className={dayClass}
          onClick={() => handleDateClick(dateObj)}
          onMouseEnter={() => handleMouseEnter(dateObj)}
        >
          <div className={styles.dayContent}>{d}</div>
        </div>
      );
    }

    return (
      <div className={styles.monthCalendar}>
        <div className={styles.monthHeader}>
          {MONTHS[month]} {year}
        </div>
        <div className={styles.weekdaysRow}>
          {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
        </div>
        <div className={styles.daysGrid}>
          {days}
        </div>
      </div>
    );
  };

  const formatHeaderDate = (d) => {
    if (!d) return 'Select date';
    return `${d.getDate()} ${MONTHS[d.getMonth()].substring(0, 3)}, ${d.getFullYear()}`;
  };

  const getNextMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  };

  const nextMonthDate = getNextMonth(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.topBar}>
          <p className={styles.helperText}>
            Set your dates. Greyed-out days mean we're closed for pickups / returns, but rentals continue through those days.
          </p>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.dateInputs}>
            <div className={styles.inputGroup}>
              <label>1. Pickup</label>
              <div className={`${styles.inputBox} ${!pickupDate ? styles.activeInput : ''}`}>
                <span className={!pickupDate ? styles.placeholder : styles.dateText}>
                  {formatHeaderDate(pickupDate)}
                </span>
                <span className={styles.timeText}>Time</span>
              </div>
            </div>
            
            <div className={styles.arrowIcon}>→</div>

            <div className={styles.inputGroup}>
              <label>2. Return</label>
              <div className={`${styles.inputBox} ${pickupDate && !returnDate ? styles.activeInput : ''}`}>
                <span className={!returnDate ? styles.placeholder : styles.dateText}>
                  {formatHeaderDate(returnDate)}
                </span>
                <span className={styles.timeText}>Time</span>
              </div>
            </div>
          </div>

          <div className={styles.calendarsContainer}>
            <button className={styles.navBtnLeft} onClick={prevMonth}>&lt;</button>
            {renderMonth(currentDate.getFullYear(), currentDate.getMonth())}
            {renderMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth())}
            <button className={styles.navBtnRight} onClick={nextMonth}>&gt;</button>
          </div>

          {/* Item details & quantity */}
          <div className={styles.itemFooter}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.title}</span>
              <div className={styles.quantityControl}>
                <span>Quantity:</span>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button 
                className={styles.clearBtn} 
                onClick={() => { setPickupDate(null); setReturnDate(null); }}
              >
                &times; Clear dates
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.confirmBtn}
            disabled={!pickupDate || !returnDate}
            onClick={() => onConfirm({ pickupDate, returnDate, quantity, item })}
          >
            Confirm Dates
          </button>
        </div>
      </div>
    </div>
  );
}
