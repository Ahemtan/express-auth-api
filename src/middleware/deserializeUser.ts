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

  const decoded = verifyJwt(accessToken, "access");

  if (decoded) {
    res.locals.user = decoded;
  }

  return next();
};

export default deserializeUser;
