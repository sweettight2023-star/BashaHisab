import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Droplets,
  Flame,
  Globe2,
  History,
  Landmark,
  LockKeyhole,
  MoreHorizontal,
  Paintbrush,
  PenLine,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wifi,
  Wrench,
  Zap,
  Crown,
  Wallet,
  FileCheck2,
} from "lucide-react";

const expenseItems = [
  { icon: Zap, label: "বিদ্যুৎ বিল", tint: "bg-haldi-300/30 text-haldi-600" },
  { icon: Droplets, label: "পানি বিল", tint: "bg-sky-100 text-sky-700" },
  { icon: Flame, label: "গ্যাস বিল", tint: "bg-orange-100 text-orange-600" },
  { icon: Wrench, label: "মেরামত", tint: "bg-stone-200 text-stone-600" },
  { icon: Users, label: "কর্মচারী বেতন", tint: "bg-leaf-100 text-leaf-700" },
  { icon: ShieldCheck, label: "সিকিউরিটি", tint: "bg-indigo-100 text-indigo-700" },
  { icon: ArrowUpDown, label: "লিফট রক্ষণাবেক্ষণ", tint: "bg-violet-100 text-violet-700" },
  { icon: Landmark, label: "পৌর কর/ট্যাক্স", tint: "bg-rose-100 text-rose-700" },
  { icon: Wifi, label: "ইন্টারনেট/ডিশ", tint: "bg-cyan-100 text-cyan-700" },
  { icon: Paintbrush, label: "রং-মিস্ত্রি কাজ", tint: "bg-amber-100 text-amber-700" },
  { icon: Sparkles, label: "পরিষ্কার-পরিচ্ছন্নতা", tint: "bg-emerald-100 text-emerald-700" },
  { icon: MoreHorizontal, label: "অন্যান্য খরচ", tint: "bg-neutral-200 text-neutral-600" },
];

const features = [
  {
    no: "০১",
    icon: Building2,
    title: "এক মালিক, বহু বিল্ডিং",
    desc: "আপনার যতগুলো বাসা-বাড়ি আছে, সবগুলোর আলাদা আলাদা খাতা এক অ্যাকাউন্টেই। প্রতিটি ভবনের ইউনিট, ভাড়াটিয়া, আয়-ব্যয় সুসংগঠিত — আর প্রতিটি আদায়ের প্রিন্টযোগ্য PDF রশিদ এক ক্লিকে।",
  },
  {
    no: "০২",
    icon: ReceiptText,
    title: "ভাড়ার ছক + হোয়াটসঅ্যাপ রিমাইন্ডার",
    desc: "কার কত বকেয়া — মাসভিত্তিক ছকে এক নজরে। বকেয়া আছে এমন ভাড়াটিয়াকে এক ক্লিকে হোয়াটসঅ্যাপ/SMS-এ সাজানো রিমাইন্ডার মেসেজ পাঠিয়ে দিন।",
  },
  {
    no: "০৩",
    icon: History,
    title: "হিসাব কখনো মুছে যায় না",
    desc: "৫ বছর আগের খরচও খুঁজে পাবেন মুহূর্তে। সব তথ্য আর্কাইভে চিরকাল সংরক্ষিত থাকে — কাগজের খাতার মতো নষ্ট বা হারানোর ভয় নেই। সাবেক ভাড়াটিয়ার রেকর্ডও থাকে।",
  },
  {
    no: "০৪",
    icon: Globe2,
    title: "স্টাফ অ্যাক্সেস, একাধিক লগইন",
    desc: "কেয়ারটেকার বা ম্যানেজারকে নিজের মোবাইল দিয়ে হিসাব লেখার অ্যাক্সেস দিন — আপনি না থাকলেও ভাড়া এন্ট্রি হবে। আর দেশের যেকোনো প্রান্ত থেকে নিজের নামে, যেকোনো ডিভাইসে চালান।",
  },
];

