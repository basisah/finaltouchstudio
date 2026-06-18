import React, { useState, useEffect, useRef } from "react";
import styles from "../AdminPage.module.css";
import { INVENTORY_CATEGORIES } from "../../../constants/inventory";
import { post, put, del } from "../../../api/client";
import { compressImage } from "../../../utils/imageCompressor";
import ConfirmModal from "./ConfirmModal";
import { uploadSubcategoryImage, uploadCategoryImage } from "../../../api/admin/categories.api";

const CATEGORY_PNG_ICONS = [
  { value: "baby", label: "Baby", src: "/uploads/Icons/Category/baby.png" },
  { value: "birthday-cake", label: "Birthday Cake", src: "/uploads/Icons/Category/birthday-cake.png" },
  { value: "bridal-shower", label: "Bridal Shower", src: "/uploads/Icons/Category/bridal-shower.png" },
  { value: "bride", label: "Bride", src: "/uploads/Icons/Category/bride.png" },
  { value: "couple", label: "Couple", src: "/uploads/Icons/Category/couple.png" },
  { value: "manager", label: "Manager", src: "/uploads/Icons/Category/manager.png" },
  { value: "ring", label: "Ring", src: "/uploads/Icons/Category/ring.png" },
  { value: "wedding-couple", label: "Wedding Couple", src: "/uploads/Icons/Category/wedding-couple.png" },
];

const SUBCAT_PNG_ICONS = [
  { value: "Arch.png", label: "Arch", src: "/uploads/Icons/SubCategory/Arch.png" },
  { value: "Balloon.png", label: "Balloon", src: "/uploads/Icons/SubCategory/Balloon.png" },
  { value: "board.png", label: "Board", src: "/uploads/Icons/SubCategory/board.png" },
  { value: "FoodTray.png", label: "Food Tray", src: "/uploads/Icons/SubCategory/FoodTray.png" },
  { value: "Light bulb.png", label: "Light Bulb", src: "/uploads/Icons/SubCategory/Light bulb.png" },
  { value: "Light.png", label: "Light", src: "/uploads/Icons/SubCategory/Light.png" },
  { value: "MIc.png", label: "Mic", src: "/uploads/Icons/SubCategory/MIc.png" },
  { value: "Plant.png", label: "Plant", src: "/uploads/Icons/SubCategory/Plant.png" },
  { value: "Plater.png", label: "Plater", src: "/uploads/Icons/SubCategory/Plater.png" },
  { value: "Prop.png", label: "Prop", src: "/uploads/Icons/SubCategory/Prop.png" },
  { value: "TableCloth.png", label: "Tablecloth", src: "/uploads/Icons/SubCategory/TableCloth.png" },
  { value: "Teddy.png", label: "Teddy", src: "/uploads/Icons/SubCategory/Teddy.png" },
];

const CATEGORY_EMOJI_ICONS = [
  { value: "🎂", label: "Cake" },
  { value: "💒", label: "Wedding" },
  { value: "🌼", label: "Flower" },
  { value: "🍼", label: "Baby" },
  { value: "✨", label: "Sparkles" },
  { value: "🎉", label: "Party" },
  { value: "💍", label: "Ring" },
  { value: "🌸", label: "Floral" },
  { value: "👰", label: "Bride" },
  { value: "🥳", label: "Party Face" },
  { value: "🎈", label: "Balloon" },
  { value: "🏮", label: "Lantern" },
  { value: "🎓", label: "Graduation" },
  { value: "❤️", label: "Heart" },
  { value: "🌺", label: "Hibiscus" },
  { value: "🎪", label: "Carnival" }
];

