import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ArrowRight,
  BedDouble,
  Building2,
  CircleHelp,
  CircleDollarSign,
  Crown,
  HandCoins,
  History,
  Landmark,
  Mail,
  PenLine,
  ReceiptText,
  UserPlus,
} from "lucide-react";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { bn } from "@/lib/format";
import { ADMIN_PHONE } from "@/lib/auth";
import { FeedbackForm } from "./client";

export const dynamic = "force-dynamic";

const steps = [
  {
    no: "০১",
    icon: Building2,
    title: "বিল্ডিং যোগ করুন",
    desc: "“বিল্ডিংসমূহ” পেজে গিয়ে “নতুন বিল্ডিং” বোতাম চাপুন। বিল্ডিংয়ের নাম ও ঠিকানা লিখুন — যেমন: গ্রিন ভিলা, ধানমন্ডি।",
  },
  {
    no: "০২",
    icon: BedDouble,
    title: "ইউনিট (ফ্ল্যাট/কক্ষ) যোগ করুন",
    desc: "বিল্ডিংয়ে ঢুকে “নতুন ইউনিট” খুলুন। ইউনিটের নাম (ফ্ল্যাট ৩এ), তলা (৩য়) ও মাসিক ভাড়া লিখুন। সব ইউনিট এভাবে যোগ করে নিন।",
  },
  {
    no: "০৩",
    icon: UserPlus,
    title: "ভাড়াটিয়া বসান",
    desc: "প্রতিটি ইউনিটের কার্ডে “ভাড়াটিয়া বসান” চাপুন। নাম, মোবাইল, জামানত ও উঠার তারিখ দিন। নতুন ভাড়াটিয়া এলে আগেরটির হিসাব নষ্ট হয় না — স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।",
  },
  {
    no: "০৪",
    icon: CircleDollarSign,
    title: "মাসিক ভাড়া জমা নিন",
    desc: "“ভাড়া আদায়ের ছক”-এ প্রতি মাস টেবিল তৈরি হয়। ভাড়া পেলে “জমা নিন” চাপুন। কম দিলে “আংশিক” দেখাবে ও বাকি টাকা বকেয়া থাকবে। আগের মাসের হিসাবও “মাস বাছাই” থেকে ঢোকাতে পারবেন।",
  },
  {
    no: "০৫",
    icon: ReceiptText,
    title: "খরচের খাতা লিখুন",
    desc: "বিদ্যুৎ, পানি, মেরামত, কর্মচারী বেতন — সব খরচ ক্যাটাগরি বেছে পরিমাণ ও তারিখ লিখুন। মাস-শেষের সারাংশে দেখবেন নীট আয় (আদায় − খরচ) কত।",
  },
];

const facts = [
  {
    icon: History,
    title: "হিসাব কি মুছে যাবে?",
    desc: "না, কখনো না। বিল্ডিং, ইউনিট বা খরচ — কিছু “আর্কাইভ” করলেও সেটি মুছে না গিয়ে সংরক্ষিত থাকে, আর্কাইভ তালিকা থেকে ফেরতও আনা যায়।",
  },
  {
    icon: Archive,
    title: "আর্কাইভ কী?",
    desc: "যে বিল্ডিং/ইউনিট আর ব্যবহার করছেন না, সেটি আর্কাইভে রাখুন — চোখের সামনে থেকে সরে যাবে, কিন্তু তার সব হিসাব চিরকাল জमा থাকবে।",
  },
  {
    icon: PenLine,
    title: "নাম পরিবর্তন করা যাবে?",
    desc: "হ্যাঁ। সেটিংস থেকে আপনার নাম, বিল্ডিং পেজ থেকে বিল্ডিংয়ের নাম-ঠিকানা, আর ইউনিটের নাম-ভাড়া যেকোনো সময় বদলাতে পারবেন।",
  },
  {
    icon: Crown,
    title: "প্রিমিয়াম কীভাবে নেব?",
    desc: `বিকাশ/নগদে ${bn(ADMIN_PHONE)} নম্বরে সেন্ড মানি করে “প্রিমিয়াম” পেজে TrxID জমা দিন। যাচাই শেষে আনলিমিটেড বিল্ডিং চালু হবে।`,
  },
];

