import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./BuildPage.module.css";
import { get } from "../../api/client";

// Toggle preview mode: if true, anyone can view all items. If false, it locks for users without purchases.
const ENABLE_PREVIEW_MODE = true;

// Predefined assembly instructions generator based on category/title keyword mapping
const getAssemblyGuideForItem = (item) => {
  const title = (item.title || "").toLowerCase();
  
  if (title.includes("arch") || title.includes("frame") || title.includes("ring")) {
    return {
      time: "15-20 mins",
      difficulty: "Medium",
      difficultyColor: "#EAB308",
      tools: ["Wrench (Included)", "Base Weights (Recommended)", "Cable Ties"],
      parts: [
        "4x Curved Metal Tube Segments",
        "2x Heavy Metal T-Bases",
        "8x Hex Locking Screws",
        "1x Assembly Instruction Sheet"
      ],
      steps: [
        {
          num: 1,
          title: "Inspect and Layout",
          desc: "Clear a flat, clean area on the floor. Lay out the 4 curved tube segments in a circle/arch shape to visualize the final structure."
        },
        {
          num: 2,
          title: "Connect the Segments",
          desc: "Slide the insert of segment A into the receiver of segment B. Align the screw holes. Insert the locking hex screws and tighten them using the provided wrench."
        },
        {
          num: 3,
          title: "Attach the Heavy Bases",
          desc: "Align the bottom segments of the assembled arch frame with the vertical slots on the T-Bases. Slide them down completely and tighten the safety bolts."
        },
        {
          num: 4,
          title: "Secure and Decorate",
          desc: "Stand the arch upright with two people. Place base weights (sandbags or metal plates) on the T-bases for wind stability. You are now ready to add floral arrangements or neon signs using cable ties!"
        }
      ]
    };
  }

  if (title.includes("wall") || title.includes("backdrop") || title.includes("curtain") || title.includes("mandap")) {
    return {
      time: "25-30 mins",
      difficulty: "Hard",
      difficultyColor: "#EF4444",
      tools: ["Step Stool / Ladder", "Sandbags (Required)", "Zip Ties / Pins"],
      parts: [
        "2x Telescopic Vertical Stand Pillars",
        "1x Extendable Horizontal Crossbar",
        "2x Heavy Flat Base Plates",
        "1x Backdrop Fabric / Flower Wall Panels"
      ],
      steps: [
        {
          num: 1,
          title: "Set up the Stand Bases",
          desc: "Place the heavy flat base plates on the floor where the backdrop will stand. Insert the vertical pillars into the base screws and screw them tightly until rigid."
        },
        {
          num: 2,
          title: "Prepare the Crossbar",
          desc: "Extend the horizontal crossbar to your desired width. If using a fabric backdrop, slide the pole pocket of the fabric sleeve onto the crossbar. If using panel frames, attach them side-by-side."
        },
        {
          num: 3,
          title: "Mount the Crossbar",
          desc: "With a helper, lift the horizontal crossbar and drop the locking ends into the top mounts of the vertical stands. Double-check that they are fully seated."
        },
        {
          num: 4,
          title: "Elevate and Secure",
          desc: "Raise the telescopic stands incrementally (alternating left and right sides) to your desired height. Lock each stand section. Place sandbags on the base plates for tip protection."
        }
      ]
    };
  }

  if (title.includes("neon") || title.includes("sign") || title.includes("light") || title.includes("led") || title.includes("lamp")) {
    return {
      time: "5-10 mins",
      difficulty: "Easy",
      difficultyColor: "#10B981",
      tools: ["S-Hooks / Hanging Chain", "DC Power Adapter (Included)", "Extension Cord"],
      parts: [
        "1x Acrylic LED Neon Signage",
        "1x DC 12V Power Adapter & Dimmer Remote",
        "2x Stainless Steel Hanging Chains with Hooks",
        "1x Safety Power Cable Clip"
      ],
      steps: [
        {
          num: 1,
          title: "Handle with Care",
          desc: "Remove the neon sign from its foam packaging. Always hold the sign by the acrylic backing plate, avoiding direct pulling force on the LED neon flex tube wires."
        },
        {
          num: 2,
          title: "Mount to Stand/Arch",
          desc: "Clip the hanging chains to the pre-drilled holes in the acrylic backing. Hang the sign onto your arch frame or backdrop crossbar using the S-hooks."
        },
        {
          num: 3,
          title: "Connect the Power Dimmer",
          desc: "Plug the sign's black output wire into the input jack of the Dimmer controller. Connect the Dimmer's output to the main DC power brick adapter."
        },
        {
          num: 4,
          title: "Power On and Adjust",
          desc: "Plug the AC cord into a socket. Use the dimmer remote to turn on the sign and select the desired brightness (we recommend 50% for indoor photography)."
        }
      ]
    };
  }

  if (title.includes("chair") || title.includes("sofa") || title.includes("table") || title.includes("plinth") || title.includes("pedestal")) {
    return {
      time: "5 mins",
      difficulty: "Easy",
      difficultyColor: "#10B981",
      tools: ["Microfiber Cloth (For dusting)"],
      parts: [
        "1x Cylindrical Plinth/Pedestal Shell",
        "1x Acrylic/Wooden Top Cover Plate",
        "1x Internal Support Ring (if nesting)"
      ],
      steps: [
        {
          num: 1,
          title: "Unpack and Wipe",
          desc: "Carefully pull the plinth/pedestal out of its padded transit sleeve. Wipe any surface dust using the dry microfiber cloth."
        },
        {
          num: 2,
          title: "Check Top Plate Alignment",
          desc: "Place the cylinder base upright on a level floor. Place the circular top cover plate onto the open lip of the cylinder, making sure it slots in flush."
        },
        {
          num: 3,
          title: "Position Accents",
          desc: "Arrange your cakes, desserts, floral bouquets, or showcase items on top. Ensure the load is centered rather than placed on the outer edge."
        }
      ]
    };
  }

  // Fallback for general items
  return {
    time: "5-10 mins",
    difficulty: "Easy",
    difficultyColor: "#10B981",
    tools: ["Microfiber Cloth"],
    parts: [
      "1x Staging Prop",
      "1x Carry Box / Transit Bag"
    ],
    steps: [
      {
        num: 1,
        title: "Unpack carefully",
        desc: "Gently unpack the prop from its packaging case or carrying sleeve."
      },
      {
        num: 2,
        title: "Verify stability",
        desc: "Place the prop on a solid, level surface. Ensure it stands steadily and is not prone to tipping."
      },
      {
        num: 3,
        title: "Clean and position",
        desc: "Lightly dust the item with a soft cloth. Place it in your custom backdrop scene for maximum visual effect."
      }
    ]
  };
};

