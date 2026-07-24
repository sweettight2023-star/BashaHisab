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

/**
 * ভাড়া জমা দেওয়ার নিয়ম:
 * - ভাড়াটিয়া যে মাসে ওঠেন, সেই মাসের ভাড়ার ডেডলাইন হলো সেই মাসের শেষ দিন।
 * - পরবর্তী প্রতি মাসের ভাড়া ওই মাসের ১-১০ তারিখের মধ্যে দিতে হবে (ডেডলাইন: ১০ তারিখ)।
 */
export function rentDueDate(month: string, tenantStartDate: string): Date | null {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return null;
  const startMonth = tenantStartDate ? tenantStartDate.slice(0, 7) : "";

  if (tenantStartDate && startMonth === month) {
    return new Date(y, m, 0); // ওঠার মাসের শেষ দিন (day 0 of next month = last day of this month)
  }
  return new Date(y, m - 1, 10); // অন্য মাসগুলোর জন্য ওই মাসের ১০ তারিখ
}

/** ডেডলাইন পার হয়ে গেছে কিনা (আজকের তারিখ অনুযায়ী) */
export function isPastDue(month: string, tenantStartDate: string): boolean {
  const due = rentDueDate(month, tenantStartDate);
  if (!due) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return now > due;
}

/** মাসের ১ তারিখ পার হয়ে গেলে বকেয়া থাকা ভাড়াটিয়াকে রিমাইন্ডার পাঠানোর সময় হয়েছে কিনা */
export function isReminderTime(month: string, tenantStartDate: string): boolean {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return false;
  const startMonth = tenantStartDate ? tenantStartDate.slice(0, 7) : "";
  if (tenantStartDate && startMonth === month) return false; // ওঠার মাসেই, ডেডলাইন তো মাস শেষেই

  const reminderFrom = new Date(y, m - 1, 1);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  reminderFrom.setHours(0, 0, 0, 0);
  return now >= reminderFrom;
}
