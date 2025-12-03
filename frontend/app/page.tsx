// app/page.tsx
"use client";

import React from "react";
import BudgetForm from "../components/BudgetForm";
import Dashboard from "../components/Dashboard";

export default function HomePage(): React.JSX.Element {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr", // equal wide halves
        gap: 0,
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL — FULL HEIGHT + FULL WIDTH */}
      <div
        style={{
          background: "white",
          padding: "40px",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
          Monthly Budget
        </h2>

        {/* Budget form should fill left panel */}
        <div style={{ maxWidth: "600px" }}>
          <BudgetForm />
        </div>
      </div>

      {/* RIGHT PANEL — FULL HEIGHT + FULL WIDTH */}
      <div
        style={{
          background: "white",
          padding: "40px",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
          
        </h2>

        {/* Dashboard component */}
        <Dashboard />
      </div>
    </div>
  );
}
