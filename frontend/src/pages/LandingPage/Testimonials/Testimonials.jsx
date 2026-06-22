import React from "react";
import styles from "./Testimonials.module.css";

const TESTIMONIALS = [
  {
    quote: "FinalTouch transformed our reception stage into an absolute fairytale! The floral arch was gorgeous and the team was incredibly professional and detailed.",
    author: "Sarah M.",
    role: "Bride",
    rating: 5,
    initials: "SM",
  },
  {
    quote: "We ordered the proposal package and everything was set up perfectly. The fairy lights, custom signs, and staging made our moment truly unforgettable.",
    author: "David K.",
    role: "Groom",
    rating: 5,
    initials: "DK",
  },
  {
    quote: "The custom balloon wall and stage setup were a massive hit at my daughter's birthday. The process was stress-free and the design was stunning.",
    author: "Aaliyah R.",
    role: "Host",
    rating: 5,
    initials: "AR",
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section} aria-label="Client testimonials">
      <div className={styles.container}>
        <div className={styles.header}>

          <h2 className={styles.heading}>Words From Our Clients</h2>
          <p className={styles.subheading}>
            Real stories from beautiful celebrations staged by FinalTouch Studio.
          </p>
        </div>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.rating}>
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <span key={idx} className={styles.star}>★</span>
                ))}
              </div>
              <p className={styles.quote}>"{t.quote}"</p>
              <div className={styles.clientInfo}>
                <div className={styles.avatar}>{t.initials}</div>
                <div className={styles.meta}>
                  <h4 className={styles.author}>{t.author}</h4>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
