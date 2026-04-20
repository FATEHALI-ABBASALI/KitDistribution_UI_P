import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { apiRequest } from "../../api/api";

function TerminalDashboard() {
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [beneficiaryData, setBeneficiaryData] = useState(null);
  const [monthStatus, setMonthStatus] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  // ================= AUTO DATE =================
  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  // ================= FETCH =================
  const fetchBeneficiary = async (idParam) => {
    const id = String(idParam || beneficiaryId || "").trim().toUpperCase();

    if (!id) {
      setMsg("❌ Enter Beneficiary ID");
      return;
    }

    try {
      const res = await apiRequest(`/api/terminal/beneficiary/${id}`);
      setBeneficiaryData(res);

      const months = await apiRequest(`/api/terminal/beneficiary-status/${id}`);
      setMonthStatus(months);

      setShowPopup(true);
      setMsg("✅ Data loaded");
    } catch {
      setBeneficiaryData(null);
      setMsg("❌ Not found");
    }
  };

  // ================= CAMERA =================
  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch {
      setMsg("❌ Camera permission denied");
      return false;
    }
  };

  // ================= CAMERA SCANNER =================
  useEffect(() => {
    if (!showScanner) return;

    const startScanner = async () => {
      const allowed = await requestCameraPermission();
      if (!allowed) {
        setShowScanner(false);
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 20, qrbox: 250 },
          (text) => {
            const match = text.match(/ID:([^,]+)/);

            if (match) {
              const id = String(match[1]).trim().toUpperCase();

              setBeneficiaryId(id);
              setMsg("✅ QR scanned");

              navigator.vibrate?.(150);
              setTimeout(() => fetchBeneficiary(id), 150);
            } else {
              setMsg("❌ Invalid QR");
            }

            stopScanner();
          }
        );

        isRunningRef.current = true;

      } catch {
        setMsg("❌ Camera start failed");
        setShowScanner(false);
      }
    };

    startScanner();

    return () => stopScanner();
  }, [showScanner]);

  const stopScanner = async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      isRunningRef.current = false;
      setShowScanner(false);
    }
  };

  // ================= FILE SCAN =================
  const handleFileScan = () => {
    document.getElementById("qr-file-input").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5Qr = new Html5Qrcode("qr-reader-file");

    try {
      const text = await html5Qr.scanFile(file, true);

      const match = text.match(/ID:([^,]+)/);

      if (match) {
        const id = String(match[1]).trim().toUpperCase();

        setBeneficiaryId(id);
        setMsg("✅ QR scanned from file");

        setTimeout(() => fetchBeneficiary(id), 150);
      } else {
        setMsg("❌ Invalid QR");
      }

    } catch {
      setMsg("❌ File scan failed");
    }

    e.target.value = "";
  };

  // ================= DISTRIBUTE =================
  const distributeKit = async () => {
    const id = String(beneficiaryId || "").trim().toUpperCase();

    if (!id || !date) {
      setMsg("❌ Enter details");
      return;
    }

    try {
      const res = await apiRequest(
        "/api/terminal/distribute-kit",
        "POST",
        {
          beneficiary_ID: id,
          date: date,
        }
      );

      setMsg(`✅ Kit distributed for ${res.month}`);
      setBeneficiaryId("");
      setBeneficiaryData(null);

    } catch (e) {
      setMsg(e.message || "❌ Already distributed");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <motion.div className="terminal-page">

      <div className="terminal-header">
        <h2>Terminal Dashboard</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="terminal-card">
        <h3>Distribute Kit</h3>

        <label>Beneficiary ID</label>
        <div className="input-row">
          <input
            placeholder="BEN123"
            value={beneficiaryId}
            onChange={(e) =>
              setBeneficiaryId(e.target.value.toUpperCase())
            }
          />

          <button
            className="fetch-btn"
            onClick={() => fetchBeneficiary(beneficiaryId)}
          >
            Fetch
          </button>
        </div>

        {/* 🔥 CAMERA SCAN */}
        <button
          className="qr-btn"
          onClick={() => setShowScanner(!showScanner)}
        >
          {showScanner ? "Close Scanner" : "Scan QR"}
        </button>

        {/* 🔥 FILE UPLOAD */}
        <button className="qr-btn" onClick={handleFileScan}>
          Upload QR
        </button>

        <input
          type="file"
          accept="image/*"
          id="qr-file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <AnimatePresence>
          {showScanner && (
            <motion.div className="qr-wrapper">
              <div id="qr-reader" />
            </motion.div>
          )}
        </AnimatePresence>

        <div id="qr-reader-file" style={{ display: "none" }}></div>

        {beneficiaryData && (
          <div className="beneficiary-box">
            <h4>Details</h4>
            <p><b>ID:</b> {beneficiaryData.beneficiary_id}</p>
            <p><b>Name:</b> {beneficiaryData.fullName}</p>
            <p><b>Mobile:</b> {beneficiaryData.mobile}</p>
            <p><b>City:</b> {beneficiaryData.state_city}</p>
          </div>
        )}

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button className="success-btn full" onClick={distributeKit}>
          Distribute Kit
        </button>

        {msg && <div className="info-box">{msg}</div>}
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Monthly Status</h3>

            <div className="month-grid">
              {monthStatus.map((m, i) => (
                <div key={i} className="month-item">
                  <span>{m.month.slice(0, 3)}</span>
                  <span className={m.received ? "tick" : "cross"}>
                    {m.received ? "✔️" : "❌"}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TerminalDashboard;