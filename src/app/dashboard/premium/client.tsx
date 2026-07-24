"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Smartphone, Send } from "lucide-react";
import { submitPayment, type ActionState } from "@/lib/actions";
import { bn } from "@/lib/format";

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10";

const BANK = {
  bankName: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি (Islami Bank)",
  accountName: "MD SHAFIUL BASHAR",
  accountNumber: "2050 371 02 01225009",
};

const PACKAGES = [
  { months: 1, price: 299, label: "১ মাস" },
  { months: 6, price: 1499, label: "৬ মাস" },
  { months: 12, price: 2499, label: "১২ মাস" },
];

export function PaymentForm() {
  const [method, setMethod] = useState<"bkash" | "nagad" | "bank">("bkash");
  const [months, setMonths] = useState(1);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitPayment,
    null,
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (state?.success) setDone(true);
  }, [state]);

  const price = PACKAGES.find((p) => p.months === months)?.price ?? 299;

  if (done) {
    return (
      <div className="rounded-3xl border border-leaf-300 bg-leaf-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-leaf-700" />
        <h3 className="mt-4 font-serif text-2xl font-bold text-leaf-900">আবেদন জমা হয়েছে!</h3>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          আপনার ট্রানজেকশন যাচাই করে অল্প সময়ের মধ্যে প্রিমিয়াম চালু করা হবে। পেজ রিফ্রেশ করে স্ট্যাটাস দেখুন।
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-5 rounded-full border border-leaf-400 px-5 py-2 font-bold text-leaf-900 hover:bg-leaf-100"
        >
          নতুন আবেদন করুন
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-cream p-7 shadow-card">
      <h3 className="font-serif text-xl font-bold">পেমেন্ট জমা দিন</h3>

      {state?.error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          {state.error}
        </div>
      )}

      {/* মাধ্যম */}
      <p className="mt-5 text-sm font-semibold text-ink-soft">পেমেন্ট মাধ্যম</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {(
          [
            { key: "bkash", label: "বিকাশ", cls: "bg-[#e2136e]" },
            { key: "nagad", label: "নগদ", cls: "bg-[#f6921e]" },
            { key: "bank", label: "ব্যাংক", cls: "bg-leaf-800" },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={`rounded-xl px-3 py-3.5 font-serif text-base font-black transition ${
              method === m.key
                ? `${m.cls} text-white shadow-lift`
                : "border border-line bg-paper text-ink-soft hover:border-leaf-400"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === "bank" && (
        <div className="mt-4 space-y-1.5 rounded-xl border border-leaf-300 bg-leaf-50 p-4 text-sm">
          <p className="font-bold text-leaf-900">{BANK.bankName}</p>
          <p>
            নাম: <span className="font-bold">{BANK.accountName}</span>
          </p>
          <p>
            হিসাব নম্বর: <span className="font-mono font-bold">{BANK.accountNumber}</span>
          </p>
        </div>
      )}

      {/* প্যাকেজ */}
      <p className="mt-5 text-sm font-semibold text-ink-soft">প্যাকেজ নির্বাচন</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {PACKAGES.map((p) => (
          <button
            key={p.months}
            type="button"
            onClick={() => setMonths(p.months)}
            className={`rounded-xl px-3 py-3 text-center transition ${
              months === p.months
                ? "bg-leaf-800 text-cream shadow-lift"
                : "border border-line bg-paper hover:border-leaf-400"
            }`}
          >
            <p className="font-black">{p.label}</p>
            <p className={`mt-0.5 text-sm font-bold ${months === p.months ? "text-haldi-300" : "text-haldi-600"}`}>
              ৳ {bn(p.price)}
            </p>
          </button>
        ))}
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="method" value={method} />
        <input type="hidden" name="months" value={months} />
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <Smartphone className="h-4 w-4" />
            {method === "bank"
              ? "যে অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন (নাম/নম্বর)"
              : `যে নম্বর থেকে ${method === "bkash" ? "বিকাশ" : "নগদ"} করেছেন`}
          </span>
          <input
            name="senderNumber"
            type={method === "bank" ? "text" : "tel"}
            inputMode={method === "bank" ? "text" : "numeric"}
            required
            placeholder={method === "bank" ? "যেমন: করিম উদ্দিন, ব্র্যাক ব্যাংক" : "01XXXXXXXXX"}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            {method === "bank" ? "ব্যাংক রেফারেন্স/ট্রানজেকশন নম্বর" : "ট্রানজেকশন আইডি (TrxID)"}
          </span>
          <input
            name="transactionId"
            required
            placeholder={method === "bank" ? "যেমন: FT2607180001234" : "যেমন: 9HXXXXXXX2"}
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-haldi-400 py-3.5 font-black text-leaf-950 shadow-card transition hover:bg-haldi-300 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          ৳ {bn(price)} — পেমেন্ট জমা দিন
        </button>
      </form>
    </div>
  );
}
