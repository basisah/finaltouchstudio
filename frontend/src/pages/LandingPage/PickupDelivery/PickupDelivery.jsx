import styles from "./PickupDelivery.module.css";
import pickupIcon from "../../../assets/Icons/Delivery/Pickup.png";
import deliveryIcon from "../../../assets/Icons/Delivery/HomeDelivery.png";

const OPTIONS = [
  {
    icon: <img src={pickupIcon} alt="Studio Pickup" className={styles.iconImg} />,
    title: "Studio Pickup",
    subtitle: "Free — Ready within 24hrs",
    description:
      "Visit our studio to pick up your decoration package. We'll have everything neatly packed, labelled, and ready for a smooth setup at your venue.",
    highlights: ["Same-day for orders before 12pm", "Full setup guide included", "Damage-free packaging"],
    cta: "Schedule Pickup",
    color: "var(--btn-primary)",
    iconBg: "rgba(129, 87, 164, 0.08)",
    trustMessage: "🛡️ Safe Packaging Guarantee — Wrapped securely to prevent any damage during transit."
  },
  {
    icon: <img src={deliveryIcon} alt="Home Delivery" className={styles.iconImg} />,
    title: "Home Delivery",
    subtitle: "From $25 — Saskatoon & Nearby",
    description:
      "We deliver directly to your venue or home. Our team handles the transport carefully so your items arrive in perfect condition, right when you need them.",
    highlights: ["Real-time tracking", "Covers Saskatoon & surrounding areas", "Optional setup assistance"],
    cta: "Get Delivery Quote",
    color: "var(--brand-gold)",
    iconBg: "rgba(217, 119, 6, 0.08)",
    featured: true,
    trustMessage: "🤝 White-Glove Staging — Transported with ultimate care directly to your venue floor."
  },
];

export default function PickupDelivery() {
  return (
    <section id="delivery" className={styles.section} aria-label="Pickup and delivery options">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Pickup or Delivery — Your Choice</h2>
        <p className={styles.subheading}>
          We make getting your decorations as stress-free as the event itself.
        </p>

        <div className={styles.cards}>
          {OPTIONS.map((opt) => (
            <div
              key={opt.title}
              className={`${styles.card} ${opt.featured ? styles.featured : ""}`}
              style={{ 
                "--opt-color": opt.color,
                "--opt-icon-bg": opt.iconBg
              }}
            >
              {opt.featured && <span className={styles.badge}>Most Popular</span>}
              <div className={styles.cardIcon}>{opt.icon}</div>
              <h3 className={styles.cardTitle}>{opt.title}</h3>
              <p className={styles.cardSubtitle}>{opt.subtitle}</p>
              <p className={styles.cardDesc}>{opt.description}</p>
              <ul className={styles.highlights}>
                {opt.highlights.map((h) => (
                  <li key={h}>
                    <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.trustBadge}>
                {opt.trustMessage}
              </div>
              <button className={styles.cardCta}>{opt.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
