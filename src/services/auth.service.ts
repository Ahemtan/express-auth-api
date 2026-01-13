import { Response } from "express";
import { omit } from "lodash";
import { eq } from "drizzle-orm";

import { signJwt } from "../utils/jwt";
import { db } from "../db";
import { users, sessions } from "../db/schema";

type User = typeof users.$inferSelect;

const privateVal = [
  "password",
  "verificationCode",
  "passwordResetCode",
] as const;

export async function createSession({
  userId,
  ip,
  userAgent,
}: {
  userId: string;
  ip: string;
  userAgent: string;
}) {
  const [session] = await db
    .insert(sessions)
    .values({ userId, ip, userAgent })
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
  data: { sessionId: string } // ✅ Use sessionId instead of userId
) {
  const refreshToken = signJwt(
    { session: data.sessionId }, // store session id in payload
    "refreshTokenPrivateKey",
    { expiresIn: "30d" }
  );

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

  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
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
