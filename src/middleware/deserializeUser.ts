import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { updateSessionLastActive } from "../services/auth.service";

interface AccessTokenPayload {
  id: string;
}

export default async function deserializeUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies.accessToken as string;
  if (!accessToken) return next();

  const decoded = verifyJwt<AccessTokenPayload>(accessToken, "access");
  if (!decoded) return next();

  const payload = decoded as AccessTokenPayload;

  await updateSessionLastActive(payload.id);

  res.locals.user = { id: payload.id };
  return next();
}
