import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCatalogPackages } from "../../../api/catalog.api";
import ItemImage from "../../../components/catalog/ItemImage";
import { ArrowRightIcon, Section, SectionHeading } from "../../../components/ui";
import { DEFAULT_OCCASION_IMAGE, OCCASION_IMAGES } from "../../../constants/landing";
import { formatPrice } from "../../../utils/format";
import styles from "../LandingPage.module.css";

export default function Packages() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    let active = true;
    getCatalogPackages()
      .then((data) => active && setPackages(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (packages.length === 0) return null;

  return (
    <Section id="packages" aria-label="Styled packages">
      <SectionHeading
        center
        eyebrow="Styled for you"
        title="Ready-made packages"
        lead="Our stylists have paired the pieces that work best together. Book the full look, or remove anything you already have."
      />

      <div className={styles.packageGrid}>
        {packages.map((pkg) => (
          <Link key={pkg.id} to={`/package/${pkg.id}`} className={styles.packageCard}>
            <span className={styles.packageMedia}>
              <ItemImage
                src={pkg.image || OCCASION_IMAGES[pkg.category_id] || DEFAULT_OCCASION_IMAGE}
                alt=""
                width={700}
                sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 380px"
              />
            </span>
            <span className={styles.packageBody}>
              <span className={styles.packageMeta}>
                {pkg.items?.length || 0} {pkg.items?.length === 1 ? "piece" : "pieces"} included
              </span>
              <span className={styles.packageTitle}>{pkg.name}</span>
              {pkg.description && <span className={styles.packageText}>{pkg.description}</span>}
              <span className={styles.packageFooter}>
                <span className={styles.packagePrice}>
                  <small>from</small> {formatPrice(pkg.price)}
                </span>
                <span className={styles.packageLink}>
                  Customise <ArrowRightIcon width={16} height={16} />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
