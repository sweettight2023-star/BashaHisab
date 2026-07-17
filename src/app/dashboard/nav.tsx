"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CircleHelp,
  Crown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "ওভারভিউ", icon: LayoutDashboard },
  { href: "/dashboard/buildings", label: "বিল্ডিংসমূহ", icon: Building2 },
  { href: "/dashboard/premium", label: "প্রিমিয়াম", icon: Crown },
  { href: "/dashboard/help", label: "সহায়িকা", icon: CircleHelp },
  { href: "/dashboard/settings", label: "সেটিংস", icon: Settings },
];

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin
    ? [...links, { href: "/admin", label: "পেমেন্ট অনুমোদন", icon: ShieldCheck }]
    : links;

  return (
    <>
      {all.map((l) => {
        const active =
          l.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition ${
              active
                ? "bg-leaf-800 text-cream shadow-card"
                : "text-ink-soft hover:bg-leaf-100/70 hover:text-leaf-900"
            }`}
          >
            <l.icon className="h-4.5 w-4.5 shrink-0" />
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
