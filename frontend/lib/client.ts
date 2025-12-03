// frontend/lib/client.ts
import axios from "axios";
import { API_BASE, SYNC_URL, LATEST_URL, HISTORY_URL } from "./api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage (if present)
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && cfg && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Login uses the /auth/login endpoint (POST)
export const login = async (email: string, password: string) => {
  const resp = await api.post("/auth/login", { email, password });
  return resp.data; // { userId, token }
};

export const syncBudgetToServer = async (budget: any, userId: number) => {
  const resp = await api.post(`/budget/sync?userId=${userId}`, { budget });
  return resp.data;
};

export const fetchLatestFromServer = async (userId: number) => {
  const resp = await api.get(`/budget/latest?userId=${userId}`);
  return resp.data;
};

export const saveSnapshot = async (budget: any, userId: number) => {
  const resp = await api.post(`/history?userId=${userId}`, { budget });
  return resp.data;
};

export const fetchSnapshots = async (userId: number) => {
  const resp = await api.get(`/history?userId=${userId}`);
  return resp.data;
};

export default api;
