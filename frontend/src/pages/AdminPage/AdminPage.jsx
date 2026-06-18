import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";
import { get, post, put, del } from "../../api/client";
import { compressImage } from "../../utils/imageCompressor";
import { getSortedCategories } from "../../utils/categoryHelper";

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
import CategoriesTab from "./components/CategoriesTab";

export default function AdminPage() {
  const navigate = useNavigate();

  // Core Dashboard State (bootstrapped from DB and mockData file)
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [members, setMembers] = useState(initialMembers);
  const [payments, setPayments] = useState(initialPayments);

  const refreshData = () => {
    get("/categories")
      .then((data) => {
        const { allItemsCategories } = getSortedCategories(data || []);
        setCategories(allItemsCategories);
        // Default active tab to first category if not set or invalid
        if (allItemsCategories.length > 0) {
          setActiveTab((prev) => {
            const tabsList = ["members", "payments", "packages", "enquiries", "categories"];
            if (tabsList.includes(prev)) return prev;
            if (allItemsCategories.some(c => c.id === prev)) return prev;
            return allItemsCategories[0].id;
          });
        }
      })
      .catch((err) => console.error("Error loading admin categories:", err));

    get("/items?all=true")
      .then((data) => setItems(data))
      .catch((err) => console.error("Error loading admin items:", err));
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Nav Selection
  const [activeTab, setActiveTab] = useState("proposal");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      amount: `${newPayAmount} CAD`,
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

  const onTriggerAddCategory = () => {
    setActiveTab("add_category");
  };

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
        onTriggerAddCategory={onTriggerAddCategory}
        setSearchQuery={setSearchQuery}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
          {(activeCategory || activeTab === "add_category") && searchQuery.trim() === "" && (
            <InventoryTab
              activeCategory={activeCategory || { id: "add_category", label: "Add Category", emoji: "➕" }}
              activeCategoryItems={activeCategoryItems}
              refreshData={refreshData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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

          {/* H. Categories Management Tab */}
          {activeTab === "categories" && searchQuery.trim() === "" && (
            <CategoriesTab categories={categories} onRefresh={refreshData} />
          )}

          {/* I. General Settings Tab */}
          {activeTab === "general_settings" && searchQuery.trim() === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>⚙️ General Settings</h2>
                <p>Manage system-wide configuration, business rules, and branding metadata.</p>
              </div>
              <div className={styles.emptyState}>
                <p>System configuration panel is loaded and active. Ready for deployment integrations.</p>
              </div>
            </div>
          )}

          {/* J. Analytics Dashboard Tab */}
          {activeTab === "analytics" && searchQuery.trim() === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>📊 Live Analytics Dashboard</h2>
                <p>Overview of sales metrics, popular item rentals, category performance, and client trends.</p>
              </div>
              <div className={styles.emptyState}>
                <p>No analytical data recorded for this billing cycle. Try making checkout reservations first.</p>
              </div>
            </div>
          )}

          {/* K. User Management Tab */}
          {activeTab === "user_management" && searchQuery.trim() === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>👤 User & Staff Management</h2>
                <p>Manage staff privileges, register new administrators, and review customer access tokens.</p>
              </div>
              <div className={styles.emptyState}>
                <p>Active Administrator Directory. Use database controls to register secondary workspace credentials.</p>
              </div>
            </div>
          )}

          {/* F. Category Setup Guide (fallback empty activeTab state) */}
          {activeTab === "" && searchQuery.trim() === "" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Setup Category</h2>
                <p>Use the left panel category controls to design and save your new filter category.</p>
              </div>
              <div className={styles.guideContent}>
                <div className={styles.guideStep}>
                  <span className={styles.stepNum}>1</span>
                  <p>Choose an appropriate emoji representative (e.g. 🎓 for education).</p>
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
