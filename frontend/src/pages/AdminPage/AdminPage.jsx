import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";

// Initial mock data to bootstrap the frontend-only admin portal
const initialCategories = [
  { id: "birthday",       label: "Birthday",       emoji: "🎂", color: "#B8729A" },
  { id: "proposal",       label: "Proposal",       emoji: "💍", color: "#8B5CF6" },
  { id: "marriage",       label: "Marriage",       emoji: "💒", color: "#9F507C" },
  { id: "bridal-shower",  label: "Bridal Shower",  emoji: "🌸", color: "#D946EF" },
  { id: "baby-shower",    label: "Baby Shower",    emoji: "🍼", color: "#A78BFA" },
];

const initialItems = [
  { id: 1, name: "Luxury Arch & Floral Backdrop", description: "Vibrant pink and mauve floral arch for birthday photos and events.", categoryId: "birthday", isAvailable: true },
  { id: 2, name: "Neon LED 'Happy Birthday' Sign", description: "Bright white LED sign on premium acrylic board.", categoryId: "birthday", isAvailable: true },
  { id: 3, name: "Marry Me Light-up Letters", description: "Large 4ft marquee letters for marriage proposals.", categoryId: "proposal", isAvailable: true },
  { id: 4, name: "Red Rose Pathway & LED Candles", description: "Stunning rose petals and glass candles setup.", categoryId: "proposal", isAvailable: false },
  { id: 5, name: "Stage Floral Decoration", description: "Premium natural floral stage decoration for weddings.", categoryId: "marriage", isAvailable: true },
  { id: 6, name: "Welcome Signboard Gold Easel", description: "Golden metal easel with customizable floral arrangements.", categoryId: "marriage", isAvailable: true },
  { id: 7, name: "Pink Balloon Garland & Gold Ring", description: "Modern circular ring backdrop with organic balloon garland.", categoryId: "bridal-shower", isAvailable: true },
  { id: 8, name: "Bride-to-be Glitter Sash & Props", description: "Set of props and high-quality photo booth accessories.", categoryId: "bridal-shower", isAvailable: true },
  { id: 9, name: "Baby Blocks Table Decor", description: "B-A-B-Y table blocks filled with light pastel balloons.", categoryId: "baby-shower", isAvailable: true },
  { id: 10, name: "Teddy Bear Backdrop & Fluffy Clouds", description: "Soft clouds and large cute teddy bear prop for baby shower setups.", categoryId: "baby-shower", isAvailable: false },
];

const initialEnquiries = [
  { id: 1, name: "Fatima Akter", email: "fatima@example.com", occasion: "Wedding Reception", message: "Hi, I wanted to ask if you are available on September 12th for a stage decoration at Senakunja? Budget is 50,000 BDT.", date: "2026-06-08 14:32" },
  { id: 2, name: "Rashed Khan", email: "rashed@yahoo.com", occasion: "Proposal", message: "Looking for a candlelit pathway and rose backdrop setup for a rooftop proposal on June 20th.", date: "2026-06-08 11:15" },
  { id: 3, name: "Farhana Karim", email: "farhana@gmail.com", occasion: "Baby Shower", message: "I'd like to book the Teddy Bear Backdrop for June 28th. Do you handle delivery to Dhanmondi?", date: "2026-06-07 18:40" },
  { id: 4, name: "Tariqul Islam", email: "tariq@habib.co", occasion: "Birthday Party", message: "Need a simple black and gold balloon backdrop for my son's 10th birthday this Friday.", date: "2026-06-07 09:22" }
];

