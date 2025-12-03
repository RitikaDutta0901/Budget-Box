// components/History.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { saveSnapshot, fetchSnapshots } from "../lib/client";

type Snapshot = {
  id?: string | number;
  budget: any;
  createdAt?: string;
};

export default function History() {
  const userId = useStore((s) => s.userId);
  const budget = useStore((s) => s.budget);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) {
      setSnapshots([]);
      return;
    }
    try {
      setLoading(true);
      const resp = await fetchSnapshots(userId);
      const snaps = resp?.snapshots || resp || [];
      setSnapshots(Array.isArray(snaps) ? snaps : [snaps]);
    } catch (e) {
      console.error("fetch snapshots", e);
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!userId) {
      alert("Login to save snapshots.");
      return;
    }
    try {
      setLoading(true);
      const resp = await saveSnapshot(budget, userId);
      alert("Snapshot saved.");
      await load();
    } catch (e) {
      alert("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onSave} disabled={loading}>Save Snapshot</button>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      <div>
        <h3>Snapshots</h3>
        {loading ? <div>Loading…</div> : null}
        <ul>
          {snapshots.map((s, i) => (
            <li key={s.id ?? i} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <div><strong>{new Date(s.createdAt || Date.now()).toLocaleString()}</strong></div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(s.budget, null, 2)}</pre>
            </li>
          ))}
          {!snapshots.length && !loading && <li>No snapshots</li>}
        </ul>
      </div>
    </div>
  );
}
