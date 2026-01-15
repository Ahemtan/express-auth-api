import { Response } from "express";
import { omit } from "lodash";
import { and, eq } from "drizzle-orm";

import { signJwt } from "../utils/jwt";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import { getDeviceName } from "../utils/device";

type User = typeof users.$inferSelect;

const privateVal = [
  "password",
  "verificationCode",
  "passwordResetCode",
] as const;

const SESSION_TTL_DAYS = 30;

export async function createSession({
  userId,
  ip,
  userAgent,
}: {
  userId: string;
  ip: string;
  userAgent: string;
}) {
  const deviceName = getDeviceName(userAgent);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      ip,
      userAgent,
      deviceName,
      expiresAt,
    })
    .returning();

  return session;
}

export async function findSessionById({ id }: { id: string }) {
  return await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
}

export async function signRefreshToken(
  res: Response,
  data: { sessionId: string }
) {
  const refreshToken = signJwt({ session: data.sessionId }, "refresh", {
    expiresIn: "30d",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return refreshToken;
}

export function signAccessToken(user: User, res: Response) {
  const payload = omit(user, privateVal);

  const accessToken = signJwt(payload, "access", {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60000,
  });

  return accessToken;
}

export async function logout(sessionId: string) {
  return await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateSession(sessionId: string) {
  await db
    .update(sessions)
    .set({ valid: false })
    .where(eq(sessions.id, sessionId));
}

export async function invalidateAllUserSessions(userId: string) {
  await db
    .update(sessions)
    .set({ valid: false })
    .where(eq(sessions.userId, userId));
}

export async function updateSessionLastActive(sessionId: string) {
  await db
    .update(sessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function findUserSessions(userId: string) {
  return db
    .select({
      id: sessions.id,
      deviceName: sessions.deviceName,
      ip: sessions.ip,
      lastActiveAt: sessions.lastActiveAt,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.valid, true)));
}
