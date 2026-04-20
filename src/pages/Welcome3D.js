import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/welcome3d.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => navigate("/login"), 700);
  };

  return (
    <div className="welcome-container">

      {/* MAIN 3D BOX */}
      <div className="main-box">

        <h1 className="title">Kit Distribution System</h1>
        <p className="subtitle">Fast • Secure • Efficient</p>

        {/* FEATURES */}
        <div className="features">
          <div className="feature">📦 Distribution</div>
          <div className="feature">👨‍👩‍👧 Beneficiaries</div>
          <div className="feature">📊 Reports</div>
        </div>

        {/* MARQUEE BOX */}
        <div className="welcome-box">
          <marquee>🚀 Welcome to Kit Distribution System 🚀</marquee>
        </div>

        {/* BUTTON */}
        <button 
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Started"}
        </button>

      </div>

    </div>
  );
}