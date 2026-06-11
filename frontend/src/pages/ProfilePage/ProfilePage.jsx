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
        if (res.status === 401) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_info");
          navigate("/login");
          return;
        }
        throw new Error("Failed to load profile");
      }

      const data = await res.json();
      setProfile(data.user);
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
    switch ((status || "pending").toLowerCase()) {
      case "confirmed": return styles.statusConfirmed;
      case "completed":  return styles.statusCompleted;
      case "cancelled":  return styles.statusCancelled;
      default:           return styles.statusPending;
    }
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

          {/* ── Booking History ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📋 Booking History</h2>

            {bookings.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎪</span>
                <p className={styles.emptyTitle}>No bookings yet</p>
                <p className={styles.emptyMsg}>
                  Browse our packages and book your first event setup!
                </p>
                <Link to="/items" className={styles.browseBtn}>Browse Packages</Link>
              </div>
            ) : (
              <div className={styles.bookingList}>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.bookingCard}>
                    <div className={styles.bookingHeader}>
                      <div>
                        <h3 className={styles.bookingPackage}>{booking.package_name}</h3>
                        <p className={styles.bookingId}>Booking #{booking.id}</p>
                      </div>
                      <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                        {booking.status || "Pending"}
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
                        <span className={styles.detailLabel}>💳 Payment</span>
                        <span className={styles.detailValue}>{booking.payment_method || "—"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>💰 Total</span>
                        <span className={`${styles.detailValue} ${styles.priceValue}`}>
                          {formatCurrency(booking.price)}
                        </span>
                      </div>
                    </div>

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
                <span className={styles.actionLabel}>Browse Packages</span>
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
