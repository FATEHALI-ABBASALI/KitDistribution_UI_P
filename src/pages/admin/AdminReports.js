import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ ADDED
import Navbar from "../../components/Navbar";

import { apiRequest } from "../../api/api";

export default function AdminReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const navigate = useNavigate(); // ✅ ADDED

  // ================= LOAD REPORT =================
  const load = async () => {
    if (!from || !to) {
      alert("Select FROM and TO date");
      return;
    }

    try {
      const data = await apiRequest(
        `/api/admin/report-range?from=${from}&to=${to}`
      );

      setRows(data);

      const total = data.reduce(
        (sum, r) => sum + Number(r.Amount || r.amount || 0),
        0
      );

      setTotalAmount(total);
    } catch (err) {
      alert("Failed to load report");
      console.error(err);
    }
  };

  // ================= DOWNLOAD FILE =================
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
        transition={{ duration: 0.25 }}
      >
        {/* ===== Title ===== */}
        <h1 className="reports-title">Reports Dashboard</h1>

        {/* ===== Date Controls ===== */}
        <div className="reports-filter">
          <div className="filter-inputs">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={load}
            className="primary-btn"
          >
            View Report
          </motion.button>
        </div>

        {/* ===== NEW REPORT TYPE BUTTONS ===== */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="primary-btn"
            onClick={() => navigate("/admin/reports-annual")}
          >
            Annual Report
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="primary-btn"
            onClick={() => navigate("/admin/reports-terminal")}
          >
            Terminal-wise Report
          </motion.button>
        </div>

        {/* ===== Summary Cards ===== */}
        <div className="reports-cards">
          <SummaryCard
            label="Total Records"
            value={rows.length}
            color="blue"
          />
          <SummaryCard
            label="Total Amount"
            value={`₹${totalAmount}`}
            color="green"
          />
        </div>

        {/* ===== Table ===== */}
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Beneficiary ID</th>
                <th>Terminal ID</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <motion.tr
                    key={i}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    transition={{ duration: 0.15 }}
                  >
                    <td>{r.Beneficiary_ID || r.beneficiary_ID}</td>
                    <td>{r.Terminal_ID || r.terminal_ID}</td>
                    <td>{r.Month || r.month}</td>
                    <td className="amount">
                      ₹{r.Amount || r.amount}
                    </td>
                    <td>{r.Status || r.status}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Download Buttons ===== */}
        <div className="reports-actions">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="danger-btn"
            onClick={() =>
              downloadFile("/admin/report/pdf", "KitReport.pdf")
            }
          >
            Download PDF
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="success-btn"
            onClick={() =>
              downloadFile("/admin/report/excel", "KitReport.xlsx")
            }
          >
            Download Excel
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ===== SMALL COMPONENT ===== */

function SummaryCard({ label, value, color }) {
  return (
    <motion.div
      className={`summary-card ${color}`}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.2 }}
    >
      <p>{label}</p>
      <h2>{value}</h2>
    </motion.div>
  );
}
