import { CATEGORIES } from "../../../constants/categories";
import styles from "./CategorySection.module.css";

// Import category images
import birthdayImg from "../../../assets/Category/Birthday_stage.jpg";
import proposalImg from "../../../assets/Category/Proposal_Stage.jpg";
import marriageImg from "../../../assets/Category/Marriage_Stage.jpg";
import bridalImg from "../../../assets/images/gallery_wedding.png";
import babyImg from "../../../assets/images/gallery_holud.png";

const categoryImages = {
  birthday: birthdayImg,
  proposal: proposalImg,
  marriage: marriageImg,
  "bridal-shower": bridalImg,
  "baby-shower": babyImg,
};

export default function CategorySection() {
  return (
    <section className={styles.section} aria-label="Event categories">
      <div className={styles.header}>
        <p className={styles.eyebrow}>What are you celebrating?</p>
        <h2 className={styles.heading}>Browse by Occasion</h2>
      </div>

      <div className={styles.timeline}>
        {[
          "proposal",
          "bridal-shower",
          "marriage",
          "baby-shower",
          "birthday"
        ].map((catId, index) => {
          const cat = CATEGORIES.find(c => c.id === catId);
          if (!cat) return null;
          
          const isEven = index % 2 === 0;
          const imgUrl = categoryImages[cat.id];
          const isLast = index === 4;

          let description = "Bespoke setups and decorations.";
          if (cat.id === "birthday") description = "Bespoke balloon walls, kids themes & customized stage setups for your special day.";
          else if (cat.id === "proposal") description = "Fairy lights, romantic floral arches & beautiful signs to make your moment perfect.";
          else if (cat.id === "marriage") description = "Exquisite wedding, holud & reception stages blending modern and traditional luxury.";
          else if (cat.id === "bridal-shower") description = "Elegant backdrops & photo-worthy floral arrangements for the bride to be.";
          else if (cat.id === "baby-shower") description = "Cute, colorful & magical themes for celebrating your little one.";

          return (
            <div key={cat.id} className={`${styles.row} ${isEven ? styles.rowEven : styles.rowOdd}`}>
              
              <div className={styles.imageCol}>
                <div className={styles.imageWrapper}>
                  {imgUrl && <img src={imgUrl} alt={cat.label} className={styles.circleImage} />}
                </div>
              </div>

              <div className={styles.textCol}>
                <div className={styles.textContent}>
                  <h3 className={styles.title}>{cat.label}</h3>
                  <p className={styles.subtitle}>Premium Setup</p>
                  <p className={styles.desc}>{description}</p>
                  
                  <div className={styles.linkWrapper}>
                    {isEven ? (
                      <>
                        <span className={styles.linkText}>catalog</span>
                        <span className={styles.linkLine}></span>
                        <span className={styles.linkCircle}></span>
                      </>
                    ) : (
                      <>
                        <span className={styles.linkCircle}></span>
                        <span className={styles.linkLine}></span>
                        <span className={styles.linkText}>catalog</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Wavery continuous SVG lines covering the row and reaching to the next */}
              <svg className={styles.rowSvg} viewBox="0 0 1000 630" preserveAspectRatio="none">
                {isEven ? (
                  <>
                    {/* Swoop deeply under the text to avoid crossing it */}
                    <path d="M 340 210 C 450 210, 660 400, 660 320" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />
                    {/* Loop outward to connect to the next image */}
                    {!isLast && <path d="M 660 320 C 850 320, 850 590, 660 590" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />}
                  </>
                ) : (
                  <>
                    {/* Swoop deeply under the text to avoid crossing it */}
                    <path d="M 660 210 C 550 210, 340 400, 340 320" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />
                    {/* Loop outward to connect to the next image */}
                    {!isLast && <path d="M 340 320 C 150 320, 150 590, 340 590" fill="none" stroke="#D8BCC4" strokeWidth="1.5" />}
                  </>
                )}
              </svg>

            </div>
          );
        })}
      </div>
    </section>
  );
}
