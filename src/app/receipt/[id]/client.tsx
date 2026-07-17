"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full bg-leaf-800 px-6 py-3 font-bold text-cream shadow-lift transition hover:bg-leaf-900"
    >
      <Printer className="h-5 w-5" /> প্রিন্ট / PDF সেভ করুন
    </button>
  );
}
