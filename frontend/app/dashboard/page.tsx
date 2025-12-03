// app/dashboard/page.tsx
import DashboardClient from "./dashboardClient";
import QuickSnapshot from "../../components/QuickSnapshot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - BudgetBox",
};

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      {/* TEMPORARY snapshot fix button */}
      <QuickSnapshot />

      <DashboardClient />
    </div>
  );
}

