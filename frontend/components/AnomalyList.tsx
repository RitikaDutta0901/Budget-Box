"use client";

import React, { useMemo } from "react";

type AnomalyListProps = {
  budget?: any;
  thresholdPercent?: number; 
};

// Same robust helper
function toNumber(v: any) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const clean = String(v).replace(/[^0-9.-]/g, "");
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}

export default function AnomalyList({ budget, thresholdPercent = 30 }: AnomalyListProps) {
  const anomalies = useMemo(() => {
    if (!budget) return [];

    // 1. Find Income First
    const incomeKey = Object.keys(budget).find(k => ["income", "monthlyIncome", "salary"].includes(k));
    const income = incomeKey ? toNumber(budget[incomeKey]) : 0;

    if (income === 0) return []; // Cannot calculate anomalies without income

    const detected: { name: string; amount: number; percent: number }[] = [];
    
    // Keys to ignore
    const ignoreKeys = ["id", "userId", "created_at", "updated_at", "income", "monthlyIncome", "salary"];

    // 2. Scan for high expenses
    Object.keys(budget).forEach((key) => {
      if (ignoreKeys.includes(key) || key.toLowerCase().includes("id")) return;

      const amt = toNumber(budget[key]);
      
      // Calculate percentage
      if (amt > 0) {
        const percent = (amt / income) * 100;
        if (percent >= thresholdPercent) {
          // Format the name nicely (e.g., "monthlyBills" -> "Monthly Bills")
          const niceName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          detected.push({ name: niceName, amount: amt, percent: Math.round(percent) });
        }
      }
    });

    return detected;
  }, [budget, thresholdPercent]);

  if (!anomalies || anomalies.length === 0) {
    return <div style={{ marginTop: 12, color: "#666" }}>No anomalies detected.</div>;
  }

  return (
    <div style={{ marginTop: 12, border: "1px solid #ffeeba", background: "#fff3cd", padding: "10px", borderRadius: "6px" }}>
      <h4 style={{ margin: "0 0 8px 0", color: "#856404" }}>⚠️ High Spending Alerts</h4>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {anomalies.map((a, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            <strong>{a.name}</strong> is consuming <strong>{a.percent}%</strong> of your income (₹{a.amount.toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}