const EMOJI_OPTIONS = ["🎂","💒","🌼","🍼","✨","🎉","💍","🌸","👰","🥳","🎈","🏮","🎓","❤️","🌺","🎪"];
const ITEM_ICONS = ["✨", "🎂", "💍", "💒", "🌸", "🧸", "🎈", "💡", "🌹", "👰", "🥳", "🎁", "🕯️", "🍽️", "🛋️"];
const SUBCAT_ICONS = ["✨", "💡", "🌸", "🎈", "🧸", "🪑", "🧁", "🍽️", "🛋️", "🎀", "🎪", "🥂", "📸", "🎁", "🎉"];
const SUBCAT_EMOJIS_WITH_NAMES = [
  { emoji: "✨", name: "Sparkles" },
  { emoji: "💡", name: "Lights" },
  { emoji: "🌸", name: "Floral" },
  { emoji: "🎈", name: "Balloons" },
  { emoji: "🧸", name: "Teddy" },
  { emoji: "🪑", name: "Chairs" },
  { emoji: "🧁", name: "Desserts" },
  { emoji: "🍽️", name: "Tableware" },
  { emoji: "🛋️", name: "Sofas" },
  { emoji: "🎀", name: "Ribbons" },
  { emoji: "🎪", name: "Carnival" },
  { emoji: "🥂", name: "Drinks" },
  { emoji: "📸", name: "Photo" },
  { emoji: "🎁", name: "Gifts" },
  { emoji: "🎉", name: "Party" },
  { emoji: "💍", name: "Ring" },
  { emoji: "💒", name: "Wedding" },
  { emoji: "🎂", name: "Cake" },
  { emoji: "🍼", name: "Baby" },
  { emoji: "🎵", name: "Music" },
  { emoji: "🌟", name: "Stars" },
  { emoji: "🕯️", name: "Candles" }
];

