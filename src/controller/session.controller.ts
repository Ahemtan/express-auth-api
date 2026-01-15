import { Request, Response } from "express";
import argon from "argon2";

import { CreateSessionInput } from "../schema/auth.schema";
import {
  createSession,
  findSessionById,
  invalidateSession,
  invalidateAllUserSessions,
  signAccessToken,
  signRefreshToken,
  findUserSessions,
} from "../services/auth.service";
import { findUserByEmail, findUserById } from "../services/user.service";
import { verifyJwt } from "../utils/jwt";
import { generateCsrfToken } from "../utils/csrf";

function sanitizeUser(user: any) {
  const { password, verificationCode, passwordResetCode, ...safeUser } = user;
  return safeUser;
}

async function validatePassword(password: string, hash: string) {
  try {
    return await argon.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * POST /api/sessions
 * Login
 */
export async function createSessionController(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const { email, password } = req.body;
  const INVALID = "Invalid email or password";

  const user = await findUserByEmail(email);
  if (!user || !user.verified) {
    return res.status(401).send(INVALID);
  }

  const valid = await validatePassword(password, user.password);
  if (!valid) {
    return res.status(401).send(INVALID);
  }

  const session = await createSession({
    userId: user.id,
    ip: req.ip ?? "0.0.0.0",
    userAgent: req.headers["user-agent"] ?? "unknown",
  });

  const accessToken = signAccessToken(user, res);
  await signRefreshToken(res, { sessionId: session.id });

  const csrfToken = generateCsrfToken();
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.send({
    user: sanitizeUser(user),
    accessToken,
  });
}

/**
 * POST /api/sessions/refresh
 */
export async function refreshSessionController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const decoded = verifyJwt<{ session: string }>(refreshToken, "refresh");
  if (!decoded) return res.status(401).send("Unauthorized");

  const oldSession = await findSessionById({ id: decoded.session });
  if (!oldSession || !oldSession.valid) {
    return res.status(401).send("Unauthorized");
  }

  if (new Date() > oldSession.expiresAt) {
    await invalidateSession(oldSession.id);
    return res.status(401).send("Session expired");
  }

  const user = await findUserById(oldSession.userId);
  if (!user) return res.status(401).send("Unauthorized");

  const ip = req.ip ?? "0.0.0.0";
  const ua = req.headers["user-agent"] ?? "unknown";

  if (oldSession.ip !== ip || oldSession.userAgent !== ua) {
    await invalidateAllUserSessions(user.id);
    return res.status(401).send("Session hijack detected");
  }

  await invalidateSession(oldSession.id);

  const newSession = await createSession({
    userId: user.id,
    ip,
    userAgent: ua,
  });

  await signRefreshToken(res, { sessionId: newSession.id });
  const accessToken = signAccessToken(user, res);

  return res.send({ accessToken });
}

/**
 * DELETE /api/sessions/current
 * Logout
 */
export async function deleteSessionController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const decoded = verifyJwt<{ session: string }>(refreshToken, "refresh");
  if (!decoded) return res.status(401).send("Unauthorized");

  await invalidateSession(decoded.session);

  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .clearCookie("csrfToken")
    .send("Logged out");
}

/**
 * GET /api/sessions
 */
export async function getUserSessionsController(req: Request, res: Response) {
  const userId = res.locals.user.id;

  const sessions = await findUserSessions(userId);

  return res.send(sessions);
}
