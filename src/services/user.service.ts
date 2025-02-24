import argon2 from "argon2";
import prismadb from "../lib/prisma";
import { User } from "@prisma/client";

export async function createUser(input: Partial<User>) {

  if (!input.email || !input.firstName || !input.lastName || !input.password) {
    throw new Error("Missing required fields");
  }

  const hashedPassword = await argon2.hash(input.password);

  const userData = {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    password: hashedPassword
  };

  const user = await prismadb.user.create({
    data: userData
  });

  return user;
}

export async function findUserById(id: string) {
  return prismadb.user.findUnique({
    where: { id }
  });
}

export async function findUserByEmail(email: string) {
  return prismadb.user.findUnique({ where:  { email } });
}