const marqueeWords = [
  "ভাড়া আদায়ের হিসাব",
  "বকেয়ার সঠিক ছক",
  "খরচের খাতা",
  "একাধিক বিল্ডিং",
  "ভাড়াটিয়ার তথ্য",
  "চিরস্থায়ী আর্কাইভ",
  "বিকাশ/নগদ পেমেন্ট",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper text-ink">
      {/* ================= নেভবার ================= */}
      <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="বাসা হিসাব" className="h-9 w-9 rounded-xl object-cover shadow-card" />
            <span className="font-serif text-xl font-bold tracking-tight">
              বাসা<span className="text-leaf-700">হিসাব</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-ink-soft md:flex">
            <a href="#features" className="transition hover:text-leaf-800">ফিচার</a>
            <a href="#expenses" className="transition hover:text-leaf-800">খরচের খাতা</a>
            <a href="#pricing" className="transition hover:text-leaf-800">প্যাকেজ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-leaf-900 transition hover:bg-leaf-100/70"
            >
              লগইন
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-leaf-800 px-4.5 py-2 text-[15px] font-semibold text-cream shadow-card transition hover:bg-leaf-900 hover:shadow-lift"
            >
              ফ্রি শুরু করুন
            </Link>
          </div>
        </div>
      </header>

      {/* ================= হিরো ================= */}
      <section className="relative paper-grain">
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-leaf-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[420px] w-[420px] rounded-full bg-haldi-300/25 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-leaf-300/60 bg-leaf-50 px-4 py-1.5 text-sm font-semibold text-leaf-800">
              <BadgeCheck className="h-4 w-4" />
              বাংলাদেশের বাসা মালিকদের জন্য তৈরি
            </div>
            <h1 className="font-serif text-[42px] font-bold leading-[1.18] tracking-tight sm:text-6xl lg:text-[68px]">
              বাসা-বাড়ির <span className="relative inline-block text-leaf-800">
                হিসাব
                <svg viewBox="0 0 220 24" className="absolute -bottom-2 left-0 w-full text-haldi-400" fill="none">
                  <path d="M4 18C60 8 160 6 216 12" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
              ,<br />
              এখন কাগজ নয় — মোবাইলে
            </h1>
            <p className="mt-3 font-serif text-lg font-bold text-leaf-800 sm:text-xl">
              স্মার্ট হোম, স্মার্ট হিসাব
            </p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
              ভাড়া আদায়, বকেয়ার ছক, মেরামত-বিলের খরচ — সবকিছুর গোছানো হিসাব রাখুন এক জায়গায়।
              আপনার ডেটা চিরকাল নিরাপদে সংরক্ষিত থাকবে, <span className="font-semibold text-ink">কখনো মুছে যাবে না।</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 rounded-full bg-leaf-800 px-7 py-3.5 text-lg font-semibold text-cream shadow-lift transition hover:-translate-y-0.5 hover:bg-leaf-900"
              >
                এখনই শুরু করুন
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full border-2 border-leaf-800/25 bg-cream px-6 py-3 text-lg font-semibold text-leaf-900 transition hover:border-leaf-700"
              >
                <Crown className="h-5 w-5 text-haldi-500" />
                প্রিমিয়াম দেখুন
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] font-medium text-ink-soft">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4.5 w-4.5 text-leaf-600" /> ক্রেডিট কার্ড ছাড়াই শুরু</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole className="h-4.5 w-4.5 text-leaf-600" /> ডেটা ১০০% নিরাপদ</span>
              <span className="inline-flex items-center gap-2"><Smartphone className="h-4.5 w-4.5 text-leaf-600" /> মোবাইল-ফ্রেন্ডলি</span>
            </div>
          </div>

          {/* হিরো: CSS ড্যাশবোর্ড মক */}
          <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative rounded-3xl border border-line bg-cream p-6 shadow-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">আমার বিল্ডিং</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold">গ্রিন ভিলা, ধানমন্ডি</h3>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-100 text-leaf-800">
                  <Building2 className="h-5.5 w-5.5" />
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-leaf-900 p-4 text-cream grain-dark">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-cream/70">এই মাসে আদায়</p>
                  <p className="font-serif text-2xl font-bold">৳ ৫৪,৫০০</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-haldi-400 to-haldi-300" />
                </div>
                <p className="mt-2 text-xs text-cream/70">মোট ৳ ৭০,০০০-এর ৭৮% সংগ্রহ সম্পন্ন</p>
              </div>
              <ul className="mt-5 space-y-3">
                {[
                  { flat: "ফ্ল্যাট ৩এ", name: "রহিম উদ্দিন", amt: "৳ ১২,০০০", ok: true },
                  { flat: "ফ্ল্যাট ৩বি", name: "করিম শেখ", amt: "৳ ১০,৫০০", ok: true },
                  { flat: "ফ্ল্যাট ৪এ", name: "সালমা বেগম", amt: "বকেয়া ৳ ১১,০০০", ok: false },
                ].map((r) => (
                  <li key={r.flat} className="flex items-center justify-between rounded-xl border border-line/80 bg-paper px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${r.ok ? "bg-leaf-500" : "bg-haldi-500"}`} />
                      <div>
                        <p className="text-[15px] font-semibold leading-tight">{r.flat}</p>
                        <p className="text-xs text-ink-soft">{r.name}</p>
                      </div>
                    </div>
                    <p className={`text-[15px] font-bold ${r.ok ? "text-leaf-700" : "text-haldi-600"}`}>{r.amt}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute -right-4 -top-6 animate-float-slow rounded-2xl border border-line bg-cream px-4 py-3 shadow-lift sm:-right-8" style={{ "--tilt": "2deg" } as CSSProperties}>
              <p className="text-xs font-semibold text-ink-soft">খরচ যোগ হয়েছে</p>
              <p className="font-serif text-lg font-bold text-ink">বিদ্যুৎ বিল ৳ ৪,৩৫০</p>
            </div>
            <div className="absolute -bottom-7 -left-3 animate-float-med rounded-2xl border border-line bg-leaf-800 px-4 py-3 text-cream shadow-lift sm:-left-8" style={{ "--tilt": "-2deg" } as CSSProperties}>
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4 text-haldi-300" /> ২০১৯ সালের হিসাবও আছে
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= মারকি ================= */}
      <section className="border-y border-leaf-950 bg-leaf-900 py-4 grain-dark">
        <div className="flex overflow-hidden">
          <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-10 pr-10">
            {[...marqueeWords, ...marqueeWords].map((w, i) => (
              <span key={i} className="flex shrink-0 items-center gap-10 font-serif text-lg font-semibold text-cream/85">
                {w} <span className="text-haldi-400">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= খরচের ক্যাটাগরি ================= */}
      <section id="expenses" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-700">খরচের খাতা</p>
          <h2 className="mt-3 font-serif text-4xl font-bold leading-snug sm:text-5xl">
            এক বাসা-বাড়িতে <span className="text-leaf-800">কী কী খরচ</span> হয়?
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            ছোট-বড় সব খরচ ক্যাটাগরি অনুযায়ী লিখে রাখুন। মাস-শেষে বা বছর-শেষে জেনে নিন কোথায়,
            কত খরচ হলো — স্পষ্ট প্রতিবেদনসহ।
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {expenseItems.map((item) => (
            <div
              key={item.label}
              className="group flex items-center gap-3.5 rounded-2xl border border-line bg-cream p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:border-leaf-400 hover:shadow-lift"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tint} transition group-hover:scale-110`}>
                <item.icon className="h-5 w-5" />
              </span>
              <p className="font-semibold leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ফিচার ================= */}
      <section id="features" className="border-y border-line bg-cream paper-grain">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-700">কেন বাসা হিসাব</p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-snug sm:text-5xl">
              খাতার বদলে <span className="text-leaf-800">ডিজিটাল</span>, দুশ্চিন্তার বদলে <span className="text-haldi-500">নিশ্চিন্তি</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.no} className="group relative overflow-hidden rounded-3xl border border-line bg-paper p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="pointer-events-none absolute -right-3 -top-6 font-serif text-[110px] font-black leading-none text-leaf-100 transition group-hover:text-leaf-200/80">
                  {f.no}
                </span>
                <span className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-leaf-800 text-cream shadow-card">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-6 font-serif text-2xl font-bold">{f.title}</h3>
                <p className="relative mt-3 leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= প্রিমিয়াম কীভাবে ================= */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-700">সহজ ৩ ধাপ</p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-snug sm:text-5xl">
              প্রিমিয়াম চালু করুন <span className="text-leaf-800">বিকাশ/নগদে</span>
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                { step: "১", title: "ফ্রি অ্যাকাউন্ট খুলুন", desc: "মোবাইল নম্বর দিয়ে ৩০ সেকেন্ডে সাইন আপ করুন — সাথে সাথে ব্যবহার শুরু।" },
                { step: "২", title: "বিকাশ/নগদে সেন্ড মানি করুন", desc: "নিচের নম্বরে প্যাকেজের টাকা পাঠিয়ে ট্রানজেকশন আইডিটি জমা দিন।" },
                { step: "৩", title: "যাচাই শেষে আনলিমিটেড", desc: "পেমেন্ট যাচাই হয়ে গেলেই আনলিমিটেড বিল্ডিং ও ইউনিটের প্রিমিয়াম চালু।" },
              ].map((s) => (
                <li key={s.step} className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-leaf-700 bg-leaf-50 font-serif text-xl font-bold text-leaf-800">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mt-1.5 text-ink-soft">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl bg-leaf-900 p-8 text-cream shadow-lift grain-dark">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-haldi-300">পেমেন্ট নম্বর</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="font-serif text-4xl font-black tracking-wide sm:text-5xl">০১৮৬৭৯২৪৩৯১</p>
              <Wallet className="h-9 w-9 shrink-0 text-haldi-300" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#e2136e] p-4 text-center">
                <p className="font-serif text-2xl font-black">বিকাশ</p>
                <p className="mt-1 text-xs text-white/80">সেন্ড মানি (পার্সোনাল)</p>
              </div>
              <div className="rounded-2xl bg-[#f6921e] p-4 text-center">
                <p className="font-serif text-2xl font-black text-leaf-950">নগদ</p>
                <p className="mt-1 text-xs text-leaf-950/70">সেন্ড মানি (পার্সোনাল)</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-cream/80">
              <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-haldi-300" /> পেমেন্টের পর TrxID-সহ অ্যাপে জমা দিন — ম্যানুয়াল যাচাইয়ে চালু হয়</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-haldi-300" /> অ্যাকাউন্টের সব হিসাব প্রিমিয়াম-এও একই থাকে, কিছু হারায় না</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= প্রাইসিং ================= */}
      <section id="pricing" className="border-y border-line bg-cream paper-grain">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-700">প্যাকেজ</p>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">সাধের মতো <span className="text-leaf-800">সহজ দাম</span></h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {/* ফ্রি */}
            <div className="rounded-3xl border border-line bg-paper p-8 shadow-card">
              <h3 className="font-serif text-2xl font-bold">ফ্রি</h3>
              <p className="mt-1.5 text-ink-soft">ছোট বাসা মালিকদের শুরু করার জন্য</p>
              <p className="mt-6 font-serif text-5xl font-black">৳ ০<span className="text-lg font-semibold text-ink-soft">/মাস</span></p>
              <ul className="mt-7 space-y-3 text-[15px]">
                {["১টি বিল্ডিং", "প্রতি বিল্ডিংয়ে ৫টি ইউনিট", "মাসিক ভাড়া আদায়ের ছক", "খরচের খাতা ও চিরস্থায়ী আর্কাইভ", "নাম/বিল্ডিং নাম পরিবর্তন"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" /> {t}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block rounded-full border-2 border-leaf-800 px-6 py-3 text-center font-bold text-leaf-900 transition hover:bg-leaf-800 hover:text-cream">
                ফ্রি শুরু করুন
              </Link>
            </div>

            {/* প্রিমিয়াম */}
            <div className="relative overflow-hidden rounded-3xl bg-leaf-900 p-8 text-cream shadow-lift grain-dark">
              <span className="absolute right-6 top-6 rounded-full bg-haldi-400 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-leaf-950">
                জনপ্রিয়
              </span>
              <h3 className="inline-flex items-center gap-2.5 font-serif text-2xl font-bold">
                <Crown className="h-6 w-6 text-haldi-300" /> প্রিমিয়াম
              </h3>
              <p className="mt-1.5 text-cream/70">পেশাদার বাসা মালিক ও হাউজিং ব্যবসার জন্য</p>
              <p className="mt-6 font-serif text-5xl font-black">৳ ২৯৯<span className="text-lg font-semibold text-cream/60">/মাস</span></p>
              <p className="mt-1 text-sm text-cream/60">৬ মাস ৳ ১,৪৯৯ • ১২ মাস ৳ ২,৪৯৯</p>
              <ul className="mt-7 space-y-3 text-[15px]">
                {["আনলিমিটেড বিল্ডিং", "আনলিমিটেড ইউনিট ও ভাড়াটিয়া", "ফ্রি-এর সব সুবিধা", "বিকাশ/নগদে সহজ পেমেন্ট", "অগ্রাধিকার সাপোর্ট"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-haldi-300" /> {t}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 flex items-center justify-center gap-2 rounded-full bg-haldi-400 px-6 py-3 text-center font-black text-leaf-950 transition hover:bg-haldi-300">
                প্রিমিয়াম নিন <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-leaf-800 px-8 py-16 text-center text-cream shadow-lift grain-dark sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-haldi-400/20 blur-3xl" />
          <FileCheck2 className="mx-auto h-12 w-12 text-haldi-300" />
          <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl font-bold leading-snug sm:text-5xl">
            আজ থেকেই রাখুন আপনার বাসার হিসাব গুছিয়ে
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream/75">
            একবারের তথ্যই চিরকালের সম্পদ। খাতা হারানোর যুগ শেষ — শুরু হোক ডিজিটাল হিসাবের যুগ।
          </p>
          <Link
            href="/signup"
            className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-cream px-8 py-4 text-lg font-black text-leaf-900 shadow-lift transition hover:-translate-y-0.5"
          >
            ফ্রি অ্যাকাউন্ট খুলুন <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ================= ফুটার ================= */}
      <footer className="border-t border-line bg-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="বাসা হিসাব" className="h-9 w-9 rounded-xl object-cover" />
              <span className="font-serif text-xl font-bold">বাসা<span className="text-leaf-700">হিসাব</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              বাংলাদেশের বাসা মালিকদের জন্য নির্ভরযোগ্য ডিজিটাল হিসাব খাতা — ভাড়া, বকেয়া ও খরচের চিরস্থায়ী সংরক্ষণ।
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">পেমেন্ট</p>
            <p className="mt-3 font-serif text-2xl font-black">০১৮৬৭৯২৪৩৯১</p>
            <p className="mt-1.5 text-sm text-ink-soft">বিকাশ / নগদ — সেন্ড মানি (পার্সোনাল)</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">দ্রুত লিংক</p>
            <ul className="mt-3 space-y-2 text-[15px] font-medium text-ink-soft">
              <li><Link href="/login" className="hover:text-leaf-800">লগইন</Link></li>
              <li><Link href="/signup" className="hover:text-leaf-800">সাইন আপ</Link></li>
              <li><a href="#pricing" className="hover:text-leaf-800">প্রিমিয়াম প্যাকেজ</a></li>
              <li><a href="mailto:bashahisab@gmail.com" className="hover:text-leaf-800">bashahisab@gmail.com</a></li>
              <li><Link href="/privacy" className="hover:text-leaf-800">প্রাইভেসি পলিসি</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-sm text-ink-soft">
          © ২০২৬ বাসা হিসাব — আপনার হিসাব, আপনার নিয়ন্ত্রণে।
        </div>
      </footer>
    </div>
  );
}
