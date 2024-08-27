import { Request, Response } from "express";
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
} from "../services/user.service";
import sendEmail from "../utils/mailer";
import log from "../utils/logger";
import { nanoid } from "nanoid";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    const user = await createUser(body);

    await sendEmail({
      from: "test@ahem.com",
      to: user.email,
      subject: "Please Verify your email.",
      text: `verification code ${user.verificationCode}. Id: ${user._id}`,
    });

    return res.send("User successfully created.");
  } catch (error: any) {
    if (error.code == 11000) {
      return res.status(409).send("Account already exists");
    }

    return res.status(500).send(error);
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const id = req.params.id;
  const verificationCode = req.params.verificationCode;

  const user = await findUserById(id);

  if (!user) {
    return res.send("Could not verify user.");
  }

  if (user.verified) {
    return res.send("User is already verified");
  }

  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();

    return res.send("User successfully verified");
  }

  return res.send("Could not verify user");
}

export async function forgetPasswordHandler(
  req: Request<{}, {}, ForgetPasswordInput>,
  res: Response
) {
  const message =
    "If a user with provided email is registered you will recive a password reset email.";

  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    log.debug(`User with email ${email} does not exists`);
    return res.send(message);
  }

  if (!user.verified) {
    return res.send("User is not verified");
  }

  const passwordResetCode = nanoid();

  user.passwordResetCode = passwordResetCode;

  await user.save();

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Reset your password",
    text: `Password Reset code ${passwordResetCode}. Id ${user._id}`,
  });

  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {

  const {id, passwordResetCode} = req.params

  const  { password } = req.body

  const user = await findUserById(id);


  if(!user || !user.passwordResetCode || user.passwordResetCode !== passwordResetCode) 
  {
    return res.status(400).send(`could not reset user password`)
  }

  user.passwordResetCode = null

  user.password = password;

  await user.save();

  return res.send("Successfully updated password");
}

