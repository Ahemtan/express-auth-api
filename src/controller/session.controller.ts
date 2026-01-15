import { Request, Response } from "express";
import { findUserByEmail, findUserById } from "../services/user.service";
import {
  createSession,
  findSessionById,
  invalidateSession,
  invalidateAllUserSessions,
} from "../services/auth.service";
import { generateCsrfToken } from "../utils/csrf";
import { signAccessToken, signRefreshToken, verifyJwt } from "../utils/jwt";
import argon2 from "argon2";
import { CreateSessionInput } from "../schema/auth.schema";

function sanitizeUser(user: any) {
  const { password, verificationCode, passwordResetCode, ...safeUser } = user;
  return safeUser;
}

async function validatePassword(password: string, hashedPassword: string) {
  try {
    return await argon2.verify(hashedPassword, password);
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
  if (!user || !user.verified) return res.status(401).send(INVALID_MSG);

  const validPassword = await validatePassword(password, user.password);
  if (!validPassword) return res.status(401).send(INVALID_MSG);

  const ip = req.ip ?? "0.0.0.0";
  const userAgent = req.headers["user-agent"] ?? "unknown";

  const session = await createSession({ userId: user.id, ip, userAgent });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ session: session.id });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
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
    csrfToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string;
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const decoded = verifyJwt<{ sessionId: string }>(refreshToken, "refresh");
  if (!decoded) return res.status(401).send("Unauthorized");

  const oldSession = await findSessionById({ id: decoded.sessionId });
  if (!oldSession || !oldSession.valid)
    return res.status(401).send("Unauthorized");

  if (new Date() > new Date(oldSession.expiresAt)) {
    await invalidateSession(oldSession.id);
    return res.status(401).send("Session expired");
  }

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

  const newAccessToken = signAccessToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ session: newSession.id });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  const csrfToken = generateCsrfToken();
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.send({ accessToken: newAccessToken, csrfToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string;
  if (!refreshToken) return res.status(401).send("Unauthorized");

  const decoded = verifyJwt<{ sessionId: string }>(refreshToken, "refresh");
  if (!decoded) return res.status(401).send("Unauthorized");

  const session = await findSessionById({ id: decoded.sessionId });
  if (!session || !session.valid) return res.status(401).send("Unauthorized");

  await invalidateSession(session.id);

  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .clearCookie("csrfToken")
    .status(200)
    .send("Logged out successfully");
}
