import axios from "axios";

// Export BASE_URL for consistent use
export const BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : "/";

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,    // API prefix
  withCredentials: true,         // Important to send cookies/auth with requests
});
