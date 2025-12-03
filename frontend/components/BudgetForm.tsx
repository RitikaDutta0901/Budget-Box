// frontend/components/BudgetForm.tsx
"use client";

import React from "react";
import useBudgetStore from "../store/budgetStore";

export default function BudgetForm() {
  const budget = useBudgetStore((s) => s.budget);

  // try to read both APIs from the store (some stores use setField, some setBudget)
  const setField = useBudgetStore((s: any) => (s.setField ? s.setField : undefined));
  const setBudget = useBudgetStore((s: any) => (s.setBudget ? s.setBudget : undefined));

  // safe setter: prefer setField, fall back to setBudget (merge partial),
  // otherwise warn (so you know to implement store API)
  function applyField<K extends string>(field: K, value: number | undefined) {
    if (typeof setField === "function") {
      try {
        setField(field, value);
        return;
      } catch (e) {
        // continue to fallback
      }
    }

    if (typeof setBudget === "function") {
      try {
        setBudget({ [field]: value });
        return;
      } catch (e) {
        // fallback to warning
      }
    }

    // no store setter available — helpful warning so you can fix store
    // eslint-disable-next-line no-console
    console.warn(`No setter available in store for field '${String(field)}'. Implement setField or setBudget in your store.`);
  }

  function numberInput<K extends keyof typeof budget>(field: K, value: string) {
    const n = value === "" ? undefined : Number(value);
    // convert NaN to undefined (so store can set blank if needed)
    const maybeNum = Number.isNaN(n) ? undefined : n;
    applyField(String(field), maybeNum);
  }

  return (
    <form className="space-y-3 p-4 max-w-lg">
      <div>
        <label className="block text-sm">Income</label>
        <input
          type="number"
          value={budget?.income ?? ""}
          onChange={(e) => numberInput("income", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm">Monthly Bills</label>
        <input
          type="number"
          value={budget?.monthlyBills ?? ""}
          onChange={(e) => numberInput("monthlyBills", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm">Food</label>
        <input
          type="number"
          value={budget?.food ?? ""}
          onChange={(e) => numberInput("food", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm">Transport</label>
        <input
          type="number"
          value={budget?.transport ?? ""}
          onChange={(e) => numberInput("transport", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm">Subscriptions</label>
        <input
          type="number"
          value={budget?.subscriptions ?? ""}
          onChange={(e) => numberInput("subscriptions", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm">Misc</label>
        <input
          type="number"
          value={budget?.misc ?? ""}
          onChange={(e) => numberInput("misc", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
    </form>
  );
}
