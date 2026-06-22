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

// Import category and floating icons
import archIcon from "../../../assets/Icons/floating icons/Arch.png";
import babyIcon from "../../../assets/Icons/floating icons/baby.png";
import balloonIcon from "../../../assets/Icons/floating icons/Balloon.png";
import birthdayIcon from "../../../assets/Icons/floating icons/birthday-cake.png";
import boardIcon from "../../../assets/Icons/floating icons/board.png";
import bridalIcon from "../../../assets/Icons/floating icons/bridal-shower.png";
import brideIcon from "../../../assets/Icons/floating icons/bride.png";
import coupleIcon from "../../../assets/Icons/floating icons/couple.png";
import foodTrayIcon from "../../../assets/Icons/floating icons/FoodTray.png";
import lightBulbIcon from "../../../assets/Icons/floating icons/Light bulb.png";
import lightIcon from "../../../assets/Icons/floating icons/Light.png";
import managerIcon from "../../../assets/Icons/floating icons/manager.png";
import micIcon from "../../../assets/Icons/floating icons/MIc.png";
import plantIcon from "../../../assets/Icons/floating icons/Plant.png";
import platerIcon from "../../../assets/Icons/floating icons/Plater.png";
import propIcon from "../../../assets/Icons/floating icons/Prop.png";
import ringIcon from "../../../assets/Icons/floating icons/ring.png";
import tableClothIcon from "../../../assets/Icons/floating icons/TableCloth.png";
import teddyIcon from "../../../assets/Icons/floating icons/Teddy.png";
import weddingIcon from "../../../assets/Icons/floating icons/wedding-couple.png";

const FLOATING_ITEMS = [
  { icon: archIcon,          top: "4%",   left: "14%",  size: "40px", delay: "0s",   duration: "18s", blur: "0px", opacity: 0.14 },
  { icon: babyIcon,          top: "9%",   right: "18%", size: "34px", delay: "-3s",  duration: "21s", blur: "1.5px", opacity: 0.11 },
  { icon: balloonIcon,       top: "14%",  left: "22%",  size: "42px", delay: "-6s",  duration: "24s", blur: "3px", opacity: 0.08 },
  { icon: birthdayIcon,      top: "18%",  right: "26%", size: "38px", delay: "-2s",  duration: "19s", blur: "0px", opacity: 0.15 },
  { icon: boardIcon,         top: "23%",  left: "16%",  size: "36px", delay: "-10s", duration: "23s", blur: "2px", opacity: 0.10 },
  { icon: bridalIcon,        top: "27%",  right: "15%", size: "32px", delay: "-14s", duration: "20s", blur: "0px", opacity: 0.14 },
  { icon: brideIcon,         top: "32%",  left: "25%",  size: "38px", delay: "-5s",  duration: "22s", blur: "1.5px", opacity: 0.12 },
  { icon: coupleIcon,        top: "37%",  right: "22%", size: "40px", delay: "-8s",  duration: "25s", blur: "3px", opacity: 0.07 },
  { icon: foodTrayIcon,      top: "42%",  left: "18%",  size: "36px", delay: "-12s", duration: "21s", blur: "0px", opacity: 0.15 },
  { icon: lightBulbIcon,     top: "46%",  right: "28%", size: "32px", delay: "-15s", duration: "17s", blur: "2px", opacity: 0.10 },
  { icon: lightIcon,         top: "51%",  left: "12%",  size: "38px", delay: "-1s",  duration: "23s", blur: "0px", opacity: 0.14 },
  { icon: managerIcon,       top: "56%",  right: "14%", size: "36px", delay: "-9s",  duration: "20s", blur: "1.5px", opacity: 0.12 },
  { icon: micIcon,           top: "60%",  left: "28%",  size: "34px", delay: "-11s", duration: "22s", blur: "3px", opacity: 0.07 },
  { icon: plantIcon,         top: "65%",  right: "24%", size: "44px", delay: "-4s",  duration: "26s", blur: "0px", opacity: 0.15 },
  { icon: platerIcon,        top: "69%",  left: "15%",  size: "34px", delay: "-7s",  duration: "18s", blur: "1px", opacity: 0.12 },
  { icon: propIcon,          top: "74%",  right: "19%", size: "40px", delay: "-13s", duration: "24s", blur: "0px", opacity: 0.14 },
  { icon: ringIcon,          top: "78%",  left: "22%",  size: "32px", delay: "-16s", duration: "21s", blur: "3px", opacity: 0.08 },
  { icon: tableClothIcon,    top: "83%",  right: "16%", size: "38px", delay: "-3s",  duration: "25s", blur: "0px", opacity: 0.15 },
  { icon: teddyIcon,         top: "88%",  left: "14%",  size: "42px", delay: "-5s",  duration: "19s", blur: "1.5px", opacity: 0.11 },
  { icon: weddingIcon,       top: "93%",  right: "12%", size: "38px", delay: "-8s",  duration: "23s", blur: "0px", opacity: 0.14 },
  
  // Duplicates/Extras for more visual density and even timeline spacing
  { icon: balloonIcon,       top: "21%",  left: "29%",  size: "34px", delay: "-12s", duration: "22s", blur: "2px", opacity: 0.10 },
  { icon: lightIcon,         top: "39%",  right: "30%", size: "36px", delay: "-7s",  duration: "20s", blur: "0px", opacity: 0.13 },
  { icon: plantIcon,         top: "61%",  left: "30%",  size: "38px", delay: "-15s", duration: "24s", blur: "1.5px", opacity: 0.11 },
  { icon: teddyIcon,         top: "81%",  right: "31%", size: "34px", delay: "-9s",  duration: "18s", blur: "3px", opacity: 0.08 },
];

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
  proposal: ringIcon,
  marriage: weddingIcon,
  "bridal-shower": bridalIcon,
  "baby-shower": babyIcon,
  "holud": bridalIcon,
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
      {/* Glowing background orbs */}
      <div className={styles.floatingOrb1} />
      <div className={styles.floatingOrb2} />
      <div className={styles.floatingOrb3} />

      {/* Decorative Floating PNG Icons */}
      {FLOATING_ITEMS.map((item, idx) => (
        <img
          key={idx}
          src={item.icon}
          alt=""
          className={styles.floatingDecorIcon}
          style={{
            top: item.top,
            left: item.left || "auto",
            right: item.right || "auto",
            width: item.size,
            height: item.size,
            animationDelay: item.delay,
            animationDuration: item.duration,
            opacity: item.opacity,
            filter: `blur(${item.blur}) grayscale(10%) drop-shadow(0 2px 6px rgba(0,0,0,0.05))`
          }}
        />
      ))}

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
