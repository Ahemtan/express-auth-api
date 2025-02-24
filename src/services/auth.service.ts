import { signJwt } from "../utils/jwt";

import { User } from "@prisma/client";
import prismadb from "../lib/prisma";
import { omit } from "lodash";

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

export async function signRefreshToken({ userId }: { userId: string }) {
  const session = await createSession({
    userId,
  });

  const refreshToken = signJwt(
    {
      session: session.id,
    },
    "refreshTokenPrivateKey",
    {
      expiresIn: "30d",
    }
  );

  return refreshToken;
}

export function signAcessToken(user: User) {
  const payload = omit(user, privateVal);

  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
    expiresIn: "15m",
  });

  return accessToken;
}
