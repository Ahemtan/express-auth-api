import { Request, Response } from "express";
import { CreateSessionInput } from "../schema/auth.schema";
import { findUserByEmail, findUserById } from "../services/user.service";
import { findSessionById, signAcessToken, signRefreshToken } from "../services/auth.service";
import argon from "argon2";
import { verifyJwt } from "../utils/jwt";

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid email or password!";

  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).send(message);
  }

  if (!user?.verified) {
    return res.status(403).send("Please verify your account");
  }

  const isValid = await validatePassword(password, user.password);

  if (!isValid) {
    return res.status(401).send(message);
  }

  const acessToken = signAcessToken(user, res);

  const refreshToken = await signRefreshToken(res, { userId: String(user.id) });

  return res.send({
    user,
    acessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  
  const refreshToken = req.cookies.refreshToken as string;

  if (!refreshToken) {
    return res.status(401).send("Refresh token is required");
  }

  const decoded = verifyJwt<{session: string}>(refreshToken, 'refreshTokenPublicKey')

  if(!decoded) {
    return res.status(401).send("could not access refresh token")
  }

  const session = await findSessionById({ id: decoded.session})

  if(!session || !session.valid) {
    return res.status(401).send("could not access refresh token")
  }

  const user = await findUserById(String(session.userId))

  if(!user) {
    return res.status(401).send("could not access refresh token")
  }

  const accessToken = signAcessToken(user, res);

  return res.send({ accessToken })
}

async function validatePassword(password: string, hashedPassword: string) {
  try {
    return await argon.verify(hashedPassword, password);
  } catch (e) {
    console.log(e, "Could not validate password");
    return false;
  }
}
