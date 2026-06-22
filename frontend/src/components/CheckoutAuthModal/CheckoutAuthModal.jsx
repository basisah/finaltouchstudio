import styles from "./CheckoutAuthModal.module.css";

export default function CheckoutAuthModal({ onClose, onSignIn, onGuest }) {
  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-auth-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.icon}>✦</div>
          <h2 id="checkout-auth-title" className={styles.title}>
            How would you like to continue?
          </h2>
          <p className={styles.subtitle}>
            Sign in to track your orders, or continue as a guest to checkout quickly.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.signInBtn} onClick={onSignIn}>
            Sign In / Create Account
          </button>
          <button type="button" className={styles.guestBtn} onClick={onGuest}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
