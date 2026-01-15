import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  verificationCode: uuid("verification_code").defaultRandom().notNull(),
  passwordResetCode: varchar("password_reset_code", { length: 255 }),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  valid: boolean("valid").default(true).notNull(),

  ip: varchar("ip", { length: 45 }).notNull(),

  userAgent: varchar("user_agent", { length: 255 }).notNull(),

  deviceName: varchar("device_name", { length: 255 }),

  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
