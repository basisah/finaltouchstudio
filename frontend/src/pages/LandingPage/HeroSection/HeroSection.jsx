import { useState } from "react";
import { CATEGORIES } from "../../../constants/categories";
import HeroImage from "./HeroImage";
import HeroTitle from "./HeroTitle";
import styles from "./HeroSection.module.css";

// Import category images
import birthdayImg from "../../../assets/Category/Birthday_stage.jpg";
import proposalImg from "../../../assets/Category/Proposal_Stage.jpg";
import marriageImg from "../../../assets/Category/Marriage_Stage.jpg";

const categoryImages = {
  birthday: birthdayImg,
  proposal: proposalImg,
  marriage: marriageImg,
};

/** Inline search bar (clean and less text) */
function HeroSearchBar() {
  const [query, setQuery] = useState("");

  return (
    <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        className={styles.sInputSimple}
        placeholder="Search setups, stages, occasions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className={styles.sBtnSimple}>
        Search
      </button>
    </form>
  );
}

/**
 * HeroSection
 * Layout: HeroImage (no tint) → centered content → clean search → 3 category
 * cards with dual-image blending blur on top of a dark purple gradient background.
 */
export default function HeroSection() {
  // Show only first 3 categories on the hero strip
  const heroCategories = CATEGORIES.slice(0, 3);

  return (
    <section id="home" className={styles.hero} aria-label="Hero">
      {/* Background image — subtle vignette only, no heavy tint */}
      <HeroImage />

      {/* Centre content */}
      <div className={styles.content}>
        <HeroTitle />
        <div className={styles.searchRow}>
          <HeroSearchBar />
          <a href="#contact" className={styles.btnRoundBook}>
            ✦ Book Consultation
          </a>
        </div>
      </div>

      {/* 3 category cards — seamless gradual blur cards */}
      <div className={styles.categoryStrip}>
        {heroCategories.map((cat) => {
          const imgUrl = categoryImages[cat.id];
          
          let description = "Bespoke balloon walls, kids themes & stage setups.";
          if (cat.id === "proposal") {
            description = "Fairy lights, romantic floral arches & signs.";
          } else if (cat.id === "marriage") {
            description = "Exquisite wedding, holud & reception stages.";
          }

          return (
            <a key={cat.id} href="#occasions" className={styles.catCard}>
              {imgUrl && (
                <>
                  {/* Clear image in background */}
                  <img
                    src={imgUrl}
                    alt={cat.label}
                    className={styles.catCardImgClear}
                  />
                  {/* Blurred overlay image with vertical mask */}
                  <img
                    src={imgUrl}
                    alt=""
                    className={styles.catCardImgBlur}
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Purple themed gradual overlay */}
              <div className={styles.catCardOverlay} />

              {/* Text content area */}
              <div className={styles.catCardContent}>
                <h3 className={styles.catCardTitle}>{cat.label}</h3>
                <p className={styles.catCardDesc}>{description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
