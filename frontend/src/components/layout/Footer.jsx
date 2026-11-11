import { Link } from "react-router-dom";
import { CONTACT, SOCIAL_LINKS } from "../../constants/site";
import { ClockIcon, Container, MailIcon, PhoneIcon, PinIcon } from "../ui";
import { Brand } from "./Navbar";
import styles from "./Footer.module.css";

const EXPLORE = [
  { label: "Browse rentals", to: "/items" },
  { label: "Setup guides", to: "/build" },
  { label: "About us", to: "/about" },
  { label: "Your cart", to: "/cart" },
];

const OCCASIONS = [
  { label: "Weddings", to: "/items?category=marriage" },
  { label: "Proposals", to: "/items?category=proposal" },
  { label: "Holud & Mehndi", to: "/items?category=holud" },
  { label: "Birthdays", to: "/items?category=birthday" },
  { label: "Baby showers", to: "/items?category=baby" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.about}>
            <Brand onDark />
            <p className={styles.story}>
              Event decor rentals and styled packages for weddings, holud nights, proposals, birthdays and showers —
              designed, delivered and set up in Saskatoon.
            </p>
            <ul className={styles.social}>
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Explore">
            <h2 className={styles.title}>Explore</h2>
            <ul className={styles.list}>
              {EXPLORE.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Occasions">
            <h2 className={styles.title}>Occasions</h2>
            <ul className={styles.list}>
              {OCCASIONS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={styles.title}>Visit &amp; contact</h2>
            <ul className={`${styles.list} ${styles.contact}`}>
              <li>
                <PinIcon width={18} height={18} /> {CONTACT.address}
              </li>
              <li>
                <PhoneIcon width={18} height={18} /> <a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a>
              </li>
              <li>
                <MailIcon width={18} height={18} /> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <ClockIcon width={18} height={18} /> {CONTACT.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} FinalTouch Studio. All rights reserved.</span>
          <span>Made with care in Saskatoon, Saskatchewan</span>
        </div>
      </Container>
    </footer>
  );
}
