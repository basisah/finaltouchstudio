import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Footer from "../../components/Footer/Footer";
import styles from "./CustomerLoginPage.module.css";

export default function CustomerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { syncCartAfterLogin } = useCart();

  const redirectPath =
    location.state?.from ||
    new URLSearchParams(location.search).get("redirect") ||
    "/";

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = isSignUp ? { name, email, password } : { email, password };
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("user_token", data.token);
        if (data.user) {
          localStorage.setItem("user_info", JSON.stringify(data.user));
        }
        await syncCartAfterLogin();
        navigate(redirectPath);
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    setError("");
    setIsLoading(true);

    try {
      const apiRes = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await apiRes.json();

      if (apiRes.ok && data.token) {
        localStorage.setItem("user_token", data.token);
        if (data.user) {
          localStorage.setItem("user_info", JSON.stringify(data.user));
        }
        await syncCartAfterLogin();
        navigate(redirectPath);
      } else {
        setError(data.error || "Google Sign-In failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify Google token with backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let initialized = false;

    const initGoogleButton = () => {
      if (window.google && !initialized) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1000000000000-dummyid.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("customerGoogleSignInBtn"),
          { theme: "outline", size: "large", width: "356" }
        );
        initialized = true;
        return true;
      }
      return false;
    };

    const success = initGoogleButton();
    if (success) return;

    const timer = setInterval(() => {
      if (initGoogleButton()) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
      <div className={styles.glowBg1}></div>
      <div className={styles.glowBg2}></div>
      
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logoSection}>
            <span className={styles.logoEmoji}>✨</span>
            <p className={styles.brandSubtitle}>FinalTouch Studio</p>
            <h1 className={styles.brandTitle}>{isSignUp ? "Create Account" : "Customer Login"}</h1>
          </div>

          <form onSubmit={handleAuthSubmit} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            {isSignUp && (
              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fatima Akter"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {isLoading ? "Verifying..." : isSignUp ? "Sign Up & Get Started" : "Sign In"}
            </button>
          </form>

          <div className={styles.divider}>or</div>

          <div id="customerGoogleSignInBtn" className={styles.googleBtnWrapper}></div>

          <div className={styles.toggleText}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }} 
              className={styles.toggleLink}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
