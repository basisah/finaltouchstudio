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

  return <Navigate to="/" replace />;
}
