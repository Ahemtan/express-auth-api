import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const csrfWhitelist = [
  "/api/sessions", // login
  "/api/users", // signup
  "/api/users/verify/:id/:verificationCode",
  "/api/users/forgetpassword",
  "/api/users/resetpassword/:id/:passwordResetCode",
  "/api/users/logout",
];

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip CSRF for GET/HEAD/OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (!req.cookies["csrfToken"]) {
      const token = crypto.randomBytes(32).toString("hex");
      res.cookie("csrfToken", token, {
        httpOnly: false, // allow frontend JS to read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    return next();
  }

  // Skip whitelisted routes
  const isWhitelisted = csrfWhitelist.some((path) => {
    // Support simple route params like :id
    const regex = new RegExp("^" + path.replace(/:[^\s/]+/g, "[^/]+") + "$");
    return regex.test(req.path);
  });
  if (isWhitelisted) return next();

  // Check CSRF token
  const csrfCookie = req.cookies["csrfToken"];
  const csrfHeader = req.headers["x-csrf-token"];
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.log("CSRF validation failed", { csrfCookie, csrfHeader });
    return res.status(403).send("Invalid CSRF token");
  }

  next();
}
