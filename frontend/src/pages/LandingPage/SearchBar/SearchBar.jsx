import { useState } from "react";
import { CATEGORIES } from "../../../constants/categories";
import styles from "./SearchBar.module.css";

/**
 * SearchBar
 * Full-width search with category dropdown and date picker.
 */
export default function SearchBar() {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: wire up to API search endpoint
    console.log("Search:", { query, category });
  };

  // Flatten categories for the dropdown (include sub-categories)
  const allOptions = CATEGORIES.flatMap((c) =>
    c.sub
      ? [{ id: c.id, label: c.label }, ...c.sub.map((s) => ({ id: s.id, label: `  ↳ ${s.label}` }))]
      : [{ id: c.id, label: c.label }]
  );

  return (
    <section className={styles.section} aria-label="Search">
      <div className={styles.inner}>
        <form className={styles.bar} onSubmit={handleSearch} role="search">
          {/* Category select */}
          <div className={styles.field}>
            <label htmlFor="search-category" className={styles.fieldLabel}>Occasion</label>
            <select
              id="search-category"
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Occasions</option>
              {allOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.divider} aria-hidden="true" />

          {/* Keyword search */}
          <div className={`${styles.field} ${styles.fieldGrow}`}>
            <label htmlFor="search-query" className={styles.fieldLabel}>Search</label>
            <input
              id="search-query"
              type="text"
              className={styles.input}
              placeholder="e.g. floral arch, balloon wall, table setting…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.divider} aria-hidden="true" />

          {/* Date */}
          <div className={styles.field}>
            <label htmlFor="search-date" className={styles.fieldLabel}>Event Date</label>
            <input
              id="search-date"
              type="date"
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.btn} aria-label="Search">
            <span className={styles.btnIcon}>🔍</span>
            <span>Search</span>
          </button>
        </form>
      </div>
    </section>
  );
}
