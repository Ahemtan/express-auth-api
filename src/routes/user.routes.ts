import express from "express";
import validateResource from "../middleware/validateResources";
import {
  createUserSchema,
  forgetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";
import {
  createUserHandler,
  forgetPasswordHandler,
  verifyUserHandler,
} from "../controller/user.controller";

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

export default router;
