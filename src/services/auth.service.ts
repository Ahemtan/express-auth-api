import { signJwt } from "../utils/jwt";

import { User } from "@prisma/client";
import prismadb from "../lib/prisma";
import { omit } from "lodash";
import { Response } from "express";

const privateVal = ["password", "verificationCode", "passwordResetCode"];

export async function createSession({ userId }: { userId: string }) {
  return prismadb.session.create({
    data: {
      user: {
        connect: { id: userId },
      },
    },
  });
}

export async function findSessionById({ id }: { id: string }) {
  return prismadb.session.findUnique({
    where: {
      id: id,
    },
  });
}

export async function signRefreshToken(res: Response, { userId }: { userId: string }) {

  const session = await createSession({ userId: userId })

  const refreshToken = signJwt(
    {
      session: session.id
    },
    "refreshTokenPrivateKey",
    {
      expiresIn: "30d",
    }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60
  })

  return refreshToken;
}

export function signAcessToken(user: User, res: Response) {
  const payload = omit(user, privateVal);

  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60000
  })

  return accessToken;
}

export async function logout(sessionId: string) {
  return await prismadb.session.delete({ where: { id: sessionId }})
}