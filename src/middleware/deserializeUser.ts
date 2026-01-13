import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }

  const decoded = verifyJwt(accessToken, "ACCESS_TOKEN_PUBLIC_KEY");

  if (decoded) {
    res.locals.user = decoded;
  }

  return next();
};

export default deserializeUser;
