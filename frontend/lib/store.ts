// lib/store.ts  (or wherever your second store file is located)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import localforage from "localforage";

export type Budget = {
  income: number | null;
  monthlyBills: number | null;
  food: number | null;
  transport: number | null;
  subscriptions: number | null;
  misc: number | null;
  updatedAt?: string | null;
};

export type State = {
  userId: number | null;
  budget: Budget;
  syncStatus: "local-only" | "sync-pending" | "synced";
  lastSyncedAt: string | null;

  setUser: (id: number | null) => void;
  setBudget: (b: Partial<Budget> | Budget) => void;
  setField: (k: keyof Budget, v: number | null) => void;
  markSynced: (isoTs?: string) => void;
  setSyncStatus: (s: State["syncStatus"]) => void;
  resetStore: () => void;
};

const defaultBudget: Budget = {
  income: null,
  monthlyBills: null,
  food: null,
  transport: null,
  subscriptions: null,
  misc: null,
  updatedAt: null,
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      userId: null,
      budget: defaultBudget,
      syncStatus: "local-only",
      lastSyncedAt: null,

      setUser: (id) => set({ userId: id }),
      setBudget: (b) =>
        set((s) => ({
          budget: { ...s.budget, ...(b as object) },
          syncStatus: "sync-pending",
        })),
      setField: (k, v) =>
        set((s) => {
          const updatedAt = new Date().toISOString();
          return {
            budget: { ...s.budget, [k]: v, updatedAt },
            syncStatus: "sync-pending",
          };
        }),
      markSynced: (isoTs) =>
        set(() => ({
          syncStatus: "synced",
          lastSyncedAt: isoTs ?? new Date().toISOString(),
        })),
      setSyncStatus: (s) => set(() => ({ syncStatus: s })),
      resetStore: () =>
        set(() => ({
          userId: null,
          budget: defaultBudget,
          syncStatus: "local-only",
          lastSyncedAt: null,
        })),
    }),
    {
      name: "budgetbox-storage",
      storage: localforage,
      // IMPORTANT: persist only serializable fields; do NOT persist functions
      partialize: (state) => ({
        userId: state.userId,
        budget: state.budget,
        syncStatus: state.syncStatus,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

export default useStore;
