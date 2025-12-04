// frontend/store/budgetStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import localforage from "localforage";

export type BudgetShape = {
  income?: number;
  monthlyBills?: number;
  food?: number;
  transport?: number;
  subscriptions?: number;
  misc?: number;
  updatedAt?: string;
};

type State = {
  budget: BudgetShape;
  serverUpdatedAt?: string;
  setField: (k: keyof BudgetShape, v: any) => void;
  setBudget: (b: BudgetShape) => void;
  setServerUpdatedAt: (ts?: string) => void;
  clear: () => void;
};

const useBudgetStore = create<State>()(
  persist(
    (set) => ({
      budget: {},
      serverUpdatedAt: undefined,
      setField: (k, v) =>
        set((s) => {
          const safe = v instanceof Date ? v.toISOString() : v;
          return {
            budget: { ...s.budget, [k]: safe, updatedAt: new Date().toISOString() },
          };
        }),
      setBudget: (b) =>
        set(() => {
          const safe = JSON.parse(JSON.stringify(b || {}));
          return { budget: safe };
        }),
      setServerUpdatedAt: (ts) => set(() => ({ serverUpdatedAt: ts })),
      clear: () => set(() => ({ budget: {}, serverUpdatedAt: undefined })),
    }),
    {
      name: "budget-storage-v1",
      storage: localforage,
      // persist only plain serializable data (no functions)
      partialize: (state) => ({
        budget: state.budget,
        serverUpdatedAt: state.serverUpdatedAt,
      }),
    }
  )
);

export default useBudgetStore;
