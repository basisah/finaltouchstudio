import heroImage from "../../../assets/Hero_bg_white_beach.jpg";
import SearchBar from "../../../components/catalog/SearchBar";
import { ArrowRightIcon, Button, CalendarIcon, ShieldIcon, TruckIcon } from "../../../components/ui";
import styles from "../LandingPage.module.css";

const PROMISES = [
  { Icon: CalendarIcon, label: "Live date availability" },
  { Icon: TruckIcon, label: "Delivery across Saskatoon" },
  { Icon: ShieldIcon, label: "Cleaned & checked every rental" },
];

export default function Hero({ items, categories }) {
  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <img
        src={heroImage}
        alt="Floral wedding stage with gold arches by the water"
        className={styles.heroImage}
        fetchpriority="high"
        width="1199"
        height="800"
      />
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroContent}>
        <span className={styles.heroEyebrow}>Event decor rentals · Saskatoon</span>
        <h1 className={styles.heroTitle}>
          Every moment deserves <em>a final touch</em>
        </h1>
        <p className={styles.heroLead}>
          Arches, florals, lighting and styled packages for weddings, holud nights, proposals and birthdays — ready for
          pickup or delivered to your venue.
        </p>

        <div className={styles.heroSearch}>
          <SearchBar items={items} categories={categories} variant="hero" />
        </div>

        <div className={styles.heroActions}>
          <Button to="/items" variant="onDark" size="lg">
            Browse rentals <ArrowRightIcon />
          </Button>
          <Button href="#packages" variant="outlineOnDark" size="lg">
            View packages
          </Button>
        </div>
      </div>

      <ul className={styles.heroPromises}>
        {PROMISES.map(({ Icon, label }) => (
          <li key={label}>
            <Icon />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
