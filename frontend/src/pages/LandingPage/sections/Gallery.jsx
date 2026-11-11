import ItemImage from "../../../components/catalog/ItemImage";
import { Section, SectionHeading } from "../../../components/ui";
import { GALLERY } from "../../../constants/landing";
import styles from "../LandingPage.module.css";

export default function Gallery() {
  return (
    <Section id="gallery" aria-label="Our work">
      <SectionHeading center eyebrow="Recent setups" title="Our work" lead="A look at celebrations we have styled around the city." />

      <div className={styles.gallery}>
        {GALLERY.map((shot) => (
          <figure key={shot.title} className={styles.galleryItem}>
            <ItemImage src={shot.image} alt={shot.title} width={800} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px" />
            <figcaption className={styles.galleryCaption}>
              <span className={styles.galleryTag}>{shot.tag}</span>
              <span className={styles.galleryTitle}>{shot.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
