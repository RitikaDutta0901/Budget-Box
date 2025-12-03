"use client";

import React, { useMemo } from "react";

type QuickStatsProps = {
  budget?: any;
};

// 1. ROBUST CONVERSION: Handles "1,000", "₹500", and strings safely
function toNumber(v: any) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  // Remove anything that isn't a digit, dot, or minus sign
  const clean = String(v).replace(/[^0-9.-]/g, "");
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}

// 2. SMART COLLECTOR: Grabs everything that looks like an expense
function calculateTotals(budget: any) {
  if (!budget) return { income: 0, totalExpenses: 0 };

  // Keys to IGNORE (Income, Metadata, IDs)
  const ignoreKeys = new Set([
    "income", "monthlyIncome", "salary", "paycheck", // Income variants
    "id", "userId", "created_at", "updated_at", "name", "title", "notes", "date" // Metadata
  ]);

  let income = 0;
  let totalExpenses = 0;

  // Iterate over every key in the budget object
  Object.keys(budget).forEach((key) => {
    const lowerKey = key.toLowerCase();
    const val = toNumber(budget[key]);

    // If it's an Income field, set income
    if (lowerKey === "income" || lowerKey === "monthlyincome" || lowerKey === "salary") {
      income = val;
      return;
    }

    // If it's a valid number and NOT in our ignore list, count it as Expense
    if (val > 0 && !ignoreKeys.has(key) && !lowerKey.includes("id")) {
      totalExpenses += val;
    }
  });

  return { income, totalExpenses };
}

export default function QuickStats({ budget }: QuickStatsProps) {
  const { income, totalExpenses, burnPercent, savings } = useMemo(() => {
    const { income, totalExpenses } = calculateTotals(budget);

    // Prevent division by zero
    const burn = income > 0 ? Math.round((totalExpenses / income) * 100) : 0;
    const save = income - totalExpenses;

    return { 
      income, 
      totalExpenses, 
      burnPercent: burn, 
      savings: save 
    };
  }, [budget]);

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Burn Rate */}
        <div style={{ minWidth: 120 }}>
          <strong>Burn rate</strong>
          <div style={{ marginTop: 8, fontSize: 18, color: burnPercent > 100 ? "red" : "inherit" }}>
            {burnPercent}%
          </div>
        </div>

        {/* Total Expenses */}
        <div style={{ minWidth: 160 }}>
          <strong>Total expenses:</strong>
          <div style={{ marginTop: 8, fontSize: 18 }}>
            ₹{totalExpenses.toLocaleString()}
          </div>
        </div>

        {/* Savings */}
        <div style={{ minWidth: 180 }}>
          <strong>Savings potential:</strong>
          <div style={{ marginTop: 8, fontSize: 18, color: savings < 0 ? "red" : "green" }}>
            ₹{savings.toLocaleString()}
          </div>
        </div>
      </div>
    </section>
  );
}