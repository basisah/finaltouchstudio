import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./ProfilePage.module.css";

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForms, setReviewForms] = useState({});

  const defaultForm = (bookingId, prevForms) => {
    return prevForms[bookingId] || {
      rating: 5,
      comment: "",
      role: "Client",
      submitting: false,
      submitted: false,
      error: ""
    };
  };

  const handleReviewChange = (bookingId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [bookingId]: {
        ...defaultForm(bookingId, prev),
        [field]: value
      }
    }));
  };

  const handleReviewSubmit = async (e, bookingId) => {
    e.preventDefault();
    const form = defaultForm(bookingId, reviewForms);
    if (!form.comment.trim()) {
      handleReviewChange(bookingId, "error", "Please write a comment.");
      return;
    }

    handleReviewChange(bookingId, "submitting", true);
    handleReviewChange(bookingId, "error", "");

    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: bookingId,
          rating: form.rating,
          comment: form.comment,
          role: form.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Update local state bookings list to set reviewed = 1 and save details
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, reviewed: 1, review_rating: form.rating, review_comment: form.comment } : b)
      );

      handleReviewChange(bookingId, "submitted", true);
    } catch (err) {
      handleReviewChange(bookingId, "error", err.message);
    } finally {
      handleReviewChange(bookingId, "submitting", false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    const userInfo = localStorage.getItem("user_info");

    if (!token || !userInfo) {
      navigate("/login");
      return;
    }

    fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("user_info");
          navigate("/login");
          return;
        }
        throw new Error("Failed to load profile");
      }

      const data = await res.json();
      setProfile(data.user);
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user));
      }
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_info");
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return `CAD $${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusClass = (status) => {
    switch ((status || "ordered").toLowerCase()) {
      case "on_hand":     return styles.statusConfirmed;
      case "returned":    return styles.statusConfirmed;
      case "confirmed":   return styles.statusConfirmed;
      case "cancelled":   return styles.statusCancelled;
      default:            return styles.statusPending;
    }
  };

  // ── Split bookings into Active Tracking and Past History ──────────────
  const activeBookings = bookings.filter((b) => {
    const status = (b.status || "ordered").toLowerCase();
    return status === "ordered" || status === "on_hand" || status === "pending" || status === "confirmed";
  });

  const pastBookings = bookings.filter((b) => {
    const status = (b.status || "ordered").toLowerCase();
    return status === "returned" || status === "cancelled";
  });

  // Calculate current progress stage for stepper: 1 (Ordered), 2 (On Hand), 3 (Returned)
  const getProgressStage = (booking) => {
    const status = (booking.status || "ordered").toLowerCase();
    if (status === "on_hand") return 2;
    if (status === "returned") return 3;
    return 1; // Default to Ordered for pending/confirmed/ordered
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Loading your profile…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.errorWrapper}>
          <p className={styles.errorMsg}>{error}</p>
          <Link to="/" className={styles.backBtn}>← Back to Home</Link>
        </div>
      </>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.container}>

        {/* ── Profile Header Card ── */}
        <div className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.avatarFallback}>
                {getInitials(profile?.name)}
              </div>
            )}
          </div>

          <div className={styles.profileMeta}>
            <h1 className={styles.profileName}>{profile?.name}</h1>
            <p className={styles.profileEmail}>{profile?.email}</p>
            <span className={styles.roleBadge}>
              {profile?.role === "admin" ? "⚙️ Admin" : "✨ Member"}
            </span>
            <p className={styles.memberSince}>
              Member since {formatDate(profile?.created_at)}
            </p>
          </div>

          <button onClick={handleSignOut} className={styles.signOutBtn} id="profile-sign-out">
            Sign Out
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{bookings.length}</span>
            <span className={styles.statLabel}>Total Bookings</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {bookings.filter((b) => (b.status || "pending").toLowerCase() === "confirmed").length}
            </span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {formatCurrency(bookings.reduce((sum, b) => sum + parseFloat(b.price || 0), 0))}
            </span>
            <span className={styles.statLabel}>Total Spent</span>
          </div>
        </div>

        {/* ── 1. ACTIVE BOOKINGS & LIVE TRACKING ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📦 Active Bookings &amp; Tracking</h2>

          {activeBookings.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🚚</span>
              <p className={styles.emptyTitle}>No active bookings right now</p>
              <p className={styles.emptyMsg}>
                Place an order to live-track your event drop-off and pickup progress.
              </p>
              <Link to="/items" className={styles.browseBtn}>Browse Decor Items</Link>
            </div>
          ) : (
            <div className={styles.trackingList}>
              {activeBookings.map((booking) => {
                const stage = getProgressStage(booking);
                const isDelivery = booking.fulfillment_type === "delivery";

                return (
                  <div key={booking.id} className={styles.trackingCard}>
                    <div className={styles.trackingCardHeader}>
                      <div>
                        <span className={styles.trackingLabel}>ACTIVE RESERVATION</span>
                        <h3 className={styles.trackingId}>Booking #{booking.id}</h3>
                      </div>
                      <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Stepper Timeline Progress Bar */}
                    <div className={styles.stepperContainer}>
                      <div className={styles.stepperTrack}>
                        <div 
                          className={styles.stepperProgress} 
                          style={{ width: `${((stage - 1) / 2) * 100}%` }}
                        />
                      </div>
                      
                      <div className={`${styles.stepNode} ${stage >= 1 ? styles.stepCompleted : ""}`}>
                        <div className={styles.stepDot}>✓</div>
                        <span className={styles.stepLabel}>Ordered</span>
                      </div>
                      
                      <div className={`${styles.stepNode} ${stage >= 2 ? styles.stepCompleted : (stage === 1 ? styles.stepActive : "")}`}>
                        <div className={styles.stepDot}>{stage >= 2 ? "✓" : "2"}</div>
                        <span className={styles.stepLabel}>{isDelivery ? "Delivered" : "Picked Up"}</span>
                      </div>
                      
                      <div className={`${styles.stepNode} ${stage >= 3 ? styles.stepCompleted : (stage === 2 ? styles.stepActive : "")}`}>
                        <div className={styles.stepDot}>{stage >= 3 ? "✓" : "3"}</div>
                        <span className={styles.stepLabel}>Returned</span>
                      </div>
                    </div>

                    {/* Stepper helper label */}
                    <p className={styles.trackingMilestoneMessage}>
                      {stage === 1 && "⏳ We've received your booking and it is awaiting preparation/fulfillment."}
                      {stage === 2 && (isDelivery 
                        ? "🚚 Your order has been delivered and is at the venue for your event!"
                        : "🏪 Your order has been picked up from our studio and is on hand for your event!"
                      )}
                      {stage === 3 && (isDelivery
                        ? "✅ All items have been picked up from the venue by our studio. Thank you!"
                        : "✅ All items have been returned back to our studio. Thank you!"
                      )}
                    </p>

                    {/* Itemized List with Thumbnails */}
                    {booking.items && booking.items.length > 0 && (
                      <div className={styles.itemizedItemsSection}>
                        <h4 className={styles.cardSubheading}>Order Details</h4>
                        <div className={styles.itemizedList}>
                          {booking.items.map((item, idx) => (
                            <div key={idx} className={styles.itemRow}>
                              {item.image && item.image.startsWith("/uploads") ? (
                                <img src={item.image} alt={item.name} className={styles.itemThumb} />
                              ) : (
                                <div className={styles.itemThumbPlaceholder}>🖼</div>
                              )}
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemQty}>
                                Quantity: {item.quantity}
                                {item.returned_quantity > 0 && (
                                  <span className={styles.returnedQtyLabel}>
                                    {" "}({item.returned_quantity} returned)
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery & Venue Details */}
                    <div className={styles.trackingDetailsGrid}>
                      <div className={styles.trackingDetailItem}>
                        <strong>Fulfillment:</strong>
                        <span>{isDelivery ? "🚚 Delivery & Drop-off" : "🏪 Warehouse Pickup"}</span>
                      </div>
                      <div className={styles.trackingDetailItem}>
                        <strong>Venue Address:</strong>
                        <span>{booking.venue_address}</span>
                      </div>
                      <div className={styles.trackingDetailItem}>
                        <strong>Pickup Date:</strong>
                        <span>{formatDate(booking.pickup_date)}</span>
                      </div>
                      <div className={styles.trackingDetailItem}>
                        <strong>Return Date:</strong>
                        <span>{formatDate(booking.return_date)}</span>
                      </div>
                      {booking.delivery_fee > 0 && (
                        <div className={styles.trackingDetailItem}>
                          <strong>Delivery Surcharge:</strong>
                          <span>{formatCurrency(booking.delivery_fee)}</span>
                        </div>
                      )}
                      {booking.special_notes && (
                        <div className={`${styles.trackingDetailItem} ${styles.fullWidth}`}>
                          <strong>Special Instructions:</strong>
                          <span>{booking.special_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 2. PAST BOOKINGS HISTORY ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Past Bookings</h2>

          {pastBookings.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📂</span>
              <p className={styles.emptyTitle}>No past bookings</p>
              <p className={styles.emptyMsg}>
                Completed and cancelled bookings will be saved here in your archives.
              </p>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {pastBookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <div>
                      <h3 className={styles.bookingPackage}>{booking.package_name}</h3>
                      <p className={styles.bookingId}>Booking #{booking.id}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>📅 Pickup</span>
                      <span className={styles.detailValue}>{formatDate(booking.pickup_date)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>📅 Return</span>
                      <span className={styles.detailValue}>{formatDate(booking.return_date)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>💳 Fulfillment</span>
                      <span className={styles.detailValue}>{booking.fulfillment_type === "delivery" ? "Delivery & Drop-off" : "Warehouse Pickup"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>💰 Total Paid</span>
                      <span className={`${styles.detailValue} ${styles.priceValue}`}>
                        {formatCurrency(booking.price)}
                      </span>
                    </div>
                  </div>

                  {/* ── Review Section for Returned Booking ── */}
                  {booking.status === "returned" && (
                    <div className={styles.reviewSection}>
                      {booking.reviewed === 1 ? (
                        <div className={styles.submittedReview}>
                          <h4 className={styles.cardSubheading}>Your Verified Review</h4>
                          <div className={styles.submittedReviewContent}>
                            <div className={styles.starsRow}>
                              {Array.from({ length: booking.review_rating || 5 }).map((_, i) => (
                                <span key={i} className={styles.starFilled}>★</span>
                              ))}
                            </div>
                            <p className={styles.reviewCommentText}>"{booking.review_comment}"</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleReviewSubmit(e, booking.id)} className={styles.reviewForm}>
                          <h4 className={styles.cardSubheading}>Share Your Feedback</h4>
                          
                          {/* Star Rating Selector */}
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Rating:</label>
                            <div className={styles.starsSelector}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className={`${styles.starBtn} ${
                                    (reviewForms[booking.id]?.rating ?? 5) >= star ? styles.starBtnActive : ""
                                  }`}
                                  onClick={() => handleReviewChange(booking.id, "rating", star)}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Role Input */}
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Your Role / Event (e.g. Bride, Groom, Host):</label>
                            <input
                              type="text"
                              className={styles.textInput}
                              placeholder="e.g. Bride, Groom, Host"
                              value={reviewForms[booking.id]?.role ?? "Client"}
                              onChange={(e) => handleReviewChange(booking.id, "role", e.target.value)}
                            />
                          </div>

                          {/* Comment Input */}
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Comment:</label>
                            <textarea
                              className={styles.textareaInput}
                              rows="3"
                              placeholder="Write about your experience renting these items..."
                              value={reviewForms[booking.id]?.comment || ""}
                              onChange={(e) => handleReviewChange(booking.id, "comment", e.target.value)}
                            />
                          </div>

                          {reviewForms[booking.id]?.error && (
                            <p className={styles.reviewErrorMsg}>{reviewForms[booking.id].error}</p>
                          )}

                          <button
                            type="submit"
                            className={styles.submitReviewBtn}
                            disabled={reviewForms[booking.id]?.submitting}
                          >
                            {reviewForms[booking.id]?.submitting ? "Submitting..." : "Submit Review ✦"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  <div className={styles.bookingFooter}>
                    <span className={styles.bookingDate}>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Quick Actions ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🚀 Quick Actions</h2>
          <div className={styles.actionsRow}>
            <Link to="/items" className={styles.actionCard}>
              <span className={styles.actionIcon}>🎀</span>
              <span className={styles.actionLabel}>Browse Items</span>
            </Link>
            <Link to="/cart" className={styles.actionCard}>
              <span className={styles.actionIcon}>🛒</span>
              <span className={styles.actionLabel}>View Cart</span>
            </Link>
            <Link to="/" className={styles.actionCard}>
              <span className={styles.actionIcon}>🏠</span>
              <span className={styles.actionLabel}>Home</span>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
