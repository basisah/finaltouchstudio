import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./Navbar.module.css";

// Desktop: only Items link (Profile + Cart are icons)
const DESKTOP_NAV = [
  { label: "Items",    href: "/items"     },
];

// Mobile: only Items as a text link (Cart + Profile are icons)
const MOBILE_NAV = [
  { label: "Items", href: "/items" },
];


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const { cart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/items") setActiveLink("/items");
    else if (location.hash) setActiveLink(location.hash);
    else setActiveLink("#home");
  }, [location]);

  const handleLinkClick = (href, e) => {
    if (href.startsWith("/#")) {
      const hash = href.substring(1);
      if (location.pathname === "/") {
        e.preventDefault();
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, null, hash);
      }
      setActiveLink(hash);
    } else {
      setActiveLink(href);
    }
  };

  const isActive = (href) =>
    activeLink === href ||
    (href.startsWith("/#") && activeLink === href.substring(1));

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>

        {/* Logo — FT mark always visible; brand text hidden on mobile */}
        <Link to="/" className={styles.logo} onClick={(e) => handleLinkClick("/#home", e)}>
          <span className={styles.logoMark}>FT</span>
          <span className={styles.logoText}>
            FinalTouch<span className={styles.logoAccent}> Studio</span>
          </span>
        </Link>

        {/* ── Desktop nav — hidden on mobile ─────────────────────────── */}
        <nav className={styles.desktopNav}>
          {DESKTOP_NAV.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`${styles.navLink} ${isActive(l.href) ? styles.active : ""}`}
              onClick={(e) => handleLinkClick(l.href, e)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Mobile nav — Items + Gallery text links, hidden on desktop */}
        <nav className={styles.mobileNav}>
          {MOBILE_NAV.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`${styles.mobileNavLink} ${isActive(l.href) ? styles.active : ""}`}
              onClick={(e) => handleLinkClick(l.href, e)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Icons: Cart + Profile (always visible on right) ─────────── */}
        <div className={styles.iconGroup}>
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
      </div>
    </header>
  );
}
