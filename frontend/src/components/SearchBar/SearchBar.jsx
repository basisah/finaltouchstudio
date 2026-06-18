import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./SearchBar.module.css";

// ── SVG Icon Components for Fallback ──
const SignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" />
    <rect x="8" y="14" width="48" height="36" rx="4" stroke="#EC4899" />
    <path d="M16 28h32" stroke="#EAB308" />
  </svg>
);
const ArchIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 58V30C12 18 20 10 32 10s20 8 20 20v28Z" fill="rgba(59, 130, 246, 0.12)" stroke="#3B82F6" />
    <path d="M6 58h12M46 58h12" stroke="#64748B" />
  </svg>
);
const WallIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="44" height="40" rx="2" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" />
    <path d="M18 10v40M26 10v40M34 10v40M42 10v40" stroke="#34D399" strokeDasharray="3 3" />
  </svg>
);
const FurnitureIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="28" height="22" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" />
    <path d="M12 34h40v6H12z" stroke="#D97706" />
  </svg>
);
const CakeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="26" width="32" height="18" fill="rgba(245, 208, 254, 0.3)" stroke="#D946EF" />
    <path d="M12 44h40v10H12z" stroke="#6366F1" />
  </svg>
);
const SpecialIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="22" r="12" fill="rgba(236, 72, 153, 0.15)" stroke="#EC4899" />
    <path d="M32 34c0 6-6 10-6 10" stroke="#475569" />
  </svg>
);

const getSvgIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("neon") || t.includes("sign") || t.includes("board") || t.includes("number")) return <SignIcon />;
  if (t.includes("arch") || t.includes("frame") || t.includes("ring")) return <ArchIcon />;
  if (t.includes("wall") || t.includes("backdrop") || t.includes("mandap")) return <WallIcon />;
  if (t.includes("chair") || t.includes("sofa") || t.includes("throne") || t.includes("table") || t.includes("bench")) return <FurnitureIcon />;
  if (t.includes("cake") || t.includes("cupcake") || t.includes("tower") || t.includes("display")) return <CakeIcon />;
  return <SpecialIcon />;
};

export default function SearchBar({ items = [] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, 8); // Show first 8 items as suggestion when focused
    }
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [query, items]);

  return (
    <div className={styles.searchBarContainer} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Type to search props..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {/* Search Magnifying Glass Icon on Right */}
        <span className={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
      </div>

      {/* Dropdown Results Window */}
      {isOpen && (
        <div className={styles.dropdownWindow}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <span>✨</span> No matching props found
            </div>
          ) : (
            <div className={styles.resultsList}>
              <div className={styles.resultsHeading}>
                {query.trim() ? `Search Results (${filteredItems.length})` : "Popular Props"}
              </div>
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className={styles.resultRow}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.leftCol}>
                    <div className={styles.itemAvatar}>
                      {item.image && item.image.startsWith("/uploads") ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className={styles.iconWrapper}>
                          {getSvgIcon(item.title)}
                        </div>
                      )}
                    </div>
                    <span className={styles.itemTitle}>{item.title}</span>
                  </div>
                  <div className={styles.rightCol}>
                    <span className={styles.itemPrice}>
                      ${parseFloat(item.price || 0).toFixed(2)}
                    </span>
                    <span className={styles.priceUnit}>/day</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
