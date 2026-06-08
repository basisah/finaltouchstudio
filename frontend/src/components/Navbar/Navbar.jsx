import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Home",      href: "#home"     },
  { label: "Occasions", href: "#occasions" },
  { label: "Gallery",   href: "#gallery"  },
  { label: "Delivery",  href: "#delivery" },
  { label: "Contact",   href: "#contact"  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeLink,  setActiveLink]  = useState("#home");

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on link click
  const handleLinkClick = (href) => {
    setActiveLink(href);
    setMenuOpen(false);
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#home" className={styles.logo} onClick={() => handleLinkClick("#home")}>
          <span className={styles.logoMark}>FT</span>
          <span className={styles.logoText}>
            FinalTouch<span className={styles.logoAccent}> Studio</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${activeLink === l.href ? styles.active : ""}`}
              onClick={() => handleLinkClick(l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a href="#contact" className={styles.cta} onClick={() => handleLinkClick("#contact")}>
          Book Now
        </a>

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
          <a
            key={l.href}
            href={l.href}
            className={styles.drawerLink}
            onClick={() => handleLinkClick(l.href)}
          >
            {l.label}
          </a>
        ))}
        <a href="#contact" className={styles.drawerCta} onClick={() => handleLinkClick("#contact")}>
          Book Now
        </a>
      </div>
    </header>
  );
}
