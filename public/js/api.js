// api.js — central API client for Nutristeck Secure

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://secur-nutristeck.onrender.com";

/**
 * Helper to make API calls with JSON handling and optional auth token.
 */
async function apiRequest(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

// --- Auth Endpoints ---
export const registerUser = (payload) => apiRequest("/api/auth/register", "POST", payload);
export const verifyOTP = (payload) => apiRequest("/api/auth/verify-otp", "POST", payload);
export const loginUser = (payload) => apiRequest("/api/auth/login", "POST", payload);
export const refreshToken = (token) =>
  apiRequest("/api/auth/refresh-token", "POST", null, token);
export const getProfile = (token) => apiRequest("/api/auth/profile", "GET", null, token);

// --- Admin Test ---
export const getAdminAccess = (token) => apiRequest("/api/auth/admin", "GET", null, token);

// --- Email Test ---
export const testEmail = () => apiRequest("/api/test-email", "GET");

export default {
  registerUser,
  verifyOTP,
  loginUser,
  refreshToken,
  getProfile,
  getAdminAccess,
  testEmail,
};