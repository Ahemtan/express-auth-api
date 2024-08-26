import UserModel, { User } from "../model/user.model";

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

export async function findUserByEmail(email: string) {
 return UserModel.findOne({ email });
}
