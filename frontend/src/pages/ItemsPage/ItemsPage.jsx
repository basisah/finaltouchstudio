import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { INVENTORY_CATEGORIES } from "../../constants/inventory";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./ItemsPage.module.css";

// Import colorful flaticon icons
import birthdayIcon from "../../assets/Icons/birthday-cake.png";
import marriageIcon from "../../assets/Icons/wedding-couple.png";
import bridalIcon from "../../assets/Icons/bridal-shower.png";
import babyIcon from "../../assets/Icons/baby.png";
import managerIcon from "../../assets/Icons/manager.png";

const categoryIcons = {
  birthday: birthdayIcon,
  marriage: marriageIcon,
  holud: bridalIcon,
  baby: babyIcon,
  global: managerIcon,
};

// ── SVG Icon Components ──
const SignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" />
    <rect x="8" y="14" width="48" height="36" rx="4" stroke="#EC4899" />
    <path d="M16 28h32" stroke="#EAB308" />
    <path d="M24 38h16" stroke="#EAB308" />
    <path d="M12 14v-4h40v4" stroke="#64748B" />
    <circle cx="12" cy="21" r="1.5" fill="#EAB308" />
    <circle cx="52" cy="21" r="1.5" fill="#EAB308" />
    <circle cx="12" cy="43" r="1.5" fill="#EAB308" />
    <circle cx="52" cy="43" r="1.5" fill="#EAB308" />
  </svg>
);

const ArchIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 58V30C12 18 20 10 32 10s20 8 20 20v28Z" fill="rgba(59, 130, 246, 0.12)" stroke="#3B82F6" />
    <path d="M6 58h12M46 58h12" stroke="#64748B" />
    <path d="M18 30c4-4 8-4 12 0s8 4 12 0" stroke="#10B981" />
    <circle cx="32" cy="10" r="3.5" fill="#EF4444" stroke="#EF4444" />
    <circle cx="18" cy="24" r="3.5" fill="#EC4899" stroke="#EC4899" />
    <circle cx="46" cy="24" r="3.5" fill="#EC4899" stroke="#EC4899" />
  </svg>
);

const WallIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="44" height="40" rx="2" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" />
    <path d="M18 10v40M26 10v40M34 10v40M42 10v40M50 10v40" stroke="#34D399" strokeDasharray="3 3" />
    <path d="M10 50h44" stroke="#047857" />
  </svg>
);

const FurnitureIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="28" height="22" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" />
    <path d="M12 34h40v6H12z" stroke="#D97706" fill="rgba(251, 191, 36, 0.2)" />
    <path d="M16 40v14M48 40v14" stroke="#D97706" />
    <path d="M22 12V6M42 12V6" stroke="#F43F5E" />
    <path d="M26 34v12M38 34v12" stroke="#D97706" strokeWidth="1.5" />
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="26" width="32" height="18" fill="rgba(245, 208, 254, 0.3)" stroke="#D946EF" />
    <path d="M12 44h40v10H12z" stroke="#6366F1" fill="rgba(99, 102, 241, 0.15)" />
    <path d="M22 12h20v14H22z" stroke="#EC4899" fill="rgba(236, 72, 153, 0.2)" />
    <path d="M32 4v8" stroke="#F59E0B" />
    <path d="M32 4c1-2-1-2 0 0" stroke="#EF4444" />
  </svg>
);

const FloralIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="24" r="14" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" />
    <circle cx="32" cy="24" r="5" fill="#FBBF24" stroke="#FBBF24" />
    <circle cx="20" cy="24" r="4.5" fill="#EF4444" stroke="#EF4444" />
    <circle cx="44" cy="24" r="4.5" fill="#EF4444" stroke="#EF4444" />
    <circle cx="32" cy="12" r="4.5" fill="#EC4899" stroke="#EC4899" />
    <circle cx="32" cy="36" r="4.5" fill="#EC4899" stroke="#EC4899" />
    <path d="M32 42v16" stroke="#10B981" />
    <path d="M22 58h20" stroke="#10B981" />
  </svg>
);

const LightingIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="20" r="10" fill="rgba(253, 224, 71, 0.3)" stroke="#EAB308" />
    <path d="M32 30v18" stroke="#D97706" />
    <path d="M20 48h24" stroke="#D97706" />
    <path d="M26 20a6 6 0 0 1 6-6" stroke="#EAB308" strokeWidth="1.5" />
    <path d="M22 40l10-10 10 10" stroke="#D97706" />
    <circle cx="32" cy="20" r="2" fill="#EF4444" stroke="#EF4444" />
  </svg>
);

const DalaIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="32" cy="36" rx="24" ry="16" fill="rgba(251, 191, 36, 0.2)" stroke="#D97706" />
    <ellipse cx="32" cy="36" rx="18" ry="11" stroke="#F59E0B" strokeDasharray="3 3" />
    <path d="M14 24l8-16h20l8 16" stroke="#16A34A" fill="rgba(22, 163, 74, 0.1)" />
    <path d="M32 8v16" stroke="#16A34A" strokeDasharray="2 2" />
  </svg>
);

const AisleIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10L6 54h52L44 10Z" fill="rgba(220, 38, 38, 0.15)" stroke="#DC2626" />
    <path d="M20 10L6 54M44 10l14 54" stroke="#B91C1C" />
    <path d="M24 10v44M40 10v44" stroke="#EF4444" strokeDasharray="2 2" />
    <rect x="2" y="44" width="8" height="10" rx="1" fill="#EAB308" stroke="#D97706" />
    <rect x="54" y="44" width="8" height="10" rx="1" fill="#EAB308" stroke="#D97706" />
  </svg>
);

const AudioIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="8" width="32" height="48" rx="4" fill="rgba(79, 70, 229, 0.12)" stroke="#4F46E5" />
    <circle cx="32" cy="20" r="6" stroke="#4F46E5" />
    <circle cx="32" cy="42" r="10" stroke="#06B6D4" fill="rgba(6, 182, 212, 0.1)" />
    <circle cx="32" cy="42" r="4" fill="#06B6D4" stroke="#06B6D4" />
  </svg>
);

const TablewareIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="18" fill="rgba(13, 148, 136, 0.15)" stroke="#0D9488" />
    <circle cx="32" cy="32" r="12" stroke="#0D9488" strokeDasharray="2 2" />
    <path d="M8 20v16c0 4 3 8 3 8v10" stroke="#475569" />
    <path d="M56 16v38M50 16v12h6" stroke="#475569" />
  </svg>
);

const SpecialIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="22" r="12" fill="rgba(236, 72, 153, 0.15)" stroke="#EC4899" />
    <path d="M32 34c0 6-6 10-6 10" stroke="#475569" />
    <circle cx="18" cy="18" r="2.5" fill="#3B82F6" stroke="#3B82F6" />
    <path d="M44 14l4 4" stroke="#EAB308" />
    <path d="M48 28l-4 4" stroke="#EF4444" />
    <circle cx="16" cy="38" r="2" fill="#10B981" stroke="#10B981" />
  </svg>
);

const getSvgIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("neon") || t.includes("sign") || t.includes("board") || t.includes("number") || t.includes("letter") || t.includes("block")) {
    return <SignIcon />;
  }
  if (t.includes("arch") || t.includes("frame") || t.includes("ring")) {
    return <ArchIcon />;
  }
  if (t.includes("wall") || t.includes("curtain") || t.includes("drap") || t.includes("backdrop") || t.includes("mandap")) {
    return <WallIcon />;
  }
  if (t.includes("chair") || t.includes("sofa") || t.includes("throne") || t.includes("bench") || t.includes("mattress") || t.includes("plinth") || t.includes("pedestal") || t.includes("table") || t.includes("stool")) {
    return <FurnitureIcon />;
  }
  if (t.includes("cake") || t.includes("cupcake") || t.includes("tower") || t.includes("platter") || t.includes("jar") || t.includes("sweet") || t.includes("display")) {
    return <CakeIcon />;
  }
  if (t.includes("flower") || t.includes("floral") || t.includes("blossom") || t.includes("tree") || t.includes("marigold") || t.includes("genda")) {
    return <FloralIcon />;
  }
  if (t.includes("light") || t.includes("candle") || t.includes("candelabra") || t.includes("led") || t.includes("lamp") || t.includes("lantern")) {
    return <LightingIcon />;
  }
  if (t.includes("dala") || t.includes("tray") || t.includes("kula") || t.includes("umbrella")) {
    return <DalaIcon />;
  }
  if (t.includes("carpet") || t.includes("runner") || t.includes("pillar") || t.includes("aisle") || t.includes("walkway")) {
    return <AisleIcon />;
  }
  if (t.includes("speaker") || t.includes("audio") || t.includes("sound") || t.includes("av") || t.includes("wireless")) {
    return <AudioIcon />;
  }
  if (t.includes("plate") || t.includes("napkin") || t.includes("cutlery") || t.includes("tablecloth") || t.includes("dish") || t.includes("warmer") || t.includes("dispenser") || t.includes("glass")) {
    return <TablewareIcon />;
  }
  return <SpecialIcon />;
};

