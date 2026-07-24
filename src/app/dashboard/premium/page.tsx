import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Crown,
  Infinity as InfinityIcon,
  Smartphone,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { paymentRequests } from "@/db/schema";
import { ADMIN_PHONE, getCurrentUser, isPremiumActive } from "@/lib/auth";
import { bn, bnNum, dateLabel } from "@/lib/format";
import { PaymentForm } from "./client";

export const dynamic = "force-dynamic";

const perks = [
  "আনলিমিটেড বিল্ডিং যোগ করুন",
  "আনলিমিটেড ইউনিট ও ভাড়াটিয়া",
  "ভাড়ার রশিদ প্রিন্ট/PDF ডাউনলোড (ওয়াটারমার্কসহ)",
  "মাসিক ও বার্ষিক স্টেটমেন্ট দেখুন ও প্রিন্ট করুন",
  "বকেয়া ভাড়াটিয়াকে হোয়াটসঅ্যাপ/SMS রিমাইন্ডার পাঠান",
  "সব হিসাব চিরকাল সংরক্ষিত",
  "অগ্রাধিকার সাপোর্ট",
];

export default async function PremiumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const premium = isPremiumActive(user);

  const requests = await db
    .select()
    .from(paymentRequests)
    .where(eq(paymentRequests.userId, user.id))
    .orderBy(desc(paymentRequests.createdAt))
    .limit(10);

  return (
    <div className="mx-auto max-w-5xl animate-rise">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="flex items-center gap-3 font-serif text-4xl font-bold">
          <Crown className="h-8 w-8 text-haldi-500" /> প্রিমিয়াম
        </h1>
        {premium ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-haldi-400/25 px-4 py-1.5 font-black text-haldi-600">
            <BadgeCheck className="h-4.5 w-4.5" /> সক্রিয় আছে
          </span>
        ) : (
          <span className="rounded-full bg-line/60 px-4 py-1.5 text-sm font-bold text-ink-soft">
            আপনি ফ্রি প্ল্যানে আছেন
          </span>
        )}
      </div>
      {premium && user.premiumUntil && (
        <p className="mt-2 text-ink-soft">
          মেয়াদ: <span className="font-bold text-ink">{dateLabel(user.premiumUntil.toISOString().slice(0, 10))}</span> পর্যন্ত
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* বাম: নির্দেশনা */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-leaf-900 p-7 text-cream shadow-lift grain-dark">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-haldi-300">
              ধাপ ১ — টাকা পাঠান
            </p>
            <p className="mt-3 font-serif text-4xl font-black tracking-wide">{bn(ADMIN_PHONE)}</p>
            <p className="mt-1 text-sm text-cream/70">বিকাশ বা নগদ — পার্সোনাল নম্বর</p>
            <div className="mt-5 rounded-2xl bg-cream/10 p-4 text-sm leading-relaxed">
              <p className="font-bold text-haldi-300">অথবা সরাসরি ব্যাংকে —</p>
              <p className="mt-1">ইসলামী ব্যাংক বাংলাদেশ পিএলসি</p>
              <p>নাম: MD SHAFIUL BASHAR</p>
              <p className="font-mono">হিসাব নম্বর: 2050 371 02 01225009</p>
            </div>
            <div className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-cream/85">
              <p className="flex gap-2.5"><span className="font-black text-haldi-300">১.</span> বিকাশ/নগদ/ব্যাংক — যেকোনো একটি মাধ্যমে টাকা পাঠান</p>
              <p className="flex gap-2.5"><span className="font-black text-haldi-300">২.</span> প্যাকেজের সঠিক পরিমাণ পাঠান</p>
              <p className="flex gap-2.5"><span className="font-black text-haldi-300">৩.</span> পাওয়া TrxID/রেফারেন্স নম্বর নিচের ফর্মে জমা দিন</p>
              <p className="flex gap-2.5"><span className="font-black text-haldi-300">৪.</span> যাচাইয়ের পর প্রিমিয়াম চালু — মেয়াদকাল স্বয়ংক্রিয় যোগ হবে</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 font-semibold">
                <InfinityIcon className="h-5 w-5 shrink-0 text-leaf-700" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* ডান: ফর্ম */}
        <PaymentForm />
      </div>

      {/* আবেদনের তালিকা */}
      {requests.length > 0 && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Smartphone className="h-5.5 w-5.5 text-leaf-700" /> আপনার পেমেন্ট আবেদনসমূহ
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream shadow-card">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line text-sm text-ink-soft">
                  <th className="px-5 py-3.5 font-semibold">তারিখ</th>
                  <th className="px-5 py-3.5 font-semibold">মাধ্যম</th>
                  <th className="px-5 py-3.5 font-semibold">TrxID</th>
                  <th className="px-5 py-3.5 font-semibold">পরিমাণ</th>
                  <th className="px-5 py-3.5 font-semibold">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3.5 text-sm">{dateLabel(r.createdAt.toISOString().slice(0, 10))}</td>
                    <td className="px-5 py-3.5 font-bold">
                      <span className={r.method === "bkash" ? "text-bkash" : r.method === "nagad" ? "text-nagad" : "text-leaf-800"}>
                        {r.method === "bkash" ? "বিকাশ" : r.method === "nagad" ? "নগদ" : "ব্যাংক"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm">{r.transactionId}</td>
                    <td className="px-5 py-3.5 font-bold">৳ {bnNum(r.amount)} ({bn(r.months)} মাস)</td>
                    <td className="px-5 py-3.5">
                      {r.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-haldi-300/25 px-3 py-1 text-xs font-black text-haldi-600">
                          <Clock3 className="h-3.5 w-3.5" /> যাচাই চলছে
                        </span>
                      )}
                      {r.status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> অনুমোদিত
                        </span>
                      )}
                      {r.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                          <XCircle className="h-3.5 w-3.5" /> বাতিল
                        </span>
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
