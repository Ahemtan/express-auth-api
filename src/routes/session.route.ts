import express from "express";
import validateResource from "../middleware/validateResources";
import { createSessionSchema } from "../schema/auth.schema";
import {
  createSessionHandler,
  refreshAccessTokenHandler,
  logoutHandler,
} from "../controller/session.controller";
import deserializeUser from "../middleware/deserializeUser";
import requireUser from "../middleware/requireLogin";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: User session management
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session (login)
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionInput'
 *     responses:
 *       200:
 *         description: Session created successfully, access token & CSRF token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 accessToken:
 *                   type: string
 *                 csrfToken:
 *                   type: string
 */
router.post(
  "/api/sessions",
  validateResource({ body: createSessionSchema }),
  createSessionHandler
);

/**
 * @swagger
 * /api/sessions/refresh:
 *   get:
 *     summary: Refresh access token (rotate refresh token)
 *     tags: [Sessions]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: New access token & CSRF token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 csrfToken:
 *                   type: string
 *       401:
 *         description: Unauthorized or session expired
 */
router.get("/api/sessions/refresh", refreshAccessTokenHandler);

/**
 * @swagger
 * /api/sessions/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Sessions]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Session logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/api/sessions/logout",
  deserializeUser,
  requireUser,
  logoutHandler
);

export default router;
