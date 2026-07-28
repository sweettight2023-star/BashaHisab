"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, MessageSquareHeart, Send } from "lucide-react";
import { submitFeedback, type ActionState } from "@/lib/actions";

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitFeedback,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div className="mt-10 rounded-3xl border border-line bg-cream p-6 shadow-card">
      <h2 className="flex items-center justify-center gap-2 text-center font-serif text-lg font-bold">
        <MessageSquareHeart className="h-5 w-5 text-leaf-700" /> মতামত বা ফিডব্যাক দিন
      </h2>
      <p className="mt-2 text-center text-sm text-ink-soft">
        অ্যাপ নিয়ে কোনো পরামর্শ, সমস্যা বা প্রশংসা থাকলে সরাসরি এখানে লিখুন — সরাসরি আমাদের কাছে পৌঁছে যাবে।
      </p>
      <form ref={formRef} action={formAction} className="mx-auto mt-4 max-w-lg">
        <textarea
          name="message"
          required
          rows={4}
          placeholder="আপনার মতামত লিখুন..."
          className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10"
        />
        {state?.error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="mt-2 rounded-lg bg-leaf-50 px-3 py-2 text-sm font-semibold text-leaf-800">
            {state.success}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
          পাঠিয়ে দিন
        </button>
      </form>
    </div>
  );
}
