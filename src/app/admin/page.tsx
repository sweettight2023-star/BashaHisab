import { redirect } from "next/navigation";
import { desc, eq, isNull } from "drizzle-orm";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  MessageSquareHeart,
  ShieldCheck,
  TrendingUp,
  Users2,
  Wallet,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { buildings, feedback, paymentRequests, users } from "@/db/schema";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { approvePayment, rejectPayment } from "@/lib/actions";
import { bn, bnNum, dateLabel } from "@/lib/format";
import { UserSearchTable } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/dashboard");

  const requests = await db
    .select({ req: paymentRequests, userName: users.name, userPhone: users.phone })
    .from(paymentRequests)
    .innerJoin(users, eq(paymentRequests.userId, users.id))
    .orderBy(desc(paymentRequests.createdAt));

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  const feedbackRows = await db
    .select({ fb: feedback, userName: users.name, userPhone: users.phone })
    .from(feedback)
    .innerJoin(users, eq(feedback.userId, users.id))
    .orderBy(desc(feedback.createdAt));

  const activeBuildings = await db
    .select({ id: buildings.id, userId: buildings.userId })
    .from(buildings)
    .where(isNull(buildings.archivedAt));
  const buildingCountByUser = new Map<string, number>();
  for (const b of activeBuildings) {
    buildingCountByUser.set(b.userId, (buildingCountByUser.get(b.userId) ?? 0) + 1);
  }

  const pending = requests.filter((r) => r.req.status === "pending");
  const resolved = requests.filter((r) => r.req.status !== "pending").slice(0, 15);
  const approvedReqs = requests.filter((r) => r.req.status === "approved");

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);
  const todayIncome = approvedReqs
    .filter((r) => r.req.resolvedAt && r.req.resolvedAt.toISOString().slice(0, 10) === todayStr)
    .reduce((s, r) => s + r.req.amount, 0);
  const monthIncome = approvedReqs
    .filter((r) => r.req.resolvedAt && r.req.resolvedAt.toISOString().slice(0, 7) === monthStr)
    .reduce((s, r) => s + r.req.amount, 0);
  const totalIncome = approvedReqs.reduce((s, r) => s + r.req.amount, 0);

  const stats = [
    { icon: Users2, label: "মোট ব্যবহারকারী", value: bn(allUsers.length) },
    { icon: Crown, label: "প্রিমিয়াম সদস্য", value: bn(allUsers.filter((u) => u.plan === "premium").length) },
    { icon: Clock3, label: "অপেক্ষমাণ আবেদন", value: bn(pending.length) },
    { icon: CalendarDays, label: "আজকের আয়", value: `৳ ${bnNum(todayIncome)}` },
    { icon: TrendingUp, label: "এই মাসের আয়", value: `৳ ${bnNum(monthIncome)}` },
    { icon: Wallet, label: "সর্বমোট আয়", value: `৳ ${bnNum(totalIncome)}` },
  ];

  return (
    <div
      className="mx-auto max-w-6xl animate-rise px-4 py-6 sm:px-8 sm:py-10"
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
    >
      <h1 className="flex items-center gap-3 font-serif text-4xl font-bold">
        <ShieldCheck className="h-8 w-8 text-leaf-700" /> পেমেন্ট অনুমোদন
      </h1>
      <p className="mt-1.5 text-ink-soft">
        বিকাশ/নগদ পেমেন্ট যাচাই করে প্রিমিয়াম চালু করুন।
      </p>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-cream p-5 shadow-card">
            <s.icon className="h-5.5 w-5.5 text-leaf-700" />
            <p className="mt-3 text-sm font-semibold text-ink-soft">{s.label}</p>
            <p className="font-serif text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* সকল ব্যবহারকারী */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold">
          সকল ব্যবহারকারী ({bn(allUsers.length)})
        </h2>
        <UserSearchTable
          bn={bn}
          rows={allUsers.map((u) => {
            const activeNow =
              u.plan === "premium" && u.premiumUntil && new Date(u.premiumUntil) > new Date();
            return {
              id: u.id,
              name: u.name,
              phone: u.phone,
              role: u.role,
              isPremiumNow: !!activeNow,
              premiumUntilLabel: u.premiumUntil
                ? dateLabel(u.premiumUntil.toISOString().slice(0, 10))
                : "—",
              buildingCount: buildingCountByUser.get(u.id) ?? 0,
              createdAtLabel: dateLabel(u.createdAt.toISOString().slice(0, 10)),
            };
          })}
        />
      </div>

      {/* ফিডব্যাক */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
          <MessageSquareHeart className="h-6 w-6 text-leaf-700" /> ব্যবহারকারীদের মতামত ({bn(feedbackRows.length)})
        </h2>
        <div className="mt-4 space-y-3">
          {feedbackRows.length === 0 ? (
            <p className="rounded-2xl border border-line bg-cream p-8 text-center text-ink-soft">
              এখনো কোনো মতামত আসেনি।
            </p>
          ) : (
            feedbackRows.map((r) => (
              <div key={r.fb.id} className="rounded-2xl border border-line bg-cream p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">
                    {r.userName} <span className="font-normal text-ink-soft">({bn(r.userPhone)})</span>
                  </p>
                  <p className="text-xs text-ink-soft">{dateLabel(r.fb.createdAt.toISOString().slice(0, 10))}</p>
                </div>
                <p className="mt-2 leading-relaxed text-ink">{r.fb.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* অপেক্ষমাণ */}
      <div className="mt-9">
        <h2 className="font-serif text-2xl font-bold">
          অপেক্ষমাণ আবেদন ({bn(pending.length)})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-cream p-8 text-center text-ink-soft">
            কোনো নতুন আবেদন নেই।
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((r) => (
              <div
                key={r.req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-haldi-400/60 bg-haldi-300/10 p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  <div>
                    <p className="font-bold">{r.userName}</p>
                    <p className="text-sm text-ink-soft">{bn(r.userPhone)}</p>
                  </div>
                  <div>
                    <p className={`font-black ${r.req.method === "bkash" ? "text-bkash" : r.req.method === "nagad" ? "text-nagad" : "text-leaf-800"}`}>
                      {r.req.method === "bkash" ? "বিকাশ" : r.req.method === "nagad" ? "নগদ" : "ব্যাংক"}
                    </p>
                    <p className="text-sm text-ink-soft">থেকে {bn(r.req.senderNumber)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold">{r.req.transactionId}</p>
                    <p className="text-xs text-ink-soft">TrxID</p>
                  </div>
                  <div>
                    <p className="font-black">৳ {bnNum(r.req.amount)}</p>
                    <p className="text-xs text-ink-soft">{bn(r.req.months)} মাসের প্যাকেজ</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <form action={approvePayment}>
                    <input type="hidden" name="id" value={r.req.id} />
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-leaf-800 px-5 py-2.5 font-bold text-cream transition hover:bg-leaf-900">
                      <CheckCircle2 className="h-4.5 w-4.5" /> অনুমোদন
                    </button>
                  </form>
                  <form action={rejectPayment}>
                    <input type="hidden" name="id" value={r.req.id} />
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-5 py-2.5 font-bold text-red-600 transition hover:bg-red-50">
                      <XCircle className="h-4.5 w-4.5" /> বাতিল
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ইতিহাস */}
      {resolved.length > 0 && (
        <div className="mt-10">
          <h2 className="font-serif text-2xl font-bold">সাম্প্রতিক ইতিহাস</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream shadow-card">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line text-sm text-ink-soft">
                  <th className="px-5 py-3.5 font-semibold">তারিখ</th>
                  <th className="px-5 py-3.5 font-semibold">ব্যবহারকারী</th>
                  <th className="px-5 py-3.5 font-semibold">মাধ্যম</th>
                  <th className="px-5 py-3.5 font-semibold">TrxID</th>
                  <th className="px-5 py-3.5 font-semibold">পরিমাণ</th>
                  <th className="px-5 py-3.5 font-semibold">ফলাফল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {resolved.map((r) => (
                  <tr key={r.req.id}>
                    <td className="px-5 py-3.5 text-sm">{dateLabel(r.req.createdAt.toISOString().slice(0, 10))}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold">{r.userName}</p>
                      <p className="text-xs text-ink-soft">{bn(r.userPhone)}</p>
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      {r.req.method === "bkash" ? "বিকাশ" : r.req.method === "nagad" ? "নগদ" : "ব্যাংক"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm">{r.req.transactionId}</td>
                    <td className="px-5 py-3.5 font-bold">৳ {bnNum(r.req.amount)}</td>
                    <td className="px-5 py-3.5">
                      {r.req.status === "approved" ? (
                        <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-800">অনুমোদিত</span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">বাতিল</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
