import Link from "next/link";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Crown,
  DoorOpen,
  HandCoins,
  Landmark,
  Plus,
  ReceiptText,
  Wallet2,
} from "lucide-react";
import { db } from "@/db";
import { buildings, expenses, rentPayments, tenants, units } from "@/db/schema";
import { getCurrentUser, isPremiumActive, FREE_LIMITS } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  bn,
  bnNum,
  currentMonth,
  expenseCategoryLabel,
  dateLabel,
  isPastDue,
  monthLabel,
  taka,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const month = currentMonth();

  const blds = await db
    .select()
    .from(buildings)
    .where(and(eq(buildings.userId, user.id), isNull(buildings.archivedAt)));

  const bIds = blds.map((b) => b.id);

  const allUnits = bIds.length
    ? await db
        .select()
        .from(units)
        .where(and(inArray(units.buildingId, bIds), isNull(units.archivedAt)))
    : [];

  const unitIds = allUnits.map((u) => u.id);

  const payments = unitIds.length
    ? await db
        .select()
        .from(rentPayments)
        .where(and(inArray(rentPayments.unitId, unitIds), eq(rentPayments.month, month)))
    : [];

  const allExpenses = bIds.length
    ? await db
        .select()
        .from(expenses)
        .where(and(inArray(expenses.buildingId, bIds), isNull(expenses.archivedAt)))
        .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt))
    : [];

  /* খালি ইউনিটের ভাড়া "বকেয়া" হিসেবে গণনা করা হবে না */
  const activeTenantRows = unitIds.length
    ? await db
        .select({ unitId: tenants.unitId, startDate: tenants.startDate, advance: tenants.advance })
        .from(tenants)
        .where(
          and(
            inArray(tenants.unitId, unitIds),
            isNull(tenants.archivedAt),
            isNull(tenants.endDate),
          ),
        )
    : [];
  const occupiedUnitIds = new Set(activeTenantRows.map((t) => t.unitId));
  const totalDeposit = activeTenantRows.reduce((s, t) => s + t.advance, 0);

  const paymentByUnit = new Map(payments.map((p) => [p.unitId, p]));
  const overdueCount = activeTenantRows.filter((t) => {
    const st = paymentByUnit.get(t.unitId)?.status ?? "unpaid";
    return st !== "paid" && isPastDue(month, t.startDate);
  }).length;

  const monthlyTarget = allUnits.reduce(
    (s, u) => s + (occupiedUnitIds.has(u.id) ? u.monthlyRent : 0),
    0,
  );
  const collected = payments.reduce((s, p) => s + p.amountPaid, 0);
  const due = Math.max(monthlyTarget - collected, 0);
  const spentThisMonth = allExpenses
    .filter((e) => e.expenseDate.startsWith(month))
    .reduce((s, e) => s + e.amount, 0);

  const recentPayments = [...payments]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .filter((p) => p.amountPaid > 0)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      unitName: allUnits.find((u) => u.id === p.unitId)?.name ?? "—",
      buildingName:
        blds.find(
          (b) => b.id === allUnits.find((u) => u.id === p.unitId)?.buildingId,
        )?.name ?? "",
    }));

  const stats = [
    { icon: Building2, label: "মোট বিল্ডিং", value: bn(blds.length), sub: "সক্রিয়" },
    { icon: DoorOpen, label: "মোট ইউনিট", value: bn(allUnits.length), sub: "ফ্ল্যাট/কক্ষ" },
    { icon: HandCoins, label: `${monthLabel(month)} — আদায়`, value: taka(collected), sub: monthlyTarget ? `লক্ষ্য ${taka(monthlyTarget)}` : "" },
    { icon: Wallet2, label: "এই মাসে খরচ", value: taka(spentThisMonth), sub: due > 0 ? `বকেয়া ভাড়া ${taka(due)}` : "বকেয়া নেই" },
    { icon: Landmark, label: "জামানত সংরক্ষিত", value: taka(totalDeposit), sub: "প্রফিটের অংশ নয়" },
  ];

  return (
    <div className="mx-auto max-w-6xl animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-soft">{monthLabel(month)}</p>
          <h1 className="mt-1 font-serif text-4xl font-bold">
            অসসালামু আলাইকুম, <span className="text-leaf-800">{user.name}</span>
          </h1>
        </div>
        <Link
          href="/dashboard/buildings"
          className="inline-flex items-center gap-2 rounded-full bg-leaf-800 px-5 py-2.5 font-bold text-cream shadow-card transition hover:bg-leaf-900"
        >
          <Plus className="h-4.5 w-4.5" /> নতুন বিল্ডিং
        </Link>
      </div>

      {/* স্ট্যাট কার্ড */}
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-cream p-5 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-leaf-800">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-[13px] font-semibold text-ink-soft">{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-black leading-tight sm:text-[26px]">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-ink-soft">{s.sub}</p>}
          </div>
        ))}
      </div>

      {overdueCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-red-700">
                {bn(overdueCount)} জন ভাড়াটিয়ার ভাড়ার মেয়াদ পার হয়ে গেছে
              </p>
              <p className="text-sm text-ink-soft">
                নতুন মাসের ১-১০ তারিখের মধ্যে ভাড়া না পেলে বকেয়া ধরা হয়। সংশ্লিষ্ট বিল্ডিংয়ে গিয়ে রিমাইন্ডার পাঠান।
              </p>
            </div>
          </div>
        </div>
      )}

      {!isPremiumActive(user) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-haldi-400/60 bg-haldi-300/10 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-haldi-400/20 text-haldi-600">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">
                ফ্রি প্ল্যান — {bn(blds.length)}/{bn(FREE_LIMITS.buildings)} বিল্ডিং ব্যবহৃত
              </p>
              <p className="text-sm text-ink-soft">
                প্রতি বিল্ডিংয়ে সর্বোচ্চ {bn(FREE_LIMITS.unitsPerBuilding)}টি ইউনিট। আনলিমিটেড বিল্ডিং ও ইউনিটের জন্য প্রিমিয়াম নিন।
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/premium"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-leaf-800 px-5 py-2.5 font-bold text-cream shadow-card transition hover:bg-leaf-900"
          >
            <Crown className="h-4 w-4" /> প্রিমিয়াম দেখুন
          </Link>
        </div>
      )}

      {blds.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-leaf-300 bg-leaf-50/60 p-12 text-center">
          <Landmark className="mx-auto h-12 w-12 text-leaf-700" />
          <h2 className="mt-4 font-serif text-2xl font-bold">আপনার প্রথম বিল্ডিং যোগ করুন</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            বিল্ডিং → ইউনিট → ভাড়াটিয়া — এই ৩ ধাপেই আপনার হিসাব শুরু। একবার লিখলে চিরকাল সংরক্ষিত।
          </p>
          <Link
            href="/dashboard/buildings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-leaf-800 px-6 py-3 font-bold text-cream shadow-card transition hover:bg-leaf-900"
          >
            শুরু করুন <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {blds.map((b) => {
            const bUnits = allUnits.filter((u) => u.buildingId === b.id);
            const unitIdSet = new Set(bUnits.map((u) => u.id));
            const target = bUnits.reduce((s, u) => s + u.monthlyRent, 0);
            const got = payments
              .filter((p) => unitIdSet.has(p.unitId))
              .reduce((s, p) => s + p.amountPaid, 0);
            const pct = target > 0 ? Math.min(100, Math.round((got / target) * 100)) : 0;
            return (
              <Link
                key={b.id}
                href={`/dashboard/buildings/${b.id}`}
                className="group rounded-3xl border border-line bg-cream p-6 shadow-card transition hover:-translate-y-0.5 hover:border-leaf-400 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold group-hover:text-leaf-800">{b.name}</h3>
                    <p className="mt-0.5 text-sm text-ink-soft">{b.address || "ঠিকানা দেওয়া নেই"}</p>
                  </div>
                  <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-800">
                    {bn(bUnits.length)}টি ইউনিট
                  </span>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-ink-soft">এই মাসে আদায়</span>
                    <span className="font-bold">
                      {taka(got)} <span className="font-normal text-ink-soft">/ {taka(target)}</span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-leaf-600 to-leaf-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* সাম্প্রতিক কার্যক্রম */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-cream p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <HandCoins className="h-5 w-5 text-leaf-700" /> সাম্প্রতিক ভাড়া জমা
          </h2>
          {recentPayments.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">এই মাসে এখনো কোনো ভাড়া জমা পড়েনি।</p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-semibold">{p.unitName} <span className="font-normal text-ink-soft">• {p.buildingName}</span></p>
                    <p className="text-xs text-ink-soft">{dateLabel(p.paidDate)}</p>
                  </div>
                  <p className="font-bold text-leaf-700">{taka(p.amountPaid)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-cream p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <ReceiptText className="h-5 w-5 text-leaf-700" /> সাম্প্রতিক খরচ
          </h2>
          {allExpenses.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">এখনো কোনো খরচ লেখা হয়নি।</p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {allExpenses.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-semibold">{expenseCategoryLabel(e.category)}</p>
                    <p className="text-xs text-ink-soft">
                      {dateLabel(e.expenseDate)}
                      {e.description ? ` • ${e.description}` : ""}
                    </p>
                  </div>
                  <p className="font-bold text-haldi-600">− {taka(e.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-ink-soft">
        মোট সংরক্ষিত ডেটা: <span className="font-bold text-ink">{bnNum(payments.length + allExpenses.length + allUnits.length + blds.length)}</span>টি এন্ট্রি — আপনার হিসাব কখনো মুছে যায় না।
      </p>
    </div>
  );
}
