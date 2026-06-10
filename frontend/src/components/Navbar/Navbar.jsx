import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Home",      href: "/#home"     },
  { label: "Items",     href: "/items"     },
  { label: "Gallery",   href: "/#gallery"  },
  { label: "Delivery",  href: "/#delivery" },
  { label: "Contact",   href: "/#contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Update active state based on location
  useEffect(() => {
    if (location.pathname === "/items") {
      setActiveLink("/items");
    } else if (location.hash) {
      setActiveLink(location.hash);
    } else {
      setActiveLink("#home");
    }
  }, [location]);

  // Handle nav clicks
  const handleLinkClick = (href, e) => {
    setMenuOpen(false);
    if (href.startsWith("/#")) {
      const targetHash = href.substring(1); // e.g. "#gallery"
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.querySelector(targetHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        window.history.pushState(null, null, targetHash);
        setActiveLink(targetHash);
      } else {
        // Let React Router navigate to / and then we handle hash scrolling on mount
        setActiveLink(targetHash);
      }
    } else {
      setActiveLink(href);
    }
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={(e) => handleLinkClick("/#home", e)}>
          <span className={styles.logoMark}>FT</span>
          <span className={styles.logoText}>
            FinalTouch<span className={styles.logoAccent}> Studio</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`${styles.navLink} ${
                activeLink === l.href || (l.href.startsWith("/#") && activeLink === l.href.substring(1)) ? styles.active : ""
              }`}
              onClick={(e) => handleLinkClick(l.href, e)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link to="/#contact" className={styles.cta} onClick={(e) => handleLinkClick("/#contact", e)}>
          Book Now
        </Link>

        {/* Desktop Actions (Cart & Profile) */}
        <div className={styles.desktopActions}>
          <Link to="/items" className={styles.iconBtn} aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.length > 0 && (
              <span className={styles.badge}>{cart.length}</span>
            )}
          </Link>

          <Link to="/admin" className={styles.iconBtn} aria-label="User Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>

        {/* Mobile Actions (Cart & Profile) */}
        <div className={styles.mobileActions}>
          <Link to="/items" className={styles.iconBtn} aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.length > 0 && (
              <span className={styles.badge}>{cart.length}</span>
            )}
          </Link>

          <Link to="/admin" className={styles.iconBtn} aria-label="User Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            to={l.href}
            className={styles.drawerLink}
            onClick={(e) => handleLinkClick(l.href, e)}
          >
            {l.label}
          </Link>
        ))}
        <Link to="/#contact" className={styles.drawerCta} onClick={(e) => handleLinkClick("/#contact", e)}>
          Book Now
        </Link>
      </div>
    </header>
  );
}
