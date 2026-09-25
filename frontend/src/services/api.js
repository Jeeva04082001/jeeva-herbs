import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:8002";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically refresh access token when it expires
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    // ------------------------------------------------
    // 1. Authentication endpoints
    // ------------------------------------------------
    const isAuthRequest =
      requestUrl.includes("/api/auth/login/") ||
      requestUrl.includes("/api/auth/register/") ||
      requestUrl.includes("/api/auth/token/") ||
      requestUrl.includes("/api/auth/logout/");

    // ------------------------------------------------
    // 2. /me returning 401 is normal when logged out
    // ------------------------------------------------
    if (
      requestUrl.includes("/api/auth/me/") &&
      status === 401
    ) {
      return Promise.reject(error);
    }

    // ------------------------------------------------
    // 3. Refresh access token for normal protected APIs
    // ------------------------------------------------
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token is sent automatically
        // through the HttpOnly cookie
        await api.post("/api/auth/token/refresh/");

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    // ------------------------------------------------
    // 4. Normal error handling
    // ------------------------------------------------
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Something went wrong";

    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;