// components/SyncBar.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { syncBudgetToServer, fetchLatestFromServer } from "../lib/client";

export default function SyncBar() {
  const syncStatus = useStore((s) => s.syncStatus);
  const setSyncStatus = useStore((s) => s.setSyncStatus);
  const markSynced = useStore((s) => s.markSynced);
  const budget = useStore((s) => s.budget);
  const userId = useStore((s) => s.userId);
  const setBudget = useStore((s) => s.setBudget);

  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    // When we detect reconnect, optionally auto-sync
    if (online && syncStatus === "sync-pending" && userId) {
      // auto sync in background
      doSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, syncStatus, userId]);

  const doSync = async () => {
    if (!userId) {
      alert("Login first to sync.");
      return;
    }
    if (!online) {
      setSyncStatus("sync-pending");
      alert("You are offline — will sync when back online.");
      return;
    }
    try {
      setBusy(true);
      setSyncStatus("sync-pending");
      // send full budget
      const resp = await syncBudgetToServer(budget, userId);
      // expect resp { success: true, timestamp: isoString, budget?: {...} }
      markSynced(resp?.timestamp ?? new Date().toISOString());
    } catch (err: any) {
      console.error("Sync failed:", err);
      setSyncStatus("sync-pending");
      alert("Sync failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const doPull = async () => {
    if (!userId) {
      alert("Login first to pull.");
      return;
    }
    if (!online) {
      alert("Offline — cannot pull from server.");
      return;
    }
    try {
      setBusy(true);
      const resp = await fetchLatestFromServer(userId); // { latest: { budget, updatedAt } }
      if (!resp) {
        alert("No data on server.");
        return;
      }

      // Merge: if server updatedAt is newer then overwrite local
      const server = resp.latest || resp;
      const serverUpdatedAt = server.updatedAt || server.updatedAt;
      const localUpdatedAt = budget?.updatedAt || null;

      if (server && (!localUpdatedAt || server.updatedAt > localUpdatedAt)) {
        // Replace local budget entirely with server budget
        setBudget(server.budget || server);
        markSynced(server.updatedAt || new Date().toISOString());
        alert("Pulled latest from server.");
      } else {
        alert("Local data is up-to-date.");
      }
    } catch (e) {
      console.error("Pull failed", e);
      alert("Pull failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 13 }}>
        Network: {online ? "Online" : "Offline"}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 13 }}>Sync: {syncStatus}{busy ? " (working...)" : ""}</div>
        <button
          onClick={doPull}
          style={{ padding: "6px 10px", borderRadius: 6 }}
          disabled={busy}
        >
          Pull
        </button>

        <button
          onClick={doSync}
          style={{ padding: "6px 10px", borderRadius: 6 }}
          disabled={busy}
        >
          Sync
        </button>
      </div>
    </div>
  );
}
