import { useEffect, useState } from "react";

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("terminal-users");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `https://kitdistributionapi-production.up.railway.app/api/upload/${type}`, // 🔁 change port if needed
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "terminal-users"
          ? "TerminalUsers.xlsx"
          : "Beneficiaries.xlsx";

      a.click();

      alert("Upload successful 🎉");
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="upload-form-row">
    <select
      value={type}
      onChange={(e) => setType(e.target.value)}
      className="upload-input"
    >
      <option value="terminal-users">Terminal Users</option>
      <option value="beneficiaries">Beneficiaries</option>
    </select>

    <input
      type="file"
      accept=".xlsx"
      onChange={(e) => setFile(e.target.files[0])}
      className="upload-file"
    />

    <button
      onClick={handleUpload}
      disabled={loading}
      className="upload-btn"
    >
      {loading ? "Uploading..." : "Upload"}
    </button>
  </div>
);
};
export default AdminUpload;
