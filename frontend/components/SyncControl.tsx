// components/SyncControl.tsx
"use client";

import React, { useState, useEffect } from "react";
import useBudgetStore from "../store/budgetStore";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  syncBudgetToServer,
  fetchLatestBudget,
  saveSnapshot,
} from "../lib/api";

type Status = "Local Only" | "Sync Pending" | "Synced" | "Error";

export default function SyncControl({ userId }: { userId: number }) {
  const budget = useBudgetStore((s) => s.budget);
  const setBudget = useBudgetStore((s) => s.setBudget);
  const serverUpdatedAt = useBudgetStore((s) => s.serverUpdatedAt);
  const setServerUpdatedAt = useBudgetStore((s) => s.setServerUpdatedAt);

  const online = useOnlineStatus();

  const [status, setStatus] = useState<Status>("Local Only");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle online/offline status visually
  useEffect(() => {
    if (!online) setStatus("Local Only");
  }, [online]);

  // Helper to show error
  function fail(err: any, fallback = "Operation failed") {
    console.error(err);
    const msg =
      // axios-like shape
      err?.response?.data?.error ??
      // fetch / Error shape
      err?.message ??
      fallback;
    setError(msg);
    setStatus("Error");
  }

  // ----------------------
  // 🔵 SYNC: POST /budget/sync
  // ----------------------
  async function doSync() {
    setBusy(true);
    setError(null);
    setStatus("Sync Pending");

    try {
      // syncBudgetToServer expects a payload object { userId?, budget }
      const resp = await syncBudgetToServer({ userId, budget });

      // tolerate multiple response shapes
      const ts = resp?.timestamp ?? resp?.updatedAt ?? resp?.data?.timestamp ?? null;
      if (ts) {
        setServerUpdatedAt(ts);
      }

      const serverBudget = resp?.budget ?? resp?.data?.budget ?? resp?.returnedBudget ?? null;
      if (serverBudget) {
        setBudget(serverBudget);
      }

      setStatus("Synced");
    } catch (err) {
      fail(err, "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  // ----------------------
  // 🔵 PULL LATEST: GET /budget/latest
  // ----------------------
  async function pullLatest() {
    setBusy(true);
    setError(null);

    try {
      const resp = await fetchLatestBudget(userId);

      // handle multiple backend shapes:
      // 1) { latest: { budget, updatedAt } }
      // 2) { budget, updatedAt }
      // 3) { data: { budget, updatedAt } }
      const latest = resp?.latest ?? resp?.data ?? null;
      const budgetFromResp = latest?.budget ?? resp?.budget ?? null;
      const updatedAt = latest?.updatedAt ?? resp?.updatedAt ?? latest?.timestamp ?? resp?.timestamp ?? null;

      if (budgetFromResp) {
        setBudget(budgetFromResp);
        if (updatedAt) setServerUpdatedAt(updatedAt);
        setStatus("Synced");
      } else {
        setStatus("Local Only");
      }
    } catch (err) {
      fail(err, "Failed to fetch latest");
    } finally {
      setBusy(false);
    }
  }

  // ----------------------
  // 🔵 SAVE SNAPSHOT: POST /history
  // ----------------------
  async function doSaveSnapshot() {
    setBusy(true);
    setError(null);

    try {
      await saveSnapshot(userId, budget);

      // Notify HistoryPanel
      window.dispatchEvent(new Event("snapshots-updated"));

      setStatus("Synced");
    } catch (err) {
      fail(err, "Snapshot save failed");
    } finally {
      setBusy(false);
    }
  }

  // ----------------------
  // UI
  // ----------------------
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <div>
        <strong>Status:</strong> {status}
        {serverUpdatedAt && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Server: {new Date(serverUpdatedAt).toLocaleString()}
          </div>
        )}
      </div>

      <button
        onClick={doSync}
        disabled={busy || !online}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: !online ? "#999" : "#0f172a",
          color: "white",
          border: "none",
          cursor: busy ? "default" : "pointer",
        }}
      >
        {busy ? "Working..." : "Sync"}
      </button>

      <button
        onClick={pullLatest}
        disabled={busy}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: "white",
          border: "1px solid #ddd",
        }}
      >
        Pull Latest
      </button>

      <button
        onClick={doSaveSnapshot}
        disabled={busy}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: "#06b6d4",
          color: "white",
          border: "none",
        }}
      >
        Save Snapshot
      </button>

      {error && (
        <div style={{ color: "crimson", marginLeft: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}
