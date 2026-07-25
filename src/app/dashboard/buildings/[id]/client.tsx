"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  DoorOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import {
  addExpense,
  addTenant,
  archiveExpense,
  archiveUnit,
  createUnit,
  deleteExpense,
  deleteRentPayment,
  endTenant,
  restoreExpense,
  saveRentPayment,
  updateBuilding,
  updateExpense,
  updateTenant,
  updateUnit,
  type ActionState,
} from "@/lib/actions";
import { EXPENSE_CATEGORIES, bn, today } from "@/lib/format";

/* ------------------------- শেয়ার্ড টাইপ ------------------------- */

export type UnitLite = {
  id: string;
  name: string;
  floor: string;
  monthlyRent: number;
};

export type PaymentLite = {
  amountDue: number;
  amountPaid: number;
  paidDate: string;
  notes: string;
  status: string;
} | null;

export type TenantLite = {
  id: string;
  name: string;
  phone: string;
  advance: number;
  startDate: string;
} | null;

/* ------------------------- ছোট UI সাহাযক ------------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 font-medium transition focus:border-leaf-600 focus:ring-4 focus:ring-leaf-600/10";

function StateMessages({ state }: { state: ActionState }) {
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

function Modal({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-md animate-rise rounded-3xl border border-line bg-cream p-7 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-serif text-xl font-bold">
            {icon}
            {title}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-ink-soft hover:bg-line/50">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------- মাস নির্বাচন ------------------------- */

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-2.5 rounded-full border border-line bg-cream px-4 py-2 shadow-card">
      <CalendarDays className="h-4.5 w-4.5 text-leaf-700" />
      <input
        type="month"
        value={month}
        onChange={(e) => {
          if (!e.target.value) return;
          const url = new URL(window.location.href);
          url.searchParams.set("m", e.target.value);
          router.push(`${url.pathname}${url.search}`);
        }}
        className="bg-transparent font-bold text-leaf-900"
      />
    </label>
  );
}

/* ------------------------- ভাড়া জমা ডায়ালগ ------------------------- */

