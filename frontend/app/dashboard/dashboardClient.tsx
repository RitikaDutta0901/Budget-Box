"use client";

import React, { useEffect, useState } from "react";
import BudgetForm from "../../components/BudgetForm";
import SyncControl from "../../components/SyncControl";
import QuickStats from "../../components/QuickStats";
import AnomalyList from "../../components/AnomalyList";
import HistoryPanel from "../../components/HistoryPanel";
import useBudgetStore from "../../store/budgetStore";

export default function DashboardClient() {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<number>(1);

  // Pull live budget from Zustand store
  const budget = useBudgetStore((s) => s.budget);

  // Load User ID on mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("userId");
    if (stored) setUserId(Number(stored));
  }, []);

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Dashboard</h1>

      <div style={{ marginBottom: 16 }}>
        <SyncControl userId={userId} />
      </div>

      {/* Stats Area */}
      <QuickStats budget={budget} />
      
      {/* Anomalies Area */}
      <AnomalyList budget={budget} thresholdPercent={30} />

      <section style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, marginTop: 20 }}>
        <div style={{ background: "white", padding: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <BudgetForm />
        </div>

        <aside>
          <HistoryPanel />
        </aside>
      </section>
    </main>
  );
}