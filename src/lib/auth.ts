import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";

export const SESSION_COOKIE = "basha_session";
export const ADMIN_PHONE = "01867924391";
const SESSION_DAYS = 30;

/* ---------------- পাসওয়ার্ড হ্যাশ (scrypt) ---------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const real = Buffer.from(hash, "hex");
  return test.length === real.length && timingSafeEqual(test, real);
}

export function validPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone.trim());
}

/* ---------------- সেশন ---------------- */

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    store.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export function isPremiumActive(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.plan !== "premium" || !user.premiumUntil) return false;
  return new Date(user.premiumUntil) > new Date();
}

export function isAdmin(user: User | null): boolean {
  return !!user && user.role === "admin";
}

/* ---------------- ফ্রি টিয়ার লিমিট ---------------- */

export const FREE_LIMITS = {
  buildings: 1,
  unitsPerBuilding: 5,
};

export const PREMIUM_PRICING: Record<number, number> = {
  1: 299,
  6: 1499,
  12: 2499,
};