export default function InventoryTab({
  activeCategory,
  activeCategoryItems,
  refreshData,
  activeTab,
  setActiveTab,
}) {
  // Mode checks
  const isAddCategoryMode = activeTab === "add_category";

  // Confirm Modal state controllers
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(""); // "item" or "category"
  const [confirmTargetId, setConfirmTargetId] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmRequirePassword, setConfirmRequirePassword] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  // State A: Add Category States
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🎉");
  const [newCatImage, setNewCatImage] = useState("");
  const catFileRef = useRef();

  const handleCatImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadCategoryImage(file);
      setNewCatImage(imageUrl);
    } catch (err) {
      alert("Failed to upload category image: " + err.message);
    }
  };

  // State B: Item Management States
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemUnitCount, setItemUnitCount] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemSubCategory, setItemSubCategory] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  // Subcategory Creation States
  const [showAddSubcatForm, setShowAddSubcatForm] = useState(false);
  const [newSubcatLabel, setNewSubcatLabel] = useState("");
  const [newSubcatEmoji, setNewSubcatEmoji] = useState("✨");
  const [newSubcatImage, setNewSubcatImage] = useState("");
  const subcatFileRef = useRef();

  const handleSubcatImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadSubcategoryImage(file);
      setNewSubcatImage(imageUrl);
    } catch (err) {
      alert("Failed to upload subcategory image: " + err.message);
    }
  };

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
    setItemImage(item.image && item.image.startsWith("/uploads") ? item.image : "");
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
    setItemImage("");
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
      image_url: newCatImage || null,
    };
    try {
      await post("/categories", newCategory);
      refreshData();
      setActiveTab(catId);
      setNewCatLabel("");
      setNewCatEmoji("🎉");
      setNewCatImage("");
    } catch (err) {
      alert("Failed to create category: " + err.message);
    }
  };

  // Handle item form submission (State B)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return alert("Item name is required");
    if (!itemImage || !itemImage.startsWith("/uploads")) {
      return alert("Primary product photo is required. Please upload an image first.");
    }

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

  // Trigger delete item modal
  const triggerDeleteItem = (e, itemId) => {
    e.stopPropagation();
    setConfirmType("item");
    setConfirmTargetId(itemId);
    setConfirmTitle("🗑️ Delete Item");
    setConfirmMessage(`Are you sure you want to delete item "${itemId}" permanently?`);
    setConfirmRequirePassword(false);
    setConfirmError("");
    setConfirmLoading(false);
    setConfirmOpen(true);
  };

  // Trigger delete category modal
  const triggerDeleteCategory = (id) => {
    const isSystemPredefined = ["proposal", "holud", "marriage", "baby", "baby-shower", "birthday"].includes(id);
    const warningMessage = isSystemPredefined
      ? `WARNING: "${id}" is a system-predefined category. Deleting it may impact layout stability. Proceed?\n\n`
      : "";

    setConfirmType("category");
    setConfirmTargetId(id);
    setConfirmTitle("🗑️ Delete Category");
    setConfirmMessage(`${warningMessage}Are you sure you want to delete category "${id}"? This action will not delete its items and requires your admin password.`);
    setConfirmRequirePassword(true);
    setConfirmError("");
    setConfirmLoading(false);
    setConfirmOpen(true);
  };

  const triggerDeleteSubcategory = (e, subId) => {
    e.stopPropagation();
    setConfirmType("subcategory");
    setConfirmTargetId(subId);
    setConfirmTitle("🗑️ Delete Subcategory");
    setConfirmMessage(`Are you sure you want to delete subcategory "${subId}"? This will set all matching items in this category to General and requires your admin password.`);
    setConfirmRequirePassword(true);
    setConfirmError("");
    setConfirmLoading(false);
    setConfirmOpen(true);
  };

  const handleExecuteConfirm = async (password) => {
    setConfirmLoading(true);
    setConfirmError("");
    const targetId = confirmTargetId;

    try {
      if (confirmType === "item") {
        await del(`/items/${targetId}`);
        refreshData();
        if (selectedItem && selectedItem.id === targetId) {
          handleClearSelection();
        }
        setConfirmOpen(false);
      } else if (confirmType === "category") {
        // 1. Decode token to extract admin username
        const token = localStorage.getItem("admin_token");
        let username = "admin"; // Default fallback
        if (token) {
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              window.atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const payload = JSON.parse(jsonPayload);
            if (payload && payload.username) {
              username = payload.username;
            }
          } catch (e) {
            console.error("Error decoding token for verification:", e);
          }
        }

        // 2. Call admin auth login to verify the password
        const verifyRes = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!verifyRes.ok) {
          setConfirmError("Incorrect admin password.");
          setConfirmLoading(false);
          return;
        }

        // 3. Password verified! Execute delete request
        const tokenHeaders = { Authorization: `Bearer ${token}` };
        const res = await fetch(`/api/categories/${targetId}`, {
          method: "DELETE",
          headers: tokenHeaders,
        });

        if (!res.ok) throw new Error("Failed to delete category");
        
        // 4. Update parent states and redirect to default active tab (or empty tab if no categories left)
        setConfirmOpen(false);
        refreshData();
        setActiveTab("");
        alert("Category deleted successfully.");
      } else if (confirmType === "subcategory") {
        // 1. Decode token to extract admin username
        const token = localStorage.getItem("admin_token");
        let username = "admin"; // Default fallback
        if (token) {
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              window.atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const payload = JSON.parse(jsonPayload);
            if (payload && payload.username) {
              username = payload.username;
            }
          } catch (e) {
            console.error("Error decoding token for verification:", e);
          }
        }

        // 2. Call admin auth login to verify the password
        const verifyRes = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!verifyRes.ok) {
          setConfirmError("Incorrect admin password.");
          setConfirmLoading(false);
          return;
        }

        // 3. Password verified! Update category with subcategory removed
        const updatedSub = subcategories.filter(s => s.id !== targetId);
        await put(`/categories/${activeCategory.id}`, {
          label: activeCategory.label,
          emoji: activeCategory.emoji,
          color: activeCategory.color,
          description: activeCategory.description || "",
          image_url: activeCategory.image_url || "",
          display_order: activeCategory.display_order || 0,
          subcategories: updatedSub
        });

        if (itemSubCategory === targetId) {
          setItemSubCategory("");
        }

        setConfirmOpen(false);
        refreshData();
        alert("Subcategory deleted successfully.");
      }
    } catch (err) {
      setConfirmError(err.message);
    } finally {
      setConfirmLoading(false);
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

  // Fetch subcategories dynamically from the activeCategory model
  const subcategories = Array.isArray(activeCategory?.subcategories)
    ? activeCategory.subcategories
    : (typeof activeCategory?.subcategories === "string"
        ? (() => { try { return JSON.parse(activeCategory.subcategories) || []; } catch(e) { return []; } })()
        : []);

  const handleSaveSubcategory = async () => {
    if (!newSubcatLabel.trim()) return alert("Subcategory name is required");
    
    const newId = newSubcatLabel.toLowerCase().trim().replace(/\s+/g, "-");
    
    // Check if subcategory already exists
    if (subcategories.some(s => s.id === newId)) {
      return alert("A subcategory with this name already exists");
    }

    const newSub = {
      id: newId,
      label: newSubcatLabel.trim(),
      emoji: newSubcatEmoji,
      image: newSubcatImage || null
    };

    const updatedSub = [...subcategories, newSub];

    try {
      await put(`/categories/${activeCategory.id}`, {
        label: activeCategory.label,
        emoji: activeCategory.emoji,
        color: activeCategory.color,
        description: activeCategory.description || "",
        image_url: activeCategory.image_url || "",
        display_order: activeCategory.display_order || 0,
        subcategories: updatedSub
      });
      refreshData();
      setItemSubCategory(newId);
      setShowAddSubcatForm(false);
      setNewSubcatLabel("");
      setNewSubcatEmoji("✨");
      setNewSubcatImage("");
    } catch (err) {
      alert("Failed to save subcategory: " + err.message);
    }
  };

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

              {/* Optional Category Cover Photo */}
              <div className={styles.inputGroup}>
                <label style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.82rem" }}>Category Cover Image (Optional)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="file"
                    ref={catFileRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleCatImageUpload}
                  />
                  <button
                    type="button"
                    className={styles.secondaryUploadBtn}
                    onClick={() => catFileRef.current?.click()}
                    style={{ padding: "8px 14px", fontSize: "0.8rem" }}
                  >
                    {newCatImage ? "Change Cover Image" : "Upload Cover Image"}
                  </button>
                  {newCatImage && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img 
                        src={newCatImage} 
                        alt="Category Cover Preview" 
                        style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-shadow)" }} 
                      />
                      <button
                        type="button"
                        onClick={() => setNewCatImage("")}
                        style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer", fontWeight: "bold" }}
                        title="Remove cover image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.82rem" }}>Select Icon ({newCatEmoji})</label>
                
                {/* 2 rows horizontal scrollable selection grid for category icons */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateRows: "repeat(2, auto)", 
                  gridAutoFlow: "column",
                  gap: "8px 12px", 
                  overflowX: "auto", 
                  paddingBottom: "8px",
                  maxWidth: "100%",
                  border: "1px solid var(--border-shadow)",
                  borderRadius: "8px",
                  padding: "10px",
                  background: "rgba(0,0,0,0.01)"
                }}>
                  {/* PNG Icons from Assets */}
                  {CATEGORY_PNG_ICONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setNewCatEmoji(item.value)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        background: newCatEmoji === item.value ? "var(--btn-primary)" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        padding: "6px 10px",
                        flexShrink: 0,
                        minWidth: "64px"
                      }}
                    >
                      <img 
                        src={item.src} 
                        alt={item.label} 
                        style={{ width: "24px", height: "24px", objectFit: "contain", filter: newCatEmoji === item.value ? "brightness(0) invert(1)" : "none" }} 
                      />
                      <span style={{ 
                        fontSize: "0.6rem", 
                        color: newCatEmoji === item.value ? "white" : "var(--text-muted)",
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}>
                        {item.label}
                      </span>
                    </button>
                  ))}

                  {/* Standard Emojis with Names */}
                  {CATEGORY_EMOJI_ICONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setNewCatEmoji(item.value)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        background: newCatEmoji === item.value ? "var(--btn-primary)" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        padding: "6px 10px",
                        flexShrink: 0,
                        minWidth: "64px"
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{item.value}</span>
                      <span style={{ 
                        fontSize: "0.6rem", 
                        color: newCatEmoji === item.value ? "white" : "var(--text-muted)",
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}>
                        {item.label}
                      </span>
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
          <>
            {/* Slim Subcategory Selector & Creator Box */}
            <div className={styles.card} style={{ marginBottom: "20px", padding: "10px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                
                {/* Minimal Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🏷️</span>
                  <strong style={{ fontSize: "0.88rem", color: "var(--admin-text)" }}>Subcategory:</strong>
                </div>

                {/* Subcategory list / inline creator */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, overflowX: "auto", whiteSpace: "nowrap", padding: "4px 0" }}>
                  
                  {/* General / Other */}
                  <button
                    type="button"
                    onClick={() => setItemSubCategory("")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "14px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      background: itemSubCategory === "" ? "var(--btn-primary)" : "rgba(0, 0, 0, 0.05)",
                      color: itemSubCategory === "" ? "white" : "var(--admin-text)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                    title="General / Other"
                  >
                    <span>✨</span>
                    <span style={{ fontSize: "0.72rem" }}>General</span>
                  </button>

                  {/* Dynamic Subcategories (Focus on Icons only, small text) */}
                  {subcategories.map((sub) => {
                    const isSelected = itemSubCategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setItemSubCategory(sub.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: isSelected ? "var(--btn-primary)" : "rgba(0, 0, 0, 0.05)",
                          color: isSelected ? "white" : "var(--admin-text)",
                          borderRadius: "14px",
                          padding: "4px 12px",
                          gap: "4px",
                          height: "28px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {sub.image ? (
                          <img 
                            src={sub.image} 
                            alt="" 
                            style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} 
                          />
                        ) : (
                          <span>{sub.emoji}</span>
                        )}
                        <span style={{ fontSize: "0.72rem" }}>{sub.label}</span>
                      </button>
                    );
                  })}

                  {/* inline trigger button for adding */}
                  {!showAddSubcatForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddSubcatForm(true)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "14px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1px dashed var(--btn-primary)",
                        background: "transparent",
                        color: "var(--btn-primary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      ➕ New
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Create Form if active */}
              {showAddSubcatForm && (
                <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "8px", border: "1px dashed var(--border-shadow)" }}>
                  <h3 style={{ fontSize: "0.85rem", marginBottom: "8px", color: "var(--text-main)" }}>Create New Subcategory</h3>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "8px", flexWrap: "wrap", flexDirection: "column" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lights"
                        value={newSubcatLabel}
                        onChange={(e) => setNewSubcatLabel(e.target.value)}
                        style={{
                          padding: "10px 12px",
                          border: "1px solid var(--border-shadow)",
                          borderRadius: "8px",
                          background: "#ffffff",
                          color: "var(--text-main)",
                          fontSize: "0.88rem",
                          width: "100%",
                          boxSizing: "border-box",
                          outline: "none",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--btn-primary)";
                          e.target.style.boxShadow = "0 0 0 3px rgba(129, 87, 164, 0.15)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border-shadow)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Select Icon ({newSubcatEmoji})</label>
                      
                      {/* Emojis in exactly 2 rows - column grid layout with horizontal scrolling */}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateRows: "repeat(2, auto)", 
                        gridAutoFlow: "column",
                        gap: "8px 12px", 
                        overflowX: "auto", 
                        paddingBottom: "8px",
                        maxWidth: "100%",
                        border: "1px solid var(--border-shadow)",
                        borderRadius: "8px",
                        padding: "10px",
                        background: "rgba(0,0,0,0.01)"
                      }}>
                        {/* Hidden file input for uploading custom subcategory photo */}
                        <input
                          type="file"
                          ref={subcatFileRef}
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleSubcatImageUpload}
                        />

                        {/* Add Image Button placed in the first spot of the row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                          <button
                            type="button"
                            onClick={() => subcatFileRef.current?.click()}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              background: newSubcatImage ? "rgba(129, 87, 164, 0.1)" : "transparent",
                              border: newSubcatImage ? "1.5px solid var(--btn-primary)" : "1.5px dashed var(--btn-primary)",
                              borderRadius: "6px",
                              cursor: "pointer",
                              padding: "4px 8px",
                              flexShrink: 0,
                              minWidth: "64px",
                              height: "100%",
                              justifyContent: "center"
                            }}
                            title={newSubcatImage ? "Change subcategory image" : "Upload custom subcategory image"}
                          >
                            {newSubcatImage ? (
                              <img 
                                src={newSubcatImage} 
                                alt="" 
                                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                              />
                            ) : (
                              <span style={{ fontSize: "1.2rem", color: "var(--btn-primary)" }}>➕</span>
                            )}
                            <span style={{ 
                              fontSize: "0.6rem", 
                              color: "var(--btn-primary)",
                              fontWeight: 600,
                              whiteSpace: "nowrap"
                            }}>
                              {newSubcatImage ? "Change" : "Add Image"}
                            </span>
                          </button>
                          {newSubcatImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setNewSubcatImage("");
                              }}
                              style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "14px",
                                height: "14px",
                                fontSize: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                              }}
                              title="Remove image"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {SUBCAT_PNG_ICONS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setNewSubcatImage(item.src);
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              background: newSubcatImage === item.src ? "var(--btn-primary)" : "transparent",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              padding: "4px 8px",
                              flexShrink: 0,
                              minWidth: "64px",
                              justifyContent: "center"
                            }}
                            title={item.label}
                          >
                            <img 
                              src={item.src} 
                              alt={item.label} 
                              style={{ 
                                width: "24px", 
                                height: "24px", 
                                objectFit: "cover", 
                                borderRadius: "50%",
                                filter: newSubcatImage === item.src ? "brightness(0) invert(1)" : "none" 
                              }} 
                            />
                            <span style={{ 
                              fontSize: "0.6rem", 
                              color: newSubcatImage === item.src ? "white" : "var(--text-muted)",
                              fontWeight: 600,
                              whiteSpace: "nowrap"
                            }}>
                              {item.label}
                            </span>
                          </button>
                        ))}

                        {SUBCAT_EMOJIS_WITH_NAMES.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setNewSubcatEmoji(item.emoji)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              background: newSubcatEmoji === item.emoji ? "var(--btn-primary)" : "transparent",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              padding: "4px 8px",
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
                            <span style={{ 
                              fontSize: "0.6rem", 
                              color: newSubcatEmoji === item.emoji ? "white" : "var(--text-muted)",
                              fontWeight: 600
                            }}>
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={handleSaveSubcategory}
                      style={{ padding: "6px 12px", background: "var(--btn-primary)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSubcatForm(false);
                        setNewSubcatLabel("");
                      }}
                      style={{ padding: "6px 12px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-shadow)", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                    <label htmlFor="itemPrice">Rental Price (CAD)</label>
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

              {/* Redesigned Bottom Layout: Setup Guide and Photos side-by-side */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border-shadow)"
              }}>
                {/* Column 1: Photos & Media */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                      📷 Product Media
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Manage item images and gallery</p>
                  </div>

                  {/* Primary Image Uploader (Required) */}
                  <div style={{ 
                    border: itemImage && itemImage.startsWith("/uploads") ? "1px solid var(--border-shadow)" : "1.5px dashed #dc2626",
                    background: "rgba(0,0,0,0.01)",
                    borderRadius: "8px", 
                    padding: "12px" 
                  }}>
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: itemImage && itemImage.startsWith("/uploads") ? "var(--text-main)" : "#dc2626", marginBottom: "8px" }}>
                      Primary Product Photo (Required) *
                    </span>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {itemImage && itemImage.startsWith("/uploads") ? (
                        <img 
                          src={itemImage} 
                          alt="Primary preview" 
                          style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-shadow)" }} 
                        />
                      ) : (
                        <div style={{ 
                          width: "64px", 
                          height: "64px", 
                          borderRadius: "8px", 
                          background: "rgba(220, 38, 38, 0.05)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          border: "1px dashed rgba(220, 38, 38, 0.3)",
                          color: "#dc2626",
                          fontSize: "1.2rem"
                        }}>
                          📷
                        </div>
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
                          style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                        >
                          {itemImage && itemImage.startsWith("/uploads") ? "Change Photo" : "Upload Photo *"}
                        </button>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>Recommended: 400x400px</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Gallery Photos (Optional) */}
                  <div style={{ 
                    border: "1px solid var(--border-shadow)",
                    background: "rgba(0,0,0,0.01)",
                    borderRadius: "8px", 
                    padding: "12px" 
                  }}>
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                      Gallery Photos (Optional)
                    </span>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "8px" }}>Showcase additional details or setups</p>
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
                      onClick={() => galleryFileRef.current.click()}
                      style={{ padding: "6px 12px", fontSize: "0.78rem", width: "100%", display: "flex", justifyContent: "center", gap: "6px" }}
                    >
                      ➕ Add Gallery Photos
                    </button>

                    {/* Gallery Images Grid */}
                    {galleryImages.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div className={styles.galleryGrid} style={{ gap: "8px" }}>
                          {galleryImages.map((path, idx) => (
                            <div key={idx} className={styles.galleryThumbWrapper} style={{ width: "45px", height: "45px" }}>
                              <img src={path} alt={`gallery-${idx}`} className={styles.galleryThumb} style={{ borderRadius: "4px" }} />
                              <button
                                type="button"
                                className={styles.deleteGalleryImgBtn}
                                onClick={() => handleRemoveGalleryImage(idx)}
                                title="Remove photo"
                                style={{ width: "14px", height: "14px", fontSize: "8px" }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Setup Guide (Tutorial Steps) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                      📖 Setup & Tutorial Guide
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Add steps to guide staff or customers</p>
                  </div>

                  <div style={{ 
                    border: "1px solid var(--border-shadow)",
                    background: "rgba(0,0,0,0.01)",
                    borderRadius: "8px", 
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    flex: 1
                  }}>
                    {tutorialSteps.length === 0 ? (
                      <div style={{ 
                        flex: 1, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "20px",
                        textAlign: "center",
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: "6px",
                        border: "1px dashed var(--border-shadow)",
                        minHeight: "80px"
                      }}>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          No instructions added yet. Create step-by-step assembly guides below.
                        </p>
                      </div>
                    ) : (
                      <ol className={styles.stepsList} style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", maxHeight: "150px" }}>
                        {tutorialSteps.map((step, idx) => (
                          <li key={idx} className={styles.stepItem} style={{ fontSize: "0.78rem", padding: "4px 0" }}>
                            <span className={styles.stepText}>{step}</span>
                            <button
                              type="button"
                              className={styles.removeStepBtn}
                              onClick={() => handleRemoveStep(idx)}
                              title="Delete Step"
                              style={{ width: "16px", height: "16px", fontSize: "8px" }}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className={styles.addStepRow} style={{ marginTop: "auto" }}>
                      <input
                        type="text"
                        placeholder="e.g. Align the backdrop frames together."
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        className={styles.stepInput}
                        style={{ fontSize: "0.78rem", padding: "8px 10px" }}
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
                        style={{ padding: "8px 12px", fontSize: "0.78rem" }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className={styles.addItemBtn}>
                ✦ {selectedItem ? "Save Changes" : "Create & Add to Category"}
              </button>
            </form>
          </div>
        </>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* RIGHT SECTION: Item List & Status Feed (Column 3)        */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className={styles.rightFeed}>
        <div className={styles.card} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2>📂 Items List</h2>
              <p>
                {activeCategory.label} ({activeCategoryItems.length})
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {itemSubCategory && (
                <button
                  type="button"
                  className={styles.deleteCategoryHeaderBtn}
                  style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                  onClick={(e) => triggerDeleteSubcategory(e, itemSubCategory)}
                  title="Delete Subcategory"
                >
                  🗑️ Delete Subcategory
                </button>
              )}
              {activeCategory && activeCategory.id !== "add_category" && (
                <button
                  type="button"
                  className={styles.deleteCategoryHeaderBtn}
                  onClick={() => triggerDeleteCategory(activeCategory.id)}
                  title="Delete Category"
                >
                  🗑️ Delete Category
                </button>
              )}
            </div>
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
                            {item.price} CAD
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
                          onClick={(e) => triggerDeleteItem(e, item.id)}
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

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleExecuteConfirm}
        title={confirmTitle}
        message={confirmMessage}
        requirePassword={confirmRequirePassword}
        confirmText="Verify & Confirm"
        errorMessage={confirmError}
        isLoading={confirmLoading}
      />
    </div>
  );
}
