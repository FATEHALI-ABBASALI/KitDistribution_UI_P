import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { apiRequest } from "../../api/api";

export default function AdminAnnualReports() {
  const [year, setYear] = useState("");
  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // ================= LOAD REPORT =================
  const load = async () => {
    if (!year) {
      alert("Select Year");
      return;
    }

    try {
      const data = await apiRequest(`/api/admin/report-annual?year=${year}`);

      setRows(data);

      const total = data.reduce(
        (sum, r) => sum + Number(r.totalAmount || 0),
        0
      );

      setTotalAmount(total);
    } catch (err) {
      alert("Failed to load report");
      console.error(err);
    }
  };

  // ================= DOWNLOAD PDF =================
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
        <h1 className="reports-title">Annual Reports</h1>

        {/* Year Filter */}
        <div className="reports-filter">
          <input
            type="number"
            placeholder="Enter Year (2025)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={load}
            className="primary-btn"
          >
            View Report
          </motion.button>

          {/* ✅ NEW: Download PDF Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="danger-btn"
            onClick={() =>
              downloadFile(
                `/admin/report-annual/pdf?year=${year}`,
                "AnnualReport.pdf"
              )
            }
          >
            Download PDF
          </motion.button>
        </div>

        {/* Cards */}
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

        {/* Table */}
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Beneficiary ID</th>
                <th>Terminal ID</th>
                <th>Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.beneficiary_ID || r.Beneficiary_ID}</td>
                    <td>{r.terminal_ID || r.Terminal_ID}</td>
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
    <motion.div
      className={`summary-card ${color}`}
      whileHover={{ scale: 1.04 }}
    >
      <p>{label}</p>
      <h2>{value}</h2>
    </motion.div>
  );
}
