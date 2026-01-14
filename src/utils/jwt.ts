import jwt from "jsonwebtoken";

export function signJwt(
  payload: object,
  type: "access" | "refresh",
  options?: jwt.SignOptions
) {
  const secret =
    type === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;

  if (!secret) throw new Error(`Missing ${type.toUpperCase()} token secret`);

  return jwt.sign(payload, secret, options);
}

export function verifyJwt<T>(
  token: string,
  type: "access" | "refresh"
): T | null {
  try {
    const secret =
      type === "access"
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET;

    if (!secret) throw new Error(`Missing ${type.toUpperCase()} token secret`);

    return jwt.verify(token, secret) as T;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
