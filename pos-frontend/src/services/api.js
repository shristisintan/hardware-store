import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ===============================
// AXIOS INSTANCE
// ===============================
const api = axios.create({
  baseURL: API_URL,
});

// ===============================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ===============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===============================
// RESPONSE INTERCEPTOR
// Handle expired/invalid token
// ===============================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Clear saved login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;