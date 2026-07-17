import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import {
  ArrowLeft,
  BedDouble,
  HandCoins,
  History,
  MapPin,
  MessageCircle,
  Printer,
  ReceiptText,
  Scale,
  Smartphone,
  Users2,
  Wallet2,
} from "lucide-react";
import { db } from "@/db";
import { buildings, expenses, rentPayments, tenants, units, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { hasBuildingAccess } from "@/lib/actions";
import {
  bn,
  bnNum,
  currentMonth,
  dateLabel,
  expenseCategoryLabel,
  monthLabel,
  taka,
} from "@/lib/format";
import {
  AddUnitForm,
  ArchiveExpenseButton,
  ArchiveUnitButton,
  ArchivedExpenses,
  EditBuildingDialog,
  EndTenantButton,
  ExpenseForm,
  MonthPicker,
  PaymentButton,
  TenantDialog,
  UnitEditDialog,
} from "./client";

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  switch (status) {
    case "paid":
      return "bg-leaf-100 text-leaf-800";
    case "partial":
      return "bg-haldi-300/30 text-haldi-600";
    default:
      return "bg-red-100 text-red-700";
  }
}
function statusText(status: string) {
  switch (status) {
    case "paid":
      return "পরিশোধিত";
    case "partial":
      return "আংশিক";
    default:
      return "বকেয়া";
  }
}

