/**
 * pages/LandingPage/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates all sections in order.
 * To add / remove / reorder a section, edit only this file.
 */

import Navbar             from "../../components/Navbar/Navbar";
import HeroSection        from "./HeroSection/HeroSection";

import CategorySection    from "./CategorySection/CategorySection";
import OccasionsCarousel  from "./OccasionsCarousel/OccasionsCarousel";
import PickupDelivery     from "./PickupDelivery/PickupDelivery";
import Gallery            from "./Gallery/Gallery";
import ContactUs          from "./ContactUs/ContactUs";
import Footer             from "../../components/Footer/Footer";

import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <HeroSection />

      <CategorySection />
      <OccasionsCarousel />
      <PickupDelivery />
      <Gallery />
      <ContactUs />
      <Footer />
    </div>
  );
}

