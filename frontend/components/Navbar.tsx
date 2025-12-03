// components/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "../lib/store";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const userId = useStore((s) => s.userId);
  const budget = useStore((s) => s.budget);

  const totalExpenses =
    (budget?.monthlyBills ?? 0) +
    (budget?.food ?? 0) +
    (budget?.transport ?? 0) +
    (budget?.subscriptions ?? 0) +
    (budget?.misc ?? 0);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  }

  const isLoginPage = pathname === "/login";

  return (
    <>
      <header
        className="site-navbar"
        role="banner"
        style={{
          background: "#0f172a",
          color: "white",
          height: 72,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(2,6,23,0.4)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Brand */}
          <Link
            href="/"
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              textDecoration: "none",
              color: "white",
            }}
          >
            BudgetBox
          </Link>

          {/* Center Nav */}
          <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link href="/" style={navLinkStyle}>Home</Link>
            <Link href="/dashboard" style={navLinkStyle}>Dashboard</Link>
            <Link href="/history" style={navLinkStyle}>History</Link>
          </nav>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

            {/* Income + Expenses */}
            <div style={{ textAlign: "right", color: "#e6eef8", fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>Income: ₹{budget?.income ?? 0}</div>
              <div style={{ opacity: 0.9 }}>Expenses: ₹{totalExpenses}</div>
            </div>

            {/* USER Badges */}
            {userId ? (
              <>
                <div
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    padding: "6px 12px",
                    borderRadius: 999,
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  User {userId}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "6px 12px",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              !isLoginPage && (
                <Link
                  href="/login"
                  style={{
                    padding: "6px 12px",
                    background: "white",
                    color: "#0f172a",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 80 }} />
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "#e6eef8",
  fontSize: "0.95rem",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 6,
  transition: "background .15s",
};
