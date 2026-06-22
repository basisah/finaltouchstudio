import styles from "./PickupDelivery.module.css";

const OPTIONS = [
  {
    icon: "🏪",
    title: "Studio Pickup",
    subtitle: "Free — Ready within 24hrs",
    description:
      "Visit our studio to pick up your decoration package. We'll have everything neatly packed, labelled, and ready for a smooth setup at your venue.",
    highlights: ["Same-day for orders before 12pm", "Full setup guide included", "Damage-free packaging"],
    cta: "Schedule Pickup",
    color: "var(--clr-primary)",
  },
  {
    icon: "🚚",
    title: "Home Delivery",
    subtitle: "From $25 — Saskatoon & Nearby",
    description:
      "We deliver directly to your venue or home. Our team handles the transport carefully so your items arrive in perfect condition, right when you need them.",
    highlights: ["Real-time tracking", "Covers Saskatoon & surrounding areas", "Optional setup assistance"],
    cta: "Get Delivery Quote",
    color: "var(--clr-gold)",
    featured: true,
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
              style={{ "--opt-color": opt.color }}
            >
              {opt.featured && <span className={styles.badge}>Most Popular</span>}
              <div className={styles.cardIcon}>{opt.icon}</div>
              <h3 className={styles.cardTitle}>{opt.title}</h3>
              <p className={styles.cardSubtitle}>{opt.subtitle}</p>
              <p className={styles.cardDesc}>{opt.description}</p>
              <ul className={styles.highlights}>
                {opt.highlights.map((h) => (
                  <li key={h}><span>✓</span>{h}</li>
                ))}
              </ul>
              <button className={styles.cardCta}>{opt.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
