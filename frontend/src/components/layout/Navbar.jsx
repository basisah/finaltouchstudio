import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { clearSession, getStoredUser } from "../../utils/session";
import { Button, CartIcon, CloseIcon, LogoutIcon, MenuIcon, UserIcon } from "../ui";
import starMark from "../../assets/Logo/star-mark.png";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Rentals", to: "/items" },
  { label: "Setup Guides", to: "/build" },
  { label: "About", to: "/about" },
];

/** Wordmark shared by the navbar and footer. */
export function Brand({ onDark = false, onClick }) {
  return (
    <Link to="/" className={`${styles.brand} ${onDark ? styles.brandOnDark : ""}`} onClick={onClick} aria-label="FinalTouch Studio — home">
      <img src={starMark} alt="" width="26" height="26" className={styles.brandMark} />
      <span className={styles.brandText}>
        FinalTouch <em>Studio</em>
      </span>
    </Link>
  );
}

/**
 * Site header. `overlay` (landing page) starts transparent over the hero and
 * turns solid once the page scrolls; every other page uses the solid style.
 */
export default function Navbar({ overlay = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const cartCount = cart.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useClickOutside(accountRef, () => setAccountOpen(false), accountOpen);

  const handleSignOut = () => {
    clearSession();
    setAccountOpen(false);
    navigate("/");
  };

  const transparent = overlay && !scrolled && !menuOpen;
  const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`;

  return (
    <header className={`${styles.navbar} ${transparent ? styles.transparent : styles.solid} ${overlay ? styles.fixed : ""}`}>
      <div className={styles.inner}>
        <Brand onDark={transparent} />

        <nav className={styles.links} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.iconButton} aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
            <CartIcon width={22} height={22} />
            {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
          </Link>

          <div className={styles.account} ref={accountRef}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((open) => !open)}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className={styles.avatar} width="30" height="30" />
              ) : (
                <UserIcon width={22} height={22} />
              )}
            </button>

            {accountOpen && (
              <div className={styles.menu} role="menu">
                {user ? (
                  <>
                    <div className={styles.menuHeader}>
                      <span className={styles.menuName}>{user.name || "My account"}</span>
                      {user.email && <span className={styles.menuEmail}>{user.email}</span>}
                    </div>
                    <Link to="/profile" className={styles.menuItem} role="menuitem">
                      <UserIcon width={18} height={18} /> Profile &amp; bookings
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className={styles.menuItem} role="menuitem">
                        <MenuIcon width={18} height={18} /> Admin dashboard
                      </Link>
                    )}
                    <button type="button" className={styles.menuItem} role="menuitem" onClick={handleSignOut}>
                      <LogoutIcon width={18} height={18} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.menuHeader}>
                      <span className={styles.menuName}>Welcome</span>
                      <span className={styles.menuEmail}>Sign in to manage your bookings</span>
                    </div>
                    <Button to="/login" block size="sm">
                      Sign in or register
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuToggle}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon width={22} height={22} /> : <MenuIcon width={22} height={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className={styles.mobileNav} aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.linkActive : ""}`}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/cart" className={styles.mobileLink}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
          <NavLink to={user ? "/profile" : "/login"} className={styles.mobileLink}>
            {user ? "Profile & bookings" : "Sign in"}
          </NavLink>
        </nav>
      )}
    </header>
  );
}