export default async function BuildingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const rawM = typeof sp.m === "string" ? sp.m : "";
  const month = /^\d{4}-\d{2}$/.test(rawM) ? rawM : currentMonth();

  const rows = await db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, id), isNull(buildings.archivedAt)))
    .limit(1);
  const building = rows[0];
  if (!building) notFound();

  /* মাল্টি-ইউজার: মালিক অথবা স্টাফ অ্যাক্সেস চেক */
  const allowed = await hasBuildingAccess(user.id, building.userId);
  if (!allowed) notFound();
  const isOwner = building.userId === user.id;

  const ownerRows = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, building.userId))
    .limit(1);
  const ownerName = ownerRows[0]?.name ?? "বাসা মালিক";

  const unitRows = await db
    .select()
    .from(units)
    .where(and(eq(units.buildingId, id), isNull(units.archivedAt)))
    .orderBy(units.name);

  const unitIds = unitRows.map((u) => u.id);

  const tenantRows = unitIds.length
    ? await db
        .select()
        .from(tenants)
        .where(and(inArray(tenants.unitId, unitIds), isNull(tenants.archivedAt)))
    : [];

  const paymentRows = unitIds.length
    ? await db
        .select()
        .from(rentPayments)
        .where(
          and(inArray(rentPayments.unitId, unitIds), eq(rentPayments.month, month)),
        )
    : [];

  const activeExpenses = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.buildingId, id), isNull(expenses.archivedAt)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));

  const archivedExpenses = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.buildingId, id), isNotNull(expenses.archivedAt)))
    .orderBy(desc(expenses.expenseDate));

  const activeTenant = new Map(
    tenantRows.filter((t) => !t.endDate).map((t) => [t.unitId, t]),
  );
  const pastTenantCount = (unitId: string) =>
    tenantRows.filter((t) => t.unitId === unitId && t.endDate).length;
  const paymentOf = new Map(paymentRows.map((p) => [p.unitId, p]));

  const monthTarget = unitRows.reduce(
    (s, u) => s + (paymentOf.get(u.id)?.amountDue ?? u.monthlyRent),
    0,
  );
  const monthCollected = paymentRows.reduce((s, p) => s + p.amountPaid, 0);
  const monthExpense = activeExpenses
    .filter((e) => e.expenseDate.startsWith(month))
    .reduce((s, e) => s + e.amount, 0);
  const net = monthCollected - monthExpense;

  const chips = [
    { icon: HandCoins, label: "ভাড়া আদায়", value: taka(monthCollected) },
    { icon: Wallet2, label: "বকেয়া", value: taka(Math.max(monthTarget - monthCollected, 0)) },
    { icon: ReceiptText, label: "খরচ", value: taka(monthExpense) },
    { icon: Scale, label: "নীট আয়", value: taka(net) },
  ];

  return (
    <div className="mx-auto max-w-6xl animate-rise">
      <Link
        href="/dashboard/buildings"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-leaf-800"
      >
        <ArrowLeft className="h-4 w-4" /> সব বিল্ডিং
      </Link>

      {/* হেডার */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 font-serif text-4xl font-bold">
            {building.name}
            {!isOwner && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">
                <Users2 className="h-3.5 w-3.5" /> শেয়ারড — {ownerName}
              </span>
            )}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-ink-soft">
            <MapPin className="h-4 w-4" />
            {building.address || "ঠিকানা দেওয়া নেই"}
            <span className="mx-1 text-line">|</span>
            <BedDouble className="h-4 w-4" /> {bn(unitRows.length)}টি ইউনিট
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <MonthPicker month={month} />
          <EditBuildingDialog
            building={{
              id: building.id,
              name: building.name,
              address: building.address,
              notes: building.notes,
            }}
          />
        </div>
      </div>

      {/* মাসিক সারাংশ */}
      <div className="mt-6 rounded-3xl bg-leaf-900 p-6 text-cream shadow-lift grain-dark">
        <p className="text-sm font-semibold text-cream/70">{monthLabel(month)} — সারাংশ</p>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {chips.map((c) => (
            <div key={c.label} className="rounded-2xl bg-white/5 p-4">
              <c.icon className="h-5 w-5 text-haldi-300" />
              <p className="mt-2.5 text-xs font-semibold text-cream/60">{c.label}</p>
              <p className="mt-0.5 font-serif text-xl font-black sm:text-2xl">{c.value}</p>
            </div>
          ))}
        </div>
        {monthTarget > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-cream/60">
              <span>আদায়ের অগ্রগতি</span>
              <span>{bn(Math.min(100, Math.round((monthCollected / monthTarget) * 100)))}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-haldi-400 to-haldi-300 transition-all"
                style={{ width: `${Math.min(100, (monthCollected / monthTarget) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ভাড়া আদায়ের ছক */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">
          ভাড়া আদায়ের ছক — <span className="text-leaf-800">{monthLabel(month)}</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream shadow-card">
          {unitRows.length === 0 ? (
            <p className="p-8 text-center text-ink-soft">
              আগে নিচ থেকে ইউনিট (ফ্ল্যাট/কক্ষ) যোগ করুন।
            </p>
          ) : (
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-line text-sm text-ink-soft">
                  <th className="px-5 py-3.5 font-semibold">ইউনিট</th>
                  <th className="px-5 py-3.5 font-semibold">ভাড়াটিয়া</th>
                  <th className="px-5 py-3.5 font-semibold">মাসিক ভাড়া</th>
                  <th className="px-5 py-3.5 font-semibold">জমা</th>
                  <th className="px-5 py-3.5 font-semibold">অবস্থা</th>
                  <th className="px-5 py-3.5 text-right font-semibold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {unitRows.map((u) => {
                  const p = paymentOf.get(u.id);
                  const t = activeTenant.get(u.id);
                  const dueAmt = p?.amountDue ?? u.monthlyRent;
                  const paidAmt = p?.amountPaid ?? 0;
                  const st = p?.status ?? "unpaid";
                  const dueLeft = Math.max(dueAmt - paidAmt, 0);

                  const reminder =
                    t?.phone && st !== "paid"
                      ? encodeURIComponent(
                          `অসসালামু আলাইকুম ${t.name},\n${building.name} এর ${u.name}-এর ${monthLabel(month)} মাসের ভাড়া ${taka(dueLeft)} বকেয়া রয়েছে। দয়া করে দ্রুত পরিশোধ করবেন।\n— ${ownerName}`,
                        )
                      : null;
                  const waLink = reminder
                    ? `https://wa.me/880${t!.phone.slice(1)}?text=${reminder}`
                    : null;
                  const smsLink = reminder
                    ? `sms:+880${t!.phone.slice(1)}?body=${reminder}`
                    : null;

                  return (
                    <tr key={u.id} className="transition hover:bg-leaf-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-bold">{u.name}</p>
                        {u.floor && <p className="text-xs text-ink-soft">{u.floor} তলা</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        {t ? (
                          <>
                            <p className="font-semibold">{t.name}</p>
                            {t.phone && <p className="text-xs text-ink-soft">{bn(t.phone)}</p>}
                          </>
                        ) : (
                          <span className="rounded-full bg-line/50 px-2.5 py-0.5 text-xs font-bold text-ink-soft">খালি</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold">{taka(dueAmt)}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-leaf-700">{taka(paidAmt)}</span>
                        {paidAmt > 0 && paidAmt < dueAmt && (
                          <p className="text-xs font-semibold text-red-600">বাকি {taka(dueLeft)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusPill(st)}`}>
                          {statusText(st)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="হোয়াটসঅ্যাপে ভাড়ার রিমাইন্ডার"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]/15 text-[#128c4b] transition hover:bg-[#25d366]/30"
                            >
                              <MessageCircle className="h-4.5 w-4.5" />
                            </a>
                          )}
                          {smsLink && (
                            <a
                              href={smsLink}
                              title="SMS-এ ভাড়ার রিমাইন্ডার"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition hover:bg-sky-200"
                            >
                              <Smartphone className="h-4.5 w-4.5" />
                            </a>
                          )}
                          {p && p.amountPaid > 0 && (
                            <Link
                              href={`/receipt/${p.id}`}
                              target="_blank"
                              title="রশিদ দেখুন/প্রিন্ট (PDF)"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-100 text-leaf-800 transition hover:bg-leaf-200"
                            >
                              <Printer className="h-4.5 w-4.5" />
                            </Link>
                          )}
                          <PaymentButton
                            unit={{ id: u.id, name: u.name, floor: u.floor, monthlyRent: u.monthlyRent }}
                            tenant={
                              t
                                ? { id: t.id, name: t.name, phone: t.phone, advance: t.advance, startDate: t.startDate }
                                : null
                            }
                            month={month}
                            payment={
                              p
                                ? {
                                    amountDue: p.amountDue,
                                    amountPaid: p.amountPaid,
                                    paidDate: p.paidDate,
                                    notes: p.notes,
                                    status: p.status,
                                  }
                                : null
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-soft">
          <MessageCircle className="h-3.5 w-3.5 text-[#128c4b]" />
          বকেয়া আছে এমন ভাড়াটিয়ার পাশে হোয়াটসঅ্যাপ/SMS আইকনে ক্লিক করলেই রিমাইন্ডার মেসেজ প্রস্তুত হয়ে যাবে।
        </p>
      </section>

      {/* ইউনিট ও ভাড়াটিয়া */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">ইউনিট ও ভাড়াটিয়া</h2>
        <div className="mt-4">
          <AddUnitForm buildingId={building.id} />
        </div>
        {unitRows.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {unitRows.map((u) => {
              const t = activeTenant.get(u.id);
              const past = pastTenantCount(u.id);
              return (
                <div key={u.id} className="rounded-2xl border border-line bg-cream p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg font-bold">{u.name}</p>
                      <p className="text-xs text-ink-soft">
                        {u.floor ? `${u.floor} তলা • ` : ""}মাসিক {taka(u.monthlyRent)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <UnitEditDialog unit={{ id: u.id, name: u.name, floor: u.floor, monthlyRent: u.monthlyRent }} />
                      <ArchiveUnitButton unitId={u.id} />
                    </div>
                  </div>
                  {t ? (
                    <div className="mt-4 rounded-xl bg-leaf-50 p-3.5">
                      <p className="font-bold text-leaf-900">{t.name}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {t.phone ? `${bn(t.phone)} • ` : ""}
                        উঠেছে {dateLabel(t.startDate)}
                        {t.advance > 0 ? ` • জামানত ${taka(t.advance)}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <EndTenantButton tenantId={t.id} />
                        <TenantDialog
                          unit={{ id: u.id, name: u.name, floor: u.floor, monthlyRent: u.monthlyRent }}
                          tenant={{ id: t.id, name: t.name, phone: t.phone, advance: t.advance, startDate: t.startDate }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-line bg-paper px-3.5 py-3">
                      <span className="text-sm font-semibold text-ink-soft">ইউনিটটি খালি আছে</span>
                      <TenantDialog
                        unit={{ id: u.id, name: u.name, floor: u.floor, monthlyRent: u.monthlyRent }}
                        tenant={null}
                      />
                    </div>
                  )}
                  {past > 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                      <History className="h-3.5 w-3.5" /> {bn(past)} জন সাবেক ভাড়াটিয়ার তথ্য সংরক্ষিত
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* খরচের খাতা */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">খরচের খাতা</h2>
        <p className="mt-1 text-sm text-ink-soft">
          সব খরচ চিরকাল সংরক্ষিত থাকে — আর্কাইভ করলেও মুছে যায় না।
        </p>
        <div className="mt-4">
          <ExpenseForm buildingId={building.id} />
        </div>
        <div className="mt-4 rounded-2xl border border-line bg-cream shadow-card">
          {activeExpenses.length === 0 ? (
            <p className="p-8 text-center text-ink-soft">এখনো কোনো খরচ লেখা হয়নি।</p>
          ) : (
            <ul className="divide-y divide-line/70">
              {activeExpenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-leaf-50/40">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {expenseCategoryLabel(e.category)}
                      {e.description && (
                        <span className="ml-2 font-normal text-ink-soft">— {e.description}</span>
                      )}
                    </p>
                    <p className="text-xs text-ink-soft">{dateLabel(e.expenseDate)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-bold text-haldi-600">− {taka(e.amount)}</span>
                    <ArchiveExpenseButton id={e.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ArchivedExpenses
          items={archivedExpenses.map((e) => ({
            id: e.id,
            label: expenseCategoryLabel(e.category),
            sub: `${dateLabel(e.expenseDate)}${e.description ? ` • ${e.description}` : ""}`,
            amount: e.amount,
          }))}
        />
      </section>

      <p className="mt-10 text-center text-sm text-ink-soft">
        এই বিল্ডিংয়ের মোট <span className="font-bold text-ink">{bnNum(activeExpenses.length + archivedExpenses.length + paymentRows.length)}</span>টি হিসাব এন্ট্রি চিরকালের জন্য নিরাপদে সংরক্ষিত আছে।
      </p>
    </div>
  );
}
