import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./PackageDetail.module.css";
import { getPackage } from "../../api/packages.api";

// Reuse SVG icons mapping from ItemsPage
import {
  SignIcon,
  ArchIcon,
  WallIcon,
  FurnitureIcon,
  CakeIcon,
  FloralIcon,
  LightingIcon,
  DalaIcon,
  AisleIcon,
  AudioIcon,
  TablewareIcon,
  SpecialIcon
} from "./PackageIcons";

const getSvgIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("neon") || t.includes("sign") || t.includes("board") || t.includes("number") || t.includes("letter") || t.includes("block")) {
    return <SignIcon />;
  }
  if (t.includes("arch") || t.includes("frame") || t.includes("ring")) {
    return <ArchIcon />;
  }
  if (t.includes("wall") || t.includes("curtain") || t.includes("drap") || t.includes("backdrop") || t.includes("mandap")) {
    return <WallIcon />;
  }
  if (t.includes("chair") || t.includes("sofa") || t.includes("throne") || t.includes("bench") || t.includes("mattress") || t.includes("plinth") || t.includes("pedestal") || t.includes("table") || t.includes("stool")) {
    return <FurnitureIcon />;
  }
  if (t.includes("cake") || t.includes("cupcake") || t.includes("tower") || t.includes("platter") || t.includes("jar") || t.includes("sweet") || t.includes("display")) {
    return <CakeIcon />;
  }
  if (t.includes("flower") || t.includes("floral") || t.includes("blossom") || t.includes("tree") || t.includes("marigold") || t.includes("genda")) {
    return <FloralIcon />;
  }
  if (t.includes("light") || t.includes("candle") || t.includes("candelabra") || t.includes("led") || t.includes("lamp") || t.includes("lantern")) {
    return <LightingIcon />;
  }
  if (t.includes("dala") || t.includes("tray") || t.includes("kula") || t.includes("umbrella")) {
    return <DalaIcon />;
  }
  if (t.includes("carpet") || t.includes("runner") || t.includes("pillar") || t.includes("aisle") || t.includes("walkway")) {
    return <AisleIcon />;
  }
  if (t.includes("speaker") || t.includes("audio") || t.includes("sound") || t.includes("av") || t.includes("wireless")) {
    return <AudioIcon />;
  }
  if (t.includes("plate") || t.includes("napkin") || t.includes("cutlery") || t.includes("tablecloth") || t.includes("dish") || t.includes("warmer") || t.includes("dispenser") || t.includes("glass")) {
    return <TablewareIcon />;
  }
  return <SpecialIcon />;
};

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [removedItems, setRemovedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        setLoading(true);
        const data = await getPackage(id);
        if (data) {
          setPkg(data);
          setSelectedItems(data.items || []);
          setRemovedItems([]);
        }
      } catch (err) {
        console.error("Error fetching package details:", err);
        setError("Could not load package details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackageDetail();
  }, [id]);

  const handleRemoveItem = (item) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    setRemovedItems((prev) => [...prev, item]);
  };

  const handleRestoreItem = (item) => {
    setRemovedItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItems((prev) => [...prev, item]);
  };

  // Calculate customized price based on remaining items ratio
  const calculatePrice = () => {
    if (!pkg) return 0;
    const originalCount = (pkg.items || []).length;
    if (originalCount === 0) return pkg.price;
    const remainingCount = selectedItems.length;
    const basePrice = parseFloat(pkg.price);
    
    // Proportional price calculation: minimum of 30% of base price to cover transportation & design labor
    const proportion = remainingCount / originalCount;
    const computedPrice = basePrice * proportion;
    const minPrice = basePrice * 0.3;
    return Math.max(computedPrice, minPrice);
  };

  const handleCheckout = () => {
    // Navigate to checkout and pass package customization details in router state
    navigate("/checkout", {
      state: {
        pkgName: pkg.name,
        pkgCategory: pkg.category_id,
        itemsCount: selectedItems.length,
        itemsList: selectedItems.map((i) => i.title),
        finalPrice: calculatePrice(),
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <p>Curating your customizable decor package...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className={styles.errorPage}>
        <Navbar />
        <div className={styles.errorCard}>
          <h2>⚠️ Package Not Found</h2>
          <p>{error || "This package could not be found or has not been configured in the admin dashboard."}</p>
          <button onClick={() => navigate("/")} className={styles.backBtn}>Back to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = calculatePrice();
  const isCustomized = selectedItems.length < (pkg.items || []).length;

  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.categoryBadge}>{pkg.category_id.toUpperCase()} PACKAGE</span>
          <h1 className={styles.title}>{pkg.name}</h1>
          <p className={styles.subtitle}>
            We've pre-selected everything you need for a stunning setup. Remove any items you don't require to customize your order.
          </p>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.layoutGrid}>
          {/* Items Customizer Section */}
          <div className={styles.itemsSection}>
            <div className={styles.sectionHeader}>
              <h2>Included Decor Elements ({selectedItems.length})</h2>
              <p>Click the remove button on elements you already have or wish to exclude.</p>
            </div>

            {selectedItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>All items have been removed. Restore items from the panel on the right to proceed!</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {selectedItems.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.cardVisual}>
                      <div className={styles.iconWrapper}>{getSvgIcon(item.title)}</div>
                    </div>
                    <div className={styles.cardInfo}>
                      <h3>{item.title}</h3>
                      <p>{item.description || "Premium quality rentals provided by FinalTouch Studio."}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item)} 
                      className={styles.removeBtn}
                      title="Exclude this item"
                    >
                      ✕ Exclude
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Customization Summary Sidebar */}
          <aside className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h3>Package Summary</h3>
              <div className={styles.divider}></div>
              
              <div className={styles.summaryRow}>
                <span>Original Package Price:</span>
                <span className={styles.originalPrice}>CAD ${parseFloat(pkg.price).toLocaleString()}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Items Included:</span>
                <span>{selectedItems.length} of {(pkg.items || []).length}</span>
              </div>

              {isCustomized && (
                <div className={styles.customBadge}>
                  ✨ Custom Package Applied
                </div>
              )}

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>Final Customized Price:</span>
                <span className={styles.totalPrice}>CAD ${currentPrice.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                className={styles.checkoutBtn}
                disabled={selectedItems.length === 0}
              >
                ✦ Proceed to Checkout
              </button>
            </div>

            {/* Restore Excluded Items Section */}
            {removedItems.length > 0 && (
              <div className={styles.restoreCard}>
                <h3>Excluded Elements ({removedItems.length})</h3>
                <p>Add them back to restore the full design theme.</p>
                <div className={styles.restoreList}>
                  {removedItems.map((item) => (
                    <div key={item.id} className={styles.restoreRow}>
                      <span className={styles.restoreName}>{item.title}</span>
                      <button onClick={() => handleRestoreItem(item)} className={styles.restoreBtn}>
                        ＋ Include
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
