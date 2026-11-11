import { Link } from "react-router-dom";
import ItemImage from "../../../components/catalog/ItemImage";
import { ArrowRightIcon, Section, SectionHeading, Skeleton } from "../../../components/ui";
import { DEFAULT_OCCASION_IMAGE, OCCASION_IMAGES } from "../../../constants/landing";
import styles from "../LandingPage.module.css";

export default function Occasions({ categories, loading }) {
  return (
    <Section id="occasions" aria-label="Browse by occasion">
      <SectionHeading
        center
        eyebrow="What are you celebrating?"
        title="Browse by occasion"
        lead="Each collection is curated for its celebration, from the ceremony arch to the last table detail."
      />

      <div className={styles.occasionGrid}>
        {loading
          ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className={styles.occasionCard} height="auto" radius="var(--radius-lg)" />)
          : categories.map((cat) => (
              <Link key={cat.id} to={`/items?category=${cat.id}`} className={styles.occasionCard}>
                <ItemImage
                  src={cat.image_url || OCCASION_IMAGES[cat.id] || DEFAULT_OCCASION_IMAGE}
                  alt=""
                  width={700}
                  sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 380px"
                />
                <span className={styles.occasionShade} aria-hidden="true" />
                <span className={styles.occasionBody}>
                  <span className={styles.occasionTitle}>{cat.label}</span>
                  {cat.description && <span className={styles.occasionText}>{cat.description}</span>}
                  <span className={styles.occasionLink}>
                    Explore <ArrowRightIcon width={16} height={16} />
                  </span>
                </span>
              </Link>
            ))}
      </div>
    </Section>
  );
}
