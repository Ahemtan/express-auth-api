import { object, string, TypeOf } from "zod";

// Login / Create Session
export const createSessionSchema = object({
  email: string({ required_error: "Email is required" }).email(
    "Not a valid email"
  ),
  password: string({ required_error: "Password is required" }).min(
    6,
    "Password must be at least 6 characters"
  ),
});

export type CreateSessionInput = TypeOf<typeof createSessionSchema>;
