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
  resetPasswordHandler,
  verifyUserHandler,
} from "../controller/user.controller";
import requireUser from "../middleware/requireLogin";
import deserializeUser from "../middleware/deserializeUser";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 */
router.post(
  "/api/users",
  validateResource({ body: createUserSchema }),
  createUserHandler
);

/**
 * @swagger
 * /api/users/verify/{id}/{verificationCode}:
 *   post:
 *     summary: Verify user account
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: verificationCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyUserInput'
 *     responses:
 *       200:
 *         description: User verified successfully
 */
router.post(
  "/api/users/verify/:id/:verificationCode",
  validateResource({ body: verifyUserSchema }),
  verifyUserHandler
);

/**
 * @swagger
 * /api/users/forgetpassword:
 *   post:
 *     summary: Send password reset email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post(
  "/api/users/forgetpassword",
  validateResource({ body: forgetPasswordSchema }),
  forgetPasswordHandler
);

/**
 * @swagger
 * /api/users/resetpassword/{id}/{passwordResetCode}:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: passwordResetCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post(
  "/api/users/resetpassword/:id/:passwordResetCode",
  validateResource({ body: resetPasswordSchema }),
  resetPasswordHandler
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Users]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Returns current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/api/users/me",
  deserializeUser,
  requireUser,
  getCurrentUserHandler
);

export default router;