export default function BuildPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'purchased' or 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    setIsLoggedIn(!!token);

    const loadData = async () => {
      try {
        // 1. Fetch all store items
        const allItems = await get("/items");
        setItems(allItems || []);

        // 2. Fetch user purchased items if authenticated
        if (token) {
          try {
            const orders = await get("/orders");
            const ids = new Set();
            
            if (orders && Array.isArray(orders)) {
              for (const order of orders) {
                // Fetch full order details to get its specific order items
                const orderDetails = await get(`/orders/${order.id}`);
                if (orderDetails && orderDetails.items) {
                  orderDetails.items.forEach(it => {
                    if (it.item_id) ids.add(it.item_id);
                  });
                }
              }
            }
            setPurchasedIds(ids);
            if (ids.size > 0) {
              setActiveTab("purchased");
            }
          } catch (orderErr) {
            console.warn("Could not load user orders:", orderErr);
          }
        }
      } catch (err) {
        setError("Failed to load build catalog items.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartBuild = (item) => {
    setSelectedItem(item);
    setCheckedSteps([]);
  };

  const handleToggleStep = (stepNum) => {
    setCheckedSteps(prev => {
      if (prev.includes(stepNum)) {
        return prev.filter(num => num !== stepNum);
      } else {
        return [...prev, stepNum];
      }
    });
  };

  // Filter items based on active tab and purchase verification status
  const displayedItems = (() => {
    if (activeTab === "purchased") {
      return items.filter(it => purchasedIds.has(it.id));
    }
    return items;
  })();

  const guide = selectedItem ? getAssemblyGuideForItem(selectedItem) : null;
  const progressPercent = guide 
    ? Math.round((checkedSteps.length / guide.steps.length) * 100) 
    : 0;

  // Render Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Loading Build Catalog…</p>
        </div>
      </div>
    );
  }

  // Render Error state
  if (error) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.errorWrapper}>
          <p className={styles.errorMsg}>{error}</p>
          <Link to="/" className={styles.shopBtn}>Back to Home</Link>
        </div>
      </div>
    );
  }

  // Lock Flow logic for non-purchased customers (when preview is turned off)
  const showLockScreen = !ENABLE_PREVIEW_MODE && (!isLoggedIn || purchasedIds.size === 0);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.container}>
        {/* Banner Section */}
        <section className={styles.banner}>
          <div>
            <span className={styles.badge}>Assembly Guides</span>
            <h1 className={styles.title}>FinalTouch Builder’s Hub</h1>
            <p className={styles.desc}>
              Step-by-step instructions, list of tools, and checklist tutorials to assemble your hired staging structures securely.
            </p>
          </div>
          <div className={styles.bannerOrb}>🛠️</div>
        </section>

        {showLockScreen ? (
          /* Locked screen for users with no purchases */
          <section className={styles.infoCard}>
            <span className={styles.infoIconLarge}>🔒</span>
            <h2 className={styles.infoTitle}>Build Instructions Locked</h2>
            <p className={styles.infoDesc}>
              {!isLoggedIn 
                ? "Please sign in to access assembly instructions for your booked staging rentals." 
                : "It looks like you don't have any completed rentals yet. Book your staging items to unlock their instructions!"
              }
            </p>
            {!isLoggedIn ? (
              <Link to="/login" className={styles.shopBtn}>Sign In / Register</Link>
            ) : (
              <Link to="/items" className={styles.shopBtn}>Browse Rentals</Link>
            )}
          </section>
        ) : selectedItem ? (
          /* Detailed interactive guide panel */
          <section className={styles.guidePanel}>
            <div className={styles.panelHeader}>
              <div>
                <button className={styles.backBtn} onClick={() => setSelectedItem(null)}>
                  ← Back to Items
                </button>
                <h2 className={styles.panelTitle} style={{ marginTop: "14px" }}>
                  How to Build: {selectedItem.title}
                </h2>
              </div>
              
              {/* Metrics Row */}
              <div className={styles.metricsRow}>
                <div className={styles.metricBlock}>
                  <span className={styles.metricValue}>{guide.time}</span>
                  <span className={styles.metricLabel}>Time</span>
                </div>
                <div className={styles.metricBlock}>
                  <span className={styles.metricValue} style={{ color: guide.difficultyColor }}>
                    {guide.difficulty}
                  </span>
                  <span className={styles.metricLabel}>Difficulty</span>
                </div>
              </div>
            </div>

            {/* Split Grid */}
            <div className={styles.guideGrid}>
              
              {/* Left Column: Tools & Parts & Interactive Progress */}
              <div className={styles.leftCol}>
                
                {/* Progress bar tracker */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span>Build Progress</span>
                    <span>{progressPercent}% Done</span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* Parts list */}
                <div>
                  <h3 className={styles.sectionTitle}>📦 Parts List</h3>
                  <ul className={styles.partsList}>
                    {guide.parts.map((part, idx) => (
                      <li key={idx} className={styles.partItem}>
                        <span className={styles.iconDot}>•</span>
                        {part}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools list */}
                <div>
                  <h3 className={styles.sectionTitle}>🔧 Tools Needed</h3>
                  <ul className={styles.toolsList}>
                    {guide.tools.map((tool, idx) => (
                      <li key={idx} className={styles.toolItem}>
                        <span className={styles.iconDot}>✓</span>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Step-by-Step checklist */}
              <div className={styles.stepsContainer}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: "8px" }}>
                  🛠️ Interactive Steps
                </h3>
                {guide.steps.map((step) => {
                  const isCompleted = checkedSteps.includes(step.num);
                  return (
                    <div
                      key={step.num}
                      className={`${styles.stepCard} ${isCompleted ? styles.stepCardCompleted : ""}`}
                      onClick={() => handleToggleStep(step.num)}
                    >
                      <div className={styles.stepCheckbox}>
                        ✓
                      </div>
                      <div className={styles.stepText}>
                        <span className={styles.stepNumber}>Step {step.num}</span>
                        <h4 className={styles.stepTitle}>{step.title}</h4>
                        <p className={styles.stepDesc}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        ) : (
          /* Catalog view of buildable items */
          <>
            {/* Tab Navigation if preview mode is on */}
            {ENABLE_PREVIEW_MODE && (
              <div className={styles.tabRow}>
                <button
                  className={`${styles.tabBtn} ${activeTab === "purchased" ? styles.activeTabBtn : ""}`}
                  onClick={() => setActiveTab("purchased")}
                >
                  🔒 Your Purchased Items ({purchasedIds.size})
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "all" ? styles.activeTabBtn : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  👁️ All Items (Preview Mode)
                </button>
              </div>
            )}

            {displayedItems.length === 0 ? (
              <section className={styles.infoCard}>
                <span className={styles.infoIconLarge}>🎪</span>
                <h2 className={styles.infoTitle}>No Staging Items Found</h2>
                <p className={styles.infoDesc}>
                  {activeTab === "purchased" 
                    ? "You haven't purchased or booked any buildable staging items yet." 
                    : "There are no buildable staging items in the catalog."
                  }
                </p>
                <Link to="/items" className={styles.shopBtn}>Go to Catalog</Link>
              </section>
            ) : (
              <div className={styles.itemGrid}>
                {displayedItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.itemCard}
                    onClick={() => handleStartBuild(item)}
                  >
                    <div className={styles.itemImageContainer}>
                      {item.image && item.image.startsWith("/uploads") ? (
                        <img src={item.image} alt={item.title} className={styles.itemImage} />
                      ) : (
                        <div className={styles.itemOrb} style={{ fontSize: "2.8rem" }}>
                          🎪
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.itemDetails}>
                      <span className={styles.itemCategory}>{item.categoryId || "Staging Props"}</span>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <button className={styles.buildBtn}>
                        🛠️ View Guide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
