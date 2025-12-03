// frontend/components/AnomalyList.tsx
"use client";

import React, { useMemo } from "react";

type AnomalyListProps = {
  budget?: any;
  thresholdPercent?: number; // anomalies defined as expense >= threshold% of income
};

function toNumber(v: any) {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function collectItemsWithMeta(budget: any) {
  // returns array of { name, amount }
  if (!budget) return [];

  const out: { name: string; amount: number }[] = [];

  // structured arrays
  const arr = budget.expenses ?? budget.items;
  if (Array.isArray(arr)) {
    arr.forEach((it: any, i: number) => {
      const amt = toNumber(it?.amount ?? it?.amt ?? it?.value ?? it);
      const name = it?.category ?? it?.name ?? `item ${i + 1}`;
      out.push({ name, amount: amt });
    });
    return out;
  }

  // categories object
  if (budget.categories && typeof budget.categories === "object") {
    Object.entries(budget.categories).forEach(([k, v]) => out.push({ name: k, amount: toNumber(v) }));
    return out;
  }

  // flat keys: use friendly labels
  const flatMap: Record<string, string> = {
    monthlyBills: "Monthly Bills",
    bills: "Bills",
    food: "Food",
    transport: "Transport",
    subscriptions: "Subscriptions",
    miscellaneous: "Miscellaneous",
    misc: "Miscellaneous",
    rent: "Rent",
    groceries: "Groceries",
    utilities: "Utilities",
    internet: "Internet",
  };

  Object.keys(flatMap).forEach((k) => {
    if (k in budget) {
      out.push({ name: flatMap[k], amount: toNumber(budget[k]) });
    }
  });

  // fallback: any numeric properties not income
  Object.keys(budget).forEach((k) => {
    if (k === "income" || k === "monthlyIncome" || k === "salary" || k === "userId") return;
    const v = budget[k];
    if (typeof v === "number" || typeof v === "string") {
      const amt = toNumber(v);
      if (amt !== 0 && !flatMap[k]) out.push({ name: k, amount: amt });
    }
  });

  return out;
}

export default function AnomalyList({ budget, thresholdPercent = 30 }: AnomalyListProps) {
  const anomalies = useMemo(() => {
    const income = toNumber(budget?.income ?? budget?.monthlyIncome ?? budget?.salary ?? 0);
    const items = collectItemsWithMeta(budget);
    if (!income || items.length === 0) return [];
    return items.filter((it) => (it.amount / income) * 100 >= thresholdPercent);
  }, [budget, thresholdPercent]);

  if (!anomalies || anomalies.length === 0) {
    return <div style={{ marginTop: 12 }}>No anomalies detected.</div>;
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Anomalies</h4>
      <ul>
        {anomalies.map((a, i) => (
          <li key={i}>
            {a.name} — ₹{a.amount.toLocaleString()} ({Math.round((a.amount / (budget?.income ?? budget?.monthlyIncome ?? 1)) * 100)}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
