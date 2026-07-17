"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, Building2, Loader2, Plus, X } from "lucide-react";
import { createBuilding, type ActionState } from "@/lib/actions";

export function NewBuildingDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createBuilding,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      ref.current?.reset();
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-leaf-800 px-5 py-2.5 font-bold text-cream shadow-card transition hover:bg-leaf-900"
      >
        <Plus className="h-4.5 w-4.5" /> নতুন বিল্ডিং
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md animate-rise rounded-3xl border border-line bg-cream p-7 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 font-serif text-2xl font-bold">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-800 text-cream">
                  <Building2 className="h-5 w-5" />
                </span>
                নতুন বিল্ডিং
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-soft hover:bg-line/50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state?.error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                {state.error}
              </div>
            )}

            <form ref={ref} action={formAction} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">বিল্ডিংয়ের নাম *</span>
                <input
                  name="name"
                  required
                  placeholder="যেমন: গ্রিন ভিলা / রহমান ম্যানশন"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">ঠিকানা</span>
                <input
                  name="address"
                  placeholder="বাসা/রোড/এলাকা, শহর"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">নোট (ঐচ্ছিক)</span>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="বিল্ডিং সম্পর্কে কিছু লিখে রাখুন…"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3.5 font-bold text-cream shadow-card transition hover:bg-leaf-900 disabled:opacity-60"
              >
                {pending && <Loader2 className="h-5 w-5 animate-spin" />}
                সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