const getBookedDatesForItem = (itemId) => {
  const code = itemId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const date1 = (code % 28) + 1;
  const date2 = ((code + 7) % 28) + 1;
  const date3 = ((code + 14) % 28) + 1;
  const date4 = ((code + 21) % 28) + 1;
  return [date1, date2, date3, date4];
};

export default function ItemsPage() {
  const { cart, addToCart, removeFromCart } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();
  const [activeSubcats, setActiveSubcats] = useState({});

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get("category");
    const itemId = params.get("item");
    const subcatId = params.get("subcategory");

    if (catId) {
      // 1. Immediately set the active subcategory so the DOM is rendered in its expanded state
      if (subcatId) {
        setActiveSubcats(prev => ({
          ...prev,
          [catId]: subcatId
        }));
      } else if (itemId) {
        for (const category of INVENTORY_CATEGORIES) {
          if (category.id === catId) {
            const item = category.items.find((i) => i.id === itemId);
            if (item) {
              setActiveSubcats(prev => ({
                ...prev,
                [catId]: item.subCategoryId
              }));
              setSelectedItem(item);
            }
            break;
          }
        }
      }

      // 2. Perform smooth scroll in a timeout to allow layout shifts to settle
      const timer = setTimeout(() => {
        const element = document.getElementById(`category-section-${catId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  const fallingElements = useMemo(() => {
    const emojis = ["🎈", "🪑", "🌸", "✨", "🎉", "🎀", "🎈", "🌸", "🪑", "🎈", "🎈", "🌸", "🫧"];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * 15}s`,
      size: `${24 + Math.random() * 24}px`,
      animationName: Math.random() > 0.5 ? styles.sinkInWaterRight : styles.sinkInWaterLeft
    }));
  }, []);

  const handleOpenItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseItem = () => {
    setSelectedItem(null);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Check if item is already in cart
  const getCartItem = (itemId) => {
    return cart.find((c) => c.item.id === itemId);
  };

  const handleQuickRemove = (itemId, e) => {
    e.stopPropagation();
    const cartItem = getCartItem(itemId);
    if (cartItem) {
      removeFromCart(cartItem.id);
      triggerToast(`Removed "${cartItem.item.title}" from your Cart!`);
    }
  };

  const handleConfirmDates = ({ pickupDate, returnDate, quantity, item }) => {
    addToCart(item, pickupDate, returnDate, quantity);
    triggerToast(`Added ${quantity}x "${item.title}" to your Cart!`);
    handleCloseItem();
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Decorative Floating Elements */}
      <div className={styles.floatingOrb1} />
      <div className={styles.floatingOrb2} />
      <div className={styles.floatingOrb3} />
      <div className={styles.floatingSparkle1}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20M7 7l10 10M7 17L17 7" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.floatingSparkle2}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3v18M3 12h18" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.floatingRing1} />
      <div className={styles.floatingRing2} />
      <div className={styles.floatingFlower1}>🌸</div>
      <div className={styles.floatingFlower2}>✨</div>
      <div className={styles.confetti1} />
      <div className={styles.confetti2} />

      {/* Falling/Sinking Water-like Elements */}
      <div className={styles.fallingContainer}>
        {fallingElements.map((el) => (
          <div
            key={el.id}
            className={styles.fallingElement}
            style={{
              left: el.left,
              animation: `${el.animationName} ${el.duration} linear ${el.delay} infinite`,
              fontSize: el.size,
            }}
          >
            {el.emoji}
          </div>
        ))}
      </div>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Bespoke Rental Catalog</h1>
          <p className={styles.heroSub}>Choose your celebration items, select dates, and book instantly.</p>
        </div>
      </header>

      <main className={styles.container}>
        {INVENTORY_CATEGORIES.map((category) => {
          const activeSubcatId = activeSubcats[category.id];
          const activeSubcatObj = category.subcategories?.find(s => s.id === activeSubcatId);

          return (
            <section
              key={category.id}
              id={`category-section-${category.id}`}
              className={styles.categoryBlock}
              style={{ "--category-color": category.color }}
            >
              {/* Glowing background orb for this category */}
              <div className={styles.categoryBackdropOrb} />

              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleRow}>
                  {categoryIcons[category.id] && (
                    <img 
                      src={categoryIcons[category.id]} 
                      alt="" 
                      className={styles.categoryHeaderIcon} 
                    />
                  )}
                  <h2 className={styles.categoryTitle}>{category.label}</h2>
                </div>
                <div className={styles.categoryTitleDivider} />
              </div>

              {!activeSubcatId ? (
                /* 1. Show the 8 Subcategory circles */
                <div className={styles.gridContainer}>
                  {category.subcategories?.map((subcat) => (
                    <div
                      key={subcat.id}
                      className={styles.gridItem}
                      onClick={() => setActiveSubcats(prev => ({ ...prev, [category.id]: subcat.id }))}
                    >
                      <div className={styles.circleCard} style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                        <span className={styles.subcatEmoji}>{subcat.emoji}</span>
                      </div>
                      <div className={styles.cardLabelWrapper}>
                        <span className={styles.cardLabel}>{subcat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 2. Expanded view: show active subcategory items, and other 7 at bottom */
                <div className={styles.expandedSection}>
                  <div className={styles.expandedSubcatHeader}>
                    <button 
                      type="button" 
                      className={styles.backToSubcatsBtn}
                      onClick={() => setActiveSubcats(prev => {
                        const next = { ...prev };
                        delete next[category.id];
                        return next;
                      })}
                    >
                      ← All Categories
                    </button>
                    <h3 className={styles.activeSubcatTitle}>
                      {activeSubcatObj?.emoji} {activeSubcatObj?.label}
                    </h3>
                  </div>

                  {/* Items Grid */}
                  <div className={styles.gridContainer}>
                    {category.items
                      .filter((item) => item.subCategoryId === activeSubcatId)
                      .map((item) => {
                        const cartItem = getCartItem(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`${styles.gridItem} ${cartItem ? styles.itemInCart : ""}`}
                            onClick={() => handleOpenItem(item)}
                          >
                            <div className={styles.circleCard}>
                              <div className={styles.iconWrapper}>
                                {getSvgIcon(item.title)}
                              </div>
                            </div>
                            
                            <div className={styles.cardLabelWrapper}>
                              <span className={styles.cardLabel}>{item.title}</span>
                              {cartItem ? (
                                <button
                                  type="button"
                                  className={styles.quickRemoveBtn}
                                  onClick={(e) => handleQuickRemove(item.id, e)}
                                  title="Remove from cart"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.quickAddBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenItem(item);
                                  }}
                                  title="Add to cart"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Bottom: Inactive other 7 subcategories */}
                  <div className={styles.otherSubcatsWrapper}>
                    <h4 className={styles.otherSubcatsHeading}>Switch Category</h4>
                    <div className={styles.gridContainer}>
                      {category.subcategories
                        ?.filter((subcat) => subcat.id !== activeSubcatId)
                        .map((subcat) => (
                          <div
                            key={subcat.id}
                            className={styles.gridItem}
                            onClick={() => {
                              setActiveSubcats((prev) => ({ ...prev, [category.id]: subcat.id }));
                              document.getElementById(`category-section-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                          >
                            <div className={styles.circleCard} style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                              <span className={styles.subcatEmoji}>{subcat.emoji}</span>
                            </div>
                            <div className={styles.cardLabelWrapper}>
                              <span className={styles.cardLabel}>{subcat.label}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* Booking Popup Modal */}
      {selectedItem && (
        <DateRangePickerModal 
          item={selectedItem} 
          onClose={handleCloseItem} 
          onConfirm={handleConfirmDates} 
        />
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className={styles.toast}>
          <span>{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
