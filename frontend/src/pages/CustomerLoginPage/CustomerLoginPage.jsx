import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import AuthShell from "../../components/layout/AuthShell";
import { Alert, Button, Field } from "../../components/ui";
import styles from "./CustomerLoginPage.module.css";

/** Stores the customer session exactly as the rest of the app expects it. */
function storeSession(data) {
  localStorage.setItem("user_token", data.token);
  localStorage.setItem("user_login_time", Date.now().toString());
  if (data.user) localStorage.setItem("user_info", JSON.stringify(data.user));
}

export default function CustomerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Return the customer to where they came from (for example the cart).
  const redirectPath = location.state?.from || "/";

  const authenticate = async (path, payload, fallbackMessage) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        storeSession(data);
        navigate(redirectPath);
      } else {
        setError(data.error || fallbackMessage);
      }
    } catch {
      setError("We could not reach the sign-in service. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSignUp) authenticate("/auth/register", { name, email, password }, "We could not create your account.");
    else authenticate("/auth/login", { email, password }, "Sign-in failed. Please check your email and password.");
  };

  // Keep the latest handler without re-initialising the Google button.
  const googleHandler = useRef(null);
  googleHandler.current = (response) =>
    authenticate("/auth/google", { credential: response.credential }, "Google sign-in failed.");

  useEffect(() => {
    let initialised = false;
    const init = () => {
      if (!window.google || initialised || !googleButtonRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1000000000000-dummyid.apps.googleusercontent.com",
        callback: (response) => googleHandler.current(response),
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: Math.min(360, googleButtonRef.current.offsetWidth || 360),
      });
      initialised = true;
      return true;
    };

    if (init()) return undefined;
    // The Google script loads asynchronously; retry until it is ready.
    const timer = setInterval(() => init() && clearInterval(timer), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <AuthShell
      eyebrow="FinalTouch Studio"
      title={isSignUp ? "Create your account" : "Welcome back"}
      lead={isSignUp ? "Save your details and keep track of your bookings." : "Sign in to manage your bookings and check out faster."}
      footer={<Link to="/">← Back to the website</Link>}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}

        {isSignUp && (
          <Field label="Full name" autoComplete="name" required disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" block loading={isLoading}>
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className={styles.divider}>or</div>
      <div ref={googleButtonRef} className={styles.google} />

      <p className={styles.toggle}>
        {isSignUp ? "Already have an account?" : "New to FinalTouch Studio?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsSignUp((value) => !value);
            setError("");
          }}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </AuthShell>
  );
}
