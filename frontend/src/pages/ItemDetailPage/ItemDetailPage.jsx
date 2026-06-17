import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { get } from "../../api/client";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import styles from "./ItemDetailPage.module.css";

// SVG icons matching ItemsPage
const SignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" />
    <rect x="8" y="14" width="48" height="36" rx="4" stroke="#EC4899" />
    <path d="M16 28h32" stroke="#EAB308" />
    <path d="M24 38h16" stroke="#EAB308" />
    <path d="M12 14v-4h40v4" stroke="#64748B" />
  </svg>
);
const ArchIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 58V30C12 18 20 10 32 10s20 8 20 20v28Z" fill="rgba(59, 130, 246, 0.12)" stroke="#3B82F6" />
    <path d="M6 58h12M46 58h12" stroke="#64748B" />
    <circle cx="32" cy="10" r="3.5" fill="#EF4444" />
    <circle cx="18" cy="24" r="3.5" fill="#EC4899" />
    <circle cx="46" cy="24" r="3.5" fill="#EC4899" />
  </svg>
);
const WallIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="44" height="40" rx="2" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" />
    <path d="M18 10v40M26 10v40M34 10v40M42 10v40" stroke="#34D399" strokeDasharray="3 3" />
    <path d="M10 50h44" stroke="#047857" />
  </svg>
);
const FurnitureIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="28" height="22" fill="rgba(244,63,94,0.15)" stroke="#F43F5E" />
    <path d="M12 34h40v6H12z" stroke="#D97706" fill="rgba(251,191,36,0.2)" />
    <path d="M16 40v14M48 40v14" stroke="#D97706" />
  </svg>
);
const CakeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="26" width="32" height="18" fill="rgba(245,208,254,0.3)" stroke="#D946EF" />
    <path d="M12 44h40v10H12z" stroke="#6366F1" fill="rgba(99,102,241,0.15)" />
    <path d="M22 12h20v14H22z" stroke="#EC4899" fill="rgba(236,72,153,0.2)" />
  </svg>
);
const SpecialIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="22" r="12" fill="rgba(236,72,153,0.15)" stroke="#EC4899" />
    <circle cx="18" cy="18" r="2.5" fill="#3B82F6" />
    <circle cx="16" cy="38" r="2" fill="#10B981" />
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

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states using modal
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingFlowType, setBookingFlowType] = useState("cart"); // "cart" or "instant"
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [bookingQty, setBookingQty] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    get(`/items/${id}`)
      .then((data) => {
        if (!data) throw new Error("Item not found");
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading item details:", err);
        setError("Could not load item details. Please check the item ID.");
        setLoading(false);
      });
  }, [id]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleConfirmDates = ({ pickupDate, returnDate, quantity, item }) => {
    setSelectedPickup(pickupDate);
    setSelectedReturn(returnDate);
    setBookingQty(quantity);
    setShowCalendar(false);

    addToCart(item, pickupDate, returnDate, quantity);

    if (bookingFlowType === "instant") {
      navigate("/cart");
    } else {
      triggerToast(`Added ${quantity}x "${item.title}" to your Cart!`);
    }
  };

  const handleAddToCart = () => {
    if (!selectedPickup) {
      setBookingFlowType("cart");
      setShowCalendar(true);
      return;
    }
    addToCart(item, selectedPickup, selectedReturn || selectedPickup, bookingQty);
    triggerToast(`Added ${bookingQty}x "${item.title}" to your Cart!`);
  };

  const handleBookNow = () => {
    if (!selectedPickup) {
      setBookingFlowType("instant");
      setShowCalendar(true);
      return;
    }
    addToCart(item, selectedPickup, selectedReturn || selectedPickup, bookingQty);
    navigate("/cart");
  };

  const formatRange = () => {
    if (!selectedPickup) return "";
    const formatSingle = (d) => {
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };
    return `${formatSingle(selectedPickup)} ~ ${formatSingle(selectedReturn || selectedPickup)}`;
  };
  const selectedDatesStr = formatRange();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Navbar />
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Loading premium prop details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.errorContainer}>
        <Navbar />
        <div className={styles.errorBox}>
          <h2>⚠️ Prop Not Found</h2>
          <p>{error || "The requested rental item does not exist or has been removed."}</p>
          <button className={styles.backBtn} onClick={() => navigate("/items")}>
            ← Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate specifications depending on item details
  const specDimensions = item.categoryId === "birthday" ? "6ft W x 7.5ft H" : item.categoryId === "marriage" ? "8ft W x 9ft H" : "Standard Fit";
  const specMaterial = item.title.toLowerCase().includes("chair") || item.title.toLowerCase().includes("sofa") ? "Premium Wood & Velvet" : item.title.toLowerCase().includes("flower") || item.title.toLowerCase().includes("floral") ? "Silk Blossoms" : "Acrylic / Coated Steel";
  const specSetup = item.categoryId === "marriage" ? "30 - 45 mins" : "10 - 15 mins";

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.detailContainer}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link> &gt; <Link to="/items">Catalog</Link> &gt; <Link to={`/items?category=${item.categoryId}`}>{item.categoryId}</Link> &gt; <span>{item.title}</span>
        </div>

        <div className={styles.productLayout}>
          {/* Left Side: Image display and thumbnails */}
          <div className={styles.imageCol}>
            <div className={styles.mainImageWrapper}>
              {item.image && item.image.startsWith("/uploads") ? (
                <img src={item.image} alt={item.title} className={styles.mainImage} />
              ) : (
                <div className={styles.svgFallback}>
                  {getSvgIcon(item.title)}
                </div>
              )}
              <span className={styles.imageBadge}>✦ FinalTouch Signature</span>
            </div>

            {/* Sub-images thumbnail gallery */}
            <div className={styles.thumbnailRow}>
              <div className={`${styles.thumb} ${styles.thumbActive}`}>
                {item.image && item.image.startsWith("/uploads") ? (
                  <img src={item.image} alt="Thumbnail 1" />
                ) : (
                  <span>✨</span>
                )}
              </div>
              <div className={styles.thumb}>
                <span>💡</span>
              </div>
              <div className={styles.thumb}>
                <span>🌸</span>
              </div>
              <div className={styles.thumb}>
                <span>👑</span>
              </div>
            </div>
          </div>

          {/* Right Side: Description and Custom Specification Table */}
          <div className={styles.detailsCol}>
            <div className={styles.headerInfo}>
              <span className={styles.categoryBadge}>{item.categoryId} collection</span>
              <h1 className={styles.title}>{item.title}</h1>
              <div className={styles.ratingRow}>
                <span className={styles.stars}>★★★★★</span>
                <span className={styles.ratingText}>5.0 (Customer Favorite)</span>
                <span className={styles.divider}>•</span>
                <span className={item.isAvailable ? styles.inStock : styles.outOfStock}>
                  {item.isAvailable ? "● Available" : "○ Fully Booked"}
                </span>
              </div>
            </div>

            <div className={styles.priceContainer}>
              <div className={styles.priceRow}>
                <span className={styles.price}>$25.00</span>
                <span className={styles.unit}>/ day</span>
                <span className={styles.discountBadge}>Special Event Rate</span>
              </div>
            </div>

            <p className={styles.description}>
              {item.description || "Beautiful custom-designed prop for your celebration. Part of our signature rental collection, crafted to add the perfect aesthetic touch to your stage setup or photoshoot."}
            </p>

            {/* Specifications Grid */}
            <div className={styles.specsTable}>
              <h3 className={styles.specsHeading}>Specifications</h3>
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Occasion Class</span>
                  <strong className={styles.specValue}>{item.categoryId}</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Dimensions</span>
                  <strong className={styles.specValue}>{specDimensions}</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Material</span>
                  <strong className={styles.specValue}>{specMaterial}</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Setup Time</span>
                  <strong className={styles.specValue}>{specSetup}</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Inventory Limit</span>
                  <strong className={styles.specValue}>{item.unit_count || 1} units</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Logistics</span>
                  <strong className={styles.specValue}>Pickup/Delivery Available</strong>
                </div>
              </div>
            </div>

            {/* Date Selection Box */}
            <div className={styles.bookingBox}>
              <h3 className={styles.bookingHeading}>Booking & Rental Options</h3>
              <p className={styles.bookingSubText}>
                {selectedDatesStr ? (
                  <>
                    Selected: <strong>{selectedDatesStr}</strong> (Qty: {bookingQty})
                  </>
                ) : (
                  "Select dates and quantity to check availability and book."
                )}
              </p>

              <button
                type="button"
                className={styles.selectDatesBtn}
                onClick={() => {
                  setBookingFlowType("cart");
                  setShowCalendar(true);
                }}
              >
                📅 {selectedDatesStr ? "Change Dates & Qty" : "Select Event Dates & Qty"}
              </button>

              {/* Booking Actions */}
              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.cartBtn}
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart
                </button>
                <button
                  type="button"
                  className={styles.bookBtn}
                  onClick={handleBookNow}
                >
                  ✦ Book Instantly
                </button>
              </div>
            </div>

            {/* Back Button */}
            <button className={styles.backLink} onClick={() => navigate("/items")}>
              ← Back to Catalog Gallery
            </button>
          </div>
        </div>
      </main>

      {/* Calendar modal */}
      {showCalendar && (
        <DateRangePickerModal
          item={item}
          onClose={() => setShowCalendar(false)}
          onConfirm={handleConfirmDates}
        />
      )}

      {/* Toast popup */}
      {showToast && (
        <div className={styles.toast}>
          <span>{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
