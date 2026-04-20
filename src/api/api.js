const BASE_URL = "https://kitdistributionapi-production.up.railway.app";

/* ================= TOKEN ================= */
function getToken() {
  return localStorage.getItem("token");
}

/* ================= API REQUEST ================= */
export async function apiRequest(url, method = "GET", body = null) {
  const token = getToken();

  try {
    const res = await fetch(BASE_URL + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: "Bearer " + token }),
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json().catch(() => null);

    /* ================= HANDLE 401 ================= */
    if (res.status === 401) {
      // ✅ Only logout if token expired (optional safe check)
      if (data?.message?.toLowerCase().includes("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }

      // ✅ Show backend message (VERY IMPORTANT)
      throw new Error(data?.message || "Unauthorized access");
    }

    /* ================= OTHER ERRORS ================= */
    if (!res.ok) {
      throw new Error(data?.message || "Request failed");
    }

    return data;

  } catch (error) {
    /* ================= SERVER DOWN ================= */
    if (error.name === "TypeError") {
      throw new Error("Server is down. Please try again later.");
    }

    /* ================= GENERAL ERROR ================= */
    throw new Error(error.message || "Something went wrong");
  }
}

