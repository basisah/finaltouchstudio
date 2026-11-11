import { useState } from "react";
import { useLocation } from "react-router-dom";
import { submitBooking } from "../../api/bookings.api";
import PageLayout from "../../components/layout/PageLayout";
import { Alert, Button, Card, CheckIcon, Container, EmptyState, Field, PageHeader } from "../../components/ui";
import { PAYMENT_METHODS } from "../../constants/pricing";
import { formatDate, formatMoney, titleCase } from "../../utils/format";
import { getStoredUser } from "../../utils/session";
import styles from "./CheckoutPage.module.css";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Checkout for a styled package. The package page passes the customised
 * selection through router state; opening this URL directly shows a prompt
 * to pick a package first.
 */
export default function CheckoutPage() {
  const { state: order } = useLocation();
  const user = getStoredUser();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    pickupDate: "",
    returnDate: "",
  });
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const setField = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  if (!order?.pkgName) {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <EmptyState
            title="Choose a package first"
            actions={
              <>
                <Button to="/#packages">View packages</Button>
                <Button to="/items" variant="secondary">
                  Browse rentals
                </Button>
              </>
            }
          >
            Pick a styled package, customise it, and you will be brought back here to book it.
          </EmptyState>
        </Container>
      </PageLayout>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.returnDate < form.pickupDate) {
      setError("The return date must be on or after the pickup date.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitBooking({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        packageName: order.pkgName,
        price: Number(Number(order.finalPrice).toFixed(2)),
        paymentMethod,
      });
      setReference(`FT-${result.bookingId}`);
    } catch (err) {
      setError(err.message || "We could not confirm your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <Card padded className={styles.confirmation}>
            <span className={styles.confirmationIcon}>
              <CheckIcon width={30} height={30} />
            </span>
            <h1>Booking received</h1>
            <p className={styles.reference}>
              Reference <strong>{reference}</strong>
            </p>
            <p>
              Thank you, {form.name}. Your <strong>{order.pkgName}</strong> is reserved for {formatDate(form.pickupDate)} –{" "}
              {formatDate(form.returnDate)}. We will call you on {form.phone} to arrange delivery and setup.
            </p>
            <p className={styles.confirmationTotal}>Total {formatMoney(order.finalPrice)}</p>
            <div className={styles.confirmationActions}>
              <Button to="/">Back to home</Button>
              <Button to="/items" variant="secondary">
                Browse rentals
              </Button>
            </div>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Checkout"
        title="Complete your booking"
        lead="Tell us when you need your package and how you would like to pay."
        crumbs={[{ label: "Home", to: "/" }, { label: "Packages", to: "/#packages" }, { label: "Checkout" }]}
      />

      <Container className={styles.layout}>
        <form id="package-checkout" className={styles.form} onSubmit={handleSubmit}>
          <Card padded className={styles.panel}>
            <h2 className={styles.panelTitle}>1. Contact &amp; dates</h2>
            <div className={styles.fieldRow}>
              <Field label="Full name" autoComplete="name" required value={form.name} onChange={setField("name")} />
              <Field label="Phone" type="tel" autoComplete="tel" required value={form.phone} onChange={setField("phone")} />
            </div>
            <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={setField("email")} />
            <div className={styles.fieldRow}>
              <Field label="Pickup date" type="date" min={today()} required value={form.pickupDate} onChange={setField("pickupDate")} />
              <Field
                label="Return date"
                type="date"
                min={form.pickupDate || today()}
                required
                value={form.returnDate}
                onChange={setField("returnDate")}
              />
            </div>
          </Card>

          <Card padded className={styles.panel}>
            <h2 className={styles.panelTitle}>2. Payment preference</h2>
            <div className={styles.options}>
              {PAYMENT_METHODS.map((method) => (
                <label key={method.id} className={`${styles.option} ${paymentMethod === method.id ? styles.optionActive : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.note}</small>
                  </span>
                </label>
              ))}
            </div>
            <p className={styles.fine}>No payment is taken now. We confirm availability first, then send payment details.</p>
          </Card>
        </form>

        <aside className={styles.sidebar}>
          <Card padded className={styles.summary}>
            <span className={styles.summaryEyebrow}>{titleCase(order.pkgCategory)} package</span>
            <h2 className={styles.panelTitle}>{order.pkgName}</h2>

            {order.itemsList?.length > 0 && (
              <>
                <p className={styles.summaryCount}>
                  {order.itemsCount} {order.itemsCount === 1 ? "piece" : "pieces"} included
                </p>
                <ul className={styles.summaryList}>
                  {order.itemsList.map((title) => (
                    <li key={title}>
                      <CheckIcon width={16} height={16} />
                      {title}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className={styles.total}>
              <span>Total</span>
              <strong>{formatMoney(order.finalPrice)}</strong>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <Button type="submit" form="package-checkout" size="lg" block loading={submitting}>
              Confirm booking
            </Button>
          </Card>
        </aside>
      </Container>
    </PageLayout>
  );
}
