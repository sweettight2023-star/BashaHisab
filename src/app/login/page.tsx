"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, LogIn, Phone, KeyRound, AlertCircle } from "lucide-react";
import { login, type ActionState } from "@/lib/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    login,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper paper-grain px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src="/logo.png" alt="বাসা হিসাব" className="h-10 w-10 rounded-xl object-cover shadow-card" />
          <span className="font-serif text-2xl font-bold">
            বাসা<span className="text-leaf-700">হিসাব</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-line bg-cream p-8 shadow-lift">
          <h1 className="font-serif text-3xl font-bold">আবারও স্বাগতম</h1>
          <p className="mt-2 text-ink-soft">আপনার হিসাব খাতায় লগইন করুন</p>

          {state?.error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-4">
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
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <KeyRound className="h-4 w-4" /> পাসওয়ার্ড
              </span>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3.5 text-lg font-bold text-cream shadow-card transition hover:bg-leaf-900 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              লগইন করুন
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[15px] text-ink-soft">
          নতুন ব্যবহারকারী?{" "}
          <Link href="/signup" className="font-bold text-leaf-800 underline-offset-4 hover:underline">
            ফ্রি অ্যাকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </div>
  );
}
