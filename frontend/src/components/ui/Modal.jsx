import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";
import styles from "./ui.module.css";

/**
 * Accessible dialog: closes on Escape and backdrop click, locks page scroll
 * while open and returns focus to the element that opened it.
 */
export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close dialog">
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
