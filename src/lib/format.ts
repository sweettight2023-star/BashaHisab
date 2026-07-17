/* বাংলা সংখ্যা ও হিসাব ফরম্যাট হেল্পার */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর */
export function bn(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** হাজারে কমা-সহ বাংলা সংখ্যা */
export function bnNum(n: number): string {
  return bn(n.toLocaleString("en-IN"));
}

/** টাকা ফরম্যাট: ৳ ১২,৫০০ */
export function taka(n: number): string {
  return `৳ ${bnNum(n)}`;
}

export const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/** "2025-01" -> "জানুয়ারি ২০২৫" */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return month;
  return `${BN_MONTHS[m - 1]} ${bn(y)}`;
}

/** "2025-01-15" -> "১৫ জানুয়ারি ২০২৫" */
export function dateLabel(date: string): string {
  if (!date) return "—";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return `${bn(d)} ${BN_MONTHS[m - 1]} ${bn(y)}`;
}

/** বর্তমান মাস "YYYY-MM" */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** আজকের তারিখ "YYYY-MM-DD" */
export function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export const EXPENSE_CATEGORIES = [
  { key: "electricity", label: "বিদ্যুৎ বিল" },
  { key: "water", label: "পানি বিল" },
  { key: "gas", label: "গ্যাস বিল" },
  { key: "repair", label: "মেরামত ও রক্ষণাবেক্ষণ" },
  { key: "staff", label: "কর্মচারী বেতন" },
  { key: "security", label: "সিকিউরিটি/প্রহরী" },
  { key: "lift", label: "লিফট রক্ষণাবেক্ষণ" },
  { key: "tax", label: "পৌর কর/ট্যাক্স" },
  { key: "internet", label: "ইন্টারনেট/ডিশ" },
  { key: "cleaning", label: "পরিষ্কার-পরিচ্ছন্নতা" },
  { key: "other", label: "অন্যান্য" },
] as const;

export function expenseCategoryLabel(key: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
