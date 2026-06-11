import React, { useState, useRef } from "react";
import { GALLERY_ITEMS, SOCIAL_POSTS } from "../../../constants/categories";
import styles from "./Gallery.module.css";

/* ── Inline SVG social platform icons ──────────────────────────────────────── */
const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
  </svg>
);
const FbIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
  </svg>
);
const YtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
    <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/>
  </svg>
);
const TkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/>
  </svg>
);
const PtIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

const PLATFORM_META = {
  instagram: { Icon: IgIcon, color: "#E1306C", label: "Instagram" },
  facebook:  { Icon: FbIcon, color: "#1877F2", label: "Facebook"  },
  whatsapp:  { Icon: WaIcon, color: "#25D366", label: "WhatsApp"  },
  youtube:   { Icon: YtIcon, color: "#FF0000", label: "YouTube"   },
  tiktok:    { Icon: TkIcon, color: "#4F46E5", label: "TikTok"    },
  pinterest: { Icon: PtIcon, color: "#E60023", label: "Pinterest"  },
};

const DEMO_POSTS = [
  { ...SOCIAL_POSTS[0], platform: "instagram" },
  { ...SOCIAL_POSTS[1], platform: "facebook"  },
  { ...SOCIAL_POSTS[2], platform: "instagram" },
  { ...SOCIAL_POSTS[3], platform: "tiktok"    },
  { ...SOCIAL_POSTS[4], platform: "youtube"   },
  { ...SOCIAL_POSTS[5], platform: "pinterest" },
];

const FILTERS = ["All", "holud", "white", "birthday", "reception", "bridal-shower", "mayoun"];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const trackRef = useRef(null);

  const visible = filter === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((g) => g.category === filter);

  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section id="gallery" className={styles.section} aria-label="Our work and social proof">
      <div className={styles.inner}>
        {/* PART 1: Past Projects */}
        <div className={styles.subsection}>
          <p className={styles.eyebrow}>Our Work</p>
          <h2 className={styles.heading}>Past Projects</h2>
          <p className={styles.sub}>Each setup is crafted with care and a passion for perfection.</p>

          {/* Filter tabs */}
          <div className={styles.filters} role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "All" ? "All Projects" : f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {visible.map((item) => (
              <div key={item.id} className={styles.card}>
                {item.img ? (
                  <img src={item.img} alt={item.title} className={styles.img} loading="lazy" />
                ) : (
                  <div className={styles.placeholder}>
                    <span className={styles.placeholderLabel}>{item.title}</span>
                  </div>
                )}
                <div className={styles.cardOverlay}>
                  <span className={styles.cardTag}>{item.category.replace("-", " ")}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic section divider line */}
        <div className={styles.sectionDivider}></div>

        {/* PART 2: Loved on Social Media */}
        <div className={styles.subsection} style={{ width: "100%" }}>
          <div className={styles.socialHeader}>
            <div>
              <p className={styles.eyebrow}>Follow Our Journey</p>
              <h2 className={styles.heading} style={{ textAlign: "left" }}>Loved on Social Media</h2>
            </div>
            <div className={styles.controls}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.igBtn}>
                <IgIcon /> @finaltouchstudio
              </a>
              <div className={styles.arrows}>
                <button className={styles.arrow} onClick={() => scroll(-1)} aria-label="Previous">‹</button>
                <button className={styles.arrow} onClick={() => scroll(1)} aria-label="Next">›</button>
              </div>
            </div>
          </div>

          <div className={styles.track} ref={trackRef}>
            {DEMO_POSTS.map((post, i) => {
              const meta = PLATFORM_META[post.platform] || PLATFORM_META.instagram;
              const { Icon } = meta;
              return (
                <div key={post.id} className={styles.socialCard}>
                  {/* Post image placeholder */}
                  <div className={styles.postImg} style={{ "--post-hue": i * 40 }}>
                    <span className={styles.postCameraIcon}>📸</span>
                  </div>
                  {/* Platform badge */}
                  <div className={styles.platformBadge} style={{ background: meta.color }}>
                    <Icon />
                  </div>
                  <div className={styles.postBody}>
                    <div className={styles.postMeta}>
                      <div className={styles.platformRow}>
                        <span className={styles.platformIcon} style={{ color: meta.color }}><Icon /></span>
                        <span className={styles.platformLabel}>{meta.label}</span>
                      </div>
                      <span className={styles.handle}>{post.handle}</span>
                    </div>
                    <p className={styles.postTag}>{post.tag}</p>
                    <div className={styles.postStats}>
                      <span>❤️ {post.likes} likes</span>
                      <span>View →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Platform icon row */}
          <div className={styles.platformRow2}>
            {Object.entries(PLATFORM_META).map(([key, { Icon, color, label }]) => (
              <div key={key} className={styles.platformChip} style={{ "--p-color": color }}>
                <span style={{ color }}><Icon /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p className={styles.followCta}>
            Follow us for daily inspiration →{" "}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">@finaltouchstudio</a>
          </p>
        </div>
      </div>
    </section>
  );
}
