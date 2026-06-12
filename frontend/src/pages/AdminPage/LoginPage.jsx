import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/admin/auth.api";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginAdmin(username, password);

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        if (data.user) {
          localStorage.setItem("user_info", JSON.stringify(data.user));
        }
        navigate("/admin");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to authentication server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.wrapper}>
      <div className={styles.glowBg1}></div>
      <div className={styles.glowBg2}></div>
      
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logoSection}>
            <span className={styles.logoEmoji}>✨</span>
            <p className={styles.brandSubtitle}>FinalTouch Studio</p>
            <h1 className={styles.brandTitle}>Admin Portal</h1>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className={styles.loginBtn}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
