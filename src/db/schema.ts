import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export const planEnum = pgEnum("plan", ["free", "premium"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bkash", "nagad", "bank"]);
export const paymentStatusEnum = pgEnum("payment_request_status", [
  "pending",
  "approved",
  "rejected",
]);

/* ------------------------------------------------------------------ */
/*  Users & Sessions                                                   */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // "user" | "admin"
  plan: planEnum("plan").notNull().default("free"),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/*  স্টাফ/ম্যানেজার অ্যাক্সেস — একটি অ্যাকাউন্টে একাধিক লগইন              */
/* ------------------------------------------------------------------ */

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memberUserId: uuid("member_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("memberships_unique").on(t.ownerId, t.memberUserId),
    index("memberships_member_idx").on(t.memberUserId),
    index("memberships_owner_idx").on(t.ownerId),
  ],
);

/* ------------------------------------------------------------------ */
/*  Buildings — কোনো হিসাব hard-delete হয় না, শুধু archive হয়          */
/* ------------------------------------------------------------------ */

export const buildings = pgTable(
  "buildings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [index("buildings_user_idx").on(t.userId)],
);

export const units = pgTable(
  "units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buildingId: uuid("building_id")
      .notNull()
      .references(() => buildings.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // যেমন: ফ্ল্যাট ৩এ
    floor: text("floor").notNull().default(""),
    monthlyRent: integer("monthly_rent").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [index("units_building_idx").on(t.buildingId)],
);

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull().default(""),
    nid: text("nid").notNull().default(""),
    advance: integer("advance").notNull().default(0),
    startDate: text("start_date").notNull().default(""), // YYYY-MM-DD
    endDate: text("end_date"), // null = বর্তমান ভাড়াটিয়া
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [index("tenants_unit_idx").on(t.unitId)],
);

/* ------------------------------------------------------------------ */
/*  মাসিক ভাড়া আদায়                                                    */
/* ------------------------------------------------------------------ */

export const rentPayments = pgTable(
  "rent_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    month: text("month").notNull(), // YYYY-MM
    amountDue: integer("amount_due").notNull().default(0),
    amountPaid: integer("amount_paid").notNull().default(0),
    status: text("status").notNull().default("unpaid"), // paid | partial | unpaid
    paidDate: text("paid_date").notNull().default(""), // YYYY-MM-DD
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("rent_unit_month_unique").on(t.unitId, t.month),
    index("rent_payments_month_idx").on(t.month),
  ],
);

/* ------------------------------------------------------------------ */
/*  খরচের খাতা                                                           */
/* ------------------------------------------------------------------ */

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buildingId: uuid("building_id")
      .notNull()
      .references(() => buildings.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    amount: integer("amount").notNull(),
    expenseDate: text("expense_date").notNull(), // YYYY-MM-DD
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("expenses_building_idx").on(t.buildingId),
    index("expenses_date_idx").on(t.expenseDate),
  ],
);

/* ------------------------------------------------------------------ */
/*  প্রিমিয়াম পেমেন্ট রিকোয়েস্ট (বিকাশ/নগদ)                              */
/* ------------------------------------------------------------------ */

export const paymentRequests = pgTable(
  "payment_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    method: paymentMethodEnum("method").notNull(),
    senderNumber: text("sender_number").notNull(),
    transactionId: text("transaction_id").notNull(),
    amount: integer("amount").notNull(),
    months: integer("months").notNull().default(1),
    status: paymentStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [
    index("payment_requests_user_idx").on(t.userId),
    index("payment_requests_status_idx").on(t.status),
  ],
);

/* ------------------------------------------------------------------ */
/*  ইউজারদের ফিডব্যাক/মতামত                                            */
/* ------------------------------------------------------------------ */

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("feedback_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Building = typeof buildings.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type RentPayment = typeof rentPayments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
