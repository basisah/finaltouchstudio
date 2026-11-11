import { Card, Section, SectionHeading, CheckIcon, StoreIcon, TruckIcon } from "../../../components/ui";
import { HOW_IT_WORKS } from "../../../constants/landing";
import styles from "../LandingPage.module.css";

const FULFILMENT = [
  {
    Icon: StoreIcon,
    title: "Studio pickup",
    price: "Free",
    text: "Collect from our Saskatoon studio. Everything is packed, labelled and ready to load.",
    points: ["Same-day pickup for orders before noon", "Setup guide included with every piece", "Protective cases and crates"],
  },
  {
    Icon: TruckIcon,
    title: "Venue delivery",
    price: "From $25",
    text: "Our crew delivers to your home or venue and collects afterwards, so you can enjoy the day.",
    points: ["Saskatoon and surrounding area", "Timed to your venue access window", "Optional on-site setup"],
  },
];

export default function HowItWorks() {
  return (
    <Section id="delivery" tone="alt" aria-label="How renting works">
      <SectionHeading center eyebrow="Simple from start to finish" title="How renting works" />

      <ol className={styles.steps}>
        {HOW_IT_WORKS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </li>
        ))}
      </ol>

      <div className={styles.fulfilmentGrid}>
        {FULFILMENT.map(({ Icon, title, price, text, points }) => (
          <Card key={title} padded className={styles.fulfilmentCard}>
            <div className={styles.fulfilmentHead}>
              <span className={styles.fulfilmentIcon}>
                <Icon width={24} height={24} />
              </span>
              <div>
                <h3 className={styles.fulfilmentTitle}>{title}</h3>
                <span className={styles.fulfilmentPrice}>{price}</span>
              </div>
            </div>
            <p className={styles.fulfilmentText}>{text}</p>
            <ul className={styles.checkList}>
              {points.map((point) => (
                <li key={point}>
                  <CheckIcon width={16} height={16} />
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}
