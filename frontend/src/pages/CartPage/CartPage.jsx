import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitOrder } from "../../api/bookings.api";
import ItemImage from "../../components/catalog/ItemImage";
import PageLayout from "../../components/layout/PageLayout";
import {
  Alert,
  ArrowLeftIcon,
  Button,
  Card,
  CartIcon,
  CheckIcon,
  Container,
  EmptyState,
  Field,
  MinusIcon,
  PageHeader,
  PlusIcon,
  StoreIcon,
  TrashIcon,
  TruckIcon,
} from "../../components/ui";
import { PAYMENT_METHODS } from "../../constants/pricing";
import { useCart } from "../../context/CartContext";
import { cartTotals, lineTotal, rentalDays, toDateKey } from "../../utils/cartTotals";
import { formatDate, formatMoney, formatPrice } from "../../utils/format";
import { formatPostalCodeInput, getDeliveryStatus } from "../../utils/saskatoonDelivery";
import { getStoredUser, isLoggedIn } from "../../utils/session";
import styles from "./CartPage.module.css";

const FULFILMENT = [
  { id: "pickup", Icon: StoreIcon, label: "Studio pickup", note: "Free · collect from our Saskatoon studio" },
  { id: "delivery", Icon: TruckIcon, label: "Venue delivery", note: "Delivered and collected within Saskatoon" },
];

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    postalCode: "",
    notes: "",
  });
  const [fulfilment, setFulfilment] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const totals = useMemo(() => cartTotals(cart, fulfilment), [cart, fulfilment]);
  const unitCount = cart.reduce((count, line) => count + (line.quantity || 1), 0);
  const delivery = getDeliveryStatus(form.postalCode);
  const signedIn = isLoggedIn();

  const setField = (name) => (event) => {
    const value = name === "postalCode" ? formatPostalCodeInput(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    if (!signedIn) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (fulfilment === "delivery" && delivery.status !== "available") {
      setError(delivery.message || "We only deliver within Saskatoon. Please choose studio pickup instead.");
      return;
    }

    // The order window spans the earliest pickup and the latest return in the cart.
    const pickups = cart.map((line) => toDateKey(line.pickupDate)).sort();
    const returns = cart.map((line) => toDateKey(line.returnDate || line.pickupDate)).sort();

    setSubmitting(true);
    try {
      const result = await submitOrder({
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        rental_date: pickups[0],
        event_date: returns[returns.length - 1],
        fulfillment_type: fulfilment,
        delivery_fee: totals.delivery,
        venue_address: fulfilment === "delivery" ? `${form.address.trim()}, Saskatoon, SK ${form.postalCode}` : "Customer Pickup",
        special_notes: [`Payment method: ${paymentMethod}`, form.notes.trim()].filter(Boolean).join(" — "),
        total_amount: Number(totals.total.toFixed(2)),
        items: cart.map((line) => {
          // Catalogue items carry a categoryId; packages do not.
          const isItem = Boolean(line.item.categoryId);
          return {
            item_id: isItem ? line.item.id : null,
            package_id: isItem ? null : line.item.id,
            item_name: line.item.title,
            quantity: line.quantity || 1,
            // Stored per unit for the whole rental, so price × quantity is the line total.
            price: Number((lineTotal(line) / (line.quantity || 1)).toFixed(2)),
            pickup_date: toDateKey(line.pickupDate),
            return_date: toDateKey(line.returnDate || line.pickupDate),
          };
        }),
      });

      setConfirmation({ reference: `FT-${result.orderId}`, name: form.name.trim(), email: form.email.trim(), total: totals.total, fulfilment });
      clearCart();
    } catch (err) {
      setError(err.message || "We could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <Card padded className={styles.confirmation}>
            <span className={styles.confirmationIcon}>
              <CheckIcon width={30} height={30} />
            </span>
            <h1>Booking received</h1>
            <p className={styles.reference}>
              Reference <strong>{confirmation.reference}</strong>
            </p>
            <p>
              Thank you, {confirmation.name}. A confirmation is on its way to <strong>{confirmation.email}</strong>, and we will
              be in touch to arrange your {confirmation.fulfilment === "delivery" ? "delivery" : "pickup"}.
            </p>
            <p className={styles.confirmationTotal}>Order total {formatMoney(confirmation.total)}</p>
            <div className={styles.confirmationActions}>
              <Button to="/profile">View my bookings</Button>
              <Button to="/items" variant="secondary">
                Continue browsing
              </Button>
            </div>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <PageLayout>
        <PageHeader title="Your cart" crumbs={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
        <Container narrow className={styles.state}>
          <EmptyState icon={<CartIcon />} title="Your cart is empty" actions={<Button to="/items">Browse rentals</Button>}>
            Pick your pieces and dates from the catalogue and they will appear here.
          </EmptyState>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Your cart"
        lead={`${unitCount} ${unitCount === 1 ? "piece" : "pieces"} ready to book`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Rentals", to: "/items" }, { label: "Cart" }]}
      />

      <Container className={styles.layout}>
        {/* Cart lines */}
        <section aria-label="Items in your cart">
          <ul className={styles.lines}>
            {cart.map((line) => {
              const days = rentalDays(line.pickupDate, line.returnDate);
              const title = line.item.title || line.item.name;
              return (
                <li key={line.id} className={styles.line}>
                  <Link to={`/item/${line.item.id}`} className={styles.lineMedia} aria-label={`View ${title}`}>
                    <ItemImage src={line.item.image} alt="" width={300} />
                  </Link>

                  <div className={styles.lineBody}>
                    <h2 className={styles.lineTitle}>
                      <Link to={`/item/${line.item.id}`}>{title}</Link>
                    </h2>
                    <p className={styles.lineMeta}>
                      {line.pickupDate
                        ? `${formatDate(line.pickupDate)} – ${formatDate(line.returnDate || line.pickupDate)} · ${days} ${days === 1 ? "day" : "days"}`
                        : "Dates to be confirmed"}
                    </p>
                    <p className={styles.lineMeta}>{formatPrice(line.item.price)} per day</p>

                    <div className={styles.lineControls}>
                      <div className={styles.stepper} role="group" aria-label={`Quantity of ${title}`}>
                        <button type="button" onClick={() => updateQuantity(line.id, -1)} aria-label="Decrease quantity">
                          <MinusIcon width={14} height={14} />
                        </button>
                        <span aria-live="polite">{line.quantity || 1}</span>
                        <button type="button" onClick={() => updateQuantity(line.id, 1)} aria-label="Increase quantity">
                          <PlusIcon width={14} height={14} />
                        </button>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => removeFromCart(line.id)}>
                        <TrashIcon width={16} height={16} /> Remove
                      </button>
                    </div>
                  </div>

                  <strong className={styles.lineTotal}>{formatMoney(lineTotal(line))}</strong>
                </li>
              );
            })}
          </ul>

          <Button to="/items" variant="ghost" className={styles.back}>
            <ArrowLeftIcon /> Continue browsing
          </Button>
        </section>

        {/* Checkout */}
        <form className={styles.checkout} onSubmit={handlePlaceOrder}>
          <Card padded className={styles.panel}>
            <h2 className={styles.panelTitle}>1. Pickup or delivery</h2>
            <div className={styles.options}>
              {FULFILMENT.map(({ id, Icon, label, note }) => (
                <label key={id} className={`${styles.option} ${fulfilment === id ? styles.optionActive : ""}`}>
                  <input type="radio" name="fulfilment" value={id} checked={fulfilment === id} onChange={() => setFulfilment(id)} />
                  <Icon />
                  <span>
                    <strong>{label}</strong>
                    <small>{note}</small>
                  </span>
                </label>
              ))}
            </div>

            {fulfilment === "delivery" && (
              <div className={styles.fields}>
                <Field
                  label="Venue or street address"
                  autoComplete="street-address"
                  required
                  value={form.address}
                  onChange={setField("address")}
                />
                <Field
                  label="Postal code"
                  placeholder="S7K 3Y5"
                  autoComplete="postal-code"
                  required
                  value={form.postalCode}
                  onChange={setField("postalCode")}
                  hint={delivery.status === "available" ? "Great — we deliver to this area." : "Delivery is available within Saskatoon."}
                  error={["invalid", "unavailable"].includes(delivery.status) ? delivery.message || "We do not deliver to this postal code yet." : undefined}
                />
              </div>
            )}
          </Card>

          <Card padded className={styles.panel}>
            <h2 className={styles.panelTitle}>2. Your details</h2>
            <div className={styles.fields}>
              <Field label="Full name" autoComplete="name" required value={form.name} onChange={setField("name")} />
              <div className={styles.fieldRow}>
                <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={setField("email")} />
                <Field label="Phone" type="tel" autoComplete="tel" required value={form.phone} onChange={setField("phone")} />
              </div>
              <Field
                as="textarea"
                label="Notes for our team (optional)"
                rows={3}
                placeholder="Venue access times, colour preferences, setup requests"
                value={form.notes}
                onChange={setField("notes")}
              />
            </div>
          </Card>

          <Card padded className={styles.panel}>
            <h2 className={styles.panelTitle}>3. Payment preference</h2>
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

          <Card padded className={`${styles.panel} ${styles.summary}`}>
            <h2 className={styles.panelTitle}>Order summary</h2>
            <dl className={styles.totals}>
              <div>
                <dt>Rental subtotal</dt>
                <dd>{formatMoney(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>{fulfilment === "delivery" ? "Delivery" : "Studio pickup"}</dt>
                <dd>{totals.delivery ? formatMoney(totals.delivery) : "Free"}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{formatMoney(totals.tax)}</dd>
              </div>
              <div className={styles.grand}>
                <dt>Total</dt>
                <dd>{formatMoney(totals.total)}</dd>
              </div>
            </dl>

            {error && <Alert tone="error">{error}</Alert>}
            {!signedIn && <Alert tone="info">Please sign in to place your booking — your cart will be kept.</Alert>}

            <Button type="submit" size="lg" block loading={submitting}>
              {signedIn ? "Place booking" : "Sign in to book"}
            </Button>
          </Card>
        </form>
      </Container>
    </PageLayout>
  );
}
