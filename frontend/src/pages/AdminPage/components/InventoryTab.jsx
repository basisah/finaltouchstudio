import React, { useState, useEffect, useRef } from "react";
import styles from "../AdminPage.module.css";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";
import { post, put, del } from "../../../api/client";
import { compressImage } from "../../../utils/imageCompressor";

const EMOJI_OPTIONS = ["🎂","💒","🌼","🍼","✨","🎉","💍","🌸","👰","🥳","🎈","🏮","🎓","❤️","🌺","🎪"];
const ITEM_ICONS = ["✨", "🎂", "💍", "💒", "🌸", "🧸", "🎈", "💡", "🌹", "👰", "🥳", "🎁", "🕯️", "🍽️", "🛋️"];

export default function InventoryTab({
  activeCategory,
  activeCategoryItems,
  refreshData,
  activeTab,
  setActiveTab,
}) {
  // Mode checks
  const isAddCategoryMode = activeTab === "add_category";

  // State A: Add Category States
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🎉");

  // State B: Item Management States
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemUnitCount, setItemUnitCount] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemSubCategory, setItemSubCategory] = useState("");
  const [itemImage, setItemImage] = useState("✨");
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  // Active view container in State B (tutorial vs photos uploader)
  const [activePreviewTab, setActivePreviewTab] = useState("photos");

  // Step builder input
  const [newStepText, setNewStepText] = useState("");

  // Refs for uploads
  const primaryFileRef = useRef();
  const galleryFileRef = useRef();

  // Parse JSON helper
  const parseJSON = (str, fallback) => {
    if (!str) return fallback;
    try {
      return typeof str === "string" ? JSON.parse(str) : str;
    } catch (e) {
      return fallback;
    }
  };

  // Auto-generate serial number for new items
  const [generatedSN, setGeneratedSN] = useState("");
  useEffect(() => {
    if (!selectedItem && activeCategory && activeCategory.id !== "add_category") {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setGeneratedSN(`SN-${activeCategory.id.toUpperCase().slice(0, 3)}-${randomId}`);
    }
  }, [selectedItem, activeCategory]);

  // Load selected item into form
  const handleItemCardClick = (item) => {
    setSelectedItem(item);
    setItemName(item.name || item.title || "");
    setItemDesc(item.description || "");
    setItemUnitCount(item.unit_count || 1);
    setItemPrice(item.price || 0);
    setItemSubCategory(item.subCategoryId || "");
    setItemImage(item.image || "✨");
    setTutorialSteps(parseJSON(item.tutorial_steps, []));
    setGalleryImages(parseJSON(item.gallery_images, []));
  };

  // Reset form
  const handleClearSelection = () => {
    setSelectedItem(null);
    setItemName("");
    setItemDesc("");
    setItemUnitCount(1);
    setItemPrice(0);
    setItemSubCategory("");
    setItemImage("✨");
    setTutorialSteps([]);
    setGalleryImages([]);
    setActivePreviewTab("photos");
  };

  // Handle category form submission (State A)
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const catId = newCatLabel.toLowerCase().replace(/\s+/g, "-");
    const newCategory = {
      id: catId,
      label: newCatLabel,
      emoji: newCatEmoji,
      color: "#9F507C",
      description: `Collection for ${newCatLabel} events`,
    };
    try {
      await post("/categories", newCategory);
      refreshData();
      setActiveTab(catId);
      setNewCatLabel("");
      setNewCatEmoji("🎉");
    } catch (err) {
      alert("Failed to create category: " + err.message);
    }
  };

  // Handle item form submission (State B)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return alert("Item name is required");

    const sn = selectedItem ? selectedItem.id : generatedSN;
    const payload = {
      id: sn,
      serialNumber: sn,
      name: itemName,
      title: itemName,
      description: itemDesc,
      categoryId: activeCategory.id,
      subCategoryId: itemSubCategory || null,
      isAvailable: selectedItem ? selectedItem.isAvailable : true,
      unit_count: itemUnitCount,
      image: itemImage,
      price: parseFloat(itemPrice) || 0.00,
      tutorial_steps: tutorialSteps,
      gallery_images: galleryImages,
    };

    try {
      if (selectedItem) {
        await put(`/items/${selectedItem.id}`, payload);
      } else {
        await post("/items", payload);
      }
      refreshData();
      handleClearSelection();
    } catch (err) {
      alert("Failed to save item: " + err.message);
    }
  };

  // Toggle item availability
  const handleToggleItemAvailability = async (e, item) => {
    e.stopPropagation(); // Avoid loading card into editing state
    try {
      await put(`/items/${item.id}`, {
        ...item,
        isAvailable: !item.isAvailable,
      });
      refreshData();
      // If we are currently editing this item, sync its availability status
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem((prev) => ({ ...prev, isAvailable: !item.isAvailable }));
      }
    } catch (err) {
      alert("Failed to toggle availability: " + err.message);
    }
  };

  // Delete item
  const handleDeleteItem = async (e, itemId) => {
    e.stopPropagation(); // Avoid loading card into editing state
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await del(`/items/${itemId}`);
      refreshData();
      if (selectedItem && selectedItem.id === itemId) {
        handleClearSelection();
      }
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  // Add a tutorial step
  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setTutorialSteps((prev) => [...prev, newStepText.trim()]);
    setNewStepText("");
  };

  // Remove a tutorial step
  const handleRemoveStep = (indexToRemove) => {
    setTutorialSteps((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload primary photo uploader
  const handlePrimaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const token = localStorage.getItem("admin_token");
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("image", compressedFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      setItemImage(uploadData.path);
    } catch (err) {
      alert("Failed to upload primary photo: " + err.message);
    }
  };

  // Upload gallery photos uploader
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const token = localStorage.getItem("admin_token");
      for (const file of files) {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append("image", compressedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        setGalleryImages((prev) => [...prev, uploadData.path]);
      }
    } catch (err) {
      alert("Failed to upload gallery photo: " + err.message);
    }
  };

  // Remove gallery photo
  const handleRemoveGalleryImage = (idxToRemove) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Fetch subcategories
  const activeCategoryObj = INVENTORY_CATEGORIES.find((c) => c.id === activeCategory.id);
  const subcategories = activeCategoryObj?.subcategories || [];

  return (
    <div className={styles.inventoryGridContainer}>
      {/* ──────────────────────────────────────────────────────── */}
      {/* MIDDLE SECTION: Dynamic Inventory Hub (Column 2)         */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className={styles.middleWorkspace}>
        {isAddCategoryMode ? (
          /* State A: Add Category Mode */
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>➕ Create New Category</h2>
              <p>Configure details for a new filter category</p>
            </div>

            <form onSubmit={handleCreateCategory} className={styles.itemForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="catTitle">Category Title</label>
                <input
                  id="catTitle"
                  type="text"
                  placeholder="e.g. Graduation Ceremony"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Emoji Icon ({newCatEmoji})</label>
                <div className={styles.emojiSelectionGrid}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`${styles.emojiGridButton} ${newCatEmoji === emoji ? styles.emojiGridButtonActive : ""}`}
                      onClick={() => setNewCatEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className={styles.addItemBtn} style={{ marginTop: "10px" }}>
                ✦ Create Category Package
              </button>
            </form>
          </div>
        ) : (
          /* State B: Item Management Mode */
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>{selectedItem ? "✏️ Edit Item" : "➕ Add to Inventory"}</h2>
                <p>{selectedItem ? "Modify rental specifications" : "Configure details for a new product entry"}</p>
              </div>
              {selectedItem && (
                <button
                  type="button"
                  className={styles.clearSelectionBtn}
                  onClick={handleClearSelection}
                >
                  Create New Item Instead
                </button>
              )}
            </div>

            <form onSubmit={handleSaveItem} className={styles.itemForm}>
              {/* Row 1: Title & Serial Number */}
              <div className={styles.splitRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label htmlFor="itemName">Item Title</label>
                  <input
                    id="itemName"
                    type="text"
                    placeholder="e.g. Classic White Velvet Chair"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{ width: "160px" }}>
                  <label htmlFor="itemSN">Serial Number</label>
                  <input
                    id="itemSN"
                    type="text"
                    value={selectedItem ? selectedItem.id : generatedSN}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
              </div>

              {/* Row 2: Description */}
              <div className={styles.inputGroup}>
                <label htmlFor="itemDesc">Item Description</label>
                <textarea
                  id="itemDesc"
                  rows={2}
                  placeholder="Set details, sizes, and specs..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                />
              </div>

              {/* Row 3: Quantity & Price */}
              <div className={styles.splitRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label htmlFor="itemUnitCount">Stock Quantity</label>
                  <input
                    id="itemUnitCount"
                    type="number"
                    min="1"
                    value={itemUnitCount}
                    onChange={(e) => setItemUnitCount(parseInt(e.target.value, 10) || 1)}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label htmlFor="itemPrice">Rental Price (BDT/CAD)</label>
                  <input
                    id="itemPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Subcategory & Icon Picker */}
              <div className={styles.splitRow}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label htmlFor="itemSubCategory">Subcategory Grouping</label>
                  <select
                    id="itemSubCategory"
                    value={itemSubCategory}
                    onChange={(e) => setItemSubCategory(e.target.value)}
                    className={styles.picSelect}
                  >
                    <option value="">-- General / Other --</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.emoji} {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label htmlFor="itemIcon">Emoji Icon Picker</label>
                  <select
                    id="itemIcon"
                    value={itemImage.length === 2 ? itemImage : "✨"}
                    onChange={(e) => setItemImage(e.target.value)}
                    className={styles.picSelect}
                  >
                    {ITEM_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon} icon
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Action Split Tabs */}
              <div className={styles.actionSplitTabs}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activePreviewTab === "tutorial" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActivePreviewTab("tutorial")}
                >
                  📖 Add Tutorial Guide ({tutorialSteps.length} Steps)
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activePreviewTab === "photos" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActivePreviewTab("photos")}
                >
                  📷 Add Photos & Gallery
                </button>
              </div>

              {/* Row 6: Dynamic Preview Area */}
              <div className={styles.dynamicPreviewContainer}>
                {activePreviewTab === "tutorial" ? (
                  /* Tutorial Steps Guide Builder */
                  <div className={styles.tutorialStepBuilder}>
                    <p className={styles.previewSecTitle}>Step-by-Step Setup Guide</p>
                    {tutorialSteps.length === 0 ? (
                      <div className={styles.emptySteps}>
                        <p>No steps added yet. Formulate steps below to assist setups.</p>
                      </div>
                    ) : (
                      <ol className={styles.stepsList}>
                        {tutorialSteps.map((step, idx) => (
                          <li key={idx} className={styles.stepItem}>
                            <span className={styles.stepText}>{step}</span>
                            <button
                              type="button"
                              className={styles.removeStepBtn}
                              onClick={() => handleRemoveStep(idx)}
                              title="Delete Step"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className={styles.addStepRow}>
                      <input
                        type="text"
                        placeholder="e.g. Align the primary backdrop and screw locks together."
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        className={styles.stepInput}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddStep();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className={styles.addStepBtn}
                      >
                        Add Step
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Photos & Media Uploader Container */
                  <div className={styles.mediaUploaderContainer}>
                    <div className={styles.mediaSplitGrid}>
                      {/* Primary Photo Uploader */}
                      <div className={styles.mediaUploadCol}>
                        <p className={styles.previewSecTitle}>Primary Product Image</p>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
                          {itemImage && itemImage.startsWith("/uploads") ? (
                            <img src={itemImage} alt="primary" className={styles.mediaThumbLarge} />
                          ) : (
                            <div className={styles.mediaThumbPlaceholderLarge}>{itemImage || "✨"}</div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              ref={primaryFileRef}
                              style={{ display: "none" }}
                              onChange={handlePrimaryUpload}
                            />
                            <button
                              type="button"
                              className={styles.secondaryUploadBtn}
                              onClick={() => primaryFileRef.current.click()}
                            >
                              Upload Image
                            </button>
                            <p className={styles.uploadHelperText}>Recommended size: 300x300px</p>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Photos Uploader */}
                      <div className={styles.mediaUploadCol}>
                        <p className={styles.previewSecTitle}>Additional Gallery Photos</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={galleryFileRef}
                          style={{ display: "none" }}
                          onChange={handleGalleryUpload}
                        />
                        <button
                          type="button"
                          className={styles.secondaryUploadBtn}
                          style={{ marginTop: "8px" }}
                          onClick={() => galleryFileRef.current.click()}
                        >
                          ➕ Add Gallery Photos
                        </button>
                      </div>
                    </div>

                    {/* Gallery Images Render Grid */}
                    {galleryImages.length > 0 && (
                      <div className={styles.galleryPreviewSection}>
                        <p className={styles.previewSecTitle} style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Gallery Images ({galleryImages.length})
                        </p>
                        <div className={styles.galleryGrid}>
                          {galleryImages.map((path, idx) => (
                            <div key={idx} className={styles.galleryThumbWrapper}>
                              <img src={path} alt={`gallery-${idx}`} className={styles.galleryThumb} />
                              <button
                                type="button"
                                className={styles.deleteGalleryImgBtn}
                                onClick={() => handleRemoveGalleryImage(idx)}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className={styles.addItemBtn}>
                ✦ {selectedItem ? "Save Changes" : "Create & Add to Category"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* RIGHT SECTION: Item List & Status Feed (Column 3)        */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className={styles.rightFeed}>
        <div className={styles.card} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className={styles.cardHeader}>
            <h2>📂 Items List</h2>
            <p>
              {activeCategory.label} ({activeCategoryItems.length})
            </p>
          </div>

          <div className={styles.feedScrollArea}>
            {activeCategoryItems.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <p>No items configured in this category.</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Use the middle editor to add the first item!
                </p>
              </div>
            ) : (
              <div className={styles.feedCardContainer}>
                {activeCategoryItems.map((item) => {
                  const isCurrentlyEditing = selectedItem && selectedItem.id === item.id;
                  const itemSubcatObj = subcategories.find((s) => s.id === item.subCategoryId);

                  return (
                    <div
                      key={item.id}
                      className={`${styles.itemHorizontalCard} ${isCurrentlyEditing ? styles.itemHorizontalCardEditing : ""}`}
                      onClick={() => handleItemCardClick(item)}
                    >
                      {/* Left: Square Photo Thumbnail */}
                      <div className={styles.itemCardThumbCol}>
                        {item.image && item.image.startsWith("/uploads") ? (
                          <img src={item.image} alt={item.name} className={styles.itemCardThumbImg} />
                        ) : (
                          <span className={styles.itemCardThumbPlaceholder}>{item.image || "✨"}</span>
                        )}
                      </div>

                      {/* Center: Title / Metadata details */}
                      <div className={styles.itemCardInfoCol}>
                        <strong className={styles.itemCardTitle}>{item.name || item.title}</strong>
                        <div className={styles.itemCardMeta}>
                          <span>Stock: {item.unit_count || 1} units</span>
                          <span>•</span>
                          <span>{itemSubcatObj ? itemSubcatObj.label : "General"}</span>
                        </div>
                        {parseFloat(item.price) > 0 && (
                          <span className={styles.itemCardPrice}>
                            {item.price} BDT
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className={styles.itemCardActionsCol}>
                        {/* Availability Toggle */}
                        <label className={styles.switch} style={{ transform: "scale(0.85)" }}>
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={(e) => handleToggleItemAvailability(e, item)}
                          />
                          <span className={styles.slider}></span>
                        </label>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className={styles.deleteIconBtn}
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          title="Delete Item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
