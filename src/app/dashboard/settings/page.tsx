import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Crown,
  Phone,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users2,
  UserX,
} from "lucide-react";
import { db } from "@/db";
import { memberships, users } from "@/db/schema";
import { getCurrentUser, isPremiumActive } from "@/lib/auth";
import { removeMember } from "@/lib/actions";
import { bn, dateLabel } from "@/lib/format";
import { MemberAddForm, NameForm, PasswordForm } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const premium = isPremiumActive(user);

  const members = await db
    .select({ id: memberships.id, name: users.name, phone: users.phone, since: memberships.createdAt })
    .from(memberships)
    .innerJoin(users, eq(memberships.memberUserId, users.id))
    .where(eq(memberships.ownerId, user.id));

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <h1 className="flex items-center gap-3 font-serif text-4xl font-bold">
        <Settings2 className="h-8 w-8 text-leaf-700" /> সেটিংস
      </h1>
      <p className="mt-1.5 text-ink-soft">আপনার অ্যাকাউন্টের তথ্য ইচ্ছেমতো পরিবর্তন করুন।</p>

      {/* প্রোফাইল */}
      <div className="mt-8 rounded-3xl border border-line bg-cream p-7 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div>
            <p className="font-serif text-xl font-bold">{user.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
              <Phone className="h-4 w-4" /> {bn(user.phone)} — লগইন নম্বর (পরিবর্তনযোগ্য নয়)
            </p>
          </div>
          {premium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-haldi-400/25 px-4 py-1.5 font-black text-haldi-600">
              <Crown className="h-4.5 w-4.5" /> প্রিমিয়াম সক্রিয়
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-line/60 px-4 py-1.5 text-sm font-bold text-ink-soft">
              <ShieldCheck className="h-4.5 w-4.5" /> ফ্রি প্ল্যান
            </span>
          )}
        </div>
        <NameForm defaultName={user.name} />
      </div>

      {/* স্টাফ/ম্যানেজার অ্যাক্সেস — মাল্টি-ইউজার */}
      <div className="mt-6 rounded-3xl border border-line bg-cream p-7 shadow-card">
        <h2 className="flex items-center gap-2.5 font-serif text-xl font-bold">
          <Users2 className="h-5.5 w-5.5 text-leaf-700" /> স্টাফ/ম্যানেজার অ্যাক্সেস
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          আপনার কেয়ারটেকার বা ম্যানেজারকে অ্যাক্সেস দিন — তিনি নিজের মোবাইল দিয়ে লগইন করে আপনার
          বিল্ডিংগুলোর হিসাব <b>লিখতে ও দেখতে</b> পারবেন, কিন্তু প্ল্যান/সেটিংস বদলাতে পারবেন না।
        </p>

        {!premium && (
          <p className="mt-4 rounded-xl bg-haldi-300/20 px-4 py-3 text-sm font-semibold text-haldi-600">
            এটি একটি প্রিমিয়াম ফিচার — আগে “প্রিমিয়াম” মেনু থেকে প্যাকেজ চালু করুন।
          </p>
        )}
        {premium && <MemberAddForm />}

        {members.length > 0 && (
          <ul className="mt-5 divide-y divide-line/70">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 text-leaf-800">
                    <UserPlus className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-xs text-ink-soft">
                      {bn(m.phone)} • যুক্ত হয়েছে {dateLabel(m.since.toISOString().slice(0, 10))}
                    </p>
                  </div>
                </div>
                <form action={removeMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    title="অ্যাক্সেস বন্ধ করুন"
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4" /> সরান
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* পাসওয়ার্ড */}
      <div className="mt-6 rounded-3xl border border-line bg-cream p-7 shadow-card">
        <h2 className="font-serif text-xl font-bold">পাসওয়ার্ড পরিবর্তন</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