export function PaymentButton({
  unit,
  tenant,
  month,
  payment,
}: {
  unit: UnitLite;
  tenant: TenantLite;
  month: string;
  payment: PaymentLite;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveRentPayment,
    null,
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  const due = payment?.amountDue ?? unit.monthlyRent;
  const paid = payment?.amountPaid ?? 0;
  const status = payment?.status ?? "unpaid";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-black shadow-card transition hover:-translate-y-0.5 ${
          status === "paid"
            ? "bg-leaf-800 text-cream"
            : "border border-leaf-300 bg-cream text-leaf-900"
        }`}
      >
        <CircleDollarSign className="h-4 w-4" />
        {status === "paid" ? "এডিট" : "জমা নিন"}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${unit.name} — ভাড়া জমা`}
        icon={<CircleDollarSign className="h-5.5 w-5.5 text-leaf-700" />}
      >
        <p className="mt-1.5 text-sm text-ink-soft">
          ভাড়াটিয়া: <span className="font-bold text-ink">{tenant?.name ?? "নেই (খালি ইউনিট)"}</span>
        </p>
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="unitId" value={unit.id} />
          <Field label="কোন মাসের ভাড়া জমা দিচ্ছেন">
            <input name="month" type="month" defaultValue={month} required className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="মাসিক ভাড়া (৳)">
              <input name="amountDue" type="number" min={0} defaultValue={due} required className={inputCls} />
            </Field>
            <Field label="জমার পরিমাণ (৳)">
              <input name="amountPaid" type="number" min={0} defaultValue={paid || due} required className={inputCls} />
            </Field>
          </div>
          <Field label="জমার তারিখ">
            <input name="paidDate" type="date" defaultValue={payment?.paidDate || today()} className={inputCls} />
          </Field>
          <Field label="নোট (ঐচ্ছিক)">
            <input name="notes" defaultValue={payment?.notes ?? ""} placeholder="যেমন: নগদে নেওয়া হয়েছে" className={inputCls} />
          </Field>
          <p className="rounded-xl bg-leaf-50 px-4 py-2.5 text-xs leading-relaxed text-leaf-900">
            অন্য মাসের ভাড়া জমা নিলে উপর থেকে মাস বদলে দিন — মাসিক ভাড়া/জমার পরিমাণও প্রয়োজনে ঠিক করে নিন। পুরো ভাড়ার চেয়ে কম জমা দিলে “আংশিক” হিসেবে ধরা হবে।
          </p>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream shadow-card transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

/* ------------------------- ভাড়াটিয়ার তথ্য সম্পাদনা (ফোন নম্বর ইত্যাদি) ------------------------- */

export function TenantEditDialog({
  tenant,
}: {
  tenant: { id: string; name: string; phone: string; nid: string; advance: number };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateTenant,
    null,
  );
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="ভাড়াটিয়ার তথ্য সম্পাদনা (ফোন নম্বর যোগ/পরিবর্তন)"
        className="flex h-8 w-8 items-center justify-center rounded-full text-leaf-800 transition hover:bg-leaf-100"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${tenant.name} — তথ্য সম্পাদনা`}
        icon={<Pencil className="h-5.5 w-5.5 text-leaf-700" />}
      >
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={tenant.id} />
          <Field label="ভাড়াটিয়ার নাম *">
            <input name="name" required defaultValue={tenant.name} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="মোবাইল নম্বর">
              <input
                name="phone"
                placeholder="01XXXXXXXXX"
                defaultValue={tenant.phone}
                className={inputCls}
              />
            </Field>
            <Field label="অগ্রিম/জামানত (৳)">
              <input
                name="advance"
                type="number"
                min={0}
                defaultValue={tenant.advance}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="এনআইডি (ঐচ্ছিক)">
            <input name="nid" defaultValue={tenant.nid} className={inputCls} />
          </Field>
          <p className="rounded-xl bg-leaf-50 px-4 py-2.5 text-xs leading-relaxed text-leaf-900">
            ফোন নম্বর দিলে বকেয়া থাকা অবস্থায় হোয়াটসঅ্যাপ/SMS রিমাইন্ডার আইকন চালু হয়ে যাবে।
          </p>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

export function AddUnitForm({ buildingId }: { buildingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createUnit,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      ref.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 font-bold text-leaf-900">
          <DoorOpen className="h-5 w-5" /> নতুন ইউনিট (ফ্ল্যাট/কক্ষ) যোগ করুন
        </span>
        <Plus className={`h-5 w-5 transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && (
        <>
          <StateMessages state={state} />
          <form ref={ref} action={formAction} className="mt-4 grid gap-3 sm:grid-cols-4">
            <input type="hidden" name="buildingId" value={buildingId} />
            <input name="name" required placeholder="নাম (যেমন: ফ্ল্যাট ৩এ)" className={inputCls} />
            <input name="floor" placeholder="তলা (যেমন: ৩য়)" className={inputCls} />
            <input name="monthlyRent" type="number" min={0} required placeholder="মাসিক ভাড়া (৳)" className={inputCls} />
            <button
              type="submit"
              disabled={pending}
              className="flex items-center justify-center gap-2 rounded-xl bg-leaf-800 py-2.5 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Plus className="h-4.5 w-4.5" />}
              যোগ করুন
            </button>
          </form>
        </>
      )}
      {!open && state?.error && <StateMessages state={state} />}
    </div>
  );
}

/* ------------------------- ইউনিট সম্পাদনা ------------------------- */

export function UnitEditDialog({ unit }: { unit: UnitLite }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateUnit,
    null,
  );
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="ইউনিট সম্পাদনা (নাম/ভাড়া)"
        className="rounded-full p-2 text-ink-soft transition hover:bg-line/50 hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`${unit.name} — সম্পাদনা`}>
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={unit.id} />
          <Field label="ইউনিটের নাম">
            <input name="name" defaultValue={unit.name} required className={inputCls} />
          </Field>
          <Field label="তলা">
            <input name="floor" defaultValue={unit.floor} className={inputCls} />
          </Field>
          <Field label="মাসিক ভাড়া (৳)">
            <input name="monthlyRent" type="number" min={0} defaultValue={unit.monthlyRent} required className={inputCls} />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            হালনাগাদ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

