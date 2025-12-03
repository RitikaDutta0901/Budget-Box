// frontend/app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/client";
import { useStore } from "../../lib/store";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState("hire-me@anshumat.org");
  const [password, setPassword] = useState("HireMe@2025!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await login(email.trim(), password);
      if (r?.token) {
        // store token for future requests
        if (typeof window !== "undefined") {
          localStorage.setItem("token", r.token);
        }
      }
      if (r?.userId) {
        setUser(r.userId);
        // optional: navigate to dashboard/home
        router.push("/");
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6"
        aria-label="Login form"
      >
        <h2 className="text-3xl font-bold text-center">Login</h2>

        {error && (
          <div className="text-center text-sm text-red-600">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-4 py-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-2">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-4 py-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-lg font-medium"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
