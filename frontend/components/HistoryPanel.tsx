// frontend/components/HistoryPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import useBudgetStore from "../store/budgetStore";
import { saveSnapshot, fetchSnapshots, deleteSnapshot, restoreSnapshot } from "../lib/api";

export default function HistoryPanel(): React.JSX.Element {
  const budget = useBudgetStore((s) => s.budget);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // resolve userId from localStorage (fallback to 1)
  const userId = typeof window !== "undefined" ? Number(localStorage.getItem("userId") || 1) : 1;

  async function load() {
    setLoading(true);
    try {
      const r = await fetchSnapshots(userId);
      setSnapshots(r.snapshots || []);
    } catch (err: any) {
      console.error("load snapshots", err);
      setMsg("Failed to load snapshots");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    load();

    // reload when other parts dispatch event (SyncControl saves snapshot)
    function onUpdated() {
      load();
    }
    window.addEventListener("snapshots-updated", onUpdated);
    return () => window.removeEventListener("snapshots-updated", onUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSave() {
    setMsg(null);
    try {
      await saveSnapshot(userId, budget);
      setMsg("Snapshot saved");
      await load();
      // notify others
      window.dispatchEvent(new Event("snapshots-updated"));
    } catch (err: any) {
      console.error("save snapshot", err);
      setMsg("Failed to save snapshot");
    }
  }

  async function doDelete(id: number) {
    if (!confirm("Delete snapshot?")) return;
    try {
      await deleteSnapshot(userId, id);
      setMsg("Deleted");
      await load();
      window.dispatchEvent(new Event("snapshots-updated"));
    } catch (err: any) {
      console.error("delete snapshot", err);
      setMsg("Failed to delete");
    }
  }

  async function doRestore(id: number) {
    if (!confirm("Restore this snapshot? This will overwrite your current budget.")) return;
    try {
      const r = await restoreSnapshot(userId, id);
      setMsg("Restored snapshot");
      // update local store with restored budget if provided
      if (r?.budget) {
        // import the store setter and apply
        const store = (await import("../store/budgetStore")).default;
        // store is the hook function; call setState through it
        // easiest: reload to pick up server latest
        window.location.reload();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("restore snapshot", err);
      setMsg("Failed to restore");
    }
  }

  return (
    <div style={{ border: "1px solid #e6e6e6", padding: 12, borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Snapshots</h3>
        <div>
          <button
            onClick={doSave}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: "#111827",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save Snapshot
          </button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 8, color: "#374151" }}>{msg}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : snapshots.length === 0 ? (
        <div>No snapshots</div>
      ) : (
        snapshots.map((s) => (
          <div key={s.id} style={{ borderTop: "1px solid #f1f1f1", padding: "8px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{new Date(s.created_at).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>ID: {s.id}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => doRestore(s.id)} style={{ padding: 6, borderRadius: 6 }}>
                  Restore
                </button>
                <button onClick={() => doDelete(s.id)} style={{ padding: 6, borderRadius: 6, background: "#ef4444", color: "white" }}>
                  Delete
                </button>
              </div>
            </div>
            <pre style={{ fontSize: 12, marginTop: 8, maxHeight: 120, overflow: "auto" }}>{JSON.stringify(s.snapshot, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  );
}
