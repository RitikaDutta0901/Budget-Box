// frontend/app/layout.tsx
"use client";
import React from "react";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";

const SyncBar = dynamic(() => import("../components/SyncBar"), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <SyncBar />
        <div>{children}</div>
      </body>
    </html>
  );
}
