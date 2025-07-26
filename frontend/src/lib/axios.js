import axios from "axios";

// Use VITE_API_URL environment variable if set, else fallback to localhost in development
export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://chat-application-copy-6.onrender.com");

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,     // API prefix
  withCredentials: true,          // Send cookies/auth with requests
});
