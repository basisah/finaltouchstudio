import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { get } from "../../api/client";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CategoryNavPills from "./components/CategoryNavPills";
import InventoryCategorySection from "./components/InventoryCategorySection";
import { useActiveCategoryObserver } from "./hooks/useActiveCategoryObserver";
import {
  DISPLAY_CATEGORIES,
  groupItemsByDisplayCategory,
  getDisplayCategoryById,
} from "./itemsPageCategories";
import styles from "./ItemsPage.module.css";

const SCROLL_OFFSET = 160;

function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return [item.title, item.name, item.description, item.categoryId]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

export default function ItemsPage() {
  const { cart, addToCart, updateQuantity } = useCart();
  const location = useLocation();

  const [dbItems, setDbItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    get("/items")
      .then((data) => setDbItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  const filteredItems = useMemo(
    () => dbItems.filter((item) => matchesSearch(item, searchQuery)),
    [dbItems, searchQuery]
  );

  const groupedItems = useMemo(
    () => groupItemsByDisplayCategory(filteredItems),
    [filteredItems]
  );

  const visibleSectionIds = useMemo(
    () =>
      DISPLAY_CATEGORIES.filter((c) => c.id !== "all" && (groupedItems[c.id]?.length ?? 0) > 0).map(
        (c) => c.id
      ),
    [groupedItems]
  );

  const [activePillId, setActivePillId] = useActiveCategoryObserver(visibleSectionIds, {
    topOffset: SCROLL_OFFSET,
  });

  const cartMap = useMemo(
    () => new Map(cart.map((entry) => [entry.item.id, entry])),
    [cart]
  );

  const scrollToCategory = useCallback((categoryId) => {
    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(`category-section-${categoryId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handlePillSelect = useCallback(
    (categoryId) => {
      setActivePillId(categoryId);
      scrollToCategory(categoryId);
    },
    [scrollToCategory, setActivePillId]
  );

  const handleOpenItem = useCallback((item) => setSelectedItem(item), []);
  const handleRentItem = useCallback((item) => setSelectedItem(item), []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get("category");
    const itemId = params.get("item");

    if (catId && getDisplayCategoryById(catId)) {
      setActivePillId(catId);
      const timer = setTimeout(() => scrollToCategory(catId), 400);
      if (itemId) {
        const item = dbItems.find((i) => i.id === itemId);
        if (item) setSelectedItem(item);
      }
      return () => clearTimeout(timer);
    }
  }, [location.search, dbItems, scrollToCategory, setActivePillId]);

  const triggerToast = useCallback((msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleConfirmDates = useCallback(
    ({ pickupDate, returnDate, quantity, item }) => {
      addToCart(item, pickupDate, returnDate, quantity);
      triggerToast(`Added ${quantity}× "${item.title || item.name}" to your cart`);
      setSelectedItem(null);
    },
    [addToCart, triggerToast]
  );

  const categoriesToRender = DISPLAY_CATEGORIES.filter((c) => c.id !== "all");

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.ambientOrb1} aria-hidden="true" />
      <div className={styles.ambientOrb2} aria-hidden="true" />

      <main className={styles.main}>
        <header className={styles.pageIntro}>
          <p className={styles.pageEyebrow}>FinalTouch Studio</p>
          <h1 className={styles.pageTitle}>Rental Inventory</h1>
          <p className={styles.pageSubtitle}>
            Curated props and décor for weddings, birthdays, holud, and celebrations.
          </p>
        </header>

        <div className={styles.searchBlock}>
          <div className={styles.searchGlass}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search props, categories, inventory…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search inventory"
            />
          </div>
        </div>

        <div className={styles.stickyPillsWrap}>
          <CategoryNavPills activeId={activePillId} onSelect={handlePillSelect} />
        </div>

        <div className={styles.categoriesStack}>
          {categoriesToRender.map((category) => (
            <InventoryCategorySection
              key={category.id}
              category={category}
              items={groupedItems[category.id] || []}
              cartMap={cartMap}
              onOpenItem={handleOpenItem}
              onRentItem={handleRentItem}
              onUpdateQuantity={updateQuantity}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>✨</span>
              <h3>No items found</h3>
              <p>Try a different search term or browse another category.</p>
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <DateRangePickerModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleConfirmDates}
        />
      )}

      {showToast && (
        <div className={styles.toast} role="status">
          {toastMsg}
        </div>
      )}

      <Footer />
    </div>
  );
}
