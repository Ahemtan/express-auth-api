import express from "express";
import validateResource from "../middleware/validateResources";
import {
  createUserSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";
import {
  createUserHandler,
  forgetPasswordHandler,
  getCurrentUserHandler,
  logoutHandler,
  resetPasswordHandler,
  verifyUserHandler,
} from "../controller/user.controller";
import requireUser from "../middleware/requireLogin";

const router = express.Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

router.post(
  "/api/users/verify/:id/:verificationCode",
  validateResource(verifyUserSchema),
  verifyUserHandler
);

router.post(
  "/api/users/forgetpassword",
  validateResource(forgetPasswordSchema),
  forgetPasswordHandler
);

router.post(
  "/api/users/resetpassword/:id/:passwordResetCode",
  validateResource(resetPasswordSchema),
  resetPasswordHandler
);

router.get(
  "/api/users/logout",
  logoutHandler
)
router.get("/api/users/me", requireUser, getCurrentUserHandler)

export default router;
