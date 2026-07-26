import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Crown, LogOut } from "lucide-react";
import { getCurrentUser, isAdmin, isPremiumActive } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { bn } from "@/lib/format";
import { DashboardNav } from "./nav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const premium = isPremiumActive(user);
  const admin = isAdmin(user);

  const logo = (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <img src="/logo.png" alt="বাসা হিসাব" className="h-9 w-9 rounded-xl object-cover shadow-card" />
      <span className="font-serif text-xl font-bold">
        বাসা<span className="text-leaf-700">হিসাব</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* মোবাইল হেডার */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {logo}
          <form action={logout}>
            <button className="flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-1.5 text-sm font-semibold text-ink-soft">
              <LogOut className="h-4 w-4" /> লগআউট
            </button>
          </form>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3">
          <DashboardNav isAdmin={admin} />
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        {/* ডেস্কটপ সাইডবার */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-line bg-cream/60 px-5 py-7 lg:flex">
          {logo}
          <nav className="mt-10 flex flex-col gap-1.5">
            <DashboardNav isAdmin={admin} />
          </nav>

          <div className="mt-auto">
            <div className="rounded-2xl border border-line bg-cream p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-bold">{user.name}</p>
                {premium ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-haldi-400/25 px-2.5 py-1 text-xs font-black text-haldi-600">
                    <Crown className="h-3.5 w-3.5" /> প্রিমিয়াম
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-line/60 px-2.5 py-1 text-xs font-bold text-ink-soft">
                    ফ্রি
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink-soft">{bn(user.phone)}</p>
              {!premium && (
                <Link
                  href="/dashboard/premium"
                  className="mt-3 block rounded-xl bg-leaf-800 py-2 text-center text-sm font-bold text-cream transition hover:bg-leaf-900"
                >
                  প্রিমিয়াম নিন
                </Link>
              )}
              <form action={logout} className="mt-2">
                <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-ink-soft transition hover:bg-line/40">
                  <LogOut className="h-4 w-4" /> লগআউট
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
