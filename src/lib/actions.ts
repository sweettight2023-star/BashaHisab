"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  buildings,
  expenses,
  feedback,
  memberships,
  paymentRequests,
  rentPayments,
  tenants,
  units,
  users,
} from "@/db/schema";
import {
  ADMIN_PHONE,
  FREE_LIMITS,
  PREMIUM_PRICING,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  isAdmin,
  isPremiumActive,
  validPhone,
  verifyPassword,
} from "@/lib/auth";
import { currentMonth, today } from "@/lib/format";

export type ActionState = { error?: string; success?: string } | null;

const str = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string) =>
  Math.max(0, Math.round(Number(fd.get(key) ?? 0) || 0));

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/* --------- মাল্টি-ইউজার অ্যাক্সেস: মালিক অথবা স্টাফ --------- */

async function isMember(memberUserId: string, ownerId: string) {
  const rows = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.ownerId, ownerId),
        eq(memberships.memberUserId, memberUserId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function hasBuildingAccess(userId: string, ownerId: string) {
  return userId === ownerId || (await isMember(userId, ownerId));
}

async function accessibleBuilding(userId: string, buildingId: string) {
  const rows = await db
    .select()
    .from(buildings)
    .where(eq(buildings.id, buildingId))
    .limit(1);
  const building = rows[0];
  if (!building) return null;
  const isOwner = building.userId === userId;
  if (isOwner) return { building, isOwner: true };
  if (await isMember(userId, building.userId))
    return { building, isOwner: false };
  return null;
}

async function accessibleUnit(userId: string, unitId: string) {
  const rows = await db
    .select({ unit: units, building: buildings })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(units.id, unitId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const isOwner = row.building.userId === userId;
  if (isOwner) return { ...row, isOwner: true };
  if (await isMember(userId, row.building.userId))
    return { ...row, isOwner: false };
  return null;
}

async function ownerUser(ownerId: string) {
  const rows = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
  return rows[0] ?? null;
}

/* ================================================================== */
/*  অথেন্টিকেশন                                                          */
/* ================================================================== */

export async function signup(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (name.length < 2) return { error: "আপনার নাম লিখুন" };
  if (!validPhone(phone))
    return { error: "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)" };
  if (password.length < 6)
    return { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" };
  if (password !== confirm)
    return { error: "দুই পাসওয়ার্ড মিলছে না" };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  if (existing.length > 0)
    return { error: "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।" };

  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    name,
    phone,
    passwordHash: hashPassword(password),
    role: phone === ADMIN_PHONE ? "admin" : "user",
  });
  await createSession(id);
  redirect("/dashboard");
}

export async function login(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const phone = str(fd, "phone");
  const password = String(fd.get("password") ?? "");

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash))
    return { error: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে" };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/* ================================================================== */
/*  বিল্ডিং                                                            */
/* ================================================================== */

export async function createBuilding(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name");
  const address = str(fd, "address");
  if (name.length < 2) return { error: "বিল্ডিংয়ের নাম লিখুন" };

  if (!isPremiumActive(user)) {
    const existing = await db
      .select({ id: buildings.id })
      .from(buildings)
      .where(and(eq(buildings.userId, user.id), isNull(buildings.archivedAt)));
    if (existing.length >= FREE_LIMITS.buildings)
      return {
        error: `ফ্রি প্ল্যানে ${FREE_LIMITS.buildings}টি বিল্ডিং যোগ করা যায়। আনলিমিটেডের জন্য প্রিমিয়াম নিন।`,
      };
  }

  const id = crypto.randomUUID();
  await db.insert(buildings).values({
    id,
    userId: user.id,
    name,
    address,
    notes: str(fd, "notes"),
  });
  revalidatePath("/dashboard");
  redirect(`/dashboard/buildings/${id}`);
}

export async function updateBuilding(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");
  const access = await accessibleBuilding(user.id, id);
  if (!access) return { error: "বিল্ডিং পাওয়া যায়নি" };

  const name = str(fd, "name");
  if (name.length < 2) return { error: "বিল্ডিংয়ের নাম লিখুন" };

  await db
    .update(buildings)
    .set({ name, address: str(fd, "address"), notes: str(fd, "notes") })
    .where(eq(buildings.id, id));
  revalidatePath(`/dashboard/buildings/${id}`);
  revalidatePath("/dashboard/buildings");
  revalidatePath("/dashboard");
  return { success: "বিল্ডিংয়ের তথ্য হালনাগাদ হয়েছে" };
}

export async function archiveBuilding(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  const access = await accessibleBuilding(user.id, id);
  if (!access?.isOwner) redirect("/dashboard/buildings");
  await db
    .update(buildings)
    .set({ archivedAt: new Date() })
    .where(eq(buildings.id, id));
  revalidatePath("/dashboard");
  redirect("/dashboard/buildings");
}

export async function restoreBuilding(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  const access = await accessibleBuilding(user.id, id);
  if (!access?.isOwner) return;
  await db
    .update(buildings)
    .set({ archivedAt: null })
    .where(eq(buildings.id, id));
  revalidatePath("/dashboard/buildings");
  revalidatePath("/dashboard");
}

/* ================================================================== */
/*  ইউনিট (ফ্ল্যাট/কক্ষ) ও ভাড়াটিয়া                                     */
/* ================================================================== */

export async function createUnit(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const buildingId = str(fd, "buildingId");
  const access = await accessibleBuilding(user.id, buildingId);
  if (!access) return { error: "বিল্ডিং পাওয়া যায়নি" };

  const name = str(fd, "name");
  if (name.length < 1) return { error: "ইউনিটের নাম লিখুন (যেমন: ফ্ল্যাট ৩এ)" };

  /* লিমিট প্রযোজ্য হয় বিল্ডিং-মালিকের প্ল্যান অনুযায়ী */
  const owner = await ownerUser(access.building.userId);
  if (!isPremiumActive(owner)) {
    const existing = await db
      .select({ id: units.id })
      .from(units)
      .where(and(eq(units.buildingId, buildingId), isNull(units.archivedAt)));
    if (existing.length >= FREE_LIMITS.unitsPerBuilding)
      return {
        error: `ফ্রি প্ল্যানে প্রতি বিল্ডিংয়ে ${FREE_LIMITS.unitsPerBuilding}টি ইউনিট। প্রিমিয়ামে আনলিমিটেড।`,
      };
  }

  await db.insert(units).values({
    id: crypto.randomUUID(),
    buildingId,
    name,
    floor: str(fd, "floor"),
    monthlyRent: num(fd, "monthlyRent"),
  });
  revalidatePath(`/dashboard/buildings/${buildingId}`);
  return { success: "নতুন ইউনিট যোগ হয়েছে" };
}

export async function updateUnit(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");
  const access = await accessibleUnit(user.id, id);
  if (!access) return { error: "ইউনিট পাওয়া যায়নি" };

  const name = str(fd, "name");
  if (name.length < 1) return { error: "ইউনিটের নাম লিখুন" };

  await db
    .update(units)
    .set({ name, floor: str(fd, "floor"), monthlyRent: num(fd, "monthlyRent") })
    .where(eq(units.id, id));
  revalidatePath(`/dashboard/buildings/${access.unit.buildingId}`);
  return { success: "ইউনিটের তথ্য হালনাগাদ হয়েছে" };
}

export async function archiveUnit(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  const access = await accessibleUnit(user.id, id);
  if (!access) return;
  await db
    .update(units)
    .set({ archivedAt: new Date() })
    .where(eq(units.id, id));
  revalidatePath(`/dashboard/buildings/${access.unit.buildingId}`);
}

export async function addTenant(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const unitId = str(fd, "unitId");
  const access = await accessibleUnit(user.id, unitId);
  if (!access) return { error: "ইউনিট পাওয়া যায়নি" };

  const name = str(fd, "name");
  if (name.length < 2) return { error: "ভাড়াটিয়ার নাম লিখুন" };

  const startDate = str(fd, "startDate") || today();

  /* আগের সক্রিয় ভাড়াটিয়ার মেয়াদ শেষ করে দেই — হিসাব মুছে নয়, সংরক্ষণ */
  await db
    .update(tenants)
    .set({ endDate: startDate })
    .where(and(eq(tenants.unitId, unitId), isNull(tenants.endDate)));

  await db.insert(tenants).values({
    id: crypto.randomUUID(),
    unitId,
    name,
    phone: str(fd, "phone"),
    nid: str(fd, "nid"),
    advance: num(fd, "advance"),
    startDate,
  });
  revalidatePath(`/dashboard/buildings/${access.unit.buildingId}`);
  return { success: "নতুন ভাড়াটিয়া যোগ হয়েছে" };
}

export async function updateTenant(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");

  const rows = await db
    .select({ tenant: tenants, building: buildings })
    .from(tenants)
    .innerJoin(units, eq(tenants.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(tenants.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return { error: "ভাড়াটিয়া পাওয়া যায়নি" };
  if (!(await hasBuildingAccess(user.id, row.building.userId)))
    return { error: "অনুমতি নেই" };

  const name = str(fd, "name");
  if (name.length < 2) return { error: "ভাড়াটিয়ার নাম লিখুন" };

  await db
    .update(tenants)
    .set({
      name,
      phone: str(fd, "phone"),
      nid: str(fd, "nid"),
      advance: num(fd, "advance"),
    })
    .where(eq(tenants.id, id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
  return { success: "ভাড়াটিয়ার তথ্য হালনাগাদ হয়েছে" };
}

export async function endTenant(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "tenantId");
  const rows = await db
    .select({ tenant: tenants, building: buildings })
    .from(tenants)
    .innerJoin(units, eq(tenants.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(tenants.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return;
  if (!(await hasBuildingAccess(user.id, row.building.userId))) return;
  await db
    .update(tenants)
    .set({ endDate: today() })
    .where(eq(tenants.id, id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
}

/* ================================================================== */
/*  মাসিক ভাড়া আদায়                                                    */
/* ================================================================== */

export async function saveRentPayment(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const unitId = str(fd, "unitId");
  const access = await accessibleUnit(user.id, unitId);
  if (!access) return { error: "ইউনিট পাওয়া যায়নি" };

  const month = str(fd, "month") || currentMonth();
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "মাস সঠিক নয়" };

  const amountDue = num(fd, "amountDue");
  const amountPaid = Math.min(num(fd, "amountPaid"), 10_000_000);
  const paidDate = str(fd, "paidDate") || today();
  const notes = str(fd, "notes");

  const status =
    amountPaid >= amountDue && amountDue > 0
      ? "paid"
      : amountPaid > 0
        ? "partial"
        : "unpaid";

  const existing = await db
    .select({ id: rentPayments.id })
    .from(rentPayments)
    .where(and(eq(rentPayments.unitId, unitId), eq(rentPayments.month, month)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(rentPayments)
      .set({ amountDue, amountPaid, status, paidDate, notes })
      .where(eq(rentPayments.id, existing[0].id));
  } else {
    const activeTenant = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.unitId, unitId), isNull(tenants.endDate)))
      .limit(1);
    await db.insert(rentPayments).values({
      id: crypto.randomUUID(),
      unitId,
      tenantId: activeTenant[0]?.id ?? null,
      month,
      amountDue,
      amountPaid,
      status,
      paidDate,
      notes,
    });
  }

  revalidatePath(`/dashboard/buildings/${access.unit.buildingId}`);
  revalidatePath("/dashboard");
  return {
    success:
      status === "paid"
        ? "ভাড়া সম্পূর্ণ পরিশোধিত হয়েছে"
        : status === "partial"
          ? "আংশিক জমা সংরক্ষিত হয়েছে"
          : "হিসাব সংরক্ষিত হয়েছে",
  };
}

/* ================================================================== */
/*  খরচের খাতা                                                           */
/* ================================================================== */

export async function addExpense(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const buildingId = str(fd, "buildingId");
  const access = await accessibleBuilding(user.id, buildingId);
  if (!access) return { error: "বিল্ডিং পাওয়া যায়নি" };

  const amount = num(fd, "amount");
  const category = str(fd, "category") || "other";
  const expenseDate = str(fd, "expenseDate") || today();
  if (amount < 1) return { error: "খরচের পরিমাণ লিখুন" };

  await db.insert(expenses).values({
    id: crypto.randomUUID(),
    buildingId,
    category,
    amount,
    expenseDate,
    description: str(fd, "description"),
  });
  revalidatePath(`/dashboard/buildings/${buildingId}`);
  revalidatePath("/dashboard");
  return { success: "খরচ সংরক্ষিত হয়েছে" };
}

async function expenseAccess(userId: string, expenseId: string) {
  const rows = await db
    .select({ expense: expenses, building: buildings })
    .from(expenses)
    .innerJoin(buildings, eq(expenses.buildingId, buildings.id))
    .where(eq(expenses.id, expenseId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!(await hasBuildingAccess(userId, row.building.userId))) return null;
  return row;
}

export async function archiveExpense(fd: FormData) {
  const user = await requireUser();
  const row = await expenseAccess(user.id, str(fd, "id"));
  if (!row) return;
  await db
    .update(expenses)
    .set({ archivedAt: new Date() })
    .where(eq(expenses.id, row.expense.id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
  revalidatePath("/dashboard");
}

export async function restoreExpense(fd: FormData) {
  const user = await requireUser();
  const row = await expenseAccess(user.id, str(fd, "id"));
  if (!row) return;
  await db
    .update(expenses)
    .set({ archivedAt: null })
    .where(eq(expenses.id, row.expense.id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
}

export async function updateExpense(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const row = await expenseAccess(user.id, str(fd, "id"));
  if (!row) return { error: "খরচের এন্ট্রি পাওয়া যায়নি" };
  if (row.building.userId !== user.id)
    return { error: "শুধু বাড়ির মালিকই খরচের তথ্য পরিবর্তন করতে পারবেন" };

  const amount = num(fd, "amount");
  if (amount < 1) return { error: "খরচের পরিমাণ লিখুন" };

  await db
    .update(expenses)
    .set({
      amount,
      category: str(fd, "category") || "other",
      expenseDate: str(fd, "expenseDate") || today(),
      description: str(fd, "description"),
    })
    .where(eq(expenses.id, row.expense.id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
  return { success: "খরচের তথ্য হালনাগাদ হয়েছে" };
}

export async function deleteExpense(fd: FormData) {
  const user = await requireUser();
  const row = await expenseAccess(user.id, str(fd, "id"));
  if (!row) return;
  if (row.building.userId !== user.id) return; // শুধু মালিক ডিলিট করতে পারবেন
  await db.delete(expenses).where(eq(expenses.id, row.expense.id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
}

/* ------------------------- ভাড়া জমার এন্ট্রি ডিলিট (ভুল ইউনিটে জমা সংশোধনের জন্য) ------------------------- */

export async function deleteRentPayment(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  const rows = await db
    .select({ payment: rentPayments, building: buildings })
    .from(rentPayments)
    .innerJoin(units, eq(rentPayments.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(rentPayments.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return;
  if (row.building.userId !== user.id) return; // শুধু মালিক ডিলিট করতে পারবেন
  await db.delete(rentPayments).where(eq(rentPayments.id, id));
  revalidatePath(`/dashboard/buildings/${row.building.id}`);
  revalidatePath("/dashboard");
}

/* ================================================================== */
/*  স্টাফ/ম্যানেজার অ্যাক্সেস (একাধিক লগইন)                                */
/* ================================================================== */

export async function addMember(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!isPremiumActive(user))
    return {
      error: "স্টাফ অ্যাক্সেস একটি প্রিমিয়াম ফিচার — আগে প্রিমিয়াম চালু করুন।",
    };

  const phone = str(fd, "phone");
  if (!validPhone(phone))
    return { error: "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)" };
  if (phone === user.phone)
    return { error: "নিজের নম্বরটি যোগ করা যাবে না" };

  const target = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  const member = target[0];
  if (!member)
    return {
      error:
        "এই নম্বরে কোনো অ্যাকাউন্ট নেই। আগে আপনার স্টাফকে বাসা হিসাবে সাইন আপ করতে বলুন।",
    };

  const dup = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(eq(memberships.ownerId, user.id), eq(memberships.memberUserId, member.id)),
    )
    .limit(1);
  if (dup.length > 0) return { error: "তিনি ইতিমধ্যে আপনার স্টাফ তালিকায় আছেন" };

  await db.insert(memberships).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    memberUserId: member.id,
  });
  revalidatePath("/dashboard/settings");
  return { success: `${member.name} এখন আপনার বিল্ডিংয়ের হিসাব লিখতে পারবেন।` };
}

export async function removeMember(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  await db
    .delete(memberships)
    .where(and(eq(memberships.id, id), eq(memberships.ownerId, user.id)));
  revalidatePath("/dashboard/settings");
}

/* ================================================================== */
/*  সেটিংস                                                              */
/* ================================================================== */

export async function updateName(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name");
  if (name.length < 2) return { error: "নাম লিখুন" };
  await db.update(users).set({ name }).where(eq(users.id, user.id));
  revalidatePath("/dashboard", "layout");
  return { success: "আপনার নাম হালনাগাদ হয়েছে" };
}

export async function changePassword(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (!verifyPassword(current, user.passwordHash))
    return { error: "বর্তমান পাসওয়ার্ড ভুল" };
  if (next.length < 6)
    return { error: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" };
  if (next !== confirm) return { error: "নতুন পাসওয়ার্ড দুইটি মিলছে না" };

  await db
    .update(users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(users.id, user.id));
  return { success: "পাসওয়ার্ড পরিবর্তন হয়েছে" };
}

/* ================================================================== */
/*  প্রিমিয়াম (বিকাশ/নগদ)                                                */
/* ================================================================== */

export async function submitPayment(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const method = str(fd, "method");
  if (method !== "bkash" && method !== "nagad" && method !== "bank")
    return { error: "পেমেন্ট মাধ্যম নির্বাচন করুন" };

  const senderNumber = str(fd, "senderNumber");
  if (method === "bank") {
    if (senderNumber.length < 3) return { error: "যে অ্যাকাউন্ট থেকে পাঠিয়েছেন তার তথ্য দিন" };
  } else if (!validPhone(senderNumber)) {
    return { error: "যে নম্বর থেকে পাঠিয়েছেন, সঠিক ১১ সংখ্যার নম্বর দিন" };
  }

  const transactionId = str(fd, "transactionId");
  if (transactionId.length < 6)
    return { error: "সঠিক ট্রানজেকশন আইডি (TrxID) দিন" };

  const months = Number(fd.get("months") ?? 1);
  const amount = PREMIUM_PRICING[months];
  if (!amount) return { error: "প্যাকেজ নির্বাচন করুন" };

  /* ডুপ্লিকেট TrxID বাঁধা */
  const dup = await db
    .select({ id: paymentRequests.id })
    .from(paymentRequests)
    .where(eq(paymentRequests.transactionId, transactionId))
    .limit(1);
  if (dup.length > 0)
    return { error: "এই ট্রানজেকশন আইডি দিয়ে ইতিমধ্যে আবেদন করা হয়েছে" };

  await db.insert(paymentRequests).values({
    id: crypto.randomUUID(),
    userId: user.id,
    method,
    senderNumber,
    transactionId,
    amount,
    months,
  });
  revalidatePath("/dashboard/premium");
  return { success: "আপনার পেমেন্ট আবেদন জমা হয়েছে। যাচাই শেষে প্রিমিয়াম চালু হবে।" };
}

export async function approvePayment(fd: FormData) {
  const user = await requireUser();
  if (!isAdmin(user)) return;
  const id = str(fd, "id");

  const rows = await db
    .select()
    .from(paymentRequests)
    .where(and(eq(paymentRequests.id, id), eq(paymentRequests.status, "pending")))
    .limit(1);
  const request = rows[0];
  if (!request) return;

  const target = await db
    .select()
    .from(users)
    .where(eq(users.id, request.userId))
    .limit(1);
  const targetUser = target[0];
  if (!targetUser) return;

  const base =
    targetUser.premiumUntil && new Date(targetUser.premiumUntil) > new Date()
      ? new Date(targetUser.premiumUntil)
      : new Date();
  const until = new Date(base);
  until.setMonth(until.getMonth() + request.months);

  await db
    .update(users)
    .set({ plan: "premium", premiumUntil: until })
    .where(eq(users.id, targetUser.id));
  await db
    .update(paymentRequests)
    .set({ status: "approved", resolvedAt: new Date() })
    .where(eq(paymentRequests.id, id));
  revalidatePath("/admin");
}

export async function rejectPayment(fd: FormData) {
  const user = await requireUser();
  if (!isAdmin(user)) return;
  const id = str(fd, "id");
  await db
    .update(paymentRequests)
    .set({ status: "rejected", resolvedAt: new Date() })
    .where(and(eq(paymentRequests.id, id), eq(paymentRequests.status, "pending")));
  revalidatePath("/admin");
}

/* ------------------------- ফিডব্যাক/মতামত ------------------------- */

export async function submitFeedback(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const message = str(fd, "message").trim();
  if (message.length < 3) return { error: "মতামতটি লিখুন" };
  if (message.length > 2000) return { error: "মতামতটি একটু ছোট করে লিখুন" };

  await db.insert(feedback).values({ userId: user.id, message });
  revalidatePath("/admin");
  return { success: "ধন্যবাদ! আপনার মতামত পৌঁছে গেছে।" };
}
