import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";

// Modular Imports
import {
  initialCategories,
  initialItems,
  initialEnquiries,
  initialMembers,
  initialPayments,
} from "./mockData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import InventoryTab from "./components/InventoryTab";
import MembersTab from "./components/MembersTab";
import PaymentsTab from "./components/PaymentsTab";
import EnquiriesTab from "./components/EnquiriesTab";
import GlobalSearchTab from "./components/GlobalSearchTab";
import PackagesTab from "./components/PackagesTab";

export default function AdminPage() {
  const navigate = useNavigate();

  // Core Dashboard State (bootstrapped from mockData file)
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [members, setMembers] = useState(initialMembers);
  const [payments, setPayments] = useState(initialPayments);

  // Nav Selection
  const [activeTab, setActiveTab] = useState("birthday");

  // Category additions
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🎂");
  const [showAddCatForm, setShowAddCatForm] = useState(false);

  // Item additions
  const [newItemSN, setNewItemSN] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPic, setNewItemPic] = useState("✨");
  const [newItemSubCategory, setNewItemSubCategory] = useState("");

  // Member additions
  const [newMemName, setNewMemName] = useState("");
  const [newMemEmail, setNewMemEmail] = useState("");
  const [newMemPhone, setNewMemPhone] = useState("");

  // Payment additions
  const [newPayMember, setNewPayMember] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [newPayMethod, setNewPayMethod] = useState("bKash");

  // Global Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("items_title");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/");
  };

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const id = newCatLabel.toLowerCase().replace(/\s+/g, "-");
    if (categories.some((cat) => cat.id === id)) {
      alert("Category already exists.");
      return;
    }
    const newCategory = { id, label: newCatLabel, emoji: newCatEmoji, color: "#9F507C" };
    setCategories([...categories, newCategory]);
    setActiveTab(id);
    setNewCatLabel("");
    setNewCatEmoji("🎂");
    setShowAddCatForm(false);
  };

  // Delete Category
  const handleDeleteCategory = (catId) => {
    if (window.confirm(`Delete category "${catId}"? Items inside will lose their category.`)) {
      setCategories(categories.filter((cat) => cat.id !== catId));
      setItems(items.map((item) => (item.categoryId === catId ? { ...item, categoryId: null } : item)));
      const remaining = categories.filter((cat) => cat.id !== catId);
      setActiveTab(remaining.length > 0 ? remaining[0].id : "enquiries");
    }
  };

  // Toggle Item Availability
  const handleToggleAvailability = (itemId) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item)));
  };

  // Add Item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemSN.trim()) return;

    if (items.some((item) => item.serialNumber.toLowerCase() === newItemSN.toLowerCase())) {
      alert("Unique Serial Number required. This one already exists!");
      return;
    }

    const newItem = {
      id: Date.now(),
      serialNumber: newItemSN.trim(),
      name: newItemName,
      description: newItemDesc,
      categoryId: activeTab,
      subCategoryId: newItemSubCategory,
      isAvailable: true,
      image: newItemPic || "✨",
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemSN("");
    setNewItemPic("✨");
    setNewItemSubCategory("");
  };

  // Delete Item
  const handleDeleteItem = (itemId) => {
    if (window.confirm("Delete this item permanently?")) {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  // Add Member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemEmail.trim()) return;
    const newMember = {
      id: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newMemName,
      email: newMemEmail,
      phone: newMemPhone || "N/A",
      joinDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };
    setMembers([...members, newMember]);
    setNewMemName("");
    setNewMemEmail("");
    setNewMemPhone("");
  };

  // Toggle Member Active Status
  const handleToggleMemberStatus = (memberId) => {
    setMembers(
      members.map((mem) =>
        mem.id === memberId ? { ...mem, status: mem.status === "Active" ? "Inactive" : "Active" } : mem
      )
    );
  };

  // Record Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!newPayMember || !newPayAmount) return;
    const newPayment = {
      id: `TXN-${Math.floor(9000 + Math.random() * 1000)}`,
      memberName: newPayMember,
      amount: `${newPayAmount} BDT`,
      date: new Date().toISOString().split("T")[0],
      method: newPayMethod,
      status: "Completed",
    };
    setPayments([...payments, newPayment]);
    setNewPayAmount("");
    setNewPayMember("");
  };

  // Toggle Payment Complete/Pending status
  const handleTogglePaymentStatus = (payId) => {
    setPayments(
      payments.map((pay) =>
        pay.id === payId ? { ...pay, status: pay.status === "Completed" ? "Pending" : "Completed" } : pay
      )
    );
  };

  // Mark all enquiries as read
  const handleMarkAllRead = () => {
    setEnquiries(enquiries.map((e) => ({ ...e, read: true })));
  };

  // Filters & Counts
  const activeCategory = categories.find((cat) => cat.id === activeTab);
  const activeCategoryItems = items.filter((item) => item.categoryId === activeTab);
  const unreadEnquiriesCount = enquiries.filter((e) => !e.read).length;

  // Search Results evaluation
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    if (searchType === "items_title") {
      return items.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
      );
    } else if (searchType === "items_serial") {
      return items.filter((item) => item.serialNumber.toLowerCase().includes(query));
    } else if (searchType === "members") {
      return members.filter(
        (mem) =>
          mem.name.toLowerCase().includes(query) ||
          mem.email.toLowerCase().includes(query) ||
          mem.id.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const searchResults = getSearchResults();

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Section */}
      <Sidebar
        categories={categories}
        items={items}
        members={members}
        payments={payments}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showAddCatForm={showAddCatForm}
        setShowAddCatForm={setShowAddCatForm}
        newCatLabel={newCatLabel}
        setNewCatLabel={setNewCatLabel}
        newCatEmoji={newCatEmoji}
        setNewCatEmoji={setNewCatEmoji}
        handleAddCategory={handleAddCategory}
        handleDeleteCategory={handleDeleteCategory}
        setSearchQuery={setSearchQuery}
        handleLogout={handleLogout}
      />

      {/* Main Panel Content Area */}
      <main className={styles.mainContent}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          unreadEnquiriesCount={unreadEnquiriesCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleMarkAllRead={handleMarkAllRead}
        />

        <section className={styles.contentBody}>
          {/* A. Global Search View Overlay */}
          {searchQuery.trim() !== "" && (
            <GlobalSearchTab
              searchQuery={searchQuery}
              searchType={searchType}
              searchResults={searchResults}
              categories={categories}
              setActiveTab={setActiveTab}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* B. Default Tab Route: Category Items Inventory */}
          {activeCategory && searchQuery.trim() === "" && (
            <InventoryTab
              activeCategory={activeCategory}
              activeCategoryItems={activeCategoryItems}
              handleToggleAvailability={handleToggleAvailability}
              handleDeleteItem={handleDeleteItem}
              handleAddItem={handleAddItem}
              newItemSN={newItemSN}
              setNewItemSN={setNewItemSN}
              newItemPic={newItemPic}
              setNewItemPic={setNewItemPic}
              newItemName={newItemName}
              setNewItemName={setNewItemName}
              newItemDesc={newItemDesc}
              setNewItemDesc={setNewItemDesc}
              newItemSubCategory={newItemSubCategory}
              setNewItemSubCategory={setNewItemSubCategory}
            />
          )}

          {/* C. Default Tab Route: Members Directory */}
          {activeTab === "members" && searchQuery.trim() === "" && (
            <MembersTab
              members={members}
              handleToggleMemberStatus={handleToggleMemberStatus}
              handleAddMember={handleAddMember}
              newMemName={newMemName}
              setNewMemName={setNewMemName}
              newMemEmail={newMemEmail}
              setNewMemEmail={setNewMemEmail}
              newMemPhone={newMemPhone}
              setNewMemPhone={setNewMemPhone}
            />
          )}

          {/* D. Default Tab Route: Payments Ledger */}
          {activeTab === "payments" && searchQuery.trim() === "" && (
            <PaymentsTab
              payments={payments}
              members={members}
              handleTogglePaymentStatus={handleTogglePaymentStatus}
              handleRecordPayment={handleRecordPayment}
              newPayMember={newPayMember}
              setNewPayMember={setNewPayMember}
              newPayAmount={newPayAmount}
              setNewPayAmount={setNewPayAmount}
              newPayMethod={newPayMethod}
              setNewPayMethod={setNewPayMethod}
            />
          )}

          {/* E. Default Tab Route: Leads Enquiries Inbox */}
          {activeTab === "enquiries" && searchQuery.trim() === "" && (
            <EnquiriesTab enquiries={enquiries} />
          )}

          {/* G. Packages Management Tab */}
          {activeTab === "packages" && searchQuery.trim() === "" && (
            <PackagesTab />
          )}

          {/* F. Category Setup Guide (when clicking add new category button) */}
          {activeTab === "" && searchQuery.trim() === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Setup Category</h2>
                <p>Use the left panel category controls to design and save your new filter category.</p>
              </div>
              <div className={styles.guideContent}>
                <div className={styles.guideStep}>
                  <span className={styles.stepNum}>1</span>
                  <p>Choose an appropriate emoji representitive (e.g. 🎓 for education).</p>
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
