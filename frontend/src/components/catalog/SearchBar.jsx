import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import { formatPrice } from "../../utils/format";
import { SearchIcon } from "../ui";
import ItemImage from "./ItemImage";
import styles from "./SearchBar.module.css";

const MAX_ITEMS = 6;
const MAX_CATEGORIES = 3;

/**
 * Catalogue search with instant suggestions.
 * Submitting opens the rentals page filtered by the query.
 * `variant="hero"` is the large glass version used on the landing page.
 */
export default function SearchBar({ items = [], categories = [], variant = "default", placeholder = "Search arches, florals, lighting…" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(wrapperRef, () => setOpen(false), open);

  const term = query.trim().toLowerCase();

  const matchedCategories = useMemo(() => {
    const list = term ? categories.filter((c) => c.label?.toLowerCase().includes(term)) : categories;
    return list.slice(0, MAX_CATEGORIES);
  }, [term, categories]);

  const matchedItems = useMemo(() => {
    const list = term
      ? items.filter((item) => item.title?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term))
      : items;
    return list.slice(0, MAX_ITEMS);
  }, [term, items]);

  const hasResults = matchedCategories.length > 0 || matchedItems.length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpen(false);
    navigate(term ? `/items?q=${encodeURIComponent(query.trim())}` : "/items");
  };

  return (
    <div className={`${styles.wrapper} ${variant === "hero" ? styles.hero : ""}`} ref={wrapperRef}>
      <form className={styles.form} role="search" onSubmit={handleSubmit}>
        <SearchIcon className={styles.leadingIcon} />
        <input
          type="search"
          className={styles.input}
          placeholder={placeholder}
          aria-label="Search the rental catalogue"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        />
        <button type="submit" className={styles.submit}>
          Search
        </button>
      </form>

      {open && (items.length > 0 || categories.length > 0) && (
        <div className={styles.dropdown}>
          {!hasResults ? (
            <p className={styles.empty}>No matches for “{query}”. Try “arch”, “balloon” or “lights”.</p>
          ) : (
            <>
              {matchedCategories.length > 0 && (
                <div className={styles.group}>
                  <span className={styles.groupTitle}>Occasions</span>
                  <div className={styles.chips}>
                    {matchedCategories.map((cat) => (
                      <Link key={cat.id} to={`/items?category=${cat.id}`} className={styles.chip} onClick={() => setOpen(false)}>
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedItems.length > 0 && (
                <div className={styles.group}>
                  <span className={styles.groupTitle}>{term ? "Rentals" : "Popular rentals"}</span>
                  <ul>
                    {matchedItems.map((item) => (
                      <li key={item.id}>
                        <Link to={`/item/${item.id}`} className={styles.row} onClick={() => setOpen(false)}>
                          <span className={styles.thumb}>
                            <ItemImage src={item.image} alt="" width={120} />
                          </span>
                          <span className={styles.rowTitle}>{item.title}</span>
                          <span className={styles.rowPrice}>
                            {formatPrice(item.price)}
                            <small> / day</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
