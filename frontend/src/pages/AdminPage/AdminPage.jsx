import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";
import { get, post, put, del } from "../../api/client";
import { getEnquiries, markAllEnquiriesRead } from "../../api/bookings.api";
import { compressImage } from "../../utils/imageCompressor";

// Modular Imports
import {
  initialMembers,
  initialPayments,
} from "./mockData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ItemsTab from "./components/ItemsTab";
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
  const [enquiries, setEnquiries] = useState([]);
  const [members, setMembers] = useState(initialMembers);
  const [payments, setPayments] = useState(initialPayments);

  const refreshData = () => {
    get("/categories")
      .then((data) => {
        setCategories(data);
        // Default active tab to first category if not set or invalid
        if (data.length > 0) {
          setItemCategoryFilter((prev) => {
            if (prev === "all" || data.some((c) => c.id === prev)) return prev;
            return data[0].id;
          });
        }
      })
      .catch((err) => console.error("Error loading admin categories:", err));

    get("/items")
      .then((data) => setItems(data))
      .catch((err) => console.error("Error loading admin items:", err));
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Nav Selection
  const [activeTab, setActiveTab] = useState("items");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const addItemFormRef = useRef(null);

  // Item additions
  const [newItemSN, setNewItemSN] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPic, setNewItemPic] = useState("✨");
  const [newItemSubCategory, setNewItemSubCategory] = useState("");
  const [newItemFile, setNewItemFile] = useState(null);
  const [newItemUnitCount, setNewItemUnitCount] = useState(1);

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

  const fetchEnquiries = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token || token === "mock_khaled_admin_token") return;

    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleAddNewItemNav = () => {
    setActiveTab("items");
    setSearchQuery("");
    if (itemCategoryFilter === "all" && categories.length > 0) {
      setItemCategoryFilter(categories[0].id);
    }
    requestAnimationFrame(() => {
      addItemFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Toggle Item Availability
  const handleToggleAvailability = async (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      const updatedItem = await put(`/items/${itemId}`, {
        ...item,
        isAvailable: !Boolean(item.isAvailable),
      });
      setItems(items.map((i) => (i.id === itemId ? updatedItem : i)));
    } catch (err) {
      alert("Failed to toggle availability: " + err.message);
    }
  };

  // Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemSN.trim()) return;

    const sn = newItemSN.trim().toLowerCase();
    if (items.some((item) => (item.id || "").toLowerCase() === sn)) {
      alert("Unique Serial Number required. This one already exists!");
      return;
    }

    if (itemCategoryFilter === "all") {
      alert("Please select a target category in the add form.");
      return;
    }
    const targetCategory = itemCategoryFilter;

    try {
      let imagePath = newItemPic || "✨";

      if (newItemFile) {
        const compressedFile = await compressImage(newItemFile);
        const formData = new FormData();
        formData.append("image", compressedFile);

        const token = localStorage.getItem("admin_token");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        imagePath = uploadData.path;
      }

      const createdItem = await post("/items", {
        id: newItemSN.trim(),
        serialNumber: newItemSN.trim(),
        name: newItemName,
        title: newItemName,
        description: newItemDesc,
        categoryId: targetCategory,
        subCategoryId: newItemSubCategory,
        isAvailable: true,
        unit_count: newItemUnitCount,
        image: imagePath
      });

      setItems([...items, createdItem]);
      setNewItemName("");
      setNewItemDesc("");
      setNewItemSN("");
      setNewItemPic("✨");
      setNewItemSubCategory("");
      setNewItemFile(null);
      setNewItemUnitCount(1);
    } catch (err) {
      alert("Failed to add item: " + err.message);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Delete this item permanently?")) {
      try {
        await del(`/items/${itemId}`);
        setItems(items.filter((item) => item.id !== itemId));
      } catch (err) {
        alert("Failed to delete item: " + err.message);
      }
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
  const handleMarkAllRead = async () => {
    try {
      await markAllEnquiriesRead();
      setEnquiries(enquiries.map((e) => ({ ...e, read: true })));
    } catch (err) {
      console.error("Failed to mark enquiries as read:", err);
    }
  };

  // Filters & Counts
  const unreadEnquiriesCount = enquiries.filter((e) => !e.read).length;

  const normalize = (value) => String(value ?? "").toLowerCase().trim();

  const getItemSearchText = (item) =>
    [
      item.name,
      item.title,
      item.description,
      item.subCategoryId,
      item.categoryId,
      categories.find((c) => c.id === item.categoryId)?.label,
    ]
      .map(normalize)
      .filter(Boolean)
      .join(" ");

  const getMemberSearchText = (mem) =>
    [mem.name, mem.email, mem.phone, mem.id, mem.status, mem.joinDate]
      .map(normalize)
      .filter(Boolean)
      .join(" ");

  // Search Results evaluation (client-side over loaded admin data)
  const getSearchResults = () => {
    const query = normalize(searchQuery);
    if (!query) return [];

    if (searchType === "items_title") {
      return items.filter((item) => getItemSearchText(item).includes(query));
    }
    if (searchType === "items_serial") {
      return items.filter((item) => {
        const serial = normalize(item.serialNumber || item.id);
        return serial.includes(query);
      });
    }
    if (searchType === "members") {
      return members.filter((mem) => getMemberSearchText(mem).includes(query));
    }
    if (searchType === "enquiries") {
      return enquiries.filter((enq) =>
        [enq.name, enq.email, enq.occasion, enq.message, enq.date]
          .map(normalize)
          .filter(Boolean)
          .join(" ")
          .includes(query)
      );
    }
    return [];
  };

  const searchResults = getSearchResults();

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Section */}
      <Sidebar
        items={items}
        members={members}
        payments={payments}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onAddNewItem={handleAddNewItemNav}
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
              setActiveTab={setActiveTab}
              setItemCategoryFilter={setItemCategoryFilter}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* B. Items Management */}
          {activeTab === "items" && searchQuery.trim() === "" && (
            <ItemsTab
              categories={categories}
              items={items}
              itemCategoryFilter={itemCategoryFilter}
              setItemCategoryFilter={setItemCategoryFilter}
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
              newItemFile={newItemFile}
              setNewItemFile={setNewItemFile}
              newItemUnitCount={newItemUnitCount}
              setNewItemUnitCount={setNewItemUnitCount}
              addFormRef={addItemFormRef}
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

        </section>
      </main>
    </div>
  );
}
