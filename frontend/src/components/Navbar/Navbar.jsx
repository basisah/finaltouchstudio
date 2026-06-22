import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./Navbar.module.css";

import logoImg from "../../assets/Logo/FinalTouchStudiosLogo_Icon.png";

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");


// Desktop: only Items + Build links (Profile + Cart are icons)
const DESKTOP_NAV = [
  { label: "Items",    href: "/items"     },
  { label: "Build",    href: "/build"     },
  { label: "About",    href: "/about"     },
];

// Mobile: only Items + Build as text links (Cart + Profile are icons)
const MOBILE_NAV = [
  { label: "Items", href: "/items" },
  { label: "Build", href: "/build" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === "/items") setActiveLink("/items");
    else if (location.pathname === "/build") setActiveLink("/build");
    else if (location.pathname === "/about") setActiveLink("/about");
    else if (location.hash) setActiveLink(location.hash);
    else setActiveLink("#home");
  }, [location]);

  // Read logged-in user info on mount/navigation and synchronize with database
  useEffect(() => {
    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    const userInfo = localStorage.getItem("user_info");

    // Immediately show cached user info if available to keep it fast
    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (e) {
        // Ignore parsing error
      }
    }

    // In the background, fetch the latest user record to synchronize state and overwrite stale data
    if (token) {
      fetch(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Stale token");
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user_info", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // If unauthorized or stale, clear local user state
        setUser(null);
      });
    } else {
      setUser(null);
    }
  }, [location]);

  // Click outside listener to dismiss the dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = (e) => {
      if (!e.target.closest(`.${styles.profileContainer}`)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

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

  const handleSignOut = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_info");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const isActive = (href) =>
    activeLink === href ||
    (href.startsWith("/#") && activeLink === href.substring(1));

  const isLandingPage = location.pathname === "/";

  return (
    <header className={`${styles.navbar} ${!isLandingPage ? styles.light : ""} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={(e) => handleLinkClick("/#home", e)}>
          <img src={logoImg} alt="FinalTouch Studios Logo" className={styles.logoMarkImg} />
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

        {/* ── Mobile nav — Items text links, hidden on desktop */}
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
          <Link to="/cart" className={styles.iconBtn} aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.length > 0 && (
              <span className={styles.badge}>{cart.length}</span>
            )}
          </Link>

          <div className={styles.profileContainer}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className={styles.iconBtn} 
              aria-label="User Profile"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
               {user ? (
                user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "none",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "var(--brand-gold)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      border: "none",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                )
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {user ? (
                  <>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                    <div className={styles.dropDivider}></div>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className={styles.dropLink}
                    >
                      My Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsDropdownOpen(false)} 
                        className={styles.dropLink}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut} 
                      className={styles.signOutBtn}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.userInfo}>
                      <span className={styles.userName} style={{ fontSize: "0.9rem" }}>Welcome to FinalTouch</span>
                      <span className={styles.userEmail}>Sign in to manage bookings</span>
                    </div>
                    <div className={styles.dropDivider}></div>
                    <Link 
                      to="/login" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className={styles.signInBtn}
                    >
                      Sign In / Connect
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
