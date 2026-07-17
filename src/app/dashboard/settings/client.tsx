"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Phone,
  Save,
  UserPlus,
  UserRound,
} from "lucide-react";
import { addMember, changePassword, updateName, type ActionState } from "@/lib/actions";

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10";

function Msg({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        {state.error}
      </div>
    );
  if (state.success)
    return (
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-leaf-300 bg-leaf-50 px-4 py-3 text-sm font-medium text-leaf-800">
        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        {state.success}
      </div>
    );
  return null;
}

export function NameForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateName,
    null,
  );
  return (
    <form action={formAction}>
      <Msg state={state} />
      <label className="mt-4 block">
        <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <UserRound className="h-4 w-4" /> আপনার নাম
        </span>
        <input name="name" defaultValue={defaultName} required minLength={2} className={inputCls} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-leaf-800 px-6 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
        নাম সংরক্ষণ করুন
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    changePassword,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction}>
      <Msg state={state} />
      <div className="mt-4 space-y-3.5">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <KeyRound className="h-4 w-4" /> বর্তমান পাসওয়ার্ড
          </span>
          <input name="current" type="password" required className={inputCls} />
        </label>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-soft">নতুন পাসওয়ার্ড</span>
            <input name="next" type="password" required minLength={6} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-soft">নতুনটি আবার</span>
            <input name="confirm" type="password" required minLength={6} className={inputCls} />
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-leaf-800 px-6 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <KeyRound className="h-4.5 w-4.5" />}
        পাসওয়ার্ড বদলান
      </button>
    </form>
  );
}

export function MemberAddForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addMember,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction}>
      <Msg state={state} />
      <label className="mt-4 block">
        <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Phone className="h-4 w-4" /> স্টাফের মোবাইল নম্বর
        </span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            required
            placeholder="01XXXXXXXXX — তাকে আগে সাইন আপ করতে বলুন"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-leaf-800 px-6 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <UserPlus className="h-4.5 w-4.5" />}
            অ্যাক্সেস দিন
          </button>
        </div>
      </label>
    </form>
  );
}
