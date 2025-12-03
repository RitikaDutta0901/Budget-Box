// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { login } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("hire-me@anshumat.org");
  const [password, setPassword] = useState("HireMe@2025!");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", String(res.userId));
      router.push("/dashboard");  // redirect after login
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          padding: 24,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Login</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "black",
            color: "white",
            borderRadius: 4,
          }}
        >
          Login
        </button>
      </form>
    </main>
  );
}
