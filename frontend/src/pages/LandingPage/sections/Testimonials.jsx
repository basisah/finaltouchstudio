import { Card, Section, SectionHeading, StarIcon } from "../../../components/ui";
import { TESTIMONIALS } from "../../../constants/landing";
import styles from "../LandingPage.module.css";

const initials = (name) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Testimonials() {
  return (
    <Section tone="alt" aria-label="Client testimonials">
      <SectionHeading center eyebrow="Kind words" title="From our clients" />

      <div className={styles.testimonialGrid}>
        {TESTIMONIALS.map((item) => (
          <Card as="figure" padded key={item.author} className={styles.testimonial}>
            <div className={styles.stars} role="img" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} width={16} height={16} />
              ))}
            </div>
            <blockquote className={styles.quote}>“{item.quote}”</blockquote>
            <figcaption className={styles.author}>
              <span className={styles.authorAvatar} aria-hidden="true">
                {initials(item.author)}
              </span>
              <span>
                <span className={styles.authorName}>{item.author}</span>
                <span className={styles.authorRole}>{item.role}</span>
              </span>
            </figcaption>
          </Card>
        ))}
      </div>
    </Section>
  );
}
