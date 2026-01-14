import { Request, Response } from "express";
import argon from "argon2";

import { CreateSessionInput } from "../schema/auth.schema";
import { findUserByEmail, findUserById } from "../services/user.service";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
  invalidateSession,
  createSession,
  invalidateAllUserSessions,
} from "../services/auth.service";
import { verifyJwt } from "../utils/jwt";
import { generateCsrfToken } from "../utils/csrf";

function sanitizeUser(user: any) {
  const { password, verificationCode, passwordResetCode, ...safeUser } = user;

  return safeUser;
}

async function validatePassword(password: string, hashedPassword: string) {
  try {
    return await argon.verify(hashedPassword, password);
  } catch {
    return false;
  }
}

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const { email, password } = req.body;
  const INVALID_MSG = "Invalid email or password";

  const user = await findUserByEmail(email);

  if (!user || !user.verified) {
    return res.status(401).send(INVALID_MSG);
  }

  const validPassword = await validatePassword(password, user.password);

  if (!validPassword) {
    return res.status(401).send(INVALID_MSG);
  }

  const ip = req.ip ?? "0.0.0.0";
  const userAgent = req.headers["user-agent"] ?? "unknown";

  const session = await createSession({
    userId: user.id,
    ip,
    userAgent,
  });

  const accessToken = signAccessToken(user, res);

  const refreshToken = await signRefreshToken(res, {
    sessionId: session.id,
  });

  const csrfToken = generateCsrfToken();

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.send({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string;
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "REFRESH_PUBLIC_KEY"
  );
  if (!decoded) return res.status(401).send("Unauthorized");

  const oldSession = await findSessionById({ id: decoded.session });
  if (!oldSession || !oldSession.valid)
    return res.status(401).send("Unauthorized");

  const user = await findUserById(oldSession.userId);
  if (!user) return res.status(401).send("Unauthorized");

  const requestIp = req.ip ?? "0.0.0.0";
  const requestUA = req.headers["user-agent"] ?? "unknown";

  if (oldSession.ip !== requestIp || oldSession.userAgent !== requestUA) {
    await invalidateAllUserSessions(user.id);
    return res.status(401).send("Session invalid");
  }

  await invalidateSession(oldSession.id);
  const newSession = await createSession({
    userId: user.id,
    ip: requestIp,
    userAgent: requestUA,
  });

  await signRefreshToken(res, { sessionId: newSession.id });
  const accessToken = signAccessToken(user, res);

  return res.send({ accessToken });
}
