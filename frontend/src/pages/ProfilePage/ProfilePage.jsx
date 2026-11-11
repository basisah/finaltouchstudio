import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../../api/client";
import ItemImage from "../../components/catalog/ItemImage";
import PageLayout from "../../components/layout/PageLayout";
import { Badge, BoxIcon, Button, Card, Container, EmptyState, LogoutIcon, PageLoader } from "../../components/ui";
import { formatDate, formatMoney, titleCase } from "../../utils/format";
import { clearSession, isLoggedIn } from "../../utils/session";
import styles from "./ProfilePage.module.css";

const STATUS_TONES = {
  ordered: "accent",
  pending: "warning",
  confirmed: "success",
  on_hand: "gold",
  returned: "success",
  cancelled: "danger",
};

const STATUS_LABELS = { ordered: "Booked", on_hand: "With you", returned: "Returned" };

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
      return undefined;
    }

    let active = true;
    get("/auth/profile")
      .then((data) => {
        if (!active) return;
        setProfile(data.user);
        setBookings(data.bookings || []);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        // An expired or unknown session sends the customer back to sign in.
        if (err.status === 401 || err.status === 404) {
          clearSession();
          navigate("/login", { replace: true });
        } else {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSignOut = () => {
    clearSession();
    navigate("/");
  };

  if (status === "loading") {
    return (
      <PageLayout>
        <PageLoader label="Loading your profile…" />
      </PageLayout>
    );
  }

  if (status === "error") {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <EmptyState title="We could not load your profile" actions={<Button onClick={() => window.location.reload()}>Try again</Button>}>
            Please check your connection and try again in a moment.
          </EmptyState>
        </Container>
      </PageLayout>
    );
  }

  const active = bookings.filter((b) => !["returned", "cancelled"].includes(b.status)).length;
  const spent = bookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

  return (
    <PageLayout>
      <Container className={styles.page}>
        <Card padded className={styles.profile}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className={styles.avatar} referrerPolicy="no-referrer" width="88" height="88" />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {initials(profile?.name)}
            </span>
          )}
          <div className={styles.profileText}>
            <h1>{profile?.name}</h1>
            <p>{profile?.email}</p>
            <div className={styles.profileMeta}>
              <Badge tone={profile?.role === "admin" ? "gold" : "accent"}>{profile?.role === "admin" ? "Admin" : "Member"}</Badge>
              {profile?.created_at && <span>Member since {formatDate(profile.created_at)}</span>}
            </div>
          </div>
          <div className={styles.profileActions}>
            {profile?.role === "admin" && (
              <Button to="/admin" variant="secondary">
                Admin dashboard
              </Button>
            )}
            <Button variant="ghost" onClick={handleSignOut} id="profile-sign-out">
              <LogoutIcon /> Sign out
            </Button>
          </div>
        </Card>

        <dl className={styles.stats}>
          <Card padded as="div">
            <dt>Total bookings</dt>
            <dd>{bookings.length}</dd>
          </Card>
          <Card padded as="div">
            <dt>Active</dt>
            <dd>{active}</dd>
          </Card>
          <Card padded as="div">
            <dt>Total booked</dt>
            <dd>{formatMoney(spent)}</dd>
          </Card>
        </dl>

        <section aria-label="Booking history">
          <h2 className={styles.sectionTitle}>Booking history</h2>

          {bookings.length === 0 ? (
            <EmptyState icon={<BoxIcon />} title="No bookings yet" actions={<Button to="/items">Browse rentals</Button>}>
              When you book a rental or a package it will appear here with its dates and status.
            </EmptyState>
          ) : (
            <ul className={styles.bookings}>
              {bookings.map((booking) => (
                <Card as="li" key={booking.id} className={styles.booking}>
                  <header className={styles.bookingHeader}>
                    <div>
                      <span className={styles.bookingRef}>Booking FT-{booking.id}</span>
                      <h3>{booking.package_name}</h3>
                    </div>
                    <Badge tone={STATUS_TONES[booking.status] || "neutral"} dot>
                      {STATUS_LABELS[booking.status] || titleCase(booking.status || "pending")}
                    </Badge>
                  </header>

                  {booking.items?.length > 0 && (
                    <ul className={styles.thumbs} aria-label="Items in this booking">
                      {booking.items.slice(0, 6).map((item) => (
                        <li key={item.order_item_id} title={`${item.quantity} × ${item.name}`}>
                          <ItemImage src={item.image} alt={item.name} width={120} />
                        </li>
                      ))}
                    </ul>
                  )}

                  <dl className={styles.details}>
                    <div>
                      <dt>Pickup</dt>
                      <dd>{formatDate(booking.pickup_date) || "—"}</dd>
                    </div>
                    <div>
                      <dt>Return</dt>
                      <dd>{formatDate(booking.return_date) || "—"}</dd>
                    </div>
                    <div>
                      <dt>Fulfilment</dt>
                      <dd>{booking.fulfillment_type === "delivery" ? "Delivery" : "Studio pickup"}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd className={styles.price}>{formatMoney(booking.price)}</dd>
                    </div>
                  </dl>

                  <footer className={styles.bookingFooter}>Booked on {formatDate(booking.created_at)}</footer>
                </Card>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </PageLayout>
  );
}
