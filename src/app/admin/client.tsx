"use client";

import { useMemo, useState } from "react";
import { Search, Crown } from "lucide-react";
import { bn } from "@/lib/format";

type UserRow = {
  id: string;
  name: string;
  phone: string;
  role: string;
  isPremiumNow: boolean;
  premiumUntilLabel: string;
  buildingCount: number;
  createdAtLabel: string;
};

export function UserSearchTable({ rows }: { rows: UserRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (u) => u.name.toLowerCase().includes(query) || u.phone.includes(query),
    );
  }, [q, rows]);

  return (
    <div>
      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
          className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream shadow-card">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line text-sm text-ink-soft">
              <th className="px-5 py-3.5 font-semibold">নাম</th>
              <th className="px-5 py-3.5 font-semibold">ফোন</th>
              <th className="px-5 py-3.5 font-semibold">প্ল্যান</th>
              <th className="px-5 py-3.5 font-semibold">মেয়াদ শেষ</th>
              <th className="px-5 py-3.5 font-semibold">বিল্ডিং</th>
              <th className="px-5 py-3.5 font-semibold">যোগ দিয়েছেন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-soft">
                  কোনো ব্যবহারকারী পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5 font-semibold">
                    {u.name}
                    {u.role === "admin" && (
                      <span className="ml-2 rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-black text-leaf-800">
                        অ্যাডমিন
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">{bn(u.phone)}</td>
                  <td className="px-5 py-3.5">
                    {u.isPremiumNow ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-haldi-300/25 px-2.5 py-0.5 text-xs font-black text-haldi-700">
                        <Crown className="h-3 w-3" /> প্রিমিয়াম
                      </span>
                    ) : (
                      <span className="rounded-full bg-line/50 px-2.5 py-0.5 text-xs font-bold text-ink-soft">
                        ফ্রি
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm">{u.premiumUntilLabel}</td>
                  <td className="px-5 py-3.5 font-bold">{bn(u.buildingCount)}</td>
                  <td className="px-5 py-3.5 text-sm">{u.createdAtLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
