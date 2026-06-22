import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { get } from "../../api/client";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import styles from "./ItemDetailPage.module.css";
import homeDeliveryIcon from "../../assets/Icons/Delivery/HomeDelivery.png";
import pickupIcon from "../../assets/Icons/Delivery/Pickup.png";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingFlowType, setBookingFlowType] = useState("cart");
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
        setSelectedPhoto(null);

        // Fetch related items from the same category
        get(`/items?categoryId=${data.categoryId}`)
          .then((itemsList) => {
            if (Array.isArray(itemsList)) {
              setRelatedItems(itemsList.filter(i => i.id !== id).slice(0, 4));
            }
          })
          .catch((err) => console.warn("Could not load related items:", err));
      })
      .catch((err) => {
        console.error("Error loading item details:", err);
        setError("Could not load item details.");
        setLoading(false);
      });

    get(`/items/${id}/booked-dates`)
      .then((data) => {
        if (data && Array.isArray(data.bookedRanges)) {
          setBookedRanges(data.bookedRanges);
        }
      })
      .catch((err) => console.warn("Could not fetch booked dates:", err));
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
      triggerToast(`Added ${quantity}× "${item.title}" to your Cart!`);
    }
  };

  const handleAddToCart = () => {
    if (!selectedPickup) {
      setBookingFlowType("cart");
      setShowCalendar(true);
      return;
    }
    addToCart(item, selectedPickup, selectedReturn || selectedPickup, bookingQty);
    triggerToast(`Added ${bookingQty}× "${item.title}" to your Cart!`);
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

  const formatDateStr = (d) => {
    if (!d) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const selectedDatesStr = selectedPickup
    ? `${formatDateStr(selectedPickup)} → ${formatDateStr(selectedReturn || selectedPickup)}`
    : "";

  // ── Loading / Error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Navbar />
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p>Loading details…</p>
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
          <h2>⚠️ Item Not Found</h2>
          <p>{error || "This rental item does not exist or has been removed."}</p>
          <button className={styles.backBtn} onClick={() => navigate("/items")}>
            ← Return to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Parse gallery images ──────────────────────────────────────────────
  const gallery = (() => {
    if (!item.gallery_images) return [];
    try {
      return typeof item.gallery_images === "string"
        ? JSON.parse(item.gallery_images)
        : item.gallery_images;
    } catch { return []; }
  })();
  const allImages = [item.image, ...gallery].filter(Boolean);
  const activeImg = selectedPhoto || item.image;

  // ── Parse tutorial steps from backend ─────────────────────────────────
  const tutorialSteps = (() => {
    if (!item.tutorial_steps) return [];
    try {
      return typeof item.tutorial_steps === "string"
        ? JSON.parse(item.tutorial_steps)
        : item.tutorial_steps;
    } catch { return []; }
  })();

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.detailContainer}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className={styles.sep}>/</span>
          <Link to="/items">Catalog</Link>
          <span className={styles.sep}>/</span>
          <Link to={`/items?category=${item.categoryId}`} className={styles.breadCat}>
            {item.categoryId}
          </Link>
          <span className={styles.sep}>/</span>
          <span>{item.title}</span>
        </nav>

        <div className={styles.productLayout}>

          {/* ── LEFT COLUMN: Gallery & Description ─────────────────── */}
          <div className={styles.imageCol}>
            <div className={styles.mainImageWrapper}>
              {activeImg && activeImg.startsWith("/uploads") ? (
                <img src={activeImg} alt={item.title} className={styles.mainImage} />
              ) : (
                <div className={styles.svgFallback}>
                  <span>🖼</span>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className={styles.thumbnailRow}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumb} ${(selectedPhoto === img || (!selectedPhoto && idx === 0)) ? styles.thumbActive : ""}`}
                    onClick={() => setSelectedPhoto(img)}
                    aria-label={`Gallery image ${idx + 1}`}
                  >
                    {img.startsWith("/uploads") ? (
                      <img src={img} alt="" />
                    ) : (
                      <span>🖼</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Description goes under images on the left side */}
            {item.description && (
              <div className={styles.leftDescriptionBlock}>
                <h3 className={styles.descriptionHeading}>About This Product</h3>
                <p className={styles.descriptionText}>{item.description}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Metadata, Info & Booking ──────────────── */}
          <div className={styles.detailsCol}>

            {/* Title + Availability & Count + Smaller Text-based Specs */}
            <div className={styles.headerInfo}>
              <span className={styles.categoryBadge}>{item.categoryId} Collection</span>
              <h1 className={styles.title}>{item.title}</h1>
              
              {/* Availability & Count right under Title */}
              <div className={styles.availabilityRow}>
                <span className={item.isAvailable ? styles.inStockText : styles.outOfStockText}>
                  {item.isAvailable ? "● Available" : "○ Fully Booked"}
                </span>
                <span className={styles.dividerDot}>•</span>
                <span className={styles.stockCount}>
                  {item.unit_count || 1} Unit{(item.unit_count || 1) !== 1 ? "s" : ""} Available
                </span>
              </div>

              {/* Smaller text-based specifications */}
              <div className={styles.metaRow}>
                <span>Category: <strong className={styles.textHighlight}>{item.categoryId}</strong></span>
                {item.subCategoryId && (
                  <>
                    <span className={styles.dividerDot}>•</span>
                    <span>Subcategory: <strong className={styles.textHighlight}>{item.subCategoryId}</strong></span>
                  </>
                )}
                <span className={styles.dividerDot}>•</span>
                <span>Serial: <strong className={styles.textHighlight}>{item.id}</strong></span>
                <span className={styles.dividerDot}>•</span>
                <span className={styles.servedBy}>Served by Final Touch Studios</span>
              </div>

              <div className={styles.popularityRow}>
                <span className={styles.popularityBadge}>
                  📈 Rented {item.rental_count > 0 ? item.rental_count : 3} times in the past month
                </span>
              </div>
            </div>

            {/* Price Container */}
            <div className={styles.priceContainer}>
              <div className={styles.priceRow}>
                <span className={styles.price}>${parseFloat(item.price || 0).toFixed(2)}</span>
                <span className={styles.unit}>/day</span>
                <span className={styles.discountBadge}>Special Event Rate</span>
              </div>
            </div>

            {/* Booking Card */}
            <div className={styles.bookingBox}>
              <h3 className={styles.bookingHeading}>Booking Options</h3>
              
              {/* Delivery and pickup options text inside booking card */}
              <div className={styles.bookingDeliveryPickupInfo}>
                <div className={styles.bookingOptionItem}>
                  <img src={homeDeliveryIcon} alt="Delivery" className={styles.deliveryIcon} />
                  <span>Delivery &amp; Drop-off Available</span>
                </div>
                <div className={styles.bookingOptionItem}>
                  <img src={pickupIcon} alt="Pickup" className={styles.deliveryIcon} />
                  <span>Self Pickup Available</span>
                </div>
              </div>
              
              {selectedDatesStr ? (
                <>
                  <div className={styles.selectedDatesBanner}>
                    <span className={styles.selectedDatesIcon}>📅</span>
                    <div className={styles.selectedDatesTextWrapper}>
                      <span className={styles.selectedDatesLabel}>Selected Dates:</span>
                      <strong className={styles.selectedDatesValue}>{selectedDatesStr}</strong>
                      <span className={styles.selectedDatesQty}>Quantity: {bookingQty}</span>
                    </div>
                  </div>

                  <button
                    className={styles.selectDatesBtn}
                    onClick={() => { setBookingFlowType("cart"); setShowCalendar(true); }}
                  >
                    📅 Change Dates &amp; Qty
                  </button>

                  <div className={styles.actionsRow}>
                    <button className={styles.cartBtn} onClick={handleAddToCart}>
                      🛒 Add to Cart
                    </button>
                    <button className={styles.bookBtn} onClick={handleBookNow}>
                      ✦ Book Instantly
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.bookingSubText}>Select event dates and quantity to check availability and book.</p>
                  
                  <button
                    className={styles.rentButton}
                    onClick={() => { setBookingFlowType("cart"); setShowCalendar(true); }}
                  >
                    Rent Item
                  </button>
                </>
              )}
            </div>

            {/* What's Included Section */}
            <div className={styles.whatsIncludedSection}>
              <h3 className={styles.sectionHeading}>What's Included</h3>
              <ul className={styles.includedList}>
                <li>✨ High-quality sanitized event decor hardware</li>
                <li>🛠️ Essential staging hooks or mounting weights</li>
                <li>📝 Access to digital setup/installation guides</li>
                <li>📞 24/7 client helpline for event staging support</li>
              </ul>
            </div>

            {/* Low Price Guarantee */}
            <div className={styles.guaranteeSection}>
              <div className={styles.guaranteeHeader}>
                <span className={styles.guaranteeIcon}>🛡️</span>
                <span className={styles.guaranteeTitle}>Low Price Guarantee</span>
              </div>
              <p className={styles.guaranteeText}>
                We guarantee the lowest rental prices in the area. Find a lower price elsewhere and we will beat it by 10%!
              </p>
            </div>

            {/* Return Policy & Privacy Policy Card */}
            <div className={styles.policyCard}>
              <h3 className={styles.sectionHeading}>Rental &amp; Cancellation Policy</h3>
              <p className={styles.policyText}>
                Cancel up to 7 days before your scheduled drop-off for a full refund. Damage waiver protection is active to handle minor wear-and-tear accidents. For privacy protection details, view our policy during checkout.
              </p>
            </div>

            {/* Setup instructions from backend */}
            {tutorialSteps.length > 0 && (
              <div className={styles.instructionsSection}>
                <h3 className={styles.instructionsHeading}>Setup Guide</h3>
                <ol className={styles.instructionsList}>
                  {tutorialSteps.map((step, i) => (
                    <li key={i} className={styles.instructionStep}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <button className={styles.backLink} onClick={() => navigate("/items")}>
              ← Back to Catalog Gallery
            </button>
          </div>
        </div>

        {/* ── RELATED ITEMS SECTION ── */}
        {relatedItems.length > 0 && (
          <section id="related-items-section" className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Items You Might Love</h2>
            <div className={styles.relatedGrid}>
              {relatedItems.map((relItem) => (
                <Link to={`/item/${relItem.id}`} key={relItem.id} className={styles.relatedCard}>
                  <div className={styles.relatedCardImageWrapper}>
                    {relItem.image && relItem.image.startsWith("/uploads") ? (
                      <img src={relItem.image} alt={relItem.title} className={styles.relatedCardImage} />
                    ) : (
                      <div className={styles.relatedPlaceholder}>🖼</div>
                    )}
                  </div>
                  <div className={styles.relatedCardBody}>
                    <h4 className={styles.relatedCardTitle}>{relItem.title}</h4>
                    <span className={styles.relatedCardPrice}>
                      ${parseFloat(relItem.price || 0).toFixed(2)}/day
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Calendar modal */}
      {showCalendar && (
        <DateRangePickerModal
          item={item}
          onClose={() => setShowCalendar(false)}
          onConfirm={handleConfirmDates}
          bookedRanges={bookedRanges}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div className={styles.toast}>{toastMsg}</div>
      )}

      <Footer />
    </div>
  );
}
