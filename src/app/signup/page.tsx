"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Landmark,
  Loader2,
  Phone,
  UserRound,
  UserPlus,
} from "lucide-react";
import { signup, type ActionState } from "@/lib/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signup,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper paper-grain px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-leaf-800 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="বাসা হিসাব" className="h-full w-full object-cover" />
          </span>
          <span className="font-serif text-2xl font-bold">
            বাসা<span className="text-leaf-700">হিসাব</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-line bg-cream p-8 shadow-lift">
          <h1 className="font-serif text-3xl font-bold">ফ্রি অ্যাকাউন্ট খুলুন</h1>
          <p className="mt-2 text-ink-soft">৩০ সেকেন্ডেই আপনার ডিজিটাল হিসাব খাতা</p>

          {state?.error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <UserRound className="h-4 w-4" /> আপনার নাম
              </span>
              <input
                name="name"
                required
                placeholder="যেমন: আব্দুল করিম"
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Phone className="h-4 w-4" /> মোবাইল নম্বর
              </span>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                  <KeyRound className="h-4 w-4" /> পাসওয়ার্ড
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
                  আবার পাসওয়ার্ড
                </span>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3.5 text-lg font-bold text-cream shadow-card transition hover:bg-leaf-900 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
              অ্যাকাউন্ট খুলুন
            </button>
          </form>

          <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-leaf-600" /> ১টি বিল্ডিং ও ৫টি ইউনিট ফ্রি</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-leaf-600" /> হিসাব চিরকাল সংরক্ষিত থাকে</li>
          </ul>
        </div>

        <p className="mt-6 text-center text-[15px] text-ink-soft">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-bold text-leaf-800 underline-offset-4 hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
