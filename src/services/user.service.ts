import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { users } from "../db/schema";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

type CreateUserInput = Pick<User, "email" | "name" | "password">;

export async function createUser(input: CreateUserInput) {
  if (!input.email || !input.name || !input.password) {
    throw new Error("Missing required fields");
  }

  const hashedPassword = await argon2.hash(input.password);

  const usersData: NewUser = {
    email: input.email,
    name: input.name,
    password: hashedPassword,
  };
  const [user] = await db.insert(users).values(usersData).returning();

  return user;
}

export async function findUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function findUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function verifyUser(userId: string) {
  await db.update(users).set({ verified: true }).where(eq(users.id, userId));
}

export async function setPasswordResetCode(userId: string, code: string) {
  await db
    .update(users)
    .set({ passwordResetCode: code })
    .where(eq(users.id, userId));
}

export async function resetUserPassword(
  userId: string,
  hashedPassword: string
) {
  await db
    .update(users)
    .set({
      password: hashedPassword,
      passwordResetCode: null,
    })
    .where(eq(users.id, userId));
}
