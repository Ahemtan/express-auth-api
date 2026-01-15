import jwt, { SignOptions } from "jsonwebtoken";

// Define payload types
export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  session: string;
}

// Sign JWT with strong typing
export function signJwt<T extends object>(
  payload: T,
  type: "access" | "refresh",
  options?: SignOptions
): string {
  const secret =
    type === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;

  if (!secret) throw new Error(`Missing ${type.toUpperCase()} token secret`);

  return jwt.sign(payload, secret, options);
}

// Verify JWT with strong typing
export function verifyJwt<T extends object>(
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

// Helper functions to sign access / refresh tokens specifically
export function signAccessToken(
  payload: AccessTokenPayload,
  options?: SignOptions
) {
  return signJwt(payload, "access", options);
}

export function signRefreshToken(
  payload: RefreshTokenPayload,
  options?: SignOptions
) {
  return signJwt(payload, "refresh", options);
}