export default function AdminPage() {
  const navigate = useNavigate();

  // Dashboard state
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  
  // Navigation / Focus State
  // Can be a category ID (e.g. 'birthday') or 'enquiries'
  const [activeTab, setActiveTab] = useState("birthday");

  // Input states for adding new categories
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("✨");
  const [showAddCatForm, setShowAddCatForm] = useState(false);

  // Input states for adding new items
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/");
  };

  // Add Category Handler
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = newCatLabel.toLowerCase().replace(/\s+/g, "-");
    
    // Check if category already exists
    if (categories.some(cat => cat.id === id)) {
      alert("A category with this name already exists.");
      return;
    }

    const newCategory = {
      id,
      label: newCatLabel,
      emoji: newCatEmoji,
      color: "#9F507C"
    };

    setCategories([...categories, newCategory]);
    setActiveTab(id); // focus the new category
    setNewCatLabel("");
    setNewCatEmoji("✨");
    setShowAddCatForm(false);
  };

  // Delete Category Handler
  const handleDeleteCategory = (catId) => {
    if (window.confirm(`Are you sure you want to delete the category "${catId}"? All items inside will lose their category association.`)) {
      setCategories(categories.filter(cat => cat.id !== catId));
      
      // Update items that belonged to this category
      setItems(items.map(item => 
        item.categoryId === catId ? { ...item, categoryId: null } : item
      ));

      // Reset focus to the first available category, or enquiries
      const remaining = categories.filter(cat => cat.id !== catId);
      if (remaining.length > 0) {
        setActiveTab(remaining[0].id);
      } else {
        setActiveTab("enquiries");
      }
    }
  };

  // Toggle Item Availability Handler
  const handleToggleAvailability = (itemId) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  // Add Item Handler
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName,
      description: newItemDesc,
      categoryId: activeTab,
      isAvailable: true
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemDesc("");
  };

  // Delete Item Handler
  const handleDeleteItem = (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  // Active Category details
  const activeCategory = categories.find(cat => cat.id === activeTab);
  const activeCategoryItems = items.filter(item => item.categoryId === activeTab);

  return (
    <div className={styles.dashboard}>
      {/* ── Left Sidebar: Category Controls ────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarIcon}>✨</span>
          <div>
            <h3>FinalTouch</h3>
            <p>Admin Workspace</p>
          </div>
        </div>

        <nav className={styles.navigation}>
          <p className={styles.navLabel}>Item Categories</p>
          <ul className={styles.catList}>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`${styles.navBtn} ${activeTab === cat.id ? styles.active : ""}`}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setShowAddCatForm(false);
                  }}
                >
                  <span className={styles.btnEmoji}>{cat.emoji}</span>
                  <span className={styles.btnLabel}>{cat.label}</span>
                  <span className={styles.btnCount}>
                    {items.filter(item => item.categoryId === cat.id).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Category Controls (Add / Delete) */}
          <div className={styles.categoryControls}>
            {!showAddCatForm ? (
              <button 
                className={styles.addCategoryTrigger}
                onClick={() => {
                  setShowAddCatForm(true);
                  setActiveTab(""); // Clear active selection to focus on adding
                }}
              >
                ➕ Add New Category
              </button>
            ) : (
              <form onSubmit={handleAddCategory} className={styles.addCatForm}>
                <h4>New Category</h4>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    className={styles.catInput}
                    required
                    autoFocus
                  />
                  <select
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    className={styles.catEmojiSelect}
                  >
                    <option value="🎂">🎂</option>
                    <option value="💍">💍</option>
                    <option value="💒">💒</option>
                    <option value="🌸">🌸</option>
                    <option value="🍼">🍼</option>
                    <option value="🎈">🎈</option>
                    <option value="🥳">🥳</option>
                    <option value="👔">👔</option>
                    <option value="🎓">🎓</option>
                  </select>
                </div>
                <div className={styles.catFormActions}>
                  <button type="submit" className={styles.saveCatBtn}>Save</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddCatForm(false);
                      if (categories.length > 0) setActiveTab(categories[0].id);
                    }} 
                    className={styles.cancelCatBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activeCategory && (
              <button
                className={styles.deleteCategoryBtn}
                onClick={() => handleDeleteCategory(activeCategory.id)}
              >
                🗑️ Delete "{activeCategory.label}"
              </button>
            )}
          </div>

          <div className={styles.divider}></div>

          <p className={styles.navLabel}>System Views</p>
          <ul className={styles.sysList}>
            <li>
              <button
                className={`${styles.navBtn} ${activeTab === "enquiries" ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab("enquiries");
                  setShowAddCatForm(false);
                }}
              >
                <span className={styles.btnEmoji}>✉️</span>
                <span className={styles.btnLabel}>User Enquiries</span>
                <span className={styles.btnCount}>{enquiries.length}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout <span>🚪</span>
          </button>
        </div>
      </aside>

      {/* ── Right Main Area: Specific Task Controls ────────────────────────────── */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>
              {activeTab === "enquiries" && "Customer Enquiries"}
              {activeCategory && `${activeCategory.emoji} ${activeCategory.label} Management`}
              {activeTab === "" && "Create New Category"}
            </h1>
            <p>
              {activeTab === "enquiries" && "Review booking leads and user contact messages"}
              {activeCategory && `Manage items, pricing configurations and availability for ${activeCategory.label}`}
              {activeTab === "" && "Setup a custom category filter for your gallery"}
            </p>
          </div>
          <div className={styles.adminBadge}>
            <span className={styles.badgePulse}></span>
            Khaled (Administrator)
          </div>
        </header>

        <section className={styles.contentBody}>
          {/* 1. Category Specific Controls & Item Inventory Tasks */}
          {activeCategory && (
            <div className={styles.categoryGrid}>
              {/* Task Controls: Inventory Table */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Inventory Items ({activeCategoryItems.length})</h2>
                  <p>Manual status overrides and database controls</p>
                </div>

                {activeCategoryItems.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No items configured in this category yet.</p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Item Details</th>
                          <th>Description</th>
                          <th>Availability Task</th>
                          <th>Admin Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCategoryItems.map((item) => (
                          <tr key={item.id}>
                            <td className={styles.itemNameCol}>
                              <strong>{item.name}</strong>
                              <span className={styles.itemIdTag}>ID: #{item.id}</span>
                            </td>
                            <td className={styles.itemDescCol}>{item.description}</td>
                            <td>
                              <div className={styles.availabilityToggle}>
                                <span className={`${styles.statusLabel} ${item.isAvailable ? styles.statusAvailable : styles.statusBooked}`}>
                                  {item.isAvailable ? "Available" : "Fully Booked"}
                                </span>
                                <label className={styles.switch}>
                                  <input
                                    type="checkbox"
                                    checked={item.isAvailable}
                                    onChange={() => handleToggleAvailability(item.id)}
                                  />
                                  <span className={styles.slider}></span>
                                </label>
                              </div>
                            </td>
                            <td>
                              <button
                                className={styles.deleteItemBtn}
                                onClick={() => handleDeleteItem(item.id)}
                                title="Delete item"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Task Controls: Add New Item Form */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Create New Item</h2>
                  <p>Add a rental prop or service setup to this category</p>
                </div>

                <form onSubmit={handleAddItem} className={styles.itemForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="itemName">Item Title / Name</label>
                    <input
                      id="itemName"
                      type="text"
                      placeholder="e.g. Vintage Velvet Sofa"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="itemDesc">Details / Description</label>
                    <textarea
                      id="itemDesc"
                      rows={4}
                      placeholder="Specify dimensions, setup color schemes, and inclusion details..."
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                    />
                  </div>

                  <button type="submit" className={styles.addItemBtn}>
                    ✦ Add Item to Inventory
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. User Enquiries / Leads Panel (Get Any User Data) */}
          {activeTab === "enquiries" && (
            <div className={styles.fullWidthCard}>
              <div className={styles.cardHeader}>
                <h2>Received Leads Inbox</h2>
                <p>Visitor inquiries and user-submitted data</p>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User Info</th>
                      <th>Requested Occasion</th>
                      <th>Message & Vision</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enq) => (
                      <tr key={enq.id}>
                        <td className={styles.dateCol}>{enq.date}</td>
                        <td className={styles.userCol}>
                          <strong>{enq.name}</strong>
                          <a href={`mailto:${enq.email}`} className={styles.userEmail}>
                            {enq.email}
                          </a>
                        </td>
                        <td className={styles.occasionCol}>
                          <span className={styles.occasionBadge}>{enq.occasion || "General Enquiry"}</span>
                        </td>
                        <td className={styles.messageCol}>{enq.message}</td>
                        <td>
                          <button
                            className={styles.replyBtn}
                            onClick={() => window.location.href = `mailto:${enq.email}?subject=FinalTouch Studio - Regarding your enquiry`}
                          >
                            ✉️ Reply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Category Creation Guide (when clicking add new category button) */}
          {activeTab === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Setup Category</h2>
                <p>Use the left panel category controls to design and save your new filter category.</p>
              </div>
              <div className={styles.guideContent}>
                <div className={styles.guideStep}>
                  <span className={styles.stepNum}>1</span>
                  <p>Choose an appropriate emoji representitive (e.g. 🥳 for celebrations).</p>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.stepNum}>2</span>
                  <p>Enter a name that will be displayed in user gallery filter buttons.</p>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.stepNum}>3</span>
                  <p>Click "Save" to mount the category. You can then immediately start adding inventory items to it!</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
