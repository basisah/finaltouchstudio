import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../../constants/categories";
import { get } from "../../../api/client";
import HeroImage from "./HeroImage";
import HeroTitle from "./HeroTitle";
import styles from "./HeroSection.module.css";

// Import category images
import birthdayImg from "../../../assets/Category/Birthday_stage.jpg";
import proposalImg from "../../../assets/Category/Proposal_Stage.jpg";
import marriageImg from "../../../assets/Category/Marriage_Stage.jpg";

const categoryImages = {
  birthday: birthdayImg,
  proposal: proposalImg,
  marriage: marriageImg,
};

/** Inline search bar (clean and less text) */
function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dbItems, setDbItems] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const wrapperRef = useRef(null);

  // Load items and categories
  useEffect(() => {
    get("/items")
      .then((data) => setDbItems(data || []))
      .catch((err) => console.error("Error loading items:", err));
      
    get("/categories")
      .then((data) => setDbCategories(data || []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

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

  // Filter categories and items based on query
  const filteredCategories = useMemo(() => {
    if (!query.trim()) {
      return dbCategories.slice(0, 2); // 2 categories on top
    }
    const q = query.toLowerCase();
    return dbCategories.filter((cat) => cat.label.toLowerCase().includes(q));
  }, [query, dbCategories]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return dbItems.slice(0, 5); // 5 items as start
    }
    const q = query.toLowerCase();
    return dbItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [query, dbItems]);

  return (
    <div className={styles.heroSearchContainer} ref={wrapperRef}>
      <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className={styles.sInputSimple}
          placeholder="Search setups, stages, occasions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button type="submit" className={styles.sBtnSimple}>
          Search
        </button>
      </form>

      {/* Interactive Dropdown Window */}
      {isOpen && (
        <div className={styles.dropdownWindow}>
          {filteredCategories.length === 0 && filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <span>✨</span> No results found
            </div>
          ) : (
            <div className={styles.resultsList}>
              {/* Categories Section */}
              {filteredCategories.length > 0 && (
                <div className={styles.sectionGroup}>
                  <div className={styles.sectionHeading}>Occasions</div>
                  {filteredCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/items?category=${cat.id}`}
                      className={styles.resultRow}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={styles.categoryEmoji}>{cat.emoji || "🎉"}</span>
                      <span className={styles.categoryLabel}>{cat.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Items Section */}
              {filteredItems.length > 0 && (
                <div className={styles.sectionGroup}>
                  <div className={styles.sectionHeading}>Props & Rentals</div>
                  {filteredItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/item/${item.id}`}
                      className={styles.resultRow}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={styles.itemLeft}>
                        {item.image && item.image.startsWith("/uploads") ? (
                          <img src={item.image} alt="" className={styles.itemThumb} />
                        ) : (
                          <span className={styles.itemEmoji}>✨</span>
                        )}
                        <span className={styles.itemTitle}>{item.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                        <span className={styles.itemPrice}>
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>/day</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * HeroSection
 * Layout: HeroImage (no tint) → centered content → clean search → 3 category
 * cards with dual-image blending blur on top of a dark purple gradient background.
 */
export default function HeroSection() {
  // Show only first 3 categories on the hero strip
  const heroCategories = CATEGORIES.slice(0, 3);

  return (
    <section id="home" className={styles.hero} aria-label="Hero">
      {/* Background image — subtle vignette only, no heavy tint */}
      <HeroImage />

      {/* Centre content */}
      <div className={styles.content}>
        <HeroTitle />
        <div className={styles.searchRow}>
          <HeroSearchBar />
        </div>
      </div>

      {/* 3 category cards — seamless gradual blur cards */}
      <div className={styles.categoryStrip}>
        {heroCategories.map((cat) => {
          const imgUrl = categoryImages[cat.id];

          let description = "Bespoke balloon walls, kids themes & stage setups.";
          if (cat.id === "proposal") {
            description = "Fairy lights, romantic floral arches & signs.";
          } else if (cat.id === "marriage") {
            description = "Exquisite wedding, holud & reception stages.";
          }

          return (
            <Link key={cat.id} to={`/package/${cat.id}`} className={styles.catCard}>
              {imgUrl && (
                <>
                  {/* Clear image in background */}
                  <img
                    src={imgUrl}
                    alt={cat.label}
                    className={styles.catCardImgClear}
                  />
                  {/* Blurred overlay image with vertical mask */}
                  <img
                    src={imgUrl}
                    alt=""
                    className={styles.catCardImgBlur}
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Purple themed gradual overlay */}
              <div className={styles.catCardOverlay} />

              {/* Text content area */}
              <div className={styles.catCardContent}>
                <h3 className={styles.catCardTitle}>{cat.label}</h3>
                <p className={styles.catCardDesc}>{description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
