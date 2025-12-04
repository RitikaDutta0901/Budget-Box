// frontend/components/BudgetForm.tsx
"use client";

import React from "react";
//import useBudgetStore from "../store/budgetStore";
import useBudgetStore, { BudgetShape } from '../store/budgetStore';

export default function BudgetForm() {
  const budget = useBudgetStore((s) => s.budget);
  const setField = useBudgetStore((s) => s.setField);

function numberInput<K extends keyof BudgetShape>(field: K, value: string) {
  const n: number | undefined = value === "" ? undefined : Number(value);
  // cast number | undefined to the property type if necessary
  setField(field, n as BudgetShape[K]);
}

  return (
    <form
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",            // BIG spacing between fields
      }}
    >
      {/* INCOME */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Income</label>
        <input
          type="number"
          value={budget?.income ?? ""}
          onChange={(e) => numberInput("income", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* MONTHLY BILLS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Monthly Bills</label>
        <input
          type="number"
          value={budget?.monthlyBills ?? ""}
          onChange={(e) => numberInput("monthlyBills", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* FOOD */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Food</label>
        <input
          type="number"
          value={budget?.food ?? ""}
          onChange={(e) => numberInput("food", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* TRANSPORT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Transport</label>
        <input
          type="number"
          value={budget?.transport ?? ""}
          onChange={(e) => numberInput("transport", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* SUBSCRIPTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Subscriptions</label>
        <input
          type="number"
          value={budget?.subscriptions ?? ""}
          onChange={(e) => numberInput("subscriptions", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* MISC */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "14px", fontWeight: 500 }}>Misc</label>
        <input
          type="number"
          value={budget?.misc ?? ""}
          onChange={(e) => numberInput("misc", e.target.value)}
          style={{
            padding: "14px",
            fontSize: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>
    </form>
  );
}
