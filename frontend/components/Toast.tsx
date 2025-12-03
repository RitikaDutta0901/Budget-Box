// components/Toast.tsx
"use client";
import React, { useState, useEffect } from "react";

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Example: listen to a window event to show simple toasts from other parts
    const handler = (e: any) => {
      setMsg(e.detail?.message ?? "Notification");
      setTimeout(() => setMsg(null), 3000);
    };
    window.addEventListener("budgetbox:toast", handler as EventListener);
    return () => window.removeEventListener("budgetbox:toast", handler as EventListener);
  }, []);

  if (!msg) return null;
  return (
    <div style={{
      position: "fixed",
      right: 20,
      top: 92,
      background: "#0f172a",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: 8,
      zIndex: 1200,
      boxShadow: "0 6px 18px rgba(2,6,23,0.4)",
      fontSize: 13
    }}>
      {msg}
    </div>
  );
}
