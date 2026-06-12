import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_EMOJI,
  EMOJI_CATEGORIES,
  getUniqueEmojis,
  searchEmojis,
} from "../../constants/emojiLibrary";
import styles from "./EmojiPicker.module.css";

export default function EmojiPicker({ value = DEFAULT_EMOJI, onChange, label = "Emoji" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const displayedEmojis = useMemo(() => {
    if (query.trim()) {
      return getUniqueEmojis(searchEmojis(query));
    }
    const category = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
    return category ? category.emojis : [];
  }, [query, activeCategory]);

  const handleSelect = (emoji) => {
    onChange?.(emoji);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerEmoji}>{value || DEFAULT_EMOJI}</span>
        <span className={styles.triggerText}>{open ? "Close picker" : "Choose emoji"}</span>
        <span className={styles.triggerChevron} aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className={styles.panel} role="listbox" aria-label="Emoji picker">
          <div className={styles.searchRow}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search emojis (e.g. wedding, cake, flower)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {!query.trim() && (
            <div className={styles.tabs} role="tablist">
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.gridWrap}>
            {displayedEmojis.length === 0 ? (
              <p className={styles.empty}>No emojis match your search.</p>
            ) : (
              <div className={styles.grid}>
                {displayedEmojis.map((entry) => (
                  <button
                    key={entry.emoji}
                    type="button"
                    role="option"
                    aria-selected={value === entry.emoji}
                    className={`${styles.emojiBtn} ${value === entry.emoji ? styles.emojiBtnActive : ""}`}
                    onClick={() => handleSelect(entry.emoji)}
                    title={entry.keywords.join(", ")}
                  >
                    {entry.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
