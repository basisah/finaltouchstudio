import { useNavigate } from "react-router-dom";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";
import styles from "./OccasionsCarousel.module.css";

// Category icons
import birthdayIcon from "../../../assets/Icons/birthday-cake.png";
import marriageIcon from "../../../assets/Icons/wedding-couple.png";
import bridalIcon from "../../../assets/Icons/bridal-shower.png";
import babyIcon from "../../../assets/Icons/baby.png";
import managerIcon from "../../../assets/Icons/manager.png";

const categoryIcons = {
  birthday: birthdayIcon,
  marriage: marriageIcon,
  holud: bridalIcon,
  baby: babyIcon,
  global: managerIcon,
};

// Category accent colors matching inventory
const categoryColors = {
  birthday: { accent: "#E879A0", bg: "rgba(232, 121, 160, 0.08)", border: "rgba(232, 121, 160, 0.20)" },
  marriage: { accent: "#C084FC", bg: "rgba(192, 132, 252, 0.08)", border: "rgba(192, 132, 252, 0.20)" },
  holud:    { accent: "#FBBF24", bg: "rgba(251, 191, 36, 0.08)",  border: "rgba(251, 191, 36, 0.20)"  },
  baby:     { accent: "#818CF8", bg: "rgba(129, 140, 248, 0.08)", border: "rgba(129, 140, 248, 0.20)" },
  global:   { accent: "#BD7893", bg: "rgba(189, 120, 147, 0.08)", border: "rgba(189, 120, 147, 0.20)" },
};

// Item SVG icon components
const SignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" />
    <rect x="8" y="14" width="48" height="36" rx="4" stroke="#EC4899" />
    <path d="M16 28h32" stroke="#EAB308" /><path d="M24 38h16" stroke="#EAB308" />
    <path d="M12 14v-4h40v4" stroke="#64748B" />
  </svg>
);
const ArchIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 58V30C12 18 20 10 32 10s20 8 20 20v28Z" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" />
    <path d="M6 58h12M46 58h12" stroke="#64748B" />
    <circle cx="32" cy="10" r="3.5" fill="#EF4444" />
    <circle cx="18" cy="24" r="3.5" fill="#EC4899" />
    <circle cx="46" cy="24" r="3.5" fill="#EC4899" />
  </svg>
);
const WallIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="44" height="40" rx="2" fill="rgba(16,185,129,0.15)" stroke="#10B981" />
    <path d="M18 10v40M26 10v40M34 10v40M42 10v40" stroke="#34D399" strokeDasharray="3 3" />
    <path d="M10 50h44" stroke="#047857" />
  </svg>
);
const FurnitureIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="12" width="28" height="22" fill="rgba(244,63,94,0.15)" stroke="#F43F5E" />
    <path d="M12 34h40v6H12z" stroke="#D97706" fill="rgba(251,191,36,0.2)" />
    <path d="M16 40v14M48 40v14" stroke="#D97706" />
  </svg>
);
const CakeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="26" width="32" height="18" fill="rgba(245,208,254,0.3)" stroke="#D946EF" />
    <path d="M12 44h40v10H12z" stroke="#6366F1" fill="rgba(99,102,241,0.15)" />
    <path d="M22 12h20v14H22z" stroke="#EC4899" fill="rgba(236,72,153,0.2)" />
    <path d="M32 4v8" stroke="#F59E0B" />
  </svg>
);
const FloralIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="24" r="5" fill="#FBBF24" stroke="#FBBF24" />
    <circle cx="20" cy="24" r="4.5" fill="#EF4444" /><circle cx="44" cy="24" r="4.5" fill="#EF4444" />
    <circle cx="32" cy="12" r="4.5" fill="#EC4899" /><circle cx="32" cy="36" r="4.5" fill="#EC4899" />
    <path d="M32 42v16" stroke="#10B981" /><path d="M22 58h20" stroke="#10B981" />
  </svg>
);
const LightingIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="20" r="10" fill="rgba(253,224,71,0.3)" stroke="#EAB308" />
    <path d="M32 30v18" stroke="#D97706" /><path d="M20 48h24" stroke="#D97706" />
    <circle cx="32" cy="20" r="2" fill="#EF4444" />
  </svg>
);
const DalaIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="32" cy="36" rx="24" ry="16" fill="rgba(251,191,36,0.2)" stroke="#D97706" />
    <path d="M14 24l8-16h20l8 16" stroke="#16A34A" fill="rgba(22,163,74,0.1)" />
  </svg>
);
const AisleIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10L6 54h52L44 10Z" fill="rgba(220,38,38,0.15)" stroke="#DC2626" />
    <rect x="2" y="44" width="8" height="10" rx="1" fill="#EAB308" stroke="#D97706" />
    <rect x="54" y="44" width="8" height="10" rx="1" fill="#EAB308" stroke="#D97706" />
  </svg>
);
const AudioIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="8" width="32" height="48" rx="4" fill="rgba(79,70,229,0.12)" stroke="#4F46E5" />
    <circle cx="32" cy="20" r="6" stroke="#4F46E5" />
    <circle cx="32" cy="42" r="10" stroke="#06B6D4" fill="rgba(6,182,212,0.1)" />
    <circle cx="32" cy="42" r="4" fill="#06B6D4" />
  </svg>
);
const TablewareIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="18" fill="rgba(13,148,136,0.15)" stroke="#0D9488" />
    <circle cx="32" cy="32" r="12" stroke="#0D9488" strokeDasharray="2 2" />
    <path d="M8 20v16c0 4 3 8 3 8v10M56 16v38M50 16v12h6" stroke="#475569" />
  </svg>
);
const SpecialIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="22" r="12" fill="rgba(236,72,153,0.15)" stroke="#EC4899" />
    <circle cx="18" cy="18" r="2.5" fill="#3B82F6" />
    <circle cx="16" cy="38" r="2" fill="#10B981" />
  </svg>
);

const getSvgIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("neon") || t.includes("sign") || t.includes("board") || t.includes("number") || t.includes("letter") || t.includes("block")) return <SignIcon />;
  if (t.includes("arch") || t.includes("frame") || t.includes("ring")) return <ArchIcon />;
  if (t.includes("wall") || t.includes("curtain") || t.includes("drap") || t.includes("backdrop") || t.includes("mandap")) return <WallIcon />;
  if (t.includes("chair") || t.includes("sofa") || t.includes("throne") || t.includes("bench") || t.includes("mattress") || t.includes("plinth") || t.includes("pedestal") || t.includes("table") || t.includes("stool")) return <FurnitureIcon />;
  if (t.includes("cake") || t.includes("cupcake") || t.includes("tower") || t.includes("platter") || t.includes("jar") || t.includes("sweet") || t.includes("display")) return <CakeIcon />;
  if (t.includes("flower") || t.includes("floral") || t.includes("blossom") || t.includes("tree") || t.includes("marigold")) return <FloralIcon />;
  if (t.includes("light") || t.includes("candle") || t.includes("candelabra") || t.includes("led") || t.includes("lamp") || t.includes("lantern")) return <LightingIcon />;
  if (t.includes("dala") || t.includes("tray") || t.includes("kula") || t.includes("umbrella")) return <DalaIcon />;
  if (t.includes("carpet") || t.includes("runner") || t.includes("pillar") || t.includes("aisle")) return <AisleIcon />;
  if (t.includes("speaker") || t.includes("audio") || t.includes("sound")) return <AudioIcon />;
  if (t.includes("plate") || t.includes("napkin") || t.includes("cutlery") || t.includes("dish") || t.includes("dispenser")) return <TablewareIcon />;
  return <SpecialIcon />;
};

export default function OccasionsCarousel() {
  const navigate = useNavigate();

  return (
    <section className={styles.section} id="catalog">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Our Catalog</h2>
        <p className={styles.sectionSub}>Browse items by category — click any item to book</p>
      </div>

      {INVENTORY_CATEGORIES.map((category) => {
        const colors = categoryColors[category.id] || categoryColors.global;
        const icon = categoryIcons[category.id];

        return (
          <div 
            key={category.id} 
            className={styles.categoryBlock}
            style={{ "--category-color": colors.accent }}
          >
            {/* Category Header */}
            <div className={styles.categoryHeader}>
              {icon && <img src={icon} alt="" className={styles.catIcon} />}
              <h3
                className={styles.categoryTitle}
                style={{ color: colors.accent }}
              >
                {category.label}
              </h3>
              <button
                className={styles.viewAllBtn}
                style={{ color: colors.accent, borderColor: colors.border }}
                onClick={() => navigate(`/items?category=${category.id}`)}
              >
                View All →
              </button>
            </div>

            {/* Items Grid Layout - matches ItemsPage */}
            <div className={styles.gridContainer}>
              {category.subcategories?.map((subcat) => (
                <div
                  key={subcat.id}
                  className={styles.gridItem}
                  onClick={() => navigate(`/items?category=${category.id}&subcategory=${subcat.id}`)}
                >
                  <div className={styles.circleCard} style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                    <span className={styles.subcatEmoji}>{subcat.emoji}</span>
                  </div>
                  <div className={styles.cardLabelWrapper}>
                    <span className={styles.cardLabel}>{subcat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
