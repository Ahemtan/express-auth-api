import jwt from "jsonwebtoken";
import config from "config";

export function signJwt(
  object: Object,
  keyName: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_PRIVATE_KEY",
  options?: jwt.SignOptions
) {
  const secret = config.get<string>(keyName);

  return jwt.sign(object, secret, {
    ...(options && options),
    algorithm: "HS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_PUBLIC_KEY"
): T | null {
  const secret = config.get<string>(keyName);

  try {
    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}
