import React, { useEffect, useState } from "react";
import styles from "./StatsSection.module.css";

export default function StatsSection() {
  const [statsData, setStatsData] = useState({
    totalItems: 250,
    totalUsers: 500,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setStatsData({
          totalItems: data.totalItems || 250,
          totalUsers: data.totalUsers || 500,
        });
      })
      .catch((err) => {
        console.warn("Could not fetch real stats, using placeholders:", err);
      });
  }, []);

  const itemsValue = statsData.totalItems > 15 ? `${statsData.totalItems}+` : statsData.totalItems;
  const customersValue = statsData.totalUsers > 15 ? `${statsData.totalUsers}+` : statsData.totalUsers;

  const STATS = [
    {
      value: itemsValue,
      label: "Total Items",
      desc: "Premium backdrops & custom props",
    },
    {
      value: customersValue,
      label: "Customers Served",
      desc: "Registered users & active clients",
    },
    {
      value: "2026",
      label: "Since 2026",
      desc: "Staging beautiful memories",
    },
    {
      value: "100%",
      label: "Satisfaction",
      desc: "Flawless events & setups",
    },
  ];

  return (
    <section className={styles.section} aria-label="Our milestones and stats">
      <div className={styles.container}>
        <div className={styles.grid}>
          {STATS.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statDesc}>{stat.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
