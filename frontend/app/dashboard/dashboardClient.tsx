// app/dashboard/dashboardClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import BudgetForm from "../../components/BudgetForm";
import SyncControl from "../../components/SyncControl";
import QuickStats from "../../components/QuickStats";
import AnomalyList from "../../components/AnomalyList";
import HistoryPanel from "../../components/HistoryPanel";
import useBudgetStore from "../../store/budgetStore";

export default function DashboardClient() {
  const [demoUserId, setDemoUserId] = useState<number | null>(null);

  // Pull live budget from Zustand store
  const budget: any = useBudgetStore((s) => s.budget);
  const serverUpdatedAt = useBudgetStore((s) => s.serverUpdatedAt);

  // ⬇️ FIRST EFFECT — load user id
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const uid = raw ? Number(raw) : 1;
      setDemoUserId(Number.isNaN(uid) ? 1 : uid);
    } catch (err) {
      setDemoUserId(1);
    }
  }, []);

  // ⬇️ SECOND EFFECT — OPTIONAL LOGGING
  useEffect(() => {
    console.debug("DashboardClient: budget changed:", budget, "serverUpdatedAt:", serverUpdatedAt);
  }, [budget, serverUpdatedAt]);

  // ⬇️ THIRD EFFECT — DEBUG YOU ASKED TO ADD  
  useEffect(() => {
    try {
      // @ts-ignore
      window.__BUDGET_DEBUG__ = budget;
      console.info("[DEBUG] __BUDGET_DEBUG__ set (DashboardClient):", budget);
    } catch (e) {
      console.error("[DEBUG] failed to set __BUDGET_DEBUG__", e);
    }
  }, [budget]);

  // WAIT until we have userId
  if (demoUserId === null) {
    return (
      <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>Dashboard</h1>
        <div>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Dashboard</h1>

      <div style={{ marginBottom: 16 }}>
        <SyncControl userId={demoUserId} />
      </div>

      <QuickStats budget={budget} />
      <AnomalyList budget={budget} />

      <section style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, marginTop: 20 }}>
        <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
          <BudgetForm />
        </div>

        <aside>
          <HistoryPanel />
        </aside>
      </section>
    </main>
  );
}
