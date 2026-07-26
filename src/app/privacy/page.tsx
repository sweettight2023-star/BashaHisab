import Link from "next/link";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "প্রাইভেসি পলিসি — বাসা হিসাব",
  description: "বাসা হিসাব অ্যাপের প্রাইভেসি পলিসি — আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয়।",
};

const sections = [
  {
    title: "১. আমরা কী তথ্য সংগ্রহ করি",
    body: [
      "অ্যাকাউন্ট তথ্য: আপনার নাম, মোবাইল নম্বর এবং পাসওয়ার্ড (এনক্রিপ্ট করা অবস্থায় সংরক্ষিত, কেউ আসল পাসওয়ার্ড দেখতে পারে না)।",
      "আপনার এন্ট্রি করা তথ্য: বিল্ডিং, ইউনিট, ভাড়াটিয়ার নাম/ফোন/এনআইডি/জামানত, ভাড়া জমা ও খরচের হিসাব।",
      "প্রিমিয়াম পেমেন্ট যাচাইয়ের তথ্য: আপনি যে নম্বর/অ্যাকাউন্ট থেকে বিকাশ, নগদ বা ব্যাংকে টাকা পাঠিয়েছেন এবং ট্রানজেকশন আইডি — শুধুমাত্র পেমেন্ট যাচাইয়ের উদ্দেশ্যে।",
    ],
  },
  {
    title: "২. তথ্য কীভাবে ব্যবহার করা হয়",
    body: [
      "আপনার হিসাব-নিকাশ সংরক্ষণ ও প্রদর্শনের জন্য।",
      "প্রিমিয়াম সাবস্ক্রিপশন পেমেন্ট যাচাই ও সক্রিয় করার জন্য।",
      "আপনি নিজে ব্যবহার করেন এমন ফিচার চালুর জন্য — যেমন ভাড়াটিয়াকে হোয়াটসঅ্যাপ/SMS রিমাইন্ডার পাঠানো (এই ক্ষেত্রে বার্তাটি সরাসরি আপনার ফোন থেকে পাঠানো হয়, আমরা কোনো বার্তা নিজে থেকে পাঠাই না)।",
    ],
  },
  {
    title: "৩. তথ্য কোথায় সংরক্ষিত থাকে",
    body: [
      "সব তথ্য ক্লাউড ডাটাবেজে (Neon/PostgreSQL) এনক্রিপ্টেড সংযোগের মাধ্যমে সংরক্ষিত হয়।",
      "অ্যাপটি Vercel প্ল্যাটফর্মে হোস্ট করা, যা HTTPS-এর মাধ্যমে ডেটা আদান-প্রদান নিরাপদ রাখে।",
    ],
  },
  {
    title: "৪. তথ্য কারো সাথে শেয়ার করা হয় কি",
    body: [
      "আপনার তথ্য বিক্রি বা তৃতীয় পক্ষের কাছে বিজ্ঞাপনের জন্য শেয়ার করা হয় না।",
      "শুধু প্রিমিয়াম পেমেন্ট যাচাইয়ের জন্য অ্যাপের অ্যাডমিন আপনার পাঠানো ট্রানজেকশন তথ্য দেখতে পারেন।",
      "যদি আপনি \"মেম্বার/স্টাফ\" হিসেবে কোনো বাড়ির মালিকের অ্যাকাউন্টে যুক্ত থাকেন, তাহলে সেই মালিক তার বিল্ডিংয়ের হিসাব দেখতে পারবেন।",
    ],
  },
  {
    title: "৫. তথ্য মুছে ফেলা ও নিয়ন্ত্রণ",
    body: [
      "আপনি যেকোনো সময় ইমেইল করে আপনার অ্যাকাউন্ট ও সব তথ্য স্থায়ীভাবে মুছে ফেলার অনুরোধ করতে পারেন।",
      "খরচ ও ভাড়ার এন্ট্রি নিজে থেকেই এডিট বা ডিলিট করার সুবিধা অ্যাপের ভেতরেই আছে (শুধু বাড়ির মালিকের জন্য)।",
    ],
  },
  {
    title: "৬. শিশুদের গোপনীয়তা",
    body: [
      "এই অ্যাপটি বাড়ি/সম্পত্তি ব্যবস্থাপনার জন্য প্রাপ্তবয়স্কদের উদ্দেশ্যে তৈরি। ১৮ বছরের কমবয়সীদের কাছ থেকে সচেতনভাবে কোনো তথ্য সংগ্রহ করা হয় না।",
    ],
  },
  {
    title: "৭. এই পলিসিতে পরিবর্তন",
    body: [
      "প্রয়োজনে এই প্রাইভেসি পলিসি হালনাগাদ করা হতে পারে। বড় কোনো পরিবর্তন হলে এই পেজেই জানিয়ে দেওয়া হবে।",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-leaf-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> হোমপেজে ফিরুন
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-800 text-cream">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-bold">প্রাইভেসি পলিসি</h1>
            <p className="text-sm text-ink-soft">বাসা হিসাব — সর্বশেষ হালনাগাদ: জুলাই ২০২৬</p>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-ink-soft">
          &ldquo;বাসা হিসাব&rdquo; (এই ওয়েবসাইট/অ্যাপ) ব্যবহারকারীদের গোপনীয়তা রক্ষা করাকে গুরুত্বের সাথে বিবেচনা করে।
          এই পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কী তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি।
          অ্যাপটি ব্যবহারের মাধ্যমে আপনি এই পলিসিতে সম্মত হচ্ছেন।
        </p>

        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-xl font-bold text-leaf-900">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.body.map((line, i) => (
                  <li key={i} className="flex gap-2.5 leading-relaxed text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-line bg-cream p-6 text-center shadow-card">
          <h2 className="flex items-center justify-center gap-2 font-serif text-lg font-bold">
            <Mail className="h-5 w-5 text-leaf-700" /> প্রশ্ন বা অনুরোধ?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            প্রাইভেসি সংক্রান্ত যেকোনো প্রশ্ন বা তথ্য মুছে ফেলার অনুরোধের জন্য ইমেইল করুন —
          </p>
          <a
            href="mailto:bashahisab@gmail.com"
            className="mt-1 inline-block font-bold text-leaf-800 underline underline-offset-2"
          >
            bashahisab@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
