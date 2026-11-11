import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import AuthShell from "../../components/layout/AuthShell";
import { Alert, Button, Field } from "../../components/ui";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_login_time", Date.now().toString());
        if (data.user) localStorage.setItem("user_info", JSON.stringify(data.user));
        navigate("/admin");
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch {
      setError("We could not reach the sign-in service. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="FinalTouch Studio"
      title="Admin portal"
      lead="Sign in to manage inventory, packages and bookings."
      footer={<Link to="/">← Back to the website</Link>}
    >
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {error && <Alert tone="error">{error}</Alert>}
        <Field
          label="Username"
          autoComplete="username"
          required
          disabled={isLoading}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" block loading={isLoading}>
          Open dashboard
        </Button>
      </form>
    </AuthShell>
  );
}
