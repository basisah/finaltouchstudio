import { useState } from "react";
import { GALLERY_ITEMS } from "../../../constants/categories";
import styles from "./Gallery.module.css";

const FILTERS = ["All", "holud", "white", "birthday", "reception", "bridal-shower", "mayoun"];

export default function Gallery() {
  const [filter, setFilter] = useState("All");

  const visible = filter === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((g) => g.category === filter);

  return (
    <section id="gallery" className={styles.section} aria-label="Past projects gallery">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Our Work</p>
        <h2 className={styles.heading}>Past Projects</h2>
        <p className={styles.sub}>Each setup is crafted with care and a passion for perfection.</p>

        {/* Filter tabs */}
        <div className={styles.filters} role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All" ? "All Projects" : f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {visible.map((item) => (
            <div key={item.id} className={styles.card}>
              {item.img ? (
                <img src={item.img} alt={item.title} className={styles.img} loading="lazy" />
              ) : (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderLabel}>{item.title}</span>
                </div>
              )}
              <div className={styles.cardOverlay}>
                <span className={styles.cardTag}>{item.category.replace("-", " ")}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
