import React, { useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./AboutPage.module.css";
import khaledPhoto from "../../assets/About/KhaledNehal.png";

// Category icons served from backend
const ICONS = {
  baby: "/uploads/Icons/Category/baby.png",
  birthday: "/uploads/Icons/Category/birthday-cake.png",
  bridal: "/uploads/Icons/Category/bridal-shower.png",
  bride: "/uploads/Icons/Category/bride.png",
  couple: "/uploads/Icons/Category/couple.png",
  manager: "/uploads/Icons/Category/manager.png",
  ring: "/uploads/Icons/Category/ring.png",
  wedding: "/uploads/Icons/Category/wedding-couple.png",
};

const SERVICES = [
  { icon: ICONS.wedding, title: "Wedding Stages", desc: "Grand luxury backdrops and full stage setups for wedding ceremonies and receptions." },
  { icon: ICONS.ring, title: "Romantic Proposals", desc: "Secret fairy-light proposal setups in parks, rooftops, and private venues across Saskatoon." },
  { icon: ICONS.birthday, title: "Birthday Parties", desc: "Custom balloon arches, walls, and themed backdrops for birthdays of all ages." },
  { icon: ICONS.bridal, title: "Bridal Showers", desc: "Elegant floral curtains, florals, and bridal shower stages tailored to your style." },
  { icon: ICONS.baby, title: "Baby Showers", desc: "Sweet, themed baby shower setups with coordinated colour palettes and props." },
  { icon: ICONS.couple, title: "Corporate Events", desc: "Professional event staging and décor for corporate gatherings and milestones." },
];

export default function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>

        {/* ── Hero: left text / right photo + splash ── */}
        <section className={styles.hero3d}>

          {/* Left */}
          <div className={styles.heroLeft}>
            <span className={styles.heroEyebrow}>Saskatoon's Premier Event Studio</span>
            <h1 className={styles.heroTitle}>
              FINAL<span className={styles.heroTitleOutline}>TOUCH</span><br />
              STUDIO
            </h1>
            <p className={styles.heroDesc}>
              Transforming blank spaces into breathtaking luxury settings from intimate proposals to grand wedding stages.
              Proudly rooted in Saskatoon, SK.
            </p>
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroBadge}>📍 Saskatoon, SK</span>
              <span className={styles.heroBadge}>✦ Premium Rentals</span>
              <span className={styles.heroBadge}>🚚 Easy Pickup</span>
            </div>
          </div>

          {/* Right — CSS splash + portrait */}
          <div className={styles.heroRight}>
            {/* Layered CSS watercolour splash */}
            <div className={styles.splashBg} aria-hidden="true">
              <div className={styles.splashLayer1}></div>
              <div className={styles.splashLayer2}></div>
              <div className={styles.splashLayer3}></div>
            </div>
            <img src={khaledPhoto} alt="Khaled Nehal — Founder" className={styles.personPhoto} />
            <div className={styles.nameBadge}>
              <span className={styles.nameText}>KHALED NEHAL</span>
              <span className={styles.nameRole}>Founder &amp; Lead Decorator</span>
            </div>
          </div>

        </section>

        {/* ── Our Story ── */}
        <section className={styles.storySection}>
          <div className={styles.storyInner}>
            <div className={styles.storyText}>
              <span className={styles.sectionLabel}>Our Story</span>
              <h2 className={styles.storyTitle}>Born in Saskatoon,<br />Built for Your Moments</h2>
              <p>
                FinalTouch Studio started with one simple belief every event deserves to look extraordinary.
                Founded in Saskatoon, Saskatchewan, we began by styling intimate proposals and small gatherings,
                growing into a full-service event décor and rental studio trusted across the city.
              </p>
              <p>
                We combine structural backdrop engineering, artisan floral curation, and custom lighting
                to create immersive spaces that feel premium, personal, and unforgettable.
                Whether you're planning a wedding for 300 or a surprise proposal for two we bring the vision to life.
              </p>
            </div>
          </div>
        </section>

        {/* ── Services We Cover ── */}
        <section className={styles.servicesSection}>
          <div className={styles.servicesSectionInner}>
            <span className={styles.sectionLabel}>What We Do</span>
            <h2 className={styles.servicesTitle}>Events We Specialize In</h2>
            <p className={styles.servicesSubtitle}>
              From weddings to birthdays, we handle every detail so you can be fully present in your moment.
            </p>
            <div className={styles.servicesGrid}>
              {SERVICES.map((s) => (
                <div key={s.title} className={styles.serviceCard}>
                  <div className={styles.serviceIconWrap}>
                    <img src={s.icon} alt={s.title} className={styles.serviceIcon} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className={styles.processSection}>
          <div className={styles.processInner}>
            <span className={styles.sectionLabel}>The Rental Process</span>
            <h2 className={styles.processTitle}>Simple. Affordable. Stress-Free.</h2>
            <div className={styles.processSteps}>
              <div className={styles.processStep}>
                <div className={styles.stepNum}>01</div>
                <h4>Browse &amp; Book</h4>
                <p>Explore our full rental catalogue and reserve your items online in minutes.</p>
              </div>
              <div className={styles.processArrow}>→</div>
              <div className={styles.processStep}>
                <div className={styles.stepNum}>02</div>
                <h4>Pickup or Delivery</h4>
                <p>Pick up from our Saskatoon studio or choose convenient venue delivery — we make it easy.</p>
              </div>
              <div className={styles.processArrow}>→</div>
              <div className={styles.processStep}>
                <div className={styles.stepNum}>03</div>
                <h4>Enjoy Your Day</h4>
                <p>Show up to a stunning, fully set space. We handle everything so you just enjoy the moment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom strip ── */}
        <section className={styles.bizStrip}>
          <div className={styles.bizStripInner}>
            <div className={styles.bizTag}>
              <span className={styles.bizIcon}>📍</span>
              <div>
                <strong>Based in Saskatoon, SK</strong>
                <span>Serving Saskatoon &amp; surrounding areas</span>
              </div>
            </div>
            <div className={styles.bizDivider}></div>
            <div className={styles.bizTag}>
              <span className={styles.bizIcon}>✦</span>
              <div>
                <strong>Premium Rental Service</strong>
                <span>Backdrops, florals &amp; custom stage setups</span>
              </div>
            </div>
            <div className={styles.bizDivider}></div>
            <div className={styles.bizTag}>
              <span className={styles.bizIcon}>🚚</span>
              <div>
                <strong>Easy Pickup &amp; Delivery</strong>
                <span>Stress-free studio pickup or venue delivery</span>
              </div>
            </div>
            <div className={styles.bizDivider}></div>
            <div className={styles.bizTag}>
              <span className={styles.bizIcon}>💜</span>
              <div>
                <strong>100% Satisfaction</strong>
                <span>Every event styled with care and precision</span>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
