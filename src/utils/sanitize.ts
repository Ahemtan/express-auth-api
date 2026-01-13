export function sanitizeUser(user: any) {
  const { password, verificationCode, passwordResetCode, ...safeUser } = user;

  return safeUser;
}
