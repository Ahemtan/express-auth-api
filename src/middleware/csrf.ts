import { Request, Response, NextFunction } from "express";

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies["csrfToken"];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).send("Invalid CSRF token");
  }

  next();
}