export default async function HelpPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const admin = isAdmin(user);

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <h1 className="flex items-center gap-3 font-serif text-4xl font-bold">
        <CircleHelp className="h-8 w-8 text-leaf-700" /> কীভাবে ব্যবহার করবেন
      </h1>
      <p className="mt-1.5 text-ink-soft">
        মাত্র ৫টি ধাপে আপনার বাসা-বাড়ির পুরো হিসাব ডিজিটালে — একবার শিখলেই সারাজীবনের সুবিধা।
      </p>

      {/* ধাপসমূহ */}
      <div className="mt-9 space-y-4">
        {steps.map((s) => (
          <div key={s.no} className="relative flex gap-5 rounded-3xl border border-line bg-cream p-6 shadow-card">
            <span className="pointer-events-none absolute right-6 top-4 font-serif text-5xl font-black text-leaf-100">
              {s.no}
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-leaf-800 text-cream shadow-card">
              <s.icon className="h-6 w-6" />
            </span>
            <div className="relative">
              <h2 className="font-serif text-xl font-bold">{s.title}</h2>
              <p className="mt-1.5 leading-relaxed text-ink-soft">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* প্রশ্নোত্তর */}
      <h2 className="mt-12 font-serif text-2xl font-bold">সাধারণ প্রশ্ন</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-cream p-5 shadow-card">
            <f.icon className="h-5.5 w-5.5 text-leaf-700" />
            <h3 className="mt-3 font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* অ্যাডমিন নোট */}
      {admin && (
        <div className="mt-10 rounded-3xl border border-haldi-400/50 bg-haldi-300/10 p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <Landmark className="h-5.5 w-5.5 text-haldi-600" /> আপনি অ্যাডমিন — পেমেন্ট কীভাবে অনুমোদন করবেন
          </h2>
          <ol className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-soft">
            <li><b>১.</b> কাস্টমার {bn(ADMIN_PHONE)} নম্বরে টাকা পাঠিয়ে তাঁর অ্যাপ থেকে TrxID জমা দেবে।</li>
            <li><b>২.</b> আপনার বিকাশ/নগদ অ্যাপে গিয়ে TrxID ও টাকার পরিমাণ মিলিয়ে দেখুন।</li>
            <li><b>৩.</b> “পেমেন্ট অনুমোদন” পেজে সেই আবেদনে “অনুমোদন” চাপুন — সাথে সাথে প্রিমিয়াম চালু।</li>
            <li><b>৪.</b> TrxID না মিললে “বাতিল” চাপুন — কাস্টমার তাঁর পেজে স্ট্যাটাস দেখতে পাবে।</li>
          </ol>
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-line bg-cream p-6 text-center shadow-card">
        <h2 className="flex items-center justify-center gap-2 font-serif text-lg font-bold">
          <Mail className="h-5 w-5 text-leaf-700" /> অফিশিয়াল যোগাযোগ
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          কোনো প্রশ্ন, সমস্যা বা মতামত থাকলে ইমেইল করুন —
        </p>
        <a
          href="mailto:bashahisab@gmail.com"
          className="mt-1 inline-block font-bold text-leaf-800 underline underline-offset-2"
        >
          bashahisab@gmail.com
        </a>
      </div>

      <FeedbackForm />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-leaf-900 p-7 text-cream shadow-lift grain-dark">
        <div>
          <h2 className="font-serif text-2xl font-bold">শুরু করতে প্রস্তুত?</h2>
          <p className="mt-1 flex items-center gap-2 text-cream/75">
            <HandCoins className="h-4.5 w-4.5 text-haldi-300" /> প্রথম বিল্ডিংটিই যোগ করে ফেলুন।
          </p>
        </div>
        <Link
          href="/dashboard/buildings"
          className="inline-flex items-center gap-2 rounded-full bg-haldi-400 px-6 py-3 font-black text-leaf-950 transition hover:bg-haldi-300"
        >
          বিল্ডিং যোগ করুন <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    </div>
  );
}