export function ArchiveUnitButton({ unitId }: { unitId: string }) {
  return (
    <form
      action={archiveUnit}
      onSubmit={(e) => {
        if (!confirm("ইউনিটটি আর্কাইভ করা হবে — ভাড়া ও খরচের হিসাব মুছে যাবে না।"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={unitId} />
      <button
        title="আর্কাইভ করুন"
        className="rounded-full p-2 text-ink-soft transition hover:bg-line/50 hover:text-ink"
      >
        <Archive className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ------------------------- ভাড়াটিয়া ------------------------- */

export function TenantDialog({ unit, tenant }: { unit: UnitLite; tenant: TenantLite }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addTenant,
    null,
  );
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3.5 py-1.5 text-sm font-bold text-leaf-900 transition hover:bg-leaf-200"
      >
        <UserPlus className="h-4 w-4" />
        {tenant ? "নতুন ভাড়াটিয়া" : "ভাড়াটিয়া বসান"}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${unit.name} — ভাড়াটিয়া`}
        icon={<UserPlus className="h-5.5 w-5.5 text-leaf-700" />}
      >
        {tenant && (
          <p className="mt-2 rounded-xl bg-haldi-300/20 px-4 py-2.5 text-xs leading-relaxed text-haldi-600">
            বর্তমান ভাড়াটিয়া <b>{tenant.name}</b>-এর হিসাব সংরক্ষিত থাকবে; নতুন ভাড়াটিয়া যোগ করলে আগেরটির মেয়াদ স্বয়ংক্রিয়ভাবে শেষ হবে।
          </p>
        )}
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="unitId" value={unit.id} />
          <Field label="ভাড়াটিয়ার নাম *">
            <input name="name" required placeholder="পুরো নাম" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="মোবাইল নম্বর">
              <input name="phone" placeholder="01XXXXXXXXX" className={inputCls} />
            </Field>
            <Field label="অগ্রিম/জামানত (৳)">
              <input name="advance" type="number" min={0} placeholder="০" className={inputCls} />
            </Field>
          </div>
          <Field label="এনআইডি (ঐচ্ছিক)">
            <input name="nid" placeholder="জাতীয় পরিচয়পত্র নম্বর" className={inputCls} />
          </Field>
          <Field label="উঠার তারিখ">
            <input name="startDate" type="date" defaultValue={today()} className={inputCls} />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

export function EndTenantButton({ tenantId }: { tenantId: string }) {
  return (
    <form
      action={endTenant}
      onSubmit={(e) => {
        if (!confirm("ভাড়াটিয়া ছেড়ে গেছে? তার আগের সব হিসাব সংরক্ষিত থাকবে।"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="tenantId" value={tenantId} />
      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-bold text-ink-soft transition hover:border-red-300 hover:text-red-600"
      >
        <UserMinus className="h-4 w-4" /> ছেড়ে গেছে
      </button>
    </form>
  );
}

/* ------------------------- বিল্ডিং সম্পাদনা ------------------------- */

export function EditBuildingDialog({
  building,
}: {
  building: { id: string; name: string; address: string; notes: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateBuilding,
    null,
  );
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-sm font-bold text-ink-soft shadow-card transition hover:text-leaf-900"
      >
        <Pencil className="h-4 w-4" /> নাম/ঠিকানা বদলান
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="বিল্ডিং সম্পাদনা">
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={building.id} />
          <Field label="বিল্ডিংয়ের নাম">
            <input name="name" defaultValue={building.name} required className={inputCls} />
          </Field>
          <Field label="ঠিকানা">
            <input name="address" defaultValue={building.address} className={inputCls} />
          </Field>
          <Field label="নোট">
            <textarea name="notes" rows={2} defaultValue={building.notes} className={inputCls} />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            হালনাগাদ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

/* ------------------------- খরচ ------------------------- */

export function ExpenseForm({ buildingId }: { buildingId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addExpense,
    null,
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <StateMessages state={state} />
      <form ref={ref} action={formAction} className="mt-1 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr_auto]">
        <input type="hidden" name="buildingId" value={buildingId} />
        <select name="category" defaultValue="electricity" className={inputCls}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <input name="amount" type="number" min={1} required placeholder="পরিমাণ (৳)" className={inputCls} />
        <input name="expenseDate" type="date" defaultValue={today()} className={inputCls} />
        <input name="description" placeholder="বিবরণ (ঐচ্ছিক)" className={inputCls} />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-xl bg-leaf-800 px-6 py-2.5 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Plus className="h-4.5 w-4.5" />}
          খরচ যোগ
        </button>
      </form>
    </div>
  );
}

export function ArchiveExpenseButton({ id }: { id: string }) {
  return (
    <form
      action={archiveExpense}
      onSubmit={(e) => {
        if (!confirm("খরচটি আর্কাইভে রাখা হবে। চাইলে পরে ফেরত আনতে পারবেন — মুছে যাবে না।"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        title="আর্কাইভ করুন"
        className="rounded-full p-1.5 text-ink-soft/60 transition hover:bg-line/50 hover:text-ink"
      >
        <Archive className="h-4 w-4" />
      </button>
    </form>
  );
}

export function ExpenseEditDialog({
  expense,
}: {
  expense: { id: string; category: string; amount: number; expenseDate: string; description: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateExpense,
    null,
  );
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="খরচের তথ্য এডিট করুন"
        className="rounded-full p-1.5 text-leaf-800 transition hover:bg-leaf-100"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="খরচ সম্পাদনা" icon={<Pencil className="h-5.5 w-5.5 text-leaf-700" />}>
        <StateMessages state={state} />
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={expense.id} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="ধরন">
              <select name="category" defaultValue={expense.category} className={inputCls}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="পরিমাণ (৳)">
              <input name="amount" type="number" min={1} required defaultValue={expense.amount} className={inputCls} />
            </Field>
          </div>
          <Field label="তারিখ">
            <input name="expenseDate" type="date" defaultValue={expense.expenseDate} className={inputCls} />
          </Field>
          <Field label="বিবরণ (ঐচ্ছিক)">
            <input name="description" defaultValue={expense.description} className={inputCls} />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-800 py-3 font-bold text-cream transition hover:bg-leaf-900 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      </Modal>
    </>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <form
      action={deleteExpense}
      onSubmit={(e) => {
        if (!confirm("এই খরচের এন্ট্রি স্থায়ীভাবে মুছে ফেলা হবে, ফেরত আনা যাবে না। নিশ্চিত?"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        title="স্থায়ীভাবে মুছুন"
        className="rounded-full p-1.5 text-red-500/70 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export function DeletePaymentButton({ id }: { id: string }) {
  return (
    <form
      action={deleteRentPayment}
      onSubmit={(e) => {
        if (
          !confirm(
            "এই ভাড়া জমার এন্ট্রি স্থায়ীভাবে মুছে ফেলা হবে (ভুল ইউনিটে জমা হলে এটাই সংশোধনের উপায়)। নিশ্চিত?",
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        title="এই মাসের জমা এন্ট্রি মুছুন (ভুল সংশোধন)"
        className="flex h-9 w-9 items-center justify-center rounded-full text-red-500/70 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}

export function ArchivedExpenses({
  items,
}: {
  items: { id: string; label: string; sub: string; amount: number }[];
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-line bg-paper-deep/40 p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left font-bold text-ink-soft"
      >
        <span className="flex items-center gap-2">
          <Archive className="h-4.5 w-4.5" /> আর্কাইভে রয়েছে {bn(items.length)}টি খরচ (চিরকাল সংরক্ষিত)
        </span>
        <Plus className={`h-5 w-5 transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && (
        <ul className="mt-4 divide-y divide-line/70">
          {items.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-semibold text-ink-soft">{e.label}</p>
                <p className="text-xs text-ink-soft/70">{e.sub}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-bold text-ink-soft">৳ {e.amount.toLocaleString("en-IN")}</span>
                <form action={restoreExpense}>
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    title="ফেরত আনুন"
                    className="rounded-full p-1.5 text-leaf-700 transition hover:bg-leaf-100"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
