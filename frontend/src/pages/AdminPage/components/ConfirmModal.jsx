import React, { useState, useEffect } from "react";
import styles from "../AdminPage.module.css";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "🗑️ Confirm Action",
  message = "Are you sure you want to proceed?",
  requirePassword = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  errorMessage = "",
  isLoading = false,
}) {
  const [password, setPassword] = useState("");

  // Reset password field whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requirePassword && !password.trim()) {
      return alert("Password is required");
    }
    onConfirm(password);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(34, 12, 27, 0.65)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      animation: "fadeIn 0.25s ease-out",
    }}>
      <div className={styles.card} style={{
        width: "420px",
        maxWidth: "90%",
        padding: "32px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
        border: "1px solid var(--border-shadow)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h3 style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--text-main)",
            margin: 0,
            fontFamily: "var(--font-serif)"
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: "0.88rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
            margin: 0
          }}>
            {message}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: "600",
            textAlign: "center",
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {requirePassword && (
            <div className={styles.inputGroup}>
              <label htmlFor="modalPassword" style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Confirm Admin Password
              </label>
              <input
                id="modalPassword"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-shadow)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.95rem"
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              onClick={() => {
                setPassword("");
                onClose();
              }}
              disabled={isLoading}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                padding: "8px 16px"
              }}
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.addItemBtn}
              style={{
                width: "auto",
                margin: 0,
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--btn-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 4px 12px var(--border-shadow)"
              }}
            >
              {isLoading ? "Verifying..." : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
