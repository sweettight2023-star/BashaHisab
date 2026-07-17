import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { ArrowLeft, Landmark, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { buildings, rentPayments, tenants, units, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { hasBuildingAccess } from "@/lib/actions";
import { bn, dateLabel, monthLabel, taka } from "@/lib/format";
import { PrintButton } from "./client";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const rows = await db
    .select({ payment: rentPayments, unit: units, building: buildings })
    .from(rentPayments)
    .innerJoin(units, eq(rentPayments.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(rentPayments.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();

  /* মাল্টি-ইউজার: মালিক/স্টাফ অ্যাক্সেস চেক */
  if (!(await hasBuildingAccess(user.id, row.building.userId))) notFound();

  const ownerRows = await db
    .select({ name: users.name, phone: users.phone })
    .from(users)
    .where(eq(users.id, row.building.userId))
    .limit(1);
  const owner = ownerRows[0];

  /* রশিদে ভাড়াটিয়ার নাম — পেমেন্টের সাথে সংরক্ষিত, না থাকলে সক্রিয় ভাড়াটিয়া */
  let tenantName = "—";
  let tenantPhone = "";
  if (row.payment.tenantId) {
    const t = await db
      .select({ name: tenants.name, phone: tenants.phone })
      .from(tenants)
      .where(eq(tenants.id, row.payment.tenantId))
      .limit(1);
    if (t[0]) {
      tenantName = t[0].name;
      tenantPhone = t[0].phone;
    }
  } else {
    const t = await db
      .select({ name: tenants.name, phone: tenants.phone })
      .from(tenants)
      .where(and(eq(tenants.unitId, row.unit.id), isNull(tenants.endDate)))
      .orderBy(desc(tenants.createdAt))
      .limit(1);
    if (t[0]) {
      tenantName = t[0].name;
      tenantPhone = t[0].phone;
    }
  }

  const p = row.payment;
  const receiptNo = `${p.month.replace("-", "")}-${p.id.slice(0, 6).toUpperCase()}`;
  const dueLeft = Math.max(p.amountDue - p.amountPaid, 0);

  return (
    <div className="min-h-screen bg-paper px-4 py-10 paper-grain">
      <style>{`@media print {
        .no-print { display: none !important; }
        body { background: #fff !important; }
        .receipt-card { box-shadow: none !important; border: 1.5px solid #222 !important; }
        .paper-grain { background-image: none !important; }
      }`}</style>

      <div className="no-print mx-auto mb-6 flex max-w-xl items-center justify-between">
        <Link
          href={`/dashboard/buildings/${row.building.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-leaf-800"
        >
          <ArrowLeft className="h-4 w-4" /> বিল্ডিংয়ে ফিরুন
        </Link>
        <PrintButton />
      </div>

      <div className="receipt-card mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 shadow-lift sm:p-10">
        {/* হেডার */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-line pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-800 text-cream">
              <Landmark className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="font-serif text-xl font-black leading-tight">বাসা হিসাব</p>
              <p className="text-xs text-ink-soft">ডিজিটাল হিসাব খাতা</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-2xl font-black text-leaf-800">ভাড়া রশিদ</p>
            <p className="mt-0.5 text-xs text-ink-soft">রশিদ নং: {bn(receiptNo)}</p>
            <p className="text-xs text-ink-soft">তারিখ: {dateLabel(p.paidDate)}</p>
          </div>
        </div>

        {/* পক্ষদ্বয় */}
        <div className="grid gap-4 border-b border-line py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">প্রাপ্তি</p>
            <p className="mt-1 font-bold">{tenantName}</p>
            {tenantPhone && <p className="text-sm text-ink-soft">{bn(tenantPhone)}</p>}
            <p className="mt-1 text-sm text-ink-soft">
              {row.building.name} — {row.unit.name}
              {row.unit.floor ? ` (${row.unit.floor} তলা)` : ""}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">গ্রহীতা</p>
            <p className="mt-1 font-bold">{owner?.name ?? "বাসা মালিক"}</p>
            {owner && <p className="text-sm text-ink-soft">{bn(owner.phone)}</p>}
            {row.building.address && (
              <p className="mt-1 text-sm text-ink-soft">{row.building.address}</p>
            )}
          </div>
        </div>

        {/* বিবরণ */}
        <table className="mt-5 w-full text-left">
          <thead>
            <tr className="border-b border-line text-sm text-ink-soft">
              <th className="py-2.5 font-semibold">বিবরণ</th>
              <th className="py-2.5 text-right font-semibold">টাকা</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line/70">
              <td className="py-3.5 font-medium">
                {monthLabel(p.month)} মাসের ভাড়া
                {p.notes && <p className="text-xs font-normal text-ink-soft">নোট: {p.notes}</p>}
              </td>
              <td className="py-3.5 text-right font-bold">{taka(p.amountPaid)}</td>
            </tr>
            <tr className="border-b border-line/70 text-sm text-ink-soft">
              <td className="py-2.5">ঐ মাসের মোট ভাড়া</td>
              <td className="py-2.5 text-right">{taka(p.amountDue)}</td>
            </tr>
            <tr className="text-sm">
              <td className="py-2.5 font-semibold text-red-600">অবশিষ্ট বকেয়া</td>
              <td className="py-2.5 text-right font-semibold text-red-600">
                {dueLeft > 0 ? taka(dueLeft) : "নেই"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* মোট */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-leaf-900 px-6 py-4 text-cream">
          <p className="font-serif text-lg font-bold">মোট গৃহীত</p>
          <p className="font-serif text-3xl font-black">{taka(p.amountPaid)}</p>
        </div>
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-leaf-700">
          {p.status === "paid" ? "সম্পূর্ণ পরিশোধিত" : "আংশিক পরিশোধিত"}
        </p>

        {/* স্বাক্ষর */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-ink/60 pt-2 text-sm font-semibold text-ink-soft">
              প্রদানকারীর স্বাক্ষর
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-ink/60 pt-2 text-sm font-semibold text-ink-soft">
              গ্রহীতার স্বাক্ষর
            </div>
          </div>
        </div>

        {/* ফুটার */}
        <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf-700" />
          এই রশিদটি কম্পিউটার-জেনারেটেড — বাসা হিসাব অ্যাপ থেকে তৈরি
        </p>
      </div>

      <p className="no-print mx-auto mt-5 max-w-xl text-center text-xs text-ink-soft">
        টিপস: প্রিন্ট ডায়ালগে প্রিন্টার হিসেবে <b>“Save as PDF”</b> বাছলেই PDF ফাইল সেভ হবে — ভাড়াটিয়াকে হোয়াটসঅ্যাপে পাঠিয়ে দিতে পারবেন।
      </p>
    </div>
  );
}
