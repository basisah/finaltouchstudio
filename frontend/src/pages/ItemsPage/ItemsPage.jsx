import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "../../api/client";
import ProductCard, { ProductCardSkeleton } from "../../components/catalog/ProductCard";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import PageLayout from "../../components/layout/PageLayout";
import { Button, CloseIcon, Container, EmptyState, PageHeader, SearchIcon, Toast } from "../../components/ui";
import { getCategoryIcon } from "../../constants/categoryIcons";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../hooks/useCatalog";
import { useToast } from "../../hooks/useToast";
import { titleCase } from "../../utils/format";
import styles from "./ItemsPage.module.css";

const ALL = "all";

/** Sub-category chips for a category: its configured list, limited to ones that have items. */
function buildSubcategories(category, items) {
  const used = new Set(items.map((item) => item.subCategoryId).filter(Boolean));
  const configured = (category.subcategories || []).filter((sub) => used.has(sub.id));
  const known = new Set(configured.map((sub) => sub.id));
  const extra = [...used].filter((id) => !known.has(id)).map((id) => ({ id, label: titleCase(id) }));
  return [...configured, ...extra];
}

export default function ItemsPage() {
  const { items, categories, loading, error } = useCatalog();
  const { cart, addToCart, updateQuantity } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, showToast] = useToast();

  const [pickerItem, setPickerItem] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);

  const activeCategory = searchParams.get("category") || ALL;
  const activeSubcategory = searchParams.get("subcategory") || ALL;
  const query = searchParams.get("q") || "";
  const term = query.trim().toLowerCase();

  /** Updates the URL so every filter state is linkable and survives a refresh. */
  const setFilters = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === ALL) next.delete(key);
        else next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const categoryLabels = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.label])), [categories]);
  const cartByItemId = useMemo(() => new Map(cart.map((line) => [line.item.id, line])), [cart]);

  const itemsByCategory = useMemo(() => {
    const groups = new Map(categories.map((c) => [c.id, []]));
    for (const item of items) groups.get(item.categoryId)?.push(item);
    return groups;
  }, [items, categories]);

  const searchResults = useMemo(() => {
    if (!term) return [];
    return items.filter(
      (item) => item.title?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term)
    );
  }, [items, term]);

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (c) => (activeCategory === ALL || c.id === activeCategory) && (itemsByCategory.get(c.id)?.length || c.id === activeCategory)
      ),
    [categories, activeCategory, itemsByCategory]
  );

  const openPicker = useCallback((item) => {
    setPickerItem(item);
    setBookedRanges([]);
    get(`/items/${item.id}/booked-dates`)
      .then((data) => Array.isArray(data?.bookedRanges) && setBookedRanges(data.bookedRanges))
      .catch(() => {});
  }, []);

  // Deep link: /items?item=<id> opens the date picker for that item.
  const linkedItemId = searchParams.get("item");
  useEffect(() => {
    if (!linkedItemId || !items.length) return;
    const linked = items.find((item) => item.id === linkedItemId);
    if (linked) openPicker(linked);
  }, [linkedItemId, items, openPicker]);

  const handleConfirmDates = ({ pickupDate, returnDate, quantity, item }) => {
    addToCart(item, pickupDate, returnDate, quantity);
    showToast(`Added ${quantity} × ${item.title} to your cart`);
    setPickerItem(null);
  };

  const handleQuantityChange = useCallback((line, delta) => updateQuantity(line.id, delta), [updateQuantity]);

  const renderGrid = (list) => (
    <div className={styles.grid}>
      {list.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          categoryLabel={categoryLabels[item.categoryId]}
          cartLine={cartByItemId.get(item.id)}
          onRent={openPicker}
          onQuantityChange={handleQuantityChange}
        />
      ))}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        eyebrow="The collection"
        title="Rental catalogue"
        lead="Choose your pieces, pick your dates and we will have everything ready for pickup or delivery in Saskatoon."
        crumbs={[{ label: "Home", to: "/" }, { label: "Rentals" }]}
      />

      {/* Sticky filter bar */}
      <div className={styles.toolbar}>
        <Container className={styles.toolbarInner}>
          <label className={styles.search}>
            <SearchIcon width={18} height={18} />
            <span className="sr-only">Search rentals</span>
            <input
              type="search"
              placeholder="Search rentals…"
              value={query}
              onChange={(e) => setFilters({ q: e.target.value })}
            />
            {query && (
              <button type="button" onClick={() => setFilters({ q: "" })} aria-label="Clear search">
                <CloseIcon width={16} height={16} />
              </button>
            )}
          </label>

          <div className={styles.pills} role="group" aria-label="Filter by occasion">
            <button
              type="button"
              aria-pressed={activeCategory === ALL}
              className={`${styles.pill} ${activeCategory === ALL ? styles.pillActive : ""}`}
              onClick={() => setFilters({ category: ALL, subcategory: ALL })}
            >
              All occasions
            </button>
            {categories.map((cat) => {
              const icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={activeCategory === cat.id}
                  className={`${styles.pill} ${activeCategory === cat.id ? styles.pillActive : ""}`}
                  onClick={() => setFilters({ category: cat.id, subcategory: ALL })}
                >
                  {icon && <img src={icon} alt="" width="18" height="18" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className={styles.content}>
        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label="Loading rentals">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="We could not load the catalogue"
            actions={<Button onClick={() => window.location.reload()}>Try again</Button>}
          >
            Please check your connection and try again in a moment.
          </EmptyState>
        ) : term ? (
          <section aria-label="Search results">
            <header className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {searchResults.length} {searchResults.length === 1 ? "result" : "results"} for “{query.trim()}”
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFilters({ q: "" })}>
                Clear search
              </Button>
            </header>
            {searchResults.length ? (
              renderGrid(searchResults)
            ) : (
              <EmptyState title="No rentals match your search">
                Try a broader term such as “arch”, “balloon” or “lights”, or browse by occasion above.
              </EmptyState>
            )}
          </section>
        ) : visibleCategories.length === 0 ? (
          <EmptyState title="Nothing here yet" actions={<Button onClick={() => setFilters({ category: ALL })}>View all rentals</Button>}>
            Our team is adding new pieces to this collection. Please check back soon.
          </EmptyState>
        ) : (
          visibleCategories.map((category) => {
            const categoryItems = itemsByCategory.get(category.id) || [];
            const subcategories = buildSubcategories(category, categoryItems);
            const focused = activeCategory === category.id;
            const subFilter = focused ? activeSubcategory : ALL;
            const shown = subFilter === ALL ? categoryItems : categoryItems.filter((item) => item.subCategoryId === subFilter);
            const icon = getCategoryIcon(category);

            return (
              <section key={category.id} id={`category-${category.id}`} className={styles.category} aria-label={category.label}>
                <header className={styles.sectionHeader}>
                  <div className={styles.sectionHeading}>
                    {icon && <img src={icon} alt="" className={styles.sectionIcon} width="40" height="40" />}
                    <div>
                      <h2 className={styles.sectionTitle}>{category.label}</h2>
                      {category.description && <p className={styles.sectionLead}>{category.description}</p>}
                    </div>
                  </div>
                  {!focused && (
                    <Button variant="ghost" size="sm" onClick={() => setFilters({ category: category.id, subcategory: ALL })}>
                      View {categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}
                    </Button>
                  )}
                </header>

                {focused && subcategories.length > 1 && (
                  <div className={styles.chips} aria-label={`${category.label} types`}>
                    <button
                      type="button"
                      className={`${styles.chip} ${subFilter === ALL ? styles.chipActive : ""}`}
                      onClick={() => setFilters({ subcategory: ALL })}
                    >
                      All <span>{categoryItems.length}</span>
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className={`${styles.chip} ${subFilter === sub.id ? styles.chipActive : ""}`}
                        onClick={() => setFilters({ subcategory: sub.id })}
                      >
                        {sub.label}
                        <span>{categoryItems.filter((item) => item.subCategoryId === sub.id).length}</span>
                      </button>
                    ))}
                  </div>
                )}

                {shown.length ? (
                  renderGrid(focused ? shown : shown.slice(0, 4))
                ) : (
                  <EmptyState title="No pieces in this collection yet">New rentals are added regularly — please check back soon.</EmptyState>
                )}
              </section>
            );
          })
        )}
      </Container>

      {pickerItem && (
        <DateRangePickerModal
          item={pickerItem}
          bookedRanges={bookedRanges}
          onClose={() => setPickerItem(null)}
          onConfirm={handleConfirmDates}
        />
      )}
      <Toast message={toast} />
    </PageLayout>
  );
}
