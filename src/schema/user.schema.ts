import { object, string, TypeOf, ZodIssueCode } from "zod";

// Signup / Create User
export const createUserSchema = object({
  name: string({ required_error: "Name is required" }),
  email: string({ required_error: "Email is required" }).email(
    "Not a valid email"
  ),
  password: string({ required_error: "Password is required" }).min(
    6,
    "Password must be at least 6 characters"
  ),
  passwordConfirmation: string({
    required_error: "Password confirmation is required",
  }),
}).superRefine((data, ctx) => {
  if (data.password !== data.passwordConfirmation) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    });
  }
});

// Verify User Params
export const verifyUserSchema = object({
  id: string({ required_error: "ID is required" }),
  verificationCode: string({ required_error: "Verification code is required" }),
});

// Forget Password
export const forgetPasswordSchema = object({
  email: string({ required_error: "Email is required" }).email(
    "Not a valid email"
  ),
});

// Reset Password
export const resetPasswordSchema = object({
  password: string({ required_error: "Password is required" }).min(
    6,
    "Password must be at least 6 characters"
  ),
  passwordConfirmation: string({
    required_error: "Password confirmation is required",
  }),
}).superRefine((data, ctx) => {
  if (data.password !== data.passwordConfirmation) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    });
  }
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type VerifyUserInput = TypeOf<typeof verifyUserSchema>;
export type ForgetPasswordInput = TypeOf<typeof forgetPasswordSchema>;
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
