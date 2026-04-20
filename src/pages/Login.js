import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "../api/api";
import logo from "../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATES
  const [tapCount, setTapCount] = useState(0);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // ✅ NEW

  // ================= DEVICE DETECT =================
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
  }, []);

  // ================= AUTO LOGIN =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "Admin") window.location.replace("/admin");
      else if (role === "Terminal") window.location.replace("/terminal");
      else if (role === "Beneficiary") window.location.replace("/beneficiary");
    }
  }, []);

  // 🔥 ADMIN UNLOCK LOGIC
  useEffect(() => {
    if (tapCount >= 10) {
      setAdminUnlocked(true);
      alert("🔓 Admin Login Unlocked");
    }
  }, [tapCount]);

  // ================= LOGIN FUNCTION =================
  const login = async () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest(
        "/api/auth/login",
        "POST",
        { username, password }
      );

      if (!res || !res.token || !res.role) {
        throw new Error("Invalid server response");
      }

      // 🔥 FIXED LOGIC
      if (res.role === "Admin") {
        if (isMobile && !adminUnlocked) {
          alert("❌ Admin login not allowed on mobile");
          setLoading(false);
          return;
        }
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      setTimeout(() => {
        if (res.role === "Admin") window.location.replace("/admin");
        else if (res.role === "Terminal") window.location.replace("/terminal");
        else if (res.role === "Beneficiary") window.location.replace("/beneficiary");
        else {
          alert("Unknown role");
          localStorage.clear();
        }
      }, 300);

    } catch (err) {
      alert(err.message || "Invalid credentials");
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="login-bg">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ===== LOGO ===== */}
        <img
          src={logo}
          alt="RMS Logo"
          className="login-logo"
          onClick={() => setTapCount(prev => prev + 1)}
        />

        {/* ===== TITLE ===== */}
        <div className="login-header">
          <h2>Kit Distribution System</h2>
          <p>Secure Login Portal</p>
        </div>

        {/* ===== USERNAME ===== */}
        <input
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* ===== PASSWORD ===== */}
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ===== BUTTON ===== */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.15 }}
          onClick={login}
          disabled={loading}
          className="login-btn"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Login;