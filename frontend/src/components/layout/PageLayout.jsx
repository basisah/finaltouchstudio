import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "./PageLayout.module.css";

/**
 * Standard page shell: navbar, a <main> landmark and the footer.
 * `overlayNav` lets the landing hero run underneath a transparent navbar.
 */
export default function PageLayout({ overlayNav = false, footer = true, className = "", children }) {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <Navbar overlay={overlayNav} />
      <main id="main" className={`${styles.main} ${className}`}>
        {children}
      </main>
      {footer && <Footer />}
    </div>
  );
}
