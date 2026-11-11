import { useEffect, useState } from "react";
import { get } from "../../../api/client";
import { Container } from "../../../components/ui";
import styles from "../LandingPage.module.css";

const plus = (n) => (n > 15 ? `${n}+` : String(n));

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    get("/stats")
      .then((data) => active && setStats(data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const figures = [
    { value: stats?.totalItems ? plus(stats.totalItems) : "40+", label: "Rental pieces", note: "Arches, florals, lighting & more" },
    { value: "2026", label: "Established", note: "Proudly based in Saskatoon" },
    { value: "7", label: "Occasions covered", note: "Weddings to corporate galas" },
    { value: "100%", label: "Cleaned & checked", note: "Before every single rental" },
  ];

  return (
    <section className={styles.stats} aria-label="FinalTouch Studio in numbers">
      <Container>
        <dl className={styles.statsGrid}>
          {figures.map((figure) => (
            <div key={figure.label} className={styles.stat}>
              <dt className={styles.statLabel}>{figure.label}</dt>
              <dd className={styles.statValue}>{figure.value}</dd>
              <dd className={styles.statNote}>{figure.note}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
