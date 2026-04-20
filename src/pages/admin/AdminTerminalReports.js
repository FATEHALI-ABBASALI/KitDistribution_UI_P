import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiRequest } from "../../api/api";

export default function AdminTerminalReports() {
  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // 🔥 ACTIVE YEAR (FROM BACKEND)
  const [activeYear, setActiveYear] = useState("");

  // ================= LOAD ACTIVE YEAR =================
  const loadYear = async () => {
    try {
      const data = await apiRequest("/api/year/active-year");
      setActiveYear(data.year);
    } catch {
      setActiveYear("Not available");
    }
  };

  // ================= LOAD REPORT =================
  const load = async () => {
    try {
      const data = await apiRequest(`/api/admin/report-terminal`);

      setRows(data);

      const total = data.reduce(
        (sum, r) => sum + Number(r.totalAmount || 0),
        0
      );

      setTotalAmount(total);
    } catch {
      alert("Failed to load report");
    }
  };

  // 🔥 LOAD YEAR ON PAGE LOAD
  useEffect(() => {
    loadYear();
  }, []);

  // 🔥 WHEN YEAR CHANGES (ADMIN SIDE)
  useEffect(() => {
    const handleYearChange = () => {
      loadYear();
      setRows([]);
      setTotalAmount(0);
    };

    window.addEventListener("yearChanged", handleYearChange);

    return () => {
      window.removeEventListener("yearChanged", handleYearChange);
    };
  }, []);

  // ================= DOWNLOAD =================
  const downloadFile = async (url, filename) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://kitdistributionapi-production.up.railway.app/api" + url,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch {
      alert("Download failed");
    }
  };

  return (
    <>
      <Navbar />

      <motion.div
        className="reports-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="reports-title">Terminal-wise Reports</h1>

        {/* 🔥 SHOW YEAR ONLY */}
        <h3 style={{ marginBottom: "10px", color: "#555" }}>
          Year: {activeYear || "Loading..."}
        </h3>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={load}
            className="primary-btn"
          >
            Load Report
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="danger-btn"
            onClick={() =>
              downloadFile("/admin/report-terminal/pdf", "TerminalReport.pdf")
            }
          >
            Download PDF
          </motion.button>
        </div>

        {/* Cards */}
        <div className="reports-cards">
          <SummaryCard label="Total Terminals" value={rows.length} color="blue" />
          <SummaryCard label="Total Amount" value={`₹${totalAmount}`} color="green" />
        </div>

        {/* Table */}
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Terminal ID</th>
                <th>Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="2" className="empty">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.Terminal_ID || r.terminal_ID}</td>
                    <td>₹{r.totalAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <motion.div className={`summary-card ${color}`} whileHover={{ scale: 1.04 }}>
      <p>{label}</p>
      <h2>{value}</h2>
    </motion.div>
  );
}
