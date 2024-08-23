import { Request, Response } from "express";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../services/user.service";
import sendEmail from "../utils/mailer";

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
