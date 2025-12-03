// frontend/components/QuickStats.tsx
"use client";

import React, { useMemo } from "react";

type QuickStatsProps = {
  budget?: any;
};

function toNumber(v: any) {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Try to get an array of expense items from known shapes:
 * - budget.expenses -> [{ amount }]
 * - budget.items -> [{ amt }]
 * - budget.categories -> { rent: 100, food: 200 }  (object map)
 * - or detect flat numeric keys (monthlyBills, food, transport, subscriptions, miscellaneous)
 */
function collectExpenseItems(budget: any): number[] {
  if (!budget) return [];

  // shape: array of objects
  const arr = budget.expenses ?? budget.items ?? null;
  if (Array.isArray(arr)) {
    return arr.map((it) => toNumber(it?.amount ?? it?.amt ?? it?.value ?? it));
  }

  // shape: object map e.g. categories: { rent: 100, food: 200 }
  if (budget.categories && typeof budget.categories === "object") {
    return Object.values(budget.categories).map((v) => toNumber(v));
  }

  // flat keys commonly used in simple forms
  const flatKeys = ["monthlyBills", "bills", "food", "transport", "subscriptions", "miscellaneous", "misc", "others", "other"];
  const vals: number[] = [];
  for (const k of flatKeys) {
    if (k in budget) vals.push(toNumber(budget[k]));
  }

  // Also try to pick numeric keys not named 'income' or 'name'
  // (helps if user used different labels)
  const extras: number[] = [];
  Object.keys(budget).forEach((k) => {
    if (k === "income" || k === "monthlyIncome" || k === "salary" || k === "userId") return;
    const val = budget[k];
    if (typeof val === "string" || typeof val === "number") {
      // skip obviously non-numeric labels
      if (!/name|id|date|notes|title/i.test(k)) {
        const n = toNumber(val);
        // include if numeric and non-zero
        if (n !== 0 && !flatKeys.includes(k)) extras.push(n);
      }
    }
  });

  return [...vals, ...extras];
}

export default function QuickStats({ budget }: QuickStatsProps) {
  const { income, totalExpenses, burnPercent, savings } = useMemo(() => {
    const b = budget ?? {};
    // income: try several keys
    const incomeVal = toNumber(b.income ?? b.monthlyIncome ?? b.salary ?? b.amount ?? 0);

    const expensesList = collectExpenseItems(b);
    const total = expensesList.reduce((s, x) => s + x, 0);

    const burn = incomeVal ? Math.round((total / incomeVal) * 100) : 0;
    const save = Math.round(incomeVal - total);

    return { income: incomeVal, totalExpenses: total, burnPercent: burn, savings: save };
  }, [budget]);

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 120 }}>
          <strong>Burn rate</strong>
          <div style={{ marginTop: 8, fontSize: 18 }}>{burnPercent}%</div>
        </div>

        <div style={{ minWidth: 160 }}>
          <strong>Total expenses:</strong>
          <div style={{ marginTop: 8, fontSize: 18 }}>₹{totalExpenses.toLocaleString()}</div>
        </div>

        <div style={{ minWidth: 180 }}>
          <strong>Savings potential:</strong>
          <div style={{ marginTop: 8, fontSize: 18 }}>₹{savings.toLocaleString()}</div>
        </div>
      </div>
    </section>
  );
}
