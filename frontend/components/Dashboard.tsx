"use client";
import React from "react";
import { useStore } from "../lib/store";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#4F46E5", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

const renderCustomizedLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, name, value } = props;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (!value) return null;

  return (
    <g>
      <polyline
        points={`${cx + (outerRadius - 6) * Math.cos(-midAngle * RADIAN)},${cy + (outerRadius - 6) *
          Math.sin(-midAngle * RADIAN)} ${cx + (outerRadius + 6) * Math.cos(-midAngle * RADIAN)},${cy + (outerRadius + 6) *
          Math.sin(-midAngle * RADIAN)} ${x},${y}`}
        stroke="#999"
        fill="none"
        strokeWidth={1}
      />
      <text x={x} y={y} fill="#111827" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" style={{ fontSize: 12 }}>
        {`${name}: ₹${value}`}
      </text>
    </g>
  );
};

function getDaysInfo() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysPassed = dayOfMonth - 1; // consider days completed
  const daysRemaining = daysInMonth - dayOfMonth + 1;
  return { daysInMonth, dayOfMonth, daysPassed, daysRemaining };
}

export default function Dashboard() {
  const { budget } = useStore();

  const income = Number(budget.income ?? 0);
  const monthlyBills = Number(budget.monthlyBills ?? 0);
  const food = Number(budget.food ?? 0);
  const transport = Number(budget.transport ?? 0);
  const subscriptions = Number(budget.subscriptions ?? 0);
  const misc = Number(budget.misc ?? 0);

  const totalExpenses = monthlyBills + food + transport + subscriptions + misc;
  const burnRate = income ? totalExpenses / income : 0;
  const savings = income - totalExpenses;

  // --- Month-end prediction ---
  const { daysInMonth, daysPassed, daysRemaining } = getDaysInfo();
  // compute average daily expense (if no passed days, assume uniform per remaining days)
  const avgDailyExpense = daysPassed > 0 ? totalExpenses / daysPassed : totalExpenses / Math.max(1, daysInMonth);
  const predictedAdditional = avgDailyExpense * daysRemaining;
  const predictedTotalAtMonthEnd = totalExpenses + predictedAdditional;
  const predictionBalance = income - predictedTotalAtMonthEnd;

  // --- anomaly warnings (distinct box)
  const warnings: string[] = [];
  if (income > 0) {
    if (subscriptions > 0.3 * income) warnings.push("Subscriptions are >30% of income.");
    if (food > 0.4 * income) warnings.push("Food is >40% of income.");
    if (monthlyBills > 0.6 * income) warnings.push("Monthly bills are >60% of income.");
    if (totalExpenses > income) warnings.push("Expenses exceed income — you are running a deficit.");
  } else {
    if (totalExpenses > 0) warnings.push("No income entered — enter income to get predictions.");
  }

  const rawData = [
    { name: "Monthly Bills", value: monthlyBills },
    { name: "Food", value: food },
    { name: "Transport", value: transport },
    { name: "Subscriptions", value: subscriptions },
    { name: "Misc", value: misc },
  ];
  const chartData = rawData.filter((d) => Number(d.value) > 0);
  const displayData = chartData.length ? chartData : [{ name: "No data", value: 1 }];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 26 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h2>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ background: "#fff4f4", border: "1px solid #ffd2d2", padding: 12, borderRadius: 8 }}>
          <strong>Warnings</strong>
          <ul style={{ marginTop: 8 }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ color: "#7f1d1d" }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary & prediction */}
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14 }}>Burn Rate</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{(burnRate * 100).toFixed(1)}%</div>
        </div>

        <div>
          <div style={{ fontSize: 14 }}>Savings (now)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>₹{savings}</div>
        </div>

        <div>
          <div style={{ fontSize: 14 }}>Total Expenses (so far)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>₹{totalExpenses}</div>
        </div>

        <div>
          <div style={{ fontSize: 14 }}>Month-end prediction</div>
          <div style={{ fontSize: 16 }}>
            {income > 0 ? (
              <>
                Predicted total: <strong>₹{Math.round(predictedTotalAtMonthEnd)}</strong><br />
                Prediction balance: <strong style={{ color: predictionBalance < 0 ? "#b91c1c" : "#059669" }}>
                  {predictionBalance < 0 ? `Overspend ₹${Math.abs(Math.round(predictionBalance))}` : `Save ₹${Math.round(predictionBalance)}`}
                </strong>
              </>
            ) : (
              <span className="muted">Enter income to predict month-end.</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart + breakdown */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ width: 360, height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || "#999"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Breakdown</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {rawData.map((d) => (
              <li key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span>{d.name}</span>
                <span style={{ fontWeight: 600 }}>₹{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
