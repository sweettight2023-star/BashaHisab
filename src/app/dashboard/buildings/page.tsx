import Link from "next/link";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  Building2,
  MapPin,
  Users2,
} from "lucide-react";
import { db } from "@/db";
import { buildings, memberships, units, users } from "@/db/schema";
import { getCurrentUser, isPremiumActive } from "@/lib/auth";
import { archiveBuilding, restoreBuilding } from "@/lib/actions";
import { bn, bnNum } from "@/lib/format";
import { redirect } from "next/navigation";
import { NewBuildingDialog } from "./client";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const premium = isPremiumActive(user);

  const active = await db
    .select()
    .from(buildings)
    .where(and(eq(buildings.userId, user.id), isNull(buildings.archivedAt)));

  const archived = await db
    .select()
    .from(buildings)
    .where(and(eq(buildings.userId, user.id), isNotNull(buildings.archivedAt)));

  /* মাল্টি-ইউজার: যেসব মালিক আমাকে স্টাফ বানিয়েছেন */
  const mems = await db
    .select({ ownerId: memberships.ownerId, ownerName: users.name })
    .from(memberships)
    .innerJoin(users, eq(memberships.ownerId, users.id))
    .where(eq(memberships.memberUserId, user.id));
  const ownerIds = mems.map((m) => m.ownerId);
  const ownerNameOf = new Map(mems.map((m) => [m.ownerId, m.ownerName]));

  const shared = ownerIds.length
    ? await db
        .select()
        .from(buildings)
        .where(and(inArray(buildings.userId, ownerIds), isNull(buildings.archivedAt)))
    : [];

  const bIds = [...active, ...archived, ...shared].map((b) => b.id);
  const allUnits = bIds.length
    ? await db
        .select()
        .from(units)
        .where(and(inArray(units.buildingId, bIds), isNull(units.archivedAt)))
    : [];
  const unitCount = (id: string) =>
    allUnits.filter((u) => u.buildingId === id).length;
  const rentSum = (id: string) =>
    allUnits.filter((u) => u.buildingId === id).reduce((s, u) => s + u.monthlyRent, 0);

  return (
    <div className="mx-auto max-w-6xl animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">আমার বিল্ডিংসমূহ</h1>
          <p className="mt-1.5 text-ink-soft">
            মোট {bn(active.length)}টি সক্রিয় বিল্ডিং
            {!premium && " — ফ্রি প্ল্যানে ১টি বিল্ডিং, প্রিমিয়ামে আনলিমিটেড"}
          </p>
        </div>
        <NewBuildingDialog />
      </div>

      {active.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-leaf-300 bg-leaf-50/60 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-leaf-700" />
          <p className="mt-4 font-serif text-xl font-bold">এখনো কোনো বিল্ডিং নেই</p>
          <p className="mt-1 text-ink-soft">“নতুন বিল্ডিং” বোতামে ক্লিক করে শুরু করুন।</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {active.map((b) => (
            <div key={b.id} className="group flex flex-col rounded-3xl border border-line bg-cream p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-800 text-cream shadow-card">
                  <Building2 className="h-6 w-6" />
                </span>
                <form action={archiveBuilding}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    title="আর্কাইভ করুন (হিসাব মুছে যাবে না)"
                    className="rounded-full p-2 text-ink-soft opacity-0 transition hover:bg-line/50 hover:text-ink group-hover:opacity-100"
                  >
                    <Archive className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold">{b.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin className="h-4 w-4 shrink-0" />
                {b.address || "ঠিকানা দেওয়া নেই"}
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="rounded-full bg-leaf-100 px-3 py-1 font-bold text-leaf-800">
                  {bn(unitCount(b.id))}টি ইউনিট
                </span>
                <span className="rounded-full bg-paper px-3 py-1 font-bold text-ink-soft">
                  মাসিক ভাড়া ৳ {bnNum(rentSum(b.id))}
                </span>
              </div>
              <Link
                href={`/dashboard/buildings/${b.id}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-800 py-2.5 font-bold text-cream transition hover:bg-leaf-900"
              >
                হিসাব খুলুন <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* শেয়ার করা বিল্ডিং (স্টাফ অ্যাক্সেস) */}
      {shared.length > 0 && (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <Users2 className="h-5.5 w-5.5 text-sky-700" /> আমার সাথে শেয়ার করা বিল্ডিং ({bn(shared.length)})
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            মালিক আপনাকে স্টাফ হিসেবে যোগ করেছেন — এই বিল্ডিংগুলোর হিসাব লিখতে ও দেখতে পারবেন।
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shared.map((b) => (
              <div key={b.id} className="flex flex-col rounded-3xl border border-sky-200 bg-sky-50/60 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-700 text-cream shadow-card">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">
                    শেয়ারড
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold">{b.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {b.address || "ঠিকানা দেওয়া নেই"}
                </p>
                <p className="mt-2 text-xs font-semibold text-sky-800">
                  মালিক: {ownerNameOf.get(b.userId) ?? "—"}
                </p>
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="rounded-full bg-sky-100 px-3 py-1 font-bold text-sky-800">
                    {bn(unitCount(b.id))}টি ইউনিট
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1 font-bold text-ink-soft">
                    মাসিক ভাড়া ৳ {bnNum(rentSum(b.id))}
                  </span>
                </div>
                <Link
                  href={`/dashboard/buildings/${b.id}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 font-bold text-cream transition hover:bg-sky-800"
                >
                  হিসাব খুলুন <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-ink-soft">
            <Archive className="h-5 w-5" /> আর্কাইভ করা বিল্ডিং ({bn(archived.length)})
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            আর্কাইভ করা মানে মুছে ফেলা নয় — সব হিসাব চিরকাল সংরক্ষিত থাকে।
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {archived.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper-deep/60 px-5 py-4">
                <div>
                  <p className="font-bold text-ink-soft">{b.name}</p>
                  <p className="text-xs text-ink-soft/70">{b.address}</p>
                </div>
                <form action={restoreBuilding}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-leaf-400 px-3.5 py-1.5 text-sm font-bold text-leaf-800 transition hover:bg-leaf-100">
                    <ArchiveRestore className="h-4 w-4" /> ফেরত আনুন
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
