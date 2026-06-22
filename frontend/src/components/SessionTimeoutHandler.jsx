import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ADMIN_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const USER_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

export default function SessionTimeoutHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSessions = () => {
      const adminToken = localStorage.getItem("admin_token");
      const adminLoginTime = localStorage.getItem("admin_login_time");
      const userToken = localStorage.getItem("user_token");
      const userLoginTime = localStorage.getItem("user_login_time");
      const now = Date.now();

      // Check Admin session
      if (adminToken) {
        let loginTime = adminLoginTime ? parseInt(adminLoginTime, 10) : null;
        if (!loginTime) {
          // If token exists but no timestamp is recorded yet, set it to now to be safe
          loginTime = now;
          localStorage.setItem("admin_login_time", now.toString());
        }

        if (now - loginTime > ADMIN_TIMEOUT) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_login_time");
          localStorage.removeItem("user_info");
          navigate("/khaledadmin");
          // Refresh the page to clear any in-memory state/context if not already on the login page
          if (location.pathname !== "/khaledadmin") {
            window.location.reload();
          }
          return;
        }
      }

      // Check User session
      if (userToken) {
        let loginTime = userLoginTime ? parseInt(userLoginTime, 10) : null;
        if (!loginTime) {
          loginTime = now;
          localStorage.setItem("user_login_time", now.toString());
        }

        if (now - loginTime > USER_TIMEOUT) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_login_time");
          localStorage.removeItem("user_info");
          navigate("/login");
          if (location.pathname !== "/login") {
            window.location.reload();
          }
          return;
        }
      }
    };

    // Check immediately on mount/render
    checkSessions();

    // Check every 10 seconds
    const interval = setInterval(checkSessions, 10000);
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return null;
}
