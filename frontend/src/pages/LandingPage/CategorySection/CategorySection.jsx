import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSortedCategories } from "../../../utils/categoryHelper";
import styles from "./CategorySection.module.css";

// Import category images
import birthdayImg from "../../../assets/Category/Birthday_stage.jpg";
import proposalImg from "../../../assets/Category/Proposal_Stage.jpg";
import marriageImg from "../../../assets/Category/Marriage_Stage.jpg";
import bridalImg from "../../../assets/images/gallery_wedding.png";
import babyImg from "../../../assets/images/gallery_holud.png";

// Import category icons
import birthdayIcon from "../../../assets/Icons/birthday-cake.png";
import proposalIcon from "../../../assets/Icons/ring.png";
import marriageIcon from "../../../assets/Icons/wedding-couple.png";
import bridalIcon from "../../../assets/Icons/bridal-shower.png";
import babyIcon from "../../../assets/Icons/baby.png";

const categoryImages = {
  birthday: birthdayImg,
  proposal: proposalImg,
  marriage: marriageImg,
  "bridal-shower": bridalImg,
  "baby-shower": babyImg,
  "holud": babyImg,
  "baby": babyImg,
  "global": marriageImg
};

const categoryIcons = {
  birthday: birthdayIcon,
  proposal: proposalIcon,
  marriage: marriageIcon,
  "bridal-shower": bridalIcon,
  "baby-shower": babyIcon,
  "holud": babyIcon,
  "baby": babyIcon,
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load from server");
        return res.json();
      })
      .then((data) => {
        const { landingCategories } = getSortedCategories(data || []);
        setCategories(landingCategories);
      })
      .catch((err) => {
        console.warn("Category fetch failed, using fallback static data:", err);
        const { landingCategories } = getSortedCategories([]);
        setCategories(landingCategories);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className={styles.section} aria-label="Event categories">
      {/* Decorative Floating Elements */}
      <div className={styles.floatingOrb1} />
      <div className={styles.floatingOrb2} />
      <div className={styles.floatingOrb3} />
      <div className={styles.floatingSparkle1}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20M7 7l10 10M7 17L17 7" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.floatingSparkle2}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3v18M3 12h18" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.floatingRing1} />
      <div className={styles.floatingRing2} />
      <div className={styles.floatingFlower1}>🌸</div>
      <div className={styles.floatingFlower2}>✨</div>

      {/* Festive Floating Elements */}
      <div className={styles.confetti1} />
      <div className={styles.confetti2} />
      <div className={styles.confetti3} />
      <div className={styles.confetti4} />
      <div className={styles.lantern1}>🏮</div>
      <div className={styles.lantern2}>🎈</div>
      <div className={styles.festiveStar1}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
      <div className={styles.festiveStar2}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>

      <div className={styles.header}>
        <p className={styles.eyebrow}>What are you celebrating?</p>
        <h2 className={styles.heading}>Browse by Occasion</h2>
      </div>

      <div className={styles.timeline}>
        {categories.map((cat, index) => {
          const isEven = index % 2 === 0;
          const imgUrl = cat.image_url || categoryImages[cat.id] || marriageImg;
          const iconUrl = categoryIcons[cat.id];
          const isLast = index === categories.length - 1;

          let description = cat.description;
          if (!description) {
            if (cat.id === "birthday") description = "Bespoke balloon walls, kids themes & customized stage setups for your special day.";
            else if (cat.id === "proposal") description = "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.";
            else if (cat.id === "marriage") description = "Exquisite wedding, holud & reception stages blending modern and traditional luxury.";
            else if (cat.id === "bridal-shower") description = "Elegant backdrops & photo-worthy floral arrangements for the bride to be.";
            else if (cat.id === "baby-shower" || cat.id === "baby") description = "Cute, colorful & magical themes for celebrating your little one.";
            else description = "Bespoke setups and decorations.";
          }

          return (
            <div key={cat.id} className={`${styles.row} ${isEven ? styles.rowEven : styles.rowOdd}`}>
              
              <div className={styles.imageCol}>
                <Link to={`/items?category=${cat.id}`} className={styles.imageWrapper} style={{ display: "block" }}>
                  {imgUrl && <img src={imgUrl} alt={cat.label} className={styles.circleImage} />}
                </Link>
              </div>

              <div className={styles.textCol}>
                <div className={styles.textContent}>
                  <div className={styles.titleWrapper}>
                    {iconUrl ? (
                      <img src={iconUrl} alt="" className={styles.occIcon} />
                    ) : (
                      <span style={{ marginRight: "10px", fontSize: "1.6rem" }}>{cat.emoji || "🎉"}</span>
                    )}
                    <Link to={`/items?category=${cat.id}`} style={{ textDecoration: "none" }}>
                      <h3 className={styles.title}>{cat.label}</h3>
                    </Link>
                  </div>
                  <p className={styles.desc}>{description}</p>
                  
                  <Link to={`/items?category=${cat.id}`} className={styles.linkWrapper} style={{ textDecoration: "none" }}>
                    <span className={styles.linkLine}></span>
                    <span className={styles.linkText}>explore props</span>
                    <span className={styles.linkCircle}></span>
                  </Link>
                </div>
              </div>

              {/* Wavery continuous SVG lines covering the row and reaching to the next */}
              <svg className={styles.rowSvg} viewBox="0 0 1000 630" preserveAspectRatio="none">
                {isEven ? (
                  <>
                    {/* Swoop deeply under the text to avoid crossing it */}
                    <path d="M 340 210 C 450 210, 660 400, 660 320" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />
                    {/* Loop outward to connect to the next image */}
                    {!isLast && <path d="M 660 320 C 850 320, 850 590, 660 590" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />}
                  </>
                ) : (
                  <>
                    {/* Swoop deeply under the text to avoid crossing it */}
                    <path d="M 660 210 C 550 210, 340 400, 340 320" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />
                    {/* Loop outward to connect to the next image */}
                    {!isLast && <path d="M 340 320 C 150 320, 150 590, 340 590" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />}
                  </>
                )}
              </svg>

            </div>
          );
        })}
      </div>
    </section>
  );
}
