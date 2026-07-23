import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { ArrowLeft, FileBarChart2, Lock } from "lucide-react";
import { db } from "@/db";
import { buildings, expenses, rentPayments, units, users } from "@/db/schema";
import { getCurrentUser, isPremiumActive } from "@/lib/auth";
import { hasBuildingAccess } from "@/lib/actions";
import { bn, monthLabel, taka } from "@/lib/format";
import { PrintButton } from "@/app/receipt/[id]/client";

export const dynamic = "force-dynamic";

export default async function StatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { year: yearParam } = await searchParams;

  const bRows = await db.select().from(buildings).where(eq(buildings.id, id)).limit(1);
  const building = bRows[0];
  if (!building) notFound();
  if (!(await hasBuildingAccess(user.id, building.userId))) notFound();

  const ownerRows = await db.select().from(users).where(eq(users.id, building.userId)).limit(1);
  const ownerPremium = isPremiumActive(ownerRows[0] ?? null);

  const year = /^\d{4}$/.test(yearParam ?? "") ? Number(yearParam) : new Date().getFullYear();

  const unitRows = await db
    .select({ id: units.id, name: units.name, monthlyRent: units.monthlyRent })
    .from(units)
    .where(and(eq(units.buildingId, id), isNull(units.archivedAt)));
  const unitIds = unitRows.map((u) => u.id);

  const yearPayments = unitIds.length
    ? await db.select().from(rentPayments).where(inArray(rentPayments.unitId, unitIds))
    : [];
  const yearExpenses = await db.select().from(expenses).where(eq(expenses.buildingId, id));

  const months = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    const key = `${year}-${mm}`;
    const collected = yearPayments
      .filter((p) => p.month === key)
      .reduce((s, p) => s + p.amountPaid, 0);
    const spent = yearExpenses
      .filter((e) => e.expenseDate.startsWith(key) && !e.archivedAt)
      .reduce((s, e) => s + e.amount, 0);
    return { key, label: monthLabel(key), collected, spent, net: collected - spent };
  });
  const totalCollected = months.reduce((s, m) => s + m.collected, 0);
  const totalSpent = months.reduce((s, m) => s + m.spent, 0);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <style>{`@media print {
        .no-print { display: none !important; }
        body { background: #fff !important; }
      }`}</style>

      <div className="no-print flex items-center justify-between gap-4">
        <Link
          href={`/dashboard/buildings/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-leaf-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> বিল্ডিংয়ে ফিরুন
        </Link>
        {ownerPremium && <PrintButton />}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-lift">
        <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-line pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-800 text-cream">
              <FileBarChart2 className="h-5.5 w-5.5" />
            </span>
            <div>
              <h1 className="font-serif text-xl font-bold">{building.name} — বার্ষিক স্টেটমেন্ট</h1>
              <p className="text-sm text-ink-soft">সাল: {bn(year)}</p>
            </div>
          </div>
          <div className="no-print flex gap-2">
            <Link
              href={`?year=${year - 1}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm font-bold hover:bg-leaf-50"
            >
              {bn(year - 1)}
            </Link>
            <Link
              href={`?year=${year + 1}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm font-bold hover:bg-leaf-50"
            >
              {bn(year + 1)}
            </Link>
          </div>
        </div>

        {!ownerPremium && (
          <div className="pointer-events-none absolute inset-0 top-[104px] z-20 flex items-start justify-center bg-white/70 pt-14 backdrop-blur-[3px]">
            <div className="pointer-events-auto rounded-2xl border border-line bg-white p-6 text-center shadow-lift">
              <Lock className="mx-auto h-8 w-8 text-haldi-500" />
              <p className="mt-2 font-bold">বার্ষিক/মাসিক স্টেটমেন্ট একটি প্রিমিয়াম ফিচার</p>
              <p className="mt-1 max-w-xs text-sm text-ink-soft">
                পুরো বছরের হিসাব দেখতে ও প্রিন্ট করতে প্রিমিয়াম প্ল্যান প্রয়োজন।
              </p>
              <Link
                href="/dashboard/premium"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf-800 px-5 py-2.5 text-sm font-bold text-cream"
              >
                প্রিমিয়াম দেখুন
              </Link>
            </div>
          </div>
        )}

        <table className={`mt-6 w-full ${!ownerPremium ? "blur-sm select-none" : ""}`}>
          <thead>
            <tr className="border-b border-line text-left text-sm text-ink-soft">
              <th className="py-2.5 font-semibold">মাস</th>
              <th className="py-2.5 text-right font-semibold">আদায়</th>
              <th className="py-2.5 text-right font-semibold">খরচ</th>
              <th className="py-2.5 text-right font-semibold">নীট আয়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {months.map((m) => (
              <tr key={m.key}>
                <td className="py-2.5 font-semibold">{m.label}</td>
                <td className="py-2.5 text-right text-leaf-700">{taka(m.collected)}</td>
                <td className="py-2.5 text-right text-red-600">{taka(m.spent)}</td>
                <td className="py-2.5 text-right font-bold">{taka(m.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink/20 font-black">
              <td className="py-3">মোট (বছর)</td>
              <td className="py-3 text-right text-leaf-800">{taka(totalCollected)}</td>
              <td className="py-3 text-right text-red-700">{taka(totalSpent)}</td>
              <td className="py-3 text-right">{taka(totalCollected - totalSpent)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-center text-xs text-ink-soft">
          এই স্টেটমেন্টটি কম্পিউটার-জেনারেটেড — বাসা হিসাব অ্যাপ থেকে তৈরি
        </p>
      </div>
    </div>
  );
}
