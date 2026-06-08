import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { get } from "../api/client";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        await get("/auth/verify");
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  if (isAuthenticated) {
    return children;
  }

  // Inline Login Form for Admin Path
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    try {
      const { post } = await import('../api/client');
      const res = await post("/auth/login", { username, password });
      if (res.token) {
        localStorage.setItem("admin_token", res.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      alert("Invalid credentials.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Admin Access</h3>
        <input name="username" type="text" placeholder="Username" required style={{ padding: '8px' }} />
        <input name="password" type="password" placeholder="Password" required style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
}
