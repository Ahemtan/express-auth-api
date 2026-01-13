import { Request, Response } from "express";
import { nanoid } from "nanoid";
import argon2 from "argon2";

import {
  CreateUserInput,
  ForgetPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";

import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyUser,
  setPasswordResetCode,
  resetUserPassword,
} from "../services/user.service";

import { findSessionById, invalidateSession } from "../services/auth.service";

import sendEmail from "../utils/mailer";
import log from "../utils/logger";
import { verifyJwt } from "../utils/jwt";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  try {
    const user = await createUser(req.body);

    await sendEmail({
      from: "test@ahem.com",
      to: user.email,
      subject: "Verify your email",
      text: `Verification code: ${user.verificationCode}\nUser ID: ${user.id}`,
    });

    return res.send("User successfully created.");
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).send("Account already exists");
    }

    log.error(err);
    return res.status(500).send("Could not create user");
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const { id, verificationCode } = req.params;

  const user = await findUserById(id);

  if (!user || user.verified) {
    return res.send("Could not verify user");
  }

  if (user.verificationCode !== verificationCode) {
    return res.send("Could not verify user");
  }

  await verifyUser(user.id);

  return res.send("User successfully verified");
}

export async function forgetPasswordHandler(
  req: Request<{}, {}, ForgetPasswordInput>,
  res: Response
) {
  const message =
    "If a user with that email exists, a reset link will be sent.";

  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user || !user.verified) {
    return res.send(message);
  }

  const resetCode = nanoid();

  await setPasswordResetCode(user.id, resetCode);

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Reset your password",
    text: `Reset code: ${resetCode}\nUser ID: ${user.id}`,
  });

  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;
  const { password } = req.body;

  const user = await findUserById(id);

  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send("Could not reset password");
  }

  const hashedPassword = await argon2.hash(password);

  await resetUserPassword(user.id, hashedPassword);

  return res.send("Password successfully updated");
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.send(res.locals.user);
}

export async function logoutHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken as string;

  if (!refreshToken) {
    return res.status(401).send("Unauthorized");
  }

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Unauthorized");
  }

  const session = await findSessionById({ id: decoded.session });

  if (!session || !session.valid) {
    return res.status(401).send("Unauthorized");
  }

  await invalidateSession(session.id);

  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .send("Logged out successfully");
}
