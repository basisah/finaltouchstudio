import React, { useState, useEffect } from "react";
import styles from "./Testimonials.module.css";

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load reviews:", err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className={styles.section} aria-label="Client testimonials">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Words From Our Clients</h2>
          <p className={styles.subheading}>
            Real stories from beautiful celebrations staged by FinalTouch Studio.
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingReviews}>
            <div className={styles.spinner} />
            <p>Loading client stories...</p>
          </div>
        ) : reviews.length === 0 ? (
          <p className={styles.noReviews}>No client reviews submitted yet.</p>
        ) : (
          <div className={styles.grid}>
            {reviews.map((r, i) => (
              <div key={r.id || i} className={styles.card}>
                <div className={styles.rating}>
                  {Array.from({ length: r.rating || 5 }).map((_, idx) => (
                    <span key={idx} className={styles.star}>★</span>
                  ))}
                </div>
                <p className={styles.quote}>"{r.comment}"</p>
                <div className={styles.clientInfo}>
                  <div className={styles.avatar}>{getInitials(r.customer_name)}</div>
                  <div className={styles.meta}>
                    <h4 className={styles.author}>{r.customer_name}</h4>
                    <span className={styles.role}>{r.role || "Client"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
