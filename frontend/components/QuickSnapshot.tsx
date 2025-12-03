// frontend/components/QuickSnapshot.tsx
"use client";

import React, { useState } from "react";

/**
 * QuickSnapshot (clean)
 * - Single button to save snapshot (POST /api/history)
 * - Dispatches snapshots-updated on success so HistoryPanel reloads
 */

export default function QuickSnapshot(): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Make sure this matches your backend while debugging
  const API_BASE = "http://localhost:5000/api";
  const HISTORY_URL = `${API_BASE}/history`;

  function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("budgetbox_token");
  }

  function getUserId(): number | string {
    if (typeof window === "undefined") return 1;
    const v = localStorage.getItem("userId");
    if (!v) return 1;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }

  // If you want to snapshot the app state, adapt this to your store.
  // For now, it grabs a minimal example snapshot. Replace with the actual budget object.
  function buildSnapshot(): any {
    try {
      // @ts-ignore
      if (window.__BUDGET_SNAPSHOT__ !== undefined) return window.__BUDGET_SNAPSHOT__;
    } catch {}
    return { savedAt: new Date().toISOString() };
  }

  async function handleSave() {
    setBusy(true);
    setMsg(null);

    const token = getToken();
    const userId = getUserId();
    const snapshot = buildSnapshot();

    try {
      const res = await fetch(HISTORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ userId, snapshot }),
      });

      const text = await res.text();
      let data: any;
      try { data = text ? JSON.parse(text) : {}; } catch { data = text; }

      if (!res.ok) {
        const errMsg = (data && (data.error || data.message)) || res.statusText || `HTTP ${res.status}`;
        setMsg(`Save failed: ${errMsg}`);
        console.error("QuickSnapshot save failed", res.status, data);
      } else {
        setMsg("Snapshot saved");
        console.info("QuickSnapshot saved:", data);
        // notify others (HistoryPanel listens for this)
        window.dispatchEvent(new Event("snapshots-updated"));
      }
    } catch (err: any) {
      console.error("QuickSnapshot network error:", err);
      setMsg("Network error — check backend running and CORS");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={handleSave}
        disabled={busy}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: busy ? "#999" : "#0f172a",
          color: "white",
          border: "none",
          cursor: busy ? "default" : "pointer",
        }}
      >
        {busy ? "Saving…" : "Quick Save Snapshot"}
      </button>

      {msg && <div style={{ marginLeft: 8, color: msg.includes("failed") || msg.includes("Network") ? "crimson" : "#065f46" }}>{msg}</div>}
    </div>
  );
}
