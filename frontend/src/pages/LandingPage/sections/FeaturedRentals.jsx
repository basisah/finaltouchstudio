import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../../../components/catalog/ProductCard";
import { ArrowRightIcon, Button, Section, SectionHeading } from "../../../components/ui";
import styles from "../LandingPage.module.css";

const FEATURED_COUNT = 8;

/** Picks items round-robin across categories so every occasion is represented. */
function pickFeatured(items) {
  const byCategory = new Map();
  for (const item of items) {
    if (!byCategory.has(item.categoryId)) byCategory.set(item.categoryId, []);
    byCategory.get(item.categoryId).push(item);
  }
  const queues = [...byCategory.values()];
  const picked = [];
  for (let round = 0; picked.length < FEATURED_COUNT && queues.some((q) => q.length > round); round++) {
    for (const queue of queues) {
      if (queue[round] && picked.length < FEATURED_COUNT) picked.push(queue[round]);
    }
  }
  return picked;
}

export default function FeaturedRentals({ items, categories, loading }) {
  const navigate = useNavigate();
  const featured = useMemo(() => pickFeatured(items), [items]);
  const labels = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.label])), [categories]);

  if (!loading && featured.length === 0) return null;

  return (
    <Section tone="alt" aria-label="Featured rentals">
      <div className={styles.splitHeading}>
        <SectionHeading eyebrow="The collection" title="Guest favourites" lead="A few of the pieces our clients book most often." />
        <Button to="/items" variant="secondary">
          View all rentals <ArrowRightIcon />
        </Button>
      </div>

      <div className={styles.productGrid}>
        {loading
          ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
          : featured.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                categoryLabel={labels[item.categoryId]}
                onRent={(picked) => navigate(`/item/${picked.id}`)}
              />
            ))}
      </div>
    </Section>
  );
}
