/**
 * pages/LandingPage/index.jsx
 * ────────────────────────────────────────────────────────────────────────────
 * Orchestrates all sections in order.
 * To add / remove / reorder a section, edit only this file.
 */

import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import HeroSection from "./HeroSection/HeroSection";

import CategorySection from "./CategorySection/CategorySection";
import OccasionsCarousel from "./OccasionsCarousel/OccasionsCarousel";
import PickupDelivery from "./PickupDelivery/PickupDelivery";
import Gallery from "./Gallery/Gallery";
import ContactUs from "./ContactUs/ContactUs";
import SocialProof from "./SocialProof/SocialProof";

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
      <SocialProof />
      <ContactUs />
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>FT</span>
            <span className={styles.footerName}>FinalTouch Studio</span>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} FinalTouch Studio. All rights reserved.
            Made with ❤️ in Dhaka.
          </p>
          <div className={styles.footerLinks}>
            <a href="#home">Home</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
